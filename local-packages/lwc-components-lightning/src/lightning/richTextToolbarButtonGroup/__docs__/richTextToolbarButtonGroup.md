The `lightning-rich-text-toolbar-button-group` component is a container
component for custom buttons in `lightning-input-rich-text`. The component
is used in a named slot.

Place the `lightning-rich-text-toolbar-button-group` component inside
`lightning-input-rich-text` and specify the attribute `slot="toolbar"`
to create a group for custom buttons. The group is displayed on the end
of the toolbar.

Place `lightning-rich-text-toolbar-button` components inside
`lightning-rich-text-toolbar-button-group` to define custom buttons.

A group is required for custom buttons, even if there is only one custom button.

You can include multiple custom button groups in `lightning-input-rich-text`
and include multiple custom buttons in each `lightning-rich-text-toolbar-button-group`.

This example shows basic usage for two button groups, each using the `toolbar` slot.

```html
<template>
    <lightning-input-rich-text>
        <lightning-rich-text-toolbar-button-group
            slot="toolbar"
            aria-label="Template Button Group"
        >
            <lightning-rich-text-toolbar-button
                icon-name="utility:insert_template"
                icon-alternative-text="Insert Doc Template"
                onclick={handleInsertDocTemplate}
            >
            </lightning-rich-text-toolbar-button>
            <lightning-rich-text-toolbar-button
                icon-name="utility:email"
                icon-alternative-text="Insert Email Template"
                onclick={handleInsertEmailTemplate}
            >
            </lightning-rich-text-toolbar-button>
        </lightning-rich-text-toolbar-button-group>
        <lightning-rich-text-toolbar-button-group
            slot="toolbar"
            aria-label="Save Button Group"
        >
            <lightning-rich-text-toolbar-button
                icon-name="utility:save"
                icon-alternative-text="Save"
                onclick={handleSave}
            >
            </lightning-rich-text-toolbar-button>
        </lightning-rich-text-toolbar-button-group>
    </lightning-input-rich-text>
</template>
```

For more information about custom buttons, see
[`lightning-rich-text-toolbar-button`](bundle/lightning-rich-text-toolbar-button)
documentation.

#### Accessibility

Specify the attribute `aria-label` to provide a label to inform
assistive device users about the button group.

Use the Tab key to navigate to the buttons, and then use
Left and Right arrow keys to navigate among the buttons until
you reach the custom button group.
