import { LightningElement, api, track } from 'lwc';
import { reflectAttribute, normalizeBoolean, normalizeInput, hasSlotText } from 'lightning/primitiveUtils';
import 'lightning/primitiveThemeProvider';

export default class inputRange extends LightningElement {
  static shadowSupportMode = 'native';

  _value = '50';
  _name;
  _form;
  _helptext;
  _max = '100';
  _min = '0';
  _disabled = false;
  _invalid = false;
  _labelHidden = false;
  _validityMessage;
  _inputElement;
  _helpTextElement;
  _formElement;

  @api id = 'input';
  @api label = 'Input Range Label';

  /**
   * The value of the input element
   * Value attribute is removed from custom element and delegated to the input element
   *
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
   * Makes the element not mutable, interactable, or focusable.
   *
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
   * The name of the input element, used on form submit.
   * Name attribute is removed from custom element and delegated to the input element
   *
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
   * Visually hides the label.
   * @type {boolean}
   */
  @api
  get labelHidden() {
    return this._labelHidden;
  }
  set labelHidden(value) {
    this._labelHidden = normalizeBoolean(value);
    reflectAttribute(this, 'label-hidden', this._labelHidden);
  }

  /**
   * Specifies the id of a form to associate the input with (that is, its form owner).
   * This attribute lets you place an input anywhere in the document but have it included with a form elsewhere in the document.
   * It can also override the form's action attribute.
   * Form attribute is removed from custom element and delegated to the input element
   *
   * @type {string}
   */
  @api
  get form() {
    return this._form;
  }
  set form(value) {
    this._form = normalizeInput(value);
  }

  /**
   * Specifies the minimum number allowed in the input.
   * Min attribute is removed from custom element and delegated to the input element
   *
   * @type {string}
   */
  @api
  get min() {
    return this._min;
  }
  set min(value) {
    this._min = normalizeInput(value);
  }

  /**
   * Specifies the maximum number allowed in the input.
   * Max attribute is removed from custom element and delegated to the input element
   *
   * Current bug with LWC does not allow for max, seems like its a reserved attribute of the compiler
   *
   * @type {string}
   */
  @api
  get max() {
    return this._max;
  }
  set max(value) {
    this._max = normalizeInput(value);
  }

  /**
   * Number that specifies the granularity that the value must adhere to.
   *
   * @type {string}
   *
   */
  @api
  get step() {
    return this._step;
  }
  set step(value) {
    this._step = normalizeInput(value);
  }

  /**
   * Allows customer to set invalid state on input
   * An example would be if the input is required and the value is empty on form submit,
   * since we are not using native form validation, we need to offer the ability set the invalid state on the input
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
   * Private getter to set the aria-invalid attribute on the input element
   */
  get ariaInvalid() {
    return this._ariaInvalid;
  }

  /**
   * Returns the validity object of the input element
   */
  @api
  get validity() {
    return Promise.resolve().then(() => this.input.validity);
  }

  /**
   * Returns the validity message of the input element
   */
  @api
  get validityMessage() {
    return this._validityMessage;
  }

  /**
   * Returns the closest form element
   * @returns {HTMLElement} - the form element
   * @private
   */
  get formElement() {
    this._formElement = this._formElement || this.template.host.closest('form');

    return this._formElement;
  }

  /**
   * If invalid, sets the aria-invalid attribute on the input element
   * and sets invalid attribute on custom element
   *
   * @private
   */
  isInvalid() {
    if (!this.input.validity.valid) {
      this.invalid = true;
      this._ariaInvalid = 'true';
    } else {
      this.invalid = false;
      this._ariaInvalid = 'false';
    }
  }

  /**
   * Returns the form's input element
   *
   * @returns {object} input element
   * @private
   */
  get input() {
    this._inputElement = this._inputElement || this.template.querySelector('input');

    return this._inputElement;
  }

  /**
   * Returns the help text element, if it exists
   * Used to dynamically add/remove the associated ID to the input element if help text is present
   *
   * @returns {object} help text element
   * @private
   */
  get helpText() {
    this._helpTextElement = this._helpTextElement || this.template.querySelector('[part="help-text"]');

    return this._helpTextElement;
  }

