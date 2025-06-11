Use Lightning message service to communicate across the DOM between Visualforce pages, Aura components, and Lightning web components, including components in a pop-out utility bar.

Use the Lightning message service functions to communicate over a Lightning message channel.

In a component's Javascript file, import any exports that you need from the `lightning/messageService` module. Import a message channel using the scoped module `@salesforce/messageChannel`.

```javascript
import {
    APPLICATION_SCOPE,
    createMessageContext,
    MessageContext,
    publish,
    releaseMessageContext,
    subscribe,
    unsubscribe,
} from 'lightning/messageService';
import recordSelected from '@salesforce/messageChannel/Record_Selected__c';
```

These two components publish a message and subscribe to the message over the same message channel.

```javascript
// lmsPublisherWebComponent.js
import { LightningElement, wire } from 'lwc';
import getContactList from '@salesforce/apex/ContactController.getContactList';

// Import message service features required for publishing and the message channel
import { publish, MessageContext } from 'lightning/messageService';
import recordSelected from '@salesforce/messageChannel/Record_Selected__c';

export default class LmsPublisherWebComponent extends LightningElement {
    @wire(getContactList)
    contacts;

    @wire(MessageContext)
    messageContext;

    // Respond to UI event by publishing message
    handleContactSelect(event) {
        const payload = { recordId: event.target.contact.Id };

        publish(this.messageContext, recordSelected, payload);
    }
}
```

```javascript
// lmsSubscriberWebComponent.js
import { LightningElement, wire } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { reduceErrors } from 'c/ldsUtils';

// Import message service features required for subscribing and the message channel
import {
    subscribe,
    unsubscribe,
    APPLICATION_SCOPE,
    MessageContext,
} from 'lightning/messageService';
import recordSelected from '@salesforce/messageChannel/Record_Selected__c';

import NAME_FIELD from '@salesforce/schema/Contact.Name';
import TITLE_FIELD from '@salesforce/schema/Contact.Title';
import PHONE_FIELD from '@salesforce/schema/Contact.Phone';
import EMAIL_FIELD from '@salesforce/schema/Contact.Email';
import PICTURE_FIELD from '@salesforce/schema/Contact.Picture__c';

const fields = [
    NAME_FIELD,
    TITLE_FIELD,
    PHONE_FIELD,
    EMAIL_FIELD,
    PICTURE_FIELD,
];

export default class LmsSubscriberWebComponent extends LightningElement {
    subscription = null;
    recordId;

    Name;
    Title;
    Phone;
    Email;
    Picture__c;

    @wire(getRecord, { recordId: '$recordId', fields })
    wiredRecord({ error, data }) {
        if (error) {
            this.dispatchToast(error);
        } else if (data) {
            fields.forEach(
                (item) => (this[item.fieldApiName] = getFieldValue(data, item))
            );
        }
    }

    @wire(MessageContext)
    messageContext;

    // Encapsulate logic for Lightning message service subscribe and unsubsubscribe
    subscribeToMessageChannel() {
        if (!this.subscription) {
            this.subscription = subscribe(
                this.messageContext,
                recordSelected,
                (message) => this.handleMessage(message),
                { scope: APPLICATION_SCOPE }
            );
        }
    }

    unsubscribeToMessageChannel() {
        unsubscribe(this.subscription);
        this.subscription = null;
    }

    // Handler for message received by component
    handleMessage(message) {
        this.recordId = message.recordId;
    }

    // Standard lifecycle hooks used to subscribe and unsubsubscribe to the message channel
    connectedCallback() {
        this.subscribeToMessageChannel();
    }

    disconnectedCallback() {
        this.unsubscribeToMessageChannel();
    }

    // Helper
    dispatchToast(error) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Error loading contact',
                message: reduceErrors(error).join(', '),
                variant: 'error',
            })
        );
    }
}
```

#### Methods

**`createMessageContext()`**

Returns a `MessageContext` object.

