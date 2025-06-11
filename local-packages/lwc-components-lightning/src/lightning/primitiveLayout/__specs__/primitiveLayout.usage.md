#### Setting the layout type

The layout component supports both flexbox and grid layouts. The default layout is `flexbox`. To set the layout type, use the `layout` attribute.

```html
<sds-layout layout="inline-flex">
  ...
</sds-layout>
```

#### Specifying the height

To define the height of the container, use the `height` attribute. This is useful when you need your flex or grid items to stretch the height of the container. The `screen` value should only be used when the layout component is the root element of the page.

```html
<sds-layout layout="flex" height="full">
  ...
</sds-layout>
```

<img src="flex-height.png" alt="diagram" width="400"/>

#### Flexbox Layout

##### Flexbox Direction (Axis)

For flex containers, the flow direction of items can be controlled using the axis attribute. By default, items are placed in a row. To place items in a column, use the `column` value. To reverse the flow direction, use the `row-reverse` or `column-reverse` values.

```html
<sds-layout layout="flex" axis="column">
  ...
</sds-layout>
```

<img src="flex-column.png" alt="diagram" width="400"/>

###### Shrinking & Growing in Flexbox

In a flexbox layout, it's common to need control over how items grow and shrink relative to the available space and their original size. The `flex` attribute of the `sds-layout` component provides this flexibility:

- **Initial Size** (`flex="initial"`): When set to `initial`, the flex item respects its initial size. It can shrink if necessary, but it won't grow to occupy extra space. It's useful when you want the item to reduce its size when space is limited but not expand when there's surplus space.

```html
<sds-layout flex="initial">...</sds-layout>
```

- **Ignore Initial Size** (`flex="1"`): By setting the value to `1`, the flex item can freely grow and shrink, disregarding its initial size. It's beneficial when you want the item to occupy all available space or squeeze down in a constrained space.

```html
<sds-layout flex="1">...</sds-layout>
```

- **Auto Size** (`flex="auto"`): With `auto`, the flex item has the ability to grow and shrink, but it also considers its initial size. It's a balanced choice when you want the item to adapt to its container while still respecting its original size.

```html
<sds-layout flex="auto">...</sds-layout>
```

- **Fixed Size** (`flex="none"`): Prevents the flex item from growing or shrinking, keeping it at its initial size regardless of the available space. It's suitable when you want to ensure an item remains a fixed size, irrespective of the flex container's space.

```html
<sds-layout flex="none">...</sds-layout>
```

- **Grow** (`grow="1"`): When set to `1`, the flex item can grow to occupy any available space. It's useful when you want the item to expand and fill the remaining space. Alternatively, setting the value to `0` prevents the item from growing.

```html
<sds-layout grow="1">...</sds-layout>
```

- **Shrink** (`shrink="1"`): When set to `1`, the flex item can shrink to fit the available space. It's useful when you want the item to reduce its size when space is limited. Alternatively, setting the value to `0` prevents the item from shrinking.

```html
<sds-layout shrink="1">...</sds-layout>
```

**Sample Layout**

For a visual understanding, here's an example containing multiple items with varied flex attributes:

```html
<sds-layout layout="flex">
  <sds-layout flex="none" size="100px">Fixed Item</sds-layout>
  <sds-layout flex="auto">Adaptive Item</sds-layout>
  <sds-layout flex="1" size="full">Flexible Item</sds-layout>
</sds-layout>
```

<img src="flex-sizes.png" alt="diagram" width="400"/>

In this layout, "Fixed Item" will retain its original size, "Adaptive Item" will adjust its size based on its initial dimensions and available space, while "Flexible Item" will occupy any remaining space or shrink down as needed.

###### Setting Initial Size with Flex-basis

In a flexbox layout, the flex-basis property is used to define the initial main size of a flex item before it's adjusted with flex-grow or flex-shrink. It can be considered a starting point. The `size` attribute in the `sds-layout` component is a handy way to control this:

- **Specific Ratio** (`size="1:2"`, etc.): You can specify a proportion to determine the initial size. This is helpful when you want the item to have a starting size relative to its container or sibling items.

