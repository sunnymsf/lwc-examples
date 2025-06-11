import { LightningElement, api } from 'lwc';
import { reflectAttribute, normalizeInput, handleSlotChangeWithState } from 'lightning/primitiveUtils';

export default class SdsLayout extends LightningElement {
  static shadowSupportMode = 'native';

  _gap;
  _gapInteger;
  _gapUnit;
  _hasExplicitSize = false;
  _layoutElement;

  @api layout;
  @api axis;
  @api flow;
  @api alignContent;
  @api alignItems;
  @api justifyContent;
  @api justifyItems;
  @api columns;
  @api rows;
  @api placeContent;
  @api placeItems;
  @api height;

  /**
   * Flex is a shorthand for flex-grow, flex-shrink and flex-basis combined.
   * This sets the flex type to the element
   * Since its a flex child, we reflect the attribute on the host element.
   */
  @api
  get flex() {
    return this._flex;
  }
  set flex(value) {
    this._flex = normalizeInput(value);
    reflectAttribute(this, 'flex', this._flex);
  }

  /**
   * Size is a shorthand for flex-basis.
   * Custom values can be passed in as a string with a valid CSS unit. if discovered,
   * we fire the handleCustomSize method to set the inline flex-basis.
   * Since its a flex child, we reflect the attribute on the host element.
   */
  @api
  get size() {
    return this._size;
  }
  set size(value) {
    this._size = normalizeInput(value);
    const integer = value.match(/^\d+/);
    const unit = value.match(/(px|rem|em|vh|vw|vmin|vmax|%)$/);
    this._sizeInteger = integer && integer[0];
    this._sizeUnit = unit && unit[0];
    reflectAttribute(this, 'size', this._size);
    if (this._rendered) {
      this.handleCustomSize();
    }
  }

  /**
   * Size small media query for the flex child.
   * Value passed in is a logical value, e.g. 1:2, that maps to a relative % value.
   * Since its a flex child, we reflect the attribute on the host element.
   */
  @api
  get sizeSm() {
    return this._sizeSm;
  }
  set sizeSm(value) {
    this._sizeSm = normalizeInput(value);
    reflectAttribute(this, 'size-sm', this._sizeSm);
  }

  /**
   * Size medium media query for the flex child.
   * Value passed in is a logical value, e.g. 1:2, that maps to a relative % value.
   * Since its a flex child, we reflect the attribute on the host element.
   */
  @api
  get sizeMd() {
    return this._sizeMd;
  }
  set sizeMd(value) {
    this._sizeMd = normalizeInput(value);
    reflectAttribute(this, 'size-md', this._sizeMd);
  }

  /**
   * Size large media query for the flex child.
   * Value passed in is a logical value, e.g. 1:2, that maps to a relative % value.
   * Since its a flex child, we reflect the attribute on the host element.
   */
  @api
  get sizeLg() {
    return this._sizeLg;
  }
  set sizeLg(value) {
    this._sizeLg = normalizeInput(value);
    reflectAttribute(this, 'size-lg', this._sizeLg);
  }

  /**
   * Size x-large media query for the flex child.
   * Value passed in is a logical value, e.g. 1:2, that maps to a relative % value.
   * Since its a flex child, we reflect the attribute on the host element.
   */
  @api
  get sizeXLg() {
    return this._sizeXLg;
  }
  set sizeXLg(value) {
    this._sizeXLg = normalizeInput(value);
    reflectAttribute(this, 'size-xlg', this._sizeXLg);
  }

  /**
   * Sets the visual order of the flex child.
   * Since its a flex child, we reflect the attribute on the host element.
   */
  @api
  get order() {
    return this._order;
  }
  set order(value) {
    this._order = normalizeInput(value);
    reflectAttribute(this, 'order', this._order);
  }

  /**
   * Sets the flex-grow value of the flex child.
   * Since its a flex child, we reflect the attribute on the host element.
   */
  @api
  get grow() {
    return this._grow;
  }
  set grow(value) {
    this._grow = normalizeInput(value);
    reflectAttribute(this, 'grow', this._grow);
  }

  /**
   * Sets the flex-shrink value of the flex child.
   * Since its a flex child, we reflect the attribute on the host element.
   */
  @api
  get shrink() {
    return this._shrink;
  }
  set shrink(value) {
    this._shrink = normalizeInput(value);
    reflectAttribute(this, 'shrink', this._shrink);
  }

  /**
   * Grid specific attribute that sets the col-span of the grid child.
   * Since its a grid child, we reflect the attribute on the host element.
   */
  @api
  get colSpan() {
    return this._colSpan;
  }
  set colSpan(value) {
    this._colSpan = normalizeInput(value);
    reflectAttribute(this, 'col-span', this._colSpan);
  }

