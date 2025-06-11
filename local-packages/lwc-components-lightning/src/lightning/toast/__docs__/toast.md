Use the `lightning/toast` module to display a toast notification with an icon, label, message, and links.

Toast notifications convey small pieces of information to the user, such as feedback and confirmation after the user takes an action. You can set toast notifications to disappear after a certain duration or until the user clicks the close button.

#### Show a Toast

To show a toast notification, call the function `show(config, comp)` from `lightning/toast`. The function creates a single page-level toast container if one does not exist. The `show(config, comp)` function contains two parameters:

- The `config` parameter references an object that specifies toast configuration attributes.  See the **Toast Configuration Attributes** section for a list of properties to include in the config.
- The `comp` parameter is a reference to the local component or `this`.

This example creates an informational toast that displays until the user dismisses it.
The toast title and message each include links, using two different approaches.
The component's `onClick` handler triggers the toast opening.

```javascript
import { LightningElement } from 'lwc';
import Toast from 'lightning/toast';

export default class MyComponent extends LightningElement {
    ...
    onClick() {
        ...
        Toast.show({
            label: 'This is a toast label which shows {0}, you can learn more about its accessibility from {1}',
            labelLinks : [{
                url: 'https://www.lightningdesignsystem.com/components/toast/',
                label: 'LDS link'
            }, {
                url: 'https://www.lightningdesignsystem.com/accessibility/guidelines/global-focus/#toasts',
                label: 'toast guideline'
            }],
            message: 'I want to show a {salesforceLink} and a {slackLink}',
            messageLinks: {
                salesforceLink: {
                    url: 'http://www.salesforce.com',
                    label: 'Salesforce link'
                },
                slackLink: {
                    url: 'https://slack.com',
                    label: 'Slack link'
                }
            },
            mode: 'sticky',
            variant: 'info'
        }, this);
    }
}
```

A page-level [`ToastContainer` component](/docs/component-library/bundle/lightning-toast-container/documentation) manages and displays the toast component.

The `label` string specifies the toast title and the `message` string is the toast message.
The `{0}`, `{1}`, `{salesforceLink}`, and `{slackLink}` placeholders are replaced with links that are specified in their `url` properties.

`label` can have index-based or name-based link placeholders. In the case of index-based link placeholders, `labelLinks` must be defined as an array. Otherwise, `labelLinks` must be defined as individual objects. The same rules apply to `message`.

In the example, `label` uses index-based link placeholders, and `message` uses name-based link placeholders.

#### Component Styling

`Toast` implements the [toast](https://www.lightningdesignsystem.com/components/toast/) blueprint in the Salesforce Lightning Design System (SLDS). [SLDS styling hooks](https://www.lightningdesignsystem.com/components/toast/#Styling-Hooks-Overview) aren't supported with programmatic creation of toasts via `Toast.show()`.

#### Small Screens and Mobile Environment

`Toast` is responsive to your screen resolution. For smaller screens or mobile environments, the toast's icon and description (text stored in `message`, and `messageLinks`, for example) is not shown due to the screen's width limitation. See [Toast blueprint screen variants](https://www.lightningdesignsystem.com/guidelines/messaging/components/toasts/#flavor-variants-screen).

To provide links in toasts on small screens and mobile environments, we recommend that you include links in the toast's title using `label` and `labelLinks`.

#### Toast Configuration Attributes

For more information on the toast configuration attributes, see the Specification tab.

When you use `labelLinks` or `messageLinks`, the content of `label` or `message` is rendered using [`lightning-formatted-rich-text`](/docs/component-library/bundle/lightning-formatted-rich-text/documentation). See the 
 [`lightning-formatted-rich-text` documentation](/docs/component-library/bundle/lightning-formatted-rich-text/documentation) for expected styling when rendering a link.

#### Toast Variants

The `variant` attribute sets the component's color and icon.

| Value | Color | Icon |
| --- | --- | --- |
| `info` (default) | grey | `utility:info`|
| `success` | green | `utility:success`|
| `warning` | orange | `utility:warning`|
| `error` | red | `utility:error`|

#### Toast Dismissal

The `mode` attribute sets the component's dismissal.

- `dismissible` - The component automatically disappears after a certain duration. The user can dismiss it early by clicking the close button. The time duration for `dismissible` is 4.8 seconds when the toast doesn't contain a link or 9.6 seconds if the toast contains a link.
- `sticky` - The component stays on screen until the user clicks the close button.

If you don't provide a `mode` value, the toast dismissal is determined by the value of `variant` and whether the `toast` has a link or links present in `label` or `message`.

| Variant | Has link? | Default Mode |
| --- | --- | --- |
| `info` | Yes| `sticky`|
| `info` | No | `sticky`|
| `success` | Yes | `sticky`|
| `success` | No | `dismissible`|
| `warning` | Yes | `sticky`|
| `warning` | No | `sticky`|
| `error` | Yes | `sticky`|
| `error` | No | `sticky`|
