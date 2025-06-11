import { LightningElement, api } from 'lwc';
import { reflectAttribute, normalizeInput } from 'lightning/primitiveUtils';
import 'lightning/primitiveThemeProvider';

export default class LightningPrimitiveListboxOption extends LightningElement {
  static shadowSupportMode = 'native';

  _id;
  _optionsElement;

  /**
   * Sets the role attribute of the component.
   */
  connectedCallback() {
    this.setAttribute('role', 'option');
  }

  /**
   * Gets the ID of the Listbox Option.
   * @type {string}
   * @returns {string} The ID of the Listbox Option.
   */
  @api
  get id() {
    return this._id;
  }
  set id(value) {
    this._id = normalizeInput(value);
    reflectAttribute(this, 'id', this._id);
  }

  /**
   * Returns the option element.
   * @returns {Element} The option element.
   */
  get option() {
    this._optionsElement = this._optionsElement || this.template.querySelector('[part="listbox-option"]');

    return this._optionsElement;
  }

  /**
   * Handles the click event on the option.
   * @param {Event} e - The click event.
   */
  handleClick(e) {
    this.dispatchEvent(new CustomEvent('click'));
  }

  /**
   * Handles the blur event on the option.
   * @param {Event} e - The blur event.
   */
  handleBlur(e) {
    this.dispatchEvent(new CustomEvent('blur'));
  }

  /**
   * Validates the component and logs an error if the id is not set.
   */
  renderedCallback() {
    if (!this._id) {
      console.error('ListboxOption: id is required');
    }
  }
}
