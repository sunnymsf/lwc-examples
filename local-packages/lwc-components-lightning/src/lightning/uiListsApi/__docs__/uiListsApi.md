The `lightning/uiListsApi` module includes wire adapters to execute actions on a list view using its API name, such as get a list view’s metadata and record data; create, update, and delete list views; and get and update a list view’s preferences. This module additionally includes adapters to get lists-specific metadata for a given entity using the entity’s API name. The wire adapters are:

-   createListInfo
-   deleteListInfo
-   getListInfoByName
-   getListInfosByName
-   getListInfosByObjectName
-   getListObjectInfo
-   getListPreferences
-   getListRecordsByName
-   updateListInfoByName
-   updateListPreferences

For this module's specification and examples, see the [Lightning Web Components Developer Guide](https://developer.salesforce.com/docs/platform/lwc/guide/reference-lightning-ui-api-lists-ui).

#### LWC Recipes

The [LWC Recipes GitHub repository](https://github.com/trailheadapps/lwc-recipes) contains code examples for Lightning Web Components that you can test in an org.

For a recipe that uses `lightning/uiListsApi`, see the `c-wire-list-info-by-name` component in the LWC Recipes repo.