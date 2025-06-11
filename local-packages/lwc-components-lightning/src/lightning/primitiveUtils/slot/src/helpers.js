/**
 * Check if an element is a custom element
 *
 * @param {Object} element
 * @returns {Boolean}
 */
export function isCustomElement(element) {
  return element instanceof HTMLElement && element.tagName.includes('-');
}

/**
 * Check if two arrays are equal
 *
 * @param {Array} a
 * @param {Array} b
 * @returns {Boolean}
 */
export function arraysEqual(a, b) {
  return a.length === b.length && a.every((item, index) => item === b[index]);
}

/**
 * Check if an array is empty
 *
 * @param {Array} a
 * @returns {Boolean}
 */
export function arrayIsEmpty(a) {
  return Array.isArray(a) && a.length === 0;
}

/**
 * Recursively find an element in a slot based on a callback
 *
 * @param {Array} children
 * @param {Function} callback
 * @returns {*}
 */
export function findElementInSlot(children, callback) {
  for (const child of children) {
    if (callback(child)) {
      return child;
    }

    const foundElement = findElementInSlot(child.children, callback);
    if (foundElement) {
      return foundElement;
    }
  }

  return null;
}
