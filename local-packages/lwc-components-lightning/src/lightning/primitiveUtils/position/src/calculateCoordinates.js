import {
  getScrollOffset,
  getLogicalCategory,
  getLogicalOrientation,
  getAlignment,
  getLogicalAxis,
  getOtherAxis,
  getAxisDimension,
} from './helpers.js';

/**
 * Calculates the coordinates of the target relative to the control.
 *
 * @param {Object} options - configuration object
 * @param {HTMLElement} options.control - control element
 * @param {HTMLElement} options.target - target element
 * @param {String} options.placement - logical placement of the target relative to the control
 * @param {Number} options.offset - offset amount of the target from the control
 *
 * @returns {Object} - object containing the x and y coordinates of the target
 */
export function calculateCoordinates({ control, target, placement, offset }) {
  const scrollOffset = getScrollOffset(control);
  const logicalCategory = getLogicalCategory(placement);
  const logicalOrientation = getLogicalOrientation(placement);
  const axis = getLogicalAxis(logicalCategory);
  const AxisAlignment = getOtherAxis(axis);

  const centerX = control.x + control.width / 2 - target.width / 2;
  const centerY = control.y + control.height / 2 - target.height / 2;
  const centerMid =
    control[getAxisDimension(AxisAlignment)] / 2 - target[getAxisDimension(AxisAlignment)] / 2;

  let coordinates;

  // Primary side positioning (i.e., top, right, bottom, left but in logicial syntax)
  switch (logicalOrientation) {
    case 'block-start':
      coordinates = {
        ...target,
        x: centerX + scrollOffset.x,
        y: control.y - target.height + scrollOffset.y - offset,
      };
      break;
    case 'inline-end':
      coordinates = {
        ...target,
        x: control.x + control.width + scrollOffset.x + offset,
        y: centerY + scrollOffset.y,
      };
      break;
    case 'block-end':
      coordinates = {
        ...target,
        x: centerX + scrollOffset.x,
        y: control.y + control.height + scrollOffset.y + offset,
      };
      break;
    case 'inline-start':
      coordinates = {
        ...target,
        x: control.x - target.width + scrollOffset.x - offset,
        y: centerY + scrollOffset.y,
      };
      break;
    default:
      coordinates = { ...target, x: control.x + scrollOffset.x, y: control.y + scrollOffset.y };
  }

  // Nudge to edges
  switch (getAlignment(placement)) {
    case 'start':
      coordinates[AxisAlignment] -= centerMid;
      break;
    case 'end':
      coordinates[AxisAlignment] += centerMid * 1;
      break;
    default:
  }

  coordinates.placement = placement;

  return coordinates;
}
