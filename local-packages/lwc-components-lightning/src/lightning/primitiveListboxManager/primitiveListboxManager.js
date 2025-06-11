import { LightningElement, api } from 'lwc';
import { normalizeBoolean, normalizeInput, oneOf } from 'lightning/primitiveUtils';
import 'lightning/primitiveThemeProvider';

/**
 * TODO: Add reordering behavior
 */
export default class LightningPrimitiveListboxManager extends LightningElement {
  static shadowSupportMode = 'native';

  _valid = true;
  _groupsInSlot = false;
  _orientation = 'vertical';
  _multiSelect = false;
  _value = [];
  _tabIndex = '0';
  _navigate = 'select';
  _listBoxElement;
  _listBoxItemsElements;
  _listboxOptionsElements;
  _optionGroupLabelsElements;
  _activeDescendantElement;

  @api id = 'listbox-id';
  @api ariaPosInSet;
  @api ariaSetSize;

  @api
  get tabIndex() {
    return this._tabIndex;
  }
  set tabIndex(value) {
    this._tabIndex = normalizeInput(value);
    this.removeAttribute('tabindex');
  }

  @api
  get navigate() {
    return this._navigate;
  }
  set navigate(value) {
    this._navigate = normalizeInput(value);
    oneOf(this._navigate, ['select', 'focus']);
  }

  /**
   * Enable multiple selection of listbox items.
   * @type {boolean}
   * @default false
   */
  @api
  get multiselect() {
    return this._multiSelect;
  }
  set multiselect(value) {
    this._multiSelect = normalizeBoolean(value);
  }

  /**
   * The orientation of the listbox.
   * @type {string}
   * @default vertical
   * @values vertical, horizontal
   */
  @api
  get orientation() {
    return this._orientation;
  }
  set orientation(value) {
    this._orientation = normalizeInput(value);
  }

  /**
   * The value of the listbox.
   * @returns {string}
   */
  @api
  get value() {
    return this._value;
  }

  /**
   * The role of the listbox. This is always listbox, just returning the value for the sake of consistency.
   * @returns {string}
   */
  @api
  get role() {
    return 'listbox';
  }

  connectedCallback() {
    // Dispatch custom event for parent
    // Fires when the listbox is registered
    this.dispatchEvent(
      new CustomEvent('listboxregister', {
        bubbles: true,
        cancelable: true,
        detail: {
          name: 'sds-listbox-manager',
        },
      }),
    );
  }

  /**
   * Event handler for keydown events on the listbox.
   * @param {KeyboardEvent} e
   */
  @api
  handleListboxKeyboardNavigation(e) {
    const currentItem = this.activeDescendant || this.firstItem;
    let nextItem = currentItem;

    if (!currentItem) {
      return;
    }
    switch (e.key) {
      case 'Home':
      case 'End':
      case 'ArrowUp':
      case 'ArrowDown':
        this.handleKeyboardKeys(e, currentItem);
        break;
      case 'ArrowLeft':
      case 'ArrowRight':
        if (this.orientation === 'horizontal') {
          this.handleKeyboardKeys(e, currentItem);
        }
        break;
      case 'Shift':
        this.startRangeIndex = this.getElementIndex(currentItem, this.listboxOptions);
        break;
      case 'a':
      case 'A':
        if (this.multiselect && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          this.handleSelectAll();
          this.dispatchEvent(new CustomEvent('selectionchange', { detail: 'sds-listbox-manager' }));
        }
        break;
      case ' ':
        e.preventDefault();
        if (this.multiselect && e.code === 'Space') {
          this.handleToggleItemSelect(nextItem);
          this.dispatchEvent(new CustomEvent('selectionchange', { detail: 'sds-listbox-manager' }));
        }
        if (!this.multiselect && this.navigate === 'focus' && e.code === 'Space') {
          this.handleSingleItemSelect(nextItem);
          this.dispatchEvent(new CustomEvent('selectionchange', { detail: 'sds-listbox-manager' }));
        }
        break;
      // Add case for single/multiple typed characters (Type-ahead)
      // Reset the timeout and run the matching logic after each key press for a quicker filtering
      // If no key is pressed after 500ms, reset all to support single key matching.
      default:
        if (e.key.length === 1) {
          clearTimeout(this.typingTimeoutId);
          this.typedString = (this.typedString || '') + e.key.toLowerCase();
          this.handleTypedString(this.typedString, currentItem);
          this.typingTimeoutId = setTimeout(() => {
            this.typedString = '';
          }, 500);
        }
        break;
    }
  }

