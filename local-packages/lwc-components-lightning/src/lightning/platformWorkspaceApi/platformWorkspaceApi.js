import {
    EnclosingTabId,
    IsConsoleNavigation,
    WorkspaceAPIEvent,
} from 'lightning/platformWorkspaceApiUtils';

const ACTION = {
    CLOSE: 'closeTab',
    DISABLE_TAB_CLOSE: 'disableTabClose',
    FOCUS: 'focusTab',
    GET_ALL_TAB_INFO: 'getAllTabInfo',
    GET_FOCUSED_TAB_INFO: 'getFocusedTabInfo',
    GET_INFO: 'getTabInfo',
    OPEN_SUB_TAB: 'openSubtab',
    OPEN: 'openTab',
    REFRESH: 'refreshTab',
    SET_HIGHLIGHTED: 'setTabHighlighted',
    SET_ICON: 'setTabIcon',
    SET_LABEL: 'setTabLabel',
};

const createWorkspaceEvent = (methodName, methodArgs, callback) => {
    return new WorkspaceAPIEvent(methodName, methodArgs, callback);
};

const createPromise = (methodName, methodArgs, overrideResolve) => {
    return new Promise((resolve, reject) => {
        const apiEvent = createWorkspaceEvent(
            methodName,
            methodArgs,
            (error, response) => {
                if (error) {
                    return reject(error);
                }
                if (overrideResolve) {
                    overrideResolve(response);
                    return undefined;
                }
                return resolve(response);
            }
        );
        window.dispatchEvent(apiEvent);
    });
};

/**
 * close a tab
 * @param {String} tabId - ID of a tab to be closed
 * @returns {Promise}
 */
const closeTab = (tabId) => {
    if (!tabId) {
        return Promise.reject('error: unable to close a tab - missing tabId');
    }
    return createPromise(ACTION.CLOSE, { tabId });
};

/**
 * disable closing a tab
 * @param {String} tabId - ID of a tab to be disabled the close function
 * @param {boolean} disabled - true to disable to the tab close
 * @returns {Promise}
 */
const disableTabClose = (tabId, disabled) => {
    if (!tabId || typeof disabled !== 'boolean') {
        return Promise.reject(
            'error: unable to disable tab close - missing tabId or disabled flag'
        );
    }
    return createPromise(ACTION.DISABLE_TAB_CLOSE, { tabId, disabled });
};

/**
 * focus a tab
 * @param {String} tabId - ID of a tab to be focused
 * @returns {Promise}
 */
const focusTab = (tabId) => {
    if (!tabId) {
        return Promise.reject('error: unable to focus a tab - missing tabId');
    }
    return createPromise(ACTION.FOCUS, { tabId });
};

/**
 * retrieve all the tabs' info
 * @returns {Promise}
 */
const getAllTabInfo = () => {
    return createPromise(ACTION.GET_ALL_TAB_INFO);
};

/**
 * retrieve the focused tab's info
 * @returns {Promise}
 */
const getFocusedTabInfo = () => {
    return createPromise(ACTION.GET_FOCUSED_TAB_INFO);
};

/**
 * retrieve info of a specific tab
 * @param {String} tabId - ID of tab
 * @returns {Promise}
 */
const getTabInfo = (tabId) => {
    if (!tabId) {
        return Promise.reject(
            'error: unable to get info for a tab - missing tabId'
        );
    }
    return createPromise(ACTION.GET_INFO, { tabId });
};

/**
 * open a new subtab
 * @param {String} parentTabId, ID of the parent tab
 * @param {Object} optionalParams, optional parameters:
 *   focus: boolean, true if the subtab will receive focus
 *   icon: String - icon name of the subtab
 *   iconAlt: String - alt text of the subtab's icon
 *   label: String - label of the subtab
 *   pageReference: Object - a PageReference representing the content of the new subtab
 *   recordId: String - a record ID representing the content of the new subtab
 *   url: String - the URL representing the content of the new subtab. URLs can be either relative or absolute.
 * @returns {Promise}
 */
