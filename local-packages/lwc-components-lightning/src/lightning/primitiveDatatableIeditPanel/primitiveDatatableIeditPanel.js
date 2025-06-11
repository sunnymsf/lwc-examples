import { LightningElement, api } from 'lwc';
import labelEdit from '@salesforce/label/LightningDatatable.edit';
import labelUpdateSelectedItems from '@salesforce/label/LightningDatatable.updateSelectedItems';
import labelCancel from '@salesforce/label/LightningDatatable.cancel';
import labelApply from '@salesforce/label/LightningDatatable.apply';
import { InteractingState } from 'lightning/inputUtils';
import { getStatCount } from 'lightning/overlayManager';
import { formatLabel } from 'lightning/utils';
import { isCSR } from 'lightning/utilsPrivate';

const i18n = {
    edit: labelEdit,
    updateSelectedItems: labelUpdateSelectedItems,
    cancel: labelCancel,
    apply: labelApply,
};

export default class PrimitiveDatatableIeditPanel extends LightningElement {
    _forceRerenderHackKey = [''];
     // utilized for scenario where datatable exists within a modal, and edit panel is used
     // to launch a modal. enables edit panel to stay in DOM, and focus to be returned to it 
    _tableInModal = false;
    /************************* PUBLIC PROPERTIES *************************/
    @api customErrorValidationMessage;
    @api visible;
    @api rowKeyValue;
    @api colKeyValue;
    @api editedValue;
    @api columnDef;
    @api isMassEditEnabled = false;
    @api numberOfSelectedRows;
    @api resolvedTypeAttributes;

    /**
     * Checked when opening an edit panel to see if it's valid
     * Logs an error if type is custom but does not have the
     * required editTemplate with [data-inputable="true"] element
     */
    @api
    get isEditableValid() {
        if (
            !this.columnDef.editableCustomType ||
            this.inputableElement.isEditableCustomValid
        ) {
            return true;
        } else if (this.columnDef.editableCustomType) {
            console.error(
                'Editable custom types must define an editTemplate that includes an element with attribute data-inputable set to "true"'
            );
        }
        return false;
    }

    /**
     * Returns whether or not the mass edit update checkbox is selected
     */
    @api
    get isMassEditChecked() {
        return this.isMassEditEnabled && this.refs.massSelectCheckbox.checked;
    }

    /**
     * Returns the value of the input in the inline edit panel
     * This is retrieved typically when processing inline edit completion
     */
    @api
    get value() {
        return this.inputableElement ? this.inputableElement.value : null;
    }

    /**
     * Returns the validity state object of the input in the inline edit panel
     */
    @api
    get validity() {
        return this.inputableElement.validity;
    }

    /************************* PUBLIC METHODS *************************/

    /**
     * Focuses on the input element in the inline edit panel
     */
    @api
    focus() {
        const elem = this.inputableElement;
        this.interactingState.enter();

        if (elem) {
            elem.focus();
        }
    }

    /**
     * Returns the <section> element which is the container of the
     * positioned inline edit panel
     */
    @api
    getPositionedElement() {
        return this.refs.section;
    }

    /************************* PRIVATE GETTERS *************************/

    get computedStyle() {
        const styleHash = {
            'z-index': 1000,
            'background-color': 'white',
            'margin-top': '1px',
        };

        styleHash.display = this.visible ? 'block' : 'none';

        return Object.keys(styleHash)
            .map((styleProp) => `${styleProp}:${styleHash[styleProp]}`)
            .join(';');
    }

    get inputableElement() {
        return this.template.querySelector('.dt-type-edit-factory');
    }

    get inputKey() {
        return this.rowKeyValue + this.colKeyValue;
    }

    get required() {
        return (
            this.columnDef.typeAttributes &&
            this.columnDef.typeAttributes.required
        );
    }

    get massEditCheckboxLabel() {
        return formatLabel(i18n.updateSelectedItems, this.numberOfSelectedRows);
    }

    get dialogAriaLabel() {
        const columnName = this.columnDef.label;
        return `${i18n.edit} ${columnName}`;
    }

    get i18n() {
        return i18n;
    }

    /************************* EVENT HANDLERS *************************/

