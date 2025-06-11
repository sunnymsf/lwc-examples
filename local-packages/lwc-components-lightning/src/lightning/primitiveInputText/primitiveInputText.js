import { LightningElement, api, track } from 'lwc';
import { reflectAttribute, normalizeBoolean, normalizeInput, hasSlotText } from 'lightning/primitiveUtils';
import 'lightning/primitiveThemeProvider';

export default class LightningPrimitiveInputText extends LightningElement {
  static shadowSupportMode = 'native';

  _value = '';
  _name;
  _form;
  _placeholder;
  _pattern;
  _type = 'text';
  _role = 'textbox';
  _helptext;
  _minlength;
  _maxlength;
  _disabled = false;
  _readonly = false;
  _required = false;
  _invalid = false;
  _labelHidden = false;
  _validityMessage;
  _inputElement;
  _formElement;

  @api id = 'input';

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
   * Specifies the type of the input element.
   *
   * @type {string}
   */
  @api
  get type() {
    const supportedTypes = ['text', 'search', 'tel', 'url', 'email', 'password'];
    if (supportedTypes.includes(this._type)) {
      return this._type;
    } else {
      console.warn(
        'Unsupported Input type. For a list of supported Input types, please visit https://sfdc.co/input-text-spec',
      );
    }
  }
  set type(value) {
    this._type = normalizeInput(value);
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
   * Specifies the minimum number of characters allowed in the input.
   * Will invalidate if fewer characters are entered.
   * Minlength attribute is removed from custom element and delegated to the input element
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
   * Specifies the maximum number of characters allowed in the input.
   * Will invalidate if more characters are entered.
   * Maxlength attribute is removed from custom element and delegated to the input element
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
   * Specifies a regular expression that an input element's value is checked against.
   * Pattern attribute is removed from custom element and delegated to the input element
   *
   * @type {RegExp}
   */
  @api
  get pattern() {
    return this._pattern;
  }
  set pattern(value) {
    this._pattern = value;
  }

  /**
   * Specifies the role of the input element.
   * Role attribute is removed from custom element and delegated to the input element
   *
   * @type {string}
   * @default textbox
   */
  @api
  get role() {
    return this._role;
  }
  set role(value) {
    this._role = normalizeInput(value);
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
    return this.template.querySelector('[part="help-text"]');
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
    this.dispatchEvent(new CustomEvent('blur'));
    this.removeAttribute('active');
    this.removeAttribute('focus');
    this.handleValidity();
    this.isInvalid();
  }

  /**
   * Validates the input element and sets the validity state
   * Sets the "invalid" attribute on the custom element if the input is invalid
   * Sets the "aria-invalid" attribute on the input element if the input is invalid
   *
   * @private
   */
  handleValidity() {
    if (this.input.validity.valueMissing) {
      this._validityMessage = 'This field is required.';
    } else if (this.input.validity.typeMismatch) {
      if (this.type === 'email') {
        this._validityMessage = 'Please enter a valid email address.';
      } else if (this.type === 'url') {
        this._validityMessage = 'Please enter a valid URL.';
      }
    } else if (this.input.validity.patternMismatch) {
      this._validityMessage = 'Please match the requested format.';
    } else if (this.input.validity.tooShort) {
      this._validityMessage = 'Please lengthen this text to ' + this._minlength + ' characters or more.';
    } else if (this.input.validity.tooLong) {
      this._validityMessage = 'Please shorten this text to ' + this._maxlength + ' characters or less.';
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
    if (!this._disabled || !this._readonly) {
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
    if (!this._disabled || !this._readonly) {
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
    if (this.formElement) {
      this.formElement.addEventListener('submit', () => {
        this.handleValidity();
        this.isInvalid();
      });
    }
  }
}