```html
<sds-layout size="1:2">...</sds-layout>
```

- **Arbitrary size** (`size="100px"`): If you need a value that falls outside of that system you can pass it directly to the `size` attribute. A unit is required. To ensure the item remains the specified size, accompany it with `flex="none"`.

```html
<sds-layout flex="none" size="100px">...</sds-layout>
```

**Sample Layout**

To visualize the impact of different size attributes:

```html
<sds-layout layout="flex">
  <sds-layout size="1:3">...</sds-layout>
  <sds-layout size="2:3">...</sds-layout>
</sds-layout>
```

<img src="flex-ratio-sizes.png" alt="diagram" width="400"/>

##### Setting the gap between flex items

In a flexbox layout, spacing between items can be controlled using the gap property. It sets the size of the space between flex items within the container. The `gap` attribute in the `sds-layout` component offers this functionality:

<img src="sds-layout-gap.png" alt="drawing" width="400"/>

- **System gaps** (`gap="2"`, etc.): The gap sizes 1-12 correspond to the spacing size determine by the systems spacing styling hooks `--sds-g-spacing-[x]`.

```html
<sds-layout layout="flex" gap="2">
  ...
</sds-layout>
```

- **Arbitrary gaps** (`gap="30px"`): If you need a value that falls outside of that system you can pass it directly to the `gap` attribute. A unit is required.

```html
<sds-layout layout="flex" gap="30px">
  ...
</sds-layout>
```

##### Flexbox Wrap

Control if flex items should wrap onto multiple lines with the `flow` attribute. By default, wrapping is disabled (`nowrap`).

```html
<sds-layout layout="flex" flow="wrap">
  ...
</sds-layout>
```

##### Aligning Content in Flexbox

In a flexbox layout with multiple lines of items, the `align-content` property controls the spacing and alignment of those lines within the flex container. This is especially useful when the container's size along the cross axis (vertical in a row direction and horizontal in a column direction) is larger than the height of all lines combined. When flex items are rendered on a row axis, `flow="wrap"` needs to be applied to take effect. The `align-content` attribute in the `sds-layout` component lets you handle this alignment:

- **Start** (`align-content="start"`): Lines are packed at the start of the container.

```html
<sds-layout layout="flex" align-content="start">
  <sds-layout>Item 1</sds-layout>
  <sds-layout>Item 2</sds-layout>
</sds-layout>
```

- **End** (`align-content="end"`): Lines are packed at the end of the container.

```html
<sds-layout layout="flex" align-content="end">
  <sds-layout>Item 1</sds-layout>
  <sds-layout>Item 2</sds-layout>
</sds-layout>
```

- **Center** (`align-content="center"`): Lines are centered in the container.

```html
<sds-layout layout="flex" align-content="center">
  <sds-layout>Item 1</sds-layout>
  <sds-layout>Item 2</sds-layout>
</sds-layout>
```

- **Between** (`align-content="between"`): Lines are evenly distributed in the container, with the first line at the start and the last line at the end.

```html
<sds-layout layout="flex" align-content="between">
  <sds-layout>Item 1</sds-layout>
  <sds-layout>Item 2</sds-layout>
</sds-layout>
```

- **Around** (`align-content="around"`): Lines are evenly distributed with equal space around each line.

```html
<sds-layout layout="flex" align-content="around">
  <sds-layout>Item 1</sds-layout>
  <sds-layout>Item 2</sds-layout>
</sds-layout>
```

- **Evenly** (`align-content="evenly"`): Lines are evenly distributed with equal space between and around each line.

```html
<sds-layout layout="flex" align-content="evenly">
  <sds-layout>Item 1</sds-layout>
  <sds-layout>Item 2</sds-layout>
</sds-layout>
```

- **Stretch** (`align-content="stretch"`): Lines take up the remaining space in the container and stretch to fill it. This is the default behavior.

```html
<sds-layout layout="flex" align-content="stretch">
  <sds-layout>Item 1</sds-layout>
  <sds-layout>Item 2</sds-layout>
</sds-layout>
```

###### Sample Layout

