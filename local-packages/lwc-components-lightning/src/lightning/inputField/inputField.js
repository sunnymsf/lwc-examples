/* eslint-disable @lwc/lwc/no-api-reassignments */

import { LightningElement, api, track } from 'lwc';
import {
    getUiField,
    Fields,
    getCompoundFields,
    isCompoundField,
    isPersonAccount,
    UNSUPPORTED_REFERENCE_FIELDS,
    compoundFieldIsUpdateable,
    compoundFieldIsCreateable,
    isPersonNameField,
    isBlocklistedField,
    isTypeReferenceWithLightningLookupSupported,
    isTypeReferenceWithLightningLookupUnsupported,
    getFieldError,
} from 'lightning/fieldUtils';
import * as depUtils from 'lightning/dependencyUtils';
import { scaleToDecimalPlaces } from './numberUtils';
import { VARIANT } from 'lightning/inputUtils';
import { classListMutation, normalizeBoolean } from 'lightning/utilsPrivate';
const NUMBER_TYPES = [
    Fields.DECIMAL,
    Fields.INT,
    Fields.PERCENT,
    Fields.CURRENCY,
    Fields.DOUBLE,
];

const STATE_CODE = 'StateCode';
const COUNTRY_CODE = 'CountryCode';

function uncapitalize(str) {
    return `${str[0].toLowerCase()}${str.slice(1)}`;
}

function isUnsupportedReferenceField(name) {
    return UNSUPPORTED_REFERENCE_FIELDS.indexOf(name) !== -1;
}

// Returns a normalized string name by removing the prefix (e.g. removes 'Billing' from 'BillingStreet' for Address fields)
function removePrefix(str, prefix) {
    return prefix ? str.replace(prefix, '') : str;
}

// Adds a prefix to the string (e.g. adds 'Billing' to 'Street' for Address fields)
function addPrefix(str, prefix) {
    return prefix ? prefix + str : str;
}

function isEmptyObject(obj) {
    // fastest way to do this!
    // eslint-disable-next-line guard-for-in
    for (const name in obj) {
        return false;
    }
    return true;
}

/**
 * Returns a map of updated values from a compound field,
 * normalizing the names and capitalization rules
 * @param {Object} originalValue A map of the original values
 * @param {Object} changedValues Values that have changed
 * @param {Object} fieldPrefix The field prefix in the map of original values (e.g. 'Billing' in 'BillingStreet')
 *
 * @returns {Object} Map of updated values
 */
function normalizeCompoundFieldValues(
    originalValue,
    changedValues,
    fieldPrefix
) {
    return Object.keys(originalValue).reduce((ret, rawKey) => {
        const key = removePrefix(rawKey, fieldPrefix);
        // map state and country values to code if code is present,
        // rather than raw value
        let normalizedKey;
        if (key === STATE_CODE || uncapitalize(key) === 'state') {
            normalizedKey = 'province';
        } else if (key === COUNTRY_CODE) {
            normalizedKey = 'country';
        } else {
            normalizedKey = uncapitalize(key);
        }
        const normalizedValue = changedValues[normalizedKey]
            ? changedValues[normalizedKey]
            : null;
        ret[addPrefix(key, fieldPrefix)] = normalizedValue;
        return ret;
    }, {});
}

const VARIANT_MAPPING = {
    stacked: VARIANT.LABEL_STACKED,
    horizontal: VARIANT.LABEL_INLINE,
};

// Selectors
const LIGHTNING_INPUT_NAME = 'lightning-input-name';
const LIGHTNING_INPUT_ADDRESS = 'lightning-input-address';
const LIGHTNING_INPUT = 'lightning-input';
const LIGHTNING_TEXTAREA = 'lightning-textarea';
const LIGHTNING_QUILL = 'lightning-quill';
const LIGHTNING_PICKLIST = 'lightning-picklist';
const LIGHTNING_LOOKUP = 'lightning-lookup';
const LIGHTNING_INPUT_LOCATION = 'lightning-input-location';

/**
 * Represents an editable input for a field on a Salesforce object.
 */
export default class LightningInputField extends LightningElement {
    // compound field labels
    firstNameLabel = '';
    middleNameLabel = '';
    lastNameLabel = '';
    salutationLabel = '';
    suffixLabel = '';

    /**
     * Controls auto-filling of the input field based on the value.
     * Supported field types: 'text', 'email', 'textarea', and 'single select picklist'
     * Additional field types supported on mobile: 'date', 'time', and 'date-time'
     */
    @api autocomplete;

    @track nameFieldsToDisplay = ['firstName', 'lastName']; // Middle Name and Suffix is disabled by default, Enabled by PERM.

