The `lightning/platformWorkspaceApi` module provides LWC Workspace API methods to control workspace tabs and subtabs in a Lightning console app.

To work with Lightning console app events in your component, subscribe to the [Lightning message channels for the Aura application events](https://developer.salesforce.com/docs/atlas.en-us.api_console.meta/api_console/sforce_api_console_js_events.htm) that you want to listen for.

All the methods in the `lightning/platformWorkspaceApi` module return a promise. Required method parameters are explicitly passed as individual arguments. Optional parameters are passed into an object as the last argument of the method.

The following example toggles the highlight of a focused tab in the Lightning console app.

``` javascript
// c/myComponent.js
import { LightningElement, wire } from 'lwc';
import { IsConsoleNavigation, getFocusedTabInfo, setTabHighlighted } from 'lightning/platformWorkspaceApi';

export default class MyComponent extends LightningElement {

    @wire(IsConsoleNavigation) isConsoleNavigation;

    onToggleHighlightTab(event) {
        if (!this.isConsoleNavigation) {
            return;
        }
        const { highlighted } = event.detail;
        getFocusedTabInfo().then((tabInfo) => {
            const { tabId } = tabInfo;
            setTabHighlighted(tabId, highlighted, {
                pulse: true,
                state: 'success',
            });
        })
    }
}
```

`getFocusTabInfo` has no parameters. `setTabHighlighted` has two required parameters: `tabId` and `highlighted`. The optional method parameters, `pulse` and `state`, are embedded inside an object as the last argument.

#### API Methods

The following list contains the methods supported in the LWC Workspace API. For more information on these methods, see the [Console Developer Guide](https://developer.salesforce.com/docs/atlas.en-us.api_console.meta/api_console/).

`closeTab(tabId)`
* `tabId` (string): ID of the workspace tab or subtab to close.

Returns a promise that resolves to true if successful. The promise is rejected on error.

`disableTabClose(tabId, disabled)`
* `tabId` (string): ID of the workspace tab or subtab to dsiable tab close for.
* `disabled`(boolean): Specifies whether to disable tab close.

Returns a Promise that resolves to a `tabInfo` object if successful. The promise is rejected on error.

`focusTab(tabId)`
* `tabId` (string): ID of the workspace tab or subtab on which to focus.

Returns a promise that resolves to true if successful. The promise is rejected on error.

`getAllTabInfo()`

Returns a promise that resolves to an array of `tabInfo` objects if successful. The promise is rejected on error.

`getFocusedTabInfo()`

Returns a promise that resolves to a `tabInfo` object if successful. The Promise is rejected on error.

`getTabInfo(tabId)`
* `tabId` (string): ID of the tab for which to retrieve the information.

Returns a promise that resolves to a `tabInfo` object if successful. The Promise is rejected on error.

`openSubtab(parentId, { pageReference, recordId, url, focus, icon, iconAlt, label })`

* `parentTabId` (string): ID of the workspace tab within which the new subtab should open.
* `pageReference` (object): Optional. A PageReference representing the content of the new subtab.
* `recordId` (string): Optional. A record ID representing the content of the new subtab.
* `url` (string): Optional. The URL representing the content of the new subtab. URLs can be either relative or absolute.
* `focus` (boolean): Optional. Specifies whether the new subtab has focus.
* `icon` (string): Optional.  The icon of the subtab. An SLDS icon key. See a full list of icon keys on the SLDS reference site.
* `iconAlt` (string): Optional. Alternative text for the icon.
* `label` (string): Optional. The label of the subtab.

Returns a promise that resolves to the `tabId` of the subtab if successful. The Promise is rejected on error.

`openTab({ pageReference, recordId, url, focus, icon, iconAlt, label, overrideNavRules })`
* `pageReference` (object): Optional. A PageReference representing the content of the new tab.
* `recordId` (string): Optional. A record ID representing the content of the new tab.
* `url` (string): Optional. The URL representing the content of the new tab. URLs can be either relative or absolute.
* `focus` (boolean): Optional. Specifies whether the new tab has focus.
* `icon` (string): Optional. The icon of the workspace tab. An SLDS icon key. See a full list of icon keys on the SLDS reference site.
* `iconAlt` (string): Optional. Alternative text for the icon.
* `label` (string): Optional. The label of the workspace tab.
* `overrideNavRules` (boolean): Optional. Specifies whether to override nav rules when opening the new tab.

Returns a promise that resolves to the `tabId` of the workspace if successful. The Promise is rejected on error.

`refreshTab(tabId, { includeAllSubtabs })`

* `tabId` (string): ID of the workspace tab or subtab to refresh.
* `includeAllSubtabs` (boolean): Optional. If the tabId corresponds to a workspace tab, all subtabs within that workspace are refreshed. The default is true. Keep in mind that the first subtab has the same tabId as the workspace tab.

Returns a promise that resolves to true if successful. The promise is rejected on error.

`setTabIcon(tabId, icon, { iconAlt })`

* `tabId` (string): The ID of the tab for which to set the icon.
* `icon` (string): An SLDS icon key. See a full list of icon keys on the SLDS reference site.
* `iconAlt` (string): Optional. Alternative text for the icon.

Returns a promise that resolves to a `tabInfo` object of the modified tab. The Promise is rejected on error.

`setTabLabel(tabId, label)`

* `tabId` (string): The ID of the tab for which to set the label.
* `label` (string): The label of the workspace tab or subtab.

Returns a promise that resolves to a `tabInfo` object of the modified tab if successful. The promise is rejected on error.

`setTabHighlighted(tabId, highlighted, { pulse, state })`

* `tabId` (string): The ID of the tab for which to highlight.
* `highlighted` (boolean): Specifies whether the new tab should be highlighted.
* `pulse` (boolean): Optional. If true, causes two colors to alternate in a smooth animation.
* `state` (string): Optional. Changes the tab color. Available types are success (green), warning (yellow), and error (red).

Returns a promise that resolves to a `tabInfo` object of the modified tab if successful. The promise is rejected on error.

### Context Wires

The API provides the two context wire adapters, `EnclosingTabId` and `IsConsoleNavigation`, to determine if the caller compoenent is within a tab and if console navigation is present.

#### Usage

`@wire(EnclosingTabId)`

Returns the enclosing tab ID if the caller component is within a tab, or `null` otherwise.

The following example determines if the current enclosing tab is a subtab.

```javascript
// c/myComponent.js
import { LightningElement, wire } from 'lwc';
import { EnclosingTabId, getTabInfo } from 'lightning/platformWorkspaceApi';

export default class MyComponent extends LightningElement {

    @wire(EnclosingTabId) tabId;

    isSubTab;

    connectedCallback(event) {
        if (this.tabId) {
            getTabInfo(this.tabId).then((tabInfo) => {
                this.isSubtab = tabInfo.isSubTab;
            });
        }
    }
}
```

`@wire(IsConsoleNavigation)`

Returns `true` if console navigation is present, `false` otherwise.

The following example gets the focused tab info.

```javascript
// c/myComponent.js
import { LightningElement, wire } from 'lwc';
import { IsConsoleNavigation, getFocusedTabInfo } from 'lightning/platformWorkspaceApi';

export default class MyComponent extends LightningElement {

    @wire(IsConsoleNavigation) isConsoleNavigation;

    focusedTabInfo;

    connectedCallback(event) {
        if (this.isConsoleNavigation) {
            getFocusedTabInfo().then((tabInfo) => {
                this.focusedTabInfo = tabInfo;
            });
        }
    }
}
```