```html
<div style="height: 200px;">
  <sds-layout layout="flex" flow="wrap" align-content="start">
    <sds-layout size="full">Item A</sds-layout>
    <sds-layout>Item B</sds-layout>
    <sds-layout>Item C</sds-layout>
  </sds-layout>
</div>
```

In this setup, the first item spans the full width of the container, while the remaining items wrap to the 2nd line. The content is then aligned to the center point of the parent container which has a `height` of `200px`.

##### Justifying Content in Flexbox

In a flexbox layout, the `justify-content` property controls the alignment and distribution of items along the main axis (horizontal in a row direction and vertical in a column direction). The `justify-content` attribute in the `sds-layout` component offers fine-tuned control for this alignment:

- **Start** (`justify-content="start"`): Items are aligned at the start of the container.

```html
<sds-layout layout="flex" justify-content="start">
  <sds-layout>Item 1</sds-layout>
  <sds-layout>Item 2</sds-layout>
</sds-layout>
```

- **End** (`justify-content="end"`): Items are aligned at the end of the container.

```html
<sds-layout layout="flex" justify-content="end">
  <sds-layout>Item 1</sds-layout>
  <sds-layout>Item 2</sds-layout>
</sds-layout>
```

- **Center** (`justify-content="center"`): Items are centered along the main axis.

```html
<sds-layout layout="flex" justify-content="center">
  <sds-layout>Item 1</sds-layout>
  <sds-layout>Item 2</sds-layout>
</sds-layout>
```

- **Between** (`justify-content="between"`): Items are evenly distributed with the first item aligned at the start and the last item aligned at the end.

```html
<sds-layout layout="flex" justify-content="between">
  <sds-layout>Item 1</sds-layout>
  <sds-layout>Item 2</sds-layout>
</sds-layout>
```

- **Around** (`justify-content="around"`): Items are evenly distributed with equal space around each one.

```html
<sds-layout layout="flex" justify-content="around">
  <sds-layout>Item 1</sds-layout>
  <sds-layout>Item 2</sds-layout>
</sds-layout>
```

- **Evenly** (`justify-content="evenly"`): Items are distributed with equal spacing between them as well as equal spacing on the start and end of the container.

```html
<sds-layout layout="flex" justify-content="evenly">
  <sds-layout>Item 1</sds-layout>
  <sds-layout>Item 2</sds-layout>
</sds-layout>
```

###### Sample Layout

To visualize the effect of different `justify-content` values:

```html
<sds-layout layout="flex" justify-content="center">
  <sds-layout>Item A</sds-layout>
  <sds-layout>Item B</sds-layout>
  <sds-layout>Item C</sds-layout>
</sds-layout>
```

##### Aligning Items in Flexbox

In a flexbox layout, the `align-items` property controls the alignment of items on the cross-axis (vertical in a row direction and horizontal in a column direction). The parent flex container requires a `height` for this property to take effect. The `align-items` attribute in the `sds-layout` component allows for precise control of this alignment:

- **Start** (`align-items="start"`): Items are aligned at the start of the container's cross axis.

```html
<sds-layout layout="flex" align-items="start">
  <sds-layout>Item 1</sds-layout>
  <sds-layout>Item 2</sds-layout>
</sds-layout>
```

- **End** (`align-items="end"`): Items are aligned at the end of the container's cross axis.

```html
<sds-layout layout="flex" align-items="end">
  <sds-layout>Item 1</sds-layout>
  <sds-layout>Item 2</sds-layout>
</sds-layout>
```

- **Center** (`align-items="center"`): Items are centered along the cross axis.

```html
<sds-layout layout="flex" align-items="center">
  <sds-layout>Item 1</sds-layout>
  <sds-layout>Item 2</sds-layout>
</sds-layout>
```

- **Baseline** (`align-items="baseline"`): Items are aligned based on their baseline. This is useful when items have different font sizes or heights and you want them to align based on the text rather than their container.

```html
<sds-layout layout="flex" align-items="baseline">
  <sds-layout>Item 1</sds-layout>
  <sds-layout>Item 2</sds-layout>
</sds-layout>
```

