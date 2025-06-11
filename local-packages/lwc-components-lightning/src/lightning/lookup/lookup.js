import formFactor from '@salesforce/client/formFactor';
import labelMessageWhenBadInputDefault from '@salesforce/label/LightningLookup.messageWhenBadInputDefault';
import labelNone from '@salesforce/label/LightningLookup.none';
import labelUnknownRecord from '@salesforce/label/LightningLookup.unknownRecord';
import labelNoAccessRecord from '@salesforce/label/LightningLookup.noAccess';
import labelMissingInformation from '@salesforce/label/LightningLookup.messageWhenMissingInformation';
import labelPlaceholder from '@salesforce/label/LightningLookup.searchObjectsPlaceholder';
import {
    FieldConstraintApi,
    normalizeVariant,
    VARIANT,
} from 'lightning/inputUtils';
import {
    COMMON_LOOKUP_CONSTANTS,
    GET_LOOKUP_RECORDS_WIRE_CONSTANTS,
    GET_RECORD_UI_WIRE_CONSTANTS,
    CREATE_NEW_ACTION_API_NAME,
    logError,
    LookupEventDispatcher,
    LookupUtils,
    MetadataManager,
    InstrumentationHandler,
} from 'lightning/lookupUtils';
import { normalizeRecordId } from 'lightning/recordUtils';
import { getRecordUi } from 'lightning/uiRecordApi';
import {
    classListMutation,
    normalizeBoolean,
    normalizeString,
} from 'lightning/utilsPrivate';
import { formatLabel } from 'lightning/utils';
import { LookupMetadata } from 'lightning/lookupModel';
import { getAura } from 'lightning/auraUtils';
import { api, LightningElement, track, wire } from 'lwc';
import * as CONSTANTS from './constants';
import ObjectInfosAndRecordState from './objectInfosAndRecordState';
import LookupAdvancedModal from 'lightning/lookupAdvancedModal';
import LookupResultsState from './state/lookupResultsState';
import { ObjectInfo } from 'lightning/recordPickerCommon';
import isLookupConsumesRecordPickerEnabled from '@salesforce/featureFlag/SearchLookups.org.enableLookupConsumesRecordPicker';
import labelAdvancedSearchMobile from '@salesforce/label/LightningLookup.advancedSearchMobile';
import labelCreateNew from '@salesforce/label/LightningLookup.createNewObject';

const i18n = {
    messageWhenBadInputDefault: labelMessageWhenBadInputDefault,
    none: labelNone,
    missingInformation: labelMissingInformation,
    advancedSearchMobile: labelAdvancedSearchMobile,
    createNew: labelCreateNew,
};

// eslint-disable-next-line no-confusing-arrow
const getFirstOrDefault = (array, defaultValue) =>
    array && array.length ? array[0] : defaultValue;

const isExternalLookupField = (objectInfos, record, fieldName) => {
    return (
        objectInfos &&
        record &&
        objectInfos[record.apiName] &&
        objectInfos[record.apiName].fields[fieldName] &&
        objectInfos[record.apiName].fields[fieldName].extraTypeInfo ===
            'ExternalLookup'
    );
};

const computeSelectedExternalTargetApiName = (
    objectInfos,
    record,
    fieldName
) => {
    const relationshipField = LookupUtils.getRelationshipField(
        objectInfos,
        record,
        fieldName
    );
    return relationshipField && relationshipField.value
        ? relationshipField.value.apiName
        : undefined;
};

const computeSelectedInternalTargetApiName = (
    objectInfos,
    record,
    fieldName,
    value
) => {
    return LookupUtils.getEntityApiNameFromRecordId(
        objectInfos,
        (value && value.length && value[0]) ||
            (record &&
                fieldName &&
                record.fields[fieldName] &&
                record.fields[fieldName].value)
    );
};

// Only one lookup element should be displayed at a time i.e. desktop or mobile or...
const findLookupElement = (containerElement) =>
    containerElement.querySelector(
        `${CONSTANTS.LIGHTNING_LOOKUP_DESKTOP},${CONSTANTS.LIGHTNING_LOOKUP_DESKTOP}-v2,${CONSTANTS.LIGHTNING_LOOKUP_MOBILE}`
    );

export default class LightningLookup extends LightningElement {
    _instrumentation = new InstrumentationHandler();

    // ================================================================================
    // PUBLIC PROPERTIES
    // ================================================================================
    /**
     * Checks the lookup validity, and fires an 'invalid' event if it's in invalid state.
     * @return {Boolean} - The validity status of the lookup.
     */
    @api
    checkValidity() {
        return this._constraint.checkValidity();
    }

    /**
     * @return {Boolean} - Indicates whether the field is disabled.
     */
    @api
    get disabled() {
        if (!this._isDesktop && this._disableMobileLookup) {
            return this._disableMobileLookup;
        }

        return this._disabled;
    }

