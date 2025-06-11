/* eslint-disable @lwc/lwc/no-api-reassignments */

// TODO: Rename labels to something more generic
import labelApiNameMismatch from '@salesforce/label/LightningRecordEditForm.apiNameMismatch';
import labelInvalidId from '@salesforce/label/LightningRecordEditForm.invalidID';
import { LightningElement, api, wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import { getObjectInfo, getObjectInfos } from 'lightning/uiObjectInfoApi';
import { getLayout } from 'lightning/uiLayoutApi';
import { getLayoutUserState } from 'lightning/uiLayoutUserStateApi';
import {
    actionsIdentity,
    convertRecordId,
    getLayoutType,
    isLayoutableEntity,
    getObjectApiName,
    transformOptionalFields,
    delayedTransform,
    getRecordUiObjectApiNames,
    synthesizeGetRecordUiData,
    selectFieldsOrLayoutType,
} from 'laf/transformWire';

import {
    createErrorEvent,
    densityValues,
    labelAlignValues,
    getMissingFields,
} from 'lightning/fieldUtils';
import { debounce } from 'lightning/inputUtils';
import {
    doNormalization,
    resetResizeObserver,
    setLabelAlignment,
    disconnectResizeObserver,
} from 'lightning/formDensityUtilsPrivate';

/**
 * Represents a record view layout that displays one or more fields, provided by lightning-output-field.
 * @slot default Placeholder for lightning-output-field.
 */
export default class LightningRecordViewForm extends LightningElement {
    _rawRecordUi;
    _recordUi;

    _density = densityValues.AUTO;
    _fieldLabelAlignment = labelAlignValues.HORIZONTAL;
    _initialRender = true;

    constructor() {
        super();
        this._formLayoutInterface = this.formLayoutInterface();
    }

    disconnectedCallback() {
        disconnectResizeObserver(this);
    }

    renderedCallback() {
        if (this._initialRender) {
            setLabelAlignment(this._formLayoutInterface);
            resetResizeObserver(
                this,
                this._formLayoutInterface,
                this._initialRender
            );
        }
        this._initialRender = false;
        this.assertRequiredParameters();
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

    /**
     * The ID of the record to be displayed.
     * @type {string}
     * @required
     */
    @api recordId = null;

    /**
     * The API name of the object.
     * @type {string}
     * @required
     */
    @api objectApiName = null;

    /**
     * The optional fields of the record.
     * @type {string[]}
     */
    @api optionalFields = [];

    @wire(convertRecordId, {
        recordId: '$recordId',
    })
    wiredRecordId;

    @wire(getLayoutType, {
        layoutType: '$layoutType',
    })
    wiredLayoutType;

    @wire(getObjectApiName, {
        objectApiName: '$objectApiName',
    })
    wiredObjectApiName;

    @wire(transformOptionalFields, {
        objectApiName: '$wiredObjectApiName.data',
        optionalFields: '$optionalFields',
    })
    wiredOptionalFields;

    @wire(delayedTransform, {
        recordId: '$wiredRecordId.data',
        layoutTypes: '$wiredLayoutType.data',
        optionalFields: '$wiredOptionalFields.data',
    })
    wiredGetRecordConfig;

    @wire(selectFieldsOrLayoutType, {
        fields: '$wiredGetRecordConfig.data.optionalFields',
        layoutType: '$wiredGetRecordConfig.data.layoutTypes',
    })
    wiredSelectedFieldsOrLayoutType;

    @wire(getRecord, {
        recordId: '$wiredGetRecordConfig.data.recordId',
        optionalFields: '$wiredSelectedFieldsOrLayoutType.data.fields',
        layoutTypes: '$wiredSelectedFieldsOrLayoutType.data.layoutType',
        modes: 'View',
    })
    wiredGetRecord;

    @wire(getObjectInfo, { objectApiName: '$wiredObjectApiName.data' })
    wiredObjectInfo;

    @wire(isLayoutableEntity, { objectInfo: '$wiredObjectInfo.data' })
    wiredIsLayoutableEntity;

    // used to ensure layout calls are made with correct config
    @wire(delayedTransform, {
        record: '$wiredGetRecord.data',
        objectApiName: '$wiredObjectApiName.data',
        layoutType: '$wiredLayoutType.data',
        isLayoutable: '$wiredIsLayoutableEntity.data.layoutable',
    })
    wiredLayoutConfig;

    /* eslint-disable-next-line @lwc/lwc/no-unknown-wire-adapters */
    @wire(getLayout, {
        objectApiName: '$wiredLayoutConfig.data.objectApiName',
        recordTypeId: '$wiredLayoutConfig.data.record.recordTypeId',
        layoutType: '$wiredLayoutType.data',
        mode: 'View',
    })
    wiredLayout;

    /* eslint-disable-next-line @lwc/lwc/no-unknown-wire-adapters */
    @wire(getLayoutUserState, {
        objectApiName: '$wiredLayoutConfig.data.objectApiName',
        recordTypeId: '$wiredLayout.data.recordTypeId',
        layoutType: '$wiredLayoutType.data',
        mode: 'View',
    })
    wiredLayoutUserState;

    @wire(getRecordUiObjectApiNames, {
        objectInfo: '$wiredObjectInfo.data',
        layout: '$wiredLayout.data',
        recordFields: '$wiredGetRecord.data.fields',
    })
    wiredObjectApiNames;

    @wire(getObjectInfos, { objectApiNames: '$wiredObjectApiNames.data' })
    wiredObjectInfos;

    @wire(synthesizeGetRecordUiData, {
        record: '$wiredGetRecord.data',
        objectInfo: '$wiredObjectInfo.data',
        objectInfos: '$wiredObjectInfos.data',
        layout: '$wiredLayout.data',
        layoutUserState: '$wiredLayoutUserState.data',
    })
    wiredRecordUi;

    get _recordId() {
        return this.wiredRecordId.data;
    }

    get _objectApiName() {
        return this.wiredObjectApiName.data;
    }

    handleData({ error, data }) {
        if (error) {
            this.handleError(error);
            return;
        } else if (!data || !this._recordId) {
            return;
        }

        this._rawRecordUi = data;

        const record = data.records[this._recordId];

        // in rare cases, when rapidly switching
        // between record IDs, record-view-form can't
        // find the record in data.records
        // it hasn't returned yet from the new wire call
        if (!record) {
            return;
        }

        if (record.apiName !== this._objectApiName) {
            const message = labelApiNameMismatch
                .replace('{0}', this._objectApiName)
                .replace('{1}', record.apiName);
            this.handleError({ message });
            return;
        }
        const viewData = {
            record,
            objectInfo: data.objectInfos[record.apiName],
            labelAlignment: this._fieldLabelAlignment,
        };

        this._recordUi = viewData;
        this.wireViewData(viewData);

        this.dispatchEvent(
            new CustomEvent('load', {
                detail: data,
            })
        );

        this.fetchFields(
            getMissingFields(
                viewData.objectInfo,
                viewData.record,
                this.getFields()
            )
        );
    }

    /**
     * the actionsIdentity wire just returns the value that it is supplied
     * which provides the benefit of being able to fork the usage of a wire output
     * so that we can handle errors or do other more complex logic which is not
     * statically analyzable, but still maintain the data flow for offline otherwise
     *
     * Note that if ANY side effects of the following function calls require requesting new
     * data or re-requesting data which is requested above via mutating a wire config
     * it will NOT work offline, since these code paths can't be analyzed in priming env.
     */

    @wire(actionsIdentity, {
        response: '$wiredRecordUi',
    })
    handleRecordUiData(res) {
        // actionsIdentity just returns what is supplied, and wiredRecordUi can be undefined before
        // its assigning transform wire is invoked
        if (res.data) {
            const { response } = res.data;
            this.handleData(response);
        }
    }

    @wire(actionsIdentity, {
        response: '$wiredRecordId',
    })
    handleRecordIdError(res) {
        if (res.data) {
            const { data, error } = res.data.response;
            if (error) {
                this.handleError({ message: labelInvalidId });
            } else if (!data) {
                this._rawRecordUi = null;
                this._recordUi = null;
                this.wireViewData(null);
            }
        }
    }

    @wire(actionsIdentity, {
        response: '$wiredGetRecord',
    })
    handleRecordError(res) {
        this.handleError(res.data?.response?.error);
    }

    @wire(actionsIdentity, {
        response: '$wiredObjectInfo',
    })
    handleObjectInfoError(res) {
        this.handleError(res.data?.response?.error);
    }

    @wire(actionsIdentity, {
        response: '$wiredObjectInfos',
    })
    handleObjectInfosError(res) {
        this.handleError(res.data?.response?.error);
    }

    @wire(actionsIdentity, {
        response: '$wiredLayout',
    })
    handleLayoutError(res) {
        this.handleError(res.data?.response?.error);
    }

    @wire(actionsIdentity, {
        response: '$wiredLayoutUserState',
    })
    handleLayoutUserStateError(res) {
        this.handleError(res.data?.response?.error);
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

    handleError(error) {
        if (error) {
            this.dispatchEvent(createErrorEvent(error));
        }
    }

    // don't rewire all the fields each time a new field is registered
    rewireData = debounce(() => {
        this.handleData({ data: this._rawRecordUi });
    }, 0);

    handleRegisterOutputField() {
        // Retrieve fields to request from getRecord
        this.fetchFields(this.getFields());

        if (this._rawRecordUi) {
            this.rewireData();
        }
    }

    getFields() {
        const fields = this.getOutputFieldComponents();

        return Array.prototype.map.call(fields, (field) => {
            return field.fieldName;
        });
    }

    getOutputFieldComponents() {
        return this.querySelectorAll('lightning-output-field');
    }

    assertRequiredParameters() {
        if (!this.recordId) {
            // eslint-disable-next-line no-console
            console.warn(
                'record id is required but is currently undefined or null'
            );
        }
        if (
            !this.objectApiName ||
            !(
                typeof this.objectApiName === 'string' ||
                typeof this.objectApiName?.objectApiName === 'string'
            )
        ) {
            console.warn(
                'API name is required but is currently undefined or null'
            );
        }
    }

    wireViewData(viewData) {
        this.getOutputFieldComponents().forEach((outputField) => {
            outputField.wireRecordUi(viewData);
        });
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
                return that.template.querySelector('div');
            },
            getInputOutputFields() {
                return that.getOutputFieldComponents();
            },
            setLabelAlignmentPrivate(value) {
                that._fieldLabelAlignment = value;
            },
            getRecordUi() {
                return that._recordUi;
            },
            getResizeObserverCallback(callback) {
                return () => {
                    callback(that._formLayoutInterface);
                };
            },
        };
    }
}