const openSubtab = (parentTabId, optionalParams = {}) => {
    if (!parentTabId) {
        return Promise.reject(
            'error: unable to open a subtab - missing parent tab id'
        );
    }
    return createPromise(ACTION.OPEN_SUB_TAB, {
        parentTabId,
        ...optionalParams,
    });
};

/**
 * open a new tab
 * @param {Object} optionalParams, optional parameters:
 *   focus: boolean, true if the tab will receive focus
 *   icon: String - icon name of the tab
 *   iconAlt: String - alt text of the tab's icon
 *   label: String - label of the tab
 *   overrideNavRules: boolean - specifies whether to override nav rules when opening the new tab.
 *   pageReference: Object - a PageReference representing the content of the new tab
 *   recordId: String - a record ID representing the content of the new tab
 *   url: String - the URL representing the content of the new tab. URLs can be either relative or absolute.
 * @returns {Promise}
 */
const openTab = (optionalParams = {}) => {
    return createPromise(ACTION.OPEN, optionalParams);
};

/**
 * refresh a specific tab
 * @param {String} tabId - ID of the workspace tab or subtab to refresh
 * @param {Object} optionalParams - optional parameters:
 *   includeAllSubtabs: boolean, tf the tabId corresponds to a workspace tab, all subtabs within that workspace are refreshed.
 * @returns
 */
const refreshTab = (tabId, optionalParams) => {
    if (!tabId) {
        return Promise.reject('error: unable to refresh a tab - missing tabId');
    }
    return createPromise(ACTION.REFRESH, { tabId, ...optionalParams });
};

/**
 * highlight a specific tab
 * @param {String} tabId - ID of the tab for which to highlight.
 * @param {boolean} highlighted - specifies whether the tab should be highlighted.
 * @param {Object} optionalParams - additional options that modify the appearance of the highlighted tab
 *  pulse: boolean - if true, add pulse animation
 *  state: string - {success, warning, warning}
 * @returns {Promise}
 */
const setTabHighlighted = (tabId, highlighted, optionalParams = {}) => {
    if (!tabId || typeof highlighted !== 'boolean') {
        return Promise.reject(
            'error: unable to highlight a tab - missing tabId or highlighted flag'
        );
    }
    return createPromise(ACTION.SET_HIGHLIGHTED, {
        tabId,
        highlighted,
        options: optionalParams,
    });
};

/**
 * assign a custom icon to a tab
 * @param {String} tabId - ID of the tab for which to set the icon.
 * @param {String} icon - a SLDS icon key
 * @param {Object} optionalParams - optional parameters
 *   iconAltL string - alternative text for the icon
 * @returns {Promise}
 */
const setTabIcon = (tabId, icon, optionalParams = {}) => {
    if (!tabId || icon === undefined) {
        return Promise.reject(
            'error: unable to set icon to a tab - missing tabId or icon'
        );
    }
    return createPromise(ACTION.SET_ICON, { tabId, icon, ...optionalParams });
};

/**
 * assign a custom label to a tab
 * @param {String} tabId - ID of the tab for which to set the lab
 * @param {String} label - label of the workspace tab or subtab
 * @returns
 */
const setTabLabel = (tabId, label) => {
    if (!tabId || label === undefined) {
        return Promise.reject(
            'error: unable to set label to a tab - missing tabId or label'
        );
    }
    return createPromise(ACTION.SET_LABEL, { tabId, label });
};

export {
    EnclosingTabId,
    IsConsoleNavigation,
    closeTab,
    disableTabClose,
    focusTab,
    getAllTabInfo,
    getFocusedTabInfo,
    getTabInfo,
    openSubtab,
    openTab,
    refreshTab,
    setTabHighlighted,
    setTabIcon,
    setTabLabel,
};
