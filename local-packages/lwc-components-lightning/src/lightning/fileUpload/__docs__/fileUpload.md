A `lightning-file-upload` component provides an integrated way for users to upload multiple files. You can configure the file uploader to accept specific file types, and the file types are filtered in the user's file browser. To upload files using `lightning-file-upload`, you can:

-   Click the button to select a file from your system's file browser
-   Drag a file from your system into the file selector drop zone

To associate an uploaded file to a record, specify the `record-id` attribute.
Uploaded files are available in Files Home under the Owned by Me
filter and on the record's Attachments related list that's on the record detail page.
If you don't specify the `record-id` attribute, the file is private to the uploading user.

Although all file formats that are supported by Salesforce are allowed, you
can restrict the file formats using the `accept` attribute.

The button label is "Upload Files" by default. Use the `label` attribute to add a descriptive label above the Upload Files button.

This example creates a file uploader that allows multiple PDF and PNG files to
be uploaded.

```html
<template>
    <lightning-file-upload
        label="Attach receipt"
        name="fileUploader"
        accept={acceptedFormats}
        record-id={myRecordId}
        onuploadfinished={handleUploadFinished}
        multiple
    >
    </lightning-file-upload>
</template>
```

You must handle the `uploadfinished` event, which is fired when the upload
is finished to return a list of the uploaded files, including
each file's name and documentId.

```javascript
import { LightningElement, api } from 'lwc';
export default class FileUploadExample extends LightningElement {
    @api
    myRecordId;

    get acceptedFormats() {
        return ['.pdf', '.png'];
    }

    handleUploadFinished(event) {
        // Get the list of uploaded files
        const uploadedFiles = event.detail.files;
        alert('No. of files uploaded : ' + uploadedFiles.length);
    }
}
```

After you select the files to upload, the Upload Files dialog displays the upload progress. You can dismiss it by clicking the x icon or the Done button.

Use the event handler to customize what happens after your files upload successfully and the Upload Files dialog is dismissed, such as displaying a toast using the `lightning/platformShowToastEvent` module.

If your record page displays the Notes &amp; Attachments panel, your uploaded files automatically appear there after the page is refreshed.

#### File Upload Limits

By default, you can upload up to 10 files simultaneously unless your
Salesforce admin has changed that limit. The org limit for the number of files
simultaneously uploaded is a maximum of 25 files and a minimum of 1 file. The
maximum file size you can upload is 2 GB. In Experience Builder sites, the file size limits
and types allowed follow the settings determined by site file moderation.

#### Enable Guest Users to Upload Files

By default, guest users can’t upload files and don’t have access to objects and their associated records.

To enable guest users to upload files, enable the org preference `Allow site guest users to upload files`.
However, even if you enable this setting, guest users can’t upload files to a record unless guest user sharing
rules are in place.

The `Secure guest user record access` org preference prevents access to records by guest users.
As a result, if you specify the `record-id` in the `lightning-file-upload` component, the file
fails to upload because the guest user doesn't have access to the record.

To enable guest users to upload files to a record, the org admin can create a custom field on
the ContentVersion object. The field type can be text or picklist. The API name of the custom field must
end with `fileupload__c`. For example, you can use the API name `Guest_Record_fileupload__c`
for the custom field.

Specify the `file-field-name` and `file-field-value` attributes in `lightning-file-upload` to store
a value in the custom field in the ContentVersion object. For example, set `file-field-name` to
`Guest_Record_fileupload__c`. Set `file-field-value` to a value that can be used in Apex to associate
the file to the record.

You can omit the `record-id` attribute when specifying `file-field-name` and `file-field-value`
attributes. However, if you provide the `record-id`, `file-field-name` and `file-field-value`
attributes, the record ID is ignored if the uploading user is a guest user.

If you don't provide the `record-id` or `file-field-name` and `file-field-value`
attributes, the uploaded file is private to an authenticated user.

This example specifies `record-id`, `file-field-name`, and `file-field-value` attributes for
behavior that supports authenticated users and guest users for uploading files to records.

```html
<template>
    <lightning-file-upload
        label="Attach receipt"
        name="fileUploader"
        accept={acceptedFormats}
        record-id={myRecordId}
        file-field-name="Guest_Record_fileupload__c"
        file-field-value={encryptedToken}
        onuploadfinished={handleUploadFinished}
        multiple
    >
    </lightning-file-upload>
</template>
```

Use Apex in your JavaScript file to get the value of the custom field.

