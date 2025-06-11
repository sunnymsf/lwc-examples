import { LightningElement, api } from 'lwc';
import { reflectAttribute, normalizeBoolean, normalizeInput } from 'lightning/primitiveUtils';
import 'lightning/primitiveThemeProvider';

export default class LightningPrimitiveLink extends LightningElement {
  static shadowSupportMode = 'native';

  _href = '#';
  _ariaDisabled;
  _ariaLabel;
  _linkElement;

  @api target;
  @api rel;
  @api download;
  @api hreflang;
  @api type;
  @api referrerpolicy;
  @api ping;

  @api
  get href() {
    return this._href;
  }
  set href(value) {
    this._href = normalizeInput(value);
  }

  @api
  get disabled() {
    return this._disabled;
  }
  set disabled(value) {
    this._disabled = normalizeBoolean(value);
    this._ariaDisabled = this._disabled ? 'true' : 'false';
    reflectAttribute(this, 'disabled', this._disabled);
  }

  /**
   * Defines a string value that labels an interactive element.
   *
   * @type {string}
   */
  get ariaLabel() {
    return this._ariaLabel;
  }

  /**
   * Set the aria-label using the label value.
   * Reflect the label on the host instead of aria-label to avoid the screen reader duplicate announcement
   *
   * @type {string}
   */
  @api
  get label() {
    return this._label;
  }
  set label(value) {
    this._ariaLabel = value;
  }

  get ariaDisabled() {
    return this._ariaDisabled;
  }

  get link() {
    this._linkElement = this._linkElement || this.template.querySelector('[part="link"]');

    return this._linkElement;
  }

  handleSlotChange(e) {
    const nodes = e.target.assignedElements({ flatten: true });
    nodes.find((node) => {
      if (node instanceof HTMLAnchorElement || node instanceof HTMLButtonElement) {
        console.error('Anchor element found in slot. Slotted children cannot be interactive elements.');
      }
    });
  }

  handleClick(e) {
    if (this._href === '#' || this._href === 'javascript:void(0)' || this._disabled) {
      e.preventDefault();
    }
  }

  handleFocus(e) {
    this.setAttribute('focus', '');
  }

  handleBlur(e) {
    this.removeAttribute('focus');
  }

  handleKeyDown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      this.link.click();
    }
  }
}
