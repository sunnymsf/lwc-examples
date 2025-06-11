import {
    subscribe as smSubscribe,
    unsubscribe as smUnsubscribe,
    publish as smPublish,
} from './subscriptionManager';
import {
    validateListener,
    validateMessage,
    validatePublisherOptions,
    validateSubscriberOptions,
} from './validation';
import { validateContext } from './context';
import { validateMessageChannel } from './channel';

/**
 * Full public documentation for `subscribe` is in lightning/messageService.
 * Documentation of internally supported subscriber options is here:
 *   - scope: same as in public documentation
 *   - [INTERNAL_OPTIONS]:
 *       - enhancedArgs: an option to allow internal subscriptions to receive
 *                       additional arguments in their listeners when setting
 *                       this property to true
 */
export function subscribe(
    messageContext,
    messageChannel,
    listener,
    subscriberOptions
) {
    validateContext(messageContext);
    validateMessageChannel(messageChannel);
    validateListener(listener);
    validateSubscriberOptions(subscriberOptions);

    return smSubscribe(
        messageContext,
        messageChannel,
        listener,
        subscriberOptions
    );
}

export function unsubscribe(subscription) {
    smUnsubscribe(subscription);
}

/**
 * Full public documentation for `publish` is in lightning/messageService.
 * Documentation of internally supported publisher options is here:
 *   - [INTERNAL_OPTIONS]:
 *       - skipSameContext: an option that can be used to prevent invoking a listener
 *                          if it was published with the same context; useful for
 *                          preventing re-publishing of messages on the same window
 *       - contextualState: a contextual state that can be used instead of the
 *                          real contextual state associated with the publiher;
 *                          useful for cross-window scenarios
 */
export function publish(
    messageContext,
    messageChannel,
    message,
    publisherOptions
) {
    validateContext(messageContext);
    validateMessageChannel(messageChannel);
    validatePublisherOptions(publisherOptions);
    message = serializeAndValidateMessage(message);

    smPublish(messageContext, messageChannel, message, publisherOptions);
}

// serialize/deserialize so message is consistent when sent across windows
function serializeAndValidateMessage(message) {
    if (message !== undefined) {
        const _message = JSON.parse(JSON.stringify(message));
        validateMessage(_message);
        return _message;
    }
    return undefined;
}

export {
    MessageContext,
    createMessageContext,
    releaseMessageContext,
    installMessageContextProvider,
    uninstallMessageContextProvider,
    getContextualStateForConsumerContext,
    subscribeToContextualStateChanges,
} from './context';
export { validateSubscriberOptions } from './validation';
export { createMessageChannel } from './channel';
export { registerPlugin } from './pluginManager';
export { APPLICATION_SCOPE } from './scope';
export { INTERNAL_OPTIONS } from './internalOptions';
