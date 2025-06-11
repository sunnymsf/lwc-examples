/*
 * The name of the type of the item that represents the advanced search option.
 * @type {String}
 */
const ACTION_ADVANCED_SEARCH = 'actionAdvancedSearch';

/*
 * The name of the type of the item that represents the create new action.
 * @type {String}
 */
export const ACTION_CREATE_NEW = 'actionCreateNew';

/**
 * The attribute used to indicate the IDs of the elements that describe the object
 * @type {String}
 */
const ARIA_DESCRIBEDBY = 'aria-describedby';

/**
 * The UI API default page value.
 * @type {Number}
 */
const DEFAULT_PAGE = 1;

/**
 * The UI API default pageSize value.
 * @type {Number}
 */
const DEFAULT_PAGE_SIZE = 25;

/**
 * The add utility icon name.
 * @type {String}
 */
const ICON_ADD = 'utility:add';

/**
 * The check utility icon name.
 * @type {String}
 */
const ICON_CHECK = 'utility:check';

/**
 * The default entity icon.
 * @type {String}
 */
const ICON_DEFAULT = 'standard:default';

/**
 * The search utility icon name.
 * @type {String}
 */
const ICON_SEARCH = 'utility:search';

/**
 * The utility icon with small size.
 * @type {String}
 */
const ICON_SIZE_SMALL = 'small';

/**
 * The utility icon with extra small size.
 * Typically used with search, and add icons.
 * @type {String}
 */
const ICON_SIZE_X_SMALL = 'x-small';

/**
 * The record layout type for Full layout.
 * Used as a param value for getRecordUi wire api.
 * @type {String}
 */
const LAYOUT_TYPE_FULL = 'Full';

/**
 * The default list size
 * @type {Number}
 */
const LIST_SIZE_DEFAULT = 5;

/**
 * The list size for mobile advanced search
 * @type {Number}
 */
const LIST_SIZE_MOBILE_ADVANCED_SEARCH = 25;

/**
 * The mode of the record layout.
 * Used as a param value for getRecordUi wire api.
 * @type {String}
 */
const MODE_VIEW = 'View';

/**
 * The ailtn transaction MRU action type for advanced search.
 * @type {String}
 */
const LOG_ACTION_SEARCH_OPTION = 'SEARCH_OPTION';

/**
 * The ailtn transaction context query type for MRU.
 * @type {String}
 */
const LOG_CONTEXT_Q_TYPE_MRU = 'MRU';

/**
 * The ailtn transaction action type for create new.
 * @type {String}
 */
const LOG_ACTION_CREATE_NEW_OPTION = 'CREATE_OPTION';

/**
 * The ailtn transaction context query type for TypeAhead.
 * @type {String}
 */
const LOG_CONTEXT_Q_TYPE_TYPEAHEAD = 'Typeahead';

/**
 * The ailtn transaction event source for click interaction.
 * @type {String}
 */
const LOG_EVENT_CLICK = 'click';

/**
 * The ailtn transaction event source for pill removal.
 * @type {String}
 */
const LOG_EVENT_PILL_REMOVE = 'synthetic-pill-remove';

/**
 * The ailtn transaction name used for performance purpose.
 */
const LOG_PERF_TRANSACTION_NAME = 'search-lookup';

/**
 * The ailtn transaction scope for lookup desktop.
 * @type {String}
 */
const LOG_SCOPE_INPUT_LOOKUP_DESKTOP = 'search-input-lookup-desktop';

/**
 * The ailtn transaction scope for lookup mobile.
 * @type {String}
 */
const LOG_SCOPE_INPUT_LOOKUP_MOBILE = 'search-input-lookup-mobile';

/**
 * The ailtn transaction scope for the entiy selector for the lookup desktop.
 * @type {String}
 */
const LOG_SCOPE_ENTITY_SELECTOR = 'search-entity-selector';

/**
 * The ailtn attribute for selection origin from create new.
 * @type {String}
 */
const LOG_SELECTED_RESULT_FROM_CREATE_NEW = 'createNew';

/**
 * The ailtn attribute for selection origin from advanced search.
 * @type {String}
 */
const LOG_SELECTED_RESULT_FROM_ADVANCED_SEARCH = 'advancedSearch';

/**
 * The ailtn transaction target for lookup input.
 * @type {String}
 */
const LOG_TARGET_INPUT = 'search-input';

