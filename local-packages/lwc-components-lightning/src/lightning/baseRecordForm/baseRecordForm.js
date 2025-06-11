/* eslint-disable @lwc/lwc/no-api-reassignments */

import labelApiNameMismatch from '@salesforce/label/LightningRecordEditForm.apiNameMismatch';
import { LightningElement, api, track } from 'lwc';
import {
    createOrSaveRecord,
    getFormValues,
    createErrorEvent,
    filterByPicklistsInForm,
    validateForm,
} from 'lightning/recordEditUtils';
import {
    densityValues,
    labelAlignValues,
    getFieldsForLayout,
    getMissingFields,
} from 'lightning/fieldUtils';
import {
    doNormalization,
    resetResizeObserver,
    setLabelAlignment,
    disconnectResizeObserver,
} from 'lightning/formDensityUtilsPrivate';
import { debounce } from 'lightning/inputUtils';
import { deepCopy } from 'lightning/utilsPrivate';

import { DependencyManager } from 'lightning/fieldDependencyManager';

/**
 * Represents a record edit layout that displays one or more fields, provided by lightning-input-field.
 * @slot default Placeholder for form components like lightning-messages, lightning-button, lightning-input-field and lightning-output-field.
 * Use lightning-input-field to display an editable field.
 */
export default class LightningBaseRecordForm extends LightningElement {
    /**
     * Reserved for internal use. Names of the fields to include in the form.
     * @type {string[]}
     */
    @api fieldNames;

    /**
     * A CSS class for the form element.
     * @type {string}
     */
    @api formClass;

    _pendingAction = false;
    _rendered = false;
    _pendingError;
    _inServerErrorState = false;

    _density = densityValues.AUTO;
    _fieldLabelAlignment = labelAlignValues.HORIZONTAL;
    _initialRender = true;

    @track recordUi;

    get _objectApiName() {
        return this.wiredObjectApiName.data;
    }

    get _recordId() {
        if (this.wiredRecordId) {
            return this.wiredRecordId.data;
        }
        return null;
    }

    get _layoutType() {
        if (this.wiredLayoutType) {
            return this.wiredLayoutType.data;
        }
        return null;
    }

    get createMode() {
        return !this._recordId;
    }

    constructor() {
        super();

        this._formLayoutInterface = this.formLayoutInterface();
    }

    disconnectedCallback() {
        disconnectResizeObserver(this);
    }

    renderedCallback() {
        this._rendered = true;
        if (this._pendingError) {
            this.handleErrors(this._pendingError);
        }
        if (this._initialRender) {
            setLabelAlignment(this._formLayoutInterface);
            resetResizeObserver(
                this,
                this._formLayoutInterface,
                this._initialRender
            );
        }

        this._initialRender = false;
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
        doNormalization(val, this._formLayoutInterface);
        if (!this._initialRender) {
            resetResizeObserver(this, this._formLayoutInterface);
        }
    }

    handleChange() {
        if (!this._inServerErrorState) {
            return;
        }

        this.inServerErrorState = false;
        const inputComponents = this.getInputFieldComponents();

        inputComponents.forEach((field) => {
            field.setErrors({});
        });
    }

    handleData({ error, data }) {
        if (error) {
            this.handleErrors(error);
            return;
        } else if (!data) {
            return;
        }

        this.wiredRecord = data;

        // Retrieve record from record ui
        let record;
        if (this._recordId && data.records && data.records[this._recordId]) {
            record = data.records[this._recordId];
        } else if (data.record) {
            record = data.record;
        } else {
            // It's possible that the record form is in a transitional state where
            // we can neither get the record ui for create or edit mode. In that
            // case, ignore the data.
            return;
        }

        if (record.apiName !== this._objectApiName) {
            const message = labelApiNameMismatch
                .replace('{0}', this._objectApiName)
                .replace('{1}', record.apiName);
            this.handleErrors({ message });
            return;
        }

        const layoutFieldData = getFieldsForLayout(
            data,
            this._objectApiName,
            this._layoutType
        );
        const viewData = {
            record,
            objectInfo: data.objectInfos[this._objectApiName],
            objectInfos: data.objectInfos,
            createMode: !this._recordId,
            labelAlignment: this._fieldLabelAlignment,
            layoutFieldData,
        };

        this.recordUi = viewData;
        this.record = record;
        this.getInputAndOutputComponents().forEach((field) => {
            field.wireRecordUi(viewData);
        });

        if (this._picklistValues) {
            this.handlePicklistValues(this._picklistValues);
        }

        this.fetchFields(
            getMissingFields(
                viewData.objectInfo,
                viewData.record,
                this.getFields()
            )
        );
    }

