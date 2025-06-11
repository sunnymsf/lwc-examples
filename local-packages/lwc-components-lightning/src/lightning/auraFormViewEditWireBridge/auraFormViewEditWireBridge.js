import { getRecordUi, getRecordCreateDefaults } from 'lightning/uiRecordApi';
import { getPicklistValuesByRecordType } from 'lightning/uiObjectInfoApi';
import { api, wire, LightningElement } from 'lwc';

export default class AuraFormViewEditWireBridge extends LightningElement {
    @api objectApiName;
    @api recordIds;
    @api recordTypeId;
    @api optionalFields;
    @api picklistApiName;
    @api picklistRecordTypeId;

    _modes;

    @api
    get recordMode() {
        return this._modes;
    }

    set recordMode(mode) {
        this._modes = [mode];
    }

    @wire(getRecordUi, {
        recordIds: '$recordIds',
        layoutTypes: ['Full'],
        modes: '$_modes',
        optionalFields: '$optionalFields',
    })
    wiredRecordUi(value) {
        this._dispatchEventWithData('getrecord', value);
    }

    @wire(getRecordCreateDefaults, {
        objectApiName: '$objectApiName',
        recordTypeId: '$recordTypeId',
        optionalFields: '$optionalFields',
    })
    wiredRecordCreateDefaults(value) {
        this._dispatchEventWithData('getrecordcreatedefaults', value);
    }

    @wire(getPicklistValuesByRecordType, {
        objectApiName: '$picklistApiName',
        recordTypeId: '$picklistRecordTypeId',
    })
    wiredPicklistValuesByRecordType(value) {
        this._dispatchEventWithData('getpicklistvaluesbyrecordtype', value);
    }

    _dispatchEventWithData(eventName, data) {
        if (!data.data && !data.error) {
            // Don't dispatch if no error and no data
            return;
        }
        // eslint-disable-next-line lightning-global/no-custom-event-identifier-arguments
        const customEvent = new CustomEvent(eventName, {
            detail: data,
        });
        this.dispatchEvent(customEvent);
    }
}
