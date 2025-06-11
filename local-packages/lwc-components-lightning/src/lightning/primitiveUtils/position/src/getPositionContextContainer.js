import { isPositioningContext, isFinalNode, isShadowRoot } from './helpers.js';

/**
 * Returns the nearest positioning context container.
 *
 * @param {HTMLElement} element - find the nearest positioning context container for this element
 *
 * @returns {HTMLElement} - the nearest positioning context container
 */
export function getPositionContextContainer(element) {
  let currentNode = element.parentNode;

  if (isShadowRoot(currentNode)) {
    currentNode = currentNode.host;
  }

  while (!isFinalNode(currentNode) && !isPositioningContext(currentNode)) {
    const parent = currentNode.parentNode;
    currentNode = isShadowRoot(parent) ? parent.host : parent;
  }

  return currentNode;
}
