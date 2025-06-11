/* eslint-disable @lwc/lwc/no-api-reassignments */

import labelSearchObjectsPlaceholder from '@salesforce/label/LightningLookup.searchObjectsPlaceholder';
import labelSearchPlaceholder from '@salesforce/label/LightningLookup.searchPlaceholder';
import labelSelectObject from '@salesforce/label/LightningLookup.selectObject';
import {
    COMMON_LOOKUP_CONSTANTS,
    log,
    LOGGING_CONSTANTS,
    LookupEventDispatcher,
    LookupPerformanceLogger,
    LookupUtils,
    MetadataManager,
} from 'lightning/lookupUtils';
import { api, LightningElement, track } from 'lwc';
import {
    showAuraAdvancedLookupModal,
    getDependentFieldBindingsAuraAdvancedLookup,
} from './auraAdvancedLookup';
import * as CONSTANTS from './constants';
import isLwcAdvancedLookupEnabled from '@salesforce/featureFlag/SearchLookups.org.enableLwcAdvancedLookup';

const i18n = {
    searchPlaceholder: labelSearchPlaceholder,
    searchObjectsPlaceholder: labelSearchObjectsPlaceholder,
    selectEntity: labelSelectObject,
};

/**
 * Displays an input lookup for the Desktop.
 */
export default class LightningLookupDesktop extends LightningElement {
    // ================================================================================
    // PUBLIC PROPERTIES
    // ================================================================================
    /**
     * Indicates whether the field is disabled.
     * @type {Boolean}
     */
    @api disabled = false;

    /**
     * @return {Boolean} - Indicates whether or not to show the create new option.
     */
    @api enableCreateNew;

    /**
     * Error message to be displayed under the lookup input.
     * @type {String}
     */
    @api
    get errorMessage() {
        return this._errorMessage;
    }

    set errorMessage(message) {
        this._errorMessage = message;
        // set message on grouped combobox.
        const groupedCombobox = this._getGroupedCombobox();

        if (groupedCombobox) {
            groupedCombobox.setCustomValidity(message);
            groupedCombobox.reportValidity();
        }
    }

    /**
     * @return {String} - The lookup field name.
     */
    @api
    get fieldName() {
        return this._fieldName;
    }

    /**
     * Sets the field name for the lookup.
     * @param {String|FieldId} value - The lookup field name.
     */
    set fieldName(value) {
        this._fieldName = value;
        this._updateState();
    }

    /**
     * Sets focus on the input element.
     */
    @api
    focus() {
        if (!this._connected) {
            return;
        }

        const combobox = this._getGroupedCombobox();
        if (combobox) {
            combobox.focus();
        }
    }

    /**
     * The combobox input text value.
     * @type {String}
     */
    @api inputText = '';

    /**
     * The list of items used to display in combobox.
     * @type {Array}
     */
    @api
    get items() {
        return this._items;
    }

    set items(groupedItems) {
        this._lookupPerformanceLogger.startRenderMark();
        let { items } = LookupUtils.getSearchTypeAndItems(groupedItems);
        this._lookupPerformanceLogger.mergeTransactionAttributesWith({
            qResults: items ? items.length : 0,
        });
        this._items = groupedItems;
        this.showActivityIndicator = false;
    }

    /**
     * The text label for the field.
     * @type {String}
     */
    @api label;

    /**
     * @return {Number} - The maximum number of values supported by the lookup.
     */
    @api maxValues;

    /**
     * @return {Object} - The source record's objectInfos.
     */
    @api
    get objectInfos() {
        return this._objectInfos;
    }

    /**
     * Sets the source record's objectInfos.
     * @param {Object} value - The source record's objectInfos.
     */
    set objectInfos(value) {
        this._objectInfos = value;
        this._updateState();
    }

    /**
     * Selected records get from combobox
     * @type {Array}
     */
    @api
    get pills() {
        return this._pills;
    }