    @track streetLabel = '';
    @track cityLabel = '';
    @track provinceLabel = '';
    @track countryLabel = '';
    @track postCodeLabel = '';

    @track uiField = {};
    @track failed = false;
    @track errorMessage = '';

    @track ready = false;
    @track picklistOptions;
    @track addressOptions = {};
    @track isCompoundField = false;
    @track nameField = {};
    @track addressField = {};
    @track label = '';
    @track _uiFieldRequired = false;
    @track _externalRequired = false;
    @track inlineHelpText = '';
    @track _disabled;
    @track _readOnly;
    @track internalValue;
    // needed for lookups
    @track objectInfos;
    @track record;
    @track _fieldName;
    @track _ariaInvalid;

    // addressfield!
    @track _street;
    @track _country;
    @track _postalCode;
    @track _state;
    @track _city;
    // to pass down to the inputs, keep the default as no variant
    @track _labelAlignment = '';
    @track _variant;

    // raw field name is stored to validate that when object filed
    // references are used that the objectApiName matches the form
    _rawFieldName;
    // available later after transform / wire resolve
    _objectApiName = null;
    _isRenderable = false;
    originalValue;

    isDirty = false;
    serverError;
    serverErrorValue;
    _inChangeCycle = false;

    connectedCallback() {
        this.classList.add('slds-form-element');
        this.updateClassList();
        this.connected = true;
    }

    disconnectedCallback() {
        this.connected = false;
        this.isRenderable = false;
    }

    get isRenderable() {
        const { objectApiName, fieldName } = this;
        // only set when we have objectApiName and fieldName determined
        if (objectApiName && fieldName) {
            this._isRenderable = !isBlocklistedField(objectApiName, fieldName);
        } else {
            this._isRenderable = false;
        }
        return this._isRenderable;
    }

    set isRenderable(value) {
        this._isRenderable = normalizeBoolean(value);
    }

    updateClassList() {
        const { isRenderable, isTypeAddress, isTypeName } = this;
        classListMutation(this.classList, {
            'slds-hide': !isRenderable,
            'slds-form-element_stacked':
                this.isStackedLabel() && !isTypeAddress && !isTypeName,
            'slds-form-element_horizontal': this.isHorizontalLabel(),
        });
    }

    get objectApiName() {
        return this._objectApiName;
    }

    set objectApiName(value) {
        this._objectApiName = value || null;
    }

    isStackedLabel() {
        // only add the form class if density or variant is stacked
        return (
            (this._labelAlignment === 'stacked' && !this.variant) ||
            this.variant === VARIANT.LABEL_STACKED
        );
    }

    isHorizontalLabel() {
        // only add the form class if density or variant is horizontal
        return (
            (this._labelAlignment === 'horizontal' && !this.variant) ||
            this.variant === VARIANT.LABEL_INLINE
        );
    }

    /**
     * The variant changes the label position of an input field.
     * Accepted variants include standard, label-hidden, label-inline, and label-stacked.
     * The variant, if specified, determines the label position.
     * Otherwise, the density setting of the parent form determines the label position.
     * @type {string}
     * @default standard
     */
    @api
    get variant() {
        return this._variant;
    }

    set variant(value) {
        this._variant = value;
        this.updateClassList();
    }

    /**
     * Reserved for internal use.
     * @param {*} data Reserved for internal use.
     */
    @api
    wireRecordUi(data) {
        let uiField;
        // TODO break up wireRecordUi method, too much stuff happening here
        try {
            uiField = getUiField(this.fieldName, data.record, data.objectInfo);
        } catch (e) {
            this.failed = true;
            this.errorMessage = `Field "${this.fieldName}" not found in response.`;
            return;
        }
        this.record = data;
        this.uiField = uiField;
        this._uiFieldRequired = uiField.required;
        this.objectInfos = data.objectInfos;
        this.inlineHelpText = uiField.inlineHelpText;
        this._labelAlignment = data.labelAlignment ? data.labelAlignment : '';
        this.updateFieldLabel(data.layoutFieldData);
        // update objectApiName and fieldName, so isRenderable can be determined
        this.objectApiName = data.record?.apiName || data.objectInfo?.apiName;
        // set classes after entity set
        this.updateClassList();

        if (!this.isRenderable) {
            // exit early, blocklisted items won't render
            return;
        }
        if (!this.isDirty) {
            this.internalValue = uiField.value;
        }

        if (
            this._rawFieldName &&
            this._rawFieldName.objectApiName &&
            this._rawFieldName.objectApiName !== data.objectInfo.apiName
        ) {
            throw new Error(
                `objectApiName (${this._rawFieldName.objectApiName}) for field ${this.fieldName} does not match the objectApiName provided for the form (${data.objectInfo.apiName}).`
            );
        }

        this.originalValue = uiField.value;

        // reset the disabled and readOnly values in case they had been overridden based on the previous wired response
        this._disabled = this._externalDisabled;
        this._readOnly = this._externalReadonly;

        this.isCompoundField = false;
        if (
            isCompoundField(
                this.fieldName,
                data.objectInfo,
                isPersonAccount(data.record)
            )
        ) {
            this.isCompoundField = true;
            this.fieldPrefix = this.getFieldPrefix();
            this.initializeCompoundField(uiField, data);
        } else if (
            (!data.createMode && uiField.updateable === false) ||
            (data.createMode && uiField.createable === false)
        ) {
            this._disabled = true;
            this._readOnly = true;
        }

        if (!this.isAnyPicklistType && !this.isCompoundField) {
            // compound fields without picklists will be marked ready in initializeCompoundField
            // picklists and compound fields that have picklist constituents will be marked ready after the options are wired
            this.ready = true;
        }
    }

