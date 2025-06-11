import {
    getElementWithFocus,
    returnFocusToElement,
} from 'lightning/focusUtils';
import { isLwcModalActive } from 'lightning/overlayManager';
import { secure } from 'lightning/overlayUtils';

const MODAL_SELECTORS = [
    'lightning-modal-header',
    'lightning-modal-body',
    'lightning-modal-footer',
    'lightning-focus-trap',
    'lightning-overlay-container',
];

export function modalFocusinEventHandler(e) {
    const { isModalClosing, lastFocusedElement } = this;
    // is current active (open) modal is lwc, for ui:Modal do nothing
    if (!isLwcModalActive() || isModalClosing) {
        return;
    }

    let isTargetRelatedToModal = null;
    if (e.target && typeof e.target.closest === 'function') {
        isTargetRelatedToModal = e.target.closest(MODAL_SELECTORS);
    } else if (
        e.relatedTarget &&
        typeof e.relatedTarget.closest === 'function'
    ) {
        isTargetRelatedToModal = e.relatedTarget.closest(MODAL_SELECTORS);
    }

    if (isTargetRelatedToModal) {
        this.lastFocusedElement = getElementWithFocus();
        this.dispatchEvent(
            new CustomEvent('privatelightningmodallastfocus', {
                composed: true,
                bubbles: true,
                detail: {
                    [secure]: true,
                    privatelightningmodallastfocus: this.lastFocusedElement,
                },
            })
        );
    } else if (lastFocusedElement) {
        // W-16372673 - Since popovers are created at the body level they steal focus outside of modal
        // in these cases the button that opened them will have ariaHasPopup defined and be ignored.
        if (!lastFocusedElement.ariaHasPopup) {
            returnFocusToElement(lastFocusedElement);
        }
    }
}
