/* eslint-disable @lwc/lwc/no-api-reassignments */

import { LightningElement, api } from 'lwc';

import { densityValues } from 'lightning/fieldUtils';

/**
 * Represents a record edit layout that displays one or more fields, provided by lightning-input-field.
 * @slot default Placeholder for form components like lightning-messages, lightning-button, lightning-input-field and lightning-output-field.
 * Use lightning-input-field to display an editable field.
 */
export default class LightningRecordEditForm extends LightningElement {
    /**
     * Reserved for internal use. Names of the fields to include in the form.
     * @type {string[]}
     */
    @api fieldNames;

    /**
     * The ID of the record type, which is required if you created
     * multiple record types but don't have a default.
     * @type {string}
     */
    @api recordTypeId = null;

    /**
     * A CSS class for the form element.
     * @type {string}
     */
    @api formClass;

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
     * Reserved for internal use. The type of layout to use to display the form fields. Possible values: Compact, Full.
     * @type {string}
     */
    @api layoutType = 'Full';

    /**
     * The optional fields of the record.
     * @type {string[]}
     */
    @api optionalFields = [];

    formDensity = densityValues.AUTO;

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
        return this.formDensity;
    }
    set density(val) {
        this.formDensity = val;
    }

    /**
     * Submits the form using an array of record fields or field IDs.
     * The field ID is provisioned from @salesforce/schema/.
     * Invoke this method only after the load event.
     * @param {string[]|FieldId[]} fields - Array of record field names or field IDs.
     */
    @api
    submit(fields) {
        this.form.submit(fields);
    }

    get form() {
        if (this.recordId) {
            return this.template.querySelector(
                'lightning-record-edit-form-edit'
            );
        }

        return this.template.querySelector('lightning-record-edit-form-create');
    }

    handleLoad(evt) {
        this.dispatchEvent(
            new CustomEvent('load', {
                detail: evt.detail,
            })
        );
    }

    handleError(evt) {
        this.dispatchEvent(
            new CustomEvent('error', {
                detail: evt.detail,
            })
        );
    }
}
