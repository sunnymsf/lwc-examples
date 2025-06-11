import { LightningElement, api } from 'lwc';
import { reflectAttribute, normalizeBoolean, hasSlotText } from 'lightning/primitiveUtils';
import 'lightning/primitiveThemeProvider';

export default class LightningPrimitiveInputTime extends LightningElement {
  static shadowSupportMode = 'native';

  _value = '';
  _name = 'input-time';
  _isoTime = '';
  _hour = '';
  _minute = '';
  _locale = 'en-US';
  _invalid = false;
  _validityMessage;
  _validTime = true;
  _disabled = false;
  _readonly = false;
  _required = false;
  _timeObject = {};
  _inputElement;
  _helpTextElement;

  // Use to calculate time in Date API
  YEAR = 2000;
  MONTH = 0; // 0-indexed (January)
  DAY = 1;

  connectedCallback() {
    this._value = this._value ? this._value : this.currentTime;
    this._isoTime = this._convertToIsoTime(this._value);
  }

  /**
   * Sets the value of the input
   * @param {string} value
   */
  @api
  id = 'input-time';

  /**
   * Sets the locale of the input
   * @param {string} locale
   * @default en-US
   */
  @api
  get locale() {
    return this._locale;
  }
  set locale(value) {
    this._locale = value;
  }

  /**
   * The current values of the input
   * @param {string} value
   */
  @api
  get value() {
    return this._value;
  }
  set value(value) {
    this._value = value;
  }

  /**
   * Sets the name of the input
   * @param {string} name
   * @default input-time
   * @required
   */
  @api
  get name() {
    return this._name;
  }
  set name(value) {
    this._name = value;
  }

  /**
   * Returns the ISO time of the input
   * @returns {string} ISO time
   * @readonly
   */
  @api
  get isoTime() {
    return this._isoTime;
  }

  /**
   * Returns the hour value of the input
   * @returns {string} hour
   * @readonly
   */
  @api
  get hour() {
    return this._hour;
  }

  /**
   * Returns the minute value of the input
   * @returns {string} minute
   * @readonly
   */
  @api
  get minute() {
    return this._minute;
  }

  /**
   * Determines if the input is disabled
   * @param {boolean} disabled
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
   * Determines if the input is readonly
   * @param {boolean} readonly
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
   * Determines if the input is required
   * @param {boolean} required
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
   * Allows customer to set invalid state on input
   * An example would be if the input is required and the value is empty on form submit,
   * since we are not using native form validation, we need to offer the ability set the invalid state on the input
   * @param {boolean} invalid
   * @default false
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
   * Returns the validity message of the input
   * @returns {string} validity message
   * @readonly
   */
  @api
  get validityMessage() {
    return this._validityMessage;
  }

  /**
   * Returns the time object of the input
   * @returns {object} time object
   * @readonly
   * @private
   */
  get input() {
    this._inputElement = this._inputElement || this.template.querySelector('input');

    return this._inputElement;
  }

  /**
   * Returns the validity object of the input
   * @returns {string} validity message
   * @readonly
   */
  @api
  get validity() {
    return Promise.resolve().then(() => this.input.validity);
  }

  /**
   * Sets focus on the input
   */
  @api
  focus() {
    this.input.focus();
    this.setAttribute('focus', '');
  }

  /**
   * Create time in locale format
   */
  get currentTime() {
    const currentTime = new Date();
    const options = { hour: 'numeric', minute: 'numeric' };
    this._hour = currentTime.getHours();
    this._minute = currentTime.getMinutes();
    return new Intl.DateTimeFormat(this.locale, options).format(currentTime);
  }

  _checkFormat(time) {
    switch (true) {
      case /(am|pm)/i.test(time):
        this.format = '12-hour';
        break;
      case /(\d+):(\d+)/i.test(time):
        this.format = '24-hour';
        break;
      default:
        break;
    }
  }

  _convertToIsoTime(timeString) {
    this._timeObject = {
      hour: '',
      minute: '',
      period: '',
    };
    let timeParts;
    this._checkFormat(timeString);
    if (this.format === '12-hour') {
      timeParts = timeString.match(/(\d+):(\d+).(am|pm)/i);
      this._timeObject.hour = parseInt(timeParts[1], 10);
      this._timeObject.minute = parseInt(timeParts[2], 10);
      this._timeObject.period = timeParts[3].toUpperCase();
      if (this._timeObject.period === 'PM' && this._timeObject.hour !== 12) {
        this._timeObject.hour += 12;
      } else if (this._timeObject.period === 'AM' && this._timeObject.hour === 12) {
        this._timeObject.hour = 0;
      }
    } else {
      timeParts = timeString.match(/(\d+):(\d+)/i);
      this._timeObject.hour = parseInt(timeParts[1], 10);
      this._timeObject.minute = parseInt(timeParts[2], 10);
    }
    if (!timeParts) {
      throw new Error('Invalid time format');
    }

    // Format as ISO 8601 time string
    return `${this._timeObject.hour.toString().padStart(2, '0')}:${this._timeObject.minute
      .toString()
      .padStart(2, '0')}`;
  }

