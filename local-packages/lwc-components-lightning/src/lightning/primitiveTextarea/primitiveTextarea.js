import { LightningElement, api } from 'lwc';
import {
  dispatchCustomEvent,
  reflectAttribute,
  normalizeBoolean,
  normalizeInput,
  hasSlotText,
} from 'lightning/primitiveUtils';
import 'lightning/primitiveThemeProvider';

export default class LightningPrimitiveTextarea extends LightningElement {
  static shadowSupportMode = 'native';

  _ariaInvalid = false;
  _cols;
  _disabled = false;
  _helptext;
  _invalid = false;
  _maxlength;
  _minlength;
  _name;
  _placeholder;
  _readonly = false;
  _required = false;
  _rows;
  _spellcheck;
  _validityMessage;
  _value;
  _wrap;
  _helpTextElement;
  _textAreaElement;
  _formElement;

  @api id = 'textarea-id';
  @api label = 'Textarea Label';

  /**
   * Private getter to set the aria-invalid attribute on the textarea element
   */
  get ariaInvalid() {
    return this._ariaInvalid;
  }

  /**
   * The visible width of the text control, in average character widths.
   *
   * @type {string}
   */
  @api
  get cols() {
    return this._cols;
  }
  set cols(value) {
    this._cols = normalizeInput(value);
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
   * Returns the closest form element
   * @returns {HTMLElement} - the form element
   * @private
   */
  get formElement() {
    this._formElement = this._formElement || this.template.host.closest('form');

    return this._formElement;
  }

  /**
   * Returns the help text element, if it exists
   * Used to dynamically add/remove the associated ID to the textarea element if help text is present
   *
   * @returns {object} help text element
   * @private
   */
  get helpText() {
    this._helpTextElement = this._helpTextElement || this.template.querySelector('[part="help-text"]');

    return this._helpTextElement;
  }

  /**
   * Allows customer to set invalid state on textarea
   * An example would be if the textarea is required and the value is empty on form submit,
   * since we are not using native form validation, we need to offer the ability set the
   * invalid state on the textarea
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
   * Specifies the maximum number of characters allowed in the textarea.
   * Will invalidate if more characters are entered.
   *
   * Current bug with LWC does not allow for maxlength, seems like its a reserved attribute of the compiler
   *
   * @type {string}
   */
  @api
  get maxLength() {
    return this._maxlength;
  }
  set maxLength(value) {
    this._maxlength = normalizeInput(value);
  }

  /**
   * Specifies the minimum number of characters allowed in the textarea.
   * Will invalidate if fewer characters are entered.
   *
   * @type {string}
   */
  @api
  get minLength() {
    return this._minlength;
  }
  set minLength(value) {
    this._minlength = normalizeInput(value);
  }

  /**
   * The name of the textarea element, used on form submit.
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
   * Placeholder text of the textarea element.
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
   * Readonly indicates that the user cannot modify the value of the input.
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
   * Determines if the textarea is required or not.
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
   * The number of visible text lines for the control.
   *
   * @type {string}
   */
  @api
  get rows() {
    return this._rows;
  }
  set rows(value) {
    this._rows = normalizeInput(value);
  }

  /**
   * Specifies whether the textarea is subject to spell checking by the underlying browser/OS.
   *
   * @type {string}
   */
  @api
  get spellcheck() {
    return this._spellcheck;
  }
  set spellcheck(value) {
    this._spellcheck = normalizeInput(value);
  }

  /**
   * Returns the form's textarea element
   *
   * @returns {object} textarea element
   * @private
   */
  get textarea() {
    this._textAreaElement = this._textAreaElement || this.template.querySelector('textarea');

    return this._textAreaElement;
  }

  /**
   * Returns the validity error of the input element
   */
  @api
  get validity() {
    return Promise.resolve().then(() => this.textarea.validity);
  }

  /**
   * Returns the validity message of the input element
   */
  @api
  get validityMessage() {
    return this._validityMessage;
  }

  /**
   * The value of the textarea element
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
   * Indicates how the control should wrap the value for form submission.
   *
   * @type {string}
   */
  @api
  get wrap() {
    return this._wrap;
  }
  set wrap(value) {
    this._wrap = normalizeInput(value);
  }

  /**
   * On blur event handler
   * Used to remove the "active" attribute from the custom element since the user is no longer interacting with it
   * Checks validity of the textarea element and sets the validity state
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
   * On click event handler
   * Used to focus the textarea element when the custom element is clicked
   *
   * @param {Object} e - click event
   */
  handleClick() {
    if (!this._disabled || !this._readonly) {
      this.textarea.focus();
      this.setAttribute('focus', '');
    }
  }

  /**
   * Slot change event on help text slot
   * Used to dynamically add/remove the associated ID to the textarea element if help text is present
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
   * Checks validity of the textarea element and sets the validity state via aria-invalid
   *
   * @param {Object} e - input event
   */
  handleInput(e) {
    if (!this._disabled || !this._readonly) {
      this.setAttribute('active', '');
      dispatchCustomEvent({
        eventName: 'input',
        eventOrigin: this,
        eventDetails: {
          name: this.tagName.toLowerCase(),
          value: e.target.value,
        },
      });
    }
  }

  /**
   * Validates the textarea element and sets the validity state
   * Sets the "invalid" attribute on the custom element if the input is invalid
   * Sets the "aria-invalid" attribute on the input element if the input is invalid
   *
   * @private
   */
  handleValidity() {
    if (this.textarea.validity.valueMissing) {
      this._validityMessage = 'This field is required.';
    } else if (this.textarea.validity.tooShort) {
      this._validityMessage =
        'Please lengthen this text to ' + this.textarea.getAttribute('minlength') + ' characters or more.';
    } else if (this.textarea.validity.tooLong) {
      this._validityMessage =
        'Please shorten this text to ' + this.textarea.getAttribute('maxlength') + ' characters or less.';
    } else {
      this._validityMessage = null;
    }
  }

  /**
   * If invalid, sets the aria-invalid attribute on the textarea element
   * and sets invalid attribute on custom element
   *
   * @private
   */
  isInvalid() {
    if (!this.textarea.validity.valid) {
      this.invalid = true;
      this._ariaInvalid = 'true';
    } else {
      this.invalid = false;
      this._ariaInvalid = 'false';
    }
  }

  renderedCallback() {
    if (this.formElement) {
      this.formElement.addEventListener('submit', () => {
        this.handleValidity();
        this.isInvalid();
      });
    }
  }
}
