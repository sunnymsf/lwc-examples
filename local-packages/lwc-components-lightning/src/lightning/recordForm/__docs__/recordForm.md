Use the `lightning-record-form` component to quickly create forms to add,
view, or update a record.

Using this component to create record forms is
easier than building forms manually with `lightning-record-edit-form` or
`lightning-record-view-form`. The `lightning-record-form` component provides these helpful features:

-   Switches between view and edit modes automatically when the user begins editing a field in a view form
-   Provides Cancel and Save buttons automatically in edit forms
-   Uses the object's default record layout with support for multiple columns
-   Loads all fields in the object's compact or full layout, or only the fields you specify

However, `lightning-record-form` is less customizable. To customize the form layout or provide custom rendering of record data, use `lightning-record-edit-form` (add or update a record) and `lightning-record-view-form` (view a record).

The `object-api-name` attribute is always required, and the `record-id` is
required only when you’re editing or viewing a record.

`lightning-record-form` implements Lightning Data Service and doesn't require additional Apex controllers to create or edit record data. It also takes care of field-level security and sharing for you, so users see only the data that they have access to. To access raw record data or create a form that needs more customization than the `lightning-record-*-form` components allow, use Lightning Data Service wire adapters and functions, such as those from the `lightning/ui*Api` module.

#### Object API Name and Record ID

Each Salesforce record is associated with a Salesforce object. For example, a contact record is associated with the Contact object. Record IDs are created with prefixes that indicate the object. The `lightning-record-form` component requires you to specify the `object-api-name` attribute to establish the relationship between a record and an object. The object API name must be appropriate for the use of the component. For example, if you include `lightning-record-form` on a record page for an account, set `object-api-name="Account"`. The component submits changes only if the record ID is in agreement with the specified object API name. If there's a mismatch, users see an error indicating the API name is invalid.

#### Specifying Object API and Field Names

We strongly recommend importing references to objects and fields using the `@salesforce/schema` syntax especially when you plan to distribute your component as a managed package.

For example, create a form that enables users to edit the name field on a contact record page.

```html
<lightning-record-form
    object-api-name={objectApiName}
    record-id={recordId}
    fields={fields}
>
</lightning-record-form>
```

Import a reference to the name field on the contact object. In this example, the form uses the object API name and record ID of the record page it's placed in.

```js
import { LightningElement, api } from 'lwc';
import NAME_FIELD from '@salesforce/schema/Contact.Name';

export default class RecordFormExample extends LightningElement {
    // Expose a field to make it available in the template
    fields = [NAME_FIELD];

    // Flexipage provides recordId and objectApiName
    @api recordId;
    @api objectApiName;
}
```

To use your component in a managed package with your custom object, import the object using your namespace, for example, `@salesforce/schema/namespace__object`.

```js
import MY_CUSTOM_OBJECT from '@salesforce/schema/namespace__Custom_object__c';
```

By importing the references, Salesforce verifies that the objects and fields exist, prevents objects and fields from being deleted, and cascades any renamed objects and fields into your component's source code. For more information, see [Import References to Salesforce Objects and Fields](https://developer.salesforce.com/docs/platform/lwc/guide/data-wire-service-about).

For simplicity, the object API name and fields in some examples below are hardcoded in the templates. Note that passing in the object and fields using strings doesn’t provide compile-time validation. Use the `@salesforce/schema` imports to ensure the validity of your objects and fields.

#### Supported Objects

This component doesn't support all Salesforce standard objects. This limitation also applies to a record that references a field that belongs to an unsupported object.

This component supports the Task object but `Task.IsRecurrence` and `Task.IsReminderSet` fields don't render even when requested.

This component supports the Event object but `Event.IsRecurrence`, `Event.IsRecurrence2`, and `Event.IsReminderSet` fields don't render even when requested.

External objects are not supported. The `InformalName` field isn't supported for editing.

