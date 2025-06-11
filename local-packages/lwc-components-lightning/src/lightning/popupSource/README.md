# lightning-popup-source

> `lightning-popup-source` is internal-only. It's not yet supported for use by customers on the Salesforce platform.

-   [Overview](#overview)
-   [Positioning the Popup](#positioning-the-popup)
-   [Methods](#methods)
-   [Custom Events](#custom-events)
-   [Accessibility](#accessibility)

## Overview

Use `lightning-popup-source` to create a popup window that displays contextual information. Typically, you open a popup when a user interacts with a focusable element by clicking it.

`lightning-popup-source` contains `lightning-popup` and `lightning-bubble` for nubbin alignment relative to the element that calls it.

The component does not provide styling for the popover body. You can apply Lightning Design System classes such as the `slds-popover` classes to the elements within `lightning-popup-source`. For examples and guidelines, see [Popovers](https://www.lightningdesignsystem.com/components/popovers/) in the Lightning Design System.

This example uses `lightning-button` to open a popup. The content of the popup includes a close button and a div element that specifies the `slds-popover__body` class. The positioning of the popup via the `style` attribute is used to demonstrate how the popup behaves in the middle of the viewport.

```html
<lightning-popup-source
    style="position: absolute; top: 30%; left: 50%"
    onclickout={handleClickOut}
>
    <lightning-button
        slot="source"
        label="Show popup"
        onclick={handleSourceClick}
    ></lightning-button>
    <lightning-button-icon
        icon-name="utility:close"
        alternative-text="Close"
        title="close"
        variant="bare"
        size="small"
        class="slds-float_right slds-popover__close"
        onclick={handleClose}
    ></lightning-button-icon>

    <div class="slds-popover__body">
        The popup is displayed relative to the trigger element.
    </div>
</lightning-popup-source>
```

When the button is clicked, focus is placed on the close button in the popup since it's the only focusable element in the popup.

The button calls the `handleSourceClick()` function, which uses the `open()` method to align the popup relative to the button, which is at the bottom by default.

```js
import { LightningElement } from 'lwc';

export default class SimplePopup extends LightningElement {
    handleSourceClick(event) {
        event.target.parentNode.open({
            alignment: 'bottom',
            autoFlip: true,
        });
    }
    handleClickOut(event) {
        this.popupSource.close();
    }

    handleClose(event) {
        this.popupSource.close();
    }

    get popupSource() {
        return this.template.querySelector('lightning-popup-source');
    }
}
```

The following illustration shows the **Show popup** button as the trigger element. The diamond in this diagram represents the alignment point defined by `alignment`.

```
                 ┌──────────────────┐
                 │    Show popup    │
                 └────────♦─────────┘
 ┌────────────────────────^────────────────────────┐
 │ The popup is displayed relative to the trigger  |
 | element.                                        │
 └─────────────────────────────────────────────────┘
```

## Positioning the Popup

To align the popup relative to the trigger element, specify the `alignment` argument when you call `open()`. The alignment specifies
the preferred position, but the position can change depending on available space on the viewport.

Valid alignments include:

-   `top left`
-   `top`
-   `top right`
-   `right top`
-   `right`
-   `right bottom`
-   `bottom right`
-   `bottom` (default)
-   `bottom left`
-   `left bottom`
-   `left`
-   `left top`

```
                 ┌─────────────┐┌────────┐┌──────────────┐
                 │ top left    ││ top    ││ top right    │
                 └⌄────────────┘└───⌄────┘└─────────────⌄┘
 ┌─────────────┐ ┌♦─────────────────♦───────────────────♦┐ ┌──────────────┐
 │ left top    › ♦                                       ♦ ‹ right top    │
 │             │ │                                       │ │              │
 └─────────────┘ │                                       │ └──────────────┘
 ┌─────────────┐ │                                       │ ┌──────────────┐
 │ left        › ♦              Show popup               ♦ ‹ right        │
 └─────────────┘ │                                       │ └──────────────┘
 ┌─────────────┐ │                                       │ ┌──────────────┐
 │ left bottom │ │                                       │ │ right bottom │
 │             › ♦                                       ♦ ‹              │
 └─────────────┘ └♦─────────────────♦───────────────────♦┘ └──────────────┘
                 ┌⌃────────────┐┌───⌃────┐┌─────────────⌃┐
                 │ bottom left ││ bottom ││ bottom right │
                 └─────────────┘└────────┘└──────────────┘
```

The alignment value `a b` represents the position `a` relative to the trigger element and the position `b` of the nubbin on the popup. If the alignment doesn't include the `b` value, the nubbin defaults to the center of the popup.

For example, `alignment: 'top'` results in the following positioning.

```
┌─────────────────────────────────────────────────┐
│ The popup is displayed relative to the trigger  |
| element.                                        │
└───────────────────────v─────────────────────────┘
               ┌────────♦─────────┐
               │    Show popup    │
               └──────────────────┘
```

When the content of the popup doesn't fit, it can be flipped on horizontal or vertical axes for better fit.

For example, if there's no space on the viewport to the left of the trigger element and `alignment` is set to `left bottom`, the component auto-aligns to `right bottom` when `autoFlip` is `true`.

```
                          ┌─────────────────────────────────────────────────┐
    ┌──────────────────┐  | The popup is displayed relative to the trigger  |
    │    Show popup    ♦  < element.                                        |
    └──────────────────┘  └─────────────────────────────────────────────────┘

```

## Methods

**`open({ alignment, size, autoFlip })`**

Opens a popup if it's closed. If you don't specify any parameters, the popup opens below the element that opened it. The popup content is left-aligned with the element, with the nubbin aligned at the top of the popup.

| Parameter   | Type    | Description                                                                                                                                                              |
| ----------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `alignment` | string  | An optional list of positions that align the popup relative to the trigger element. This value defaults to `bottom`. See the **Positioning the Popup** section.          |
| `size`      | string  | The size of the popup. Valid values include `small`, `medium`, `large`, and `full`. This value defaults to `medium`.                                                     |
| `autoFlip`  | boolean | If set to true, the popup auto-aligns left or right relative to the element that opened it, depending on available space in the viewport. This value defaults to `true`. |

**`close()`**

Closes the popup if it's open.

## Custom Events

**`close`**

The event fired when the popup is closed.

**`open`**

The event fired when the popup is opened.

**`clickout`**

The event fired when focus is removed from the popup, such as clicking outside the popup or when the popup is closed.

## Accessibility

To support keyboard or screen reader users, a button should be present next to the trigger element. The popup window is a non-modal dialog, which means it always traps focus. Pressing Tab while focused in the modal keeps focus in the modal rather than moving it to the underlying page.

For more information, see the [lightning-popup](../popup) component and [SLDS popover blueprint](https://lightningdesignsystem.com/components/popovers/).
