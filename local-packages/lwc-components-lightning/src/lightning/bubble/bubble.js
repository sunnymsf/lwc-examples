import { api } from 'lwc';
import LightningShadowBaseClass from 'lightning/shadowBaseClassPrivate';
import { SIZE_OPTIONS } from 'lightning/popoverUtils';
import { classSet } from 'lightning/utils';
import { normalizeString } from 'lightning/utilsPrivate';

import {
    BUBBLE_ALIGNMENT_OPTIONS,
    ALIGNMENT_TO_CSS_CLASS_MAP,
    SIZE_TO_SLDS_CLASS_MAP,
} from './constants';

/**
 * A simple popover style container which provides a border and nubbin.
 */
export default class Bubble extends LightningShadowBaseClass {
    /**
     * {string} Can be 'small', 'medium', 'large', or 'full'
     */
    @api
    get size() {
        return this._size;
    }
    set size(value) {
        this._size = normalizeString(value, {
            fallbackValue: SIZE_OPTIONS.MEDIUM,
            validValues: Object.values(SIZE_OPTIONS),
        });
    }
    _size = SIZE_OPTIONS.MEDIUM;

    /**
     * {string} Determines where the nubbin should be positioned.
     */
    @api
    get alignment() {
        return this._alignment;
    }
    set alignment(value) {
        this._alignment = normalizeString(value, {
            fallbackValue: BUBBLE_ALIGNMENT_OPTIONS.NONE,
            validValues: Object.values(BUBBLE_ALIGNMENT_OPTIONS),
        });
    }
    _alignment = BUBBLE_ALIGNMENT_OPTIONS.NONE;

    /**
     * @returns {string} The classes for the section tag.
     */
    get computedSectionClasses() {
        const sectionClass = classSet('slds-popover');

        // Nubbin positioning.
        sectionClass.add(ALIGNMENT_TO_CSS_CLASS_MAP[this.alignment]);

        // Bubble size.
        sectionClass.add(SIZE_TO_SLDS_CLASS_MAP[this.size]);

        return sectionClass.toString();
    }
}