    updateFieldLabel(layoutData = {}) {
        const layoutLabel =
            layoutData[this.fieldName] && layoutData[this.fieldName].label;
        this.label = layoutLabel || this.uiField.label;
    }

    get inputVariant() {
        // precendence to variant over density
        if (this.variant) {
            return this.variant;
        }
        if (VARIANT_MAPPING[this._labelAlignment]) {
            return VARIANT_MAPPING[this._labelAlignment];
        }
        return this.variant;
    }

    get fieldLength() {
        // Latitude and Longitude are subfield of GeoLocation. inputField use input type=text for now.
        // Since inputLocation use input type=text and no max-length limitation,
        // if it's Location sub field, don't set the max-length either.
        return !this.isLocationSubField ? this.uiField.length : undefined;
    }

    /**
     * Reserved for internal use.
     * @param {*} picklistValues Reserved for internal use
     */
    @api
    wirePicklistValues(picklistValues) {
        // picklist fields rely on the record for dependency management.
        // The initialization logic will fail if record-ui isn't already wired.
        if (!this.record) {
            return;
        }

        this._picklistValues = picklistValues;

        if (this.isAnyPicklistType) {
            this.initializePicklist(this.fieldName);
        } else if (this.isCompoundField) {
            this.initializePicklistsForCompoundField(this.uiField, this.record);
        } else if (this.isTypeCheckbox) {
            // Also need to register checkbox fields that are part of a dependency chain
            this.registerCheckboxDependency();
        }

        this.ready = true;
    }

    updateAddressField(changedValues = {}) {
        // W-6297329 gack this.addressField.*. undefined
        let address;

        if (this.isDirty) {
            // If field is in dirty state, update the field with changed values
            address = changedValues;
        } else {
            // If field is in clean state, update the field with initial values
            address = {
                country: this.getNormalizedStateCountryField('Country').value,
                postalCode:
                    this.addressField.PostalCode &&
                    this.addressField.PostalCode.value,
                city: this.addressField.City && this.addressField.City.value,
                province: this.getNormalizedStateCountryField('State').value,
                street:
                    this.addressField.Street && this.addressField.Street.value,
            };
        }

        // Only update the subfield if the value is defined
        if (address.country !== undefined) {
            this._country = address.country;
        }
        if (address.postalCode !== undefined) {
            this._postalCode = address.postalCode;
        }
        if (address.province !== undefined) {
            this._state = address.province;
        }
        if (address.street !== undefined) {
            this._street = address.street;
        }
        if (address.city !== undefined) {
            this._city = address.city;
        }

        this.streetLabel =
            this.addressField.Street && this.addressField.Street.label;
        this.cityLabel = this.addressField.City && this.addressField.City.label;
        this.postCodeLabel =
            this.addressField.PostalCode && this.addressField.PostalCode.label;
        if (this.addressField.Country) {
            this.countryLabel = this.addressField.Country.label;
        } else if (this.addressField.CountryCode) {
            this.countryLabel = this.addressField.CountryCode.label;
        }
    }

