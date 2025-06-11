import { LightningElement, api } from 'lwc';
import 'lightning/primitiveThemeProvider';

/**
 * TODO: Add menubar behavior
 * TODO: Add support for nested menu items behavior
 * TODO: Add support for left and right keys navigation when nested menus is built
 * TODO: Toggle orientation when menubar is built in
 * TODO: Add support for menuitemcheckbox and menuitemradio
 */
export default class LightningPrimitiveMenuManager extends LightningElement {
  static shadowSupportMode = 'native';

  _valid = true;
  _groupsInSlot = false;
  _value = '';
  _rendered = false;
  _currentMenuItem = '';

  /**
   * The value of the menu.
   * @returns {string}
   */
  @api
  get value() {
    return this._value;
  }

  /**
   * Method to focus the Menu.
   */
  @api
  focus() {
    this.menu.focus();
  }

  get menu() {
    this._menuElement = this._menuElement || this.template.querySelector('[role="menu"]');

    return this._menuElement;
  }

  /**
   * Get all slotted children of the menu.
   * @returns {Array}
   */
  get slottedChildren() {
    const slot = this.template.querySelector('slot');
    return slot.assignedElements({ flatten: true });
  }

  /**
   * Get all valid slotted children of the menu. Checks for menu groups and returns the menu items.
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
   * Get all entries passed to menu and returns if they are valid menus.
   * @returns {Array}
   */
  get menuEntries() {
    return this.directChildren.filter((item) => item.id);
  }

  /**
   * Get all valid menu items passed to menu. This happens after component is upgraded when contracts are met.
   * @returns {Array}
   */
  get menuItems() {
    return this.directChildren.filter((item) => item.role === 'menuitem');
  }

  /**
   * Get the labels of an menu group.
   * @returns {Array}
   */
  get menuGroupLabels() {
    return this.allDirectChildren.filter((item) => item.role === 'presentation' && item.id);
  }

  /**
   * Get all valid slotted children of the menu. Includes all menu items including presentation nodes.
   * @returns {Array}
   */
  get allDirectChildren() {
    const groupedChildren = [];
    this.slottedChildren.forEach((item) => {
      if (item.children.length > 0) {
        groupedChildren.push(...item.children);
      }
    });
    return this._groupsInSlot ? groupedChildren : this.slottedChildren;
  }

  /**
   * Get the first item of the menu.
   * @returns {HTMLElement}
   */
  get firstMenuItem() {
    return this.menuEntries[0];
  }

  /**
   * Event handler for keydown events on the menu.
   * @param {KeyboardEvent} e
   */
  onMenuKeydown(e) {
    const inFocusMenuItem = this._currentMenuItem || this.firstMenuItem;
    let nextFocusMenuItem = null;
    let flag = false;
    if (!inFocusMenuItem) {
      return;
    }
    switch (e.key) {
      case 'ArrowUp':
        nextFocusMenuItem = this.findPrevMenuItem(inFocusMenuItem);
        flag = true;
        break;
      case 'ArrowDown':
        nextFocusMenuItem = this.findNextMenuItem(inFocusMenuItem);
        flag = true;
        break;
      case ' ':
      case 'Enter':
        this.onMenuItemClick(inFocusMenuItem);
        flag = true;
        break;
      case 'Tab':
        this.resetMenuSelection();
        break;
      default:
        break;
    }
    if (nextFocusMenuItem) {
      this.setFocusToMenuitem(nextFocusMenuItem);
    }
    if (flag) {
      e.stopPropagation();
      e.preventDefault();
    }
  }

  /**
   * Method to find the previous menu item in the menu.
   * @param {HTMLElement} currentMenuItem
   * @returns {HTMLElement}
   */
  findPrevMenuItem(currentMenuItem) {
    const allMenuItems = [...this.menuItems];
    const currentMenuItemIndex = allMenuItems.indexOf(currentMenuItem);
    let prevMenuItem = null;

    if (currentMenuItemIndex > 0) {
      prevMenuItem = allMenuItems[currentMenuItemIndex - 1];
    }
    if (currentMenuItemIndex === 0) {
      prevMenuItem = allMenuItems[allMenuItems.length - 1];
    }
    return prevMenuItem;
  }

  /**
   * Method to find the next menu item in the menu.
   * @param {HTMLElement} currentMenuItem
   * @returns {HTMLElement}
   */
  findNextMenuItem(currentMenuItem) {
    const allMenuItems = [...this.menuItems];
    const currentMenuItemIndex = allMenuItems.indexOf(currentMenuItem);
    let nextMenuItem = null;

    if (currentMenuItemIndex > -1 && currentMenuItemIndex < allMenuItems.length - 1) {
      nextMenuItem = allMenuItems[currentMenuItemIndex + 1];
    }
    if (currentMenuItemIndex === allMenuItems.length - 1) {
      nextMenuItem = allMenuItems[0];
    }
    return nextMenuItem;
  }

  /**
   * Method to check for contracts of menu.
   * @returns {boolean}
   */
  handleValidContracts() {
    // Need to run first so we can check if the parent element is valid and has children
    this.handleValidParentWithChildren();
    const slottedElement = this.directChildren;
    this.handleValidChildrenWithParent(slottedElement);
  }

  /**
   * Method to check if menu contains parent elements with children, handles single and multiple parents (menu groups).
   * @returns {boolean}
   */
  handleValidParentWithChildren() {
    const groups = this.slottedChildren.filter((item) => this.checkValidParent(item));
    // Deal with single parent, such as a div, ul, or ol
    if (groups.length === 1) {
      this._groupsInSlot = true;
      groups[0].setAttribute('role', 'presentation');
    } else if (groups.length > 1) {
      // Deal with multiple parents, which are menu groups, they required a label
      this._groupsInSlot = true;
      if (this.menuGroupLabels.length === groups.length) {
        [...groups].forEach((item, key) => {
          item.setAttribute('role', 'group');
          item.setAttribute('aria-labelledby', this.menuGroupLabels[key].id);
        });
      } else {
        console.error(
          'We have determined you have menu groups, but not all of them have labels. Please add an element with role="presentation" and a unique id to each group.',
        );
      }
    } else {
      return;
    }
  }

