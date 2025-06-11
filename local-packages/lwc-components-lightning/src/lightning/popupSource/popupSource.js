import { api, track } from 'lwc';
import LightningShadowBaseClass from 'lightning/shadowBaseClassPrivate';

import {
    normalizeString,
    normalizeBoolean,
    isUndefinedOrNull,
} from 'lightning/utilsPrivate';

import { ALIGNMENT_OPTIONS, SIZE_OPTIONS } from 'lightning/popoverUtils';

import {
    EVENTS,
    ALIGNMENT_LOOKUP,
    ALIGNMENT_TO_NUBBIN_ALIGNMENT_LOOKUP,
    SELECTORS,
} from './constants';

/**
 * A popup window that uses lightning-bubble to provide nubbin alignment for the popup content. Handles positioning logic between a source element (trigger) and a popup.
 */
export default class PopupSource extends LightningShadowBaseClass {
    /**
     * Opens the popup if it is closed.
     * @method
     * @param {object} options Open options.
     * @param {string} options.alignment Defaults to 'bottom'. The alignment of the popup.
     * @param {string} options.size Defaults to 'medium'. The size of the popup.
     * @param {boolean} options.autoFlip Defaults to true. True if the popup should enable the auto flip feature, else false.
     * @returns {void}
     */
    @api
    open(options = {}) {
        if (this._isOpen) {
            // Noop when already open.
            return;
        }

        this._size = normalizeString(options.size, {
            fallbackValue: SIZE_OPTIONS.MEDIUM,
            validValues: Object.values(SIZE_OPTIONS),
        });

        this._alignment = normalizeString(options.alignment, {
            fallbackValue: ALIGNMENT_OPTIONS.BOTTOM,
            validValues: Object.values(ALIGNMENT_OPTIONS),
        });

        const autoFlip = isUndefinedOrNull(options.autoFlip)
            ? true
            : normalizeBoolean(options.autoFlip);

        this._alignmentOptions = {
            ...this.getPopupAlignmentOptionsByAlignment(this._alignment),
            autoFlip,
        };
        this._nubbinAlignment = this.getPopupNubbinAlignmentByAlignment(
            this._alignment
        );

        const referenceElement = this.template.querySelector(SELECTORS.SOURCE);
        this.popup.show(referenceElement, this._alignmentOptions);
        this.dispatchEvent(new CustomEvent(EVENTS.OPEN));
        this._isOpen = true;
    }

    /**
     * Closes the popup if it is open.
     * @method
     * @returns {void}
     */
    @api
    close() {
        this._isOpen = false;
        if (this.popup) {
            this.popup.close();
        }

        this.dispatchEvent(new CustomEvent(EVENTS.CLOSE));
    }

    /**
     * @returns {boolean} True if the popup is open, else false.
     */
    @api
    get isOpen() {
        return this._isOpen;
    }

    /**
     * @returns {HTMLElement} The lightning-popup component.
     */
    get popup() {
        return this.template.querySelector('lightning-popup');
    }

    /**
     * {string} The size of the lightning-bubble.
     */
    @track _size = null;

    /**
     * {string} See the alignment attribute. This stores the originally requested alignment.
     */
    _alignment = null;

    /**
     * {object} Calculated alignment config based on the alignment.
     */
    _alignmentOptions = null;

    /**
     * {string} Calculated nubbin alignment calculated based off of our own alignment.
     */
    @track _nubbinAlignment = null;

    /**
     * {boolean} True when the popup is open, else false.
     */
    _isOpen = false;

    /**
     * Handles the alignmentupdate event from lightning-popup. The popup may have changed the alignment config for the popup
     * if the positioning logic determined that it would not fit at the requested alignment. It may have changed the horizontal or
     * vertical properties. We need to update the alignment and alignment config based upon what happened. This handler is called
     * whether autoFlip is set to true or false.
     * @returns {void}
     */
    handleAlignmentUpdate(event) {
        const horizontal =
            event.target.alignment.horizontal !== 'center'
                ? event.target.alignment.horizontal
                : '';
        const vertical =
            event.target.alignment.vertical !== 'center'
                ? event.target.alignment.vertical
                : '';
        if (
            [
                ALIGNMENT_OPTIONS.TOP_LEFT,
                ALIGNMENT_OPTIONS.TOP,
                ALIGNMENT_OPTIONS.TOP_RIGHT,
                ALIGNMENT_OPTIONS.BOTTOM_LEFT,
                ALIGNMENT_OPTIONS.BOTTOM,
                ALIGNMENT_OPTIONS.BOTTOM_RIGHT,
            ].includes(this._alignment)
        ) {
            // If it is aligned against the top or bottom as the primary axis, then just reverse components of the alignment.
            this._nubbinAlignment = `${vertical} ${horizontal}`.trim();
        } else {
            this._nubbinAlignment = `${horizontal} ${vertical}`.trim();
        }
    }

    /**
     * Ensures emitting the close event even if the popup closes itself due to
     * some implicit/internal behavior.
     */
    handleClose() {
        if (this._isOpen) {
            // We get into this state when ESC is pressed while the
            // popup has focus and as a result closes itself
            this._isOpen = false;
            this.dispatchEvent(new CustomEvent(EVENTS.CLOSE));
        }
    }

    /**
     * Cancels the default behavior for the clickout event from popup (close the popup).
     */
    handleClickOut(event) {
        event.preventDefault();
        this.dispatchEvent(new CustomEvent(EVENTS.CLICK_OUT));
    }

    /**
     * Returns the alignmentOptions for the given alignment.
     * @param {string} alignment The simple alignment for lookup.
     * @returns {object} See description.
     */
    getPopupAlignmentOptionsByAlignment(alignment) {
        return ALIGNMENT_LOOKUP[alignment];
    }

    /**
     * Returns the nubbinAlignment for the given alignment.
     * @param {string} alignment The simple alignment for lookup.
     * @returns {string} See description.
     */
    getPopupNubbinAlignmentByAlignment(alignment) {
        return ALIGNMENT_TO_NUBBIN_ALIGNMENT_LOOKUP[alignment];
    }
}
