import labelInvalidId from '@salesforce/label/LightningRecordEditForm.invalidID';
import { api, wire } from 'lwc';
import LightningBaseRecordForm from 'lightning/baseRecordForm';
import { getRecord } from 'lightning/uiRecordApi';
import { getObjectInfo, getObjectInfos } from 'lightning/uiObjectInfoApi';
import { getLayout } from 'lightning/uiLayoutApi';
import { getLayoutUserState } from 'lightning/uiLayoutUserStateApi';
import { getPicklistValuesByRecordType } from 'lightning/uiObjectInfoApi';
import {
    actionsIdentity,
    convertRecordId,
    getLayoutType,
    isLayoutableEntity,
    getObjectApiName,
    transformOptionalFields,
    getRecordTypeIdFromRecordUiEdit,
    delayedTransform,
    getRecordUiObjectApiNames,
    synthesizeGetRecordUiData,
    selectFieldsOrLayoutType,
    getRelatedFields,
} from 'laf/transformWire';

export default class LightningRecordEditFormEdit extends LightningBaseRecordForm {
    /**
     * The ID of the record to be displayed.
     * @type {string}
     */
    @api recordId = null;

    /**
     * The ID of the record type, which is required if you created
     * multiple record types but don't have a default.
     * @type {string}
     */
    @api recordTypeId = null;

    /**
     * The API name of the object.
     * @type {string}
     * @required
     */
    @api objectApiName = null;

    /**
     * Reserved for internal use. The type of layout to use to display the form fields. Possible values: Compact, Full.
     * @type {string}
     */
    @api layoutType = 'Full';

    /**
     * The optional fields of the record.
     * @type {string[]}
     */
    @api optionalFields = [];

    @wire(convertRecordId, {
        recordId: '$recordId',
    })
    wiredRecordId;

    @wire(convertRecordId, {
        recordId: '$recordId',
    })
    handleRecordIdError({ error }) {
        if (error) {
            this.handleErrors({ message: labelInvalidId });
        }
    }

    @wire(getLayoutType, {
        layoutType: '$layoutType',
    })
    wiredLayoutType;

    @wire(getObjectApiName, {
        objectApiName: '$objectApiName',
    })
    wiredObjectApiName;

    @wire(delayedTransform, {
        objectApiInfo: '$wiredObjectInfo.data',
        optionalFields: '$optionalFields',
    })
    wiredGetRelatedFieldsConfig;

    @wire(getRelatedFields, {
        objectApiInfo: '$wiredGetRelatedFieldsConfig.data.objectApiInfo',
        fields: '$wiredGetRelatedFieldsConfig.data.optionalFields',
    })
    wiredGetRelatedFields;

    @wire(transformOptionalFields, {
        objectApiName: '$wiredObjectApiName.data',
        optionalFields: '$wiredGetRelatedFields.data',
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

    @wire(getRecordTypeIdFromRecordUiEdit, {
        recordId: '$wiredRecordId.data',
        recordUi: '$wiredRecordUi.data',
        recordTypeId: '$recordTypeId',
    })
    wiredRecordTypeId;

    @wire(getPicklistValuesByRecordType, {
        objectApiName: '$wiredObjectApiName.data',
        recordTypeId: '$wiredRecordTypeId.data',
    })
    wiredPicklistValues(value) {
        this.handlePicklistValues(value);
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
        response: '$wiredGetRecord',
    })
    handleRecordError(res) {
        this.handleErrors(res.data?.response?.error);
    }

    @wire(actionsIdentity, {
        response: '$wiredObjectInfo',
    })
    handleObjectInfoError(res) {
        this.handleErrors(res.data?.response?.error);
    }

    @wire(actionsIdentity, {
        response: '$wiredObjectInfos',
    })
    handleObjectInfosError(res) {
        this.handleErrors(res.data?.response?.error);
    }

    @wire(actionsIdentity, {
        response: '$wiredLayout',
    })
    handleLayoutError(res) {
        this.handleErrors(res.data?.response?.error);
    }

    @wire(actionsIdentity, {
        response: '$wiredLayoutUserState',
    })
    handleLayoutUserStateError(res) {
        this.handleErrors(res.data?.response?.error);
    }
}