    set pills(pills) {
        this._pills = pills || [];
        this._value = this._pills.map((p) => p.value);
        if (this.maxValues === 1 && this._pills.length) {
            this.inputPill = this._pills[0];
            this.internalPills = [];
        } else {
            this.internalPills = this._pills;
            this.inputPill = null;
        }

        if (this._pills.length) {
            this.inputText = '';
            this.dispatchEvent(new CustomEvent('reportvalidity'));
        }

        this._updateEntityOptions();
    }

    /**
     * @return {Object} - The source record representation.
     */
    @api
    get record() {
        return this._record;
    }

    /**
     * Sets the source record representation.
     * @param {Object} value - The source record.
     */
    set record(value) {
        this._record = value;
        this._updateState();
    }

    /**
     * The field info in the object info is not updated based on the layout metadata.
     * It allows field to be marked as required for the given layout.
     * @return {Boolean} - Indicates whether or not the field is required.
     */
    @api required;

    /**
     * Text and label details needed to compute labels, placeholder etc.
     */
    @api textInfo;

    /**
     * Gets the validity constraint of the lookup.
     * @return {Object} - The current validity constraint.
     */
    @api
    get validity() {
        return this._constraint.validity;
    }

    /**
     * Sets the variant type for the lookup.
     * @type {String}
     */
    @api variant;

    @api
    get selectedTargetApiName() {
        return this._selectedTargetApiName;
    }

    set selectedTargetApiName(value) {
        this._selectedTargetApiName = value;
        this._updateState();
    }

    // ================================================================================
    // REACTIVE PROPERTIES
    // ================================================================================

    /**
     * The list of entities used to display. Format is {text, value}
     * @type {Array}
     */
    @track entityOptions;

    /**
     * The label of the entity selector combobox (for accessibility purposes).
     * @type {String}
     */
    @track chooseAnObjectAssistiveLabel;

    /**
     * The utility icon name for the combobox input.
     * @type {String}
     */
    @track inputIconName;

    /**
     * The max size (in characters) for the combobox input.
     * @type {Number}
     */
    @track inputMaxlength;

    /**
     * Selected value to pass to combobox as input pill.
     * Note - Should only get used in a single-value lookup.
     * @type {Object}
     */
    @track inputPill = null;

    /**
     * Selected records to pass to combobox pill container.
     * Note - Should only get used in a multi-value lookup.
     * @type {Array}
     */
    @track internalPills = [];

    /**
     * A localized placeholder for the input.
     * @type {String}
     */
    @track placeholder = '';

    /**
     * Indicates if the data is being received over wire. This is used to control the spinner.
     * @type {Boolean}
     */
    @track showActivityIndicator;

    // ================================================================================
    // PRIVATE PROPERTIES
    // ================================================================================

    /**
     * Indicates whether or not the component is connected.
     * @type {Boolean}
     */
    _connected = false;

    _errorMessage;

    /**
     * The qualified field name.
     * @type {String|FieldId}
     */
    _fieldName;

    _items = [];

    // to match with isMobile field in logs of mobile devices: W-7959369
    _lookupPerformanceLogger = new LookupPerformanceLogger({ isMobile: false });

    _metadataManager;

    /**
     * The additional optional fields for the @wire(getRecordUi).
     * @type {Array}
     */
    _optionalFields;

    /**
     * Internal copy of pills. It gets used to populate inputPill as well as internalPills in the
     * combobox pill container.
     * @type {Array}
     */
    _pills = [];

    _previousQueryTermSent;

    _selectedTargetApiName;

    /**
     * @return {Array} An array of selected lookup values.
     */
    _value;

    // ================================================================================
    // ACCESSOR METHODS
    // ================================================================================

    /**
     * The field level help text.
     * @type {String}
     */
    get fieldLevelHelp() {
        return this._metadataManager.fieldLevelHelp;
    }

    /**
     * Returns an input text for the entity option.
     * @returns {String} See desc.
     */
    get selectedEntityLabel() {
        return this._metadataManager.targetLabel;
    }

