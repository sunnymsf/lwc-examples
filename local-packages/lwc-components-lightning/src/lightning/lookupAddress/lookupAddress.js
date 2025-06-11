/* eslint-disable @lwc/lwc/no-api-reassignments */

import lang from '@salesforce/i18n/lang';
import labelRequired from '@salesforce/label/LightningControl.required';
import labelHelpTextAlternativeText from '@salesforce/label/LightningInput.helptextAlternativeText';
import { api, track } from 'lwc';
import LightningShadowBaseClass from 'lightning/shadowBaseClassPrivate';
import { toHighlightParts } from './highlight';
import { classSet, formatLabel } from 'lightning/utils';
import {
    FieldConstraintApi,
    InteractingState,
    isEmptyString,
    normalizeVariant,
    VARIANT,
    debounce,
} from 'lightning/inputUtils';
import {
    registerMessageHandler,
    unregisterMessageHandler,
    createMessage,
    postMessage,
} from 'lightning/messageDispatcher';
import { normalizeBoolean, synchronizeAttrs } from 'lightning/utilsPrivate';
import { buildMapSourceUrl } from 'lightning/mapUtils';
import { isCSR } from 'lightning/utilsPrivate';
import AriaObserver from 'lightning/ariaObserver';
import { INTERNAL_GOOGLE_LOGO, POWERED_BY_GOOGLE } from './googleLogo';
import { getLocation } from './location';

const DEFAULT_TYPES = ['geocode'];
const DEBOUNCE_PERIOD = 250;

const EVENT_NAME = {
    INITIALIZE_PLACE_API: 'initialize',
    QUERY_PLACE_AUTOCOMPLETE: 'queryAddress',
    QUERY_PLACE_DETAIL: 'selectAddress',
    PLACE_AUTOCOMPLETE: 'force:showAddressSuggestions',
    PLACE_DETAIL: 'force:saveAddressLookup',
    PLACE_API_READY: 'place-api-ready',
};

const i18n = {
    required: labelRequired,
    helpTextAlternativeText: labelHelpTextAlternativeText,
};

export default class LightningLookupAddress extends LightningShadowBaseClass {
    @api label;
    @api inputText = '';
    @api placeholder;
    @api name;
    @api autocomplete;

    @track _inputIconName = 'utility:search';
    @track _items;
    @track _showActivityIndicator;
    @track _variant;
    @track _disabled;
    @track _isLoaded = false;
    @track _helpMessage;
    _ariaDescribedBy = '';
    _required = false;
    _fieldLevelHelp;
    _googleLogoUrl;
    _googleLogoText = POWERED_BY_GOOGLE;
    _labelForId;
    interactingState;

    placeIconName = 'utility:checkin';

    apiDomain = `*`;
    apiSrc = buildMapSourceUrl({
        resource: 'placeApi',
        locale: lang,
    });

    constructor() {
        super();
        this.createAriaObserver();
    }

    connectedCallback() {
        super.connectedCallback();
        this._items = [];
        this._dispatchId = isCSR
            ? registerMessageHandler((event) => {
                  this.handleMessage(event);
              })
            : null;
        this._debouncedTextInput = debounce((text) => {
            this._requestSuggestions(text);
        }, DEBOUNCE_PERIOD);
        this.createAriaObserver();
        this.interactingState = new InteractingState();
        this.interactingState.onleave(() => this.showHelpMessageIfInvalid());
    }

    disconnectedCallback() {
        if (this._dispatchId) {
            unregisterMessageHandler(this._dispatchId);
        }

        if (this.ariaObserver) {
            this.ariaObserver.disconnect();
            this.ariaObserver = undefined;
        }
    }

    get isLoaded() {
        return this.alwaysRender || this._isLoaded;
    }

    @api
    get alwaysRender() {
        return this._alwaysRender || false;
    }

    set alwaysRender(value) {
        this._alwaysRender = normalizeBoolean(value);
    }

    @api
    get variant() {
        return this._variant || VARIANT.STANDARD;
    }

    set variant(value) {
        this._variant = normalizeVariant(value);
    }

    /**
     * If present, the field must be filled out before the form is submitted.
     * @type {boolean}
     * @default false
     */
    @api
    get required() {
        return this._required;
    }

    set required(value) {
        this._required = normalizeBoolean(value);
    }

    /**
     * If present, the field is disabled and users cannot interact with it.
     * @type {boolean}
     * @default false
     */
    @api
    get disabled() {
        return this._disabled;
    }

    set disabled(value) {
        this._disabled = normalizeBoolean(value);

        if (this._disabled && this._dropdownVisible) {
            this.closeDropdown();
        }
    }

    get i18n() {
        return i18n;
    }

    get isLabelHidden() {
        return this.variant === VARIANT.LABEL_HIDDEN;
    }

    get computedLabelClass() {
        return classSet('slds-form-element__label')
            .add({ 'slds-assistive-text': this.isLabelHidden })
            .toString();
    }

    renderedCallback() {
        const label = this.template.querySelector('label');
        if (label) {
            synchronizeAttrs(label, {
                for: this._labelForId,
            });
            label.setAttribute('for', this._labelForId);
        }

        if (this.isConnected) {
            this.connectAriaDescribedBy();
            this.ariaObserver.sync();
        }
    }

    handleComboboxReady(e) {
        this._labelForId = e.detail.id;
    }

    handleMessage(data) {
        this._showActivityIndicator = false;
        if (!this._googleLogoUrl) {
            this._googleLogoUrl = INTERNAL_GOOGLE_LOGO;
        }
        if (data.event === EVENT_NAME.PLACE_AUTOCOMPLETE) {
            this._processAutoComplete(data.arguments.addresses);
        } else if (data.event === EVENT_NAME.PLACE_DETAIL) {
            this.dispatchChangeEvent(data.arguments);
        } else if (data.event === EVENT_NAME.PLACE_API_READY) {
            this._isLoaded = true;
        }
    }

