import { LightningElement, api } from 'lwc';
import { normalizeBoolean, reflectAttribute } from 'lightning/primitiveUtils';
import 'lightning/primitiveThemeProvider';

export default class LightningPrimitiveExpandableSectionManager extends LightningElement {
  static shadowSupportMode = 'native';

  _valid = true;
  _open = false;
  _ariaControlsElement;

  /**
   * Track the open state of the expandable section host to update its children
   *
   *
   * @returns {boolean}
   * @default false
   */

  @api
  get open() {
    return this._open;
  }
  set open(value) {
    this._open = normalizeBoolean(value);
    reflectAttribute(this, 'open', this._open);

    // Wait for render to complete to avoid race conditions errors
    if (this._rendered) {
      this.handleOpenState();
    }
  }

  /**
   * Returns all slotted children of the expandable section.
   *
   * @return {Array}
   * @private
   */
  get slottedChildren() {
    const slot = this.template.querySelector('slot');
    return slot.assignedElements({ flatten: true });
  }

  /**
   * Retrieves the element with the attribute aria-controls.
   *
   * @return {Element|null} The element with the aria-controls attribute, or null if none exists.
   * @private
   */
  get ariaControlsElement() {
    this._ariaControlsElement = this.querySelector(`[aria-controls]`);
    return !this._ariaControlsElement && this._ariaControlsElement;
  }

  /**
   * Returns the value of the aria-controls attribute.
   *
   * @return {string|null}
   * @private
   */
  get ariaControlsValue() {
    return this._ariaControlsElement ? this._ariaControlsElement.getAttribute('aria-controls') : null;
  }

  /**
   * Returns the content element with ID matching the aria-controls.
   * The element must not have an aria-controls attribute.
   *
   * @return {Element|null}
   * @private
   */
  get contentElement() {
    return this.ariaControlsValue
      ? this.querySelector(`#${this.ariaControlsValue}:not([aria-controls])`)
      : null;
  }

  /**
   * Sets the aria-expanded attribute for the button element.
   *
   * @param {Element} button
   * @returns {void}
   * @private
   */
  handleAriaExpanded(button) {
    button.setAttribute('aria-expanded', this._open);
  }

  /**
   * Sets the aria-hidden attribute for the content element associated with the button.
   *
   * @param {Element} button
   * @returns {void}
   * @private
   */
  handleAriaHidden() {
    this.contentElement.setAttribute('aria-hidden', !this._open);
  }

  /**
   * Toggles the visibility of the content based on the state of the aria-expanded property.
   *
   * @param {Element} button - The button element that triggers the visibility toggle.
   * @returns {void}
   * @private
   */
  handleVisibility() {
    this.contentElement.style.display = this._open ? 'block' : 'none';
  }

  /**
   * Handles toggle actions for a button
   *
   * @param {object} button
   * @returns {void}
   * @private
   */
  handleToggleActions(button) {
    this.handleAriaExpanded(button);
    this.handleAriaHidden();
    this.handleVisibility();
  }

  /**
   * Checks if the given button element is a button or an input.
   * It also validates children of custom elements within the shadow root.
   *
   * Note: The shadowRoot validation is not reliable on renderedCallback (Race condition), use handleSlotChange instead.
   *
   * @param {Object} button
   * @returns {boolean}
   * @private
   */
  handleValidButtonElement(button) {
    const isHTMLButtonOrInput = (button) =>
      button instanceof HTMLButtonElement || button instanceof HTMLInputElement;

    return Array.from([button, ...(button.shadowRoot?.children || [])]).some(isHTMLButtonOrInput);
  }

  /**
   * Check if the element has role button.
   *
   * @param {HTMLElement} element
   * @returns {boolean}
   * @private
   */
  handleValidRoleButton(element) {
    return element.role === 'button';
  }

  /**
   * Determines validity of button element or element with role button.
   *
   * @param {Object} button
   * @returns {boolean}
   * @private
   */
  isValidButton(button) {
    return this.handleValidButtonElement(button) || this.handleValidRoleButton(button);
  }

  /**
   * Method to check if the element with aria-controls is a valid button.
   *
   * @returns {undefined}
   * @private
   */
  handleValidButtonAriaControls() {
    if (!this.isValidButton(this._ariaControlsElement)) {
      this._valid = false;
      console.error(
        'Invalid button element, please ensure that the element is one of the allowed types (button, input, element with role="button", or custom element).',
      );
    }
  }

  /**
   * Method to check if the element is the valid trigger button for the expandable section.
   * The method also validates against a direct child of the button (e.g. button > span)
   *
   * @param {Object} trigger - The clicked element to check.
   * @return {boolean}
   * @private
   */
  isTriggerValidButton(trigger) {
    const triggerAriaControls = trigger.getAttribute('aria-controls');
    const triggerWithParentAriaControls = trigger.parentElement.getAttribute('aria-controls');

    switch (true) {
      case triggerAriaControls === this.ariaControlsValue && this.isValidButton(trigger):
      case triggerWithParentAriaControls === this.ariaControlsValue &&
        this.isValidButton(trigger.parentElement):
        return true;
      default:
        return false;
    }
  }

