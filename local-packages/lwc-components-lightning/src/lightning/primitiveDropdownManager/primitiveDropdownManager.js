import { LightningElement, api } from 'lwc';
import {
  autoResize,
  createControlAndTargetContract,
  handleSlotChangeWithState,
  normalizeBoolean,
  getOverflowContainer,
  closePopover,
  openPopover,
  togglePopover,
} from 'lightning/primitiveUtils';
import 'lightning/primitiveThemeProvider';

export default class LightningPrimitiveDropdownManager extends LightningElement {
  static shadowSupportMode = 'native';

  _container;
  _trigger;
  _slottedChildren;

  /**
   * The popover is powered by this object. The object standardizes the
   * popover interface which allows us to interact with our libraries to
   * assemble and update the popover.
   *
   * @type {Object}
   * @property {LightningElement} component - the component instance
   * @property {HTMLElement} control - the control element that triggers the target
   * @property {HTMLElement} target - the target element to be positioned by the control
   * @property {String} placement - the placement of the target relative to the control
   * @property {Number} offset - the offset amount of the target from the control
   * @property {Boolean} autoResize - if true, the target will resize to fit the control
   * @property {Function} observeResize - a function that cleans up the observer
   */
  _popover = {
    component: this,
    control: null,
    target: null,
    placement: 'block-start',
    offset: null,
    autoResize: false,
    observeResize: null,
  };

  /**
   * Get all slotted children.
   *
   * @returns {Array}
   */
  get slotChildren() {
    return this._slottedChildren;
  }
  set slotChildren(value) {
    if (!Array.isArray(value)) {
      console.warn(`slotChildren must be an array. Received ${typeof value}.`);
      return;
    }
    this._slottedChildren = value;
  }

  get popover() {
    return this._popover;
  }
  set popover(value) {
    this._popover[value] = value;
  }

  /**
   * Get the control element that triggers the target.
   *
   * @returns {HTMLElement}
   */
  get control() {
    return this.popover.control;
  }
  set control(value) {
    this.popover.control = value;
  }

  /**
   * Get the target element to be positioned by the control.
   *
   * @returns {HTMLElement}
   */
  get target() {
    return this.popover.target;
  }
  set target(value) {
    this.popover.target = value;
  }

  /**
   * Get the closest containing element with overflow or default to the viewport.
   *
   * @returns {HTMLElement}
   */
  get container() {
    return this._container;
  }
  set container(value) {
    this._container = value;
  }

  /**
   * Sets the placement of the target relative to the control. Placement
   * validation checked in position library.
   *
   * @returns {String}
   */
  @api
  get placement() {
    return this.popover.placement;
  }
  set placement(value) {
    this.popover.placement = value;
  }

  /**
   * Sets the offset amount of the target from the control.
   *
   * @returns {Number}
   */
  @api
  get offset() {
    return this.popover.offset;
  }
  set offset(value) {
    const numberValue = Number(value);
    if (typeof numberValue === 'number') {
      this.popover.offset = numberValue;
    } else {
      console.warn(`offset must be a valid number. Received ${value}.`);
    }
  }

  /**
   * If true, the target will resize to fit the control.
   *
   * @returns {Boolean}
   */
  @api
  get autoResize() {
    return this.popover.autoResize;
  }
  set autoResize(value) {
    this.popover.autoResize = normalizeBoolean(value);
  }

  /**
   * Observe resizing of the target and reposition the target when it does.
   *
   * @returns {Function} - a function that cleans up the observer
   */
  get observeResize() {
    return this.popover.observeResize;
  }
  set observeResize(value) {
    this.popover.observeResize = value;
  }

  /**
   * The trigger type for the target. Valid values are 'click' and 'hover'.
   *
   * @returns {String} - the trigger type
   */
  @api
  get trigger() {
    return this._trigger;
  }
  set trigger(value) {
    const validValues = ['click', 'hover'];
    if (
      validValues.includes(value)
        ? (this._trigger = value)
        : console.warn(`Trigger must be one of ${validValues}. Received ${value}.`)
    );
  }

  /**
   * Open the target. Method of opening depends on the brower's support for
   * the popover API. setSize() must be called before openPopover() so that
   * the updated rendered layout is available for positioning.
   *
   * @public
   */
  @api
  open = () => {
    this.setSize();
    openPopover(this.popover);
  };

  /**
   * Close the target. Method of closing depends on the brower's support
   * for the popover API.
   *
   * @public
   */
  @api
  close = () => {
    closePopover(this.popover);
  };

