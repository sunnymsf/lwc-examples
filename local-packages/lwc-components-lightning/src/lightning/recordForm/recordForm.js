/* eslint-disable @lwc/lwc/no-api-reassignments */

import { LightningElement, api, track, wire } from 'lwc';
import {
    convertRecordId,
    convertRecordTypeId,
    getObjectApiName,
    valueWatcher,
    transformFields,
} from 'laf/transformWire';
import {
    getFieldsForLayout,
    densityValues,
    getCompoundFields,
    compoundFieldIsUpdateable,
    compoundFieldIsCreateable,
    isCompoundField,
    isPersonAccount,
    UNSUPPORTED_REFERENCE_FIELDS,
} from 'lightning/fieldUtils';
import { normalizeString, deepCopy } from 'lightning/utilsPrivate';
import { classSet, formatLabel } from 'lightning/utils';
import labelSave from '@salesforce/label/LightningRecordForm.save';
import labelCancel from '@salesforce/label/LightningRecordForm.cancel';
import labelLoading from '@salesforce/label/LightningRecordForm.loading';
import labelEdit from '@salesforce/label/LightningRecordForm.edit';
import formFactor from '@salesforce/client/formFactor';

const EDIT_MODE = 'edit';
const VIEW_MODE = 'view';
const READ_ONLY_MODE = 'readonly';
const FORM_FACTOR_MOBILE = 'Small';

function isUnsupportedReferenceField(name) {
    return UNSUPPORTED_REFERENCE_FIELDS.indexOf(name) !== -1;
}

/**
 * Creates an editable form or display form for a record.
 */
export default class LightningRecordForm extends LightningElement {
    readOnly = false;

    _editMode = false;
    cols = 1;
    _loading = true;

    _record;
    _firstLoad = true;
    _loadError = false;
    _layout;
    _dupMapper = {};
    _mode;
    _labelSave = labelSave;
    _labelCancel = labelCancel;
    _labelLoading = labelLoading;
    _labelEdit = labelEdit;
    _loadedPending = false;
    _fieldsHandled = false;
    _isPersonAccount = false;

    _wireRecordIdRegistered = false;
    _wireRecordTypeIdRegistered = false;

    @track _density = densityValues.AUTO;

    /**
     * The ID of the record to be displayed.
     * @type {string}
     */
    @api recordId = null;

    /**
     * The API name of the object.
     * @type {string}
     * @required
     */
    @api objectApiName = null;

    /**
     * The type of layout to use to display the form fields. Possible values: Compact, Full.
     * When creating a new record, only the full layout is supported.
     * @type {string}
     */
    @api layoutType = null;

    /**
     * The ID of the record type, which is required if you created
     * multiple record types but don't have a default.
     * @type {string}
     */
    @api recordTypeId = null;

    /**
     * List of fields to be displayed. The fields display in the order you list them.
     * @type {string[]}
     */
    @api fields = [];

    set mode(val) {
        val = val.toLowerCase(); // just to make it easier for customers
        this._mode = val;
        switch (val) {
            case EDIT_MODE:
                this.readOnly = false;
                this._editMode = true;
                break;
            case VIEW_MODE:
                this.readOnly = false;
                this._editMode = false;
                break;
            case READ_ONLY_MODE:
                this.readOnly = true;
                this._editMode = false;
                break;
            default:
                this.readOnly = false;
                if (!this.recordId) {
                    this._editMode = true;
                } else {
                    this._editMode = false;
                }
        }
    }

    /**
     * Specifies the interaction and display style for the form.
     * Possible values: view, edit, readonly.
     * If a record ID is not provided, the default mode is edit, which displays a form to create new records.
     * If a record ID is provided, the default mode is view, which displays field values with edit icons on updateable fields.
     * @type {string}
     */
    @api
    get mode() {
        return this._mode;
    }

    /**
     * Sets the arrangement style of fields and labels in the form.
     * Accepted values are compact, comfy, and auto (default).
     * Use compact to display fields and their labels on the same line.
     * Use comfy to display fields below their labels.
     * Use auto to let the component dynamically set
     * the density according to the user's Display Density setting
     * and the width of the form.
     * @type {string}
     */
    @api
    get density() {
        return this._density;
    }

    set density(val) {
        this._density = normalizeString(val, {
            fallbackValue: densityValues.AUTO,
            validValues: [
                densityValues.AUTO,
                densityValues.COMPACT,
                densityValues.COMFY,
            ],
        });
    }

