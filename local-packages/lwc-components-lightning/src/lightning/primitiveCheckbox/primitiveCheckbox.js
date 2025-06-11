import { LightningElement, api } from 'lwc';
import { normalizeBoolean, normalizeInput, reflectAttribute, hasSlotText } from 'lightning/primitiveUtils';
import 'lightning/primitiveThemeProvider';

export default class LightningPrimitiveCheckbox extends LightningElement {
  static shadowSupportMode = 'native';

  _name = 'checkbox-name';
  _value = 'checkbox-value';
  _disabled = false;
  _required = false;
  _invalid = false;
  _indeterminate = false;
  _checked = false;
  _labelHidden = false;
  _validityMessage;
  _checkboxElement;
  _helpTextElement;

  /**
   * The id of the inner input checkbox element.
   *
   * @type {string}
   */
  @api id = 'checkbox-id';

  /**
   * Makes the checkbox not mutable, interactable, or focusable.
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
   * Method to set the indeterminate state of the checkbox.
   *
   * @returns {void}
   */
  @api
  setIndeterminate() {
    this._indeterminate = true;
    this.checkbox.indeterminate = true;
  }

  /**
   * Method to remove the indeterminate state of the checkbox.
   *
   * @returns {void}
   */
  @api
  removeIndeterminate() {
    this._indeterminate = false;
    this.checkbox.indeterminate = false;
  }

  /**
   * Method to get the indeterminate state of the checkbox.
   *
   * @returns {boolean} - true if indeterminate, false if not
   */
  @api
  get indeterminate() {
    return this._indeterminate;
  }
  set indeterminate(value) {
    this._indeterminate = normalizeBoolean(value);
    reflectAttribute(this, 'indeterminate', this._indeterminate);
  }

  /**
   * Determines if the checkbox is checked or not.
   *
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
   * Visually hides the label.
   *
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
   * Property to get the checkbox element.
   *
   * @returns {HTMLElement} - the checkbox element
   */
  get checkbox() {
    this._checkboxElement = this._checkboxElement || this.template.querySelector('input[type="checkbox"]');

    return this._checkboxElement;
  }

  /**
   * Property to get the help text element.
   *
   * @returns {HTMLElement} - the help text element
   * @private
   */
  get helpText() {
    this._helpTextElement = this._helpTextElement || this.template.querySelector('[part="help-text"]');

    return this._helpTextElement;
  }

  /**
   * Returns the validity error of the input element
   */
  @api
  get validity() {
    return Promise.resolve().then(() => this.checkbox.validity);
  }

  /**
   * Returns the validity error of the input element
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
  get form() {
    return this.template.host.closest('form');
  }

  /**
   * If invalid, sets the aria-invalid attribute on the input element
   * and sets invalid attribute on custom element
   *
   * @private
   */
  isInvalid() {
    if (!this.checkbox.validity.valid) {
      this.invalid = true;
    } else {
      this.invalid = false;
    }
  }

  /**
   * Set the checked property on the input element. `checked` is not a natively
   * reflected property, so we explicitly set it here.
   *
   * @private
   */
  setCheckedProperty() {
    this.checkbox.checked = this._checked ? true : false;
  }

  /**
   * Event handler for the checkbox change event.
   * Used to dynmically set the checked attribute on the host element
   *
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
    this.isInvalid();
    this.handleValidity();
    this.setCheckedProperty();
  }

  /**
   * Event handler for the checkbox click event.
   * Used to dynmically set the focus attribute on the host element
   * @param {*} e
   */
  handleClick(e) {
    this.setAttribute('focus', '');
  }

  /**
   * Event handler for the checkbox blur event.
   * Used to dynmically remove the focus attribute on the host element
   * @param {*} e
   */
  handleBlur(e) {
    this.removeAttribute('focus');
  }

  /**
   * Set the validity message based on the validity state of the input element
   */
  handleValidity() {
    if (this.checkbox.validity.valueMissing) {
      this._validityMessage = `This field is required.`;
    } else {
      this._validityMessage = null;
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
        this.checkbox.setAttribute('aria-describedby', 'id-help-text');
        this.helpText.setAttribute('part', 'helptext visible');
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

  renderedCallback() {
    if (this.form) {
      this.form.addEventListener('submit', () => {
        this.handleValidity();
      });
    }
  }
}
