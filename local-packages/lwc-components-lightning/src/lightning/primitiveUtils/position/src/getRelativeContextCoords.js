import {
  getScrollOffset,
  getElementDimensions,
  getElementCoordinates,
  getElementRect,
  getElementBoundaries,
} from './helpers.js';

import { getPositionContextContainer } from './getPositionContextContainer.js';

/**
 * Returns the x and y coordinates of the element relative to a positioning
 * context container.
 *
 * @param {HTMLElement} control - the control element
 *
 * @returns {Object} - object containing the x and y coordinates
 */
export function getRelativeContextCoords(control) {
  const controlCoords = getElementCoordinates(control);
  const scrollOffset = getScrollOffset(control);
  const positionContext = getPositionContextContainer(control);
  const positionContextRect = getElementBoundaries(
    getElementRect(getElementCoordinates(positionContext), getElementDimensions(positionContext)),
  );
  /**
   * Since we're adjusting the x and y coordinates of the target relative to a
   * positioning context, we need to adjust the x/y coordinates of the
   * container to account for scroll offset since x/y values are relative to
   * the document x/y, not the viewport.
   */
  return {
    x: Math.round(controlCoords.x - positionContextRect.x - scrollOffset.x),
    y: Math.round(controlCoords.y - positionContextRect.y - scrollOffset.y),
  };
}