    // ================================================================================
    // LIFECYCLE METHODS
    // ================================================================================
    constructor() {
        super();
        this._metadataManager = new MetadataManager();
        this.inputIconName = COMMON_LOOKUP_CONSTANTS.ICON_SEARCH;
        this.inputMaxlength = CONSTANTS.INPUT_MAX_LENGTH;
        this.chooseAnObjectAssistiveLabel = i18n.selectEntity;
        this._events = new LookupEventDispatcher(this);
    }

    connectedCallback() {
        this._connected = true;
    }

    disconnectedCallback() {
        this._connected = false;
    }

    renderedCallback() {
        this._lookupPerformanceLogger.endRenderMark();
        this._lookupPerformanceLogger.endTransaction();
    }

    // ================================================================================
    // PRIVATE METHODS
    // ================================================================================
    /**
     * Callback method executed by the parent component to update values after handling "createnew" event.
     * @param {Array} values - An array of newly created record ids.
     */
    _createNewCallback(values = []) {
        if (!Array.isArray(values) || !values.length) {
            return;
        }

        this._handleRecordOptionSelect(values[0], true);
    }

    _getPlaceholder() {
        if (this._metadataManager.isSingleEntity) {
            // Returns "Search <label>", for example - "Search Accounts".
            return i18n.searchObjectsPlaceholder.replace(
                '{0}',
                this._metadataManager.targetPluralLabel
            );
        }
        // Returns "Search..."
        return i18n.searchPlaceholder;
    }

    /**
     * Handles advanced search by showing scoped results in a panel.
     */
    showAuraAdvancedLookupModal() {
        // Log click on advanced search option interaction.
        log(
            LOGGING_CONSTANTS.LOG_EVENT_CLICK,
            LOGGING_CONSTANTS.LOG_SCOPE_INPUT_LOOKUP_DESKTOP,
            LOGGING_CONSTANTS.LOG_TARGET_LOOKUP_ACTION_OPTION,
            {
                scopeName: this._metadataManager.targetApiName,
                type: LOGGING_CONSTANTS.LOG_ACTION_SEARCH_OPTION,
            }
        );

        const scopeMap = this._metadataManager.getTargetObjectAsScope();
        const saveCallback = (values) => {
            // Advanced search returns an array of selected values.
            if (values && values.length > 0) {
                // Select first value as selected value.
                this._handleRecordOptionSelect(values[0]);
                this.dispatchEvent(new CustomEvent('reportvalidity'));
            }
        };
        const lookupAdvancedAttributes = {
            additionalFields: [],
            contextId: '',
            dependentFieldBindings: getDependentFieldBindingsAuraAdvancedLookup(
                this._record,
                this._metadataManager.dependentFields
            ),
            entities: [scopeMap],
            field: LookupUtils.computeUnqualifiedFieldApiName(
                this._metadataManager.fieldApiName
            ),
            groupId: CONSTANTS.ADVANCED_SEARCH_GROUP_ID,
            label: this.label,
            maxValues: CONSTANTS.ADVANCED_SEARCH_MAX_VALUES,
            placeholder: this.placeholder,
            recordId: this.record ? this.record.id : '',
            saveCallback,
            scopeMap,
            scopeSets: { DEFAULT: [scopeMap] },
            source: this._metadataManager.sourceApiName,
            showCreateNew:
                this.enableCreateNew === true ||
                this.enableCreateNew ===
                    CONSTANTS.SHOW_CREATE_NEW_IN_ADVANCED_ONLY,
            term: this.inputText,
        };

        showAuraAdvancedLookupModal(lookupAdvancedAttributes);
    }

    /**
     * Handles create new option selection.
     */
    _handleCreateNewAction() {
        // Log click on create new option interaction.
        log(
            LOGGING_CONSTANTS.LOG_EVENT_CLICK,
            LOGGING_CONSTANTS.LOG_SCOPE_INPUT_LOOKUP_DESKTOP,
            LOGGING_CONSTANTS.LOG_TARGET_LOOKUP_ACTION_OPTION,
            {
                scopeName: this._metadataManager.targetApiName,
                sourceName: this._metadataManager.sourceApiName,
                type: LOGGING_CONSTANTS.LOG_ACTION_CREATE_NEW_OPTION,
            }
        );

        this._events.dispatchCreateEvent(
            this._metadataManager.targetApiName,
            (values) => this._createNewCallback(values)
        );
    }