    initializeCompoundField(uiField, record) {
        let isNameField = false;
        const compoundFields = getCompoundFields(
            this.fieldName,
            record.record,
            record.objectInfo
        );

        let compoundField = this.addressField;
        if (isPersonNameField(uiField)) {
            compoundField = this.nameField;
            isNameField = true;
        }

        if (
            (!record.createMode &&
                !compoundFieldIsUpdateable(
                    compoundFields,
                    record.record,
                    record.objectInfo
                )) ||
            (record.createMode &&
                !compoundFieldIsCreateable(
                    compoundFields,
                    record.record,
                    record.objectInfo
                ))
        ) {
            this._disabled = true;
        }

        let hasPicklists = false;
        compoundFields.forEach((field) => {
            const fieldName = removePrefix(field, this.fieldPrefix);

            compoundField[fieldName] = getUiField(
                field,
                record.record,
                record.objectInfo
            );
            if (compoundField[fieldName].type === Fields.PICKLIST) {
                hasPicklists = true;
            }
        });

        if (isNameField && this.isTypeName) {
            this.firstNameLabel = compoundField.FirstName.label;
            // Middle names only show up if a perm is enabled
            if (compoundField.MiddleName) {
                this.middleNameLabel = compoundField.MiddleName.label;
                this.nameFieldsToDisplay.push('middleName');
            }

            // Suffix only show up if a perm is enabled
            if (compoundField.Suffix) {
                this.suffixLabel = compoundField.Suffix.label;
                this.nameFieldsToDisplay.push('suffix');
            }

            this.lastNameLabel = compoundField.LastName.label;

            // Salutation doesn't exist for User entity
            if (compoundField.Salutation) {
                this.salutationLabel = compoundField.Salutation.label;
                this.nameFieldsToDisplay.push('salutation');
            }
        }

        // if the compound field doesn't have a picklist constituent, mark it ready
        if (!hasPicklists) {
            this.ready = true;
        }

        if (this.isTypeAddress) {
            this.updateAddressField();
        }
    }

    /**
     * Resets the form fields to their initial values.
     */
    @api
    reset() {
        this.isDirty = false;
        this.wireRecordUi(this.record);
        // clear any errors
        this.setErrors('');
        if (this.canBeControllingField) {
            this.dispatchControllerFieldChangeEvent(
                this.fieldName,
                this.internalValue
            );
        }
    }

    // TODO this should be removed after records experience updates their code to not rely on this method
    /**
     * Reserved for internal use.
     * @param {*} fieldName Reserved for internal use.
     * @param {*} options Reserved for internal use.
     */
    @api
    updateDependentField(fieldName, options) {
        this.updateFieldOptions(fieldName, options);
        // make sure the component is marked ready
        this.ready = true;
    }

    /**
     * Reserved for internal use.
     * @param {*} errors Reserved for internal use.
     */
    @api
    setErrors(errors) {
        if (
            errors &&
            errors.body &&
            errors.body.output &&
            errors.body.output.fieldErrors
        ) {
            let fieldError = getFieldError(
                errors.body.output.fieldErrors,
                this.fieldName
            );
            if (fieldError) {
                this.setCustomValidity(fieldError.message);
                this.serverError = fieldError;
                this.serverErrorValue = this.value;
            } else {
                this.serverError = undefined;
                this.setCustomValidity('');
            }
        } else {
            this.serverError = undefined;
            this.setCustomValidity('');
        }
    }

    /**
     * Focus underlying input
     */
    @api
    focus() {
        if (this.connected) {
            const input = this.inputComponent;
            if (input && input.focus) {
                input.focus();
            }
        }
    }

    /**
     * The field value, which overrides the existing value.
     * @type {string}
     *
     */
    @api
    get value() {
        return this.internalValue;
    }

    set fieldName(name) {
        this._previousRawFieldName = this._rawFieldName;
        this._rawFieldName = name;
        if (name && name.fieldApiName) {
            this._fieldName = name.fieldApiName;
        } else {
            this._fieldName = name;
        }

        // If fieldname changes, we need to notify recordEditForm of the new field
        // If the field is a picklist, recordEditForm would also have to update the dependency manager
        // and wire up-to-date picklist values to inputField
        //
        // [W-10046899] this.ready is set to false inorder to stop rendering
        // a different inputType with the existing value in the current render cycle.
        // When the inputField is re-rendered, this.ready will be set to true automatically.
        if (this.connected && name && this._previousRawFieldName !== name) {
            this.ready = false;
            // fieldName has changed need to retest rather than used cached _isRenderable
            this.isRenderable = false;
            this.registerInputField();
        }
    }

    /**
     * The API name of the field to be displayed.
     * @type {string}
     */
    @api
    get fieldName() {
        return this._fieldName;
    }

    set value(val) {
        if (
            this._inChangeCycle &&
            this.isTypeReference &&
            this.isTypeReferenceWithLightningLookupSupported
        ) {
            // reject values being set from outside
            return;
        }
        // uninitialized values passed through
        // templates are undefined but should not
        // mark the field as dirty
        if (val !== undefined) {
            this.internalValue = val;
            this.isDirty = true;

            // We need to notify the dependency manager of the change in case the field has dependents
            if (this.ready && this.canBeControllingField) {
                this.dispatchControllerFieldChangeEvent(this.fieldName, val);
            }
        }
    }

