/**
 * Returns the dimensions of the element
 *
 * @param {HTMLElement} element - the element to get the dimensions of
 * @returns {Object} - object containing the width and height of the element
 */
export function getElementDimensions(element) {
  const width = element.offsetWidth;
  const height = element.offsetHeight;

  return { width, height };
}

/**
 * Returns the coordinates of the element
 *
 * @param {HTMLElement} element - the element to get the coordinates of
 * @returns {Object} - object containing the x and y coordinates of the element
 */
export function getElementCoordinates(element) {
  const rect = element.getBoundingClientRect();
  const x = rect.x;
  const y = rect.y;

  return { x, y };
}

/**
 * Returns the coordinates and dimensions of the element as a single object.
 *
 * @param {Object} coordinates - x and y coordinates of the element
 * @param {Object} dimensions - width and height of the element
 * @returns {Object} - object containing the x and y coordinates and width and height of the element
 */
export function getElementRect(coordinates, dimensions) {
  return { ...coordinates, ...dimensions };
}

/**
 * Returns the boundaries of the element based on the rect
 *
 * @param {Object} rect - object containing the x and y coordinates and width and height of the element
 * @returns {Object} - object containing the boundaries of the element
 */
export function getElementBoundaries(rect) {
  return {
    ...rect,
    'block-start': rect.y,
    'inline-end': rect.x + rect.width,
    'block-end': rect.y + rect.height,
    'inline-start': rect.x,
  };
}

/**
 *
 * @param {String} placement - logical placement of the target relative to the control
 * @returns {String} - logical category 'block' or 'inline'
 */
export function getLogicalCategory(placement) {
  return placement.split('-')[0];
}

/**
 * Returns the logical orientation of the target relative to the control.
 *
 * @param {String} placement - logical placement of the target relative to the control
 * @returns {String} - logical orientation, e.g., 'block-start'
 */
export function getLogicalOrientation(placement) {
  return placement.split('-').slice(0, 2).join('-');
}

/**
 * Returns the logical alignment of the target relative to the control.
 *
 * @param {String} placement - logical placement of the target relative to the control
 * @returns {String} - logical alignment, e.g., 'start'
 */
export function getAlignment(placement) {
  return placement.split('-')[2];
}

/**
 * Returns the logical axis of the target relative to the control.
 *
 * @param {String} axis - logical category 'block' or 'inline'
 * @returns {String} - logical axis 'x' or 'y'
 */
export function getLogicalAxis(axis) {
  return axis === 'block' ? 'y' : 'x';
}

/**
 * Returns opposing logical axis
 *
 * @param {String} axis - logical axis 'x' or 'y'
 * @returns {String} - logical axis 'x' or 'y'
 */
export function getOtherAxis(axis) {
  return axis === 'x' ? 'y' : 'x';
}

/**
 * Returns the dimension of the logical axis
 *
 * @param {String} axis - logical axis 'x' or 'y'
 * @returns {String} - dimension 'width' or 'height'
 */
export function getAxisDimension(axis) {
  return axis === 'x' ? 'width' : 'height';
}

/**
 * Returns the scroll offset of the window.
 *
 * @returns {Object} - object containing the x and y scroll offsets
 */
export function getScrollOffset() {
  return {
    x: window.scrollX,
    y: window.scrollY,
  };
}

/**
 * Returns the scroll amount of the element.
 *
 * @param {HTMLElement} element - the element to get the scroll amount of
 * @returns {Object} - object containing the x and y scroll amounts
 */
export function getScrollAmount(element) {
  return {
    scrollLeft: element.scrollLeft,
    scrollTop: element.scrollTop,
  };
}

/**
 * Returns the viewport boundaries.
 *
 * @returns {Object} - object containing the boundaries of the viewport
 */
export function getViewportBoundaries() {
  const win = window;
  const html = win.document.documentElement;

  return getElementBoundaries({
    x: 0,
    y: 0,
    width: html.clientWidth,
    height: html.clientHeight,
  });
}

/**
 * Checks if element is a positioning context
 *
 * @param {HTMLElement} element - the element to check
 *
 * @returns {Boolean} - true if element is a positioning context
 */
export function isPositioningContext(element) {
  return getComputedStyle(element).position !== 'static';
}

/**
 * Checks if element is a shadow root
 *
 * @param {HTMLElement} node - the node to check
 *
 * @returns {Boolean} - true if element is a shadow root
 */
export function isShadowRoot(node) {
  return node instanceof ShadowRoot;
}

/**
 * Checks if element is a final node in a document tree
 *
 * @param {HTMLElement} node - the node to check
 *
 * @returns {Boolean} - true if element is a final node
 */
export function isFinalNode(node) {
  return ['html', 'body', '#document'].includes(node.nodeName.toLowerCase());
}