    @wire(convertRecordId, {
        recordId: '$recordId',
    })
    wiredRecordId;

    @wire(valueWatcher, {
        value: '$wiredRecordId.data',
    })
    handleWireRecordId({ data, error }) {
        // The wire adapter is called with undefined data and error
        // on registration for the first time, hence ignore the call
        if (!this._wireRecordIdRegistered) {
            this._wireRecordIdRegistered = true;
            return;
        }

        if (error) {
            return;
        }

        if (!data && !this._mode) {
            this._editMode = true;
        }

        // The new record could have a different recordType with a different set of fields
        this._fieldsHandled = false;
    }

    get _recordId() {
        return this.wiredRecordId.data;
    }

    @wire(getObjectApiName, {
        objectApiName: '$objectApiName',
    })
    wiredObjectApiName;

    get _objectApiName() {
        return this.wiredObjectApiName.data;
    }

    @wire(convertRecordTypeId, {
        recordTypeId: '$recordTypeId',
    })
    wiredRecordTypeId;

    @wire(valueWatcher, {
        value: '$wiredRecordTypeId.data',
    })
    handleRecordTypeIdChange({ error }) {
        // The wire adapter is called with undefined data and error
        // on registration for the first time, hence ignore the call
        if (!this._wireRecordTypeIdRegistered) {
            this._wireRecordTypeIdRegistered = true;
            return;
        }

        if (error) {
            return;
        }

        // The new record type could have a different set of fields (e.g. Business vs Person account recordTypes)
        this._fieldsHandled = false;
    }

    @wire(transformFields, {
        fields: '$fields',
    })
    wiredFields;

    set columns(val) {
        // cols must always be a positive integer
        this.cols = parseInt(val, 10);
        if (isNaN(this.cols) || this.cols < 1) {
            this.cols = 1;
        }
    }

    /**
     * Specifies the number of columns for the form.
     * @type {number}
     */
    @api
    get columns() {
        return this.cols;
    }

    /**
     * Submits the form using an array of record fields or field IDs.
     * The field ID is provisioned from @salesforce/schema/.
     * Invoke this method only after the load event.
     * @param {string[]|FieldId[]} fields - Array of record field names or field IDs.
     */
    @api
    submit(fields) {
        this.template
            .querySelector('lightning-record-edit-form')
            .submit(fields);
    }

    /*
     * Retrieves a layout from the cache. If it doesn't exist in the cache it will retrieve it from the server and put it into the cache.
     * @param objectApiName: string - The object api name of the layout to retrieve.
     * @param layoutType: string - The layout type of the layout to retrieve.
     * @param mode: string - The mode of the layout to retrieve.
     * @param recordTypeId: string - The record type id of the layout to retrieve.
     * @returns {Object} The observable used to get the value and keep watch on it for changes.
     */
    connectedCallback() {
        if (!this.recordId && !this._mode) {
            this._editMode = true;
        }
    }

    get _editable() {
        return !this._loading && !this.readOnly && !this._loadError;
    }

    get _viewMode() {
        return !this._editMode;
    }

    set _viewMode(val) {
        this._editMode = !val;
    }

    get _rows() {
        const out = [];

        // if no object info is present the data isn't loaded so lets do nothing
        if (!this._objectInfo) {
            return out;
        }
        const rowLength = this.cols;

        const fields = (
            this.layoutFields ||
            this.wiredFields.data ||
            []
        ).slice();

        let rowkey = 0;
        let thisRow = { fields: [], key: rowkey };
        while (fields.length > 0) {
            if (thisRow.fields.length < rowLength) {
                const field = fields.shift();
                if (this._objectInfo.fields && this._objectInfo.fields[field]) {
                    const compound = isCompoundField(
                        field,
                        this._objectInfo,
                        this._isPersonAccount
                    );
                    let compoundFields = [];
                    if (compound) {
                        compoundFields = getCompoundFields(
                            field,
                            this._record,
                            this._objectInfo
                        );
                    }

                    const hasFields =
                        this._objectInfo && this._objectInfo.fields;
                    // eslint stuff below is because prettier disagrees with eslint for these indents
                    const fieldUpdateable = compound
                        ? compoundFieldIsUpdateable(
                              compoundFields, // eslint-disable-line indent
                              this._record, // eslint-disable-line indent
                              this._objectInfo // eslint-disable-line indent
                          ) // eslint-disable-line indent
                        : hasFields &&
                          this._objectInfo.fields[field].updateable;
                    const fieldCreateable = compound
                        ? compoundFieldIsCreateable(
                              compoundFields, // eslint-disable-line indent
                              this._record, // eslint-disable-line indent
                              this._objectInfo // eslint-disable-line indent
                          ) // eslint-disable-line indent
                        : hasFields &&
                          this._objectInfo.fields[field].createable;
                    const shouldShowAsInputInEditMode =
                        fieldUpdateable || (!this._recordId && fieldCreateable);
                    const updateable =
                        !isUnsupportedReferenceField(field) && this._objectInfo
                            ? shouldShowAsInputInEditMode
                            : false;
                    const editable =
                        !isUnsupportedReferenceField(field) &&
                        this._editable &&
                        (hasFields && this._objectInfo.fields[field]
                            ? fieldUpdateable
                            : false);
                    const editLabel = formatLabel(this._labelEdit, field);
                    thisRow.fields.push({
                        field,
                        editable,
                        updateable,
                        editLabel,
                    });
                }
            } else {
                out.push(thisRow);
                thisRow = { fields: [], key: ++rowkey };
            }
        }
        if (thisRow.fields.length) {
            out.push(thisRow);
        }
        return out;
    }

