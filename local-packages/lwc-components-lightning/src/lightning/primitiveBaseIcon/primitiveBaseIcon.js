import { LightningElement, api } from 'lwc';
import { reflectAttribute } from 'lightning/primitiveUtils';
import 'lightning/primitiveThemeProvider';

const sdsIconParser = new DOMParser();
const sdsIconRequests = new Map();

export default class LightningPrimitiveBaseIcon extends LightningElement {
  static shadowSupportMode = 'native';

  _symbol;
  _set;
  _ariaLabel;
  _prefetch;
  _generatedIcon = false;
  _iconSets;

  /**
   * An array of icon sets to use when resolving the icon.
   *
   * @type {Array}
   */
  @api
  get iconSets() {
    return this._iconSets;
  }
  set iconSets(value) {
    this._iconSets = value;
  }

  /**
   * The name of the icon to resolve.
   *
   * @type {string}
   */
  @api
  get symbol() {
    return this._symbol;
  }
  set symbol(value) {
    this._symbol = value;
    reflectAttribute(this, 'symbol', this._symbol);
  }

  /**
   * The name of the icon set to use when resolving the icon.
   *
   * @type {string}
   */
  @api
  get set() {
    return this._set;
  }
  set set(value) {
    this._set = value;
    reflectAttribute(this, 'set', this._set);
  }

  /**
   * Which icons to prefetch from the set.
   *
   * @type {string}
   */
  @api
  get prefetch() {
    return this._prefetch;
  }
  set prefetch(value) {
    this._prefetch = value;
  }

  /**
   * Defines a string value that labels an interactive element.
   *
   * @type {string}
   */
  @api
  get ariaLabel() {
    return this._ariaLabel;
  }
  set ariaLabel(value) {
    this._ariaLabel = value;
    this.role = 'img';
  }

  /**
   * Provides semantic meaning to content, allowing screen readers and other
   * tools to present and support interaction with object in a way that is
   * consistent with user expectations of that type of object.
   *
   * @type {string}
   */
  @api
  get role() {
    return this._role;
  }
  set role(value) {
    this._role = value;
  }

  /**
   * Register new icon sets programmatically
   *
   * @param {array} set
   */
  @api
  registerIconSet(set) {
    set.forEach((set) => {
      this._iconSets.push({
        name: set.name,
        resolver: set.resolver,
        mutator: set.mutator,
      });
    });
  }

  /**
   * Unregister a custom icon set
   *
   * @param {string} name
   */
  @api
  unregisterIconSet(name) {
    this._iconSets = this._iconSets.filter((lib) => lib.name !== name);
  }

  connectedCallback() {
    // Dispatch custom event for parent
    // Used to imperatively set an iconSet
    this.dispatchEvent(
      new CustomEvent('iconregister', {
        bubbles: true,
        cancelable: true,
        detail: {
          name: 'sds-icon',
        },
      }),
    );
  }

  /**
   * Retrieve an icon set
   *
   * @param {string} name
   */
  getIconSet(name) {
    return this._iconSets && this._iconSets.filter((set) => set.name === name)[0];
  }

  /**
   * Return the resolver (url) for an icon set
   *
   * @param {string} set
   * @param {string} symbol
   */
  getIconUrl(set, symbol) {
    if (set && symbol) {
      return set.resolver(symbol);
    }
  }

  /**
   * Return the parameters of a symbol in an object for easier reference
   *
   * @param {string} symbol
   */
  getSymbolParams(symbol) {
    const set = this.getIconSet(this._set);
    const url = this.getIconUrl(set, symbol);
    return {
      set,
      url,
    };
  }

  /**
   * Check if the icon set and symbol are set.
   *
   * @returns {boolean}
   */
  hasIconsConfigured() {
    return Boolean(this._set && this._symbol);
  }

  /**
   * Validates if the provided URL is an SVG file.
   *
   * @param {string} url
   * @returns {boolean}
   */
  isValidSvgUrl(url) {
    const svgUrlPattern = /\.svg$/i;
    return svgUrlPattern.test(url);
  }

  /**
   * Validates if the provided content type is an SVG.
   *
   * @param {string} contentType
   * @returns {boolean}
   */
  isValidContentType(contentType) {
    return contentType && contentType.includes('image/svg+xml');
  }

