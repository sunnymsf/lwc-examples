import { position } from '../../position/index';
import { hasObserveResize, observeResize } from '../../resize/index';
import { dispatchCustomEvent } from '../../event/index';

/**
 * Check if the browser supports the popover API.
 *
 * @returns {Boolean} - true if the browser supports the popover API
 */
export function supportsPopover() {
  return HTMLElement.prototype.hasOwnProperty('popover');
}

/**
 * Check if the target is open. Method of checking depends on the browser's
 * support for the popover API.
 *
 * @returns {Boolean} - true if the target is open
 */
export function isOpen(target) {
  return supportsPopover() ? target.matches(':popover-open') : target.style.display === 'block';
}

/**
 * Position the target relative to the control.
 *
 * @param {Object} popover - configuration object
 * @param {HTMLElement} popover.control - control element
 * @param {HTMLElement} popover.target - target element
 * @param {String} popover.placement - placement of the target relative to the control
 * @param {Number} popover.offset - offset amount of the target from the control
 */
export function positionPopover({ control, target, placement, offset }) {
  const coords = position({
    control,
    target,
    placement,
    offset,
  });
  // @TODO: refactor
  target.setAttribute('placement', coords.placement);
  setCoordinates({ coords, target });
}

/**
 * Open the target. Method of opening depends on the brower's support for
 * the popover API.
 *
 * @param {Object} popover - configuration object
 * @param {HTMLElement} popover.component - component element
 * @param {HTMLElement} popover.target - target element
 * @param {HTMLElement} popover.control - control element
 * @param {String} popover.placement - placement of the target relative to the control
 * @param {Number} popover.offset - offset amount of the target from the control
 *
 * @public
 *
 * Order of operations is critical:
 * 1. Render the target in the layout
 * 2. Run positioning library to get coordinates
 * 3. Set attributes and styles using coordinates
 * 4. Instance the resize observer (cleaned in closePopover)
 */
export function openPopover({ component, target, control, placement, offset }) {
  if (supportsPopover()) {
    target.showPopover();
  } else {
    target.style.display = 'block';
  }
  positionPopover({ control, target, placement, offset });
  toggleOpenStateAttributes({ control, target });
  if (!hasObserveResize(component)) {
    component.observeResize = observeResize({ control, target, placement, offset });
  }
}

/**
 * Close the target. Method of closing depends on the brower's support for
 * the popover API.
 *
 * @param {Object} popover - configuration object
 * @param {HTMLElement} popover.component - component element
 * @param {HTMLElement} popover.target - target element
 * @param {HTMLElement} popover.control - control element
 */
export function closePopover({ component, control, target }) {
  if (isOpen(target)) {
    if (supportsPopover()) {
      target.hidePopover();
    } else {
      target.style.removeProperty('display');
    }
    dispatchCustomEvent({
      eventName: 'closed',
      eventOrigin: target,
      eventDetails: { name: component.tagName.toLowerCase() },
    });
    toggleOpenStateAttributes({ control, target });
    if (hasObserveResize(component)) {
      component.observeResize();
      component.observeResize = null;
    }
  }
}

/**
 * Toggle the target. Method of toggling depends on the brower's support for
 * the popover API.
 *
 * @param {Object} popover - configuration object
 * @param {HTMLElement} popover.component - component element
 * @param {HTMLElement} popover.target - target element
 * @param {HTMLElement} popover.control - control element
 * @param {String} popover.placement - placement of the target relative to the control
 * @param {Number} popover.offset - offset amount of the target from the control
 */
export function togglePopover({ component, target, control, placement, offset }) {
  if (isOpen(target)) {
    closePopover({ component, control, target });
  } else {
    openPopover({ component, target, control, placement, offset });
  }
}

/**
 * Sets the coordinates of the target.
 *
 * @param {Object} coords - coordinates of the target
 */
export function setCoordinates({ coords, target }) {
  target.style.insetInlineStart = `${coords.x}px`;
  target.style.insetBlockStart = `${coords.y}px`;
}

/**
 * Toggle the open attribute on the target and the aria-expanded attribute on the control.
 *
 * @param {Object} popover - configuration object
 * @param {HTMLElement} popover.control - control element
 * @param {HTMLElement} popover.target - target element
 */
export function toggleOpenStateAttributes({ control, target }) {
  if (isOpen(target)) {
    target.setAttribute('open', '');
  } else {
    target.removeAttribute('open');
  }
  control.setAttribute('aria-expanded', isOpen(target));
}