    _requestSuggestions(matchString) {
        if (matchString) {
            this._showActivityIndicator = true;
            this.sendMessage(EVENT_NAME.QUERY_PLACE_AUTOCOMPLETE, {
                matchString,
            });
        } else {
            this._items = [];
        }
    }

    handleTextInput(evt) {
        const {
            detail: { text },
        } = evt;
        this.inputText = text;
        this._debouncedTextInput(text);
        // Expose the change to the parent component
        this.dispatchEvent(
            new CustomEvent('privateuserinput', { detail: { value: text } })
        );
    }

    handleIframeLoad(event) {
        this._handler = event.detail.callbacks.postToWindow;

        getLocation().then((location) => {
            this.sendMessage(EVENT_NAME.INITIALIZE_PLACE_API, {
                types: DEFAULT_TYPES,
                location,
            });
        });
    }

    sendMessage(event, params) {
        if (this._handler) {
            const message = createMessage(
                this._dispatchId,
                event,
                params || {}
            );
            postMessage(this._handler, message, '*');
        }
    }

    handleSelect(evt) {
        const { value } = evt.detail;
        if (value) {
            this._showActivityIndicator = true;
            this.sendMessage(EVENT_NAME.QUERY_PLACE_DETAIL, {
                addressCmpId: this._dispatchId,
                placeId: value,
            });
        }
    }

    _processAutoComplete(suggestions) {
        this._showActivityIndicator = false;
        this._items = [];

        if (suggestions) {
            this._items = suggestions.map((suggestion) => {
                const mainText = suggestion.structured_formatting.main_text;
                const secondaryText =
                    suggestion.structured_formatting.secondary_text;
                const matchedSubstrings =
                    suggestion.structured_formatting
                        .main_text_matched_substrings;
                const parts = toHighlightParts(mainText, matchedSubstrings);

                return {
                    type: 'option-card',
                    text: parts,
                    iconName: this.placeIconName,
                    subText: secondaryText,
                    value: suggestion.place_id,
                };
            });
        }
    }

    dispatchChangeEvent(address) {
        if (isCSR) {
            this.dispatchEvent(
                new CustomEvent('change', {
                    detail: {
                        address,
                    },
                })
            );
        }
    }

    get _constraint() {
        if (!this._constraintApi) {
            this._constraintApi = new FieldConstraintApi(() => this, {
                valueMissing: () =>
                    !this.disabled &&
                    this.required &&
                    isEmptyString(this.inputText),
            });
        }
        return this._constraintApi;
    }

    /**
     * Represents the validity states of the element, with respect to constraint validation.
     * @type {object}
     */
    @api
    get validity() {
        return this._constraint.validity;
    }

    /**
     * Checks if the input is valid.
     * @returns {boolean} Indicates whether the element meets all constraint validations.
     */
    @api
    checkValidity() {
        return this._constraint.checkValidity();
    }

    /**
     * Sets a custom error message to be displayed when a form is submitted.
     * @param {string} message - The string that describes the error. If message is an empty string, the error message is reset.
     */
    @api
    setCustomValidity(message) {
        this._constraint.setCustomValidity(message);
    }

    /**
     * Displays the error messages and returns false if the input is invalid.
     * If the input is valid, reportValidity() clears displayed error messages and returns true.
     * @returns {boolean} - The validity status of the input fields.
     */
    @api
    reportValidity() {
        // required to make sure the sync happens after the render
        if (isCSR) {
            return this._constraint.reportValidity((message) => {
                this._helpMessage = message;
            });
        }
        return null;
    }

    /**
     * Displays error messages on invalid fields.
     * An invalid field fails at least one constraint validation and returns false when checkValidity() is called.
     */
    @api
    showHelpMessageIfInvalid() {
        this.reportValidity();
    }

    /**
     * Help text detailing the purpose and function of the field.
     * @type {string}
     */
    @api
    get fieldLevelHelp() {
        return this._fieldLevelHelp;
    }

    set fieldLevelHelp(value) {
        this._fieldLevelHelp = value;
    }

    get helptextAlternativeText() {
        return formatLabel(i18n.helpTextAlternativeText, this.label);
    }

    @api
    get ariaDescribedBy() {
        return this._ariaDescribedBy;
    }
    set ariaDescribedBy(describedBy) {
        this._ariaDescribedBy = describedBy;
        this.connectAriaDescribedBy();
    }

    /** The actual HTML input element that users type into. */
    get innerInput() {
        return isCSR
            ? this.template
                  ?.querySelector('lightning-base-combobox')
                  ?.shadowRoot?.querySelector('input')
            : null;
    }

    createAriaObserver() {
        if (!this.ariaObserver && isCSR) {
            this.ariaObserver = new AriaObserver(this);
            this.ariaObserver.root = this.template.getRootNode();
            this.connectAriaDescribedBy();
        }
    }

    connectAriaDescribedBy() {
        const helpMessage = isCSR
            ? this.template.querySelector('[data-help-message]')
            : null;
        this.ariaObserver.connect({
            targetNode: this.innerInput,
            attribute: 'aria-describedby',
            relatedNodeIds: this.ariaDescribedBy,
            relatedNodes: helpMessage,
        });
    }

    handleFocus() {
        this.interactingState.enter();
        this.dispatchEvent(new CustomEvent('focus'));
    }

    handleBlur() {
        this.interactingState.leave();
        this.dispatchEvent(new CustomEvent('blur'));
    }
}
