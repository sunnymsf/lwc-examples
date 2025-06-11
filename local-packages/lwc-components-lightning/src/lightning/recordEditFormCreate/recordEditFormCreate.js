import { api, wire } from 'lwc';
import LightningBaseRecordForm from 'lightning/baseRecordForm';
import { getRecordCreateDefaults } from 'lightning/uiRecordApi';
import { getPicklistValuesByRecordType } from 'lightning/uiObjectInfoApi';
import {
    getObjectApiName,
    transformOptionalFields,
    getRecordTypeIdFromRecordUiCreate,
    delayedTransform,
} from 'laf/transformWire';

export default class LightningRecordEditFormCreate extends LightningBaseRecordForm {
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
        objectApiName: '$wiredObjectApiName.data',
        optionalFields: '$wiredOptionalFields.data',
    })
    getRecordCreateDefaultsConfig;

    @wire(getRecordCreateDefaults, {
        objectApiName: '$getRecordCreateDefaultsConfig.data.objectApiName',
        recordTypeId: '$recordTypeId',
        optionalFields: '$getRecordCreateDefaultsConfig.data.optionalFields',
    })
    wiredRecordUiCreate;

    @wire(getRecordCreateDefaults, {
        objectApiName: '$getRecordCreateDefaultsConfig.data.objectApiName',
        recordTypeId: '$recordTypeId',
        optionalFields: '$getRecordCreateDefaultsConfig.data.optionalFields',
    })
    wiredRecordCreateDefaults(value) {
        this.handleData(value);
    }

    @wire(getRecordTypeIdFromRecordUiCreate, {
        recordUi: '$wiredRecordUiCreate.data',
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
}
