import { ARIA, ARIA_TO_CAMEL } from 'lightning/utilsPrivate';

// Utility methods for testing Accessibility

/* Subset of ARIA Attributes that apply to all HTML elements
 * - used for providing values for testing
    - type - indicates expected value types
    - values, *with default value indicated first*
    https://www.w3.org/WAI/PF/aria-1.1/states_and_properties

    Aria types:
    string    - arbitrary string value
    idRefList - a list of one or more DOM ID, space separated
    token     - specific valid string values, equivalent to enum
    uri       - uniform resource identifier
*/
const ARIA_VALUES = {
    // Indicates whether assistive technologies will present all, or only
    // parts of, the changed region based on the change notifications
    // defined by the aria-relevant attribute
    [ARIA.ATOMIC]: {
        type: 'boolean',
        values: ['false', 'true'],
    },
    // Indicates whether an element, and its subtree, are currently being updated.
    [ARIA.BUSY]: {
        type: 'boolean',
        values: ['false', 'true'],
    },
    // Identifies the element (or elements) whose contents or presence are
    // controlled by the current element.
    [ARIA.CONTROLS]: {
        type: 'idRefList',
        values: ['one', 'two', 'three'],
    },
    // Specifies a URI referencing content that describes the object.
    [ARIA.DESCRIBEDAT]: {
        type: 'uri',
        values: [
            'https://www.salesforce.com',
            'https://developer.salesforce.com',
        ],
    },
    // Identifies the element (or elements) that describes the object.
    [ARIA.DESCRIBEDBY]: {
        type: 'idRefList',
        values: ['one', 'two', 'three'],
    },
    // Indicates that the element is perceivable but disabled, so it is not
    // editable or otherwise operable.
    [ARIA.DISABLED]: {
        type: 'boolean',
        values: ['false', 'true'],
    },
    // Indicates what functions can be performed when the dragged object is
    // released on the drop target. This allows assistive technologies to
    // convey the possible drag options available to users, including whether
    // a pop-up menu of choices is provided by the application.
    [ARIA.DROPEFFECT]: {
        type: 'token',
        values: ['none', 'copy', 'execute', 'link', 'move', 'popup'],
    },
    // Indicates whether the element, or another grouping element it controls,
    // is currently expanded or collapsed.
    [ARIA.EXPANDED]: {
        type: 'boolean',
        values: ['false', 'true'],
    },
    // Identifies the next element (or elements) in an alternate reading
    // order of content which, at the user's discretion, allows assistive
    // technology to override the general default of reading in document source order.
    [ARIA.FLOWTO]: {
        type: 'idRefList',
        values: ['one', 'two', 'three'],
    },
    // Indicates an element's "grabbed" state in a drag-and-drop operation.
    [ARIA.GRABBED]: {
        type: 'boolean',
        values: [undefined, 'false', 'true'],
    },
    // Indicates whether the element has a popup and its valid types.
    [ARIA.HASPOPUP]: {
        type: 'token',
        values: ['true', 'dialog', 'menu', 'listbox', 'tree', 'grid'],
    },
    // Indicates that the element and all of its descendants are not visible or perceivable to any user as implemented by the author
    [ARIA.HIDDEN]: {
        type: 'boolean',
        values: ['false', 'true'],
    },
    // Indicates the entered value does not conform to the format expected by
    // the application.
    [ARIA.INVALID]: {
        type: 'boolean',
        values: ['false', 'true'],
    },
    // Defines a string value that labels the current element
    [ARIA.LABEL]: {
        type: 'string',
        values: ['A label', 'Another label'],
    },
    // Identifies the element (or elements) that labels the current element
    [ARIA.LABELLEDBY]: {
        type: 'idRefList',
        values: ['one', 'two', 'three'],
    },
    // Indicates that an element will be updated, and describes the types of
    // updates the user agents, assistive technologies, and user can expect
    // from the live region.
    [ARIA.LIVE]: {
        type: 'token',
        values: ['off', 'assertive', 'polite'],
    },
    // Identifies an element (or elements) in order to define a visual, functional,
    // or contextual parent/child relationship between DOM elements where the
    // DOM hierarchy cannot be used to represent the relationship
    [ARIA.OWNS]: {
        type: 'idRefList',
        values: [],
    },
    // Indicates what user agent change notifications (additions, removals, etc)
    // assistive technologies will receive within a live region
    [ARIA.RELEVANT]: {
        type: 'token',
        values: ['additions text', 'additions', 'all', 'removals', 'text'],
    },
};

