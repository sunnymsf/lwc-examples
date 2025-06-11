export const reflectAttribute = (element, attrName, value) => {
  if (!element) {
    return;
  }
  if (typeof value === 'string') {
    element.setAttribute(attrName, value);
  } else if (value === true) {
    element.setAttribute(attrName, '');
  } else if (!value) {
    element.removeAttribute(attrName);
  } else {
    console.warn(`Invalid attribute value for "${attrName}": ${value}`);
  }
};

export const normalizeBoolean = (value) => {
  return typeof value === 'string' || !!value;
};

export function normalizeInput(value) {
  if (typeof value === 'number' || typeof value === 'string') {
    return String(value);
  }
  return '';
}

/**
 * A string normalization utility for attributes.
 *
 * @param {string} value - The value to normalize.
 * @param {object} config - The optional configuration object.
 * @param {string} [config.fallbackValue] - The optional fallback value to use if the given value is not provided or invalid. Defaults to an empty string.
 * @param {array} [config.validValues] - An optional array of valid values. Assumes all input is valid if not provided.
 * @return {string} - The normalized value.
 */
export function normalizeString(value, config = {}) {
  const { fallbackValue = '', validValues, toLowerCase = true } = config;
  let normalized = (typeof value === 'string' && value.trim()) || '';
  normalized = toLowerCase ? normalized.toLowerCase() : normalized;
  if (validValues && validValues.indexOf(normalized) === -1) {
    normalized = fallbackValue;
  }
  return normalized;
}

export function oneOf(value, options) {
  if (!options.includes(value)) {
    throw new Error(`Invalid value: ${value}. Valid options are: ${options.join(', ')}`);
  }
  return value;
}

export class DateFormatter {
  locale = 'en-US';

  constructor(locale, day, month, year, config) {
    this.date = new Date(year, month - 1, day);
    this.locale = locale;
    this.config = config || { day: 'numeric', month: 'long', year: 'numeric' };
  }

  format(locale = this.locale) {
    const options = {
      day: this.config.day,
      month: this.config.month,
      year: this.config.year,
    };
    return new Intl.DateTimeFormat(locale, options).format(this.date);
  }
}

export const dateRegexIso = /^(\d{4})[-](\d{1,2})[-](\d{1,2})$/;

/**
 * Check if the given value is defined.
 *
 * @param {*} value - The value to check.
 *
 * @returns {boolean} - True if the value is defined.
 */
export function isDefined(value) {
  return typeof value !== 'undefined' && value !== null;
}

/**
 * Library exports.
 *
 * @TODO: needs clean up when we get a breather. 'index' is required cause LWC
 * looks for the module name.
 */
export { autoResize } from './resize/index';
export { createControlAndTargetContract, validateIsButtonType } from './contract/index';
export { dispatchCustomEvent } from './event/index';
export { getOverflowContainer } from './overflow/index';
export { closePopover, openPopover, togglePopover } from './popover/index';
export { position, validatePlacement } from './position/index';
export { handleSlotChangeWithState } from './slot/index';
export { hasSlotText } from './slot/index';