    /**
     * Handles record option selection
     * @param {String} value - The record id of the option or the whole record when it comes
     *  from advanced search.
     */
    _handleRecordOptionSelect(value, isFromCreateNew = false) {
        // No-op if record id is empty.
        if (!value) {
            return;
        }

        this._logItemSelected(value, isFromCreateNew);

        this._events.dispatchRecordItemSelectEvent(value);
        this.inputText = '';
    }

    _resetSearchTerm() {
        this._previousQueryTermSent = undefined;
        this._updateTerm('');
    }

    _updateEntityOptions() {
        // For single-value lookup, if an inputPill is present then entity selector shouldn't be shown.
        this.entityOptions =
            this.maxValues === 1 && this.inputPill
                ? null
                : this._metadataManager.getEntityOptions();
        this.placeholder = this._getPlaceholder();
    }

    /**
     * Updates lookup's internal state.
     */
    _updateState() {
        if (
            !this._fieldName ||
            !Object.keys(this._record || {}).length ||
            !Object.keys(this._objectInfos || {}).length
        ) {
            return;
        }

        this._metadataManager = new MetadataManager(
            this._fieldName,
            this._objectInfos,
            this._record,
            this.selectedTargetApiName
        );

        this._updateEntityOptions();
    }

    /**
     * Updates term state, triggering the @wire service on term change.
     * @param  {String} term - The search term.
     */
    _updateTerm(term) {
        this._lookupPerformanceLogger.mergeTransactionAttributesWith({
            qType:
                term.length < 3
                    ? LOGGING_CONSTANTS.LOG_CONTEXT_Q_TYPE_MRU
                    : LOGGING_CONSTANTS.LOG_CONTEXT_Q_TYPE_TYPEAHEAD,
            targetApiName: this._metadataManager.targetApiName,
            qLength: term ? term.length : 0,
        });

        // Update combobox input text value.
        this.inputText = term;

        const trimmedTerm = term.trim();
        // W-7498419: We don't want to update the term each time the user open the dropdown
        // That's why we need to check if the term is different from the previous one.
        if (trimmedTerm !== this._previousQueryTermSent) {
            this._previousQueryTermSent = trimmedTerm;
            this._events.dispatchLookupRecordsRequestEvent({
                q: trimmedTerm,
            });
            this.showActivityIndicator = true;
        }
    }

    _logItemSelected(value, isFromCreateNew) {
        let recordId = value;
        let { searchType: origin, items } = LookupUtils.getSearchTypeAndItems(
            this._items
        );
        if (typeof recordId === 'object') {
            recordId = value.id;
            origin = LOGGING_CONSTANTS.LOG_SELECTED_RESULT_FROM_ADVANCED_SEARCH;
        }
        if (isFromCreateNew) {
            origin = LOGGING_CONSTANTS.LOG_SELECTED_RESULT_FROM_CREATE_NEW;
        }
        const position = (items || []).findIndex((item) => {
            return item.value === recordId;
        });

        log(
            LOGGING_CONSTANTS.LOG_EVENT_CLICK,
            LOGGING_CONSTANTS.LOG_SCOPE_INPUT_LOOKUP_DESKTOP,
            LOGGING_CONSTANTS.LOG_TARGET_LOOKUP_SUGGESTION_OPTION,
            {
                recordId,
                position,
                qLength: (this.inputText || '').length,
                origin,
            }
        );
    }

    _getGroupedCombobox() {
        return this.template.querySelector(CONSTANTS.LIGHTNING_COMBOBOX);
    }

    // ================================================================================
    // HANDLERS
    // ================================================================================
    /**
     * fires reportvalidity event when focus is removed from grouped combobox.
     */
    handleBlur() {
        this.dispatchEvent(new CustomEvent('blur'));
    }

