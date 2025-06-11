import { isCustomElement } from '../../slot/index';

/**
 * Validates that the control is a button type.
 *
 * @param {HTMLElement} control - The control element to validate
 * @returns {HTMLElement} - The control element if it is a button, otherwise null
 */
export function validationTraverse(root, callback) {
  if (callback(root)) {
    return root;
  }

  if (isCustomElement(root) && root.shadowRoot) {
    const controlShadowRootChildren = root.shadowRoot.children;

    for (const child of controlShadowRootChildren) {
      const result = validationTraverse(child, callback);
      if (result) return result;
    }

    for (const child of root.children) {
      const result = validationTraverse(child, callback);
      if (result) return result;
    }
  } else {
    return null;
  }
}

function isButton(el) {
  return (
    el instanceof HTMLButtonElement ||
    (el instanceof HTMLInputElement && el.type === 'button') ||
    el.role === 'button'
  );
}

export function validateIsButtonType(control) {
  const result = validationTraverse(control, isButton);
  if (!result) {
    console.error("The control requires a button or input[type='button']");
    return null;
  }
  return result;
}
