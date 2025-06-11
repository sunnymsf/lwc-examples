import { LightningElement, api } from 'lwc';
import { normalizeBoolean, normalizeInput, reflectAttribute } from 'lightning/primitiveUtils';
import 'lightning/primitiveThemeProvider';

export default class LightningPrimitiveProgress extends LightningElement {
  static shadowSupportMode = 'native';

  _id = 'progress-id';
  _labelId = 'label-id';
  _labelHidden = false;
  _max = '100';
  _min = '0';
  _indicatorValue;
  _value = '0';

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
   * The id of the progress bar. Associates the label with the progress.
   *
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
   * The interpolated value converted to a CSS property and percentage.
   *
   * @type {string}
   */
  get indicatorValue() {
    return this._indicatorValue;
  }
  set indicatorValue(value) {
    this._indicatorValue = `inline-size: ${normalizeInput(value)}%`;
  }

  /**
   * The maximum value of the progress range.
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
   * The minimum value of the progress range.
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
   * The current value of the progress.
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
   * Lifecycle call after every render of the component.
   */
  renderedCallback() {
    const { _max: max, _min: min, _value: value } = this;

    if (!this._validateRange(max, min, value)) {
      return;
    }
    if (max !== '100' || min !== '0') {
      this.indicatorValue = this._interpolateRange(max, min, value);
    } else {
      this.indicatorValue = value;
    }
  }
}
