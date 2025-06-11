The `lightning/uiRecordApi` module includes wire adapters to record data and get default values to create records. It also includes JavaScript APIs to create, delete, update, and refresh records.

The wire adapters are:

-   getRecord
-   getRecordCreateDefaults
-   getRecordUi (Deprecated)

The JavaScript methods are:

-   createRecord(recordInput)
-   createRecordInputFilteredByEditedFields(recordInput, originalRecord)
-   deleteRecord(recordId)
-   generateRecordInputForCreate(record, objectInfo)
-   generateRecordInputForUpdate(record, objectInfo)
-   getFieldValue(record, field)
-   getFieldDisplayValue(record, field)

For this module's specification and examples, see the [Lightning Web Components Developer Guide](https://developer.salesforce.com/docs/platform/lwc/guide/reference-lightning-ui-api-record).

#### LWC Recipes

The [LWC Recipes GitHub repository](https://github.com/trailheadapps/lwc-recipes) contains code examples for Lightning Web Components that you can test in an org.

For a recipe that uses `lightning/uiRecordApi`, see the following components in the LWC Recipes repo.

-   `c-wire-get-record-dynamic-contact`
-   `c-wire-get-record-static-contact`
-   `c-wire-get-record-user`