  /**
   * Grid specific attribute that sets the row-span of the grid child.
   * Since its a grid child, we reflect the attribute on the host element.
   */
  @api
  get rowSpan() {
    return this._rowSpan;
  }
  set rowSpan(value) {
    this._rowSpan = normalizeInput(value);
    reflectAttribute(this, 'row-span', this._rowSpan);
  }

  /**
   * Grid specific attribute that sets the justify-self of the grid child.
   * Since its a grid child, we reflect the attribute on the host element.
   */
  @api
  get justifySelf() {
    return this._justifySelf;
  }
  set justifySelf(value) {
    this._justifySelf = normalizeInput(value);
    reflectAttribute(this, 'justify-self', this._justifySelf);
  }

  /**
   * Grid specific attribute that sets the align-self of the grid child.
   * Since its a grid child, we reflect the attribute on the host element.
   */
  @api
  get alignSelf() {
    return this._alignSelf;
  }
  set alignSelf(value) {
    this._alignSelf = normalizeInput(value);
    reflectAttribute(this, 'align-self', this._alignSelf);
  }

  /**
   * Grid specific attribute that sets the place-self of the grid child.
   * Since its a grid child, we reflect the attribute on the host element.
   * This is a shorthand for align-self and justify-self.
   * If you want to set both, you can use the place-self attribute.
   */
  @api
  get placeSelf() {
    return this._placeSelf;
  }
  set placeSelf(value) {
    this._placeSelf = normalizeInput(value);
    reflectAttribute(this, 'place-self', this._placeSelf);
  }

  /**
   * Sets the gap size for both grid and flex containers
   * If a custom value is passed in, we check if its a valid integer and unit.
   * If valid, we fire the handleCustomGap() method, we set the custom property
   * so it can be accessed in the CSS to deal with our gap solution using padding
   */
  @api
  get gap() {
    return this._gap;
  }
  set gap(value) {
    this._gap = normalizeInput(value);
    const integerRegex = /^\d+/;
    const unitRegex = /([a-z])+/;
    const validUnitRegex = /(px|rem|em|vh|vw|vmin|vmax|%)$/;
    // ensure we're getting a valid integer
    const integer = integerRegex.test(this._gap) && integerRegex.exec(this._gap)[0];
    // ensure we're getting a valid unit before storing the unit
    const isValidUnit = unitRegex.test(this._gap) ? (validUnitRegex.test(this._gap) ? true : false) : null;
    // if unit is valid we store it, if not we set to false, if we don't get a unit we set to null
    const unit =
      isValidUnit !== null ? (validUnitRegex.test(this._gap) ? unitRegex.exec(this._gap)[0] : false) : null;
    this._gapInteger = integer;
    this._gapUnit = unit;
  }

  /**
   * Sets the template-columns for the grid container.
   * This is used if you want to set a custom grid layout.
   */
  @api
  get templateColumns() {
    return this._templateColumns;
  }
  set templateColumns(value) {
    this._templateColumns = normalizeInput(value);
  }

  /**
   * Sets the template-rows for the grid container.
   * This is used if you want to set a custom grid layout.
   */
  @api
  get templateRows() {
    return this._templateRows;
  }
  set templateRows(value) {
    this._templateRows = normalizeInput(value);
  }

  /**
   * Since the container of grid or flex needs to be the direct parent of the children
   * we generate a class string that we can use to apply the layout classes to the container
   * so the children in the light dom can be styled correctly.
   */
  get computedClass() {
    return [
      this.layout ? `layout-${this.layout}` : '',
      this.axis ? `axis-${this.axis}` : '',
      this.gap ? `gap-${this.gap}` : '',
      this.flow ? `flow-${this.flow}` : '',
      this.alignContent ? `align-content-${this.alignContent}` : '',
      this.alignItems ? `align-items-${this.alignItems}` : '',
      this.justifyContent ? `justify-content-${this.justifyContent}` : '',
      this.justifyItems ? `justify-items-${this.justifyItems}` : '',
      this.placeContent ? `place-content-${this.placeContent}` : '',
      this.placeItems ? `place-items-${this.placeItems}` : '',
      this.columns ? `columns-${this.columns}` : '',
      this.rows ? `rows-${this.rows}` : '',
      this.colSpan ? `col-span-${this.colSpan}` : '',
      this.rowSpan ? `row-span-${this.rowSpan}` : '',
      this.height ? `height-${this.height}` : '',
      // this gets set if all children have an explicit size, see handleSlotChange
      this._hasExplicitSize ? 'has-explicit-size' : '',
    ]
      .toString()
      .replace(/,/g, ' ');
  }

  /**
   * Grab the parent layout element
   * @return {HTMLElement}
   */
  get layoutElement() {
    this._layoutElement = this._layoutElement || this.template.querySelector('[part="layout"]');

    return this._layoutElement;
  }

