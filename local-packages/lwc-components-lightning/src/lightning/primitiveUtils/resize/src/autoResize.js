import { getElementDimensions } from '../../position/src/helpers.js';

/**
 * Return the width of the reference element
 *
 * @param {HTMLElement} reference
 * @returns {Number} - width of the reference element
 */
export function getReferenceDimenensions(reference) {
  return getElementDimensions(reference).width;
}

/**
 * Auto resize the target element to the width of the control element
 *
 * @param {Object} popover - configuration object
 * @param {HTMLElement} popover.control - control element
 * @param {HTMLElement} popover.target - target element
 * @param {Boolean} popover.autoResize - auto resize target element
 *
 * @TODO: This happens in other areas, but I'd like to refactor the utilities
 * to not directly manipulate elements but instead return the values to the
 * caller and let them handle the DOM manipulation.
 */
export function autoResize({ control, target, autoResize }) {
  if (autoResize) {
    target.style.width = `${getReferenceDimenensions(control)}px`;
  }
  if (!autoResize && target.style.width) {
    target.style.removeProperty('width');
  }
}
