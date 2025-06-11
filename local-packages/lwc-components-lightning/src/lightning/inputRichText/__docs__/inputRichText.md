A `lightning-input-rich-text` component creates a rich text editor based on the
Quill JS library, enabling you to add, edit, format, and delete rich text. You
can create rich text editors with different toolbar configurations.

Pasting rich content into the editor is supported if the feature is available
in the toolbar. For example, you can paste bold text if the bold button is
available in the toolbar.

This example creates a rich text editor using `lightning-input-rich-text` and sets its content during
initialization. The `lightning-formatted-rich-text` component is used to display the formatted output.

```html
<template>
    <lightning-input-rich-text
        value={myVal}
        onchange={handleChange}>
    </lightning-input-rich-text>

    <lightning-formatted-rich-text value={myVal}></lightning-formatted-rich-text>
</template>
```

`lightning-input-rich-text` uses the `onchange` event handler to listen to a change to its value.

Initialize the rich text content in JavaScript. To bind the input value in the editor, use the `event.target.value` property. For more information, see [Data Binding in a Template](https://developer.salesforce.com/docs/platform/lwc/guide/js-props-getter).

```javascript
import { LightningElement } from 'lwc';
export default class RichTextExample extends LightningElement {

    myVal = '<strong>Hello!</strong>';

    handleChange(event) {
        this.myVal = event.target.value;
    }
}
```

The `required` attribute marks the text editor as requiring user input. To display an asterisk to indicate input is required,
set `label-visible` and `required`. A default label displays after the asterisk. See the **Accessibility** section for more information about labels.

The component doesn't validate for required input. See **Input Validation** for more information.

#### Customizing the Toolbar

The toolbar provides menus and buttons that are ordered within the following categories.

1. `FORMAT_FONT`: Font family and size menus. The font menu provides the following font selections: Arial, Courier, Garamond, Salesforce Sans, Tahoma, Times New Roman, and Verdana. The font selection defaults to Salesforce Sans with a size of 12px. Supported font sizes are: 8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, and 72. When you copy and paste text in the editor, the font is preserved only if the font is available in the font menu.
2. `FORMAT_TEXT`: Bold, Italic, Underline, and Strikethrough buttons.
3. `FORMAT_BODY`: Bulleted List, Numbered List, Indent, and Outdent buttons.
4. `ALIGN_TEXT`: Left Align Text, Center Align Text, and Right Align Text buttons.
5. `INSERT_CONTENT`: Image and Link buttons.
6. `REMOVE_FORMATTING`: Remove formatting button, which stands alone at the end of the toolbar.

You can disable buttons by category using the `disabled-categories` attribute.

This example shows how to disable the `FORMAT_TEXT` category for Bold, Italic, Underline, and Strikethrough buttons.

```html
<template>
    <lightning-input-rich-text
        value={myVal}
        disabled-categories="FORMAT_TEXT"
    >
    </lightning-input-rich-text>
</template>
```

#### Enabling and Disabling Formats in the Editor

You can also customize the editor using the `formats` attribute, which lists individual formats that the editor supports within the categories.

By default, `lightning-input-rich-text` enables some formats with a corresponding toolbar button. Formats that don't provide a toolbar button support only pasted content. For example, the `table` and `header` formats are enabled by default but support pasted content only, and do not provide toolbar buttons. You can't create or edit a table or a header in the rich text editor.

| Format Name  | Description                                                        | Enabled by Default | Provides a Toolbar Button | Toolbar Category    |
| ------------ | ------------------------------------------------------------------ | ------------------ | ------------------------- | ------------------- |
| `font`       | Changes the font on text                                           | Y                  | Y                         | `FORMAT_FONT`       |
| `size`       | Changes the size on text                                           | Y                  | Y                         | `FORMAT_FONT`       |
| `bold`       | Bolds text                                                         | Y                  | Y                         | `FORMAT_TEXT`       |
| `italic`     | Italicizes text                                                    | Y                  | Y                         | `FORMAT_TEXT`       |
| `underline`  | Underlines text                                                    | Y                  | Y                         | `FORMAT_TEXT`       |
| `strike`     | Adds a strikethrough to text                                       | Y                  | Y                         | `FORMAT_TEXT`       |
| `list`       | Creates a bulleted or numbered list                                | Y                  | Y                         | `FORMAT_BODY`       |
| `indent`     | Applies an indent or outdent to text                               | Y                  | Y                         | `FORMAT_BODY`       |
| `align`      | Aligns text to the left, center, or right                          | Y                  | Y                         | `ALIGN_TEXT`        |
| `link`       | Creates a link on text                                             | Y                  | Y                         | `INSERT_CONTENT`    |
| `image`      | Adds an image                                                      | Y                  | Y                         | `INSERT_CONTENT`    |
| `clean`      | Removes formatting from content                                    | Y                  | Y                         | `REMOVE_FORMATTING` |
| `table`      | Supports pasting of tables                                         | Y                  |                           |
| `header`     | Supports pasting of headers                                        | Y                  |                           |
| `color`      | Provides color selection for text                                  |                    | Y                         |
| `background` | Supports pasting of text with background colors                    |                    |                           |                     |
| `code`       | Supports pasting of inline text with code formatting               |                    |                           |                     |
| `code-block` | Supports pasting of blocks of text with code formatting            |                    |                           |                     |
| `script`     | Supports pasting of text with superscript and subscript formatting |                    |                           |                     |
| `blockquote` | Supports pasting of block quotes                                   |                    |                           |                     |
| `direction`  | Supports RTL and LTR text                                          |                    |                           |                     |

The `formats` attribute must include the complete list of formats to enable. If you pass in a subset of the formats, all other formats are removed from the toolbar, and pasted content using the missing formats are not rendered correctly in the text editor.

This example shows how to add the `color` format to the editor, which adds a text color button.

```html
<template>
    <lightning-input-rich-text value={myVal} formats={formats}>
    </lightning-input-rich-text>
</template>
```

To enable the `color` format, add it to the list of formats.

```javascript
import { LightningElement } from 'lwc';

export default class ColorFormatExample extends LightningElement {
    myVal = '**Hello**';
    formats = [
        'font',
        'size',
        'bold',
        'italic',
        'underline',
        'strike',
        'list',
        'indent',
        'align',
        'link',
        'image',
        'clean',
        'table',
        'header',
        'color',
    ];
}
```

This example shows how to remove `strike` from the editor, which removes the strikethrough button from the toolbar.

```html
<template>
    <lightning-input-rich-text value={myVal} formats={formats}>
    </lightning-input-rich-text>
</template>
```

Remove the `strike` format from the list of formats to enable.

```javascript
import { LightningElement } from 'lwc';

export default class StrikeFormatExample extends LightningElement {
    myVal = '**Hello**';
    formats = [
        'font',
        'size',
        'bold',
        'italic',
        'underline',
        'list',
        'indent',
        'align',
        'link',
        'image',
        'clean',
        'table',
        'header',
    ];
}
```

#### Applying Formats Programmatically

You can set some formats programmatically by using the `setFormat()` method.

This example shows a button that applies a list of formats on content in the editor.

```html
<template>
    <lightning-input-rich-text
        placeholder="Type something interesting"
        formats={allowedFormats}
    >
    </lightning-input-rich-text>
    <lightning-button label="Set formats" onclick={handleClick}>
    </lightning-button>
</template>
```

Pass in the formats to `setFormat()`.

This example passes formats to create right-aligned, Garamond font text
that is bold, italic, and colored red, on a black background. The `allowedFormats`
must also be set because `background` and `color` are not default formats.

```javascript
import { LightningElement } from 'lwc';

export default class FormatsExample extends LightningElement {
    allowedFormats = [
        'font',
        'size',
        'bold',
        'italic',
        'underline',
        'strike',
        'list',
        'indent',
        'align',
        'link',
        'image',
        'clean',
        'table',
        'header',
        'color',
        'background',
    ];

    appliedFormats = {
        align: 'right',
        font: 'garamond',
        size: 10,
        bold: true,
        italic: true,
        color: 'mediumvioletred',
        background: '#000000',
    };

    handleClick() {
        const editor = this.template.querySelector('lightning-input-rich-text');
        editor.setFormat(this.appliedFormats);
    }
}
```

To retrieve the formats, use `getFormat()`. The rich text editor removes any font values that are not supported.

Supported formats are as follows.

| Key        | Values                                                         | Description                                                                                                                                                                                   |
| ---------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| align      | left, right, center                                            | Aligns the text to the left, right, or centers the text block where the cursor is located.                                                                                                    |
| background | color name, hex value                                          | Applies the specified color to the background of the selected text. If no text is selected, applies to the text you enter next. Specify color by HTML color name or hexadecimal value.        |
| bold       | true, false                                                    | Applies bold format to selected text. If no text is selected, applies to the text you enter next.                                                                                             |
| code       | true, false                                                    | Applies code format inline to selected text. If no text is selected, applies to the text you enter next.                                                                                      |
| code-block | true, false                                                    | Applies code format to the line where the cursor is located. This is a block-level format, so it applies to block-level elements such as `<p>`.                                               |
| color      | color name, hex value                                          | Applies the specified color to the selected text. If no text is selected, applies to the text you enter next. Specify color by HTML color name or hexadecimal value.                          |
| font       | default, sans-serif, courier, verdana, tahoma, garamond, serif | Applies the specified font to the selected text. If no text is selected, applies to the text you enter next. The default sans-serif font is Arial. The default serif font is Times New Roman. |
| header     | 1, 2, 3, 4, 5, 6                                               | Applies the specified header level to the line where the cursor is located.                                                                                                                   |
| italic     | true, false                                                    | Applies italic format to selected text. If no text is selected, applies to the text you enter next.                                                                                           |
| link       | url                                                            | Creates a link to the specified URL using the selected text as the link text. Requires text to be selected before applying the format.                                                        |
| size       | 8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72   | Applies the specified font size to the selected text. If no text is selected, applies to the text you enter next. The default font size is 12                                                 |
| strike     | true, false                                                    | Applies strikethrough format to selected text. If no text is selected, applies to the text you enter next.                                                                                    |
| underline  | true, false                                                    | Applies underline format to selected text. If no text is selected, applies to the text you enter next.                                                                                        |

#### Inserting Text Programmatically (Beta)

You can insert text programmatically in the editor with the `setRangeText()` method, replacing content
or inserting new content. The method can be used in an action for custom buttons.

The `setRangeText()` method follows the API of the standard `HTMLInputElement.setRangeText()` method described on
[MDN](https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/setRangeText).

The `lightning-input-rich-text` component has one exception to the `setRangeText()` standard behavior which
is described in **Inserting Formatted Text Programmatically (Beta)**.

`setRangeText()` supports these parameters.

| Parameter   | Type   | Description                                                   |
| ----------- | ------ | ------------------------------------------------------------- |
| replacement | string | The string to insert. HTML markup is not supported.           |
| start       | number | The 0-based index of the first character to replace.          |
| end         | number | The 0-based index that follows the last character to replace. |
| selectMode  | string | Defines how the selection is set after the text is inserted.  |

Valid values for selectMode are:

-   `select` - Selects the inserted text.
-   `start` - Moves the selection to just before the inserted text.
-   `end` - Moves the selection to just after the inserted text.
-   `preserve` - Attempts to preserve the selection in effect before the insertion. This is the default.

To insert replacement text at the current cursor location, specify only the
replacement string and no other parameters. After the insertion, the cursor
remains at the original location. If text is selected when the insertion occurs,
the text is replaced.

This example uses `setRangeText()` to insert some text at the beginning of the line
without replacing any content.

```html
<template>
    <lightning-input-rich-text placeholder="Type something interesting">
    </lightning-input-rich-text>
    <lightning-button label="Insert Text" onclick={handleClick}>
    </lightning-button>
</template>
```

The selectMode value causes the cursor to remain at the end of the inserted content.

```javascript
import { LightningElement } from 'lwc';

export default class SetRangeTextExample extends LightningElement {
    start = 0;
    end = 0;
    selectMode = 'end';

    handleClick() {
        const editor = this.template.querySelector('lightning-input-rich-text');
        editor.setRangeText(
            'Some new text',
            this.start,
            this.end,
            this.selectMode
        );
    }
}
```

This example inserts a space at index 10 and removes characters at index 10 through 14.
The resulting content is `0123456789 567890`.

```html
<template>
    <lightning-input-rich-text value="012345678901234567890">
    </lightning-input-rich-text>
    <lightning-button label="Clip Text" onclick={handleClick}>
    </lightning-button>
</template>
```

You can omit the final parameter of `setRangeText()` to use the default select mode, `preserve`.

```javascript
import { LightningElement } from 'lwc';

export default class SetRangeTextPreserveExample extends LightningElement {
    handleClick() {
        const editor = this.template.querySelector('lightning-input-rich-text');
        editor.setRangeText(' ', 10, 15);
    }
}
```

These examples describe the insertion behavior with various `setRangeText()` parameter values.

```javascript
// Insert text at cursor position if nothing is selected. Replace any selected text.
// No selectMode is specified, so the original selection is preserved.
// The inserted text is selected if it replaced selected text.
editor.setRangeText('Some new text');

// Insert text to replace characters beginning at index 10 (the 11th
// character) and ending at index 15 (the 16th character). The character
// at index 14 is the last character replaced.
// No selectMode is specified, so the original selection is preserved.
editor.setRangeText('Some new text', 10, 15);

// Insert text as described in the previous example, and then select
// the new text.
editor.setRangeText('Some new text', 10, 15, 'select');

// Insert text as described, and place cursor ahead of the new text.
editor.setRangeText('Some new text', 10, 15, 'start');

// Insert text as described, and place cursor after the new text.
editor.setRangeText('Some new text', 10, 15, 'end');

// Insert text as described, and return to the previous selection state.
editor.setRangeText('Some new text', 10, 15, 'preserve');
```

If text is selected when selectMode is `preserve` and start and end values are specified,
the text insertion has no effect on the selected text. The text remains selected and is not replaced.

However, if the start and end values lie within the currently selected range, part of the selected text is replaced.
For example, suppose you have selected text at index 1 through 5, 0**12345**6789. If you call
`setRangeText('Insert', 2, 7)` the result is 0**1Insert**789.

#### Inserting Formatted Text Programmatically (Beta)

The standard `setRangeText()` method uses `preserve` selectMode behavior
if you don't specify start or end index parameters, as in this example.

`editor.setRangeText('Some new text');`

If no text is selected when the method is called, the replacement text is inserted
at the cursor position. After the insertion, no text is selected, which preserves
the select mode. If text is selected when the method is called, that text is
replaced and the inserted text is then selected.

With the standard `setRangeText()` method, you can only specify a different selectMode behavior
if you specify the index parameters too. You can't pass null or undefined
values to the parameters.

In contrast, the `lightning-input-rich-text` component's `setRangeText()` method accepts
`undefined` as a value for the start and end index parameters. You can then set the
selectMode to any valid value.

This non-standard behavior enables you to set the selectMode `select` with the
`setRangeText()` method to insert text, select the inserted text,
and then run `setFormat()` on the selected text. The text is inserted at the cursor
position if nothing is selected. If text is selected, it is replaced with the new text.

This example sets the formats supported in the text editor, and the initial content to
display in the editor panel. The separate button inserts new formatted text.

```html
<template>
    <lightning-input-rich-text
        formats="font, bold, italic, underline, strike, list, indent, align,
        link, image, clean, code, code-block, color, background, mention, header"
        value="01234567890"
    >
    </lightning-input-rich-text>

    <lightning-button label="Insert bold green text" onclick={handleClick}>
    </lightning-button>
</template>
```

The `handleClick()` function uses `setRangeText()` to insert text at the cursor position.
Specifying `undefined` for start and end index parameters enables the selectMode value to
be passed. The selectMode value is `select` so the inserted text is then selected. The
`setFormat()` method applies formats to the selected text to make it bold and colored green.

```javascript
import { LightningElement } from 'lwc';

export default class InsertFormattedExample extends LightningElement {
    handleClick() {
        const editor = this.template.querySelector('lightning-input-rich-text');
        const textToInsert = 'Go Green';
        editor.setRangeText(textToInsert, undefined, undefined, 'select');
        editor.setFormat({ bold: true, color: 'green' });
    }
}
```

#### Adding Custom Buttons

You can add custom buttons to the rich text editor. Custom buttons are contained
in a button group that displays at the end of the toolbar.

To create a button group, add the `lightning-rich-text-toolbar-button-group` component
in a named slot called `toolbar` inside `lightning-input-rich-text`.

Place a `lightning-rich-text-toolbar-button` component for each custom button
inside `lightning-rich-text-toolbar-button-group`.

For more information about custom buttons,
see [`lightning-rich-text-toolbar-button`](bundle/lightning-rich-text-toolbar-button) documentation.

#### Inserting Images

Clicking the image button opens a file picker you can use to locate and select an image on your device.
The image is uploaded to the org and inserted inline in the text editor.

Supported image types are png, jpg, jpeg, and gif. The maximum image
size is 1MB.

Resizing of images is not supported. Copy and pasting of images is not supported,
although it might work on some combinations of browsers and operating systems.
By default, guest users can't upload images to Experience Builder sites.

By default, the image is visible only in the text editor as you insert it,
and when you display the editor output, for example by using the `lightning-formatted-rich-text`
component. However, the image can be accessed by any org user who has access to the image URL.

When you use `lightning-input-rich-text` in Salesforce, pasting an image from an HTTP source results in the display of a broken image icon. Mixed content is blocked in Salesforce to improve security. We recommend uploading the image as a static resource first before using it in the component. Alternatively, enable the image toolbar button so your users can upload the image to the org.

**Important: For images that shouldn't be accessible to all org users, you must restrict access to the images.**

#### Restricting Access to Uploaded Images

_Uploaded image files are accessible to all org users by default._

Restrict access to the image by using the `share-with-entity-id` attribute
to specify the ID of a record, org, group, or user that should have access to the image.
The image that's inserted into the text editor is shared with the entity that corresponds to that ID.

If the ID corresponds to:

-   the org: all users in the org have access to the image.
-   a group: only users in that group can see the image.
-   a record: anyone with access to that record can see the image.
-   a user: only that user can see the image.

Note that when you use the `share-with-entity-id` attribute, the image is more
restricted, but it's also viewable in the Files tab. When you share an image
with a record ID, the image is available in the Notes
and Attachments related list of the record page. Only users with
permissions to the record can see the image in any of these locations.

This example shows the text editor used in a record page, where the image
is shared with the record ID of the record that's displayed.

```html
<template>
    <lightning-input-rich-text
        label="Make a note"
        share-with-entity-id={recordId}
    >
    </lightning-input-rich-text>
</template>
```

Use the `@api` decorator to create a public `recordId` property.
The record page sets the property to the ID of the current record.

```javascript
import { LightningElement, api } from 'lwc';
export default class RichTextExample extends LightningElement {
    @api recordId;
}
```

For more information, see [Make a Component Aware of Its Record Context](https://developer.salesforce.com/docs/platform/lwc/guide/use-record-context) in the Lightning Web Components Developer Guide.

#### Input Validation

`lightning-input-rich-text` doesn't provide built-in validation but you can wire
up your own validation logic. Set the `valid` attribute to `false` to change
the border color of the rich text editor to red. Set the `required` and
`label-visible` attributes to display the asterisk near the label.

This example checks whether
the rich text content is empty or undefined.

```html
<template>
    <lightning-input-rich-text
        value={myVal}
        placeholder="Type something interesting"
        label-visible
        required
        message-when-bad-input={errorMessage}
        valid={validity}>
    </lightning-input-rich-text>
    <lightning-button
        name="validate"
        label="Validate"
        onclick={validate}>
    <lightning-button>
</template>
```

The `validate` method toggles the validity of the rich text editor, and
displays the error message when it's invalid.

```javascript
import { LightningElement, api } from 'lwc';
export default class ValidityExample extends LightningElement {

    @api myVal = "";
    @api errorMessage = "You haven't composed anything yet." ;
    @api validity = true;

    validate() {
        if (!this.myVal) {
            this.validity = false;
        }
        else {
            this.validity = true;
        }
    }
```

#### Supported HTML Tags

The rich text editor provides a WYSIWYG interface only. You can't edit HTML
tags using the editor, but you can set the HTML tags via the `value`
attribute. When you copy content from a web page or another source and paste
it into the editor, unsupported tags are removed. Only formatting that
corresponds to an enabled toolbar button or menu is preserved.

For example, if
you disable the `FORMAT_TEXT` category, the Bold, Italic,
Underline, and Strikethrough buttons are not available. Furthermore,
pasting bold, italic, underlined, or strikethrough text in the editor are not
supported when you disable the `FORMAT_TEXT` category. Text that was enclosed
in unsupported tags is preserved as plain text. However, tables that you copy
in a browser window can be pasted into the editor and set
via the `value` attribute, even though there are no corresponding toolbar
buttons or menus for them.

The component sanitizes HTML tags passed to the `value` attribute to prevent
XSS vulnerabilities. Only HTML tags that correspond to features available on
the toolbar are supported. If you set unsupported tags via JavaScript,
those tags are removed and the text content is preserved. The
supported HTML tags are: `a`, `col`, `colgroup`, `em`,
`h1`, `h2`, `h3`, `h4`, `h5`, `h6`, `img`, `li`, `ol`, `p`, `q`, `s`,
`strike`, `strong`, `table`, `tbody`, `td`, `tfoot`, `th`,
`thead`, `tr`, `u`, `ul`.

This component converts certain unsupported tags into supported tags with similar functions.

|Unsupported Tag|Becomes|
|--- |--- |
|`b`|`strong`|
|`div`|`p`|
|`i`|`em`|
|`span`|`p`|

Other unsupported tags and attributes are removed, and only their text content is displayed. Let's say you copy some text that's rendered bold with color formatting, and its HTML markup looks like this.

```html
The sky is <span style="color:blue;font-weight:bold">blue</span>.
<div style="color:#0000FF;font-weight:bold">
    This is some text in a div element.
</div>
```

If your rich text editor specifies support for the `bold` format but not the `color` format, the editor preserves the bold formatting by converting it to a `strong` tag. However, the color formatting in the pasted text is removed.

#### Accessibility

The value of the `label` attribute is read by screen readers and the
`label-visible` attribute determines whether the label is also visible on the
screen. If you don't specify either attribute, a default label is applied and
it's not visible. You can set `label` to a value of your choice. Use
`label-visible` to make the label visible, whether `label` has a default value
or one you have specified.

When focus first shifts to the rich text editor, initial focus is on the first item
in the toolbar, which is the font selector by default.

Use Tab and Shift+Tab to navigate between the selectors for font, size, and color.
Tab from the color selector to the formatting buttons. Focus goes to the first button,
which is the bold button by default. If you've previously selected a different button
in the current session, focus initially returns to that button instead of the first button.

Once focus is on a formatting button, use arrow keys to navigate through the buttons.
When you select a button, the cursor goes to the editor panel where you can type
your formatted text. Press Shift+Tab to return to the toolbar.

#### Component Styling

`lightning-input-rich-text` implements the
[rich text editor](https://www.lightningdesignsystem.com/components/rich-text-editor) blueprint in the Salesforce Lightning Design System (SLDS).

To apply additional styling, use the SLDS [utility classes](https://www.lightningdesignsystem.com/utilities/alignment) with the `class` attribute.

This example adds padding on top of the rich text editor using an SLDS class.

```html
<lightning-input-rich-text class="slds-p-top_small" value="HELLO!">
</lightning-input-rich-text>
```

To apply custom styling, use the `:host` selector. Use SLDS styling hooks to customize the component's styles. For example, specify the minimum height using the `--slds-c-textarea-sizing-min-height` custom property.

```css
:host {
    --slds-c-textarea-sizing-min-height: 200px;
}
```

See [Styling Hooks Overview](https://www.lightningdesignsystem.com/components/rich-text-editor/#Styling-Hooks-Overview) for a list of CSS custom properties.

#### Usage Considerations

The editor automatically indents nested bulleted lists. If you insert extra indents, they are removed on save.

The `value` attribute only supports string values. To clear the editor by setting the `value` attribute, use `""` to specify an empty string because `null` and `undefined` aren't supported.

Output from the editor can display differently outside of the Salesforce Lightning Experience. If the content is being viewed outside of Lightning contexts (such as in an e-mail), there will be visual inconsistencies.

When using `setFormat()`, navigating to a previous line removes the user's format settings for empty newlines. For example, the user can set the styling to bold and type three lines, leaving the second line empty. If the user navigates away from the second line, then navigates back, it no longer has bold styling.

Although a toolbar button for creating tables is not available,
creating tables programmatically or copying from a browser window and pasting
these elements preserves the formatting in the editor.

This component has usage differences from its Aura counterpart. See [Base Components: Aura Vs Lightning Web Components](https://developer.salesforce.com/docs/platform/lwc/guide/migrate-map-aura-lwc-components) in the Lightning Web Components Developer Guide.