- **Stretch** (`align-items="stretch"`): Items are stretched to fill the container along the cross axis. If an item has a set height or width (depending on the main axis direction), that will be respected.

```html
<sds-layout layout="flex" align-items="stretch">
  <sds-layout>Item 1</sds-layout>
  <sds-layout>Item 2</sds-layout>
</sds-layout>
```

###### Sample Layout

To visualize the effect of different `align-items` values:

```html
<sds-layout layout="flex" align-items="end">
  <sds-layout>Item A</sds-layout>
  <sds-layout>Item B</sds-layout>
  <sds-layout>Item C</sds-layout>
</sds-layout>
```

#### Grid Layout

##### Setting Up Grid Columns

In a grid layout, managing the columns is fundamental. The `columns` attribute in the `sds-layout` component provides a straightforward approach to defining the number of columns a grid container should have:

- **1-12 Columns (`columns="x"`):** Specify the number of columns, where `x` can be any number from 1 to 12.

```html
<sds-layout layout="grid" columns="3">
  <sds-layout>Column 1</sds-layout>
  <sds-layout>Column 2</sds-layout>
  <sds-layout>Column 3</sds-layout>
</sds-layout>
```

- **Minimum Column Size (`columns="min"`):** Use this to let columns adjust based on content but not get too small.

```html
<sds-layout layout="grid" columns="min">
  ...
</sds-layout>
```

- **Maximum Column Size (`columns="max"`):** This allows columns to expand based on content but sets an upper limit.

```html
<sds-layout layout="grid" columns="max">
  ...
</sds-layout>
```

##### Custom Column Templates

To achieve more granular control over column sizes, you can use the `template-columns` attribute:

- **Custom Templates (`template-columns="value"`):** Define a custom grid template for columns, where `value` is a string specifying the size of each column.

```html
<!-- Example: Three columns where the first is 1fr, the second is 1fr, and the third is 100px -->
<sds-layout layout="grid" template-columns="1fr 1fr 100px">
  <sds-layout>Column A</sds-layout>
  <sds-layout>Column B</sds-layout>
  <sds-layout>Column C</sds-layout>
</sds-layout>
```

##### Sample Grid Layout with Columns

To visualize a grid with different column setups:

```html
<sds-layout layout="grid" columns="2">
  <sds-layout>Item 1</sds-layout>
  <sds-layout>Item 2</sds-layout>
</sds-layout>

<sds-layout layout="grid" template-columns="100px 1fr">
  <sds-layout>Column A (100px)</sds-layout>
  <sds-layout>Column B (1fr)</sds-layout>
</sds-layout>
```

The first example creates a grid with four equal-width columns, while the second uses a custom column template to define the width of two columns.

#### Setting Up Grid Rows

While the columns determine the horizontal structure of a grid, the rows dictate its vertical composition. The `rows` attribute in the `sds-layout` component gives a clear method for outlining the number of rows a grid container should encompass:

- **1-6 Rows (`rows="x"`):** Define the number of rows, where `x` can range from 1 to 6.

```html
<sds-layout layout="grid" rows="2">
  <sds-layout>Row 1</sds-layout>
  <sds-layout>Row 2</sds-layout>
  ...
</sds-layout>
```

- **Minimum Row Size (`rows="min"`):** This lets rows adjust according to content, ensuring they don't become overly compact.

```html
<sds-layout layout="grid" rows="min">
  ...
</sds-layout>
```

- **Maximum Row Size (`rows="max"`):** This configuration lets rows extend based on their content while having an upper size constraint.

```html
<sds-layout layout="grid" rows="max">
  ...
</sds-layout>
```

##### Custom Row Templates

For intricate control over row dimensions, the `template-rows` attribute is your go-to:

- **Custom Templates (`template-rows="value"`):** Frame a personalized grid template for rows, with `value` being a string detailing each row's size.

```html
<!-- Example: Two rows where the first one takes 60% and the second takes 40% of the vertical space -->
<sds-layout layout="grid" template-rows="60% 40%">
  <sds-layout>Row A (60%)</sds-layout>
  <sds-layout>Row B (40%)</sds-layout>
  ...
</sds-layout>
```

##### Sample Grid Layout with Rows