    /**
     * If present, the field is grayed out and users can't interact with it.
     * Disabled fields don't receive focus and are skipped in tabbing navigation.
     * @type {boolean}
     *
     */
    @api
    get disabled() {
        return !!this._disabled;
    }

    /**
     * Specifies whether an input field is read-only. This value defaults to false.
     * Not supported for the following field types: rich text, picklist, multi-select picklist, and lookup.
     * A read-only field is not disabled by default.
     * @type {boolean}
     * @default false
     */
    @api
    get readOnly() {
        return !!this._readOnly;
    }

    set readOnly(val) {
        this._readOnly = val;
        // Need to keep track of the value passed into the component since we override this in certain cases
        this._externalReadonly = val;
    }

    /**
     * If present, the input field must be filled out before the form is submitted.
     * @type {boolean}
     * @default false
     */
    @api
    get required() {
        return this._uiFieldRequired || this._externalRequired;
    }

    set required(value) {
        this._externalRequired = normalizeBoolean(value);
    }

    // Only used by checkbox, there is no way to make a checkbox field required in the layout in core.
    get externalRequired() {
        return this._externalRequired;
    }

    /**
     * Reserved for internal use.
     * @returns {boolean} Returns true if the input field is valid.
     */
    @api
    reportValidity() {
        const input = this.inputComponent;
        if (input && input.reportValidity) {
            return input.reportValidity();
        }
        return true;
    }

    set disabled(val) {
        this._disabled = val;
        // Need to keep track of the value passed into the component since we override this in certain cases
        this._externalDisabled = this._disabled;
    }

    /**
     * Reserved for internal use. If present, the field has been modified by the user but not saved or submitted.
     * @type {boolean}
     * @default false
     */
    @api
    get dirty() {
        return this.isDirty;
    }

    /**
     * Reserved for internal use. Clean up the field dirty state.
     */
    @api
    clean() {
        this.isDirty = false;
    }

    get isTypeName() {
        return this.isCompoundField && isPersonNameField(this.uiField);
    }

    get isTypeAddress() {
        return this.uiField.compound && Fields.ADDRESS === this.uiField.type;
    }

    get country() {
        return this.getNormalizedStateCountryField('Country');
    }

    get state() {
        return this.getNormalizedStateCountryField('State');
    }

    get countryOptions() {
        return this.addressOptions.CountryCode;
    }

    get stateOptions() {
        return this.addressOptions.StateCode;
    }

    getNormalizedStateCountryField(fieldName) {
        if (this.addressField && this.addressField[`${fieldName}Code`]) {
            return this.addressField[`${fieldName}Code`];
        } else if (this.addressField && this.addressField[fieldName]) {
            return this.addressField[fieldName];
        }
        return {};
    }

    // The longitude and latitude fields are passed down as type=DOUBLE
    // however, these fields should not be mapped to input type='number
    // otherwise the value will be localized based on the user's locale
    get isTypeNumber() {
        return (
            NUMBER_TYPES.includes(this.uiField.type) && !this.isLocationSubField
        );
    }

    get isLocationSubField() {
        const compoundComponentName = this.uiField.compoundComponentName;
        return (
            compoundComponentName === 'Latitude' ||
            compoundComponentName === 'Longitude'
        );
    }

    get numberFormatter() {
        let formatter = 'decimal';
        switch (this.uiField.type) {
            case 'Currency':
                /* W-13991812: remove currency symbol to support multicurrency */
                formatter = 'decimal';
                break;
            case 'Percent':
                formatter = 'percent-fixed';
                break;
            default:
        }
        return formatter;
    }

    get numberStep() {
        switch (this.uiField.type) {
            case 'Currency':
                return 0.01;
            case 'Percent':
            case 'Double':
            case 'Decimal':
                return scaleToDecimalPlaces(this.uiField.scale);
            default:
                return 1;
        }
    }

    // text type is the default
    get isTypeText() {
        return (
            !this.isTypeNumber &&
            !this.isTypeRichText &&
            !this.isTypeTextArea &&
            !this.isTypeCheckbox &&
            !this.isTypeDate &&
            !this.isTypeDateTime &&
            !this.isTypeTime &&
            !this.isTypeEmail &&
            !this.isTypePicklist &&
            !this.isTypeMultiPicklist &&
            !this.isTypeName &&
            !this.isTypeReference &&
            !this.isTypeLocation &&
            !this.isTypeUnsupportedReference &&
            !this.isTypeAddress
        );
    }