  /**
   * Method to handle the custom gap value
   */
  handleCustomGap() {
    // we get the integer and unit from the setter and check if we receive
    // a valid integer and unit. if we do, we set the value to the custom property so it can be
    // accessed in the CSS to deal with our gap solution using padding
    if (this._gapInteger && this._gapUnit) {
      this.layoutElement.style.setProperty('--sds-c-layout-spacing-gap', this._gap);
    }
  }

  /**
   * Method to handle valid gap values
   */
  handleGap() {
    // we get the integer and unit from the setter and use it here
    // if we don't receive a custom value.
    // if we receive a range that is above 12 (our max), we throw an error.
    // if we receive an arbitrary value, we throw an error.
    if (this._gap && parseInt(this._gapInteger) <= 12 && this._gapUnit === null) {
      return;
    }
    if (this._gapInteger && parseInt(this._gapInteger) > 12 && this._gapUnit === null) {
      console.error(`Invalid gap value: ${this._gap}. Please provide a value between 1 and 12.`);
    } else if (this._gapInteger && !this._gapUnit) {
      console.error(
        `Invalid gap value: ${this._gap}. Please provide a value between 1 and 12 or a custom integer with a valid CSS unit.`,
      );
    }
  }

  /**
   * Method to handle the custom size value
   * If we receive a custom value, we check if its a valid integer and unit.
   * If invalid, we throw an error
   * If valid, we set an inline flex basis (lwc custom elements cannot use style.setProperty)
   */
  handleCustomSize() {
    // we get the integer and unit from the setter and use it here
    // if we don't receive a custom value, we conditionally check if we receive
    // a valid integer and unit. if we do, we set an inline flex basis (lwc custom elements cannot use style.setProperty)
    // if not we throw and error
    if (!this._sizeInteger || !this._sizeUnit) {
      return;
    }
    if (this._sizeInteger && this._sizeUnit) {
      // using set attribute since we can't use style.setProperty on a custom element
      this.setAttribute('style', `flex-basis: ${this._size};`);
    } else if (this._sizeInteger && !this._sizeUnit) {
      console.error(`Invalid size value: ${this._size}. Please provide a valid CSS unit.`);
    }
  }

  /**
   * Method to handle the custom grid columns value
   */
  handleCustomGridColumns() {
    // we check if we receive a custom template-column, if so we rendered it.
    if (this.templateColumns) {
      this.layoutElement.style.setProperty('grid-template-columns', this.templateColumns);
    }
  }

  /**
   * Method to handle valid column values
   */
  handleGridColumns() {
    // we check if the columns value is a valid integer and below 12 (our max)
    // if not, we throw an error
    if (this.columns && !isNaN(parseInt(this.columns)) && parseInt(this.columns) <= 12) {
      return;
    }
    if (this.columns && !isNaN(parseInt(this.columns)) && parseInt(this.columns) > 12) {
      console.error(`Invalid columns value: ${this.columns}. Please provide a value between 1 and 12.`);
    }
  }

  /**
   * Method to handle the custom grid rows value
   */
  handleCustomGridRows() {
    // we check if we receive a custom template-row, if so we rendered it.
    if (this.templateRows) {
      this.layoutElement.style.setProperty('grid-template-rows', this.templateRows);
    }
  }

  /**
   * Method to handle valid column values
   */
  handleGridRows() {
    // we check if the rows value is a valid integer and below 6 (our max)
    // if not, we throw an error
    if (this.rows && !isNaN(parseInt(this.rows)) && parseInt(this.rows) <= 6) {
      return;
    }
    if (this.rows && !isNaN(parseInt(this.rows)) && parseInt(this.rows) > 6) {
      console.error(`Invalid rows value: ${this.rows}. Please provide a value between 1 and 6.`);
    }
  }

  /**
   * Setup method used when the component is rendered and when the slot changes
   */
  setup() {
    this.handleCustomGap();
    this.handleGap();
    this.handleCustomGridColumns();
    this.handleCustomGridRows();
    this.handleGridColumns();
    this.handleGridRows();
    this.handleCustomSize();
  }

  handleSlotChange = handleSlotChangeWithState(async (state) => {
    if (await state.changed) {
      this.setup();
      const childrenWithSize = state.newContent.filter((child) => child.hasAttribute('size'));
      if (childrenWithSize.length === 0) {
        return;
      }
      if (childrenWithSize.length > 0 && state.newContent.length === childrenWithSize.length) {
        this._hasExplicitSize = true;
      } else {
        console.error(
          'All children of sds-layout must have a size attribute if you want to use explicit sizing.',
        );
      }
    }
  });

  renderedCallback() {
    if (!this._rendered) {
      this._rendered = true;
      this.setup();
    }
  }
}
