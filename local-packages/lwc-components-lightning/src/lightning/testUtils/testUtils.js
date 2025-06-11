import {
    querySelector as kkQuerySelector,
    querySelectorAll as kkQuerySelectorAll,
} from './utils/kagekiri';

export { getAriaProps, createAriaElements } from './testA11yUtils';

/**
Returns the shadowRoot property of a given Lightning web component.

Use this utility instead of directly accessing the the element's ShadowRoot
to future-proof your test logic as LWC's Shadow DOM API implementation
evolves over time.

@param {LWCElement} element The Lightning web component element to retrieve
the shadowRoot property off of
@returns {ShadowRoot} The shadow root of the given element
**/
export function getShadowRoot(element) {
    if (!element || !element.shadowRoot) {
        const tagName =
            element && element.tagName && element.tagName.toLowerCase();
        throw new Error(
            `Attempting to retrieve the shadow root of '${
                tagName || element
            }' but no shadowRoot property found`
        );
    }
    return element.shadowRoot;
}

/**
Non-recursively queries the template of the provided element using the
provided selector.
@param {LWCElement} element The Lightning web component element for which we
    want to query the template.
@param {String} selector The selector used to match the descendant element.
@returns {Element}
**/
export function shadowQuerySelector(element, selector) {
    return getShadowRoot(element).querySelector(selector);
}

/**
Non-recursively queries the template of the provided element using the
provided selector.
@param {LWCElement} element The Lightning web component element for which we
    want to query the template.
@param {String} selector The selector used to match the descendant element.
@returns {Element[]}
**/
export function shadowQuerySelectorAll(element, selector) {
    return Array.from(getShadowRoot(element).querySelectorAll(selector));
}

// eslint-disable-next-line @lwc/lwc/no-rest-parameter
export function testConnectedElement(element, attributes, ...tests) {
    Object.assign(element, attributes);
    document.body.appendChild(element);
    return tests
        .reduce((promise, test) => promise.then(test), Promise.resolve())
        .then(
            (value) => {
                document.body.removeChild(element);
                return value;
            },
            (value) => {
                document.body.removeChild(element);
                return Promise.reject(value);
            }
        );
}

export function verifyClassSet(node, classSet) {
    const nodeClasses = node.getAttribute('class').split(' ');
    const expectedClasses = Object.keys(classSet).filter((className) => {
        return classSet[className];
    });
    const hasExpectedClasses = expectedClasses.reduce((soFar, className) => {
        return soFar && nodeClasses.indexOf(className) !== -1;
    }, true);
    const hasUnexpectedClasses = Object.keys(classSet)
        .filter((className) => {
            return !classSet[className];
        })
        .reduce((soFar, className) => {
            return soFar || nodeClasses.indexOf(className) !== -1;
        }, false);
    expect(hasExpectedClasses).toBe(true);
    expect(hasUnexpectedClasses).toBe(false);
}

// gather all input elements across shadow boundries
// through brute force
export function getInputElements(element) {
    return querySelectorAll(element, 'input');
}

export function querySelector(element, selector) {
    return kkQuerySelector(selector, element);
}

export function querySelectorAll(element, selector) {
    return Array.from(kkQuerySelectorAll(selector, element));
}

export function isElementWithFocus(element) {
    let currentFocusedElement = document.activeElement;
    while (currentFocusedElement && currentFocusedElement !== element) {
        currentFocusedElement = currentFocusedElement.shadowRoot
            ? currentFocusedElement.shadowRoot.activeElement
            : null;
    }

    return currentFocusedElement === element;
}

export function getElementWithFocus() {
    let focusedElement = document.activeElement;
    let currentFocusedElement = focusedElement;

    while (focusedElement && focusedElement.shadowRoot) {
        focusedElement = getShadowRoot(currentFocusedElement).activeElement;
        if (focusedElement) {
            currentFocusedElement = focusedElement;
        }
    }

    return currentFocusedElement;
}

export function getMock(path) {
    const mock = window.__mockData[path];
    return JSON.parse(JSON.stringify(mock));
}

/**
 * Mocks console.warn to an empty function for one call
 * Useful to verify that a warning is logged as expected
 * without cluttering the test logs
 */
export function mockWarn() {
    jest.spyOn(console, 'warn').mockImplementationOnce(() => {});
}

/**
 * This util is used for catching the expected console.error and
 * console.warn messages/logs that are emitted intentionally by
 * components.
 *
 * Any expected errors or warns that actually occurred will be
 * returned in an array
 *
 * Any unintentional or unexpected errors or warns will be passed through
 * and will be printed to the console as they would have been otherwise.
 *
 * @param {Array} expectedLogMessages - Expected console.error or console.warn messages
 * @param {Object} originalConsoleError - Original console error object for passthroughs
 * @param {Object} originalConsoleWarn - Original console warn object for passthroughs
 * @returns {Object} An object of { expectedErrors: [], expectedWarns: [] }
 */
export function catchExpectedConsoleLogs(
    expectedLogMessages,
    originalConsoleError,
    originalConsoleWarn,
    preventMockClear = false
) {
    // console.error|warn.mock.calls => [['msg1'], ['msg2'], ['msg3']]
    const actualConsoleErrors = console.error.mock
        ? console.error.mock.calls.flat()
        : undefined;
    const actualConsoleWarns = console.warn.mock
        ? console.warn.mock.calls.flat()
        : undefined;
    let expectedErrors = [];
    let expectedWarns = [];
    if (actualConsoleErrors) {
        // Gets the difference between the actual/mock console errors
        // and the expected console errors
        expectedErrors = actualConsoleErrors.filter((error) =>
            expectedLogMessages.includes(error)
        );
        const unexpectedErrors = actualConsoleErrors.filter(
            (error) => !expectedLogMessages.includes(error)
        );

        // Print out unexpected errors to console.error
        unexpectedErrors.forEach((error) => originalConsoleError(error));

        // by default, run mockClear()
        if (!preventMockClear) {
            console.error.mockClear();
        }
    }

    if (actualConsoleWarns) {
        // Gets the difference between the actual/mock console warns
        // and the expected console warns
        expectedWarns = actualConsoleWarns.filter((warn) =>
            expectedLogMessages.includes(warn)
        );
        const unexpectedWarns = actualConsoleWarns.filter(
            (warn) => !expectedLogMessages.includes(warn)
        );

        // Print out unexpected warn to console.warn
        unexpectedWarns.forEach((warn) => originalConsoleWarn(warn));

        // by default, run mockClear()
        if (!preventMockClear) {
            console.warn.mockClear();
        }
    }
    // return received console.errors or console.warn
    return {
        expectedErrors,
        expectedWarns,
    };
}

/**
 * This util is used to retrieve the results from jest.spyOn
 * when results are returned that need to be validated
 *
 * Ref: https://github.com/facebook/jest/issues/3821#issuecomment-777792450
 *
 * @param {Function} spy - equal to jest.spyOn
 * @param {Number} index - Index number of results array to get
 * @returns {Object} Results returned from jest.spyOn
 */
export function getSpyResults(spy, index = 0) {
    return new Promise((resolve) => {
        return resolve(spy.mock.results[index].value);
    });
}