    get isTypeRichText() {
        return (
            Fields.TEXTAREA === this.uiField.type &&
            Fields.RICH_TEXTAREA === this.uiField.extraTypeInfo &&
            this.uiField.htmlFormatted
        );
    }

    get isTypeTextArea() {
        return (
            Fields.TEXTAREA === this.uiField.type &&
            Fields.PLAIN_TEXTAREA === this.uiField.extraTypeInfo &&
            !this.uiField.htmlFormatted
        );
    }

    get isTypeCheckbox() {
        return Fields.BOOLEAN === this.uiField.type;
    }

    get isTypeEmail() {
        return Fields.EMAIL === this.uiField.type;
    }

    get isTypeDate() {
        return Fields.DATE === this.uiField.type;
    }

    get isTypeDateTime() {
        return Fields.DATETIME === this.uiField.type;
    }

    get isTypeTime() {
        return Fields.TIME === this.uiField.type;
    }

    get isTypePicklist() {
        return Fields.PICKLIST === this.uiField.type;
    }

    get isTypeMultiPicklist() {
        return Fields.MULTI_PICKLIST === this.uiField.type;
    }

    get canBeControllingField() {
        return this.isTypePicklist || this.isTypeCheckbox;
    }

    get isAnyPicklistType() {
        return this.isTypePicklist || this.isTypeMultiPicklist;
    }

    get isTypeReference() {
        if (this.isTypeUnsupportedReference) {
            return false;
        }
        return Fields.REFERENCE === this.uiField.type;
    }

    get isTypeLocation() {
        return Fields.LOCATION === this.uiField.type;
    }

    get isTypeUnsupportedReference() {
        return isUnsupportedReferenceField(this.fieldName);
    }

    get isTypeReferenceWithLightningLookupUnsupported() {
        return isTypeReferenceWithLightningLookupUnsupported(
            this.fieldName,
            this.uiField
        );
    }

    get isTypeReferenceWithLightningLookupSupported() {
        return isTypeReferenceWithLightningLookupSupported(
            this.fieldName,
            this.uiField
        );
    }

    get displayValue() {
        return this.uiField.displayValue;
    }

    /**
     * Lookup needs an array,
     * so this casts the value to an array
     */
    get lookupValue() {
        if (this.value === undefined) {
            return [];
        } else if (Array.isArray(this.value)) {
            return this.value;
        }
        return [this.value];
    }

    renderedCallback() {
        if (!this.ready) {
            this.registerInputField();
        }
    }

    registerInputField() {
        this.dispatchEvent(
            // eslint-disable-next-line lightning-global/no-custom-event-bubbling
            new CustomEvent('registerinputfield', {
                bubbles: true,
                composed: true,
                cancelable: true,
            })
        );
    }

    setCustomValidity(message) {
        const input = this.inputComponent;
        if (input && input.setCustomValidity) {
            input.setCustomValidity(message ? message : '');
            input.showHelpMessageIfInvalid();
        }
    }

    // TODO refactor this function into smaller pieces
    handleChange(e) {
        // ignore change events until ready
        if (!this.ready) {
            return;
        }

        // change events without detail should be ignored
        if (!e.detail) {
            return;
        }

        if (this.isTypeName || this.isTypeAddress || this.isTypeLocation) {
            this.handleCompoundFieldChange(e);
            return;
        }

        if (
            (this.isTypePicklist || this.isTypeMultiPicklist) &&
            e.detail.programmatic
        ) {
            this.handlePicklistProgrammaticChange(e);
            return;
        }

        if (e.detail.checked !== undefined) {
            this.internalValue = e.detail.checked;
            /* W-15204516
               attachOnChangeToElement method of InteropComponent.js maintains a map of all the @api attributes attached to the component(propNameToAttrMap).
                The property 'checked' is not an @api attribute and hence the attachOnChangeToElement treats it as an invalid attribute
                 and does not set the value(true/false) to checkbox. As value is a valid @api attribute, maintaining a 'value' property
                in detail can solve the issue*/
            e.detail.value = e.detail.checked;
        } else if (
            this.isTypeReference &&
            !this.isTypeReferenceWithLightningLookupUnsupported
        ) {
            // multiselect doesn't actually work yet,
            // normalize falsey values
            this.internalValue = e.detail.value[0] ? e.detail.value[0] : '';
            // ignore reset of value from bubble to interop
            this._inChangeCycle = true;
            // eslint-disable-next-line @lwc/lwc/no-async-operation
            setTimeout(() => {
                this._inChangeCycle = false;
            }, 0);
        } else {
            this.internalValue = e.detail.value;
        }

        if (this.internalValue !== this.originalValue) {
            this.isDirty = true;
            if (this.serverError) {
                this.setCustomValidity();
                this.serverError = false;
            }
        } else {
            this.isDirty = false;
        }

        if (this.canBeControllingField) {
            this.dispatchControllerFieldChangeEvent(
                this.fieldName,
                this.internalValue
            );
        }
    }

