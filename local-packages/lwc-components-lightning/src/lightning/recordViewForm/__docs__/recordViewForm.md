Use the `lightning-record-view-form` component to create a form that displays Salesforce record data for specified fields associated with that record. The fields are rendered with their labels and current values as read-only.

You can customize the form layout or provide custom rendering of record data.
If you don't require customizations, use `lightning-record-form` instead.

To specify read-only fields, use `lightning-output-field` components inside `lightning-record-view-form`.

`lightning-record-view-form` requires
a record ID to display the fields on the record. It doesn't require additional
Apex controllers or Lightning Data Service to display record data. This
component also takes care of field-level security and sharing for you, so
users see only the data they have access to.

To access raw record data or create a form that needs more customization than the `lightning-record-*-form` components allow, use Lightning Data Service wire adapters and functions, such as those from the `lightning/ui*Api` module.

#### Object API Name and Record ID

Each Salesforce record is associated with a Salesforce object. For example, a contact record is associated with the Contact object. Record IDs are created with prefixes that indicate the object. The `lightning-record-view-form` component requires you to specify the `object-api-name` attribute to establish the relationship between a record and an object. The object API name must be appropriate for the use of the component. For example, if you include `lightning-record-view-form` on a record page for an account, set `object-api-name="Account"`. If the record ID and object API name don't agree, the form doesn't display.

#### Specifying Object API and Field Names

We strongly recommend importing references to objects and fields using the `@salesforce/schema` syntax especially when you plan to distribute your component as a managed package.

For example, create a form that enables users to view the name field on a contact record page.

```html
<lightning-record-view-form
    object-api-name={objectApiName}
    record-id={recordId}
>
    <lightning-output-field field-name={nameField}> </lightning-output-field>
</lightning-record-view-form>
```

Import a reference to the name field on the contact object. In this example, the form uses the object API name and record ID of the record page it's placed in.

```js
import { LightningElement, api } from 'lwc';

import NAME_FIELD from '@salesforce/schema/Contact.Name';

export default class RecordViewFormStaticContact extends LightningElement {
    // Expose a field to make it available in the template
    nameField = NAME_FIELD;

    // Flexipage provides recordId and objectApiName
    @api recordId;
    @api objectApiName;
}
```

To use your component in a managed package with your custom object, import the object using your namespace, for example, `@salesforce/schema/namespace__object`.

```js
import MY_CUSTOM_OBJECT from '@salesforce/schema/namespace__Custom_object__c';
```

By importing the references, Salesforce verifies that the objects and fields exist, prevents objects and fields from being deleted, and cascades any renamed objects and fields into your component's source code. For more information, see [Import References to Salesforce Objects and Fields](https://developer.salesforce.com/docs/platform/lwc/guide/data-wire-service-about#import-references-to-salesforce-objects-and-fields).

#### Supported Objects

This component doesn't support all Salesforce standard objects. This limitation also applies to a record that references a field that belongs to an unsupported object.

This component supports the Task object but `Task.IsRecurrence` and `Task.IsReminderSet` fields don't render even when requested.

This component supports the Event object but `Event.IsRecurrence`, `Event.IsRecurrence2`, and `Event.IsReminderSet` fields don't render even when requested.

External objects aren't supported.