/**
 * convertAriaPropToCamel utility method for converting ARIA properties to ARIA camel-cased properties
   utilizes ARIA_TO_CAMEL lookup
 * @param {String} ariaProp a single ARIA property/string like 'aria-labelledby'
 * @example convertAriaPropToCamel('aria-labelledby') returns 'ariaLabelledBy'
 * @returns {String} Camel-cased ARIA property string
 */
const convertAriaPropToCamel = (ariaProp) => {
    if (!ariaProp || !ariaProp.startsWith('aria-')) {
        throw new Error('A value is required that starts with "aria-"');
    }
    return ARIA_TO_CAMEL[ariaProp];
};

/**
 * getAriaDefaultValue helps look retrieve the default value from the ARIA_VALUES obj, useful for testing
 * @param {String} ariaLookup Camel-cased ARIA property value (see ARIA_TO_CAMEL and ARIA_PROP_LIST in utilsPrivate)
 * @example [ARIA.HASPOPUP] returns: 'false' (first in .values[0])
 * @returns {String} The selection of the first value from available testing values (first value is default value)
 */
const getAriaDefaultValue = (ariaLookup) => {
    if (
        !ariaLookup ||
        !ariaLookup.startsWith('aria-') ||
        !ARIA_VALUES[ariaLookup]
    ) {
        throw new Error(
            'A valid ariaLookup value is required that starts with "aria-"'
        );
    }

    return ARIA_VALUES[ariaLookup].values[0];
};

/**
 * getAriaRandomValidValue helps look up random valid value from the ARIA_VALUES obj, useful for testing
 * @param {String} ariaLookup Camel-cased ARIA property value (see ARIA_TO_CAMEL in utilsPrivate)
 * @example [ 'ariaLabelledBy'] returns: 'two' (a valid value for 'aria-labelledby')
 * @returns {String} A value selected at random from available testing values
 */
const getAriaRandomValidValue = (ariaLookup) => {
    if (
        !ariaLookup ||
        !ariaLookup.startsWith('aria-') ||
        !ARIA_VALUES[ariaLookup]
    ) {
        throw new Error(
            'A valid ariaLookup value is required that starts with "aria-"'
        );
    }
    const valueArray = ARIA_VALUES[ariaLookup].values;
    const randomNumber = Math.floor(Math.random() * valueArray.length);
    return valueArray[randomNumber];
};

/**
 * getAriaProps creates an object representing assignable aria attributes for testing
 * @param {Array} ariaProps A list of supported ARIA properties supported by the component (array of strings)
 * @param {String} type enables selection of random value or default value (first value in array)
 * @example [ 'ariaLabelledBy', 'ariaControls' ] returns:
 * {
 *   ariaProps: { 'aria-labelledby': 'true', 'aria-controls': 'two' },
 *   ariaPropsCamelCase: { 'ariaLabelledBy': 'true', 'ariaControls': 'two' }
 * }
 * @returns {Object} An object for assigning attributes to an element, then testing they were set
 */
export const getAriaProps = ({ ariaProps, type = 'random' }) => {
    const props = { ariaPropsCamelCase: {}, ariaProps: {} };
    ariaProps.forEach((ariaKey) => {
        const ariaCamelKey = convertAriaPropToCamel(ariaKey);
        if (!props.ariaProps[ariaKey]) {
            const value =
                type === 'random'
                    ? getAriaRandomValidValue(ariaKey)
                    : getAriaDefaultValue(ariaKey);
            props.ariaProps[ariaKey] = value;
            props.ariaPropsCamelCase[ariaCamelKey] = value;
        }
    });

    return props;
};

// object containing api names for aria attributes
// that expect ids for use in createAriaElements
const ARIA_IDS = Object.keys(ARIA_VALUES)
    .filter((attr) => ARIA_VALUES[attr].type === 'idRefList')
    .map((attr) => ARIA_TO_CAMEL[attr]);

/**
 * createAriaElements adds elements needed to test id-based aria attributes
 * useful when unit testing aria attributes, especially in native shadow
 * @param {Object} props - props being used to create lightning element
 */
export const createAriaElements = (props) => {
    ARIA_IDS.forEach((attr) => {
        if (props[attr]) {
            const idList = props[attr].split(' ');
            idList.forEach((id) => {
                const element = document.createElement('p');
                element.setAttribute('id', id);
                document.body.appendChild(element);
            });
        }
    });
};