    /**
     * Handles the dropdown opening if it isn't empty (items are present)
     */
    handleDropdownOpen() {
        this._updateTerm(this.inputText);
    }

    /**
     * Handles the dropdown opening if it's empty (no items are present)
     */
    handleDropdownOpenRequest() {
        // Log lookup activation.
        log(
            LOGGING_CONSTANTS.LOG_EVENT_CLICK,
            LOGGING_CONSTANTS.LOG_SCOPE_INPUT_LOOKUP_DESKTOP,
            LOGGING_CONSTANTS.LOG_TARGET_INPUT,
            {
                scopeName: this._metadataManager.targetApiName,
                skippedEntities: this._metadataManager.skippedEntities,
            }
        );

        this._lookupPerformanceLogger.startTransaction();

        // Show MRU items only if user has not typed any inputText.
        if (!this.inputText.length) {
            this._updateTerm('');
        }
    }

    /**
     * Handles the pillremove event fired from combo-box when a selected option is removed.
     * @param {Object} event - Contains details of the event being handled.
     */
    handlePillRemove(event) {
        log(
            LOGGING_CONSTANTS.LOG_EVENT_PILL_REMOVE,
            LOGGING_CONSTANTS.LOG_SCOPE_INPUT_LOOKUP_DESKTOP,
            LOGGING_CONSTANTS.LOG_TARGET_RECORD_PILL_ITEM,
            {
                scopeName: this._metadataManager.targetApiName,
            }
        );

        if (event && event.detail) {
            const removedValue = (event.detail.item || {}).value;
            if (!removedValue) {
                return;
            }
            this._events.dispatchPillRemoveEvent(removedValue);
            this._updateTerm('');
        }
    }

    /**
     * Handles the select event fired from combo-box when an option is selected.
     * @param {Object} event - Contains details of the event being handled.
     */
    handleSelect(event) {
        const value = event.detail.value;
        switch (value) {
            case COMMON_LOOKUP_CONSTANTS.ACTION_ADVANCED_SEARCH:
                /* eslint-disable no-unused-expressions */
                isLwcAdvancedLookupEnabled
                    ? this._events.dispatchAdvancedLookupOptionSelectEvent()
                    : this.showAuraAdvancedLookupModal();
                break;
            case CONSTANTS.ACTION_CREATE_NEW:
                this._handleCreateNewAction();
                break;
            default:
                this._handleRecordOptionSelect(value);
                break;
        }
    }

    /**
     * Handles entity option change.
     * @param {Object} event - The groupedCombobox onselectfilter event object.
     */
    handleEntityOptionSelect(event) {
        if (!event.detail) {
            return;
        }

        const selectedEntity = event.detail.value;

        // Log that a new entity has been selected.
        log(
            LOGGING_CONSTANTS.LOG_EVENT_CLICK,
            LOGGING_CONSTANTS.LOG_SCOPE_ENTITY_SELECTOR,
            LOGGING_CONSTANTS.LOG_TARGET_FILTER_ITEM,
            {
                scopeName: selectedEntity,
            }
        );
        // No-op if newly selected target api is the same as the previous one.
        if (selectedEntity === this._metadataManager.targetApiName) {
            return;
        }

        this._events.dispatchEntityOptionSelect(selectedEntity);
        this._resetSearchTerm();
        this._items = [];

        // Update internal state.
        this._updateState();
    }

    /**
     * Handles the oninput event from the combobox input, triggering an update to @wire parameters.
     * @param {Object} event - The input's oninput/onchange event.
     */
    handleTextInput(event) {
        // No-op if event detail is empty or inputPill is already populated.
        if (!event.detail || this.inputPill) {
            return;
        }
        const term = event.detail.text || '';
        if (this.inputText.trim() === term.trim()) {
            this.inputText = term;
            return;
        }

        this._lookupPerformanceLogger.startTransaction();

        // Update term.
        this._updateTerm(term);
    }
}
