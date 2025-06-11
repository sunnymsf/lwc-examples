import { generateUniqueId } from 'lightning/inputUtils';
import { classSet } from 'lightning/utils';
import { getRealDOMId, synchronizeAttrs } from 'lightning/utilsPrivate';
import { api, LightningElement } from 'lwc';
// label imports
import labelPlaceholder from '@salesforce/label/LightningCombobox.placeholder';
import labelClear from '@salesforce/label/LightningControl.clear';
import labelLoading from '@salesforce/label/LightningControl.loading';
import labelSearch from '@salesforce/label/LightningLookup.search';

const i18n = {
    clear: labelClear,
    search: labelSearch,
    loading: labelLoading,
    placeholder: labelPlaceholder,
};

export default class LightningMobileGroupedCombobox extends LightningElement {
    // store the real ID of the input of filter combobox
    _filterInputId;

    // value of the lookup input
    _inputText;

    // store the real ID of the main input label
    _mainInputLabelId;

    /**
     * Text label for the input. Label is not visible on screen.
     * @type {string}
     */
    @api ariaLabel = '';

    /**
     * The Lightning Design System name of the icon.
     * Names are written in the format {category}:{icon}; ex. 'utility:down'
     * Icon is displayed preceding the input.
     * @type {string}
     */
    @api filterIconName;

    /**
     * The filter icon alternative text is used to describe the icon.
     * This text should describe what happens when you click the button,
     * for example 'Upload File', not what the icon looks like, 'Paperclip'.
     * @type {string}
     */
    @api filterIconAlternativeText;

    /**
     * Assistive label of the entity filter.
     * @type {string}
     */
    @api filterLabel;

    /**
     * Array of items to be rendered in the filter combobox
     * @type {object}
     */
    @api filterItems;

    /**
     * Text of the selected filter item
     * @type {string}
     */
    @api filterInputText;

    /**
     * Array of items to be rendered in the listbox
     * Items include action item(s) and option group(s)
     * @type {object}
     */
    @api items = [];

    /**
     * Text that is displayed when the field is empty, to prompt the user for a valid entry.
     * @type {string}
     */
    @api placeholder = i18n.placeholder;

    /**
     * * If present, a spinner is displayed at the bottom of the listbox to indicate loading activity.
     * @type {boolean}
     * @default false
     */
    @api showActivityIndicator = false;

    constructor() {
        super();
        this._filterInputId = generateUniqueId();
        this._mainInputLabelId = generateUniqueId();
    }

    renderedCallback() {
        this.synchronizeA11y();
    }

    /**
     * Specifies the value to be set on the input element.
     * @type {string}
     */
    @api get inputText() {
        return this._inputText;
    }

    set inputText(inputText) {
        if (this._inputText === inputText) {
            return;
        }

        this._inputText = inputText;
    }

    /**
     * Sets focus on the input element.
     */
    @api focus() {
        if (!this.isConnected) {
            return;
        }
        this.lookupInput.focus();
    }

    /**
     * Removes focus from the input element.
     */
    @api blur() {
        if (!this.isConnected) {
            return;
        }
        this.lookupInput.blur();
    }

    /**
     * Defines a custom validity message
     * @param {string} message - The string that describes the error. If message is an empty string, the error message is reset.
     */
    @api
    setCustomValidity(message) {
        this.lookupInput.setCustomValidity(message);
    }

    /**
     * Displays the error messages and returns false if the input is invalid.
     * If the input is valid, reportValidity() clears displayed error messages and returns true.
     * @returns {boolean} - The validity status of the input fields.
     */
    @api
    reportValidity() {
        return this.lookupInput.reportValidity();
    }

    get comboboxGroupClass() {
        return classSet().add({
            'slds-grid': this.hasFilter,
            'slds-grid_vertical': this.hasFilter,
        });
    }

    get computedLookupComboboxClass() {
        return classSet('slds-mobile-combobox__header').add({
            'slds-mobile-combobox__header-has-icon': !this.hasFilter,
        });
    }

    get hasFilter() {
        return (
            this.filterItems &&
            Array.isArray(this.filterItems) &&
            this.filterItems.length
        );
    }

    get i18n() {
        return i18n;
    }

    get lookupInput() {
        return this.template.querySelector('lightning-input[data-lookup]');
    }

    get mainInputLabelId() {
        return this._mainInputLabelId;
    }

    handleFilterReady(event) {
        this._filterInputId = event.detail.id;
    }

    /**
     * Fire 'textinput' event with value of input everytime the user types into the input.
     * Set indicator of whether or not to show clear text button.
     * @param {object} event
     */
    handleInputChange(event) {
        const value = event.target.value;
        this.dispatchEvent(new CustomEvent('textinput', { detail: { value } }));
    }

    /**
     * Fire 'select' event with value of selected item when the user taps on a selectable item
     * @param {object} event
     */
    handleSelected(event) {
        const value = event.currentTarget.getAttribute('data-value');
        this.dispatchEvent(new CustomEvent('select', { detail: { value } }));
    }

    /**
     * Fire 'selectfilter' event with the value of the selected filter item once user selects an item in the filter combobox.
     * @param {Event}
     */
    handleSelectFilter(event) {
        const value = event.detail.value;
        this.dispatchEvent(
            new CustomEvent('selectfilter', { detail: { value } })
        );
    }

    synchronizeA11y() {
        const filterLabel = this.template.querySelector('[data-filter-label]');
        synchronizeAttrs(filterLabel, {
            for: this._filterInputId,
        });
        const mainLabel = this.template.querySelector('[data-main-label]');
        const realMainInputLabelId = getRealDOMId(mainLabel);
        if (realMainInputLabelId === this._mainInputLabelId) {
            return;
        }
        this._mainInputLabelId = realMainInputLabelId;
    }
}