Call this function in a service component that doesn't extend `LightningElement`. In a service component, you can’t use `@wire(MessageContext)` to create a `MessageContext` object. Instead, call the `createMessageContext()` function to create the `MessageContext` object and assign it to a field, like `messageContext`. Then, pass `messageContext` into the `subscribe()` function. `MessageContext` isn’t automatically released for service components. Call `releaseMessageContext(messageContext)` to remove any subscriptions associated with your Lightning web component’s `MessageContext`.

**`publish(messageContext, messageChannel, message)`**

Publishes a message to a specified message channel.

| Parameter        | Type   | Description                                                                                                                                                                                                            |
| ---------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `messageContext` | object | The `MessageContext` object provides information about the Lightning web component that is using the Lightning message service. Get this object via the `MessageContext` wire adapter or via `createMessageContext()`. |
| `messageChannel` | object | The message channel object. To import a message channel, use the scoped module `@salesforce/messageChannel`. To create a message channel in an org, use the LightningMessageChannel metadata type.                     |
| `message`        | object | A serializable JSON object containing the message published to subscribers. A message can't contain functions or symbols.                                                                                              |

**`releaseMessageContext(messageContext)`**

Releases a `MessageContext` object associated with a Lightning web component and unsubscribes all associated subscriptions.

**`subscribe(messageContext, messageChannel, listener, subscriberOptions)`**

Subscribes to a specified message channel. Returns a Subscription object that you can use to unsubscribe.

By default, communication over a message channel can occur only between Lightning web components, Aura components, or Visualforce pages in an active navigation tab, an active navigation item, or a utility item. Utility items are always active. A navigation tab or item is active when it’s selected. Navigation tabs and items include:

-   Standard navigation tabs
-   Console navigation workspace tabs
-   Console navigation subtabs
-   Console navigation items

To receive messages on a message channel from anywhere in the application, pass the `subscriberOptions` parameter as `{scope: APPLICATION_SCOPE}`. Import `APPLICATION_SCOPE` from `lightning/messageService`.

| Parameter           | Type     | Description                                                                                                                                                                                                                       |
| ------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `messageContext`    | object   | The `MessageContext` object provides information about the Lightning web component that is using the Lightning message service.                                                                                                   |
| `messageChannel`    | object   | To import a message channel, use the scoped module `@salesforce/messageChannel`. To create a message channel in an org, use the LightningMessageChannel metadata type.                                                            |
| `listener`          | function | A function that handles the message once it is published.                                                                                                                                                                         |
| `subscriberOptions` | object   | (Optional) An object that, when set to `{scope: APPLICATION_SCOPE}`, specifies the ability to receive messages on a message channel from anywhere in the application. Import `APPLICATION_SCOPE` from `lightning/messageService`. |

**`unsubscribe(subscription)`**

Unsubscribes from a message channel.

| Parameter      | Type   | Description                                                     |
| -------------- | ------ | --------------------------------------------------------------- |
| `subscription` | object | The Subscription object returned by the `subscribe()` function. |

#### Wire Adapters

**`MessageContext`**

Returns a `MessageContext` object.

The `MessageContext` object contains information about the Lightning web component that is using the Lightning message service. Pass the `MessageContext` object to the `publish()` and `subscribe()` functions. When using the `@wire(MessageContext)` adapter, you don’t have to interact with any of the component’s lifecycle events. The Lightning message service features automatically unregister when the component is destroyed.

```javascript
    @wire(MessageContext)
    messageContext;
```

#### LWC Recipes

The [LWC Recipes GitHub repository](https://github.com/trailheadapps/lwc-recipes) contains code examples for Lightning Web Components that you can test in an org.

For a recipe that uses `lightning/messageService`, see the following components in the LWC Recipes repo.

-   `c-lms-publisher-web-component`
-   `c-lms-subscriber-web-component`

#### See Also

[Lightning Web Components Developer Guide: Communicate Across the DOM with Lightning Message Service](https://developer.salesforce.com/docs/platform/lwc/guide/use-message-channel)