    get computedInputClass() {
        if (this.cols === 1) {
            return 'slds-form-element_1-col';
        }
        return '';
    }

    get computedRowClass() {
        // In mobile device, we need to remove the horizontal margin
        // to avoid the unexpected horizontal scroll bar.
        return classSet('slds-grid slds-gutters_small')
            .add({
                'slds-m-horizontal_none': formFactor === FORM_FACTOR_MOBILE,
            })
            .toString();
    }

    get computedOutputClass() {
        const classnames = classSet(
            'slds-form-element_small slds-form-element_edit slds-hint-parent'
        );

        return classnames
            .add({
                'slds-form-element_1-col': this.cols === 1,
            })
            .toString();
    }

    toggleEdit(e) {
        if (e) {
            e.stopPropagation();
        }
        this._editMode = !this._editMode;
    }

    handleLoad(e) {
        e.stopPropagation();

        // guard added to make sure not to reload fields after they are populated,
        // added fields will still force update but this will re-add the layout fields
        if (!this._fieldsHandled && this.layoutType && e.detail.objectInfos) {
            const fields = getFieldsForLayout(
                e.detail,
                this._objectApiName,
                this.layoutType
            );
            this.layoutFields = Object.keys(fields);
            this._fieldsHandled = true;
        }

        const record = e.detail.records
            ? e.detail.records[this._recordId]
            : e.detail.record;
        this._record = record;

        this._isPersonAccount = record ? isPersonAccount(record) : false;

        if (this._firstLoad) {
            this._loading = false;
            this._firstLoad = false;
        }

        // This timeout is so that the edit buttons
        // don't appear before the fields,
        // this tails the render if loading until later
        if (this._loadedPending) {
            // eslint-disable-next-line @lwc/lwc/no-async-operation
            setTimeout(() => {
                this._loading = false;
                this._loadedPending = false;
            }, 0);
        }
        this._objectInfo = deepCopy(e.detail.objectInfos[this._objectApiName]);
        this.dispatchEvent(
            new CustomEvent('load', {
                detail: e.detail,
            })
        );
    }

    handleError(e) {
        e.stopPropagation();
        this._loading = false;
        if (this._firstLoad) {
            this._loadError = true;
        }
        this.dispatchEvent(
            new CustomEvent('error', {
                detail: e.detail,
            })
        );
    }

    handleSubmit(e) {
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        setTimeout(() => {
            // The user may have canceled the submit.
            // For example to do some validation prior to submitting the form. See W-5472812
            this._loading = !e.defaultPrevented;
        }, 0);
    }

    clearForm() {
        const inputFields = this.template.querySelectorAll(
            'lightning-input-field'
        );
        if (inputFields) {
            inputFields.forEach((field) => {
                field.reset();
            });
        }
    }

    handleCancel(e) {
        if (this._recordId) {
            this.toggleEdit(e);
        } else {
            this.clearForm();
        }

        // clear any existing errors
        this.template.querySelector('lightning-messages').setError(null);

        this.dispatchEvent(new CustomEvent('cancel'));
    }

    handleSuccess(e) {
        e.stopPropagation();
        this._loadedPending = true;
        this._editMode = false;
        this.recordId = e.detail.id;
        this.dispatchEvent(
            new CustomEvent('success', {
                detail: e.detail,
            })
        );
    }
}