  /**
   * Handle Home (fn + left), End (fn + right), ArrowUp, ArrowDown, ArrowLeft, and ArrowRight keys
   * @param {KeyboardEvent} e
   * @param {HTMLElement} currentItem
   */
  handleKeyboardKeys(e, currentItem) {
    e.preventDefault();
    // Here we check if the method has been called by an outside source, if not,
    // we check if the first item is selected and the tabindex is not 0, if so, we select the first item.
    if (!this._keyboardNavMethodCalled && this._tabIndex !== '0' && currentItem === this.firstItem) {
      if (this.navigate === 'select') {
        this._keyboardNavMethodCalled = true;
        this.handleSingleItemSelectAndFocus(currentItem);
        this.dispatchEvent(new CustomEvent('selectionchange', { detail: 'sds-listbox-manager' }));
      } else if (this.navigate === 'focus') {
        this._keyboardNavMethodCalled = true;
        return this.handleItemFocus(currentItem);
      }
      // If the listbox has been focused since it has tabindex=0, we fallback to the default behavior
      // where the onfocus handler deals with setting up the active descendant and we continue forward
      // selecting the next item in the list of options
    } else {
      let nextItem;

      switch (e.key) {
        case 'Home':
          nextItem = this.firstItem;
          break;
        case 'End':
          nextItem = this.lastItem;
          break;
        case 'ArrowUp':
        case 'ArrowLeft':
          nextItem = this.findPrevOption(currentItem);
          break;
        case 'ArrowDown':
        case 'ArrowRight':
          nextItem = this.findNextOption(currentItem);

          break;
        default:
          break;
      }
      if (nextItem) {
        if (this.multiselect && e.shiftKey) {
          if (this.startRangeIndex === null) {
            this.startRangeIndex = this.getElementIndex(currentItem, this.listboxOptions);
          }
          this.selectRange(this.startRangeIndex, nextItem);
          this.dispatchEvent(new CustomEvent('selectionchange', { detail: 'sds-listbox-manager' }));
        } else if (this.multiselect && e.ctrlKey) {
          this.handleItemFocus(nextItem);
        } else if (this.multiselect) {
          this.handleItemFocus(nextItem);
          this.startRangeIndex = this.getElementIndex(nextItem, this.listboxOptions);
        } else {
          if (this.navigate === 'select') {
            this.handleSingleItemSelectAndFocus(nextItem);
          } else if (this.navigate === 'focus') {
            this.handleItemFocus(nextItem);
          }
          this.dispatchEvent(new CustomEvent('selectionchange', { detail: 'sds-listbox-manager' }));
        }
      }
    }
  }

  /**
   * Handles the typed string to find the matching next item in the listbox (Type-ahead).
   *
   * @param {string} typedString - The string that is being typed.
   * @param {object} currentItem - The current item in the listbox.
   * @return {void} This function does not return anything.
   */
  handleTypedString(typedString, currentItem) {
    const allItems = [...this.listboxOptions];
    const currentItemIndex = allItems.indexOf(currentItem);

    let nextItem = this.findNextTypedStringMatchingItem(typedString, allItems, currentItemIndex);

    // Handle focus and selection for matching option
    if (nextItem !== currentItem) {
      if (this.multiselect) {
        this.handleItemFocus(nextItem);
      } else {
        this.handleSingleItemSelectAndFocus(nextItem);
      }
    }
  }

  /**
   * Finds the next item that matches the typed string.
   * If no match is found in the array after the current item,
   * then it will search from the beginning of the list up to the current item.
   *
   * @param {string} typedString - The string that is being typed.
   * @param {Array} items - The list of items to search.
   * @param {number} startIndex - The index to start the search from.
   * @return {object} The next matching item, or the current item if no match is found.
   */
  findNextTypedStringMatchingItem(typedString, items, startIndex) {
    const itemCount = items.length;

    for (let i = 1; i <= itemCount; i++) {
      const currentIndex = (startIndex + i) % itemCount; // Ensure circular loop
      const item = items[currentIndex];
      const itemText = item.textContent.toLowerCase();
      const isDisabled = item.hasAttribute('disabled');

      // Return matching item if not disabled
      if (itemText.startsWith(typedString) && !isDisabled) {
        return item;
      }
    }

    // Return current item if no match is found
    return items[startIndex];
  }