    /**
     * Sets whether the field is disabled.
     * @param {Boolean} value - A flag to mark the field as disabled.
     */
    set disabled(value) {
        this._disabled = normalizeBoolean(value);
    }

    /**
     * @return {String} in case of external lookup relationship,
     * returns the local org Id of the referenced entity.
     * Undefined otherwise
     */
    @api
    get externalObjectValue() {
        return this._externalObjectValue;
    }

    /**
     * Use in case of External Lookup Relationship only
     * @param {String} value - the local org Id of the referenced entity
     */
    set externalObjectValue(value) {
        this._externalObjectValue = value;
        this.updatePills([]);
    }

    /**
     * @return {String} - The field name.
     */
    @api
    get fieldName() {
        return this._fieldName;
    }

    /**
     * Sets the field name.
     * @param {String|FieldId} value - The qualified field name.
     */
    set fieldName(value) {
        this._fieldName = value;
        this.updateMetadata();
    }

    /**
     * Sets focus on the input element.
     */
    @api
    focus() {
        if (!this._connected) {
            return;
        }

        if (this._lookupElement) {
            this._lookupElement.focus();
        }
    }

    /**
     * The text label for the field.
     */
    @api label = i18n.none;

    /**
     * The maximum number of values supported.
     */
    @api maxValues = CONSTANTS.DEFAULT_MAX_VALUES;

    /**
     * @return {String} - The error message to be displayed when the user enters the text in
     * the input but does not select a valid option.
     */
    @api
    get messageWhenBadInput() {
        return this._messageWhenBadInput || i18n.messageWhenBadInputDefault;
    }

    /**
     * Sets the error message to be displayed when the user enters the text in the input
     * but does not select a valid option.
     * @param {String} value - The error message.
     */
    set messageWhenBadInput(value) {
        this._messageWhenBadInput = value;
    }

