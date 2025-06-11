import * as CONSTANTS from './constants';
import { api, LightningElement, track, createElement } from 'lwc';
import labelRequired from '@salesforce/label/LightningControl.required';
import LightningLookupMobileSelectionPanel from 'lightning/lookupMobileSelectionPanel';
import { showCustomOverlay } from 'lightning/deprecatedOverlayUtils';
import { computePanelHeader, computePlaceholder } from './utils';
import {
    log,
    LOGGING_CONSTANTS,
    LookupEventDispatcher,
    COMMON_LOOKUP_CONSTANTS,
    GET_LOOKUP_RECORDS_WIRE_CONSTANTS,
    MetadataManager,
} from 'lightning/lookupUtils';
import { getAura } from 'lightning/auraUtils';
import {
    normalizeAriaAttribute,
    getRealDOMId,
    synchronizeAttrs,
} from 'lightning/utilsPrivate';

const i18n = {
    required: labelRequired,
};

const getRenderedSelector = (isConnected, hasValue) => {
    if (!isConnected) {
        return null;
    }
    return hasValue
        ? CONSTANTS.LIGHTNING_PILL_CONTAINER
        : CONSTANTS.LIGHTNING_LOOKUP_MOBILE_FAUX_INPUT;
};

export default class LightningLookupMobile extends LightningElement {
    // ================================================================================
    // PUBLIC PROPERTIES
    // ================================================================================
    /**
     * Indicates whether the field is disabled.
     * @type {Boolean}
     */
    @api disabled = false;

    /**
     * Error message to be displayed under the lookup input.
     * @type {String}
     */
    @api errorMessage;

    /**
     * The field level help text.
     * @type {String}
     */
    @api fieldLevelHelp;

    /**
     * Sets focus on the input element.
     */
    @api
    focus() {
        if (!this._connected) {
            return;
        }
        this.template
            .querySelector(getRenderedSelector(this._connected, this.hasValue))
            .focus();
    }

    /**
     * The text label for the layout field.
     * @type {String}
     */
    @api label;

    /**
     * API name of the current lookup field
     */
    @api get fieldApiName() {
        return this._fieldApiName;
    }

    set fieldApiName(fieldApiName) {
        if (fieldApiName === this._fieldApiName) {
            return;
        }
        this._fieldApiName = fieldApiName;
        this.updateMetadata();
    }

    /**
     * The list of items to be displayed
     * @type {Array}
     */
    @api
    get items() {
        return this._items;
    }

    set items(value) {
        this._items = value;
        if (this._lookupSelectionPanel) {
            this._lookupSelectionPanel.items = value;
            this._lookupSelectionPanel.showActivityIndicator = false;
        }
    }

    /**
     * The source record's objectInfos
     * @type {Object}
     */
    @api get objectInfos() {
        return this._objectInfos;
    }

    set objectInfos(objectInfos) {
        if (this._objectInfos === objectInfos) {
            return;
        }
        this._objectInfos = objectInfos;
        this.updateMetadata();
    }

    /**
     * The array of selected values pill representation.
     * @type {Array}
     */
    @api pills = [];

    /**
     * Indicates whether or not the field is required.
     */
    @api required;

    /**
     * The source record representation.
     * @type {Object}
     */
    @api get record() {
        return this._record;
    }

    set record(record) {
        if (this._record === record) {
            return;
        }
        this._record = record;
        this.updateMetadata();
    }

    _searchInProgress = false;
    @api
    get searchInProgress() {
        return this._searchInProgress;
    }

    set searchInProgress(inProgress) {
        this._searchInProgress = inProgress;
        if (this._lookupSelectionPanel) {
            this._lookupSelectionPanel.showActivityIndicator = inProgress;
        }
    }

    /**
     * API name of the selected entity in lookup field
     */
    @api get selectedTargetApiName() {
        return this._selectedTargetApiName;
    }

    set selectedTargetApiName(targetApiName) {
        if (this._selectedTargetApiName === targetApiName) {
            return;
        }
        this._selectedTargetApiName = targetApiName;
        this.updateMetadata();
        if (this._lookupSelectionPanel) {
            this._lookupSelectionPanel.entityOptions = this.entityOptions;
        }
    }

    /**
     * Text and label details needed to compute labels, placeholder etc.
     */
    @api
    get textInfo() {
        return this._textInfo;
    }