  /**
   * Toggle the target between open and closed states. Method of toggling
   * depends on the brower's support for the popover API.
   *
   * @public
   */
  @api
  toggleOpenClose = () => {
    this.setSize();
    togglePopover(this.popover);
  };

  /**
   * Sets the size of the target. Currently used for autoResize exclusively but
   * expandable to other sizing use cases.
   *
   * @public
   */
  @api
  setSize = () => {
    autoResize(this.popover);
  };

  /**
   * Sets any required attributes not covered by other areas.
   */
  setAttributes = () => {
    /**
     * We need to manually set the popover attribute to precisely control
     * the position and dimensions. Also, we set the attribute and not the
     * property because browser's that don't support the popover API won't
     * reflect the attribute.
     */
    this.target.setAttribute('popover', 'manual');
  };

  /**
   * Event handler for the open event. Opens the target if it's closed.
   * This is primarily an abstraction for the event listener.
   */
  handleOpenEvent = () => {
    this.open();
  };

  /**
   * Event handler for the close event. Closes the target if it's open.
   * This is primarily an abstraction for the event listener.
   */
  handleCloseEvent = () => {
    this.close();
  };

  /**
   * Event handler for keydown events, closes the target if the escape key is pressed.
   *
   * @param {Event} e
   */
  handleKeydownEvent = (e) => {
    if (e.key === 'Escape') {
      this.close();
    }
    if (e.key === 'Enter') {
      e.stopPropagation();
      this.toggleOpenClose();
    }
  };

  /**
   * Event handler for toggling the target between open and closed states.
   *
   * @param {Event} e - event object
   */
  handleToggleEvent = (e) => {
    e.stopPropagation();
    this.toggleOpenClose();
  };

  /**
   * Bespoke setup details for the component. Typically runs after a slot change.
   */
  setup = () => {
    /**
     * We find our container and wire up the attributes.
     */
    this.container = getOverflowContainer(this.template.host);
    this.setAttributes();
  };

  /**
   * Event Listeners
   *
   * Wire up our interactions. These are called within the slot change
   * handler depending on the render state.
   *
   * @TODO: Make hover logic smarter so we can introduce offset.
   */
  getHoverEventListeners = () => [
    { target: document, type: 'keydown', handler: this.handleKeydownEvent },
    { target: this, type: 'mouseover', handler: this.handleOpenEvent },
    { target: this, type: 'mouseout', handler: this.handleCloseEvent },
    { target: this.control, type: 'focus', handler: this.handleOpenEvent },
    { target: this.control, type: 'blur', handler: this.handleCloseEvent },
  ];

  getClickEventListeners = () => [
    { target: document, type: 'keydown', handler: this.handleKeydownEvent },
    { target: this.container, type: 'scroll', handler: this.handleCloseEvent },
    { target: this.container, type: 'click', handler: this.handleCloseEvent },
    { target: this.control, type: 'click', handler: this.handleToggleEvent },
    { target: this.control, type: 'keydown', handler: this.handleKeydownEvent },
    { target: this.target, type: 'click', handler: (e) => e.stopPropagation() },
    { target: this, type: 'close', handler: this.handleCloseEvent },
  ];

  getEventType(type) {
    return type === 'click' ? this.getClickEventListeners() : this.getHoverEventListeners();
  }

  attachEventListeners = () => {
    this.getEventType(this.trigger).forEach(({ target, type, handler }) => {
      target.addEventListener(type, handler);
    });
  };

  destroyEventListeners = () => {
    this.getEventType(this.trigger).forEach(({ target, type, handler }) => {
      target.removeEventListener(type, handler);
    });
  };

  /**
   * Slot Change Handler /w State
   *
   * This is the main entry point for the component since this manager is entirely
   * reliant on slot content. It's called whenever the slot changes.
   */
  handleSlotChange = handleSlotChangeWithState((state) => {
    if (state.changed) {
      this.slotChildren = state.newContent;
    }

    if (state.changed && !state.empty) {
      /**
       * If we have slot children, we can automatically create the control and
       * target contract and get to work below.
       */
      createControlAndTargetContract({
        element: this,
        content: this.slotChildren,
        callback: () => {
          /**
           * All the heavy lifting is done at this point, now we just need to
           * do a little minor setup unique to the component.
           */
          this.setup();

          /**
           * Manage our event listeners depending on the render state.
           */
          if (state.firstRender) {
            this.attachEventListeners();
          }
          if (!state.firstRender) {
            this.destroyEventListeners();
            this.attachEventListeners();
          }
        },
      });
    } else {
      console.error(
        'No slot children found. Please add an element with an ID and a button or input with the aria-controls attribute set to the ID.',
      );
    }
  });
}
