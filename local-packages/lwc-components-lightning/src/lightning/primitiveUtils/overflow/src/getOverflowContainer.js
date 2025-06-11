import { getNodeName, isOverflowContainer, isNode, isShadowRoot } from './helpers';

/**
 * Return the closest containing element with overflow
 *
 * @param {HTMLElement} element
 * @returns {HTMLElement} - the closest containing element with overflow or default to the viewport
 */
export function getOverflowContainer(element) {
  /**
   * @TODO: need a better way to handle this, but for now, default to window
   * if the element is the html element or not a valid DOM node.
   */
  if (getNodeName(element) === 'html' || !isNode(element)) {
    return window;
  }

  /**
   * If the element is a shadow root, get the host element and proceed like normal,
   * otherwise, return the element.
   */
  const node = isShadowRoot(element) ? element.host : element;

  if (isOverflowContainer(node)) {
    return node;
  }

  return getOverflowContainer(node.parentNode);
}
