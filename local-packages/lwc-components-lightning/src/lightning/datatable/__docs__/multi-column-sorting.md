# Multi-Column Sorting in Lightning Datatable

This document details the multi-column sorting feature, which is available for INTERNAL USE ONLY as of release 250.

## Overview

Multi-column sorting allows users to sort data in a datatable based on multiple columns simultaneously. This feature enhances data analysis and improves user experience by providing more granular control over data organization. Users can sort data in either ascending or descending order for each column.

## Implementation

Multi-column sorting uses the same pattern as single-column sorting with some additional necessary attributes. Detailed instructions and examples for single-column sorting can be found in the [developer documents](https://developer.salesforce.com/docs/component-library/bundle/lightning-datatable/example).

Changes to specific attributes of `lightning-datatable` enable developers to use multi-column sorting. These changes include:

-   `sorted-by`: Accepts either a single column's `fieldName` or an array of `fieldNames`.
-   `sorted-direction`: Accepts either a single value of 'asc' or 'desc' or an array of such values.

The nth value in the `sorted-direction` array represents the sorting direction of the nth column listed in the `sorted-by` array. For example, a `sorted-direction` array may look like `['asc', 'desc', 'asc']` and its `sorted-by` array may be `['age', 'weight', 'height']`. In this case, `age` is sorted ascending, `weight` is sorted descending, and `height` is sorted ascending.

Since these attributes now accept array values, an appropriate `onsort` event handler should be created for the `lightning-datatable` to accommodate this. The important part here is to ensure `this.sortDirection` and `this.sortedBy` are set to valid array values. Here is an example:

```js
onHandleSort(event) {
    const {
        sortDirections,
        fieldNames,
        isMultiColumnSort,
    } = event.detail;

    if (isMultiColumnSort) {
        const cloneData = [...this.data];

        // Iterate over each field and sort direction
        fieldNames.forEach((field, index) => {
            cloneData.sort(
                this.sortBy(field, sortDirections[index] === 'asc' ? 1 : -1)
            );
        });

        this.data = cloneData;
        this.sortDirection = sortDirections;
        this.sortedBy = fieldNames;
    } else {
        // Handle case where isMultiColumnSort is false
        // (You can choose to throw an error or leave this block empty)
        console.warn('Single column sorting is not supported.');
    }
}
```

Multi-column sorting can be accessed either directly within the datatable or configured to launch from a button outside of the datatable.

To access multi-column sort from within the datatable itself, add the following attributes to lightning-datatable:

-   `render-mode`: Multi-column sorting is available for `role-based` and `role-based-inline` modes.
-   `show-actions-menu`: Displays a button menu in the top-right corner of the datatable, where multi-column sorting rules can be configured through a modal.

The `lightning-datatable` markup for multi-column sorting should look like this:

```html
<lightning-datatable
    key-field="id"
    columns="{columns}"
    data="{data}"
    default-sort-direction="{defaultSortDirection}"
    sorted-direction="{sortDirection}"
    sorted-by="{sortedBy}"
    onsort="{onHandleSort}"
    render-mode="role-based"
    show-actions-menu
>
</lightning-datatable>
```

The `show-actions-menu` attribute enables users to access a multi-column sorting modal for configuring sorting rules in a datatable's header. This sorting modal is implemented as a stand-alone component: `lightning-multi-column-sorting-modal`. Consequently, it can be triggered by a button outside of the associated `lightning-datatable`.

To integrate the sorting modal with a button, follow these steps:

1. Import the `lightning/multiColumnSortingModal` component into the file.
2. Use the `onclick` handler of the button to open the sorting modal. Ensure to pass the `dtInstance` argument to reference your datatable instance:
    ```js
    MultiColumnSortingModal.open({
        size: 'small',
        dtInstance: this.template.querySelector('lightning-datatable'),
    });
    ```