  /**
   * Method to find the previous option in the listbox.
   * @param {HTMLElement} currentOption
   * @returns {HTMLElement}
   */
  findPrevOption(currentOption) {
    let prevOption = null;
    const currentOptionIndex = this.visibleListboxOptions.indexOf(currentOption);
    const currentVisibleIndex =
      (currentOptionIndex + this.visibleListboxOptions.length) % this.visibleListboxOptions.length;
    if (currentVisibleIndex > -1 && currentVisibleIndex > 0) {
      prevOption = this.visibleListboxOptions[currentVisibleIndex - 1];
    }

    return prevOption;
  }

  /**
   * Method to find the next option in the listbox.
   * @param {HTMLElement} currentOption
   * @returns {HTMLElement}
   */
  findNextOption(currentOption) {
    let nextOption = null;
    const currentOptionIndex = this.visibleListboxOptions.indexOf(currentOption);
    const currentVisibleIndex = currentOptionIndex % this.visibleListboxOptions.length;
    if (currentVisibleIndex > -1 && currentVisibleIndex < this.visibleListboxOptions.length - 1) {
      nextOption = this.visibleListboxOptions[currentVisibleIndex + 1];
    }
    return nextOption;
  }

  /**
   * Method to find the first option in the listbox.
   * @param {HTMLElement} currentOption
   * @returns {HTMLElement}
   */
  findFirstOption() {
    let firstOption = null;
    const currentOptionIndex = this.visibleListboxOptions.indexOf(this.visibleListboxOptions[0]);
    const currentVisibleIndex = currentOptionIndex % this.visibleListboxOptions.length;
    if (currentVisibleIndex > -1 && currentVisibleIndex < this.visibleListboxOptions.length - 1) {
      firstOption = this.visibleListboxOptions[currentVisibleIndex];
    }
    return firstOption;
  }

  /**
   * Method to check if the selectable range is valid.
   * @param {number} index - current index of the option
   * @param {number} start - start index of the range
   * @param {number} end - end index of the range
   * @returns {boolean}
   */
  checkInRange(index, start, end) {
    const rangeStart = Math.min(start, end);
    const rangeEnd = Math.max(start, end);
    return index >= rangeStart && index <= rangeEnd;
  }

  /**
   * Method to select a range based on the start and end index.
   * @param {number} start - start index of the range
   * @param {number} end - end index of the range
   */
  selectRange(start, end) {
    var allOptions = this.listboxOptions;
    var startIndex = typeof start === 'number' ? start : this.getElementIndex(start, allOptions);
    var endIndex = typeof end === 'number' ? end : this.getElementIndex(end, allOptions);

    for (let i = 0; i < allOptions.length; i++) {
      var selected = this.checkInRange(i, startIndex, endIndex);
      this.handleItemFocus(end);
      const isDisabled = allOptions[i].hasAttribute('disabled');

      if (!isDisabled) {
        allOptions[i].setAttribute('aria-selected', selected);

        if (allOptions[i].hasAttribute('aria-selected') && selected) {
          const selectedOptions = new Set(this._value);
          selectedOptions.add(allOptions[i].textContent);
          this._value = [...selectedOptions];
        } else {
          this._value = this.removeFromArray(this._value, allOptions[i].textContent);
        }
      }
    }
  }

  /**
   * Method to get current index of the option.
   * @param {HTMLElement} option - current option to check index
   * @param {HTMLElement[]} options - all options in the listbox
   * @returns {number}
   */
  getElementIndex(option, options) {
    var allOptions = [...options];
    var optionIndex = allOptions.indexOf(option);

    return typeof optionIndex === 'number' ? optionIndex : null;
  }

  /**
   * Method to check for contracts of listbox.
   * @returns {boolean}
   */
  handleValidContracts() {
    // Need to run first so we can check if the parent element is valid and has children
    this.handleValidParentWithChildren();
    const slottedElement = this.directChildren;
    this.handleValidChildrenWithParent(slottedElement);
  }

  /**
   * Method to check if listbox contains parent elements with children, handles single and multiple parents (option groups).
   * @returns {boolean}
   */
  handleValidParentWithChildren() {
    const groups = this.slottedChildren.filter((item) => this.checkValidParent(item));
    // Deal with single parent, such as a div, ul, or ol
    if (groups.length === 1) {
      this._groupsInSlot = true;
      groups[0].setAttribute('role', 'presentation');
    } else if (groups.length > 1) {
      // Deal with multiple parents, which are option groups, they required a label
      this._groupsInSlot = true;
      if (this.optionGroupLabels.length === groups.length) {
        [...groups].forEach((item, key) => {
          item.setAttribute('role', 'group');
          item.setAttribute('aria-labelledby', this.optionGroupLabels[key].id);
        });
      } else {
        console.error(
          'We have determined you have option groups, but not all of them have labels. Please add an element with role="presentation" and a unique id to each group.',
        );
      }
    } else {
      return;
    }
  }

