The `lightning-rich-text-toolbar-button` component creates a button for
the toolbar for `lightning-input-rich-text`.

Place `lightning-rich-text-toolbar-button` inside the
`lightning-rich-text-toolbar-button-group` component, which groups
the custom buttons.

You can include multiple button groups, and each group can contain multiple buttons.

For more information about custom button groups, see
[`lightning-rich-text-toolbar-button-group`](bundle/lightning-rich-text-toolbar-button-group)
documentation.

Use the `icon-name` attribute to specify a Lightning Design System
[utility icon](https://www.lightningdesignsystem.com/icons/#utility)
to display on the button.

Use `icon-alternative-text` to describe the button's function for users of
assistive technologies.

The `selected` attribute reflects the state of the button. Specify `selected`
in the `lightning-rich-text-toolbar-button` component to indicate when the
button is selected, and the button background color is dark. By default,
`selected` is false and the button background color is light.

Specify the `disabled` attribute to display the button icon as light gray and
prevent the button from being selected.

#### Creating Custom Buttons

You can create buttons by using the `lightning-rich-text-toolbar-button` component
attributes and the `onclick` handler to perform an action. For example, you can
create a handler to format text, insert text, attach a file to a feed post,
or open a popup to do whatever you want.

For information about formatting or inserting text programmatically, see the
[`lightning-input-rich-text`](bundle/lightning-input-rich-text)
documentation.

This example includes one button group that contains one button for applying
`code-block` format. The `code-block` format is not a default format in
`lightning-input-rich-text`, so the `formats` attribute specifies all the
formats required in the toolbar.

```html
<template>
    <lightning-input-rich-text
        formats="font, bold, italic, underline, strike,
    list, indent, align, link, image, clean, code, code-block, color, background, header"
    >
        <lightning-rich-text-toolbar-button-group
            slot="toolbar"
            aria-label="First group"
        >
            <lightning-rich-text-toolbar-button
                icon-name="utility:insert_tag_field"
                icon-alternative-text="Code Snippet"
                onclick={handleCodeBlockButtonClick}
            >
            </lightning-rich-text-toolbar-button>
        </lightning-rich-text-toolbar-button-group>
    </lightning-input-rich-text>
</template>
```

The handler gets the format currently set in the editor, and applies or
removes the `code-block` format, depending on the current format.

```javascript
import { LightningElement } from 'lwc';

export default class CustomButtonDemo extends LightningElement {
    handleCodeBlockButtonClick() {
        const inputRichText = this.template.querySelector(
            'lightning-input-rich-text'
        );
        let format = inputRichText.getFormat();

        // Set or unset code-block format based on format on current selection
        if (format['code-block']) {
            inputRichText.setFormat({ 'code-block': false });
        } else {
            inputRichText.setFormat({ 'code-block': true });
        }
    }
}
```

#### Opening Popups with Custom Buttons (Beta)

The `lightning-rich-text-toolbar-button` component provides methods that
enable you to open and close popups from custom buttons.

Use the `showPopup()` method to open a popup from a custom button, and use `closePopup()` to close it.

Provide the content of the popup by nesting components inside `lightning-rich-text-toolbar-button`.

Popups close by default if you click outside the popup. The `popupclickout` event fires when you click outside,
so you can use a handler on this event to prevent closing if needed.

This example creates a Save button that opens a popup to prompt the user to save the content.
The popup content consists of a text input field and two buttons. The Save custom button
prevents the default clickout behavior.

```html
<template>
    <lightning-input-rich-text>
        <lightning-rich-text-toolbar-button-group
            slot="toolbar"
            aria-label="First group"
        >
            <lightning-rich-text-toolbar-button
                icon-name="utility:save"
                icon-alternative-text="Save"
                onclick={openPopup}
                onpopupclickout={handlePopupClickout}
            >
                <!-- Popup Items -->
                <lightning-input label="Save As"></lightning-input>
                <div class="slds-m-top_small">
                    <lightning-button
                        variant="brand"
                        label="Save"
                        onclick={handleSave}
                    >
                    </lightning-button>
                    <lightning-button
                        variant="bare"
                        label="Cancel"
                        onclick={closePopup}
                        style="margin-left: .25rem"
                    >
                    </lightning-button>
                </div>
            </lightning-rich-text-toolbar-button>
            <lightning-rich-text-toolbar-button
                icon-name="utility:brush"
                disabled
            ></lightning-rich-text-toolbar-button>
        </lightning-rich-text-toolbar-button-group>

        <lightning-rich-text-toolbar-button-group
            slot="toolbar"
            aria-label="Second group"
        >
            <lightning-rich-text-toolbar-button
                icon-name="utility:email"
            ></lightning-rich-text-toolbar-button>
            <lightning-rich-text-toolbar-button
                icon-name="utility:call"
            ></lightning-rich-text-toolbar-button>
        </lightning-rich-text-toolbar-button-group>
    </lightning-input-rich-text>
</template>
```

The JavaScript simply calls `showPopup()` to create the popup.
The component handles the positioning and styling of the popup for you.

The example's `handlePopupClickout` function calls `event.preventDefault()` to prevent
the popup from closing. The user can only close it by clicking the popup's Save or Cancel
buttons, or by pressing the Escape key.

```javascript
import { LightningElement } from 'lwc';

export default class CustomButtonPopupDemo extends LightningElement {
    preventCloseOnClickOut = true;

    openPopup(event) {
        event.target.showPopup();
    }

    closePopup() {
        this.template
            .querySelectorAll('lightning-rich-text-toolbar-button')[0]
            .closePopup();
    }

    handleSave() {
        const name = this.template.querySelector('lightning-input');
        this.enteredText = name.value;
        // save the content
        this.closePopup();
    }

    handlePopupClickout(event) {
        if (this.preventCloseOnClickOut) {
            event.preventDefault();
        }
    }
}
```

#### Accessibility

Use `icon-alternative-text` to describe the button's function. The text is displayed on the button tooltip
and as assistive text for users of assistive technologies.

#### Custom Events

**`popupclickout`**

The event fired when a popup is open and you click outside it.

The `popupclickout` event returns no parameters.

The event properties are as follows.

| Property   | Value | Description                                                                    |
| ---------- | ----- | ------------------------------------------------------------------------------ |
| bubbles    | false | This event does not bubble.                                                    |
| cancelable | true  | This event can be canceled. You can call `preventDefault()` on this event.     |
| composed   | false | This event does not propagate outside the template in which it was dispatched. |