    /**
     * Fetch the input fields by mutating optional fields
     * @param {string[]} fields - List of field names
     */
    fetchFields(fields) {
        const fieldsToFetch = fields.filter((fieldName) => {
            // dedupe optional fields
            return !this.optionalFields.includes(fieldName);
        });

        if (fieldsToFetch.length) {
            this.optionalFields = this.optionalFields.concat(fieldsToFetch);
        }
    }

    handlePicklistValues(value) {
        this._picklistValues = value;
        const { error, data } = value;

        if (error) {
            this.handleErrors(error);
        }

        if (
            !data ||
            !this.recordUi ||
            this._objectApiName !== this.record.apiName
        ) {
            return;
        }

        const filteredPicklistValues = filterByPicklistsInForm(
            this.recordUi.objectInfo,
            data.picklistFieldValues || data,
            this.getFullFieldNames()
        );
        this._picklistValuesInForm = filteredPicklistValues;

        this.initDependencyManager({
            dependentFields: this.recordUi.objectInfo.dependentFields,
            picklistValues: filteredPicklistValues,
        });
        this.getInputAndOutputComponents().forEach((field) => {
            field.wirePicklistValues(filteredPicklistValues);
        });

        // picklist values are loaded at the end, after record data are wired
        this.dispatchLoadEvent();
    }

    validateForm() {
        const cmps = this.getInputFieldComponents();
        return validateForm(cmps);
    }

    /**
     * Submits the form using an array of record fields or field IDs.
     * The field ID is provisioned from @salesforce/schema/.
     * Invoke this method only after the load event.
     * @param {string[]|FieldId[]} fields - Array of record field names or field IDs.
     */
    @api
    submit(fields) {
        this.doSubmit(fields).catch((err) => {
            this.handleErrors(err);
        });
    }

    doSubmit(fields) {
        return new Promise((resolve, reject) => {
            this._pendingAction = true;
            const originalRecord = this.createMode
                ? null
                : this.recordUi.record;
            const newRecord = {
                fields: fields ? fields : this.getFormValues(),
                // api gets mad if you have an api name for edit, don't have one for create
                apiName: this.createMode ? this._objectApiName : null,
            };

            // add recordTypeId if it is provided
            if (this.recordTypeId) {
                newRecord.fields.RecordTypeId = this.recordTypeId;
            }

            createOrSaveRecord(
                newRecord,
                originalRecord,
                this.recordUi.objectInfo
            ).then(
                (savedRecord) => {
                    this._pendingAction = false;
                    const lightningMessages =
                        this.querySelector('lightning-messages');
                    if (lightningMessages) {
                        lightningMessages.setError(null);
                    }

                    // Clean dirty states after successful save
                    this.cleanFields();

                    // the change event needs to propagate to elements outside of the light-DOM, hence making it composed.
                    this.dispatchEvent(
                        // eslint-disable-next-line lightning-global/no-custom-event-bubbling
                        new CustomEvent('success', {
                            composed: true,
                            bubbles: true,
                            detail: savedRecord,
                        })
                    );
                    resolve();
                },
                (err) => {
                    this._pendingAction = false;
                    reject(err);
                }
            );
        });
    }

    getFormValues() {
        return getFormValues(this.getInputFieldComponents());
    }

    handleError(err) {
        err.stopPropagation();
        this.handleErrors(err.detail.error);
    }

    handleErrors(error) {
        if (!error) {
            return;
        }
        const messages = this.querySelector('lightning-messages');
        const err = deepCopy(error);
        // error arrived before render so we'll have to handle it later
        if (!this._rendered) {
            this._pendingError = err;
            return;
        }
        this._pendingError = null;
        const inputComponents = this.getInputFieldComponents();
        if (err.body && err.body.output && err.body.output.fieldErrors) {
            this._inServerErrorState = true;
            const fieldNames = inputComponents.map((field) => {
                return field.fieldName;
            });
            Object.keys(err.body.output.fieldErrors).forEach((field) => {
                if (fieldNames.indexOf(field) === -1) {
                    // field error on missing field!
                    err.body.detail =
                        err.body.output.fieldErrors[field][0].message;
                }
            });
        }
        if (messages) {
            messages.setError(err);
        }

        inputComponents.forEach((field) => {
            field.setErrors(err);
        });

        this.dispatchEvent(createErrorEvent(err));
    }

