import { LightningElement, api } from 'lwc';
import { normalizeBoolean, normalizeInput, reflectAttribute, normalizeString } from 'lightning/primitiveUtils';
import 'lightning/primitiveThemeProvider';

export default class LightningPrimitiveBaseButton extends LightningElement {
  static shadowSupportMode = 'native';

  /**
   * Internal component fields
   */
  _disabled = false;
  _form;
  _tabIndex;
  _type;
  _variant;
  _buttonElement;
  _formElement;

  /**
   * defines a string value that labels an interactive element
   *
   * @type {string}
   */
  @api ariaLabel;

  /**
   * Defines a string value that describes or annotates the current element.
   * Not currently supported by LWC so we implement it manually.
   *
   * @type {string}
   */
  @api ariaDescription;

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
   * The id of the form that the button belongs to.
   *
   * @type {string}
   */
  @api
  get form() {
    return this._form;
  }
  set form(value) {
    this._form = value;
  }

  /**
   * Optional identifier for the button.
   *
   * @type {string}
   */
  @api name;

  /**
   * Provides semantic meaning to content, allowing screen readers and other
   * tools to present and support interaction with object in a way that is
   * consistent with user expectations of that type of object.
   *
   * @type {string}
   */
  @api role;

  /**
   * Allows HTML elements to be focusable or prevent them from being
   * sequentially focusable
   *
   * @type {number}
   */
  @api
  get tabIndex() {
    return this._tabIndex;
  }
  set tabIndex(value) {
    this._tabIndex = normalizeInput(value);
  }

  /**
   * Text representing advisory information related to the element it belongs to.
   *
   * @type {string}
   */
  @api title;

  /**
   * Specifies the type of button.
   *
   * @type {string}
   */
  @api
  get type() {
    return this._type;
  }
  set type(value) {
    this._type = normalizeString(value, {
      fallbackValue: 'button',
      validValues: ['button', 'reset', 'submit'],
    });
  }

  /**
   * Optional value for the button to be submitted with a form.
   *
   * @type {string}
   */
  @api value;

  /**
   * Optional interface to define a button variant.
   *
   * @type {string}
   */
  @api
  get variant() {
    return this._variant;
  }
  set variant(value) {
    this._variant = value;
    reflectAttribute(this, 'variant', this._variant);
  }

  /**
   * Retrieve the form element that this button belongs to.
   *
   * @return {HTMLElement} - The form element.
   */
  getForm() {
    if (this._form) {
      this._formElement = this._formElement || this.template.host.closest(`#${this._form}`);
    }

    return this._formElement;
  }

  /**
   * Retrieve the button element.
   * @return {HTMLElement} - The button element.
   */
  get button() {
    this._buttonElement = this._buttonElement || this.template.querySelector('button');

    return this._buttonElement;
  }

  /**
   * Handle the standard click event
   *
   * Workaround for lack of elementInternals support in LWC. Tradeoff is finding
   * the form will fail if the form element lives in a shadow root outside of the
   * shadow boundary that contains this component's host element.
   */
  handleClick() {
    const form = this.getForm();
    if (form) {
      form.requestSubmit();
    }
    if (this.button.hasAttribute('aria-pressed')) {
      if (this.ariaPressed === 'false') {
        this.ariaPressed = 'true';
      } else {
        this.ariaPressed = 'false';
      }
    }
  }

  /**
   * Handle the standard focus event
   */
  handleFocus() {
    this.setAttribute('focus', '');
  }

  /**
   * Handle the standard blur event
   */
  handleBlur() {
    this.removeAttribute('focus');
  }
}
