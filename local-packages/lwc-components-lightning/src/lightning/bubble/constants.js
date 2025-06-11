import { SIZE_OPTIONS, ALIGNMENT_OPTIONS } from 'lightning/popoverUtils';

/**
 * {object} Maps the bubble width to the slds class.
 */
export const SIZE_TO_SLDS_CLASS_MAP = {
    [SIZE_OPTIONS.SMALL]: 'slds-popover_small',
    [SIZE_OPTIONS.MEDIUM]: 'slds-popover_medium',
    [SIZE_OPTIONS.LARGE]: 'slds-popover_large',
    [SIZE_OPTIONS.FULL]: 'slds-popover_full-width',
};

/**
 * {object} Supported nubbin positions.
 */
export const BUBBLE_ALIGNMENT_OPTIONS = {
    ...ALIGNMENT_OPTIONS,
    NONE: 'none',
};

/**
 * {object} Maps the nubbin alignment to the css classes.
 */
export const ALIGNMENT_TO_CSS_CLASS_MAP = {
    [BUBBLE_ALIGNMENT_OPTIONS.TOP_LEFT]:
        'slds-nubbin_top-left left-nubbin-offset-override',
    [BUBBLE_ALIGNMENT_OPTIONS.TOP]: 'slds-nubbin_top',
    [BUBBLE_ALIGNMENT_OPTIONS.TOP_CENTER]: 'slds-nubbin_top',
    [BUBBLE_ALIGNMENT_OPTIONS.TOP_RIGHT]:
        'slds-nubbin_top-right right-nubbin-offset-override',
    [BUBBLE_ALIGNMENT_OPTIONS.RIGHT_TOP]:
        'slds-nubbin_right-top top-nubbin-offset-override',
    [BUBBLE_ALIGNMENT_OPTIONS.RIGHT]: 'slds-nubbin_right',
    [BUBBLE_ALIGNMENT_OPTIONS.RIGHT_CENTER]: 'slds-nubbin_right',
    [BUBBLE_ALIGNMENT_OPTIONS.RIGHT_BOTTOM]:
        'slds-nubbin_right-bottom bottom-nubbin-offset-override',
    [BUBBLE_ALIGNMENT_OPTIONS.BOTTOM_RIGHT]:
        'slds-nubbin_bottom-right right-nubbin-offset-override',
    [BUBBLE_ALIGNMENT_OPTIONS.BOTTOM]: 'slds-nubbin_bottom',
    [BUBBLE_ALIGNMENT_OPTIONS.BOTTOM_CENTER]: 'slds-nubbin_bottom',
    [BUBBLE_ALIGNMENT_OPTIONS.BOTTOM_LEFT]:
        'slds-nubbin_bottom-left left-nubbin-offset-override',
    [BUBBLE_ALIGNMENT_OPTIONS.LEFT_BOTTOM]:
        'slds-nubbin_left-bottom bottom-nubbin-offset-override',
    [BUBBLE_ALIGNMENT_OPTIONS.LEFT]: 'slds-nubbin_left',
    [BUBBLE_ALIGNMENT_OPTIONS.LEFT_CENTER]: 'slds-nubbin_left',
    [BUBBLE_ALIGNMENT_OPTIONS.LEFT_TOP]:
        'slds-nubbin_left-top top-nubbin-offset-override',
};
