/*
 * The name of the type of the item that represents the create new action.
 * @type {String}
 */
export const ACTION_CREATE_NEW = 'actionCreateNew';

/*
 * GroupId used during advanced search.
 * The groupId indicates the group to which advancedSearch component belongs.
 * Typically only components with identical groupId values will interact.
 * @type {String}
 */
export const ADVANCED_SEARCH_GROUP_ID = 'LOOKUP';

/*
 * The max number of values a user can select in advanced search.
 * @type {Number}
 */
export const ADVANCED_SEARCH_MAX_VALUES = 1;

/**
 * The max length for combobox input.
 * @type {Number}
 */
export const INPUT_MAX_LENGTH = 255;

/**
 * The layout type for record-ui wire request.
 * @type {String}
 */
export const LAYOUT_TYPE_FULL = 'Full';

/**
 * The lightning combobox component name.
 * @type {String}
 */
export const LIGHTNING_COMBOBOX = 'lightning-grouped-combobox';

/**
 * The mode view for record-ui wire request.
 * @type {String}
 */
export const MODE_VIEW = 'View';

/**
 * Possible value for "show-create-new" in addition to true/false.
 * It hides "create new" in dropdown but shows it in advanced.
 * @type {String}
 */
export const SHOW_CREATE_NEW_IN_ADVANCED_ONLY = 'advanced-only';