    // The reason why this is separate from the handleChange method is that
    // we don't want to mark the field dirty when the field value was automatically selected by the picklist based on the available options
    // This specifically manifests itself when we initially have no value and as a result the picklist selects the 'None' option
    handlePicklistProgrammaticChange(event) {
        if (!this.ready) {
            return;
        }

        this.internalValue = event.target.value;

        this.dispatchControllerFieldChangeEvent(
            this.fieldName,
            this.internalValue
        );
        // stop and re-fire change event
        event.stopPropagation();
        this.dispatchEvent(
            new CustomEvent('change', {
                composed: true,
                bubbles: true,
                detail: {
                    value: this.internalValue,
                },
            })
        );
    }

    handleCompoundFieldChange(e) {
        const newValue = normalizeCompoundFieldValues(
            this.originalValue,
            e.detail,
            this.fieldPrefix
        );
        const countryCodeField = addPrefix(COUNTRY_CODE, this.fieldPrefix);
        // currently input-address return 'province' as both stateCode and state. Having both of these
        // set to the same value returns an API error.
        // eslint-disable-next-line no-prototype-builtins
        if (this.originalValue.hasOwnProperty(countryCodeField)) {
            delete newValue[this.fieldPrefix + 'Country'];
            delete newValue[this.fieldPrefix + 'State'];
        }

        // if the newValue is not an empty object
        // this is a dirty record
        if (!isEmptyObject(newValue)) {
            this.isDirty = true;
            // CountryCode is a controlling picklist, so we need to update the options for StateCode
            if (
                newValue[countryCodeField] !==
                this.internalValue[countryCodeField]
            ) {
                this.dispatchControllerFieldChangeEvent(
                    countryCodeField,
                    newValue[countryCodeField]
                );
            }
            const modifiedObject = Object.assign(
                {},
                this.internalValue,
                newValue
            );
            this.internalValue = modifiedObject;
            if (this.isTypeAddress) {
                this.updateAddressField(e.detail);
            }
        }
    }

    registerCheckboxDependency() {
        // no need to bother with dependency management if there are no picklists in the form.
        if (!this._picklistValues) {
            return;
        }

        const hasDependents = depUtils.hasDependents(
            this.uiField,
            this.record.objectInfo.fields,
            this._picklistValues
        );

        // register checkboxes that are part of a dependency chain
        if (hasDependents) {
            this.dispatchRegisterDependencyEvent(this.fieldName);
        }
    }

    initializePicklistsForCompoundField() {
        const compoundFields = getCompoundFields(
            this.fieldName,
            this.record.record,
            this.record.objectInfo
        );

        let compoundField = this.addressField;

        if (isPersonNameField(this.uiField)) {
            compoundField = this.nameField;
        }

        compoundFields.forEach((field) => {
            const fieldName = removePrefix(field, this.fieldPrefix);

            if (compoundField[fieldName].type === Fields.PICKLIST) {
                this.initializePicklist(field);
            }
        });
    }

    initializePicklist(fieldName) {
        if (!this._picklistValues || !this._picklistValues[fieldName]) {
            // We could be in a state where the picklist renders and registers itself *while* recordEditForm is still processing an existing wire
            // In this case, the picklist values will be available after the new wire results are passed into inputField
            console.warn(
                `Could not find picklist values for field [${fieldName}]`
            );
            return;
        }

        // should disable the picklist if the controlling field is missing
        const controllerMissing = depUtils.isControllerMissing(
            this.uiField,
            this.record.objectInfo.fields,
            this._picklistValues
        );
        if (controllerMissing) {
            // This is developer error so we should show a warning in the console without gacking.
            // When we return, the value of the picklist will be set and the option list will be
            // undefined. The picklist will render as disabled/readOnly so it will be safe to use
            // in the form.
            console.warn(
                `Field [${this.uiField.controllerName}] controls the field [${fieldName}] but was not found in the form`
            );
            return;
        }

        // state and country picklists are in a dependency chain, no need to check.
        let isInDependencyChain = false;
        if (this.isTypeAddress) {
            isInDependencyChain = true;
        } else {
            isInDependencyChain =
                this.isAnyPicklistType &&
                depUtils.isInDependencyChain(
                    this.uiField,
                    this.record.objectInfo.fields,
                    this._picklistValues
                );
        }

        if (isInDependencyChain) {
            // initializing picklists in empty state, dependency manager will later update the options.
            this.picklistOptions = this.getOptionsWithInactiveValue(
                [],
                this.internalValue
            );

            this.dispatchRegisterDependencyEvent(fieldName);
        } else {
            // regular picklist field not within a dependency chain
            this.picklistOptions = this.getOptionsWithInactiveValue(
                this._picklistValues[fieldName].values,
                this.internalValue
            );
        }
    }

