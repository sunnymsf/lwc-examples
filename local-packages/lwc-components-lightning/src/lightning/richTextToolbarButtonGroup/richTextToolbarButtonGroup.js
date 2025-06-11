import { api } from 'lwc';
import LightningShadowBaseClass from 'lightning/shadowBaseClassPrivate';
import { BUTTON_GROUP_ORDER } from 'lightning/utilsPrivate';

/**
 * Creates a custom button group in lightning-input-rich-text.
 * @slot default Placeholder for custom buttons.
 */
export default class LightningRichTextToolbarGroup extends LightningShadowBaseClass {
    /**
     * Describes the custom button category to assistive technologies.
     */
    @api ariaLabel;

    /**
     * Set order on buttons for styling purposes
     * The buttons in turn set classes which apply
     * styling based on their position
     */
    handleSlotChange() {
        const slotElements = this.template
            .querySelector('slot')
            .assignedNodes();
        const numberOfSlotItems = slotElements.length;

        if (numberOfSlotItems === 1) {
            slotElements[0].groupOrder = BUTTON_GROUP_ORDER.ONLY;
        } else if (numberOfSlotItems > 1) {
            for (let i = 0; i < numberOfSlotItems; i++) {
                if (i === 0) {
                    slotElements[i].groupOrder = BUTTON_GROUP_ORDER.FIRST;
                } else if (i === numberOfSlotItems - 1) {
                    slotElements[i].groupOrder = BUTTON_GROUP_ORDER.LAST;
                } else {
                    slotElements[i].groupOrder = BUTTON_GROUP_ORDER.MIDDLE;
                }
            }
        }
    }
}
