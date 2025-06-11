import {
  getElementDimensions,
  getElementCoordinates,
  getElementRect,
  getElementBoundaries,
} from './helpers.js';

import { calculateCoordinates } from './calculateCoordinates.js';
import { getPositionContextContainer } from './getPositionContextContainer.js';
import { getRelativeContextCoords } from './getRelativeContextCoords.js';
import { updatePlacement } from './updatePlacement.js';
import { validatePlacement } from './validatePlacement.js';
import { checkForViewportClipping, detectSameAxisClipping } from '../../overflow/index.js';
import { supportsPopover } from '../../popover/index.js';

/**
 * Main positioning function that returns a set of coordinates for the target
 * relative to the control.
 *
 * @param {Object} options - configuration object
 * @param {HTMLElement} options.control - control element
 * @param {HTMLElement} options.target - target element
 * @param {String} options.placement - logical placement of the target relative to the control
 * @param {Number} options.offset - offset amount of the target from the control
 *
 * @returns {Object} - object containing the x and y coordinates of the target
 */
export function position({ control, target, placement = 'block-start', offset = 0 }) {
  /**
   * The main object that represents the interface expected by the function
   */
  const position = {
    control,
    target,
    placement,
    offset,
  };

  /**
   * Warn if the placement is invalid and return early.
   */
  if (!validatePlacement(position.placement)) {
    console.warn(`Invalid placement: ${position.placement}`);
    return;
  }

  /**
   * Assemble our main objects for our control and target elements that contain:
   * - Dimensions: width & height
   * - Coordinates: x & y
   * - Rect: x, y, width, height
   * - Boundaries: top, right, bottom, left (in logical syntax)
   *
   * Most of our calculations will be based on these objects.
   */
  position.control = getElementBoundaries(
    getElementRect(getElementCoordinates(control), getElementDimensions(control)),
  );
  position.target = getElementBoundaries(
    getElementRect(getElementCoordinates(target), getElementDimensions(target)),
  );

  /**
   * If not using the popover API, we need to adjust for any containers
   * that create a positioning context and update the control to use
   * relative coordinates.
   */
  if (!supportsPopover()) {
    const relativeControlCoords = getRelativeContextCoords(control);
    position.relativeControl = {
      ...position.control,
      ...relativeControlCoords,
    };
  }

  /**
   * Calculate initial coordinates.
   *
   * coordinates - default that is relative to viewport, supports Popover API.
   * relativeCoordinates - relative to a positioning context container, does
   *                       not support Popover API.
   *
   * Two sets of coordinates are required because the Popover API uses Layers
   * and breaks out of the documents stacking context created by context
   * context containers. Non-popover API implementations will respect any
   * stacking contexts that are created, therefore, making the coordinates
   * relative to something other than the viewport.
   */
  let coordinates = calculateCoordinates(position);
  let relativeCoordinates = position.relativeControl
    ? calculateCoordinates({
        ...position,
        control: position.relativeControl,
      })
    : null;

  /**
   * Detect if any sides of the target are clipping the viewport.
   */
  const clippedSides = checkForViewportClipping(coordinates);

  /**
   * If the target is clipping and it's not clipping on the same axis, try to
   * update the placement to see if we can get a non-clipping placement.
   */
  if (clippedSides.length > 0 && !detectSameAxisClipping(clippedSides)) {
    /**
     * Rerun the positioning logic with the alternative placement.
     */
    let updatedCoordinates = calculateCoordinates({
      ...position,
      placement: updatePlacement(placement, clippedSides),
    });

    /**
     * If the alternative placement also DOES NOT clip, use it.
     */
    if (checkForViewportClipping(updatedCoordinates).length === 0) {
      /**
       * Update coordinates to use the alternative placement.
       */
      if (relativeCoordinates) {
        relativeCoordinates = calculateCoordinates({
          ...position,
          control: position.relativeControl,
          placement: updatePlacement(placement, clippedSides),
        });
      } else {
        coordinates = updatedCoordinates;
      }
    }
  }

  return relativeCoordinates || coordinates;
}