    /**
     * The error message to be displayed when the lookup value
     * is required but is currently missing.
     * @type {String}
     */
    @api messageWhenValueMissing;

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
        this.updateMetadata();
        this._objectInfoRecordState.setObjectInfos(value);
    }

    /**
     * @return {Object} - The source record representation.
     */
    @api
    get record() {
        return this._sourceRecord;
    }

    /**
     * Sets the source record representation.
     * @param {Object} value - The source record.
     */
    set record(value) {
        this._sourceRecord = value;
        this.updateMetadata();
        this._objectInfoRecordState.setRecord(value);
    }

    /**
     * The field info in the object info is not updated based on the layout metadata.
     * It allows field to be marked as required for the given layout.
     * @return {Boolean} - Indicates whether or not the field is required.
     */
    @api
    get required() {
        return this._required;
    }

    /**
     * Sets the flag to mark the field as required.
     * @param {Boolean} value - A flag to mark the field as required.
     */
    set required(value) {
        this._required = normalizeBoolean(value);
        this.updateMetadata();
    }

    /**
     * Shows validation message based on the validity status.
     * @return {Boolean} - The validity status of the lookup.
     */
    @api
    reportValidity() {
        const element = this._lookupElement;

        if (element) {
            return this._constraint.reportValidity((message) => {
                element.errorMessage = message;
            });
        }
        return false;
    }

    /**
     * Sets a custom validity message.
     * @param {String} message - The validation message to be shown in an error state.
     */
    @api
    setCustomValidity(message) {
        this._constraint.setCustomValidity(message);
        if (this._lookupElement) {
            this._lookupElement.errorMessage = message;
        }
    }

    /**
     * @return {Boolean} - Indicates whether the advanced search option is enabled.
     * this setter is needed to avoid disabling lwc/valid-api eslint error
     */
    @api
    get showAdvancedSearch() {
        return this._showAdvancedSearch;
    }

    set showAdvancedSearch(value) {
        this._showAdvancedSearch = value;
        this.updateMetadata();
    }

    /**
     * @return {Boolean | "advanced-only"} - Indicates whether or not to show the create new option.
     */
    @api
    get showCreateNew() {
        return this._showCreateNew;
    }

    set showCreateNew(value) {
        if (typeof value === 'string') {
            this._showCreateNew = normalizeString(value);
        } else {
            this._showCreateNew = normalizeBoolean(value);
        }
    }

    /**
     * Displays a validation message if the lookup is in invalid state.
     */
    @api
    showHelpMessageIfInvalid() {
        this.reportValidity();
    }

    /**
     * Gets the validity constraint of the lookup.
     * @return {Object} - The current validity constraint.
     */
    @api
    get validity() {
        return this._constraint.validity;
    }

    /**
     * @return {Array} - An array of selected lookup values.
     */
    @api
    get value() {
        return this.internalValue;
    }

    /**
     * Sets the values for the lookup.
     * @param {Array} value - An array of record ids.
     */
    set value(value) {
        if (!LookupUtils.arraysIdentical(this.internalValue, value)) {
            this.updateValue(value, false);
            // calling updatePills will eventually trigger getRecordUi
            this.updatePills([]);
        }
    }

    /**
     * @return {String} - The value of variant.
     */
    @api
    get variant() {
        return this._variant || VARIANT.STANDARD;
    }

    /**
     * Sets the variant type for the lookup.
     * @param {String} value - The value of variant.
     */
    set variant(value) {
        this._variant = normalizeVariant(value);
        this.updateClassList();
    }

    // ================================================================================
    // REACTIVE PROPERTIES
    // ================================================================================
    /**
     * The field level help text.
     * @type {String}
     */
    @track fieldLevelHelp;

    /**
     * Internal copy of pills. It gets used to populate inputPill as well as pills in the
     * combobox pill container.
     * @type {Array}
     */
    @track internalPills = [];

    /**
     * An array of selected values for the lookup.
     * @type {Array}
     */
    @track internalValue;

    /**
     * The list of items used to display in combobox.
     * @type {Array}
     */
    @track items = [];

    /**
     * Text and label details needed to compute labels, placeholder etc.
     */
    @track textInfo;

    // ================================================================================
    // PRIVATE PROPERTIES
    // ================================================================================
    /**
     * Api names used to obtain lookup actions using @wire(getLookupActions).
     * For example - ['Opportunity','Account']
     * @type {Array}
     */
    lookupActionObjectApiNames;

    /**
     * Indicates whether or not the component is connected.
     * @type {Boolean}
     */
    _connected = false;

    /**
     * Indicates whether the field is disabled.
     * @type {Boolean}
     */
    _disabled = false;

    _externalObjectValue;

    /**
     * The field api name to trigger @wire(getLookupRecords).
     * Note - Should be only used to trigger the wire.
     * @type {String}
     */
    _fieldApiName;

    /**
     * Current page offset
     * @type {Number}
     */
    _page;

    /**
     * @type {String}
     */
    _searchTerm;

    /**
     * Type of request lookups
     * @type {String}
     */
    searchType;

    /**
     * The qualified field name.
     * @type {String|FieldId}
     */
    _fieldName;

    /**
     * Indicates whether or not the inititial props are set on the child lookup element.
     * @type {Boolean}
     */
    _initProps = false;

    /**
     * The text label for the field.
     * @type {String}
     */
    _label = i18n.none;

    /**
     * The lookup DOM element.
     * @type {Object}
     */
    _lookupElement;

    _metadataManager;

    /**
     * The error message to be displayed when the user enters the text in the input but does
     * not select a valid option.
     * @type {String}
     */
    _messageWhenBadInput;

    /**
     * The source record's objectInfos.
     * @type {Object}
     */
    _objectInfos;

    /**
     * The additional optional fields for the @wire(getRecordUi).
     * @type {Array}
     */
    _optionalFields;

    /**
     * The source record.
     * @type {Object}
     */
    _sourceRecord;

    /**
     * The selected recordIds.
     * @type {array}
     */
    _recordIds;

    /**
     * Indicates whether or not the field is required.
     * @type {Boolean}
     */
    _required = false;

    /**
     * Indicates selected entity for multi-entity lookups.
     * @type {String}
     * @default undefined
     */
    _selectedTargetApiName;

    /**
     * Indicates whether or not to show advanced search option.
     * @type {Boolean}
     */
    _showAdvancedSearch = true;

    /**
     * Public attribute: Indicates whether or not to show create new option.
     * @type {Boolean | "advanced-only"}
     */
    _showCreateNew = false;

    /**
     * Indicates whether or not to show create new option. Computed based on `showCreateNew` public attribute and lookup actions metadata.
     * Passed to lookup-desktop to trigger showing the create new option.
     * @type {Boolean | "advanced-only"}
     */
    enableCreateNew = false;

    /**
     * Variant type of the lookup.
     * @type {String}
     */
    _variant = VARIANT.STANDARD;

    /**
     * Items obtained from @wire(getLookupRecords).
     * @type {Array}
     */
    _wireItems = [];

    _disableMobileLookup = true;

    // Its value is populated by `metadataManager.targetApiName`.
    // A class attribute is needed since metadataManager is not reactive to change
    targetApiName;

    // ================================================================================
    // ACCESSOR METHODS
    // ================================================================================
    /**
     * Gets the validity constaint.
     */
    get _constraint() {
        if (!this._constraintApi) {
            this._constraintApi = new FieldConstraintApi(() => this, {
                valueMissing: () =>
                    this._required &&
                    (!Array.isArray(this.internalValue) ||
                        !this.internalValue.length),
                badInput: () => {
                    return this._lookupElement && this._lookupElement.inputText
                        ? !!this._lookupElement.inputText.trim().length
                        : false;
                },
            });
        }
        return this._constraintApi;
    }

    /**
     * Indicates whether or not the component is loaded on the desktop form factor.
     * @return {Boolean} - See desc.
     */
    get isDesktop() {
        return this._isDesktop;
    }

    /**
     * Indicates if the lookup is single value.
     * @return {Boolean} - true if maxValues is 1.
     */
    get _isSingleValue() {
        return this.maxValues === 1;
    }

    get _isMRU() {
        return (
            this.searchType ===
            GET_LOOKUP_RECORDS_WIRE_CONSTANTS.SEARCH_TYPE_RECENT
        );
    }

    /**
     * Returns the lookup DOM element.
     * @returns {Object} - See desc.
     */
    get lookupElement() {
        if (!this._connected) {
            return null;
        }

        if (this._lookupElement) {
            return this._lookupElement;
        }

        return null;
    }

    get selectedTargetApiName() {
        if (!this._selectedTargetApiName) {
            this._selectedTargetApiName =
                this._computeInitialSelectedTargetApiName();
        }
        return this._selectedTargetApiName;
    }

    get dataSourceParams() {
        return {
            fieldApiName: this._fieldApiName,
            objectApiName: this.targetApiName,
            page: this._page,
            searchTerm: this._searchTerm,
            searchType: this.searchType,
            sourceRecord: this.sourceRecordInputRepresentation,
        };
    }

    // ===================
    // Desktop V2
    // ===================
    selectedRecord;

    @track actionItems = [];

    get shouldUseDesktopV2() {
        return isLookupConsumesRecordPickerEnabled;
    }

    suggestionsDisplayInfoV2;
    recordsV2 = [];

    shouldHaveAdvancedSearchActionItem() {
        return (
            this.showAdvancedSearch &&
            LookupUtils.isValidSearchTerm(this._searchTerm) &&
            !LookupUtils.isFullSearch(this.searchType)
        );
    }

    setAdvancedSearchActionItemLookupDesktopV2() {
        if (this.shouldHaveAdvancedSearchActionItem()) {
            this.actionItems =
                this.computeAdvancedSearchActionItemLookupDesktopV2();
        }
    }

    computeAdvancedSearchActionItemLookupDesktopV2() {
        return [
            {
                id: COMMON_LOOKUP_CONSTANTS.ACTION_ADVANCED_SEARCH,
                label: i18n.advancedSearchMobile.replace(
                    '{0}',
                    this._searchTerm
                ),
                iconName: COMMON_LOOKUP_CONSTANTS.ICON_SEARCH,
                group: 'primary',
            },
        ];
    }

    computeCreateNewActionItemLookupDesktopV2(label) {
        return {
            iconName: COMMON_LOOKUP_CONSTANTS.ICON_ADD,
            label: i18n.createNew.replace('{0}', label === null ? '' : label),
            id: COMMON_LOOKUP_CONSTANTS.ACTION_CREATE_NEW,
            group: 'secondary',
        };
    }

    // ================================================================================
    // LIFECYCLE METHODS
    // ================================================================================
    constructor() {
        super();
        this._events = new LookupEventDispatcher(this);
        this._metadataManager = new MetadataManager();
        this._objectInfoRecordState = new ObjectInfosAndRecordState();
        this._objectInfoRecordState.onRecordConverted(
            (recordInputRepresentation) => {
                this.sourceRecordInputRepresentation =
                    recordInputRepresentation;
            }
        );

        this._resultsState = new LookupResultsState();
        this._resultsState.onReady(
            ({
                records,
                lookupMetadata,
                iconInfo,
                enabledActions,
                hasNextPage,
            }) => {
                this._wireItems = LookupUtils.mapLookupWireRecords(
                    records,
                    lookupMetadata.getSuggestionsDisplayInfo(
                        this._metadataManager.targetApiName
                    ).allFields,
                    iconInfo,
                    COMMON_LOOKUP_CONSTANTS.OPTION_TYPE_CARD
                );

                this.items = this.getDisplayItems(this._wireItems, hasNextPage);

                if (!this._metadataManager.allEntitiesSkipped) {
                    this.setAdvancedSearchActionItemLookupDesktopV2();
                }

                if (
                    this.isDesktop &&
                    enabledActions?.includes(CREATE_NEW_ACTION_API_NAME)
                ) {
                    this.items.push(
                        LookupUtils.computeCreateNewOption(
                            this._metadataManager.targetLabel
                        )
                    );
                    this.actionItems.push(
                        this.computeCreateNewActionItemLookupDesktopV2(
                            this._metadataManager.targetLabel
                        )
                    );
                }
            }
        );
    }

    connectedCallback() {
        this._connected = true;
        this.classList.add('slds-form-element');
        this.updateClassList();

        getAura(() => {
            this._disableMobileLookup = false;
        });
    }

    disconnectedCallback() {
        this._connected = false;
        this._initProps = false;
        this._lookupElement = undefined;
    }

    renderedCallback() {
        if (!this._lookupElement) {
            this._lookupElement = findLookupElement(this.template);
        }

        if (!this._initProps) {
            this.updateMetadata();
            this._initProps = true;
        }
    }

    // ================================================================================
    // DATAPROVIDERS HANDLERS
    // ================================================================================
    searchInProgress = false;
    handleLookupDataLoadStart() {
        this.searchInProgress = true;
    }

    handleLookupRecordsError({ detail }) {
        this.items = [];
        this._events.dispatchErrorEvent(detail.message);
        this.searchInProgress = false;
    }

    handleLookupRecordsRetrieved(event) {
        const { value: records, hasNextPage } = event.detail;
        this.recordsV2 = records;
        this._resultsState.setRecords(records, hasNextPage);
        this.searchInProgress = false;
    }

    handleLookupActionsMetadataRetrieved(event) {
        const isCreateNewActionMetadataEnabled = event.detail?.isActionEnabled(
            this._metadataManager.targetApiName,
            CREATE_NEW_ACTION_API_NAME
        );

        // possible values: true|false|"advanced-only"
        this.enableCreateNew = isCreateNewActionMetadataEnabled
            ? this.showCreateNew
            : false;

        this._resultsState.setLookupEnabledActions(
            this.enableCreateNew === true ? [CREATE_NEW_ACTION_API_NAME] : []
        );
    }

    handleLookupActionsMetadataError(event) {
        this._events.dispatchErrorEvent(event.detail.message);
    }

    handleLookupMetadataRetrieve(event) {
        const { value: metadata } = event.detail;
        const lookupMetadata = new LookupMetadata(metadata);
        this.suggestionsDisplayInfoV2 =
            lookupMetadata.getSuggestionsDisplayInfo(
                this._metadataManager.targetApiName
            );
        this._resultsState.setLookupMetadata(lookupMetadata);
    }

    // ================================================================================
    // WIRE METHODS
    // ================================================================================
    @wire(getRecordUi, {
        layoutTypes: [GET_LOOKUP_RECORDS_WIRE_CONSTANTS.LAYOUT_TYPE_FULL],
        modes: [GET_LOOKUP_RECORDS_WIRE_CONSTANTS.MODE_VIEW],
        optionalFields: '$_optionalFields',
        recordIds: '$_recordIds',
    })
    wiredRecordUi({ error, data }) {
        if (
            error &&
            error.status === GET_RECORD_UI_WIRE_CONSTANTS.HTTP_STATUS_NOT_FOUND
        ) {
            this._handleCreatingPillWithLabel(labelUnknownRecord);
            return;
        } else if (
            error &&
            error.status ===
                GET_RECORD_UI_WIRE_CONSTANTS.HTTP_STATUS_INSUFFICIENT_ACCESS
        ) {
            this._handleCreatingPillWithLabel(labelNoAccessRecord);
            return;
        } else if (error) {
            throw new Error(LookupUtils.parseLdsError(error));
        } else if (!(data && data.records)) {
            return;
        }

        const records = Object.values(data.records).map((record) => ({
            ...record,
            referencedApiNameField: this._metadataManager.getNameField(
                record.apiName
            ),
        }));

        const { pills, invalidValues } = LookupUtils.mapRecordUiWireRecords(
            records,
            this._objectInfos
        );

        if (invalidValues.length > 0 && this.internalValue) {
            // Remove invalid values from this.internalValues
            const values = this.internalValue.filter(
                (value) => !invalidValues.includes(value)
            );
            this.updateValue(values, false);
        }
        this.updatePills(pills);
    }
    // ================================================================================
    // PRIVATE METHODS
    // ================================================================================
    /*
     * Returns the items to be displayed in the combobox
     * @param {Array} wireRecords - the records returned from the wire service
     * @returns {Array<groupedDisplayItems>} displayItems - A grouped set of items to display
     * @returns {String} groupedDisplayItems.label - the label for the grouped set
     * @returns {Array} groupedDisplayItems.items - the list of options for the grouped set
     */
    getDisplayItems(wireRecords, serverHasMoreRecordsToLoad) {
        // filter
        let items = LookupUtils.difference(
            wireRecords,
            ...(this.internalValue || [])
        ).slice(
            0,
            LookupUtils.computeListSize(this.searchType, this.isDesktop)
        );

        const setEmptyIconAlternativeText = (item) => ({
            ...item,
            iconAlternativeText: '',
        });

        items = items.map(setEmptyIconAlternativeText);

        if (this._searchTerm?.length > 0) {
            items = LookupUtils.computeHighlightedItems(
                items,
                this._searchTerm
            );
        }

        items = [
            {
                label: this._computeLabel(items),
                items,
                searchType: this.searchType,
                serverHasMoreRecordsToLoad,
            },
        ];

        if (!this._metadataManager.allEntitiesSkipped) {
            this.setAdvancedSearchOption(items);
        }

        return items;
    }

    /**
     * Handler for entityoptionselect event
     * @param {Event} event - custom event containing the targetApiName
     */
    handleEntityOptionSelect(event) {
        const newTargetApiName = event && event.detail && event.detail.value;
        this._selectedTargetApiName = newTargetApiName;
        this._resultsState.setRecords([], false);
        this.updateMetadata();
    }

    /**
     * Handler for lookuprecordsrequest event fired from child component.
     * @param {Event} event - custom event object with request parameters
     */
    handleLookupRecordsRequest(event) {
        const requestParams = event.detail.requestParams;
        const shouldLoadMore = event.detail.shouldLoadMore;
        let newQueryString, newSearchType, nextPage, queryString;

        // when lazy loading additional records only update page param
        if (shouldLoadMore) {
            nextPage =
                (this._page
                    ? this._page
                    : GET_LOOKUP_RECORDS_WIRE_CONSTANTS.DEFAULT_PAGE) + 1;
        } else {
            newQueryString = requestParams.q;
            newSearchType =
                requestParams.searchType ||
                LookupUtils.computeSearchType(requestParams);
        }

        // only use current searchTerm when new query string is undefined
        queryString = LookupUtils.isUndefined(newQueryString)
            ? this._searchTerm
            : newQueryString;

        // Trigger wire.
        this._fieldApiName = this._metadataManager.fieldApiName;

        // update the required params
        this._page = nextPage;
        this.searchType = newSearchType || this.searchType;
        this._searchTerm = queryString;

        if (this.showCreateNew) {
            this.lookupActionObjectApiNames = Object.keys(
                this._metadataManager.referenceInfos
            );
        }
    }

    /**
     * Handler for pillremove event fired from child component.
     * @param {Object} event - custom event object with removed pill value.
     */
    handlePillRemove(event) {
        if (!event || !event.detail) {
            return;
        }

        const removedValue = event.detail.removedValue;
        if (this._isSingleValue) {
            // Set empty value and pills array.
            this.updateValue([]);
            this.updatePills([]);
        } else {
            if (removedValue && this.internalValue && this.internalPills) {
                // Remove deleted value.
                const values = this.internalValue.filter(
                    (v) => v !== removedValue
                );

                // Remove pill for the removed value.
                const pills = this.internalPills.filter(
                    (p) => p.value !== removedValue
                );

                // Update values, and pills.
                this.updateValue(values);
                this.updatePills(pills);
            }
        }
    }

    /**
     * Handler for recorditemselect event fired from child component.
     * @param {Object} event - custom event object with selected recordId value.
     */
    handleRecordItemSelect(event) {
        if (!event || !event.detail) {
            return;
        }

        // No-op if maxValues count is reached.
        if (
            Array.isArray(this.internalValue) &&
            this.internalValue.length === this.maxValues
        ) {
            return;
        }

        const newPill = this._createPillForSelectedValue(
            event.detail.selectedValue
        );

        let pills;
        if (this._isPillAbsentFromCurrentSelection(newPill)) {
            if (this._isSingleValue) {
                this.updateValue([newPill.value]);
                pills = [];
                this._externalObjectValue = newPill.externalObjectValue;
            } else {
                // Append new value to the existing list.
                const values = [...(this.internalValue || []), newPill.value];
                this.updateValue(values);
                pills = [...this.internalPills];
            }

            if (this._isPillResolved(newPill)) {
                pills.push(newPill);
            }
            this.updatePills(pills);
        }
        // Compute validity
        this.reportValidity();
    }

    handleBlur() {
        this.dispatchEvent(new CustomEvent('blur'));
        this.reportValidity();
    }

    /**
     * Handles Advanced Lookup by showing results in a modal.
     */
    handleAdvancedLookupTrigger() {
        LookupAdvancedModal.open({
            size: 'large',
            inputLabel: this.label,
            inputPlaceholder: formatLabel(
                labelPlaceholder,
                this._metadataManager.targetPluralLabel
            ),
            searchTerm: this._searchTerm,
            sourceApiName: this.sourceApiName,
            fieldApiName: this.unqualifiedFieldApiName,
            targetApiName: this._metadataManager.targetApiName,
            sourceRecord: this.sourceRecordInputRepresentation,
            displayInfo: this._resultsState
                .getLookupMetadata()
                .getAdvancedDisplayInfo(this._metadataManager.targetApiName),
            onrecordselected:
                this.updatePillFromAdvancedLookupSelection.bind(this),
        });
    }

    get unqualifiedFieldApiName() {
        return this.fieldName?.fieldApiName
            ? this.fieldName.fieldApiName
            : LookupUtils.computeUnqualifiedFieldApiName(this.fieldName);
    }

    get sourceApiName() {
        return this._metadataManager.sourceApiName;
    }

    updatePillFromAdvancedLookupSelection(event) {
        this._instrumentation.logRecordSelection({
            targetApiName: this._metadataManager.targetApiName,
            targetApiKeyPrefix: this._metadataManager.targetApiKeyPrefix,
            componentInstanceId: this._metadataManager.componentInstanceId,
        });

        const record = event.detail.selectedRecord;

        const label = record.fields[this._metadataManager.getNameField()].value;
        const values = [...(this.internalValue ?? []), record.id];
        this.selectedRecord = record;
        this.updateValue(values);

        this.updatePills([this._createGenericPill(record.id, label)]);

        this.reportValidity();
        this.items = [];
        this.recordsV2 = [];
        this.actionItems = [];
    }

    setAdvancedSearchOption(items) {
        if (
            this.showAdvancedSearch &&
            LookupUtils.isValidSearchTerm(this._searchTerm) &&
            !LookupUtils.isFullSearch(this.searchType)
        ) {
            items.unshift(
                LookupUtils.computeAdvancedSearchOption(
                    this.isDesktop,
                    this._searchTerm
                )
            );
        }
    }

    /**
     * Updates classList based on the variant.
     */
    updateClassList() {
        classListMutation(this.classList, {
            'slds-form-element_stacked':
                this._variant === VARIANT.LABEL_STACKED,
            'slds-form-element_horizontal':
                this._variant === VARIANT.LABEL_INLINE,
        });
    }

    updateMetadata() {
        if (
            !this._fieldName ||
            !Object.keys(this._sourceRecord || {}).length ||
            !Object.keys(this._objectInfos || {}).length
        ) {
            return;
        }
        this._metadataManager = new MetadataManager(
            this._fieldName,
            this._objectInfos,
            this._sourceRecord,
            this.selectedTargetApiName
        );
        this.targetApiName = this._metadataManager.targetApiName;
        this._resultsState.setIconInfo(
            this._metadataManager.getTargetObjectIconDetails()
        );
        if (this._metadataManager.allEntitiesSkipped) {
            this._logAllEntitiesSkippedError(
                this._metadataManager.fieldApiName,
                this._metadataManager.skippedEntities
            );
        } else {
            // targetObjectInfo is empty when all entities are skipped
            this._instrumentation.setObjectInfo(
                new ObjectInfo(this._metadataManager._targetObjectInfo)
            );
        }
        this.textInfo = this._metadataManager.getEntitiesLabelInfo();
        // Update values.
        if (this.internalValue === undefined) {
            const values = LookupUtils.computeRecordValues(
                this._objectInfos,
                this._sourceRecord,
                this._metadataManager.fieldApiName
            );
            // Don't fire change event since default values is assigned from the record.
            this.updateValue(values, false);
            this.updatePills([]);
        }
        // Update fieldLevelHelp and required
        this.fieldLevelHelp = this._metadataManager.fieldLevelHelp;
        this._required =
            this._metadataManager.isFieldRequired || this._required;
    }

    _logAllEntitiesSkippedError(fieldApiName, skippedEntities) {
        logError({
            errorType: CONSTANTS.ALL_ENTITIES_SKIPPED_ERROR_TYPE,
            fieldApiName,
            skippedEntities: skippedEntities.join(),
        });
        console.error(`${fieldApiName}: ${i18n.missingInformation}`);
    }

    /**
     * Updates the pill using info it obtained via argument, local data or wire.
     * @param {Array} pills - An array of pills infos representing values.
     */
    updatePills(pills = []) {
        // Check if any pills are missing, if so then trigger @wire(getRecordUi) to resolve them.
        const pillValues = pills.map((pill) => {
            return pill.value;
        });

        let pillsResolved = LookupUtils.arraysIdentical(
            pillValues,
            this.internalValue
        );

        if (!pillsResolved) {
            try {
                // Try to resolve pill from the source record itself to avoid hitting wire.
                const values = LookupUtils.computeRecordValues(
                    this._objectInfos,
                    this._sourceRecord,
                    this._metadataManager.fieldApiName
                );

                if (LookupUtils.arraysIdentical(values, this.internalValue)) {
                    pills = LookupUtils.computeRecordPills(
                        this._sourceRecord,
                        this._metadataManager.fieldInfo,
                        this._metadataManager.referenceInfos,
                        this._externalObjectValue
                    );

                    if (pills.length) {
                        pillsResolved = true;
                    }
                }
            } catch (error) {
                // keeping this for now as a safeguard if one of the above has a runtime error
                // we still want to continue and fetch the record from wire. (ex: W-8101623)
                this._events.dispatchErrorEvent(error);
            }
        }

        if (pillsResolved) {
            if (pills && pills.length) {
                this.internalPills = this._isSingleValue
                    ? pills.splice(0, 1)
                    : pills;
            } else {
                this.internalPills = [];
            }
            return;
        }

        if (!pillsResolved && this.internalValue && this.internalValue.length) {
            // Trigger wire to get record representations of live values, and update pills.
            if (
                LookupUtils.isApiExternal(this._metadataManager.targetApiName)
            ) {
                if (this._externalObjectValue) {
                    this._optionalFields = [
                        ...this._metadataManager.optionalNameFields,
                        this._metadataManager.targetApiName + '.ExternalId',
                    ];
                    this._recordIds = [this._externalObjectValue];
                }
            } else {
                this._optionalFields = this._metadataManager.optionalNameFields;
                this._recordIds = this.internalValue.slice();
            }
        }
    }

    /**
     * Updates the lookup value.
     * @param {Array} value - An array of record ids.
     */
    updateValue(value = [], triggerEvent = true) {
        if (value === null) {
            value = [];
        }

        if (!Array.isArray(value)) {
            return;
        }

        value = (value || [])
            .filter((val) => val) // Drop empty.
            .map((val) => normalizeRecordId(val.trim())) // Convert to 18-char record ids.
            .filter((elem, index, self) => {
                return index === self.indexOf(elem); // De-deupe.
            });

        // No-op if values remain unchanged.
        if (LookupUtils.arraysIdentical(value, this.internalValue)) {
            return;
        }

        // Trim values as per the max count.
        if (value.length > this.maxValues) {
            value = value.slice(0, this.maxValues);
        }

        // Update internal copy of values.
        this.internalValue = value;

        // Clear the input text
        if (this._lookupElement) {
            this._lookupElement.inputText = '';
        }

        if (triggerEvent) {
            // Fire an event to notify that values have been changed.
            this._events.dispatchChangeEvent(this.internalValue);
        }
        if (!this.internalValue.length) {
            this._externalObjectValue = undefined;
        }
    }

    get _isDesktop() {
        return formFactor === CONSTANTS.FORM_FACTOR_DESKTOP;
    }

    _computeLabel(items) {
        if (items.length === 0) {
            return '';
        }
        return this.isDesktop
            ? LookupUtils.computeHeadingDesktop(
                  this._metadataManager.targetPluralLabel,
                  this.searchType
              )
            : LookupUtils.computeHeadingMobile(
                  this._searchTerm,
                  this.searchType
              );
    }

    _createGenericPill(recordId, label) {
        const genericValue = {
            id: recordId,
            label: label,
        };
        return this._createPillForSelectedValue(genericValue);
    }

    _handleCreatingPillWithLabel(label) {
        const genericPill = this._createGenericPill(
            getFirstOrDefault(this._recordIds, ''),
            label
        );
        this.updatePills([genericPill]);
    }

    _createPillForSelectedValue(selectedValue) {
        if (typeof selectedValue === 'string') {
            // Selected recordId is always expected to be present in the wireItems for TA or MRU.
            // Use it to populate pill info so as to avoid triggering wire.
            return this._createPillFromWireItems(selectedValue);
        } else if (typeof selectedValue === 'object') {
            //otherwise, for advanced search, we need to get info from metadata and record
            return this._createPillFromSelectedValue(selectedValue);
        }
        return undefined;
    }

    _createPillFromSelectedValue(selectedValue) {
        const isExternalLookup =
            selectedValue.allFields &&
            LookupUtils.isApiExternal(selectedValue.allFields.sobjectType);

        return {
            ...this._metadataManager.getTargetObjectIconDetails(),
            iconSize: COMMON_LOOKUP_CONSTANTS.ICON_SIZE_SMALL,
            label: selectedValue.Name || selectedValue.label,
            type: COMMON_LOOKUP_CONSTANTS.PILL_TYPE_ICON,
            value: isExternalLookup
                ? selectedValue.allFields.ExternalId
                : selectedValue.id,
            externalObjectValue: isExternalLookup
                ? selectedValue.id
                : undefined,
        };
    }

    _createPillFromWireItems(selectedValue) {
        const wireItem = this._wireItems.find(
            (record) => record.value === selectedValue
        );
        if (wireItem) {
            return {
                iconAlternativeText: wireItem.iconAlternativeText,
                iconName: wireItem.iconName,
                iconSize: wireItem.iconSize,
                label: wireItem.text,
                type: COMMON_LOOKUP_CONSTANTS.PILL_TYPE_ICON,
                value: wireItem.value,
                externalObjectValue: wireItem.externalObjectValue,
            };
        }
        return { value: selectedValue };
    }

    _isPillAbsentFromCurrentSelection(newPill) {
        return (
            !Array.isArray(this.internalValue) ||
            !this.internalValue.includes(newPill.value)
        );
    }

    _isPillResolved(pill) {
        return pill && pill.label && pill.iconName;
    }

    _computeInitialSelectedTargetApiName() {
        if (
            isExternalLookupField(
                this.objectInfos,
                this.record,
                this._fieldName
            )
        ) {
            return computeSelectedExternalTargetApiName(
                this.objectInfos,
                this.record,
                this._fieldName
            );
        }
        return computeSelectedInternalTargetApiName(
            this.objectInfos,
            this.record,
            this._fieldName,
            this.value
        );
    }
}
