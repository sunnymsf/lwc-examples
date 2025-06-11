import { ALIGNMENT_OPTIONS } from 'lightning/popoverUtils';

/**
 * {object} Public events.
 */
export const EVENTS = {
    CLOSE: 'close',
    OPEN: 'open',
    CLICK_OUT: 'clickout',
};

/**
 * {object} Selectors for the template.
 */
export const SELECTORS = {
    SOURCE: 'div',
};

/**
 * {number} Padding moves the entire popup by the specified amount in the primary axis (rems).
 *      This value provides a little space between the elements so they aren't touching. It
 *      is used in the alignemntOptions passed into popup so that the popover is correctly
 *      positioned with respect to the reference element.
 */
const PADDING = 1.2;

/**
 * {number} Offset moves the entire popup by the specified amount in the secondary axis (rems). This is necessary so that the nubbin
 *      and panel will still point at the reference element when positioning it near a corner.
 */
const OFFSET = 0;

/**
 * {object} A lookup dictionary from the simple alignment to the popup alignmentOptions.
 */
export const ALIGNMENT_LOOKUP = {
    [ALIGNMENT_OPTIONS.TOP_LEFT]: {
        reference: {
            vertical: 'top',
            horizontal: 'left',
        },
        popup: {
            vertical: 'bottom',
            horizontal: 'left',
        },
        padding: PADDING,
        offset: -OFFSET,
    },
    [ALIGNMENT_OPTIONS.TOP]: {
        reference: {
            vertical: 'top',
            horizontal: 'center',
        },
        popup: {
            vertical: 'bottom',
            horizontal: 'center',
        },
        padding: PADDING,
        offset: 0,
    },
    [ALIGNMENT_OPTIONS.TOP_RIGHT]: {
        reference: {
            vertical: 'top',
            horizontal: 'right',
        },
        popup: {
            vertical: 'bottom',
            horizontal: 'right',
        },
        padding: PADDING,
        offset: -OFFSET,
    },
    [ALIGNMENT_OPTIONS.RIGHT_TOP]: {
        reference: {
            vertical: 'top',
            horizontal: 'right',
        },
        popup: {
            vertical: 'top',
            horizontal: 'left',
        },
        padding: PADDING,
        offset: OFFSET,
    },
    [ALIGNMENT_OPTIONS.RIGHT]: {
        reference: {
            vertical: 'center',
            horizontal: 'right',
        },
        popup: {
            vertical: 'center',
            horizontal: 'left',
        },
        padding: PADDING,
        offset: 0,
    },
    [ALIGNMENT_OPTIONS.RIGHT_BOTTOM]: {
        reference: {
            vertical: 'bottom',
            horizontal: 'right',
        },
        popup: {
            vertical: 'bottom',
            horizontal: 'left',
        },
        padding: PADDING,
        offset: OFFSET,
    },
    [ALIGNMENT_OPTIONS.BOTTOM_RIGHT]: {
        reference: {
            vertical: 'bottom',
            horizontal: 'right',
        },
        popup: {
            vertical: 'top',
            horizontal: 'right',
        },
        padding: -PADDING,
        offset: -OFFSET,
    },
    [ALIGNMENT_OPTIONS.BOTTOM]: {
        reference: {
            vertical: 'bottom',
            horizontal: 'center',
        },
        popup: {
            vertical: 'top',
            horizontal: 'center',
        },
        padding: -PADDING,
        offset: 0,
    },
    [ALIGNMENT_OPTIONS.BOTTOM_LEFT]: {
        reference: {
            vertical: 'bottom',
            horizontal: 'left',
        },
        popup: {
            vertical: 'top',
            horizontal: 'left',
        },
        padding: -PADDING,
        offset: -OFFSET,
    },
    [ALIGNMENT_OPTIONS.LEFT_BOTTOM]: {
        reference: {
            vertical: 'bottom',
            horizontal: 'left',
        },
        popup: {
            vertical: 'bottom',
            horizontal: 'right',
        },
        padding: -PADDING,
        offset: OFFSET,
    },
    [ALIGNMENT_OPTIONS.LEFT]: {
        reference: {
            vertical: 'center',
            horizontal: 'left',
        },
        popup: {
            vertical: 'center',
            horizontal: 'right',
        },
        padding: -PADDING,
        offset: 0,
    },
    [ALIGNMENT_OPTIONS.LEFT_TOP]: {
        reference: {
            vertical: 'top',
            horizontal: 'left',
        },
        popup: {
            vertical: 'top',
            horizontal: 'right',
        },
        padding: -PADDING,
        offset: OFFSET,
    },
};

/**
 * {object} Maps the alignment to the nubbin alignment.
 */
export const ALIGNMENT_TO_NUBBIN_ALIGNMENT_LOOKUP = {
    [ALIGNMENT_OPTIONS.TOP_LEFT]: 'bottom left',
    [ALIGNMENT_OPTIONS.TOP]: 'bottom',
    [ALIGNMENT_OPTIONS.TOP_RIGHT]: 'bottom right',
    [ALIGNMENT_OPTIONS.RIGHT_TOP]: 'left top',
    [ALIGNMENT_OPTIONS.RIGHT]: 'left',
    [ALIGNMENT_OPTIONS.RIGHT_BOTTOM]: 'left bottom',
    [ALIGNMENT_OPTIONS.BOTTOM_LEFT]: 'top left',
    [ALIGNMENT_OPTIONS.BOTTOM]: 'top',
    [ALIGNMENT_OPTIONS.BOTTOM_RIGHT]: 'top right',
    [ALIGNMENT_OPTIONS.LEFT_TOP]: 'right top',
    [ALIGNMENT_OPTIONS.LEFT]: 'right',
    [ALIGNMENT_OPTIONS.LEFT_BOTTOM]: 'right bottom',
};
