import { LightningElement, api } from 'lwc';
import {
  createControlAndTargetContract,
  handleSlotChangeWithState,
  normalizeBoolean,
  normalizeInput,
  oneOf,
} from 'lightning/primitiveUtils';
import 'lightning/primitiveThemeProvider';

export default class LightningPrimitiveComboboxManager extends LightningElement {
  static shadowSupportMode = 'native';

  _valid = true;
  _selectMode = 'single';
  _value;
  _ariaActivedescendant = '';
  _ariaHasPopup = 'listbox';
  _autocomplete = false;
  _readonly = false;

  @api id = 'combobox-id';

  @api
  get selectMode() {
    return this._selectMode;
  }
  set selectMode(value) {
    this._selectMode = normalizeInput(value);
    if (this._selectMode === 'multiple') {
      console.error('Multiple select mode is not yet supported.');
    }
    oneOf(this._selectMode, ['single']);
  }

  @api
  get ariaHasPopup() {
    return this._ariaHasPopup;
  }
  set ariaHasPopup(value) {
    this._ariaHasPopup = normalizeInput(value);
    if (['tree', 'grid', 'dialog'].indexOf(value) > -1) {
      console.error('tree, grid, or dialog is not yet supported for aria-haspopup.');
    }
    oneOf(this._ariaHasPopup, ['listbox']);
  }

  @api
  get autocomplete() {
    return this._autocomplete;
  }
  set autocomplete(value) {
    this._autocomplete = normalizeBoolean(value);
  }

  @api
  get readOnly() {
    return this._readonly;
  }
  set readOnly(value) {
    this._readonly = normalizeBoolean(value);
  }

  @api
  get value() {
    return this._value;
  }
  set value(value) {
    this._value = normalizeInput(value);
  }

  connectedCallback() {
    this.handleRequiredAttributes();
  }

  /**
   * Get all slotted children of the combobox. This should be the options of the combobox.
   * @returns {Array}
   */
  get slottedChildren() {
    const slot = this.template.querySelector('slot');
    return slot.assignedElements({ flatten: true });
  }

  /**
   * Event handler for keydown events on the listbox.
   * @param {KeyboardEvent} event
   */
  handleKeyDown(e) {
    this.target.handleListboxKeyboardNavigation?.(e);
    this.handleValidActiveDescendant;
  }

  handleRequiredAttributes() {
    switch (true) {
      case !this.selectMode:
        this._valid = false;
        console.error('A combobox type is required. Required options are: single, multiple.');
      case !this.ariaHasPopup:
        this._valid = false;
        console.error(
          'A combobox aria-haspopup is required. Required options are: listbox, tree, grid, dialog.',
        );
      default:
        this._valid = true;
    }
  }

  handleValidListbox() {
    switch (true) {
      case !this.target:
        this._valid = false;
        console.error('A listbox is required.');
        return;
      case this.target.role !== 'listbox':
        this._valid = false;
        console.error('The listbox must have a role of listbox.');
        return;
      case !this.target.id:
        this._valid = false;
        console.error('The listbox must have an id.');
        return;
      case this.target.id !== this.control.ariaControls:
        this._valid = false;
        console.error('The listbox id must match the combobox aria-controls.');
        return;
      default:
        this._valid = true;
    }
  }

  handleValidCombobox() {
    if (!this.control) {
      console.error(`A combobox is required. Please specific aria-controls="id-of-listbox" on the combobox.`);
      this._valid = false;
      return;
    }
  }

  handleValidActiveDescendant() {
    if (!this.target.ariaActiveDescendant) {
      console.error('The listbox must have an aria-activedescendant.');
      this._valid = false;
      return;
    }
  }

  /**
   * Set the initial state of the combobox.
   * @param {HTMLElement} combobox
   */
  handleComboboxAriaRoles(combobox) {
    combobox.setAttribute('role', 'combobox');
    combobox.setAttribute('tabindex', '0');
    combobox.setAttribute('aria-haspopup', this._ariaHasPopup);
    combobox.setAttribute('aria-expanded', 'false');
    combobox.setAttribute('aria-activedescendant', this._ariaActivedescendant);
    combobox.id = this.id;
    if (!this.autocomplete) {
      combobox.setAttribute('aria-autocomplete', 'none');
    } else {
      combobox.setAttribute('aria-autocomplete', 'list');
    }
    if (this._readonly) {
      combobox.readOnly = true;
    }
  }

  setComboboxValue(value) {
    if ('value' in this.control) {
      this.control.value = value;
      this.value = value;
    } else {
      this.control.textContent = value;
      this.value = value;
    }
  }

  setActiveDescendent() {
    if (this.target.ariaActiveDescendant) {
      this.control.setAttribute('aria-activedescendant', this.target.ariaActiveDescendant);
    } else {
      this.control.setAttribute('aria-activedescendant', '');
    }
  }

  handleComboboxUpgrade() {
    this.handleComboboxAriaRoles(this.control);
    this.control.addEventListener('focus', () => {
      this.control.setAttribute('aria-expanded', 'true');
      this.control.setAttribute('focus', '');
    });
    this.control.addEventListener('blur', () => {
      this.control.setAttribute('aria-expanded', 'false');
      this.control.removeAttribute('focus');
      this.target.clearFocused?.();
    });
    this.control.addEventListener('input', () => {
      if (this.autocomplete) {
        this.target.filterListbox?.(this.control.value);
      }
      if (this.control.value === '') {
        this.target.clearSelected?.();
      }
    });
  }

  handleListboxUpgrade() {
    this.target.tabIndex = '-1';

    this.target.addEventListener('selectionchange', (e) => {
      if (e.detail === 'sds-listbox-manager') {
        this.setActiveDescendent();
        this.control.focus();
        this.setComboboxValue(this.target.value);
      }
    });
    this.target.addEventListener('click', () => {
      this.control.focus();
    });
  }

  setup() {
    this.handleValidCombobox();
    this.handleValidListbox();
  }

  handleSlotChange = handleSlotChangeWithState((state) => {
    if (state.changed) {
      this.slotChildren = state.newContent;
    }

    if (state.changed && !state.empty) {
      createControlAndTargetContract({
        element: this,
        content: this.slottedChildren,
        callback: () => {
          /**
           * All the heavy lifting is done at this point, now we just need to
           * do a little minor setup unique to the component.
           */
          this.setup();

          if (!this._valid) {
            return;
          }
          this.handleListboxUpgrade();
          this.handleComboboxUpgrade();
        },
      });
    } else {
      console.error(
        'No slot children found. Please add an element with an ID and a button or input with the aria-controls attribute set to the ID.',
      );
    }
  });
}
