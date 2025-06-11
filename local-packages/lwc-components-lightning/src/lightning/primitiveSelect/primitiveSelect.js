import { LightningElement, api } from 'lwc';
import { reflectAttribute, normalizeBoolean, normalizeInput, hasSlotText } from 'lightning/primitiveUtils';
import 'lightning/primitiveThemeProvider';

export default class LightningPrimitiveSelect extends LightningElement {
  static shadowSupportMode = 'native';

  _id = 'select-id';
  _options = [];
  _disabled = false;
  _required = false;
  _name = 'select';
  _labelHidden = false;
  _multiple = false;
  _invalid = false;
  _value;
  _validityMessage;
  _selectElement;
  _helpTextElement;
  _formElement;

  /**
   * The id of the select element.
   * @type {string}
   */
  @api
  get id() {
    return this._id;
  }
  set id(value) {
    this._id = normalizeInput(value);
  }

  /**
   * If present, the select is disabled and users cannot interact with it.
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
   * The name of the select element.
   * @type {string}
   * @default select
   */
  @api
  get name() {
    return this._name;
  }
  set name(value) {
    this._name = normalizeInput(value);
  }

  /**
   * If present, the select must have a selected value before submitting a form.
   * @type {boolean}
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
   * If present, the select allows multiple selections.
   * @type {boolean}
   * @default false
   */
  @api
  get multiple() {
    return this._multiple;
  }
  set multiple(value) {
    this._multiple = normalizeBoolean(value);
    reflectAttribute(this, 'multiple', this._multiple);
  }

  /**
   * The size of the select element.
   * @type {string}
   */
  @api size;

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
   * Returns the select options
   * @type {array}
   * @readonly
   */
  @api
  get options() {
    return this._options;
  }

  /**
   * Returns the selected value
   * @type {string}
   * @readonly
   */
  @api
  get value() {
    return this._value;
  }

  /**
   * Property to get the select element.
   * @returns {HTMLElement} - the select element
   * @private
   */
  get select() {
    this._selectElement = this._selectElement || this.template.querySelector('select');

    return this._selectElement;
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

  @api
  get validity() {
    return Promise.resolve().then(() => this.select.validity);
  }

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
    if (!this.select.validity.valid) {
      this.invalid = true;
    } else {
      this.invalid = false;
    }
  }

  /**
   * Validates the input element and sets the validity state
   * Sets the "invalid" attribute on the custom element if the input is invalid
   * Sets the "aria-invalid" attribute on the input element if the input is invalid
   *
   * @private
   */
  handleValidity() {
    if (this.select.validity.valueMissing) {
      this._validityMessage = `select: This field ${this.name} is required.`;
    } else {
      this._validityMessage = null;
    }
  }

  /**
   * Change handler for the select element when its value changes
   * @param {*} e - the change event
   */
  handleChange(e) {
    if (!this._disabled) {
      this._value = this.select[this.select.options.selectedIndex].value;
      this.isInvalid();
      this.handleValidity();
    }
    this.dispatchEvent(new CustomEvent('change'));
  }

  /**
   * Blur handler for the select element when it loses focus
   * @param {*} e
   */
  handleBlur(e) {
    this.removeAttribute('focus');
  }

  /**
   * On click event handler
   * Used to focus the input element when the custom element is clicked
   * @param {Object} e - click event
   */
  handleClick(e) {
    if (!this._disabled) {
      this.setAttribute('focus', '');
      this.select.focus();
    }
  }

  /**
   * Slot change event on the default slot
   * Since the select element is not supported in slots, we are using the slotchange event to get the options
   * @param {*} e
   */
  handleSlotChange(e) {
    const childNodes = e.target.assignedNodes({ flatten: true });
    const options = [...childNodes].reduce((arr, node) => {
      if (node instanceof HTMLOptionElement) {
        arr.push({ value: node.value, name: node.text, selected: node.selected });
      }
      return arr;
    }, []);
    options.forEach((option) => {
      const optionEl = document.createElement('option');
      optionEl.value = option.value;
      optionEl.selected = option.selected;
      optionEl.text = option.name;
      if (option.selected) {
        this._value = option.value;
      }
      this.select.appendChild(optionEl);
    });
    this._options = options.length > 0 && options;
    e.target.style.display = 'none';
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

  renderedCallback() {
    if (this.form) {
      this.form.addEventListener('submit', () => {
        this.handleValidity();
        this.isInvalid();
      });
    }
  }
}