  /**
   * Method to check if expandable section contains children.
   *
   * @returns {undefined}
   * @private
   */
  handleSlottedChildren() {
    const children = this.slottedChildren;

    if (children.length === 0) {
      this._valid = false;
      console.error(
        'Contracts for Expandable Section Manager have not been met, please ensure there are at least 2 elements. The first one should be a button, and the second one should be a container for the expandable content.',
      );
    }
  }

  /**
   * Method to check if the aria-controls exists and it is valid.
   * Set the aria-expanded attribute of the button element.
   *
   * @return {undefined}
   * @private
   */
  handleAriaControlsElement() {
    if (this.ariaControlsElement === null) {
      this._valid = false;
      console.error('The element with the aria-controls attribute was not found.');
      return;
    } else if (this.ariaControlsValue === '') {
      this._valid = false;
      console.error('The element with aria-controls was found, but its value cannot be empty.');
      return;
    } else {
      this.handleAriaExpanded(this._ariaControlsElement);
    }
  }

  /**
   * Method to check if the content element with ID matching the aria-controls exists.
   * Set the aria-hidden attribute and display property of the content element.
   *
   * @return {undefined}
   * @private
   */
  handleMatchingContentElement() {
    if (!this.contentElement) {
      this._valid = false;
      console.error('The content element with the ID value matching the aria-controls value was not found.');
      return;
    } else {
      this.handleAriaHidden();
      this.handleVisibility();
    }
  }

  /**
   * Method to check if there are multiple elements with the same aria-controls and same content ID.
   *
   * @return {void}
   * @private
   */
  handleUniqueElements() {
    const matchingAriaControlsElements = this.querySelectorAll(`[aria-controls="${this.ariaControlsValue}"]`);
    const matchingContentIdElements = this.querySelectorAll(
      `#${this.ariaControlsValue}:not([aria-controls])`,
    );

    if (matchingAriaControlsElements.length > 1) {
      this._valid = false;
      console.error(
        'Multiple elements with the same aria-controls value were found. Please ensure the value is unique.',
      );
      return;
    }

    if (matchingContentIdElements.length > 1) {
      this._valid = false;
      console.error(
        'Multiple content elements with the ID value matching the aria-controls value were found. ID must be unique',
      );
      return;
    }
  }

  /**
   * Method to check for contracts of expandable section.
   *
   * @returns {boolean}
   * @private
   */
  handleValidContracts() {
    this.hasOpenAttribute();
    this.handleSlottedChildren();
    this.handleAriaControlsElement();
    this.handleMatchingContentElement();
  }

  /**
   * Method to check if the host has an existing open attribute.
   * Change default open state if attribute exists
   *
   * @return {undefined}
   * @private
   */
  hasOpenAttribute() {
    if (this.hasAttribute('open')) {
      this._open = true;
    }
  }

  /**
   * Handles the open state to trigger toggle actions.
   *
   * @return {undefined}
   * @private
   */
  handleOpenState() {
    const trigger = this._ariaControlsElement;

    if (!this._valid) {
      return;
    }

    if (trigger) {
      this.handleToggleActions(trigger);
    }
  }

  /**
   * Handles the click event for a valid expandable section from the valid button trigger.
   *
   * @param {Event} e - The click event
   * @returns {void}
   */
  handleClick(e) {
    const { target } = e;
    const trigger = target;

    if (!this._valid) {
      return;
    }

    if (trigger && this.isTriggerValidButton(trigger)) {
      // Set the current open state to trigger toggle actions
      this.open = !this._open;
    }
  }

  /**
   * Event handler for keydown events for a valid expandable section fom the valid button trigger.
   *
   * @param {KeyboardEvent} e - The keydown event
   * @returns {void}
   */
  handleKeyDown(e) {
    const { target, key } = e;
    const trigger = target;

    if (!this._valid) {
      return;
    }

    if (trigger && this.isTriggerValidButton(trigger)) {
      if (key === 'Enter' || key === ' ') {
        e.preventDefault(); // Prevent issues with interactive elements
        // Set the current open state to trigger toggle actions
        this.open = !this._open;
      }
    }
  }

  /**
   * Event handler for slot change.
   *
   * @param {Event}
   */
  handleSlotChange() {
    if (!this._valid) {
      return;
    }

    this.handleValidButtonAriaControls();
    this.handleUniqueElements();
  }

  /**
   * When the component renders, we validate the contracts for the expandable section.
   */
  renderedCallback() {
    if (!this._rendered) {
      this._rendered = true;
      this.handleValidContracts();
    }
  }
}
