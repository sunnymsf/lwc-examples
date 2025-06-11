import { WireUtil } from './wireUtil';
import {
    WORKSPACE_API_EVENT_NAME,
    WorkspaceAPIEvent,
} from './workspaceApiEvent';

const ENCLOSING_TAB_ID_WIRE_NAME = 'EnclosingTabId';
const IS_CONSOLE_NAVIGATION_WIRE_NAME = 'IsConsoleNavigation';

const enclosingTabIdWireUtil = new WireUtil(ENCLOSING_TAB_ID_WIRE_NAME);
const consoleNavigationWireUtil = new WireUtil(IS_CONSOLE_NAVIGATION_WIRE_NAME);

/**
 * set the provider for EnclosingTabId context wire
 * @param {Element} component - the provider element
 * @param {String} tabId - optional, tab id to be set as enclosing tab id
 */
const setEnclosingTabIdProvider = (component, tabId) => {
    enclosingTabIdWireUtil.initializeContextProvider(component, tabId);
};

/**
 * set the value of EnclosingTabId
 * @param {Element} component - the provider element
 * @param {String} tabId - tab id to be set as enclosing tab id
 */
const setEnclosingTabId = (component, tabId) => {
    enclosingTabIdWireUtil.provideContextValue(component, tabId);
};

/**
 * set the provider for isConsoleNavigation context wire
 * @param {Element} component - the provider element
 * @param {boolean} value - optional, true if currently in a console
 */
const setConsoleNavigationProvider = (component, value) => {
    consoleNavigationWireUtil.initializeContextProvider(component, value);
};

/**
 * set the value of isConsoleNavigation
 * @param {Element} component - the provider element
 * @param {boolean} value - true if currently in a console
 */
const setConsoleNavigation = (component, value) => {
    consoleNavigationWireUtil.provideContextValue(component, value);
};

const EnclosingTabId = enclosingTabIdWireUtil.contextWireAdapter;
const IsConsoleNavigation = consoleNavigationWireUtil.contextWireAdapter;

export {
    WORKSPACE_API_EVENT_NAME,
    EnclosingTabId,
    IsConsoleNavigation,
    WorkspaceAPIEvent,
    setEnclosingTabId,
    setEnclosingTabIdProvider,
    setConsoleNavigation,
    setConsoleNavigationProvider,
};
