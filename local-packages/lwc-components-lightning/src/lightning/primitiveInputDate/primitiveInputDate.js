import { LightningElement, api } from 'lwc';
import { reflectAttribute, normalizeBoolean, DateFormatter, dateRegexIso, hasSlotText } from 'lightning/primitiveUtils';
import 'lightning/primitiveThemeProvider';

export default class LightningPrimitiveInputDate extends LightningElement {
  static shadowSupportMode = 'native';

  _value = '';
  _name = 'input-date';
  _isoDate = '';
  _locale = 'en-US';
  _day = '';
  _month = '';
  _year = '';
  _dayformat = 'numeric';
  _monthformat = 'short';
  _yearformat = 'numeric';
  _invalid = false;
  _validityMessage;
  _validDate = true;
  _dateObject = {};
  _disabled = false;
  _readonly = false;
  _required = false;
  _helptext;
  _inputElement;
  _helpTextElement;

  connectedCallback() {
    this._value = this._todaysDate();
    this._isoDate = this._formatIsoDate(this._day, this._month, this._year);
  }

  /**
   * Sets the value of the input
   * @param {string} value
   */
  @api id = 'input-date';

  /**
   * Sets the month format of the input
   * @param {enum} monthformat
   * @values short, long, numeric, 2-digit
   * @default numeric
   */
  @api
  get monthformat() {
    return this._monthformat;
  }
  set monthformat(value) {
    this._monthformat = value;
  }