The `uploadfinished` event is fired when the upload
is finished to return a list of the uploaded files, including
each file's name and documentId. When a guest user uploads files,
the returned list includes only the names of the files and doesn't return `documentId`.

```javascript
import { LightningElement, api } from 'lwc';
export default class FileUploadExample extends LightningElement {
    @api myRecordId;

    get encryptedToken() {
        //use apex to get
    }

    get acceptedFormats() {
        return ['.pdf', '.png'];
    }

    handleUploadFinished(event) {
        // Get the list of uploaded files
        const uploadedFiles = event.detail.files;
        alert('No. of files uploaded : ' + uploadedFiles.length);
    }
}
```

For more information, see [Files Best Practices and Considerations for Guest Users](https://help.salesforce.com/articleView?id=networks_files_best_practices.htm&type=0) in Salesforce Help.

#### Component Styling

`lightning-file-upload` implements the
[file selector](https://www.lightningdesignsystem.com/components/file-selector) blueprint in the Salesforce Lightning Design System (SLDS).

To apply additional styling, use the SLDS [utility classes](https://www.lightningdesignsystem.com/utilities/alignment) with the `class` attribute.

To customize the SLDS styles on the button, use the CSS custom properties for [`lightning-button`](bundle/lightning-button/documentation). For more information, see [Style Components Using Lightning Design System Styling Hooks](https://developer.salesforce.com/docs/platform/lwc/guide/create-components-css-custom-properties) in the Lightning Web Components Developer Guide.

#### Usage Considerations

`lightning-file-upload` doesn't support uploading multiple files at once on Android devices.

This component isn't supported in Lightning Out or standalone apps, and
displays as a disabled input. Additionally, if the `Don't allow HTML uploads as attachments or document records` security setting is enabled for your
organization, the file uploader can't be used to upload files with the
following file extensions: .htm, .html, .htt, .htx, .mhtm, .mhtml, .shtm,
.shtml, .acgi, .svg. For more information, see [Configure File Upload and Download Security Settings](https://help.salesforce.com/s/articleView?id=sf.admin_files_type_security.htm) in Salesforce Help.

If an error is detected on the client side, the file upload dialog shows an
informative error message. For example, the message informs you if you try
to upload a file type that isn't on the `accept` list. If an error
is detected on the server side, you see a generic "Can't upload file"
error. For example, you get this error if you don't provide a valid
record ID or the upload violates a validation rule.

We recommend that you add one or more record types to the ContentVersion
object in your org. When record types are present, the file uploader enables you to
provide details about the file and shows any error messages from the server.
This feature is useful if your org uses Apex triggers or validation rules
for file uploads, or has required custom fields in the ContentVersion object.
You can fix errors or provide required information to complete the upload
without reuploading the file.

On mobile devices, file upload doesn't work correctly when there's a required custom field in the ContentVersion object. To avoid this limitation, try one of these workarounds.

- Make the custom field optional
- Set a default value for the custom field
- Use code to populate the field after file upload

#### Custom Events

**`uploadfinished`**

The event fired when files are uploaded successfully.

The `uploadfinished` event returns the following parameter.

| Parameter | Type   | Description                          |
| --------- | ------ | ------------------------------------ |
| files     | object | The list of files that are uploaded. |

`event.detail.files` returns a list of uploaded files with the attributes
`name` and `documentId`. If a guest user performed the file upload, the
`documentId` isn't returned.

-   `name`: The file name in the format `filename.extension`, for example, account.jpg.
-   `documentId`: The ContentDocument Id in the format `069XXXXXXXXXXXX`.

The event properties are as follows.

| Property   | Value | Description                                                                                               |
| ---------- | ----- | --------------------------------------------------------------------------------------------------------- |
| bubbles    | false | This event doesn't bubble.                                                                               |
| cancelable | false | This event has no default behavior that can be canceled. You can't call `preventDefault()` on this event. |
| composed   | false | This event doesn't propagate outside the template in which it was dispatched.                            |

#### See Also

[Configure File Upload and Download Security Settings](https://help.salesforce.com/s/articleView?language=en_US&id=sf.admin_files_type_security.htm)

[Files Best Practices and Considerations for Guest Users](https://help.salesforce.com/articleView?id=networks_files_best_practices.htm)

[Guest User Record Access Development Best Practices](https://www.learnexperiencecloud.com/s/article/Guest-User-Record-Access-Development-Best-Practices)

[Sharing Rule Types](https://help.salesforce.com/articleView?id=security_sharing_rule_types.htm)