    set textInfo(textInfo) {
        if (this._textInfo === textInfo) {
            return;
        }
        this._textInfo = textInfo;
        if (this._lookupSelectionPanel) {
            this._lookupSelectionPanel.placeholder = this.placeholder;
            this._lookupSelectionPanel.selectedEntityLabel =
                this.selectedEntityLabel;
        }
    }

    /**
     * Sets the variant type for the lookup.
     * @type {String}
     */
    @api variant;

    // ================================================================================
    // REACTIVE PROPERTIES
    // ================================================================================
    /**
     * The value for the input element.
     * @type {String}
     */
    @track inputValue;

    /**
     * The required label.
     * @type {String}
     */
    @track requiredLabel = i18n.required;

    // ================================================================================
    // PRIVATE PROPERTIES
    // ================================================================================
    /**
     * Indiciates whether or not the component is connected.
     * @type {Boolean}
     */
    _connected = false;

    _errorMessage;

    _fieldLevelHelp;

    /**
     * The items to passed to the selection panel.
     */
    _items;

    /**
     * Instance of the lookupMobileSelectionPanel
     */
    _lookupSelectionPanel;

    // instance of MetadataManager
    _metadataManager;

    /**
     * Used to call focus on rendered element in the next renderedCallback
     */
    _queueFocus = false;

    /**
     * Text and label details needed to compute labels, placeholder etc.
     */
    _textInfo;

    /**
     * An array of values of the selected lookup.
     * @type {Array}
     */
    _value;

    _labelLabelledByInformation;

    _labelDescribedByInformation;

    _selectedTargetApiName;

    // ================================================================================
    // ACCESSOR METHODS
    // ================================================================================
    /**
     * array of item to render the entity filter lookup
     */
    get entityOptions() {
        if (this._metadataManager.isSingleEntity) {
            // regular lookup
            return [
                {
                    ...this._metadataManager.getTargetObjectIconDetails(),
                    targetApiName: this._metadataManager.getTargetApiName(),
                },
            ];
        }
        // polymorphic lookup
        return this._metadataManager.getEntityOptions();
    }

    /**
     * @return {boolean} Indicates if the lookup has a pill selected.
     */
    get hasValue() {
        return this.pills && this.pills.length > 0;
    }

    get labelledBy() {
        return this._labelLabelledByInformation;
    }

    get describedBy() {
        const ids = [];
        if (this.errorMessage) {
            ids.push(
                getRealDOMId(this.template.querySelector('[data-lookup-error]'))
            );
        }
        ids.push(this._labelDescribedByInformation);
        return normalizeAriaAttribute(ids);
    }

    get placeholder() {
        return computePlaceholder(this._textInfo.targetEntityLabelPlural);
    }

    /**
     * display label for the entity filter lookup
     */
    get selectedEntityLabel() {
        return this.textInfo.targetLabel;
    }

    // ================================================================================
    // LIFECYCLE METHODS
    // ================================================================================
    constructor() {
        super();
        this._events = new LookupEventDispatcher(this);
        this._metadataManager = new MetadataManager();
    }

    connectedCallback() {
        this._connected = true;
    }

    disconnectedCallback() {
        this._connected = false;
    }

    renderedCallback() {
        this._synchronizeA11y();
        if (this._queueFocus) {
            this.focus();
            this._queueFocus = false;
        }
    }

    // ================================================================================
    // PRIVATE METHODS
    // ================================================================================
    dispatchLookupRecordsRequest(requestParams, shouldLoadMore) {
        this._events.dispatchLookupRecordsRequestEvent(
            requestParams,
            shouldLoadMore
        );
    }

    handlePillRemove(event) {
        // [Temporary] - W-7351876 - Prevent pill remove when disabled.
        // TODO: Use a proper disabled state for pill container when available.
        if (this.disabled) {
            return;
        }

        if (event && event.detail) {
            const removedValue = (event.detail.item || {}).value;
            log(
                LOGGING_CONSTANTS.LOG_EVENT_PILL_REMOVE,
                LOGGING_CONSTANTS.LOG_SCOPE_INPUT_LOOKUP_MOBILE,
                LOGGING_CONSTANTS.LOG_TARGET_RECORD_PILL_ITEM
            );
            if (!removedValue) {
                return;
            }
            this._events.dispatchPillRemoveEvent(removedValue);
            this._queueFocus = true;
        }
    }