  /**
   * Method to check if listbox contains valid children.
   * @param {HTMLElement} parentElement
   * @returns {boolean}
   */
  handleValidChildrenWithParent(parentElement) {
    if (parentElement.length !== this.listboxItems.length) {
      this._valid = false;
      console.error(
        'Contracts for Listbox Manager have not been met, please ensure each item of the listbox has an "id" attribute, with a unique value.',
      );
    }
  }

  /**
   * Method to check if the option is valid and contains no interactive elements.
   * @param {HTMLElement} item
   * @returns {boolean}
   */
  handleValidOption(item) {
    if (item.role !== 'option') {
      return;
    }
    if (item.children.length > 0) {
      const interactiveElements = this.findInteractiveChildren(item);
      if (interactiveElements.length > 0) {
        console.error(
          'Listbox options cannot have interactive elements, please use a <span> or <div> instead.',
        );
      }
    }
  }

  /**
   * Method to find interactive elements within the listbox options.
   * @param {HTMLElement} root
   * @returns {Array}
   */
  findInteractiveChildren = (root) => {
    const elements = [];
    function traverse(node) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        if (
          node instanceof HTMLAnchorElement ||
          node instanceof HTMLButtonElement ||
          node instanceof HTMLInputElement
        ) {
          elements.push(node);
        }
        for (let i = 0; i < node.childNodes.length; i++) {
          traverse(node.childNodes[i]);
        }
      }
    }
    traverse(root);
    return elements;
  };

  /**
   * Method to check if the parent element is valid, only allows div, ul, and ol.
   * @param {HTMLElement} parentElement
   * @returns {boolean}
   */
  checkValidParent(parentElement) {
    if (
      parentElement instanceof HTMLUListElement ||
      parentElement instanceof HTMLDivElement ||
      parentElement instanceof HTMLOListElement
    ) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Set the initial state of the listbox options.
   * @param {HTMLElement} item
   */
  handleAriaRoles(item) {
    item.setAttribute('role', 'option');
    // item.title = item.textContent;
  }

  /**
   * Method to handle single selection of listbox options. Selects the option and sets focus, stores the value of the selected option.
   * @param {HTMLElement} item
   */
  handleSingleItemSelectAndFocus(item) {
    this.removePreviousSelectedAndFocus();
    this.ariaActiveDescendant = item.id;
    const isDisabled = item.hasAttribute('disabled');
    const selectedItem = this.activeDescendant;
    if (!isDisabled) {
      selectedItem.setAttribute('aria-selected', 'true');
      this._value = item.textContent;
    }
    selectedItem.setAttribute('focus', '');
  }

  /**
   * Filters the listbox options based on the provided string
   * @param {string} filterText
   */
  @api
  filterListbox(filterText) {
    [...this.listboxOptions].forEach((item) => {
      if (item.textContent.toLowerCase().indexOf(filterText.toLowerCase()) > -1) {
        item.style.display = '';
      } else {
        item.style.display = 'none';
      }
    });
  }

  /**
   * Method to select a single item. Used when navigate=focus
   * @param {HTMLElement} item
   */
  handleSingleItemSelect(item) {
    this.removePreviousSelected();
    this.ariaActiveDescendant = item.id;
    const isDisabled = item.hasAttribute('disabled');
    const selectedItem = this.activeDescendant;
    if (!isDisabled) {
      selectedItem.setAttribute('aria-selected', 'true');
      this._value = item.textContent;
    }
  }

  /**
   * Method to handle multiple selection of listbox options. Selects the option and sets focus, stores the values of the selected options.
   * @param {HTMLElement} item
   */
  handleToggleItemSelect(item) {
    const isDisabled = item.hasAttribute('disabled');
    if (item.getAttribute('aria-selected') === 'true') {
      item.setAttribute('aria-selected', 'false');
      this._value = this.removeFromArray(this.value, item.textContent);
    } else {
      this.handleItemFocus(item);
      if (!isDisabled) {
        item.setAttribute('aria-selected', 'true');
        this._value = [...new Set(this.value), item.textContent];
      }
    }
  }

  /**
   * Method to handle focus of listbox options. Used on multiple selection to set focus on the option when navigating with keyboard.
   * @param {HTMLElement} item
   */
  handleItemFocus(item) {
    if (this.ariaActiveDescendant) {
      const prevSelectedItem = this.activeDescendant;
      prevSelectedItem.removeAttribute('focus');
    }
    this.ariaActiveDescendant = item.id || this.firstItem.id;
    const selectedItem = this.activeDescendant;
    selectedItem.setAttribute('focus', '');
  }

  /**
   * Method to handle select/de-select all listbox options. Used on multiple selection to select/de-select all options.
   */
  handleSelectAll() {
    const allSelected = [...this.listboxOptions].filter(
      (item) => item.getAttribute('aria-selected') === 'true',
    );
    const disabledOptions = [...this.listboxOptions].filter((item) => item.hasAttribute('disabled'));
    if (allSelected.length === this.listboxOptions.length - disabledOptions.length) {
      this.listboxOptions.forEach((item) => {
        item.setAttribute('aria-selected', 'false');
      });
      this._value.length = 0;
    } else {
      this.listboxOptions.forEach((item) => {
        const isDisabled = item.hasAttribute('disabled');
        if (!isDisabled) {
          item.setAttribute('aria-selected', 'true');
        }
      });
      this._value = [...this.listboxOptions]
        .map((item) => !item.hasAttribute('disabled') && item.textContent)
        .filter(Boolean);
    }
  }

  /**
   * Method to handle the default selected state of the listbox options. Determined by the aria-activedescendant attribute.
   */
  handleDefaultSelected() {
    if (this.activeDescendant) {
      const selectedItem = this.activeDescendant;
      const isDisabled = selectedItem.hasAttribute('disabled');
      if (!isDisabled) {
        selectedItem.ariaSelected = true;
        if (this.multiselect) {
          this._value = [...this.value, selectedItem.textContent];
        } else {
          this._value = selectedItem.textContent;
        }
        this.dispatchEvent(new CustomEvent('selectionchange', { detail: 'sds-listbox-manager' }));
      }
    }
  }

  /**
   * Method to handle disabled listbox options. Adds aria-disabled attribute and tabindex=-1 to disabled options.
   * @param {HTMLElement} item
   */
  handleDisabledOption(item) {
    if (item.hasAttribute('disabled')) {
      item.setAttribute('aria-disabled', 'true');
    } else {
      item.setAttribute('aria-disabled', 'false');
    }
  }

  /**
   * Method to handle focus of listbox. Sets focus on the first option when navigating with keyboard.
   * If single select, will focus and select the active descendant. This gets fired when the listbox is focused.
   */
  handleFocus() {
    if (this.ariaActiveDescendant) {
      const focusedItem = this.activeDescendant;
      focusedItem.setAttribute('focus', '');
    } else {
      const firstItem = this.firstItem;
      this.ariaActiveDescendant = firstItem.id;
      firstItem.setAttribute('focus', '');
    }
    if (!this.multiselect && this.navigate === 'select') {
      this.handleDefaultSelected();
    }
  }

  handleBlur() {
    this.activeDescendant.removeAttribute('focus');
  }

  /**
   * Method to remove an previously selected items
   */
  removePreviousSelected() {
    [...this.visibleListboxOptions].forEach((item) => {
      item.setAttribute('aria-selected', 'false');
    });
  }

  /**
   * Method to remove an previously selected items and focus
   */
  removePreviousSelectedAndFocus() {
    [...this.visibleListboxOptions].forEach((item) => {
      item.setAttribute('aria-selected', 'false');
      item.removeAttribute('focus');
    });
  }

  /**
   * Method to focus the listbox.
   */
  @api
  focus() {
    this.listbox.focus();
  }

  /**
   * Method to clear selected options.
   */
  @api
  clearSelected() {
    this.listboxOptions.forEach((item) => {
      item.setAttribute('aria-selected', 'false');
      item.removeAttribute('focus');
    });
    this.removeAttribute('aria-activedescendant');
    this._value = [];
  }

  /**
   * Method to clear focused option.
   */
  @api
  clearFocused() {
    this.listboxOptions.forEach((item) => {
      item.removeAttribute('focus');
    });
  }

  /**
   * Method to remove selected option for values array
   * @param {Array} arr
   * @param {string} value
   * @returns {Array}
   */
  removeFromArray(arr, value) {
    const removeItem = arr.filter((el) => el !== value);
    return [...new Set(removeItem)];
  }

  /**
   * Get all slotted children of the listbox.
   * @returns {Array}
   */
  get slottedChildren() {
    const slot = this.template.querySelector('slot');
    return slot.assignedElements({ flatten: true });
  }

  /**
   * Get all valid slotted children of the listbox. Checks for option groups and returns the options.
   * @returns {Array}
   */
  get directChildren() {
    const groupedChildren = [];
    this.slottedChildren.forEach((item) => {
      if (item.children.length > 0) {
        groupedChildren.push(...item.children);
      }
    });
    return this._groupsInSlot
      ? groupedChildren.filter((item) => item.role !== 'presentation')
      : this.slottedChildren;
  }

  /**
   * Get the listbox.
   * @returns {HTMLElement}
   */
  get listbox() {
    this._listBoxElement = this._listBoxElement || this.template.querySelector('[role="listbox"]');

    return this._listBoxElement;
  }

  /**
   * Get all items passed to listbox and returns if they are valid options.
   * @returns {Array}
   */
  get listboxItems() {
    this._listBoxItemsElements =
      this._listBoxItemsElements || this.querySelectorAll(':not([role="presentation"]):is([id])');

    return this._listBoxItemsElements;
  }

  /**
   * Get all valid options passed to listbox. This happens after component is upgraded when contracts are met.
   * @returns {Array}
   */
  get listboxOptions() {
    this._listboxOptionsElements = this._listboxOptionsElements || this.querySelectorAll('[role="option"]');

    return this._listboxOptionsElements;
  }

  /**
   * Get visible options in the listbox. When a user filters, it will hide options that do not match the filter.
   * @returns {Array}
   */
  get visibleListboxOptions() {
    return [...this.listboxOptions].filter((item) => getComputedStyle(item).display !== 'none');
  }

  /**
   * Get the labels of an option group.
   * @returns {Array}
   */
  get optionGroupLabels() {
    this._optionGroupLabelsElements =
      this._optionGroupLabelsElements || this.querySelectorAll('[role="presentation"][id]');

    return this._optionGroupLabelsElements;
  }

  /**
   * Get the active descendant of the listbox.
   * @returns {HTMLElement}
   */
  get activeDescendant() {
    this._activeDescendantElement = this.querySelector(`#${this.ariaActiveDescendant}`);
    const activeDescendant = this._activeDescendantElement;
    // Here we have to check if there is not an active descendant or if the active descendant is hidden
    // if we can't find one, we fall back to the first visible option. We generate the visible options
    // by checking the display property of the option. This behavior happens when filtering the listbox.
    if (
      !this.ariaActiveDescendant ||
      (activeDescendant && getComputedStyle(activeDescendant).display === 'none')
    ) {
      return this.findFirstOption();
    } else {
      return activeDescendant;
    }
  }

  /**
   * Get the first item of the listbox.
   * @returns {HTMLElement}
   */
  get firstItem() {
    return this.findFirstOption();
  }

  /**
   * Get the last item of the listbox.
   * @returns {HTMLElement}
   */
  get lastItem() {
    return this.visibleListboxOptions[this.visibleListboxOptions.length - 1];
  }

  /**
   * Event handler for slot change. Upgrades the listbox when contracts are met and binds event listeners to the options.
   * @param {Event} e
   */
  handleSlotChange() {
    if (!this._valid) {
      return;
    }
    [...this.directChildren].forEach((item) => {
      const isDisabled = item.hasAttribute('disabled');
      item.setAttribute('aria-selected', 'false');
      this.handleAriaRoles(item);
      this.handleValidOption(item);
      if (!isDisabled) {
        item.addEventListener('click', () => {
          if (this.tabIndex === '0') {
            this.listbox.focus();
          }
          if (this.multiselect) {
            this.handleToggleItemSelect(item);
            this.dispatchEvent(new CustomEvent('selectionchange', { detail: 'sds-listbox-manager' }));
          } else {
            this.handleSingleItemSelectAndFocus(item);
            this.dispatchEvent(new CustomEvent('selectionchange', { detail: 'sds-listbox-manager' }));
          }
        });
      } else {
        this.handleDisabledOption(item);
      }
    });
  }

  /**
   * When the component renders, we validate the contracts and upgrade the listbox.
   */
  renderedCallback() {
    if (!this._rendered) {
      this._rendered = true;
      this.handleValidContracts();
    }
  }
}
