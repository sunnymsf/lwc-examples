import { LightningElement, api } from 'lwc';
import 'lightning/primitiveThemeProvider';

export default class LightningPrimitiveRichText extends LightningElement {
  static shadowSupportMode = 'native';

  _nodes = [];
  _styleMap = new Map();
  _copy = false;
  connected = false;
  _richTextElement;
  _richTextContainerElement;

  camelize = (s) => s.replace(/-./g, (x) => x[1].toUpperCase());

  CONFIGURABLE_TAGS = {
    h1: {
      props: [
        {
          cssProperty: 'font-size',
          stylingHook: '--sds-c-richtext-h1-font-size',
        },
      ],
    },
    h2: {
      props: [
        {
          cssProperty: 'font-size',
          stylingHook: '--sds-c-richtext-h2-font-size',
        },
      ],
    },
    h3: {
      props: [
        {
          cssProperty: 'font-size',
          stylingHook: '--sds-c-richtext-h3-font-size',
        },
      ],
    },
    h4: {
      props: [
        {
          cssProperty: 'font-size',
          stylingHook: '--sds-c-richtext-h4-font-size',
        },
      ],
    },
    ul: {
      props: [
        {
          cssProperty: 'padding',
          stylingHook: '--sds-c-richtext-list-spacing',
        },
      ],
    },
    ol: {
      props: [
        {
          cssProperty: 'padding',
          stylingHook: '--sds-c-richtext-list-spacing',
        },
      ],
    },
    p: {
      props: [
        {
          cssProperty: 'margin',
          stylingHook: '--sds-c-richtext-p-spacing',
        },
      ],
    },
    global: {
      props: [
        {
          cssProperty: 'font-size',
          stylingHook: '--sds-c-richtext-font-size',
        },
        {
          cssProperty: 'line-height',
          stylingHook: '--sds-c-richtext-font-lineheight',
        },
        {
          cssProperty: 'padding',
          stylingHook: '--sds-c-richtext-spacing',
        },
      ],
    },
  };

  connectedCallback() {
    if (!this.connected) {
      this._copy = !!this.template.host.querySelector('[slot~=copy-label]');
      this.connected = true;
    }
  }

  /**
   * Return the slotted nodes
   * @returns {Array} nodes
   * @private
   */
  get nodes() {
    return this._nodes;
  }

  /**
   * Return the style map
   * @returns {Map} style map
   * @private
   */
  get styleMap() {
    return this._styleMap;
  }

  /**
   * Return the Rich Text Element
   * @returns {Object} Rich Text Element
   * @private
   */
  get richText() {
    this._richTextElement = this._richTextElement || this.template.querySelector('[part~=rich-text]');

    return this._richTextElement;
  }

  /**
   * Return the Rich Text Container Element
   * @returns {Object} Rich Text Container Element
   * @private
   */
  get richTextContainer() {
    this._richTextContainerElement =
      this._richTextContainerElement || this.template.querySelector('[part~=rich-text-container]');

    return this._richTextContainerElement;
  }

  /**
   * Return the Copy Element status
   * @returns {Boolean} copy display status
   * @private
   */
  get copy() {
    return this._copy;
  }

  /**
   * Handle default slot change
   * @param {*} e
   */
  handleSlotChange(e) {
    const childNodes = e.target.assignedNodes({ flatten: true });
    this._nodes = [...childNodes];
  }

  /**
   * Copies the contents of the rich text elements to clipboard
   */
  handleCopy() {
    navigator.clipboard.writeText(this.copyRichText());
  }

