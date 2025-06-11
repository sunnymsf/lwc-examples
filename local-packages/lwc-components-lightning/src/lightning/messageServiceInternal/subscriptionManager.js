import { pluginsAllowInvocation } from './pluginManager';
import { APPLICATION_SCOPE } from './scope';
import { getContextualStateForConsumerContext } from './context';
import { INTERNAL_OPTIONS } from './internalOptions';

// key = empty subscription object, value = subscription details object
const allSubscriptions = new Map();

// key = MessageChannel, value = set of subscription details objects for given channel
const subscriptionsByChannel = new Map();

// key = MessageContext, value = set of subscription details objects for given context
const subscriptionsByContext = new Map();

// subscriberOptions will be used in the future but aren't processed here in Beta
export function subscribe(
    messageContext,
    messageChannel,
    listener,
    subscriberOptions
) {
    // external facing subscription object
    const subscription = Object.freeze({});

    // internal subscription object w/ additional information
    const _subscription = {
        subscription,
        channel: messageChannel,
        context: messageContext,
        listener,
        subscriberOptions,
    };

    // insert into all internal structures
    allSubscriptions.set(subscription, _subscription);

    let subscriptionsForChannel = subscriptionsByChannel.get(messageChannel);
    if (!subscriptionsForChannel) {
        subscriptionsForChannel = new Set();
        subscriptionsByChannel.set(messageChannel, subscriptionsForChannel);
    }
    subscriptionsForChannel.add(_subscription);

    let subscriptionsForContext = subscriptionsByContext.get(messageContext);
    if (!subscriptionsForContext) {
        subscriptionsForContext = new Set();
        subscriptionsByContext.set(messageContext, subscriptionsForContext);
    }
    subscriptionsForContext.add(_subscription);

    return subscription;
}

export function unsubscribe(subscription) {
    const _subscription = allSubscriptions.get(subscription);

    // quietly ignore if unsubscribe called twice for same subscription
    if (!_subscription) {
        return;
    }

    // remove from all internal structures
    const subscriptionsForChannel = subscriptionsByChannel.get(
        _subscription.channel
    );
    subscriptionsForChannel.delete(_subscription);
    if (subscriptionsForChannel.size === 0) {
        subscriptionsByChannel.delete(_subscription.channel);
    }

    const subscriptionsForContext = subscriptionsByContext.get(
        _subscription.context
    );
    subscriptionsForContext.delete(_subscription);
    if (subscriptionsForContext.size === 0) {
        subscriptionsByContext.delete(_subscription.context);
    }

    allSubscriptions.delete(subscription);
}

// messageContext is the context of the component publishing the message
// message is the payload which has already been serialized/deserialized into a new object suitable for LMS
export function publish(
    publisherContext,
    messageChannel,
    message,
    publisherOptions
) {
    // deep freeze to prevent subscribers from modifying as each listener is invoked
    if (message) {
        deepFreeze(message);
    }

    // invoke listeners for the provided Message Channel
    const subscriptionsForChannel = subscriptionsByChannel.get(messageChannel);

    if (!subscriptionsForChannel) {
        // no subscribers for the provided channel
        return;
    }

    let publisherContextualState;
    if (
        publisherOptions &&
        publisherOptions[INTERNAL_OPTIONS] &&
        publisherOptions[INTERNAL_OPTIONS].contextualState
    ) {
        // set the contextual state by the publisherOption
        publisherContextualState =
            publisherOptions[INTERNAL_OPTIONS].contextualState;
    } else {
        // get the publisher's contextual state
        publisherContextualState =
            getContextualStateForConsumerContext(publisherContext);
    }

    subscriptionsForChannel.forEach((_subscription) => {
        let invokeSubscription = true;
        const subscriberOptions = _subscription.subscriberOptions;

        // `APPLICATION_SCOPE` is a special scope that can be considered here to short circuit plugin evaluation of scopes
        if (
            subscriberOptions &&
            subscriberOptions.scope === APPLICATION_SCOPE
        ) {
            // invokeSubscription still true, no need to consult the pluginManager
        } else {
            // consult pluginManager to figure out if we want to invoke subscription
            const pluginArgs = {
                publisherContextualState,
                subscriberContextualState: getContextualStateForConsumerContext(
                    _subscription.context
                ),
                messageChannel,
                subscriberOptions,
            };

            // For the scope plugin (specifically for ACTIVE scope), the only variable that can change the result
            // of the following condition is the context for each subscriber. Put another way, every one with the
            // same subscriber contextual state will yield the same result from `pluginsAllowInvocation`.
            // Some subscribers may be a part of the same provider context, so one possible optimization is to evaluate
            // the plugin only on a given provider context, where a number of subscriptions are bucketed and then
            // apply the result of the condition on all the bucketed subscriptions so that we don't need to evaluate
            // every plugin on every individual subscription.
            if (!pluginsAllowInvocation(pluginArgs)) {
                // if any of the subscription invocation plugins return false, don't proceed in this iteration
                return;
            }
        }

        // option to indicate we shouldn't invoke subscriptions w/ same context as publisher
        if (
            publisherOptions &&
            publisherOptions[INTERNAL_OPTIONS] &&
            publisherOptions[INTERNAL_OPTIONS].skipSameContext
        ) {
            invokeSubscription = publisherContext !== _subscription.context;
        }

        if (invokeSubscription) {
            let args = [message];
            if (
                _subscription.subscriberOptions &&
                _subscription.subscriberOptions[INTERNAL_OPTIONS] &&
                _subscription.subscriberOptions[INTERNAL_OPTIONS].enhancedArgs
            ) {
                // We can add more data in this enhanced arg bag as needed
                args.push({ publisherContextualState });
            }

            _subscription.listener.apply(undefined, args);
        }
    });
}

// clean up all subscriptions associated with the disconnected MessageContext
export function releaseMessageContext(messageContext) {
    const subscriptionsForContext = subscriptionsByContext.get(messageContext);

    if (!subscriptionsForContext) {
        // no subscribers for the provided context
        return;
    }

    subscriptionsForContext.forEach((_subscription) => {
        unsubscribe(_subscription.subscription);
    });
}

function deepFreeze(object) {
    Object.keys(object).forEach((key) => {
        const value = object[key];
        object[key] =
            value && typeof value === 'object' ? deepFreeze(value) : value;
    });
    return Object.freeze(object);
}