    dispatchLoadEvent() {
        this.dispatchEvent(
            new CustomEvent('load', {
                detail: {
                    ...this.wiredRecord,
                    picklistValues: this._picklistValuesInForm,
                },
            })
        );
    }

    // don't rewire all the fields each time a new field is registered
    rewireData = debounce(() => {
        this.handleData({ data: this.wiredRecord });
    }, 0);

    handleRegister() {
        this.fetchFields(this.getFields());

        if (!this.wiredRecord) {
            return;
        }

        this.rewireData();
    }

    registerDependentField(e) {
        e.stopPropagation();

        if (this._depManager) {
            const { fieldName, fieldElement } = e.detail;
            this._depManager.registerField({ fieldName, fieldElement });
        }
    }

    updateDependentFields(e) {
        e.stopPropagation();

        if (this._depManager) {
            this._depManager.handleFieldValueChange(
                e.detail.fieldName,
                e.detail.value
            );
        }
    }

    handleSubmit(e) {
        // This is a workaround for a firefox bug where a click event may end up
        // having 'composed' set to false resulting in an empty target
        // (a repro involves clicking on the year select of the datepicker)
        const eventHasNoTarget = e.target === undefined || e.target === null;
        // submit buttons can't work in slots,
        // so we listen for clicks on submit buttons
        // TODO discuss with A11Y team
        if (eventHasNoTarget || e.target.type !== 'submit') {
            return;
        }

        e.preventDefault();
        e.stopPropagation();

        // Skip submit if record ui is not loaded
        if (!this.recordUi) {
            return;
        }

        if (!this.validateForm()) {
            // trigger native validation popups
            const form = this.template.querySelector('form');
            // IE 11 does not support this method, but
            // also has no native popups, so this has no visible impact
            if (form.reportValidity) {
                form.reportValidity();
            }

            return;
        }

        // cleanly clone and unwrap fields
        const fields = JSON.parse(JSON.stringify(this.getFormValues()));
        // the change event needs to propagate to elements outside of the light-DOM, hence making it composed.
        // eslint-disable-next-line lightning-global/no-custom-event-bubbling
        const evt = new CustomEvent('submit', {
            composed: true,
            bubbles: true,
            cancelable: true,
            detail: { fields },
        });
        this.dispatchEvent(evt);

        // I think this should work, because events always
        // execute in the same stack, so tailing this
        // handler with setTimeout will cause it to wait until
        // the event has propogated to check for prevent default
        // there are some hacks with stopImmediatePropogation,
        // but they rely on re-firing the event, which won't work in
        // this situation
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        setTimeout(() => {
            if (this._pendingAction) {
                return;
            }
            if (evt.defaultPrevented) {
                return;
            }

            this._pendingAction = true;
            this.doSubmit().catch((err) => {
                this.handleErrors(err);
            });
        }, 0);
    }

    getInputFieldComponents() {
        return [...this.querySelectorAll('lightning-input-field')];
    }

    getInputAndOutputComponents() {
        return [
            ...this.querySelectorAll(
                'lightning-input-field,lightning-output-field'
            ),
        ];
    }

    getFields() {
        return this.getInputAndOutputComponents().map((field) => {
            return field.fieldName;
        });
    }

    getFullFieldNames() {
        const objectApiName = this.recordUi.objectInfo.apiName;
        return this.getFields().map(
            (fieldName) => `${objectApiName}.${fieldName}`
        );
    }

    initDependencyManager(dependencyInfo) {
        if (!this._depManager) {
            this._depManager = new DependencyManager(dependencyInfo);
        } else {
            this._depManager.registerDependencyInfo(dependencyInfo);
        }
    }

    formLayoutInterface() {
        const that = this;
        return {
            getDensityPrivate() {
                return that._density;
            },
            setDensityPrivate(value) {
                that._density = value;
            },
            getDensity() {
                return that.density;
            },
            getLabelAlignmentPrivate() {
                return that._fieldLabelAlignment;
            },
            getContainerElement() {
                return that.template.querySelector('form');
            },
            getInputOutputFields() {
                return that.getInputAndOutputComponents();
            },
            setLabelAlignmentPrivate(value) {
                that._fieldLabelAlignment = value;
            },
            getRecordUi() {
                return that.recordUi;
            },
            getResizeObserverCallback(callback) {
                return () => {
                    callback(that._formLayoutInterface);
                };
            },
        };
    }

    /**
     * Clean field dirty states
     */
    cleanFields() {
        this.getInputFieldComponents().forEach((inputField) => {
            inputField.clean();
        });
    }
}
