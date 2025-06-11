import { positionPopover } from '../../popover/index';
import { isDefined } from 'lightning/primitiveUtils';

/**
 * Observe the target for resizing and reposition the target when it does.
 *
 * @param {Object} popover - configuration object
 * @param {HTMLElement} popover.control - control element
 * @param {HTMLElement} popover.target - target element
 * @param {String} popover.placement - placement of the target relative to the control
 * @param {Number} popover.offset - offset amount of the target from the control
 */
export function observeResize({ control, target, placement, offset }) {
  // Instance the ResizeObserver
  let resizeObserver = new ResizeObserver((entries) => {
    // Repositon the target after resize
    positionPopover({ control, target, placement, offset });
  });

  // Observe the target for resizing
  resizeObserver.observe(target);

  // Return function that cleans up the observer
  return () => {
    resizeObserver.unobserve(target);
    resizeObserver.disconnect();
    resizeObserver = null;
  };
}

/**
 * Determine if the component has an observeResize method.
 *
 * @param {HTMLElement} component - component element
 *
 * @returns {Boolean} - true if component has observeResize method
 */
export function hasObserveResize(component) {
  return (
    isDefined(component) &&
    isDefined(component.observeResize) &&
    typeof component.observeResize === 'function'
  );
}