  /**
   * Validates the max and min values and if the value is between them.
   *
   * @param {number} max
   * @param {number} min
   * @param {number} value
   * @returns {boolean}
   */
  _validateRange(max, min, value) {
    const isSameValue = max === min;
    if (isSameValue) {
      console.warn(`Max and Min cannot be the same value: max is ${max} and min is ${min}`);
      return false;
    }

    const isOutOfRange = Number(value) < Number(min) || Number(value) > Number(max);
    if (isOutOfRange) {
      console.warn(`Value must be between ${min} and ${max}`);
      return false;
    }

    return true;
  }

  /**
   * Interpolates the value between the max and min values.
   *
   * @param {number} max
   * @param {number} min
   * @param {number} value
   * @returns {number}
   */
  _interpolateRange(max, min, value) {
    const range = max - min;
    const adjustedValue = value - min;

    return (adjustedValue / range) * 100;
  }

  /**
   * Slot change event on help text slot
   * Used to dynamically add/remove the associated ID to the input element if help text is present
   * Used to dynamically add "visible" part to the help text element if help text is found in the slot
   *
   * @param {*} e - slot change event
   */
  handleHelpTextSlotChange(e) {
    let childElements = e.target.assignedElements({ flatten: true });
    if (childElements.length > 0) {
      if (this.helpText) {
        this.helpText.id = 'id-help-text';
        this.input.setAttribute('aria-describedby', 'id-help-text');
        this.helpText.setAttribute('part', 'help-text visible');
      }
    }
  }

  /**
   * Slot change event on the label slot
   * Used to check if the label has a slotted value, if not, we throw an error that one must be included
   * @param {*} e - slot change event
   */
  handleLabelSlotChange(e) {
    !hasSlotText(e) && console.error('A label value must be included for all form elements.');
  }

  /**
   * On blur event handler
   * Used to remove the "active" attribute from the custom element since the user is no longer interacting with it
   * Checks validity of the input element and sets the validity state
   *
   * @param {*} e - blur event
   * @returns {Object} - validity state
   */
  handleBlur(e) {
    this._value = e.target.value;
    this.removeAttribute('active');
    this.removeAttribute('focus');
    this.handleValidity();
    this.isInvalid();
  }

  /**
   * Set the validity message based on the validity state of the input element
   *
   * @private
   */
  handleValidity() {
    if (this.input.validity.valueMissing) {
      this._validityMessage = `This field is required.`;
    } else if (this.input.validity.rangeOverflow) {
      this._validityMessage = `Value exceeds maximum of ${this.max}.`;
    } else if (this.input.validity.rangeUnderflow) {
      this._validityMessage = `Value is less than minimum of ${this.min}.`;
    } else {
      this._validityMessage = null;
    }
  }

  /**
   * On click event handler
   * Used to focus the input element when the custom element is clicked
   *
   * @param {Object} e - click event
   */
  handleClick(e) {
    if (!this._disabled) {
      this.focus();
    }
  }

  /**
   * On input event handler
   * Used to set the "active" attribute on the custom element when the user is interacting with it
   * Checks validity of the input element and sets the validity state via aria-invalid
   *
   * @param {Object} e - input event
   */
  handleInput(e) {
    if (!this._disabled) {
      this.setAttribute('active', '');
      this._value = e.target.value;
    }
  }

  @api
  focus() {
    this.input.focus();
    this.setAttribute('focus', '');
  }

  renderedCallback() {
    const { _max: max, _min: min, _value: value } = this;
    let indicatorValue;

    if (!this._validateRange(max, min, value)) {
      return;
    }
    if (max !== '100' || min !== '0') {
      indicatorValue = this._interpolateRange(max, min, value);
    } else {
      indicatorValue = value;
    }

    this.input.setAttribute(
      'style',
      `background: linear-gradient(to right,currentcolor, ${indicatorValue}%,var(--sds-c-inputrange-track-color) ${indicatorValue}%)`,
    );

    if (this.formElement) {
      this.formElement.addEventListener('submit', () => {
        this.handleValidity();
        this.isInvalid();
      });
    }
  }
}
