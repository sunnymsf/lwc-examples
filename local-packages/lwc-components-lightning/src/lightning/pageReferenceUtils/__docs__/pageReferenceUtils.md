The `lightning/pageReferenceUtils` module provides utilities for encoding and decoding default field values. Pass this string into the `pageReference.state.defaultFieldValues` attribute on `standard__objectPage` page reference types. This module is supported only in Lightning Experience in all editions. This module is not supported in Lightning Out, Experience Builder sites, or the Salesforce mobile app. This module requires API version 48.0 or later.

In a module's Javascript file, import `encodeDefaultFieldValues()` or `decodeDefaultFieldValues()` from `lightning/pageReferenceUtils` using this syntax.

```javascript
import { encodeDefaultFieldValues } from 'lightning/pageReferenceUtils';
```

#### Methods

**`encodeDefaultFieldValues`**

Encodes default field values from a JavaScript object into a serialized string.

| Parameter          | Type   | Description                                                                   |
| ------------------ | ------ | ----------------------------------------------------------------------------- |
| defaultFieldValues | object | List of default key-value pairs for the default field values you are passing. |

**`decodeDefaultFieldValues`**

Decodes default field values from a serialized string into a standard object. Use this method when overriding a standard action only.

| Parameter                       | Type   | Description                                                                                                         |
| ------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------- |
| encodedDefaultFieldValuesString | string | Encoded string of default field values. The values returned by this method are strings. Field type isn't preserved. |

#### Usage

The key-value pairs of an object are encoded into a serialized string that you pass into the `pageReference.state.defaultFieldValues` property.

These objects are not supported by `lightning/pageReferenceUtils`:

-   ContractLineItem
-   OpportunityLineItem
-   OrderItem
-   QuoteLineItem
-   WorkOrderLineItem

Passing the `recordTypeId` to `defaultFieldValues` is not yet supported. The `recordTypeId` influences routing behavior, layout assignment, and page assignment, so you can see unexpected results if you try to use it.

You can specify values for fields even if they’re not available in the create record form.

-   If the field is hidden because it’s not on the page layout, the value specified in `defaultFieldValues` is saved with the new record.
-   If the current user doesn’t have create access to the field, due to field-level security, attempts to save the new record result in an error.

Error messages can’t reference fields that the current user doesn’t have access to. This constraint means the user won’t know why the error occurred or how to resolve the issue. It’s essential to perform access checks in your own code before firing the event.

You can’t prepopulate system-maintained fields, such as Id or record modification time stamps. Default values for these fields are silently ignored.

Prepopulating rich text fields is unsupported.

Date and time field values must use the ISO 8601 format. For example:

-   Date: 2017-07-18
-   Datetime: 2017-07-18T03:00:00Z

While the create record page presents `datetime` values in the user’s local time, you must convert `datetime` values to UTC to prepopulate the field.

#### LWC Recipes

The [LWC Recipes GitHub repository](https://github.com/trailheadapps/lwc-recipes) contains code examples for Lightning Web Components that you can test in an org.

For a recipe that uses `lightning/pageReferenceUtils`, see the `c-nav-to-new-record-with-defaults` component.

#### See Also

-   [Navigate to a Record Create Page with Default Field Values](https://developer.salesforce.com/docs/platform/lwc/guide/use-navigate-default)