  /**
   * Method to check if menu contains valid children.
   * @param {HTMLElement} parentElement
   * @returns {boolean}
   */
  handleValidChildrenWithParent(parentElement) {
    if (parentElement.length !== this.menuEntries.length) {
      this._valid = false;
      console.error(
        'Contracts for Menu Manager have not been met, please ensure each menu item has an "id" attribute, with a unique value.',
      );
    }
  }

  /**
   * Method to check if the menu item is valid and contains no interactive elements.
   * @param {HTMLElement} item
   * @returns {boolean}
   */
  handleValidMenuItem(item) {
    if (item.role !== 'menuitem') {
      return;
    }
    if (item.children.length > 0) {
      const interactiveElements = this.findInteractiveChildren(item);
      if (interactiveElements.length > 0) {
        console.error('Menu items cannot be interactive elements, please use a <span> or <div> instead.');
      }
    }
  }

  /**
   * Method to find interactive elements within the menu items.
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
   * Set the initial state of the menu items.
   * @param {HTMLElement} item
   */
  handleAriaRoles(menuItem) {
    menuItem.setAttribute('role', 'menuitem');
    menuItem.setAttribute('tabindex', '-1');
    menuItem.title = menuItem.textContent;
  }

  /**
   * Method to handle disabled menu items. Adds aria-disabled attribute and tabindex=-1 to disabled menu items.
   * @param {*} item
   */
  handleDisabledMenuItem(item) {
    if (item.hasAttribute('disabled')) {
      item.setAttribute('aria-disabled', 'true');
    } else {
      item.setAttribute('aria-disabled', 'false');
    }
  }

  /**
   * Method to handle focus of menu. Sets focus on the first menu item when navigating with keyboard.
   * If single select, will focus and select the active descendant.
   */
  handleFocus() {
    const firstItem = this.firstMenuItem;
    this.setAriaActiveDescendant(firstItem.id);
    firstItem.setAttribute('focus', '');
  }

  /**
   * Method to add all associated event listeners to the menu item.
   * @param {HTMLElement} menuItem
   */
  bindEventListenersToMenuItem(menuItem) {
    menuItem.addEventListener('click', (e) => {
      let clickedMenuItem = e.currentTarget;
      this.onMenuItemClick(clickedMenuItem);
    });
    menuItem.addEventListener('mouseover', (e) => {
      this.onMenuitemMouseover(e);
    });
  }

  /**
   * Method to handle the click event on a menu item.
   * @param {HTMLElement} currentMenuItem
   */
  onMenuItemClick(currentMenuItem) {
    if (!currentMenuItem.hasAttribute('aria-disabled')) {
      this._value = currentMenuItem.textContent;
      currentMenuItem.removeAttribute('focus');
      this.setAriaActiveDescendant();
      this.dispatchEvent(new CustomEvent('selectionchange', { detail: 'sds-menu-manager' }));
    }
  }

  /**
   * Method to handle the mouseover event on a menu item.
   * @param {MouseEvent} event
   */
  onMenuitemMouseover(event) {
    var tgt = event.currentTarget;
    this.setFocusToMenuitem(tgt);
  }

  /**
   * Method to set focus on the menu item when they are
   * traversed through keyboard navigation.
   * @param {HTMLElement} newMenuItem
   */
  setFocusToMenuitem(newMenuItem) {
    [...this.directChildren].forEach((menuItem) => {
      if (menuItem === newMenuItem) {
        menuItem.setAttribute('focus', '');
        this._currentMenuItem = menuItem;
        if (menuItem.hasAttribute('aria-disabled')) {
          this.setAriaActiveDescendant();
        } else {
          this.setAriaActiveDescendant(menuItem.id);
        }
      } else {
        menuItem.removeAttribute('focus');
      }
    });
  }

  /**
   * Method to set aria-activedescendant attribute when navigating over the menu items.
   * It's vaue is set to empty when a menu item is selected.
   * * @param {String} menuItem id
   */
  setAriaActiveDescendant(id) {
    const menu = this.menu;

    if (id) {
      menu.setAttribute('aria-activedescendant', id);
    } else {
      menu.setAttribute('aria-activedescendant', '');
    }
  }

  /**
   * Event handler for slot change. Upgrades the menu when contracts are met and binds event listeners to the menu items.
   * @param {Event} e
   */
  handleSlotChange(e) {
    if (!this._valid) {
      return;
    }

    [...this.directChildren].forEach((item) => {
      const isDisabled = item.hasAttribute('disabled');
      this.handleAriaRoles(item);
      this.handleValidMenuItem(item);
      if (!isDisabled) {
        this.bindEventListenersToMenuItem(item);
      } else {
        item.setAttribute('aria-disabled', 'true');
      }
    });
  }

  /**
   * Method to reset the Menu.
   * Removes focus on any menu item and clears the aria-activedescendant attribute.
   */
  resetMenuSelection() {
    this._currentMenuItem && this._currentMenuItem.removeAttribute('focus');
    this.setAriaActiveDescendant();
  }

  /**
   * When the component renders, we validate the contracts and upgrade the menu.
   */
  renderedCallback() {
    if (!this._rendered) {
      this._rendered = true;
      this.handleValidContracts();
      this.addEventListener('mouseleave', this.resetMenuSelection.bind(this));
    }
  }
}