For a list of supported objects, see the
[User Interface API Developer Guide](https://developer.salesforce.com/docs/atlas.en-us.uiapi.meta/uiapi/ui_api_get_started_supported_objects.htm).

If you are working with an unsupported object or if have to use SOQL to query certain records, create your own UI and use Apex to work with Salesforce data. For more information, see [Data Guidelines](https://developer.salesforce.com/docs/platform/lwc/guide/data-guidelines) in the Lightning Web Components Developer Guide.

#### Displaying Record Fields

To display the fields on a record, specify the fields using the
`lightning-output-field` component with the `field-name` attribute
set to the API field name.

```html
<template>
    <lightning-record-view-form
        record-id="003XXXXXXXXXXXXXXX"
        object-api-name="My_Contact__c"
    >
        <div class="slds-box">
            <lightning-output-field field-name="Name"> </lightning-output-field>
            <lightning-output-field field-name="Email__c">
            </lightning-output-field>
        </div>
    </lightning-record-view-form>
</template>
```

For more information, see the [`lightning-output-field`](bundle/lightning-output-field/documentation) documentation.

#### Using Record Edit Form and Record View Form Together

Here's an example that displays a record edit form and a record view form
for the same contact record. When you make edits and click the **Update Record**
button to submit the record edit form, the record view form updates automatically.

**Note:** The forms are separate from each other. A form can't be nested in another form.

```html
<template>
    <div class="slds-p-bottom_large slds-p-left_large" style="width:500px">
        <lightning-record-edit-form
            id="recordEditForm"
            record-id="003R00000000000000"
            object-api-name="Contact"
        >
            <lightning-messages></lightning-messages>
            <lightning-input-field field-name="FirstName">
            </lightning-input-field>
            <lightning-input-field field-name="LastName">
            </lightning-input-field>
            <lightning-input-field field-name="Birthdate">
            </lightning-input-field>
            <lightning-input-field field-name="Phone"> </lightning-input-field>
            <!--Picklist-->
            <lightning-input-field field-name="LeadSource">
            </lightning-input-field>
            <lightning-button
                type="submit"
                label="Update Record"
                class="slds-m-top_medium"
            >
            </lightning-button>
        </lightning-record-edit-form>
    </div>
    <!-- Record Display -->
    <div class="slds-p-bottom_large slds-p-left_large" style="width:500px">
        <lightning-record-view-form
            record-id="003R00000000000000"
            object-api-name="Contact"
        >
            <div class="slds-box">
                <lightning-output-field field-name="Name">
                </lightning-output-field>
                <lightning-output-field field-name="Birthdate">
                </lightning-output-field>
                <lightning-output-field field-name="Phone">
                </lightning-output-field>
                <lightning-output-field field-name="LeadSource">
                </lightning-output-field>
            </div>
        </lightning-record-view-form>
    </div>
</template>
```

#### Creating Multiple Columns

To create a multi-column layout for your record view, use the [Grid utility
classes](https://www.lightningdesignsystem.com/utilities/grid/) in Lightning Design System.
This example creates a two-column layout.

```html
<template>
    <lightning-record-view-form
        record-id="003XXXXXXXXXXXXXXX"
        object-api-name="My_Contact__c"
    >
        <div class="slds-grid">
            <div class="slds-col slds-size_1-of-2">
                <!-- Your lightning-output-field components here -->
            </div>
            <div class="slds-col slds-size_1-of-2">
                <!-- More lightning-output-field components here -->
            </div>
        </div>
    </lightning-record-view-form>
</template>
```

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

If you specify a variant for `lightning-output-field`, the variant overrides the display density for that field.

##### Setting the Form Display Density

To display a record form with a particular density, set the `density` attribute to one of these values.

-   `comfy` makes the form always display labels on top of fields and doesn't detect the user setting.
-   `compact` makes the form display labels next to their fields and doesn't detect the user setting. However, the form switches to the comfy density if the form is narrowed to the width that triggers the automatic change. To reduce the whitespace between the label and field when the form uses compact density, use the `slds-form-element_1-col` class on `lightning-input-field` or `lightning-output-field`.
-   `auto` makes the form use the default behavior described in **Form Display Density**.

#### Displaying Fields Conditionally

To display a field conditionally, use the `if:true|false` directive.
This example displays or hides the `Name` and `Industry` account fields when you select or unselect a checkbox.

```html
<template>
    <lightning-input
        type="checkbox"
        label="Show/Hide"
        checked={showFields}
        onchange={toggleFields}
    >
    </lightning-input>

    <lightning-record-view-form
        record-id={recordId}
        object-api-name={objectApiName}
        density="compact"
    >
        <template if:true={showFields}>
            <lightning-output-field field-name="Name"></lightning-output-field>
            <lightning-output-field field-name="Industry">
            </lightning-output-field>
        </template>
    </lightning-record-view-form>
</template>
```

The checkbox toggles between hiding and showing the fields using the `onchange` event handler.

```js
import { LightningElement, api } from 'lwc';

export default class RecordViewFormConditional extends LightningElement {
    @api recordId;
    @api objectApiName;
    showFields = true;

    toggleFields() {
        this.showFields = !this.showFields;
    }
}
```

#### Working with Person Accounts

A person account is a record type on the account object. It combines certain fields from the account and contact object into a single record. To use person accounts in your org, you must enable the Person Accounts setting first. After Person Accounts is enabled, it can’t be disabled. For more information, see [Enable Person Accounts](https://help.salesforce.com/articleView?id=sf.account_person_enable.htm).

To access person account fields, use the account object with `object-api-name="Account"`.

Specify the fields using the field names listed in the **IsPersonAccountFields** section for the Account object in the [Object Reference](https://developer.salesforce.com/docs/atlas.en-us.object_reference.meta/object_reference/sforce_api_objects_account.htm).

The fields that begin with `Person` are the fields from the contact object.

For standard fields on the contact object, use `Person<ContactFieldName>`. For example, use `field-name="PersonMobilePhone"` for the `MobilePhone` field on the contact object.

For custom fields on the account object, use `CustomFieldName__c` as usual.

For custom fields on the contact object, use `CustomFieldName__pc`.

This example creates a form to view a person account record.

```html
<lightning-record-view-form record-id={recordId} object-api-name="Account">
    <!-- Name field on account -->
    <lightning-output-field field-name="Name"> </lightning-output-field>

    <!-- Nickname__c field on account -->
    <lightning-output-field field-name="Nickname__c"> </lightning-output-field>

    <!-- MobilePhone field on contact -->
    <lightning-output-field field-name="PersonMobilePhone">
    </lightning-output-field>

    <!-- Contact_Nickname__c field on contact -->
    <lightning-output-field field-name="Contact_Nickname__pc">
    </lightning-output-field>
    <lightning-button
        class="slds-m-top_small"
        variant="brand"
        type="submit"
        label="Update"
    >
    </lightning-button>
</lightning-record-view-form>
```

For more information, see [Understand the Wire Service](https://developer.salesforce.com/docs/platform/lwc/guide/data-wire-service-about).

#### Usage Considerations

Nesting `lightning-record-view-form` in another instance of the component, or nesting it in `lightning-record-edit-form` or `lightning-record-form` is not supported.

Consider using the [`lightning-record-form`](bundle/lightning-record-form/documentation)
component to create record forms more easily.

This component has usage differences from its Aura counterpart. See [Base Components: Aura Vs Lightning Web Components](https://developer.salesforce.com/docs/platform/lwc/guide/migrate-map-aura-lwc-components) in the Lightning Web Components Developer Guide.

#### Custom Events

**`load`**

The event fired when the record view form loads record data.
If you load the fields dynamically, `load` is fired before the child elements of `lightning-record-view-form` finish loading. Consider the [`connectedCallback()` lifecycle](https://developer.salesforce.com/docs/platform/lwc/guide/create-lifecycle-hooks-dom) hook to perform initialization tasks. Alternatively, to load values or set properties dynamically, use a [getter and setter](https://developer.salesforce.com/docs/platform/lwc/guide/js-props-getters-setters) instead.

`load` is fired when the form gets new data from Lightning Data Service, which can be once or multiple times after the component is initialized. For example, the `load` event is fired when:

-   The `record-id` value changes
-   The `fields` list changes
-   The form includes picklist fields
-   The record type changes

If you require the `load` event to be called only once, write code to prevent it from running more than once.

Use the `event.detail` property to return the [record UI](https://developer.salesforce.com/docs/atlas.en-us.uiapi.meta/uiapi/ui_api_responses_record_ui.htm).

The event properties are as follows.

| Property   | Value | Description                                                                                               |
| ---------- | ----- | --------------------------------------------------------------------------------------------------------- |
| bubbles    | false | This event does not bubble.                                                                               |
| cancelable | false | This event has no default behavior that can be canceled. You can't call `preventDefault()` on this event. |
| composed   | false | This event does not propagate outside the template in which it was dispatched.                            |

#### LWC Recipes

The [LWC Recipes GitHub repository](https://github.com/trailheadapps/lwc-recipes) contains code examples for Lightning Web Components that you can test in an org.

For a recipe that uses `lightning-record-view-form`, see the following components in the LWC Recipes repo.

-   `c-record-view-form-dynamic-contact`
-   `c-record-view-form-static-contact`

#### See Also

[Work with Records Using Base Components](https://developer.salesforce.com/docs/platform/lwc/guide/data-get-user-input-intro)

[recordViewFormStaticContact](https://github.com/trailheadapps/lwc-recipes/tree/master/force-app/main/default/lwc/recordViewFormStaticContact) example in lwc-recipes repository

[recordViewFormDynamicContact](https://github.com/trailheadapps/lwc-recipes/tree/master/force-app/main/default/lwc/recordViewFormDynamicContact) example in lwc-recipes repository
