import { api } from 'lwc';
import LightningShadowBaseClass from 'lightning/shadowBaseClassPrivate';
import { classSet } from 'lightning/utils';
import { buttonGroupOrderClass } from 'lightning/utilsPrivate';

/**
 * A custom button on the lightning-input-rich-text toolbar.
 * @slot default Placeholder for items passed into a popup.
 */
export default class LightningRichTextToolbarButton extends LightningShadowBaseClass {
    /**
     * The Lightning Design System name of the icon for the custom button.
     * Names are written in the format 'utility:down' where 'utility' is the category,
     * and 'down' is the specific icon to be displayed.
     *
     * @type {String}
     */
    @api iconName;

    /**
     * The alternative text used to describe the icon. This text should describe what
     * happens when you click the button, for example 'Upload File', not what the icon looks like, 'Paperclip'.
     *
     * @type {String}
     */
    @api iconAlternativeText;

    /**
     * Specifies whether to display this button in a disabled state.
     * Disabled buttons can't be clicked. This value defaults to false.
     * @type {Boolean}
     * @default false
     */
    @api disabled = false;

    /**
     * Indicates whether the button is selected. This alters the button's
     * selected or pressed state. A selected button is displayed with a dark color.
     * @type {Boolean}
     * @default false
     */
    @api selected = false;

    /**
     * Reserved for internal use only.
     */
    @api groupOrder;

    /**
     * Displays a popup below the button. Items passed in to the default slot
     * of this component are rendered as the content of the popup.
     */
    @api
    showPopup() {
        const popup = this.template.querySelector('[data-button-popup]');
        const button = this.template.querySelector('button');
        popup.show(button, {
            reference: {
                vertical: 'bottom',
                horizontal: 'center',
            },
            popup: {
                vertical: 'top',
                horizontal: 'center',
            },
            // Negative padding increases distance between
            // reference and popup for this configuration
            padding: -0.1,
        });
    }

    /**
     * Closes the popup that was displayed below the button.
     */
    @api
    closePopup() {
        this.template.querySelector('[data-button-popup]').close();
    }

    /**
     * Sets focus on the button.
     */
    @api
    focus() {
        this.template.querySelector('button').focus();
    }

    /**
     * Simulates a click on the button.
     */
    @api
    click() {
        this.template.querySelector('button').click();
    }

    /**
     * Adds default classes that button needs
     *     - slds-button, slds-button_icon-border-filled
     * Adds classes to determine styling of the button based on its position
     *     - Needed for border radius styles
     * Adds class to reflect button's pressed state
     */
    get computedButtonClasses() {
        const classes = classSet('slds-button');
        classes.add('slds-button_icon-border-filled');
        classes.add(buttonGroupOrderClass(this.groupOrder));
        classes.add({
            'slds-is-selected': this.selected,
        });
        return classes.toString();
    }

    /**
     * Prevents propagation of the click event from the popup so it doesn't
     * bubble to the parent component. This prevents mistaking a click event
     * on the button as opposed to one from the popup.
     *
     * @param {Object} event - Click event
     */
    handlePopupClick(event) {
        event.stopPropagation();
    }

    /**
     * When user clicks out of the popup:
     * 1. Prevent default behavior - prevents closing of the popup when clicked outside
     * 2. Fire an event `popupclickout` which serves the same purpose as `clickout`
     *      a. If preventDefault is called on event, do not close popup
     *      b. If preventDefault is NOT called on event, close the popup
     *
     * @param {Object} event - clickout event from lightning-popup
     */
    handlePopupClickOut(event) {
        event.preventDefault();
        const popupClickOutEvent = new CustomEvent('popupclickout', {
            cancelable: true,
        });

        // refactor this when the following lwc issue is fixed: https://github.com/salesforce/lwc/issues/1848
        this.dispatchEvent(popupClickOutEvent);
        if (!popupClickOutEvent.defaultPrevented) {
            this.closePopup();
        }
    }

    handleButtonFocus() {
        this.dispatchEvent(new CustomEvent('focus'));
    }

    handleButtonBlur() {
        this.dispatchEvent(new CustomEvent('blur'));
    }
}
