import {
    subscribe as internalSubscribe,
    unsubscribe as internalUnsubscribe,
    publish as internalPublish,
    createMessageChannel as internalCreateMessageChannel,
    createMessageContext as internalCreateMessageContext,
    releaseMessageContext as internalReleaseMessageContext,
} from 'lightning/messageServiceInternal';

/**
 * A `@wire` adpator that provides component context for a `LightningElement`.
 * Annotate a component's property with `@wire(MessageContext)` and pass that
 * context value to the first parameter of the `subscribe` and `publish` functions.
 * When subscribing with a `@wire(MessageContext)` context value, all listeners
 * associated with that component get automatically cleaned up on `disconnectedCallback`.
 */
export { MessageContext } from 'lightning/messageServiceInternal';

/**
 * When using `subscribe`, `APPLICATION_SCOPE` is passed in as a value to the `scope` property of
 * the `subscriberOptions`. This specifies that the subscriber wants to subscribe to messages on
 * a message channel no matter where the subscriber is in the entire application.
 */
export { APPLICATION_SCOPE } from 'lightning/messageServiceInternal';

/**
 * Subscribes a listener function to be invoked when a message is published on the provided channel.
 *
 * @param {Object} messageContext - The MessageContext object.
 * @param {Object} messageChannel - MessageChannel object.
 * @param {Function} listener - Function to be invoked when messages are published on the channel.
 * @param {Object} subscriberOptions - Options to influence message channel subscription.
 *                                     Current subscriber options:
 *                                       1. `scope` - the scope that a component is subscribed to.
 *                                          Setting this to `APPLICATION_SCOPE` subscribes in the application
 *                                          scope. See the `APPLICATION_SCOPE` export for full documentation.
 * @return {Object} - Subscription object used to unsubscribe the listener, if no longer interested.
 */
export function subscribe(
    messageContext,
    messageChannel,
    listener,
    subscriberOptions
) {
    return internalSubscribe(
        messageContext,
        messageChannel,
        listener,
        subscriberOptions
    );
}

/**
 * Unregisters the listener associated with the subscription.
 *
 * @param {Object} subscription - Subscription object returned when subscribing.
 */
export function unsubscribe(subscription) {
    internalUnsubscribe(subscription);
}

/**
 * Send a message to listeners subscribed to the channel.
 *
 * @param {Object} messageContext - The MessageContext object.
 * @param {Object} messageChannel - MessageChannel object.
 * @param {Object} message - Optional, serializable object to be sent to subscribers.
 * @param {Object} publisherOptions - Optional, options to influence message delivery.
 */
export function publish(
    messageContext,
    messageChannel,
    message,
    publisherOptions
) {
    internalPublish(messageContext, messageChannel, message, publisherOptions);
}

/**
 * Creates an anonymous MessageChannel object for use with Message Service.
 *
 * @return {Object} - Anonymous MessageChannel.
 */
export function createMessageChannel() {
    return internalCreateMessageChannel();
}

/**
 * Creates a message context for an LWC library.
 *
 * @return {Object} - MessageContext for use by LWC Library.
 */
export function createMessageContext() {
    return internalCreateMessageContext();
}

/**
 * Releases a message context associated with LWC library and
 * unsubscribes all associated subscriptions.
 *
 * @param {Object} messageContext - MessageContext for use by LWC Library.
 */
export function releaseMessageContext(messageContext) {
    internalReleaseMessageContext(messageContext);
}
