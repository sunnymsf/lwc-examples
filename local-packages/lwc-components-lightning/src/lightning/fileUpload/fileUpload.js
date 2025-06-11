import { api, track } from 'lwc';
import { getAura } from 'lightning/auraUtils';
import LightningShadowBaseClass from 'lightning/shadowBaseClassPrivate';
import { isCSR, normalizeBoolean } from 'lightning/utilsPrivate';
import hasLwcFileUpload from '@salesforce/featureFlag/Content.org.hasLwcFileUpload';
import formFactorPropertyName from '@salesforce/client/formFactor';
import AccessCheckError from '@salesforce/label/LWCFileUpload.AccessCheckError';

/**
 * A file uploader for uploading and attaching files to records.
 */
export default class LightningFileUpload extends LightningShadowBaseClass {
    /**
     * Specifies the name of the input element.
     * @type {string}
     * @required
     */
    @api name;

    /**
     * The text label for the file uploader.
     * @type {string}
     * @required
     */
    @api label;

    /**
     * Comma-separated list of file extensions that can be uploaded
     * in the format ['.ext'], such as ['.pdf', '.jpg', '.png'].
     * @type {list}
     */
    @api accept;

    /**
     * The record Id of the record that the uploaded file is associated to.
     * @type {string}
     */
    @api
    get recordId() {
        return this._recordId;
    }
    set recordId(value) {
        this._recordId = value;
        if (!this.isValidRecordId(value)) {
            // eslint-disable-next-line no-console
            console.warn(
                `<lightning-file-upload> The recordId attribute value is invalid.`
            );
        }
    }
    @track _recordId;

    /**
     * Specifies whether this component should be displayed in a disabled state.
     * Disabled components can't be clicked. The default is false.
     * @type {boolean}
     * @default false
     */
    @api
    get disabled() {
        return this._disabled;
    }
    set disabled(value) {
        this._disabled = normalizeBoolean(value);
    }
    @track _disabled = false;

    /**
     * Specifies whether a user can upload more than one file simultaneously.
     * The default is false.
     * @type {boolean}
     * @default false
     */
    @api
    get multiple() {
        return this._multiple;
    }
    set multiple(value) {
        this._multiple = normalizeBoolean(value);
    }
    @track _multiple = false;

    /**
     * Name of a custom field on the ContentVersion object. Set its value with the file-field-value attribute.
     * @type {string}
     */
    @api fileFieldName;

    /**
     * Value to store in the custom field specified by file-field-name for the uploaded file.
     * @type {string}
     */
    @api fileFieldValue;

    /**
     * If present, the file-upload field is set to required as true
     * @type {boolean}
     * @default false
     */
    @api
    get required() {
        return this._required;
    }

    set required(value) {
        this._required = normalizeBoolean(value);
    }
    @track _required = false;

    /**
     * A Boolean value for aria-invalid.
     * @type {boolean}
     */
    @api
    get ariaInvalid() {
        return this._ariaInvalid;
    }

    set ariaInvalid(value) {
        let _value =
            typeof value == 'undefined' ? undefined : normalizeBoolean(value);
        this._ariaInvalid = _value;
    }
    @track _ariaInvalid;

    /**
     * Focuses on the lightning-input when called.
     */
    @api
    focus() {
        if (this.isConnected) {
            this.inputElement.focus();
        }
    }

    get inputComponent() {
        return isCSR ? this.template.querySelector('lightning-input') : null;
    }

    /**
     * Displays the error messages and returns false if the input is invalid.
     * If the input is valid, reportValidity() clears displayed error messages and returns true.
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

    /**
     * Sets a custom error message to be displayed when a form is submitted.
     * @param {string} message - The string that describes the error. If message is an empty string, the error message is reset.
     */
    @api
    setCustomValidity(message) {
        const input = this.inputComponent;
        if (input && input.setCustomValidity) {
            input.setCustomValidity(message ? message : '');
            input.showHelpMessageIfInvalid();
        }
    }

    connectedCallback() {
        this.connected = true;
    }

    disconnectedCallback() {
        this.connected = false;
    }

    isValidRecordId(id) {
        if (id) {
            return typeof id === 'string' && id.length;
        }
        return true;
    }

    get inputElement() {
        return isCSR ? this.template.querySelector('lightning-input') : null;
    }

    handleChange(event) {
        if (!this.isDisabled) {
            event.stopPropagation();
            this.upload(event.detail.files);
        }
    }

    upload(files) {
        if (files.length === 0) {
            return;
        }

        getAura(
            (aura) => this.auraUpload(aura, files),
            () => this.lwcUpload(files)
        );
    }

    auraUpload(aura, files) {
        aura.createComponent(
            'forceContent:fileUploadAction',
            {
                parentRecordId: this.recordId,
                fieldName: this.fileFieldName,
                fieldValue: this.fileFieldValue,
                accept: this.accept,
                disabled: this.disabled,
                multiple: this.multiple,
                onError: (error) => {
                    if (error && this.connected) {
                        this.inputElement.setCustomValidity(error);
                        this.inputElement.showHelpMessageIfInvalid();
                        this.inputElement.focus();
                    }
                },
                onUpload: (detail) => {
                    this.handleUploadCallback(detail.files);
                },
            },
            (newCmp, status) => {
                if (status === 'SUCCESS') {
                    newCmp.uploadFiles(files);
                }
            }
        );
    }

    /**
     * When aura context not available(in LWR),
     * trigger lwc file upload modal.
     * @param {*} files
     */
    lwcUpload(files) {
        if (hasLwcFileUpload) {
            import('forceContent/fileUploadModal')
                .then(({ default: FileUploadModal }) => {
                    FileUploadModal.open({
                        size:
                            formFactorPropertyName === 'Large'
                                ? 'small'
                                : 'full',
                        parentRecordId: this.recordId,
                        fieldName: this.fileFieldName,
                        fieldValue: this.fileFieldValue,
                        accept: this.accept,
                        disabled: this.disabled,
                        multiple: this.multiple,
                        files,
                    }).then((result) => {
                        if (this.connected) {
                            if (
                                result?.error &&
                                typeof result?.error === 'string'
                            ) {
                                this.inputElement.setCustomValidity(
                                    result.error
                                );
                                this.inputElement.showHelpMessageIfInvalid();
                                this.inputElement.focus();
                            } else {
                                this.handleUploadCallback(result?.files);
                            }
                        }
                    });
                })
                .catch((error) => {
                    console.error(
                        '[ERROR] Failed to load modal. Please contact your Admin. ' +
                            error
                    );
                });
        } else {
            this.inputElement.setCustomValidity(AccessCheckError);
            this.inputElement.showHelpMessageIfInvalid();
            this.inputElement.focus();
        }
    }

    get isDisabled() {
        return this.disabled || !this.isValidRecordId(this.recordId);
    }

    handleUploadCallback(files) {
        if (this.connected) {
            this.inputElement.setCustomValidity('');
            this.inputElement.showHelpMessageIfInvalid();
            this.dispatchEvent(
                new CustomEvent('uploadfinished', {
                    detail: { files },
                })
            );
            this.inputElement.focus();
        }
    }
}
