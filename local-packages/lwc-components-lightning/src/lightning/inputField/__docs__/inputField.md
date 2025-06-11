Use the `lightning-input-field` component in `lightning-record-edit-form` to display and edit
the value of a record field of a Salesforce object. Use the `field-name` attribute
to specify the API field name.

For standard and custom objects, find the field names in Lightning Experience from Setup > Object Manager > (object-name) > Fields & Relationships.
Standard object fields are documented in
[Standard Objects](https://developer.salesforce.com/docs/atlas.en-us.object_reference.meta/object_reference/sforce_api_objects_list.htm).
See **Supported Objects** in [lightning-record-edit-form](bundle/lightning-record-edit-form/documentation) for usage considerations about objects.

The component displays an editable field based on the data type for the field you specify.
For example, `field-name="Birthdate"` on the Contact object references a date value, so the
component renders an input field with a date picker and the label Birthdate. On the Account object, `field-name=Type"`
references a picklist, so the component renders a dropdown menu with the label Type. The list
shows the account types defined in the org.

In orgs that support multiple languages, `lightning-input-field` automatically shows the translated labels and picklist values.

This component inherits styling from [form layout](https://www.lightningdesignsystem.com/components/form-layout/) in the
Lightning Design System.

For information about creating record edit forms, see the [lightning-record-edit-form](bundle/lightning-record-edit-form/documentation) documentation.

Here's an example of a record edit form for creating an account record
using the input fields for Name, Phone, and BillingAddress.

```html
<template>
    <div class="slds-p-bottom_large slds-p-left_large" style="width:500px">
        <lightning-record-edit-form object-api-name="Account">
            <lightning-messages></lightning-messages>
            <lightning-input-field field-name="Name"> </lightning-input-field>
            <lightning-input-field field-name="Phone"> </lightning-input-field>
            <lightning-input-field field-name="BillingAddress">
            </lightning-input-field>
            <lightning-button
                type="submit"
                name="submit"
                label="Create Account"
            >
            </lightning-button>
        </lightning-record-edit-form>
    </div>
</template>
```

#### Prepopulating Field Values

To provide a custom value on a field when the form displays, use the `value` attribute on `lightning-input-field`. If you're providing a record ID in `lightning-record-edit-form`, the value returned by the record on load does not override this custom value. You can also programmatically set the value when the form loads.

For more information, see the [`lightning-record-edit-form`](bundle/lightning-record-edit-form/documentation) documentation.

#### Requiring a Value for a Field

`lightning-input-field` supports requiredness specified on the server and client. In record forms, a required field is displayed with a red asterisk next to the field label. If you interact with a required field but don't enter a value, an error message is displayed below the field. Similarly, if you don't interact with a required field and try to submit the form, an error message is displayed.

To make an input field required on the server, mark the field Required in Setup. Input fields set as required
on the server are universally required, to be displayed with a red asterisk wherever the input fields are used. For more information,
see [Require Field Input to Ensure Data Quality](https://help.salesforce.com/articleView?id=fields_about_universally_required_fields.htm) in Salesforce help.

To make an input field required on the client only, include the `required` attribute in `lightning-input-field`. Use this attribute if you want to require a value in a field before the form can be submitted, and the field isn't marked required in Setup. If the field doesn't have a value, the component's client-side validation catches the error before the form data is submitted to the server.

The client-side `required` setting and validation for requiredness is unrelated to the Required setting on the server. Note that you can't set `required` to false to disable the required setting on the server. The required field is still displayed with a red asterisk.

#### Resetting the Form

To reset the form fields to their initial values, use the `reset()` method on each input field.
For more information, see [lightning-record-edit-form](bundle/lightning-record-edit-form/documentation).

#### Overriding the Form Display Density

`lightning-input-field` inherits the display density from the enclosing parent form. To override the display density of the parent form, use the `variant` attribute in `lightning-input-field`.

When the parent form uses the `compact` density, you can reduce the whitespace between the label and field using the `slds-form-element_1-col` class on `lightning-input-field`.

For more information, see the [lightning-record-edit-form](bundle/lightning-record-edit-form/documentation) documentation.

#### Field Types Supported

`lightning-input-field` supports fields on objects that are UI API compliant. For supported objects, see the
[User Interface API Developer Guide](https://developer.salesforce.com/docs/atlas.en-us.uiapi.meta/uiapi/ui_api_get_started_supported_objects.htm).

Fields that have a spanning relationship aren't supported by `lightning-input-field`. The fields specified must be associated with only one object. A field such as Contact.Account.Ownership is a cross-object reference between the Contact object and the Account object, and can't be displayed in the form.

The supported field data types are:

-   Address: Displays the input address fields, without Google address search capability.
-   Checkbox: Displays a checkbox input.
-   Currency: Displays an input field for entering monetary data. The user's Salesforce locale determines the currency symbol and separator characters used to format the number. Specifying a different locale is currently not supported for currency.
-   Date: Displays an input field for entering a date. The date format is automatically validated against the user's Salesforce locale. On mobile devices, date fields use native mobile date pickers.
-   Date/Time: Displays input fields for entering a date and time. The date and time formats are automatically validated against the user's Salesforce locale. On mobile devices, date and time fields use native mobile date and time pickers.
-   Email: Displays an input field for entering an email address up to 80 characters. The email pattern is automatically validated. UTF-8 encoding is supported for entering an international email address.
-   Geolocation: Displays input fields for entering latitude and longitude in decimal degrees. The latitude field accepts values within -90 and 90, and the longitude field accepts values within -180 and 180. See the **Geolocation Fields** section.
-   Lookup: Displays an input field for creating a relationship between two objects, for example, the account associated with a contact record. On user lookup fields, the lookup value is displayed without a user icon. The lookup type is supported in Experience Builder sites, Lightning Experience, and the Salesforce mobile app. Creating a new record from the lookup field's dropdown menu is currently not supported. Lookups are not supported for the OwnerId, CreatedBy, and LastModifiedBy fields. Dependent lookups and external lookups are also not supported. Lookup fields work only for objects that are compliant with the User Interface API. A lookup from a supported object to an unsupported object or field is displayed as a text field. See the **Lookup Fields** section.
-   Name: Displays one or more input fields for setting the name of a record. Input fields can include a single name field or multiple fields. For example, accounts might have a single name while contacts might have a salutation, first name, middle name, and last name. See the **Name Fields** section.
-   Number: Displays an input field for entering a number, and formats for the user's Salesforce locale and currency. Number formatting is based on the Intl.NumberFormat object and follows ISO guidelines. For example, entering "123.45" displays "€123,45" if your org's currency is set to EUR and your Salesforce locale is German.
-   Password: Displays an input field for entering a password. Characters you enter are masked after save.
-   Percent: Displays an input field for entering a percentage.
-   Phone: Displays an input field for entering a phone number up to 40 characters.
-   Picklist and multi-select picklist: Displays a picklist or multi-select picklist. Dependent picklists must be defined in your org before you can use them with `lightning-input-field`. Both controlling and dependent fields must be included in your component. See the **Dependent Picklist Fields** section.
-   Text: Displays text input, accepts up to 255 characters.
-   Text (Encrypted): Displays the encrypted text input for up to 175 characters.
-   Text Area: Displays multi-line text input for up to 255 characters.
-   Text Area (Long): Displays multi-line text input for up to 131,072 characters.
-   Text Area (Rich): Displays rich text input for bold or underline text, lists, and images for up to 131,072 characters including the formatting and HTML tags. Unsupported tags and attributes are removed and only their text content is displayed. For more information on supported tags, see [Rich Text Editor in Salesforce Help](https://help.salesforce.com/articleView?id=fields_using_html_editor.htm).
-   Time: Displays an input field for time selection in 15-minute increments. The time format is automatically validated against the user's Salesforce locale. On mobile devices, time fields use native mobile time pickers. For more information, see [Time Custom Field in Salesforce Help](https://help.salesforce.com/articleView?id=sf.custom_field_time_overview.htm).
-   URL: Displays a URL input field which checks for a protocol such as http:// or ftp:// .

#### Dependent Picklist Fields

Dependent picklist fields depend on the value of another field, called the controlling field. As such, we recommend placing the controlling field before the dependent field. If you don't provide a controlling field, the picklist displays in a disabled and read-only state.

This example uses `LeadSource` as the controlling field and `Level__c` as the
dependent field for a dependent picklist.

```html
<template>
    <lightning-record-edit-form
        id="recordViewForm"
        record-id="003R00000000000000"
        record-type-id="012R00000000000000"
        object-api-name="Contact"
    >
        <lightning-messages></lightning-messages>
        <!--Other fields here-->
        <lightning-input-field field-name="LeadSource"> </lightning-input-field>
        <lightning-input-field field-name="Level__c"> </lightning-input-field>
        <lightning-button
            id="submit"
            type="submit"
            label="Update record"
            class="slds-m-top_medium"
        >
        </lightning-button>
    </lightning-record-edit-form>
</template>
```

A dependent picklist should be lower on the page layout than its controlling field. You might encounter unexpected behavior if you place the dependent field before the controlling field on the page.

When using a record type with a dependent picklist, we don't recommend adding a default value that applies only to a specific controlling value. If you use a record type that has a default value set for the dependent picklist, this value is displayed in the picklist even though the controlling field might exclude the value.

For more information, see
[Define Dependent Picklists](https://help.salesforce.com/articleView?id=fields_defining_field_dependencies.htm) in Salesforce
Help.

#### Geolocation Fields

Geocode fields and custom geolocation fields display as latitude and longitude fields.

To use a custom geolocation field, pass in the compound field. For example, pass in `Account_Site__c` instead of `Account_Site__latitude__s` and `Account_Site__longitude__s`. This behavior is different from the limitation listed at [Geolocation Custom Field](https://help.salesforce.com/articleView?id=custom_field_geolocate_overview.htm).

```html
<lightning-record-edit-form
    object-api-name="Account"
    record-id="001R00000000000000"
>
    <lightning-messages></lightning-messages>
    <lightning-input-field
        field-name="Name"
        readonly="true"
    ></lightning-input-field>
    <lightning-input-field field-name="Account_Site__c"></lightning-input-field>
    <lightning-button
        type="submit"
        label="Update"
        class="slds-m-top_small"
        variant="brand"
    ></lightning-button>
</lightning-record-edit-form>
```

Geocode fields like `ShippingLatitude` and `ShippingLongitude` are part of standard address fields, such as `ShippingAddress`.
Geocode fields aren't visible on records, so they won't display when you pass the address field `ShippingAddress` to `lightning-input-field`.
To use geocode fields, pass in both the latitude and longitude fields.

```html
<lightning-record-edit-form
    object-api-name="Account"
    record-id="001R00000000000000"
>
    <lightning-messages></lightning-messages>
    <lightning-input-field
        field-name="Name"
        readonly="true"
    ></lightning-input-field>
    <lightning-input-field
        field-name="ShippingLatitude"
    ></lightning-input-field>
    <lightning-input-field
        field-name="ShippingLongitude"
    ></lightning-input-field>
    <lightning-button
        type="submit"
        label="Update"
        class="slds-m-top_small"
        variant="brand"
    ></lightning-button>
</lightning-record-edit-form>
```

For more information, see [Geocode Fields and Accuracy](https://help.salesforce.com/articleView?id=data_dot_com_clean_geocode_information_fields.htm) in Salesforce Help.

#### Lookup Fields

Lookup fields associate two records together. For example, a case record can associate the case to a contact using the `ContactId` field.

This example creates a new case using several text fields and a contact lookup field. The lookup field uses the `onchange` event handler to return the selected contact Id.

```html
<template>
    <lightning-record-edit-form
        object-api-name="Case"
        onsuccess={handleSuccess}
    >
        <div class="slds-m-around_medium">
            <lightning-input-field
                field-name="SuppliedName"
            ></lightning-input-field>
            <lightning-input-field
                field-name="ContactId"
                onchange={handleChange}
            ></lightning-input-field>
            <lightning-input-field
                field-name="Description"
            ></lightning-input-field>
            <div class="slds-m-top_medium">
                <lightning-button
                    variant="brand"
                    type="submit"
                    name="save"
                    label="Create Case"
                ></lightning-button>
            </div>
        </div>
    </lightning-record-edit-form>
</template>
```

Use the `event.detail.value` property to retrieve the Id of the selected contact record on the lookup field. Although the Id is returned in an array, multi-select lookups are currently not supported. To return the saved record, use the `success` event. For more information on the `success` event, see the [lightning-record-edit-form](bundle/lightning-record-edit-form/documentation) documentation.

```javascript
import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class LookupExample extends LightningElement {
    handleSuccess(event) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Success',
                message: event.detail.apiName + ' created.',
                variant: 'success',
            })
        );
    }

    handleChange(event) {
        console.log('You selected an account: ' + event.detail.value[0]);
    }
}
```

#### Name Fields

Name fields are available on contact, lead, and user records.

A name compound field on records includes these constituent fields:

-   `FirstName`
-   `MiddleName`
-   `LastName`
-   `Salutation`
-   `Suffix`

The `MiddleName` and `Suffix` fields are not enabled by default. For more information, see [User Fields](https://help.salesforce.com/articleView?id=user_fields.htm) in Salesforce Help.

The `Salutation` field is available as part of the `Name` compound field for contacts and leads. Passing in `Salutation` to `field-name` directly is not supported.

The `InformalName` field is not supported for editing on `lightning-record-edit-form`.

This example displays the name compound field with `Salutation`, `FirstName`, `MiddleName`, and `LastName` fields to create a contact record. To create a lead record instead, set `object-api-name="Lead"`.

```html
<lightning-record-edit-form object-api-name="Contact">
    <lightning-messages></lightning-messages>
    <lightning-input-field field-name="Name"></lightning-input-field>
    <!-- Other fields here -->
    <lightning-button
        class="slds-m-top_small"
        variant="brand"
        type="submit"
        label="Create contact"
    ></lightning-button>
</lightning-record-edit-form>
```

To work with the user object, specify the constituent fields instead of using the `Name` compound field.

```html
<lightning-record-edit-form object-api-name="User">
    <lightning-messages></lightning-messages>
    <lightning-input-field field-name="FirstName"></lightning-input-field>
    <lightning-input-field field-name="MiddleName"></lightning-input-field>
    <lightning-input-field field-name="LastName"></lightning-input-field>
    <!-- Other fields here -->
    <lightning-button
        class="slds-m-top_small"
        variant="brand"
        type="submit"
        label="Create contact"
    ></lightning-button>
</lightning-record-edit-form>
```

#### Usage Considerations

This component uses `button` elements for picklists to comply with the [Lightning Design System combobox blueprint](https://www.lightningdesignsystem.com/components/combobox/#%22Input%22-markup) for select-only comboboxes.

This component has usage differences from its Aura counterpart. See [Base Components: Aura Vs Lightning Web Components](https://developer.salesforce.com/docs/platform/lwc/guide/migrate-map-aura-lwc-components) in the Lightning Web Components Developer Guide.
