import { LightningElement, api } from 'lwc';
import 'lightning/primitiveThemeProvider';

export default class LightningPrimitiveImage extends LightningElement {
  static shadowSupportMode = 'native';

  _declarativeRatios = ['square', 'landscape', 'portrait', 'wide', 'ultrawide'];
  _ratio;
  _src;
  _srcset;

  /**
   * The alternative text used to describe the image.
   *
   * @type {string}
   */
  @api alt = '';

  /**
   * The object-fit CSS property.
   *
   * @type {string}
   */
  @api fit;

  /**
   * The aspect ratio of the image.
   * ---
   * Checks if the value is a valid declarative aspect ratio or a valid custom
   * aspect ratio. If the value is not valid, it will log a warning.
   *
   * @type {string}
   */
  @api
  get ratio() {
    return this._ratio;
  }
  set ratio(value) {
    this._ratio = this._declarativeRatios.includes(value)
      ? null
      : this.isValidCustomAspectRatio(value)
      ? `aspect-ratio: ${value};`
      : console.warn(`${value} is not a valid aspect-ratio value.`);
  }

  /**
   * The URL of the image.
   *
   * @type {string}
   */
  @api
  get src() {
    return this._src;
  }
  set src(value) {
    this.isValidImageUrl(value) ? (this._src = value) : console.warn(`${value} is not a valid image url.`);
  }

  /**
   * String which identifies one or more image candidate strings, separated using commas (,) each specifying
   * image resources to use under given circumstances.
   *
   * @type {string}
   */
  @api
  get srcset() {
    return this._srcset;
  }
  set srcset(value) {
    this.isValidImageUrl(value)
      ? (this._srcset = value)
      : console.warn(`${value} is not a valid image url or srcset value.`);
  }

  /**
   * Specifies the layout width of the image for each of a list of media conditions.
   *
   * @type {string}
   */
  @api sizes;

  /**
   * Determines if the URL passed into src and srcset is valid.
   *
   * @param {string} url
   * @returns {boolean}
   */
  isValidImageUrl(url) {
    if (typeof url !== 'string') {
      return false;
    }

    const srcRegex = /\.(jpeg|jpg|gif|png|svg|bmp)$/i;
    const srcsetRegex = /^(\S+)(\s+(\d+w|[\d.]+x))?$/i;
    const srcsetItems = url.split(',');

    for (const item of srcsetItems) {
      const trimmedItem = item.trim();
      const match = trimmedItem.match(srcsetRegex);

      if (!match) {
        return false;
      }

      const imageUrl = match[1];
      if (!srcRegex.test(imageUrl)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Check if the custom value is a valid aspect ratio.
   *
   * @param {string} value
   * @returns {boolean}
   */
  isValidCustomAspectRatio(value) {
    // Check if the value is a string
    if (typeof value !== 'string') {
      return false;
    }

    // Use a regular expression to match the aspect ratio pattern
    const regex = /^\s*(\d+)\s*\/\s*(\d+)\s*$/;
    const match = value.match(regex);
    if (!match) {
      return false;
    }

    // Extract width and height from the match object
    const width = parseInt(match[1], 10);
    const height = parseInt(match[2], 10);

    // Ensure both width and height are positive integers
    if (width <= 0 || height <= 0) {
      return false;
    }

    return true;
  }
}
