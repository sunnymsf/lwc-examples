import { LightningElement, api } from 'lwc';
import { reflectAttribute, normalizeBoolean, normalizeInput, hasSlotText } from 'lightning/primitiveUtils';
import 'lightning/primitiveThemeProvider';

export default class LightningPrimitiveInputCounter extends LightningElement {
  static shadowSupportMode = 'native';

  _ariaInvalid = false;
  _disabled = false;
  _form;
  _invalid = false;
  _max;
  _min;
  _name;
  _placeholder;
  _readonly = false;
  _required = false;
  _step = '1';
  _stepDownLabel;
  _stepUpLabel;
  _validityMessage;
  _value;
  _helpTextElement;
  _inputElement;

  @api id = 'input';
  @api label = 'Input Counter Label';

  /**
   * Indicates the entered value does not conform to the format expected.
   *
   * @type {boolean}
   * @default false
   */
  @api
  get ariaInvalid() {
    return this._ariaInvalid;
  }
  set ariaInvalid(value) {
    this._ariaInvalid = normalizeBoolean(value);
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
   * The maximum valid value.
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
   * The minimum valid value.
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
   * Placeholder text of the input element.
   * Placeholder attribute is removed from custom element and delegated to the input element
   *
   * @type {string}
   */
  @api
  get placeholder() {
    return this._placeholder;
  }
  set placeholder(value) {
    this._placeholder = normalizeInput(value);
  }

  /**
   * Readonly is a Boolean attribute which, if present, indicates that the user cannot modify the value of the input.
   *
   * @type {boolean}
   * @default false
   */
  @api
  get readOnly() {
    return this._readonly;
  }
  set readOnly(value) {
    this._readonly = normalizeBoolean(value);
    reflectAttribute(this, 'readonly', this._readonly);
  }

  /**
   * Determines if the form control is required or not.
   *
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
   * The granularity that the value must adhere to
   * @type {string}
   */
  @api
  get step() {
    return this._step;
  }
  set step(value) {
    this._step = normalizeInput(value);
  }

  /**
   * Label for the step down button
   * @type {string}
   */
  @api
  get stepDownLabel() {
    return this._stepDownLabel ? this._stepDownLabel : `Decrease value by ${this.step}`;
  }
  set stepDownLabel(value) {
    this._stepDownLabel = normalizeInput(value);
  }

  /**
   * Label for the step up button
   * @type {string}
   */
  @api
  get stepUpLabel() {
    return this._stepUpLabel ? this._stepUpLabel : `Increase value by ${this.step}`;
  }
  set stepUpLabel(value) {
    this._stepUpLabel = normalizeInput(value);
  }

  /**
   * Returns the validity object of the input element
   */
  @api
  get validity() {
    return Promise.resolve().then(() => this.input.validty);
  }

  /**
   * Returns the validity message of the input element
   */
  @api
  get validityMessage() {
    return this._validityMessage;
  }

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
   * On blur event handler
   * Used to remove the "active" attribute from the custom element since the user is no longer interacting with it
   * Checks validity of the input element and sets the validity state
   *
   * @param {*} e - blur event
   * @returns {Object} - validity state
   */
  handleBlur(e) {
    this._value = e.target.value;
    this.hasAttribute('active') && this.removeAttribute('active');
    this.handleValidity();
    this.isInvalid();
    this.removeAttribute('focus');
  }

  /**
   * On click event handler
   * Used to focus the input element when the custom element is clicked
   *
   * @param {Object} e - click event
   */
  handleClick() {
    if (!this._disabled || !this._readonly) {
      this.input.focus();
      this.setAttribute('focus', '');
    }
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
   * On input event handler
   * Used to set the "active" attribute on the custom element when the user is interacting with it
   * Checks validity of the input element and sets the validity state via aria-invalid
   *
   * @param {Object} e - input event
   */
  handleInput() {
    if (!this._disabled || !this._readonly) {
      !this.hasAttribute('active') && this.setAttribute('active', '');
    }
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
   * Handle the stepUp() on the input element
   */
  handleStepUp() {
    this.input.stepUp();
  }

  /**
   * Handle the stepDown() on the input element
   */
  handleStepDown() {
    this.input.stepDown();
  }

  renderedCallback() {
    // Check if rendered for the first time and if so, set the validity state
    if (!this._rendered) {
      this._rendered = true;
      this.handleValidity();
      this.isInvalid();
    }
  }
}