Here's a visualization of a grid with different row setups:

```html
<sds-layout layout="grid" columns="2" rows="3">
  <sds-layout>Item 1</sds-layout>
  <sds-layout>Item 2</sds-layout>
  <sds-layout>Item 3</sds-layout>
  ...
</sds-layout>

<sds-layout layout="grid" columns="2" template-rows="100px auto">
  <sds-layout>Row A (100px)</sds-layout>
  <sds-layout>Row B (auto)</sds-layout>
  ...
</sds-layout>
```

In the above example, the first segment constructs a grid with three rows of identical height. The subsequent one employs a custom row template to determine the height of two rows.

#### Configuring Column Span in Grids

The `col-span` attribute of the `sds-layout` component enables you to dictate the number of columns an item spans across in a grid container. This provides flexibility and creative control over the layout:

- **1-12 Columns Span (`col-span="x"`):** Allows an item to span over a specified number of columns, with `x` ranging from 1 to 12.

```html
<sds-layout layout="grid" columns="4">
  <sds-layout col-span="2">Spans 2 columns</sds-layout>
  <sds-layout col-span="1">Spans 1 column</sds-layout>
  <sds-layout col-span="1">Spans 1 column</sds-layout>
</sds-layout>
```

- **Full Column Span (`col-span="full"`):** Permits an item to extend across all columns, taking up the full width of the grid container.

```html
<sds-layout layout="grid" columns="5">
  <sds-layout col-span="full">Spans all columns</sds-layout>
  ...
</sds-layout>
```

##### Sample Representation of Column Span

To paint a clear picture of how `col-span` operates within a grid layout, here's a demonstration:

```html
<sds-layout layout="grid" columns="6">
  <sds-layout col-span="3">Item A (Spans 3 columns)</sds-layout>
  <sds-layout col-span="2">Item B (Spans 2 columns)</sds-layout>
  <sds-layout col-span="1">Item C (Spans 1 column)</sds-layout>
</sds-layout>

<sds-layout layout="grid" columns="4">
  <sds-layout col-span="full">Item X (Spans all columns)</sds-layout>
  <sds-layout>Item Y</sds-layout>
  <sds-layout>Item Z</sds-layout>
</sds-layout>
```

In the initial segment, `Item A` covers 3 columns, `Item B` 2 columns, and `Item C` just 1 column, within a 6-column grid. The subsequent part displays `Item X` expanding to fill the width of the grid, with the succeeding items occupying single columns each.

#### Configuring Row Span in Grids

The `row-span` attribute of the `sds-layout` component allows you to define how many rows an item occupies within a grid container. This becomes invaluable for crafting intricate and visually appealing layouts:

- **1-6 Rows Span (`row-span="x"`):** This enables an item to span over a specified number of rows, with `x` ranging from 1 to 6.

```html
<sds-layout layout="grid" rows="3">
  <sds-layout row-span="2">Spans 2 rows</sds-layout>
  <sds-layout row-span="1">Spans 1 row</sds-layout>
  ...
</sds-layout>
```

- **Full Row Span (`row-span="full"`):** Lets an item cover all rows, effectively taking up the full height of the grid container.

```html
<sds-layout layout="grid" rows="4">
  <sds-layout row-span="full">Spans all rows</sds-layout>
  ...
</sds-layout>
```

##### Visual Representation of Row Span

To aid in comprehension and visualization of how `row-span` functions within a grid, consider the following examples:

```html
<sds-layout layout="grid" rows="5">
  <sds-layout row-span="3">Item A (Spans 3 rows)</sds-layout>
  <sds-layout row-span="2">Item B (Spans 2 rows)</sds-layout>
  ...
</sds-layout>

<sds-layout layout="grid" rows="3">
  <sds-layout row-span="full">Item X (Spans all rows)</sds-layout>
  <sds-layout>Item Y</sds-layout>
  ...
</sds-layout>
```

In the first segment, `Item A` spans 3 rows, while `Item B` occupies 2 rows, within a 5-row grid. In the latter section, `Item X` spans the entire height of the 3-row grid, with subsequent items defaulting to individual rows.