/**
 * The ailtn transaction target for action items like advanced search.
 * @type {String}
 */
const LOG_TARGET_LOOKUP_ACTION_OPTION = 'search-lookup-action-option';

/**
 * The ailtn transaction target for MRU record items.
 * @type {String}
 */
const LOG_TARGET_LOOKUP_SUGGESTION_OPTION = 'search-lookup-suggestion-option';

/**
 * The ailtn transaction target for the record pill.
 * @type {String}
 */
const LOG_TARGET_RECORD_PILL_ITEM = 'search-record-pill-item';

/**
 * The ailtn transaction target for the entity filter item..
 * @type {String}
 */
const LOG_TARGET_FILTER_ITEM = 'search-filter-item';

/**
 * The error status code for record wire when the record is not found.
 * @type {Number}
 */
const HTTP_STATUS_NOT_FOUND = 404;

/**
 * The error status code for record wire when the user does not have sufficient access for a record.
 * @type {Number}
 */
const HTTP_STATUS_INSUFFICIENT_ACCESS = 403;

/**
 * The combo-box action type to show record.
 * @type {String}
 */
const OPTION_TYPE_CARD = 'option-card';

/**
 * The combo-box option type to show an action.
 * @type {String}
 */
const OPTION_TYPE_INLINE = 'option-inline';

/**
 * The combo-box pill item type to show icons.
 * @type {String}
 */
const PILL_TYPE_ICON = 'icon';

/**
 * The UI API searchType value for Full Search record
 * @type {String}
 */
const SEARCH_TYPE_FULL = 'Search';

/**
 * The UI API searchType value for Recent records.
 * @type {String}
 */
const SEARCH_TYPE_RECENT = 'Recent';

/**
 * The UI API searchType value for TypeAhead records.
 * @type {String}
 */
const SEARCH_TYPE_TYPEAHEAD = 'TypeAhead';

export const CREATE_NEW_ACTION_API_NAME = 'CreateFromLookup';

export const COMMON_LOOKUP_CONSTANTS = {
    ACTION_ADVANCED_SEARCH,
    ARIA_DESCRIBEDBY,
    ICON_ADD,
    ICON_CHECK,
    ICON_DEFAULT,
    ICON_SEARCH,
    ICON_SIZE_SMALL,
    ICON_SIZE_X_SMALL,
    LIST_SIZE_DEFAULT,
    LIST_SIZE_MOBILE_ADVANCED_SEARCH,
    OPTION_TYPE_CARD,
    OPTION_TYPE_INLINE,
    PILL_TYPE_ICON,
    ACTION_CREATE_NEW,
};

export const GET_LOOKUP_RECORDS_WIRE_CONSTANTS = {
    DEFAULT_PAGE,
    DEFAULT_PAGE_SIZE,
    LAYOUT_TYPE_FULL,
    MODE_VIEW,
    SEARCH_TYPE_FULL,
    SEARCH_TYPE_RECENT,
    SEARCH_TYPE_TYPEAHEAD,
};

export const GET_RECORD_UI_WIRE_CONSTANTS = {
    HTTP_STATUS_NOT_FOUND,
    HTTP_STATUS_INSUFFICIENT_ACCESS,
};

export const LOGGING_CONSTANTS = {
    LOG_ACTION_SEARCH_OPTION,
    LOG_CONTEXT_Q_TYPE_MRU,
    LOG_ACTION_CREATE_NEW_OPTION,
    LOG_CONTEXT_Q_TYPE_TYPEAHEAD,
    LOG_EVENT_CLICK,
    LOG_EVENT_PILL_REMOVE,
    LOG_SCOPE_INPUT_LOOKUP_DESKTOP,
    LOG_SCOPE_INPUT_LOOKUP_MOBILE,
    LOG_SCOPE_ENTITY_SELECTOR,
    LOG_SELECTED_RESULT_FROM_CREATE_NEW,
    LOG_SELECTED_RESULT_FROM_ADVANCED_SEARCH,
    LOG_TARGET_INPUT,
    LOG_TARGET_LOOKUP_ACTION_OPTION,
    LOG_TARGET_LOOKUP_SUGGESTION_OPTION,
    LOG_TARGET_RECORD_PILL_ITEM,
    LOG_TARGET_FILTER_ITEM,
    LOG_PERF_TRANSACTION_NAME,
};