    /**
     * Handles tabbing backwards out of the inline edit panel from the first form element.
     * If mass edit is enabled, this will set the focus on the last element in the panel - traps focus.
     * If mass edit is not enabled, it will process completion of inline edit
     */
    handleFormStartFocus() {
        this.interactingState.enter();

        if (this.isMassEditEnabled) {
            // on mass edit the panel dont loses the focus with the keyboard.
            this.focusLastElement();
        } else {
            this.triggerEditFinished({
                reason: 'tab-pressed-prev',
            });
        }
    }

    /**
     * Handles tabbing forwards out of the inline edit panel from the last form element.
     * If mass edit is enabled, this will set focus on the first element in the panel - traps focus.
     * If mass edit is not enabled, it will process the completion of inline edit
     */
    handleFormEndsFocus() {
        this.interactingState.enter();

        if (this.isMassEditEnabled) {
            // on mass edit the panel dont loses the focus with the keyboard.
            this.focus();
        } else {
            this.triggerEditFinished({
                reason: 'tab-pressed-next',
            });
        }
    }

    /**
     * This is executed when interactingState.leave is triggered
     * which happens when the inline edit panel loses focus
     */
    handlePanelLostFocus() {
        if (this.visible) {
            // In a scenario where the edit panel contains an action that opens a Modal above the datatable,
            // the edit panel should not close or be removed from the DOM, if it has lost focus to the Modal.
            // This enables the Modal to pass focus back to the correct place in the DOM after it closes.
            // TODO: Find way to know if focus is in same modal as the edit panel to avoid
            // issues if multiple modals are layered on top of each other (W-16369107)
            const isModalOpen =
                getStatCount('lwcModalCount') || getStatCount('auraModalCount');
            if (
                !this.template.activeElement &&
                (!isModalOpen || this._tableInModal)
            ) {
                this.triggerEditFinished({
                    reason: 'lost-focus',
                });
            }
        }
    }

    handleTypeElemFocus() {
        this.interactingState.enter();
    }

    handleTypeElemBlur() {
        if (this.visible && !this.template.activeElement) {
            this.interactingState.leave();
        }
    }

    handleEditFormSubmit(event) {
        event.preventDefault();
        event.stopPropagation();

        if (!this.isMassEditEnabled) {
            this.processSubmission();
        }

        return false;
    }

    /**
     * If the Escape key is pressed on the inline edit panel,
     * we prevent default action, stop propagation of the event
     * and close the inline edit panel
     *
     * @param {KeyboardEvent} event - keydown
     */
    handleCellKeydown(event) {
        const { keyCode } = event;

        if (keyCode === 27) {
            // Esc key
            event.preventDefault();
            event.stopPropagation();
            this.cancelEditing();
        }
    }

    /************************* EVENT DISPATCHERS *************************/

    /**
     * Change handler for the mass edit checkbox.
     * Dispatches the `masscheckboxchange` event along with the new checked value
     *
     * @param {CustomEvent} event - `change` event from lightning-input
     */
    handleMassCheckboxChange(event) {
        const customEvent = new CustomEvent('masscheckboxchange', {
            detail: {
                checked: event.detail.checked,
            },
        });

        this.dispatchEvent(customEvent);
    }

    /**
     * Dispatches the `ieditfinished` event with the detail object containing
     * the reason for inline edit finishing and the rowKeyValue and colKeyValue
     * with which the particular cell which was edited can be identified.
     *
     * @param {Object} detail - typically contains the reason for inline edit finishing
     */
    triggerEditFinished(detail) {
        detail.rowKeyValue = detail.rowKeyValue || this.rowKeyValue;
        detail.colKeyValue = detail.colKeyValue || this.colKeyValue;

        const event = new CustomEvent('ieditfinished', {
            detail,
        });
        this.dispatchEvent(event);
    }

    /************************* LIFECYCLE HOOKS *************************/

    connectedCallback() {
        this.interactingState = new InteractingState({
            duration: 10,
            debounceInteraction: true,
        });
        this.interactingState.onleave(() => this.handlePanelLostFocus());
        this._tableInModal = isCSR && !!this.template.host.closest(
            'lightning-modal, .uiModal'
        );
    }

    disconnectedCallback() {
        this._tableInModal = false;
    }

    /************************* HELPER FUNCTIONS *************************/

    focusLastElement() {
        this.refs.formLastElement.focus();
    }

    processSubmission() {
        if (this.validity.valid) {
            this.triggerEditFinished({ reason: 'submit-action' });
        } else {
            this.inputableElement.showHelpMessageIfInvalid();
        }
    }

    cancelEditing() {
        this.triggerEditFinished({
            reason: 'edit-canceled',
        });
    }
}
