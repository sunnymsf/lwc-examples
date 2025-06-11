# lightning-mobile-grouped-combobox

> `lightning-mobile-grouped-combobox` is internal-only. It's not yet supported for use by customers on the Salesforce platform.

-   [Overview](#overview)
-   [Display Recent Items](#display-recent-items)
-   [Implement Autocomplete Behavior](#implement-autocomplete-behavior)
-   [Highlight Strings in Options](#highlight-strings-in-options)
-   [Component Attributes](#component-attributes)
-   [Action Item Attributes](#action-item-attributes)
-   [Option Item Attributes](#option-item-attributes)
-   [Filter Item Attributes](#filter-item-attributes)
-   [Methods](#methods)
-   [Custom Events](#custom-events)
-   [Usage Considerations](#usage-considerations)

## Overview

`lightning-mobile-grouped-combobox` is a mobile-friendly combobox with autocomplete (typeahead) support suitable for search-related features like record lookups. Optionally it supports a filter. It provides you with full control over the displayed data, enabling you to handle the text input with your own custom behavior. For example, you can:

-   Display a list of options representing recent items
-   Implement autocomplete behavior
-   Highlight strings in options to match the results to user input
-   Create a default page when no results are returned
-   Handle selection of an action item or option

See the [**examples**](__examples__) directory for an example.

This component is based on [mobile lookups](https://design-system-framework.herokuapp.com/?path=/docs/components-mobile-lookups--kitchen-sink) in the Lightning Design System and the [Salesforce Touch: Lookups mockup](https://gus.lightning.force.com/lightning/r/0D5EE00001TAako0AD/view). For non-mobile devices, consider using `lightning-grouped-combobox` instead.

This example shows how to implement typeahead using `lightning-mobile-grouped-combobox`. Pass in your data to the `items` component attribute and handle user input using the `ontextinput` event handler. Handle item selection using the `onselect` event handler. See [Implement Autocomplete Behavior](#implement-autocomplete-behavior) for more information.

```html
<lightning-mobile-grouped-combobox
    aria-label="My Label"
    placeholder="Search Contacts"
    items={lookupItemList}
    filter-icon-name="standard:contact"
    filter-icon-alternative-text="Search contact records"
    input-text={currentInputValue}
    show-activity-indicator={showActivityIndicator}
    ontextinput={handleInputChange}
    onselect={handleSelected}
>
</lightning-mobile-grouped-combobox>
```

`items` lets you pass in an action item and an options group with highlighted options. We recommend passing in only one action item on this component. See [Highlight Strings in Options](#highlight-strings-in-options) for more information.

```javascript

lookupItemList = [
    // Action Item
    {
        action: true,
        type: 'option-inline'
        text: 'Show All Results',
        value: 'showAllResults',
        endIconName: 'utility:search',
        endIconAlternativeText: 'Show all results button'
    },
    { // Options Group
        label: 'Recent Items', // Group Heading/Separator
        items: [
            {
                text: 'Option 1',
                subText: 'Option 1 sub text',
                value: 'opt1',
            },
            {
                text: 'Option 2',
                subText: 'Option 2 sub text',
                value: 'opt2',
            },
            // Highlighted Options
            {
                // Renders *M*elissa Schmidt
                text: [
                    {
                        highlight: true,
                        text: 'M'
                    },
                    {
                        text: 'elissa Schmidt'
                    }
                ],
                subText: 'Project Manager',
                value: 'MS'
            },
        ]
    },
];
```

## Display Recent Items

Recent items are displayed below the input field when the page loads. To specify recent items, pass in `initialItems` to the `items` component attribute. Handle selected items using the `onselect` event handler.
See the next section for details.

```javascript
const initialItems = [
    {
        label: 'Recent Items',
        items: [
            {
                text: 'Alex Crawley',
                subText: 'Program Manager',
                value: 'AC',
            },
            // more items
        ],
    },
];
```

## Implement Autocomplete Behavior

To implement autocomplete behavior, return a list of options that match what the user is currently typing. The list can change depending on the user's input. Displaying a subset of items is useful when the list is very large. You can perform an additional query on the subset by creating an action item, for example, to show all results when the action item is clicked.

The following example shows a basic example of `lightning-mobile-grouped-combobox`. `allOptions` is a list of all available items. `initialItems` is a list of recent items, displayed by default when the page first loads by the `items` component attribute when the page first loads. As a user types in the input field, the `ontextinput` handler:

-   Creates an action item in `pushActionButtonItemIntoObject()` to display a text-only button labeled "Show All Results"
-   Matches the user input to the available items in `pushOptionsIntoObject()`
-   Displays options with highlighted strings that match user input

Use the `onselect` handler to customize what happens when a user selects the "Show All Results" action item or any of the options. For a complete example, see the [**examples**](__examples__) directory.

```javascript
const allOptions = [
    {
        text: 'Marcelo Garcia',
        subText: 'UX Engineer',
        value: 'MG',
    },
    {
        text: 'Malia Peterson',
        subText: 'Lead Software Developer',
        value: 'MP',
    },
    {
        text: 'Paulo Farias',
        subText: 'Senior Software Developer',
        value: 'PF',
    },
    {
        text: 'Alex Crawley',
        subText: 'Program Manager',
        value: 'AC',
    },
];

const initialItems = [
    {
        // Options Group
        label: 'Recent Items', // Group Heading/Separator
        items: [
            {
                text: 'Marcelo Garcia',
                subText: 'UX Engineer',
                value: 'MG',
            },
            {
                text: 'Malia Peterson',
                subText: 'Lead Software Developer',
                value: 'MP',
            },
        ],
    },
];
export default class AutocompleteExample extends LightningElement {
    inputText = '';
    currentInputValue = '';
    items = initialItems;

    handleInputChange(event) {
        this.currentInputValue = event.detail.value;

        if (this.currentInputValue) {
            let obj = [];

            this.pushActionButtonItemIntoObject(obj);
            this.pushOptionsIntoObject(
                obj,
                `Results for "${this.currentInputValue}"`
            );

            if (obj[1].items.length === 0) {
                obj = [];
            }

            this.items = obj;
        } else {
            // display a default list of options when page loads
            this.items = initialItems;
        }
    }

    pushActionButtonItemIntoObject(object) {
        object.push({
            type: 'action',
            action: true,
            text: 'Show All Results',
            value: 'showAllResults',
            endIconName: 'utility:search',
            endIconAlternativeText: 'Show all results',
        });
    }

    pushOptionsIntoObject(object, label) {
        const items = this.matchAndHighlightText();
        object.push({
            label,
            items,
        });
    }

    handleSelected(event) {
        const selectedValue = event.detail.value;

        // If action button is clicked
        if (selectedValue === 'showAllResults') {
            if (this.currentInputValue) {
                let obj = [];
                this.pushOptionsIntoObject(
                    obj,
                    `All Results for "${this.currentInputValue}"`
                );
                this.items = obj;
            } else {
                this.items = initialItems;
            }
        } else {
            // Customize option selection behavior here
        }
    }

    matchAndHighlightText() {
        let itemsCopy = JSON.parse(JSON.stringify(allOptions));
        let optionItems = [];
        itemsCopy.forEach((item) => {
            if (
                item.text
                    .toLowerCase()
                    .indexOf(this.currentInputValue.toLowerCase()) > -1
            ) {
                const text = item.text;
                const startIndex = item.text
                    .toLowerCase()
                    .indexOf(this.currentInputValue.toLowerCase());
                const endIndex = startIndex + this.currentInputValue.length;
                let textParts = [];
                textParts.push({
                    text: text.slice(0, startIndex),
                });
                textParts.push({
                    highlight: true,
                    text: text.slice(startIndex, endIndex),
                });
                textParts.push({
                    text: text.slice(endIndex),
                });
                item.text = textParts;

                optionItems.push(item);
            }
        });
        return optionItems;
    }
}
```

## Highlight Strings in Options

To highlight part of the text or subtext in the search result that matches user input, use `highlight: true` and pass the text you want to highlight to `text` and `subText`. The following `text` example renders **M**eli**ssa** **S**ch**m**idt. This matching and highlighting logic is further demonstrated by the `matchAndHighlightText()` method in the previous section.

```javascript
{
    text: [
        {
            highlight: true,
            text: 'M'
        },
        {
            text: 'eli'
        },
        {
            highlight: true,
            text: 'ssa S'
        },
        {
            text: 'ch'
        },
        {
            highlight: true,
            text: 'm'
        },
        {
            text: 'idt'
        }
    ],
    subText: [
        {
            highlight: true,
            text: 'Pr'
        },
        {
            text: 'oject Manager'
        }
    ],
    value: 'MS'
},
```

## Component Attributes

Use the following attributes to customize `lightning-mobile-grouped-combobox`.

| Attribute Name               | Type     | Description                                                                                                                                                                                                                                               |
| ---------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| aria-label                   | string   | The text label for assistive technologies. The label is not visible on screen.                                                                                                                                                                            |
| filter-icon-name             | string   | The Lightning Design System icon that appears next to the input field in the format 'standard:account' where 'standard' is the category, and 'account' is the specific icon to be displayed.                                                              |
| filter-icon-alternative-text | string   | The assistive text for the filter icon.                                                                                                                                                                                                                   |
| filter-items                 | object[] | The list of items that's displayed in the filter dropdown. If the attribute is defined, no icon defined by `filter-icon-name` and `filter-icon-alternative-text` will be present.                                                                                                                                                                                                                   |
| filter-input-text            | string   | The input text for the filter dropdown.                                                                                                                                                                                                                  |
| filter-label                 | string   | The text label for filter dropdown, The label is not visible on screen.                                                                                                                                                                                                                   |
| input-text                   | string   | The default text or existing value in the input field to be matched.                                                                                                                                                                                      |
| items                        | object[] | The list of items that's displayed in the dropdown. This list can be updated to match user input. See the [Implement Autocomplete Behavior](#implement-autocomplete-behavior) and [Highlight Strings in Options](#highlight-strings-in-options) sections. |
| placeholder                  | string   | The placeholder text on the input field. The default is an empty string.                                                                                                                                                                                  |
| show-activity-indicator      | boolean  | Displays a spinner at the bottom of the list of items. The default is false.                                                                                                                                                                              |

## Action Item Attributes

An action item lets you perform additional query on an input, for example, show all results matching the input value. The action item displays as clickable text and an icon below the input field. To create an action item, pass in the following parameters. We recommend using only one action item on this component.

| Parameter              | Type    | Description                                                                                                                                                                       |
| ---------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| action                 | boolean | Enables the action item when set to `true`.                                                                                                                                       |
| text                   | string  | The text to display on the action, for example, "Show All Results".                                                                                                               |
| value                  | string  | The value of the action item, which can be used to identify the action via `event.detail.value` on the `onselect` event handler.                                                  |
| endIconName            | string  | The Lightning Design System icon that appears next to the text in the format 'utility:search' where 'utility' is the category, and 'search' is the specific icon to be displayed. |
| endIconAlternativeText | string  | The assistive text for the action item icon, for example, "Show all results button".                                                                                              |

## Option Item Attributes

An option item represents an item in the recent item list or action result list. Pass in the following key-value pairs to the `items` component attribute.

| Key Name | Type   | Description                                                                                 |
| -------- | ------ | ------------------------------------------------------------------------------------------- |
| label    | string | The label for the option group, for example, "Recent Items"                                 |
| items    | object | The list of options in a group. Pass in key-value pairs for `text`, `subText`, and `value`. |

-   `text` - The text to display for the option.
-   `subText` - The subtitle to display below the text.
-   `value` - The value associated with the option.

## Filter Item Attributes

Pass in the following key-value pairs to `filterItems`.

| Key Name                 | Type   | Description                                                                                        |
| ------------------------ | ------ | -------------------------------------------------------------------------------------------------- |
| type                     | string | Supported types include `option-inline` and `option-card`.                                         |
| highlight                | boolean | Highlight the item when dropdown opens.                                                           |
| iconName                 | string | The icon that appears on the left of the option name.                                              |
| iconSize                 | string | Supported by `option-card` only. The size of the icon that appears on the left of the option name. |
| iconAlternativeText      | string | Assistive text for the icon that appears on the left of the option name                            |
| rightIconName            | string | The icon that appears on the right of the option name. Supported for the `option-card` type only.  |
| rightIconSize            | string | The size of the icon that appears on the right of the option name. The default is `small`.         |
| rightIconAlternativeText | string | Assistive text for the icon that appears on the right of the option name.                          |
| text                     | string | The text to display for the option.                                                                |
| subText                  | string | The subtitle to display below the text. Supported for `option-card` only.                          |
| value                    | string | The value associated with the option.


## Methods

**`blur()`**

Removes focus from the input element.

**`focus()`**

Sets focus on the input element.

## Custom Events

**`textinput`**

The event fired when a user types into the input field. `event.detail.value` returns the value in the input field.

**`select`**

The event fired when a user selects an option or action by tapping on it. `event.detail.value` returns the value of the selected item.

**`selectfilter`**

The event fired when an item is selected on the object filter, either through keyboard interaction or via mouse interaction. `event.detail.value` returns the value of the selected item.

## Usage Considerations

When customizing autocomplete behavior for `lightning-mobile-grouped-combobox`, consider the following use cases.

-   Display default options when the input is focused, or display matches only when more than X characters have been typed
-   Display a visual cue to show when the data is loaded from the server-side inside the dropdown
-   Display default items when there are no matches, such as an option to create a new record, or hide the dropdown

If you want a dropdown component without autocomplete behavior, consider using either `lightning-combobox`, `lightning-dual-listbox`, or `lightning-picklist`. `lightning-combobox` displays a simple dropdown for single selection, while `lightning-dual-listbox` displays two list boxes for multiple selection. `lightning-picklist` displays the native `select` element on mobile devices. For example, base components like `lightning-input-address` and `lightning-input-field` use `lightning-picklist` internally.