  /**
   * Sets the day format of the input
   * @param {enum} dayformat
   * @values numeric, 2-digit
   * @default numeric
   */
  @api
  get dayformat() {
    return this._dayformat;
  }
  set dayformat(value) {
    this._dayformat = value;
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
   * Sets the name of the input
   * @param {string} name
   * @default input-date
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
   * Returns the day value of the input
   * @returns {string} day
   * @readonly
   */
  @api
  get day() {
    return this._day;
  }

  /**
   * Returns the month value of the input
   * @returns {string} month
   * @readonly
   */
  @api
  get month() {
    return this._month;
  }

  /**
   * Returns the year value of the input
   * @returns {string} year
   * @readonly
   */
  @api
  get year() {
    return this._year;
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
   * Returns the validity object of the input
   * @returns {string} validity message
   * @readonly
   */
  @api
  get validity() {
    return Promise.resolve().then(() => this.input.validity);
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
   * Returns the ISO date of the input
   * @returns {string} ISO date
   * @readonly
   */
  @api
  get isoDate() {
    return this._isoDate;
  }

  /**
   * Returns the date object of the input
   * @returns {object} date object
   * @readonly
   * @private
   */
  get input() {
    this._inputElement = this._inputElement || this.template.querySelector('input');

    return this._inputElement;
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
   * If invalid, sets the aria-invalid attribute on the input element
   * and sets invalid attribute on custom element
   * @private
   */
  isInvalid() {
    if (!this.input.validity.valid) {
      this.invalid = true;
    } else {
      this.invalid = false;
    }
  }

  /**
   * Handles validity of the input, returns validity message if invalid
   * @param {string} value - an ISO date string
   */
  _handleValidity(value) {
    this._validateDate(value);
    // _validDate gets set in _validateDate, if not valid set validity object to fail with custom message
    if (!this._validDate) {
      this.input.setCustomValidity('Date is not valid');
      this._validityMessage = 'Date is not valid. Please enter a valid date. Format: YYYY-MM-DD';
    } else {
      this.input.setCustomValidity('');
      this._validityMessage = null;
    }
    this.isInvalid();
  }

  /**
   * Creates a date object for todays date
   */
  _todaysDate() {
    const today = new Date();
    this._day = String(today.getDate()).padStart(2, '0');
    this._month = String(today.getMonth() + 1).padStart(2, '0');
    this._year = today.getFullYear();
    return new DateFormatter(this.locale, this._day, this._month, this._year, {
      day: this.dayformat,
      month: this.monthformat,
      year: this._yearformat,
    }).format();
  }

  /**
   * Formats the date based on the locale
   * @param {string} day
   * @param {string} month
   * @param {string} year
   * @returns {string} formatted date
   */
  _formatDate(day, month, year) {
    return new DateFormatter(this.locale, day, month, year, {
      day: this.dayformat,
      month: this.monthformat,
      year: this._yearformat,
    }).format();
  }

  /**
   * Formats the date to ISO format
   * @param {string} day
   * @param {string} month
   * @param {string} year
   * @returns {string} ISO date
   */
  _formatIsoDate(day, month, year) {
    const date = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
    return new Date(date).toISOString().split('T')[0];
  }

  /**
   * Returns the numeric month value
   * @param {string} month
   * @returns {number} numeric month
   */
  _getNumericMonth(month) {
    const date = new Date(`${month} 1, 2000`);
    if (date.toString() !== 'Invalid Date') {
      return date.getMonth() + 1;
    } else {
      // return -1 if invalid month to prevent error in DateFormatter
      return -1;
    }
  }

  /**
   * Returns the number of days in a month
   * @param {string} month
   * @param {string} year
   * @returns {number} number of days in month
   */
  _getDaysInMonth(month, year) {
    return new Date(year, month, 0).getDate();
  }

  /**
   * Validates the date, ensure the ISO format is YYYY-MM-DD
   * @param {string} date
   */
  _validateDate(date) {
    let dateRegex = dateRegexIso;
    // check if valid date, e.g. 2020/01/01
    if (dateRegex.test(date)) {
      this._validDate = true;
      this._year = Number(dateRegex.exec(date)[1]);
      this._month = Number(dateRegex.exec(date)[2]);
      this._day = Number(dateRegex.exec(date)[3]);

      // check if valid month
      if (this._month < 1 || this._month > 12) {
        this._validDate = false;
      }
      // check if valid day
      if (this._day < 1 || this._day > this._getDaysInMonth(this._month, this._year)) {
        this._validDate = false;
      }
      // check if valid year
      if (this._year < 1900 || this._year > 2100) {
        this._validDate = false;
      }
      // If valid, store the date object
      if (this._validDate) {
        this._dateObject.numeric = new DateFormatter(this.locale, this._day, this._month, this._year, {
          day: 'numeric',
          month: 'numeric',
          year: 'numeric',
        }).format();
        this._dateObject.date = new DateFormatter(this.locale, this._day, this._month, this._year, {
          day: this.dayformat,
          month: this.monthformat,
          year: this._yearformat,
        }).format();
      }
    } else {
      this._validDate = false;
    }
  }

  /**
   * On click handler for the input
   * Restores ISO date value when focused
   */
  handleClick() {
    if (this.disabled || this.readonly) {
      return;
    }
    this.input.focus();
    this.setAttribute('focus', '');
    // if valid date, restore iso date when interacting with input
    if (this._isoDate && !this._invalid) {
      this._value = this._isoDate;
    }
  }

  /**
   * On input handler for the input
   * Handles validity and stores the value. Sets active attribute to host element when typing.
   * @param {Event} e
   */
  handleInput(e) {
    if (this.disabled || this.readonly) {
      return;
    }
    this._handleValidity(e.target.value);
    this._value = e.target.value;
    this.setAttribute('active', '');
    this.dispatchEvent(new CustomEvent('change'));
  }

  /**
   * On blur handler for the input
   * Handles validity and stores the value as the formatted date. Removes active attribute from host element when blurring.
   * @param {Event} e
   */
  handleBlur(e) {
    if (this.disabled || this.readonly) {
      return;
    }
    // make sure we dont fire off validity check if were not checking against a valid iso date
    if (e.target.value === this._isoDate) {
      this._handleValidity(this._isoDate);
    }
    // If not invalid, restore formatted date on blur and store new iso date
    if (!this._invalid) {
      this._value = this._dateObject.date;
      this._isoDate = this._formatIsoDate(this._day, this._month, this._year);
    }
    this.removeAttribute('active');
    this.removeAttribute('focus');
  }

  /**
   * On keydown handler for the input
   * Prevents user from inputting anything other than numbers and hyphens
   * @param {Event} e
   */
  handleKeyPress(e) {
    const keyCode = e.keyCode || e.which;
    const keyValue = String.fromCharCode(keyCode);
    if (!/^[0-9\-]$/.test(keyValue)) {
      e.preventDefault();
    }
  }

  /**
   * Slot change event on help text slot
   * Used to dynamically add/remove the associated ID to the input element if help text is present
   * Used to dynamically add "visible" part to the help text element if help text is found in the slot
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
}
