import { getScrollAmount, getElementBoundaries } from './helpers.js';

/**
 * Return target boundaries with scroll offset applied.
 *
 * @param {Object} coordinates - x and y coordinates of the element
 *
 * @returns {Object} - object containing the boundaries of the element
 */
export function getTargetBoundariesWithScrollOffset(coordinates) {
  // Clipping detection via viewport only
  const scroll = getScrollAmount(window.document.documentElement);

  const coordinatesWithScrollOffset = {
    x: coordinates.x - scroll.scrollLeft,
    y: coordinates.y - scroll.scrollTop,
  };

  return getElementBoundaries({ ...coordinates, ...coordinatesWithScrollOffset });
}
