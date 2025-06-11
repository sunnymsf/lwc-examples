import { getViewportBoundaries } from '../../position/src/helpers.js';
import { getTargetBoundariesWithScrollOffset } from '../../position/src/getTargetBoundariesWithScrollOffset.js';
import { detectOverflow } from './detectOverflow.js';

/**
 * Returns an array of sides that are clipping.
 *
 * @param {Object} overflow - object containing overflow values
 *
 * @returns {Array} - array of sides that are overflowing
 */
export function detectClipping(overflow) {
  const detectClipping = ['block-start', 'block-end', 'inline-start', 'inline-end'];
  return detectClipping.reduce((sides, side) => {
    if (overflow[side] >= 0) {
      sides.push(side);
    }
    return sides;
  }, []);
}

/**
 * Checks if therere is multiple clipping on the same axis.
 *
 * @param {Array} clipping
 *
 * @returns {Boolean} - true if there is multiple clipping on the same axis
 */
export function detectSameAxisClipping(clipping) {
  return (
    (clipping.includes('block-start') && clipping.includes('block-end')) ||
    (clipping.includes('inline-start') && clipping.includes('inline-end'))
  );
}

/**
 * Checks if any sides of the element are clipping the viewport.
 *
 * @param {Object} coordinates - x and y coordinates of the element
 *
 * @returns {Array} - array of sides that are clipping
 */
export function checkForViewportClipping(coordinates) {
  // Before detect overflow, I need to adjust the clipping container boundaries
  // This logic flows back into the ancestor checking that I haven't fully implemented yet
  // So for now, we just get the viewport
  const viewportBoundaries = getViewportBoundaries();
  const targetBoundariesWithScrollOffset = getTargetBoundariesWithScrollOffset(coordinates);

  /**
   * Returns the overflow amount (positive number is overflowing)
   */
  const overflow = detectOverflow(viewportBoundaries, targetBoundariesWithScrollOffset);

  /**
   * Using overflow values, return an array of sides that are clipping.
   */
  return detectClipping(overflow);
}
