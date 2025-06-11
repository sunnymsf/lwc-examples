import { LightningElement, api } from 'lwc';
import { reflectAttribute, normalizeBoolean, normalizeInput, hasSlotText } from 'lightning/primitiveUtils';
import 'lightning/primitiveThemeProvider';

export default class LightningPrimitiveRadio extends LightningElement {
  static shadowSupportMode = 'native';
  static delegatesFocus = true;

  _name = 'radio-name';
  _value = 'radio-value';
  _disabled = false;
  _checked = false;
  _required = false;
  _invalid = false;
  _validityMessage;

  @api id = 'radio-id';

  /**
   * Makes the radio not mutable, interactable, or focusable.
   * @type {boolean}
   * @default false
   */
  @api
  get disabled() {
    return this._disabled;
  }
  set disabled(value) {
    this._disabled = normalizeBoolean(value);
    reflectAttribute(this, 'disabled', this._disabled);
  }

  /**
   * Determines if the form control is required or not.
   * @type {boolean}
   * @default false
   */
  @api
  get required() {
    return this._required;
  }
  set required(value) {
    this._required = normalizeBoolean(value);
    reflectAttribute(this, 'required', this._required);
  }

  /**
   * The name of the input element, used on form submit.
   * Name attribute is removed from custom element and delegated to the input element
   * @type {string}
   */
  @api
  get name() {
    return this._name;
  }
  set name(value) {
    this._name = normalizeInput(value);
  }

  /**
   * The value of the input element
   * Value attribute is removed from custom element and delegated to the input element
   * @type {string}
   */
  @api
  get value() {
    return this._value;
  }
  set value(value) {
    this._value = normalizeInput(value);
  }

  /**
   * Determines if the checkbox is checked or not.
   * @type {boolean}
   * @default false
   */
  @api
  get checked() {
    return this._checked;
  }
  set checked(value) {
    this._checked = normalizeBoolean(value);
    reflectAttribute(this, 'checked', this._checked);
  }

  /**
   * Determines if the checkbox is invalid or not.
   * Invalid attribute is removed from custom element and delegated to the input element
   * @type {boolean}
   */
  @api
  get invalid() {
    return this._invalid;
  }
  set invalid(value) {
    this._invalid = normalizeBoolean(value);
    reflectAttribute(this, 'invalid', this._invalid);
  }

  /**
   * Sets help text for screen readers
   * @type {string}
   */
  @api helpMessage;

  /**
   * Property to get the radio element.
   * @returns {HTMLElement} - the radio element
   */
  get radio() {
    if (!this._cachedRadio) {
      this._cachedRadio = this.template.querySelector('input[type="radio"]');
    }
    return this._cachedRadio;
  }

  /**
   * Returns the validity error of the input element
   */
  @api
  get validity() {
    return Promise.resolve().then(() => this.radio.validity);
  }

  /**
   * Returns the validity error of the input element
   */
  @api
  get validityMessage() {
    return this._validityMessage;
  }

  /**
   * If invalid, sets the aria-invalid attribute on the input element
   * and sets invalid attribute on custom element
   * @private
   */
  isInvalid() {
    if (!this.radio.validity.valid) {
      this.invalid = true;
    } else {
      this.invalid = false;
    }
  }

  /**
   * Returns the closest form element
   * @returns {HTMLElement} - the form element
   * @private
   */
  get form() {
    return this.template.host.closest('form');
  }

  /**
   * Store validity message in private variable
   * @private
   */
  handleValidity() {
    if (this.radio.validity.valueMissing) {
      this._validityMessage = `inputRadio: This field "${this.value}" is required.`;
    } else {
      this._validityMessage = null;
    }
  }

  /**
   * Event handler for the radio change event.
   * Used to dynmically set the checked attribute on the host element
   * @param {*} e
   */
  handleChange(e) {
    if (this.hasAttribute('checked')) {
      this._checked = false;
      this.removeAttribute('checked');
    } else {
      this._checked = true;
      this.setAttribute('checked', '');
    }
    this.dispatchEvent(new CustomEvent('change'));
  }

  /**
   * Event handler when the radio is blurred and loses focus.
   * @param {*} e
   */
  handleBlur(e) {
    this.dispatchEvent(new CustomEvent('blur'));
    this._value = e.target.value;
  }

  /**
   * Slot change event on the label slot
   * Used to check if the label has a slotted value, if not, we throw an error that one must be included
   * @param {*} e - slot change event
   */
  handleLabelSlotChange(e) {
    !hasSlotText(e) && console.error('A label value must be included for all form elements.');
  }

  renderedCallback() {
    if (this.form) {
      this.form.addEventListener('submit', () => {
        this.handleValidity();
        this.isInvalid();
      });
    }
  }
}