    handleItemSelect(recordId) {
        if (!recordId) {
            return;
        }

        this._events.dispatchRecordItemSelectEvent(recordId);
        // Close the panel
        if (this._lookupSelectionPanel) {
            getAura((aura) => {
                aura.dispatchGlobalEvent('markup://force:hidePanel');
            });
        }
    }

    handleBlur() {
        this.dispatchEvent(new CustomEvent('blur'));
    }

    showPanel() {
        log(
            LOGGING_CONSTANTS.LOG_EVENT_CLICK,
            LOGGING_CONSTANTS.LOG_SCOPE_INPUT_LOOKUP_MOBILE,
            LOGGING_CONSTANTS.LOG_TARGET_INPUT
        );
        // eslint-disable-next-line no-unused-vars
        let currentOverlay;

        this.createPanel();

        // @W-8148219: header property in panel expects HTMLElement directly
        const panelHeader = document.createElement('h1');
        panelHeader.classList.add('title', 'slds-truncate');
        panelHeader.appendChild(
            document.createTextNode(
                computePanelHeader(this._textInfo.sourceEntityLabel)
            )
        );
        showCustomOverlay({
            header: panelHeader,
            body: this._lookupSelectionPanel,
            isScrollable: false,
            panelType: 'mobileOverlay',
            showCloseButton: true,
        }).then((overlay) => {
            currentOverlay = overlay;
        });
    }

    createPanel() {
        this._lookupSelectionPanel = createElement(
            'lightning-lookup-mobile-selection-panel',
            { is: LightningLookupMobileSelectionPanel }
        );

        Object.assign(this._lookupSelectionPanel, {
            entityOptions: this.entityOptions,
            label: computePanelHeader(this._textInfo.sourceEntityLabel),
            placeholder: this.placeholder,
            selectedEntityLabel: this.selectedEntityLabel,
            showActivityIndicator: this.searchInProgress,
            items: this.items ?? [],
        });

        // listen to the inputchange event fired by lookupMobileSelectionPanel
        this._lookupSelectionPanel.addEventListener('textinput', (event) => {
            const value = event.detail && event.detail.value;
            this.dispatchLookupRecordsRequest({
                q: value,
            });
        });

        // listen to the select event fired by lookupMobileSelectionPanel
        this._lookupSelectionPanel.addEventListener('select', (event) => {
            const value = event.detail && event.detail.value;
            if (value === COMMON_LOOKUP_CONSTANTS.ACTION_ADVANCED_SEARCH) {
                this.dispatchLookupRecordsRequest({
                    searchType:
                        GET_LOOKUP_RECORDS_WIRE_CONSTANTS.SEARCH_TYPE_FULL,
                });
            } else {
                this.handleItemSelect(value);
            }
        });

        this._lookupSelectionPanel.addEventListener('loadmore', () => {
            const shouldLoadMore = true;
            this.dispatchLookupRecordsRequest({}, shouldLoadMore);
        });

        this._lookupSelectionPanel.addEventListener('selectfilter', (event) => {
            if (!event.detail) {
                console.error('missing "detail" in event');
                return;
            }
            const selectedEntity = event.detail.value;
            if (selectedEntity === this._selectedTargetApiName) {
                return;
            }
            this._events.dispatchEntityOptionSelect(selectedEntity);
        });
    }

    handleHelptextClick(event) {
        event.stopPropagation();
    }

    handleLabelLabelledBy(event) {
        this._labelLabelledByInformation = event.detail.value;
    }

    handleLabelDescribedBy(event) {
        this._labelDescribedByInformation = event.detail.value;
    }

    _synchronizeA11y() {
        const element = this.template.querySelector(
            this.hasValue
                ? 'lightning-pill-container'
                : 'lightning-lookup-mobile-faux-input'
        );
        synchronizeAttrs(element, {
            'aria-labelled-by': this.labelledBy,
            'aria-described-by': this.describedBy,
        });
    }

    updateMetadata() {
        if (
            !this._fieldApiName ||
            !Object.keys(this._record || {}).length ||
            !Object.keys(this._objectInfos || {}).length
        ) {
            return;
        }
        this._metadataManager = new MetadataManager(
            this._fieldApiName,
            this._objectInfos,
            this._record,
            this._selectedTargetApiName
        );
    }
}