  /**
   * Returns html as string with rich text slotted elements populated with respective styles
   * @returns string
   */
  @api
  copyRichText() {
    this.populateStyleMap();
    const htmlElementsToExport = [`<div style=\"${this.createStyleStrWithStyleMap()}\">`]; // Start with a opening tag
    const configurableTags = Object.keys(this.CONFIGURABLE_TAGS);
    this.nodes.forEach((node) => {
      if (node instanceof HTMLElement) {
        if (configurableTags.includes(node.tagName.toLowerCase())) {
          let style = this.prepareStyleForTag(node.tagName);
          style += node.style.cssText;
          const clonedNode = node.cloneNode(true);
          clonedNode.style.cssText = style;
          htmlElementsToExport.push(`\t${clonedNode.outerHTML}`);
        } else {
          const clonedNode = node.cloneNode(true);
          htmlElementsToExport.push(`\t${clonedNode.outerHTML}`);
        }
      } else {
        const textContent = node.textContent.trim().length > 0 ? node.textContent.trim() : null;
        if (textContent) {
          const para = document.createElement('p');
          para.innerText = textContent;
          htmlElementsToExport.push(`\t${para.outerHTML}`);
        }
      }
    });
    htmlElementsToExport.push('</div>'); // End with a closing tag
    return htmlElementsToExport.join('\n').toString();
  }

  /**
   * Given a html tag name, creates inline styles
   * @param {*} tagName
   * @returns
   */
  prepareStyleForTag(tagName) {
    if (!tagName) {
      return;
    }
    tagName = tagName.toLowerCase();
    const configurableProps = this.CONFIGURABLE_TAGS[tagName];
    if (!configurableProps) {
      return;
    }
    let style = '';
    configurableProps.props.forEach((prop) => {
      style += `${prop.cssProperty}: var(${prop.stylingHook});`;
    });
    return style;
  }

  /**
   * Prepares stylesMap with necessary styling hooks and css properties
   */
  populateStyleMap() {
    this.populateStyleMapWithStylingHooks();
    this.populateStyleMapWithOtherStyles();
  }

  /**
   * Populates the styleMap with styling hooks
   */
  populateStyleMapWithStylingHooks() {
    const configurableTags = Object.keys(this.CONFIGURABLE_TAGS);
    configurableTags.forEach((tag) => {
      const props = this.CONFIGURABLE_TAGS[tag].props;
      if (tag === 'global') {
        // default css for whole container
        props.forEach((prop) =>
          this.styleMap.set(
            prop.cssProperty,
            this.getComputedStyleValOfProp(this.richTextContainer, prop.cssProperty),
          ),
        );
      } else {
        const configurableEle = this.nodes.find(
          (node) =>
            node instanceof HTMLElement &&
            configurableTags.includes(node.tagName.toLowerCase()) &&
            node.tagName.toLowerCase() === tag,
        );
        if (configurableEle) {
          props.forEach((prop) =>
            this.styleMap.set(
              prop.stylingHook,
              this.getComputedStyleValOfProp(configurableEle, prop.cssProperty),
            ),
          );
        }
      }
    });
  }

  /**
   * Populates the styleMap with css properties that are set directly (without using styling hooks)
   * to root tag or to any element via part attribute
   */
  populateStyleMapWithOtherStyles() {
    const globalStylingHooks = this.CONFIGURABLE_TAGS['global'].props.map((prop) => prop.stylingHook);
    [this.template.host, this.richText, this.richTextContainer].forEach((element) => {
      const elementStyles = element.style.cssText.trim();
      elementStyles.split(';').forEach((styleStr) => {
        if (styleStr.includes(':')) {
          const prop = styleStr.split(':')[0].trim();
          const value = styleStr.split(':')[1].trim();
          if (!globalStylingHooks.includes(prop)) {
            this.styleMap.set(prop, this.getComputedStyleValOfProp(element, prop) || value);
          }
        }
      });
    });
  }

  /**
   * Returns the css property value of a given element
   * @param {*} element
   * @param {*} cssProp
   * @returns
   */
  getComputedStyleValOfProp(element, cssProp) {
    if (!element || !cssProp) {
      return;
    }
    const computedStyles = getComputedStyle(element);
    const cssPropInCamelCase = this.camelize(cssProp);
    return computedStyles[cssPropInCamelCase];
  }

  /**
   * Creates inline style string with styleMap contents
   * @returns
   */
  createStyleStrWithStyleMap() {
    let style = '';
    this.styleMap.forEach((value, key) => {
      style += `${key}: ${value}; `;
    });
    return style.trim();
  }
}