    updateFieldOptions(fieldName, options) {
        if (this.isTypeAddress) {
            const field = removePrefix(fieldName, this.fieldPrefix);
            // Store the state/country options in a separate object, which will persist on record ui rewire
            this.addressOptions[field] = options;
        } else if (this.isAnyPicklistType) {
            this.picklistOptions = this.getOptionsWithInactiveValue(
                options,
                this.internalValue
            );
        }
    }

    /**
     * Check if the value exists in the picklist options, if not,
     * add the value to the options and return the new options.
     */
    getOptionsWithInactiveValue(options, value) {
        // options is not extensible, make a shallow copy
        const newOptions = options ? [...options] : [];

        if (!value) {
            return newOptions;
        }

        if (typeof value === 'string') {
            if (this.isTypeMultiPicklist) {
                value.split(';').forEach((val) => {
                    this.checkForExistingValues(newOptions, val);
                });
            } else {
                this.checkForExistingValues(newOptions, value);
            }
        }

        return newOptions;
    }

    checkForExistingValues(newOptions, val) {
        const isExistingValue = newOptions.some((option) => {
            return option.value === val;
        });

        if (!isExistingValue) {
            newOptions.unshift({ label: val, value: val });
        }
    }

    getFieldPrefix() {
        if (this.isTypeAddress) {
            // Address fields usually have a prefix, e.g. `BillingStreet` or `ShippingStreet`
            return this.fieldName.split(/Address$/)[0];
        }
        return null;
    }

    dispatchRegisterDependencyEvent(fieldName) {
        this.dispatchEvent(
            // eslint-disable-next-line lightning-global/no-custom-event-bubbling
            new CustomEvent('registerfielddependency', {
                bubbles: true,
                composed: true,
                cancelable: true,
                detail: {
                    fieldName,
                    // field-dependency-manager only needs the update method and the live value of the input-field
                    fieldElement: {
                        updateFieldOptions: this.updateFieldOptions.bind(this),
                        setFieldValue: (val) => {
                            this.value = val;
                        },
                        getFieldValue: () => {
                            return this.value;
                        },
                    },
                },
            })
        );
    }

    dispatchControllerFieldChangeEvent(fieldName, value) {
        this.dispatchEvent(
            // eslint-disable-next-line lightning-global/no-custom-event-bubbling
            new CustomEvent('updatedependentfields', {
                bubbles: true,
                composed: true,
                cancelable: true,
                detail: { fieldName, value },
            })
        );
    }

    /**
     * A boolean value that controls whether accessibility tools read empty required textboxes as invalid. Default value is false.
     * @type {boolean}
     */
    @api
    get ariaInvalid() {
        return this._ariaInvalid;
    }

    set ariaInvalid(value) {
        let _value =
            typeof value == 'undefined'
                ? undefined
                : normalizeBoolean(
                      value
                  ); /* Preserving Backward compatibility donot set any aria-invalid when not specified by user */
        this._ariaInvalid = _value;
    }

    get inputComponent() {
        let selector = null;
        if (this.isTypeName) {
            selector = LIGHTNING_INPUT_NAME;
        } else if (this.isTypeAddress) {
            selector = LIGHTNING_INPUT_ADDRESS;
        } else if (
            this.isTypeNumber ||
            this.isTypeText ||
            this.isTypeCheckbox ||
            this.isTypeEmail ||
            this.isTypeDate ||
            this.isTypeDateTime ||
            this.isTypeTime ||
            this.isTypeUnsupportedReference ||
            this.isTypeReferenceWithLightningLookupUnsupported
        ) {
            selector = LIGHTNING_INPUT;
        } else if (this.isTypeTextArea) {
            selector = LIGHTNING_TEXTAREA;
        } else if (this.isTypeRichText) {
            selector = LIGHTNING_QUILL;
        } else if (this.isTypePicklist || this.isTypeMultiPicklist) {
            selector = LIGHTNING_PICKLIST;
        } else if (this.isTypeReferenceWithLightningLookupSupported) {
            selector = LIGHTNING_LOOKUP;
        } else if (this.isTypeLocation) {
            selector = LIGHTNING_INPUT_LOCATION;
        }
        if (selector !== null) {
            return this.template.querySelector(selector);
        }
        return null;
    }
}
