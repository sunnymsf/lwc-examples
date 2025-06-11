import { findElementInSlot } from '../../slot/index.js';

/**
 * Find the control element set by `aria-controls` attribute.
 *
 * @param {Array} content - The slot content
 * @param {Function} validation - Optional validation function to execute on the control
 * @returns {HTMLElement} - The control element
 */
export function findControl(content, validation) {
  const control = findElementInSlot(content, (el) => el.hasAttribute('aria-controls'));
  if (control) {
    return validation ? validation(control) : control;
  } else {
    console.error(
      "No control found. Please add an element with a aria-controls attribute equal to the target's ID.",
    );
  }
}

/**
 * Find the control ID set by `aria-controls` attribute
 *
 * @param {Array} a
 * @returns {String}
 */
export function findControlId(a) {
  const control = findElementInSlot(a, (el) => el.hasAttribute('aria-controls'));
  if (control) {
    return control.getAttribute('aria-controls');
  }
}

/**
 * Find the target element referenced by the control and set by `aria-controls` attribute
 *
 * @param {Array} a
 * @returns {HTMLElement}
 */
export function findTarget(a) {
  const controlId = findControlId(a);

  if (controlId) {
    const target = findElementInSlot(a, (el) => el.id === controlId);
    if (target) {
      return target;
    } else {
      console.error(
        "No target found. Please check you have an element with an ID equal to the control's aria-controls attribute.",
      );
    }
  }
}

/**
 * Create a contract between the control and target elements.
 *
 * @param {Object} el - The element to create the contract on
 * @param {Array} content - The slot content; expects the control to have a data-controls attribute set to the target's ID
 * @param {Function} callback - The callback to execute when the contract is created
 */
export function createControlAndTargetContract({ element, content, validation, callback }) {
  element.control = findControl(content, validation);
  element.target = findTarget(content);
  if (element.control && element.target) {
    callback();
  }
}