For a list of supported objects, see the
[User Interface API Developer Guide](https://developer.salesforce.com/docs/atlas.en-us.uiapi.meta/uiapi/ui_api_get_started_supported_objects.htm).

If you are working with an unsupported object or if have to use SOQL to query certain records, create your own UI and use Apex to work with Salesforce data. For more information, see [Data Guidelines](https://developer.salesforce.com/docs/platform/lwc/guide/data-guidelines) in the Lightning Web Components Developer Guide.

#### Modes

The component accepts a `mode` value that determines the user interaction
allowed for the form. The value for `mode` can be one of the following:

-   `edit` - Creates an editable form to add a record or update an existing one. When updating an existing record, specify the `record-id`. Edit mode is the default when `record-id` is not provided, and displays a form to create new records.
-   `view` - Creates a form to display a record that the user can also edit. The record fields each have an edit button. View mode is the default when `record-id` is provided.
-   `readonly` - Creates a form to display a record without enabling edits. The form doesn't display any buttons.

#### Specifying Record Fields

For all modes, the component expects the `fields` attribute or the `layout-type` attribute.

Use the `fields` attribute to pass record fields as an array of strings.
The fields display in the order you list them.

Use the `layout-type` attribute to specify a `Full` or `Compact` layout.
Layouts are typically defined (created and modified) by administrators. Specifying record data using `layout-type` loads the fields in the layout definition. All fields that have been assigned to the layout are loaded into the form. This behavior is the same as the [getRecordUi wire adapter](https://developer.salesforce.com/docs/platform/lwc/guide/reference-wire-adapters-record-ui) (deprecated). Retrieving a layout using an alternative wire adapter isn't currently supported.

To see the fields in the layout types in your org:

-   `Full` - The full layout corresponds to the fields on the record detail page. From the management settings for the object that you want to edit, go to Page Layouts.
-   `Compact` - The compact layout corresponds to the fields on the highlights panel at the top of the record. From the management settings for the object that you want to edit, go to Compact Layouts.

For more information, see [Page Layouts](https://help.salesforce.com/articleView?id=customize_layout.htm).

`lightning-record-form` renders a field as required only if the field is marked as required on the object. If a field is marked as required only on a page layout, the form doesn't render the field with the styling or validation for a required field.

To specify the field order, use `fields` without the `layout-type` attribute. We don't recommend using the `fields` attribute with the `layout-type` attribute as the display order of the fields can vary. Alternatively,
use the `lightning-record-edit-form` or `lightning-record-view-form` component to display a custom layout.

Fields that have a spanning relationship aren't supported by `lightning-record-form`. The fields specified must be associated with the same `object-api-name`. A field such as Contact.Account.Ownership is a cross-object reference between the Contact object and the Account object, and can't be displayed in the form.

#### Viewing a Record with Option to Edit Fields

To create a form that lets you view a record and optionally edit field values, use `mode="view"`.
Use `record-id` and `object-api-name` to pass the ID of the record and the corresponding object API name to be displayed.
Specify the fields using the `fields` attribute, or
`layout-type` attribute to display all the fields defined on the `Full` or `Compact` layout.

The view mode loads the form using output fields with inline editing enabled.
You can edit fields that are marked updateable in the User Interface API. If the user clicks an edit icon next to a field,
all fields that are updateable become editable, and the form displays Cancel and
Save buttons.

This example creates a form for an account record in view mode with fields from the full layout.

```html
<lightning-record-form
    record-id="001XXXXXXXXXXXXXXX"
    object-api-name="Account"
    layout-type="Full"
    mode="view"
>
</lightning-record-form>
```

#### Viewing a Record with Read-Only Fields

To create a form that lets you view a record but not edit its field values, use `mode="readonly"`.
Use `record-id` and `object-api-name` to pass the ID of the record and the corresponding object API name to be displayed.
Specify the fields using the `fields`
attribute, or `layout-type` attribute to display all the fields defined on the
`Full` or `Compact` layout.

The readonly mode loads the form with output fields only, and without Cancel
or Save buttons.

This example creates a form for an account record in readonly mode with a single column and fields from the compact layout.

```html
<lightning-record-form
    record-id="001XXXXXXXXXXXXXXX"
    object-api-name="Account"
    layout-type="Compact"
    columns="1"
    mode="readonly"
>
</lightning-record-form>
```

#### Editing a Record

To create a form that lets you edit a record, specify the `mode="edit"` attribute. Use `record-id` and `object-api-name` to pass the ID of the record and the corresponding object API name to be edited. Specify the fields using the `fields` attribute, or
`layout-type` attribute to load all the fields defined on the `Full` or `Compact` layout.

When `record-id` is passed, edit mode loads the form with input fields
displaying the specified record's field values. The form also displays Cancel
and Save buttons.

This example creates an editable two-column form for an account record using the compact layout. Place the form on an account record page to inherit its `record-id` and `object-api-name` properties. The `onsubmit` attribute specifies an action to override the handler for the submit.

```html
<lightning-record-form
    record-id={recordId}
    object-api-name={objectApiName}
    fields={fields}
    columns="2"
    mode="edit"
    onsubmit={handleSubmit}
>
</lightning-record-form>
```

Define an array of field names in your JavaScript using the `fields` property.

```javascript
import { LightningElement, api } from 'lwc';

import NAME_FIELD from '@salesforce/schema/Account.Name';
import REVENUE_FIELD from '@salesforce/schema/Account.AnnualRevenue';
import INDUSTRY_FIELD from '@salesforce/schema/Account.Industry';

export default class RecordFormEditExample extends LightningElement {
    // The record page provides recordId and objectApiName
    @api recordId;
    @api objectApiName;

    fields = [NAME_FIELD, REVENUE_FIELD, INDUSTRY_FIELD];

    handleSubmit(event) {
        event.preventDefault(); // stop the form from submitting
        const fields = event.detail.fields;
        fields.LastName = 'My Custom Last Name'; // modify a field
        this.template.querySelector('lightning-record-form').submit(fields);
    }
}
```

#### Creating a Record

To create a form that lets you create a record, do not specify a `record-id`.
The form loads in edit mode by default when you don't specify a record ID.
Use `object-api-name` to pass the object API name for the record to be created. Specify the fields you want using the
`fields` attribute, or use `layout-type="Full"` to load all fields in the full layout.

The compact layout cannot be used for creating records. If you specify `layout-type="Compact"`,
the full layout is shown. If you specify the `fields` attribute, be sure
to include any fields that are designated as required for the object's records.

Because no record ID is passed, edit mode loads the form with input fields that
aren't populated with field data. The form displays Cancel and Save buttons.

This example displays a form with the required name field and several others for creating account records. Place the form on an account record page to inherit its `object-api-name` property. The `onsuccess` attribute specifies an action to override the handler when an account is successfully created.

```html
<lightning-record-form
    object-api-name={objectApiName}
    fields={fields}
    onsuccess={handleSuccess}
>
</lightning-record-form>
```

When an account is successfully edited or created, a toast message is displayed using the
`ShowToastEvent` event, which is dispatched by the `handleSuccess` event handler. The `onsuccess` event returns the [record](https://developer.salesforce.com/docs/atlas.en-us.uiapi.meta/uiapi/ui_api_responses_record.htm) object, including the ID of the newly created account.

```javascript
import { LightningElement, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import NAME_FIELD from '@salesforce/schema/Account.Name';
import REVENUE_FIELD from '@salesforce/schema/Account.AnnualRevenue';
import INDUSTRY_FIELD from '@salesforce/schema/Account.Industry';

export default class RecordFormCreateExample extends LightningElement {
    // objectApiName is "Account" when this component is placed on an account record page
    @api objectApiName;

    fields = [NAME_FIELD, REVENUE_FIELD, INDUSTRY_FIELD];

    handleSuccess(event) {
        const evt = new ShowToastEvent({
            title: 'Account created',
            message: 'Record ID: ' + event.detail.id,
            variant: 'success',
        });
        this.dispatchEvent(evt);
    }
}
```

#### Prepopulating Field Values

`lightning-record-form` does not support prepopulating of field values when the form loads.
To create a form that displays custom field values, use the `lightning-record-edit-form` component.

#### Displaying Forms Based on a Record Type

If your org uses record types, picklist fields display values according to
your record types. You must provide a record type ID using the `record-type-id`
attribute if you have multiple record types on an object and you don't have a
default record type. Otherwise, the default record type ID is used.

To retrieve a list of record type IDs in your org, use the `getObjectInfo` wire adapter.
For more information, see the [getObjectInfo documentation](https://developer.salesforce.com/docs/platform/lwc/guide/reference-wire-adapters-object-info).

#### Form Display Density

In the Salesforce user interface, the Display Density setting lets users choose how densely the content is displayed. The Comfy density shows labels on top of the fields and more space between page elements. Compact density shows labels next to the fields and less space between page elements.

The record form components, `lightning-record-form`, `lightning-record-edit-form`, and `lightning-record-view-form`,
handle form density in similar ways. The `density` attribute is set to `auto` by default for all record form components.

Display density is supported for `lightning-input-field` and `lightning-output-field` within the form; display density is not supported for custom components within the form.

With `auto` density:

-   Record form components detect the Display Density setting and the width of the form's container to determine label position. The record form components don't change the space between elements, however.
-   If your Salesforce density setting is Comfy, the fields always display with their labels above them.
-   If your Salesforce density setting is Compact, the fields initially display with their labels next to them. If you resize the form container below a certain width or use the form in a narrow container, the fields display with their labels above them. This behavior is similar to how other elements behave in Lightning Experience when Compact density is enabled. The record form components use the same width settings to determine when to switch the display density.
-   If a record form component doesn't detect the Salesforce density setting, the fields display with their labels next to them. If you resize the form container to a narrow width, the fields display with their labels above them.

Detecting the user's density setting is only supported in Lightning Experience. When a record form component runs outside Lightning Experience, and density is set to `auto`, the fields display with their labels next to them, and switch to labels above the fields when in a narrow container.

##### Setting the Form Display Density

To display a record form with a particular density, set the `density` attribute to one of these values.

-   `comfy` makes the form always display labels on top of fields and doesn't detect the user setting.
-   `compact` makes the form display labels next to their fields and doesn't detect the user setting. However, the form switches to the comfy density if the form is narrowed to the width that triggers the automatic change.
-   `auto` makes the form use the default behavior described in **Form Display Density**.

Passing in a record type as a field on this component is not supported.

#### Overriding Default Behaviors

To customize the behavior of your form when it loads or when data is submitted, specify your own event handlers using the `onload` and `onsubmit` attributes.

Errors are automatically handled. If a single field has multiple validation errors,
the form shows only the first error on the field. Similarly, if a submitted form
has multiple errors, the form displays only the first error encountered. When you
correct the displayed error, the next error is displayed.

To customize the behavior of the form when
it encounters an error on submission or when data is submitted successfully,
use the `onerror` and `onsuccess` attributes to specify event handlers.

To customize the behavior when the Cancel button is clicked, use the `oncancel` attribute.

For examples of event handlers, see the documentation
for [`lightning-record-edit-form`](bundle/lightning-record-edit-form/documentation).

#### Working with Person Accounts

A person account is a record type on the account object. It combines certain fields from the account and contact object into a single record. To use person accounts in your org, you must enable the Person Accounts setting first. After Person Accounts is enabled, it can’t be disabled. For more information, see [Enable Person Accounts](https://help.salesforce.com/articleView?id=sf.account_person_enable.htm).

To access person account fields, specify the account object with `object-api-name="Account"`.

```html
<lightning-record-form
    record-id={recordId}
    object-api-name="Account"
    fields={PARTICIPANTFIELDS}
></lightning-record-form>
```

Specify the fields using the field names listed in the **IsPersonAccountFields** section for the Account object in the [Object Reference](https://developer.salesforce.com/docs/atlas.en-us.object_reference.meta/object_reference/sforce_api_objects_account.htm).

The fields that begin with `Person` are the fields from the contact object.

Import standard fields on the account object using `Account.FieldName`.

```js
import NAME from '@salesforce/schema/Account.Name';
```

For standard fields on the contact object, import `Account.Person<ContactFieldName>`. For example, import the `MobilePhone` field from a contact using `Account.PersonMobilePhone`.

```js
import MOBILEPHONE from '@salesforce/schema/Account.PersonMobilePhone';
```

For custom fields on the account object, import `Account.CustomField__c` as usual.

```js
import NICKNAME from '@salesforce/schema/Account.Nickname__c';
```

For custom fields on the contact object, pass in the object representation of the person account field using the `<ContactCustomFieldNAme>__pc` API name.

```js
PARTICIPANTFIELDS = [
    NAME,
    MOBILEPHONE,
    NICKNAME,
    { fieldApiName: 'Contact_Nickname__pc', objectApiName: 'Account' },
];
```

For more information, see [Understand the Wire Service](https://developer.salesforce.com/docs/platform/lwc/guide/data-wire-service-about).

#### Usage Considerations

Multiple currencies aren't supported in edit mode. If you enabled Activate Multiple Currencies in your org, `lightning-record-form` displays currency fields using the corporate currency, even when the default currency of a record is different. For more information, see [Manage Multiple Currencies](https://help.salesforce.com/articleView?id=sf.admin_currency.htm&type=5).

Nesting `lightning-record-form` in another instance of the component, or nesting it in `lightning-record-edit-form` or `lightning-record-view-form` is not supported.

`lightning-record-form` shares the same usage considerations as `lightning-record-edit-form` and `lightning-record-view-form`.

`lightning-record-form` loads fields using `lightning-input-field` and `lightning-output-field` internally. As a result, it supports the same field types as listed in the documentation for those components.

#### Custom Events

**`cancel`**

The event fired when the user clicks the Cancel button. If the form includes the `recordId` attribute, pressing the Cancel button returns the user to view mode with initial values provided by the record. If you don't provide the `recordId` attribute, pressing the Cancel button resets the fields to blank values.

The `cancel` event returns no parameters.

The event properties are as follows.

| Property   | Value | Description                                                                                               |
| ---------- | ----- | --------------------------------------------------------------------------------------------------------- |
| bubbles    | false | This event does not bubble.                                                                               |
| cancelable | false | This event has no default behavior that can be canceled. You can't call `preventDefault()` on this event. |
| composed   | false | This event does not propagate outside the template in which it was dispatched.                            |

Additionally, `lightning-record-form` supports the following custom events.

-   `error`
-   `load`
-   `submit`
-   `success`

For more information, see the **Custom Events** section on the [`lightning-record-edit-form`](bundle/lightning-record-edit-form/documentation) documentation.

#### LWC Recipes

The [LWC Recipes GitHub repository](https://github.com/trailheadapps/lwc-recipes) contains code examples for Lightning Web Components that you can test in an org.

For a recipe that uses `lightning-record-form`, see the following components in the LWC Recipes repo.

-   `c-record-form-dynamic-contact`
-   `c-record-form-static-contact`

#### See Also

[lightning-input-field](bundle/lightning-input-field/documentation)

[lightning-output-field](bundle/lightning-output-field/documentation)

[lightning-record-edit-form](bundle/lightning-record-edit-form/documentation)

[lightning-record-view-form](bundle/lightning-record-view-form/documentation)

[Work with Records Using Base Components](https://developer.salesforce.com/docs/platform/lwc/guide/data-get-user-input-intro)

[recordFormStaticContact](https://github.com/trailheadapps/lwc-recipes/tree/master/force-app/main/default/lwc/recordFormStaticContact) example in lwc-recipes repository

[recordFormDynamicContact](https://github.com/trailheadapps/lwc-recipes/tree/master/force-app/main/default/lwc/recordFormDynamicContact) example in lwc-recipes repository