  /**
   * Fetch SVG asset from url, run optional mutations, and return it.
   *
   * @param {string} url
   */
  async fetchIcon(url) {
    // Validate the URL
    if (!this.isValidSvgUrl(url)) {
      console.error(`Invalid URL: ${url}. Only SVG files are allowed.`);
      return;
    }

    // If there's an ongoing request for the same URL, return the stored Promise
    if (sdsIconRequests.has(url)) {
      const result = await sdsIconRequests.get(url);
      return result;
    }

    // If there's no ongoing request, create a new Promise for the fetch request
    const requestPromise = fetch(url).then(async (response) => {
      if (response.ok) {
        if (!this.isValidContentType(response.headers.get('content-type'))) {
          console.error(`Invalid content type: ${contentType}. Only SVG files are allowed.`);
          sdsIconRequests.delete(url);
          return;
        }
        const div = document.createElement('div');
        div.innerHTML = await response.text();
        const svg = div.firstElementChild;
        const result = {
          url: url,
          svg: svg && svg.tagName.toLowerCase() === 'svg' ? svg.outerHTML : '',
        };

        sdsIconRequests.delete(url);
        return result;
      } else {
        sdsIconRequests.delete(url);
        throw Error();
      }
    });

    // Store the Promise in the sdsIconRequests cache
    sdsIconRequests.set(url, requestPromise);

    // Wait for the Promise to resolve and return the icon
    const request = await requestPromise;
    return request;
  }

  /**
   * Prefetch icons before they are drawn
   *
   * @param {string} icons
   */
  async prefetchIcons(icons) {
    const iconsToFetch = icons.split(',').map((icon) => icon.trim());
    const fetchedIcons = await Promise.all(
      iconsToFetch.map((symbol) => {
        const { url } = this.getSymbolParams(symbol);
        return this.fetchIcon(url).catch(() => {
          console.error(
            `Unable to prefetch the symbol "${symbol}". Double check your symbol exists and use comma separated values.`,
          );
        });
      }),
    );
    return fetchedIcons;
  }

  /**
   * Create the icon (entry point)
   */
  async createIcon() {
    const { set, url } = this.getSymbolParams(this._symbol);
    if (url && set) {
      const slotContainer = !this._generatedIcon
        ? this.template.querySelector("[part~='icon']")
        : this.template.querySelector('svg');

      try {
        const svg = await this.fetchIcon(url);
        const doc = sdsIconParser.parseFromString(svg.svg, 'text/html');
        let svgEl = doc.body.querySelector('svg');

        // Run any optional mutations
        if (set && set.mutator) {
          svgEl = set.mutator(svgEl);
        }
        svgEl.setAttribute('aria-hidden', 'true');

        // Add the SVG as the fallback content of the slot
        !this._generatedIcon ? slotContainer.appendChild(svgEl) : slotContainer.replaceWith(svgEl);
        this._generatedIcon = true;
      } catch {
        console.error(`Error creating icon using ${url}`);
      }
    } else {
      console.error(
        `Unable to create an icon using set ${this._set} and URL ${url}. Double check your registered set names and paths.`,
      );
    }
  }

  /**
   * Check if the slot has slotted content
   *
   * @returns {boolean}
   */
  hasSlottedChildren() {
    const slot = this.template.querySelector('slot');
    return slot.assignedNodes({ flatten: true }).length !== 0;
  }

  /**
   * Handle slotchange event
   */
  handleSlotChange() {
    // Remove icon generated by API to make room for slotted content
    if (this._generatedIcon) {
      this.template.querySelector('svg').remove();
      this._generatedIcon = false;
    }

    // Recreate icon if slot is emptied and icons are configured
    if (!this.hasSlottedChildren() && !this._generatedIcon && this.hasIconsConfigured) {
      this.createIcon();
    }
  }

  /**
   * RenderedCallback LWC lifecycle
   */
  renderedCallback() {
    // Create icon if slot is empty and icons have been configured
    if (!this.hasSlottedChildren() && this.hasIconsConfigured()) {
      this.createIcon();
    }

    // Check if we need to prefetch icons
    this._prefetch && this.prefetchIcons(this._prefetch);
  }
}