  /**
   * Returns the help text element, if it exists
   * Used to dynamically add/remove the associated ID to the input element if help text is present
   * @returns {object} help text element
   * @private
   */
  get helpText() {
    this._helpTextElement = this._helpTextElement || this.template.querySelector('[part="help-text"]');

    return this._helpTextElement;
  }

  /**
   * On click handler for the input
   */
  handleClick() {
    if (this.disabled || this._readonly) {
      return;
    }
    this.input.focus();
    this.setAttribute('focus', '');
    // if valid time, restore iso time when interacting with input
    if (this._isoTime && !this._invalid) {
      this._value = this._convertToIsoTime(this.value);
    }
  }

  /**
   * On keydown handler for the input
   * Prevents user from inputting anything other than numbers and colons
   * @param {Event} e
   */
  handleKeyPress(e) {
    const keyCode = e.keyCode || e.which;
    const keyValue = String.fromCharCode(keyCode);
    if (!/^[0-9\:]$/.test(keyValue)) {
      e.preventDefault();
    }
  }

  /**
   * On input handler for the input
   * Handles validity and stores the value. Sets active attribute to host element when typing.
   * @param {Event} e
   */
  handleInput(e) {
    if (this.disabled || this._readonly) {
      return;
    }
    this._handleValidity(e.target.value);
    this._value = e.target.value;
    this.setAttribute('active', '');
    this.dispatchEvent(new CustomEvent('change'));
  }

  /**
   * On blur handler for the input
   * Handles validity and stores the value as the formatted time. Removes active attribute from host element when blurring.
   * @param {Event} e
   */
  handleBlur(e) {
    if (this.disabled || this._readonly) {
      return;
    }

    // Don't fire off validity check if were not checking against a valid iso time
    if (e.target.value === this._isoTime) {
      this._handleValidity(e.target.value);
    }

    // If valid, restore formatted time on blur and store new iso time
    if (!this.invalid) {
      this._isoTime = this._convertToIsoTime(e.target.value);
      this._value = this._timeInLocaleFormat(e.target.value);
    }

    this.removeAttribute('focus');
    this.removeAttribute('active');
  }

  /**
   * Slot change event on help text slot
   * Used to dynamically add/remove the associated ID to the input element if help text is present
   * Used to dynamically add "visible" part to the help text element if help text is found in the slot
   * @param {*} e - slot change event
   */
  handleHelpTextSlotChange(e) {
    const childElements = e.target.assignedElements({ flatten: true });
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
   * Handles validity of the input, returns validity message if invalid
   * @param {string} value - an ISO time string
   */
  _handleValidity(time) {
    this._validTime = this._validateTime(time);
    if (!this._validTime) {
      this.input.setCustomValidity('Time is not valid');
      this._validityMessage = 'Time is not valid. Please enter a valid time. Format: HH:MM';
    } else {
      this.input.setCustomValidity('');
      this._validityMessage = null;
    }
    this.invalid = !this.input.validity.valid;
  }

  /**
   * Validates the time, ensure the format is 24-Hour
   * @param {string} time
   */
  _validateTime(time) {
    let isValidTime = false;
    const regex = /^(?:[01]?\d|2[0-3]):[0-5]\d$/; // H:MM or HH:MM format
    isValidTime = regex.test(time);
    if (isValidTime) {
      const [hour, minute] = time.split(':').map(Number);
      this._hour = hour;
      this._minute = minute;
    }
    return isValidTime;
  }

  /**
   *
   * @param {string} hour
   * @param {string} minute
   * @returns HH:MM in locale format
   */
  _timeInLocaleFormat() {
    const date = new Date(this.YEAR, this.MONTH, this.DAY, this._timeObject.hour, this._timeObject.minute);
    const options = { hour: 'numeric', minute: 'numeric' };
    this._hour = date.getHours();
    this._minute = date.getMinutes();
    return new Intl.DateTimeFormat(this.locale, options).format(date);
  }
}
