/**
 * Get the name of the node
 *
 * @param {HTMLElement} node - the node to get the name of
 * @returns {String} - the name of the node in lowercase
 *
 * @TODO: probably can live somewhere else, but currently only being used for overflow so leaving here.
 * Same goes for all the other helpers being added in this file.
 */
export function getNodeName(node) {
  return isNode(node) ? node.nodeName.toLowerCase() : `${node} is not a valid DOM node`;
}

/**
 * Check if the element is an overflow container
 *
 * @param {HTMLElement} element - the element to check
 * @returns {Boolean} - true if the element is an overflow container
 */
export function isOverflowContainer(element) {
  const { overflow, overflowX, overflowY, display } = window.getComputedStyle(element);
  return (
    /auto|scroll|hidden|clip/.test(overflow + overflowY + overflowX) &&
    !['inline', 'contents'].includes(display)
  );
}

/**
 * Check if the element is a shadow root.
 *
 * @param {*} element - The node to check
 * @returns {Boolean} - true if the element is a shadow root
 */
export function isShadowRoot(element) {
  return element instanceof ShadowRoot;
}

/**
 * Check if the element is a valid DOM node.
 *
 * @param {*} element - The node to check
 * @returns {Boolean} - true if the element is a valid DOM node
 */
export function isNode(element) {
  return element instanceof Node;
}
