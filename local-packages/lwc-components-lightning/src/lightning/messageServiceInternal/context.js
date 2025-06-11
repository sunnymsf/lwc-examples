/**
 * This is a referral implementation for a custom context provider
 * that can be installed on any element in the dom, and can provide
 * value to any LWC component using wire.
 *
 * This provide is sharing the same value with every child, and the
 * identity of the consumer is not tracked.
 *
 * Per Context Component Instance, track the current context data
 *
 * All mentions of the "reference implementation" refer to
 * https://github.com/salesforce/lwc/pull/1408/files
 */
import { createContextProvider } from 'lwc';
import { releaseMessageContext as smReleaseMessageContext } from './subscriptionManager';
import { PUBLIC_MODULE_NAME } from './name';
import { generateUUID } from './utils';

/**
 * Map from consumer elements to consumer MessageContext objects.
 * Consumer elements are the components that use @wire(MessageContext).
 * MessageContext objects here are the globally unique objects emited by the @wire.
 */
const ConsumerContextValueMap = new WeakMap();

/** Map from consumer MessageContext objects to provider elements. */
const ConsumerContextToProviderMap = new Map();

/** Map from provider elements to contextual state (e.g. values relevant to scoping stored here) */
const ProviderToContextualStateMap = new Map();

/**
 * The default contextual state. This contextual state value is used for MessageContext consumers
 * without a provider or for providers that have not set their own contextual state yet.
 * @see {@link getContextualStateForConsumerContext}
 */
const DefaultContextualState = {};

/** The collection of contexts that have been returned from this module. */
const RegisteredContexts = new Set();

const hasOwnProperty = Object.prototype.hasOwnProperty;

/** The identity of the @wire adapter */
class MessageContext {
    consumerContext;

    constructor(dataCallback) {
        this._dataCallback = dataCallback;
        // provide a default value, in this case undefined.
        this._dataCallback(this.consumerContext);
    }

    /**
     * This method creates the consumer message context if needed.
     * Since the order of the wire adapter lifecycle calls may be different depending on the component
     * being within a provider:
     *    1. If the component is within a provider, the call order is: update, connect
     *    2. If is not: connect.
     * We need to create the context during update (1) and connect (2).
     */
    createAndUpdateContextIfNeeded() {
        if (!this.consumerContext) {
            // Create a new context regardless of the presence of a provider.
            this.consumerContext = createMessageContext();

            // The reference implementation does not store the consumer's context in a map in this
            // default case, but we want to because we want to be able to read the consumer's context
            // value on `disconnectedCallback`, regardless of if there are no providers.
            ConsumerContextValueMap.set(this, this.consumerContext);

            // Emit the created context to consumer.
            this._dataCallback(this.consumerContext);
        }
    }

    update(_config, context) {
        if (context) {
            // This is the case of a consumer within a provider.

            if (!hasOwnProperty.call(context, 'value')) {
                throw new Error(`Invalid context provided`);
            }

            // In the `MessageContext` case, the context value is the provider itself.
            // We need to associate the `MessageContext` value with the provider after creating it.
            const providerElement = context.value;

            this.createAndUpdateContextIfNeeded();

            ConsumerContextToProviderMap.set(
                this.consumerContext,
                providerElement
            );
        }
    }
    connect() {
        this.createAndUpdateContextIfNeeded();
    }

    disconnect() {
        // Get the context value and unregister all message service listeners.
        const context = ConsumerContextValueMap.get(this);
        releaseMessageContext(context);
        ConsumerContextValueMap.delete(this);
        ConsumerContextToProviderMap.delete(this.consumerContext);
        this.consumerContext = null;
    }

    static configSchema = {};
    static contextSchema = { value: 'required' /* could be 'optional' */ };
}

const contextualizer = createContextProvider(MessageContext);

/**
 * Creates a new `MessageContext` reference.
 *
 * This will get called in a couple situations:
 *   - when a MessageContext @wire instance initializes in the `connect`
 *     callback when a `MessageContext` consumer connects to the DOM.
 *   - when the imperative `createMessageContext()` function is called
 *
 * This function registers the context after creation.
 *
 * @returns {*} - a new message context reference.
 */
export function createMessageContext() {
    // The important thing is that this context is unique per consumer.
    // An object — Object.freeze({}) — gets turned into a `Proxy` due to Locker, losing identity.
    // A function — () => {} — gets turned into a `SecureFunction` due to Locker, losing identity.
    // A symbol fulfills our requirements.
    // A uuid is helpful for debugging.
    const context = Symbol('MessageContext_' + generateUUID());

    // Register context
    RegisteredContexts.add(context);

    return context;
}

/**
 * Unregisters all listeners associated with the given context
 *
 * This will get called in a couple situations:
 *   - when a component with a MessageContext @wire instance
 *     `disconnect`s from the DOM.
 *   - when the imperative `releaseMessageContext()` function is called
 *
 * @param {*} messageContext - the context to release
 */
export function releaseMessageContext(messageContext) {
    if (!isRegisteredContext(messageContext)) {
        return; // quietly ignore, inspired by `clearTimeout`
    }
    unregisterContext(messageContext);
    smReleaseMessageContext(messageContext);
}

/**
 * Validates that the context has been supplied by this module.
 *
 * @param {*} context - the context to validate.
 */
export function validateContext(context) {
    if (!isRegisteredContext(context)) {
        throw new Error(`${PUBLIC_MODULE_NAME}: invalid message context`);
    }
}

/**
 * Ask if this context has been registered.
 *
 * @param {*} context - the context to check if registered.
 * @returns {Boolean} - whether this context has been registered
 */
export function isRegisteredContext(context) {
    return RegisteredContexts.has(context);
}

/**
 * This removes the context from the collection of registered contexts.
 *
 * @param {*} context - the context to unregister
 */
export function unregisterContext(context) {
    RegisteredContexts.delete(context);
}

/**
 * Get the contextual state data based on the provider element.
 * Schema of contextual state data is:
 *  - listeners: the subscribers that want to know when the value changes;
 *               these subscribers are associated with descendants of the provider
 *  -     value: the contextual state value
 *
 * @param {EventTarget} providerElement - the provider element to get the contextual state for
 */
function getProviderContextualStateData(providerElement) {
    let contextualStateData = ProviderToContextualStateMap.get(providerElement);

    if (contextualStateData === undefined) {
        // collection of consumers' callbacks and default context value per provider instance
        contextualStateData = {
            listeners: [],
            value: DefaultContextualState, // initial value for an installed provider
        };
        ProviderToContextualStateMap.set(providerElement, contextualStateData);
    }
    return contextualStateData;
}

/**
 * Set the given eventTarget/DOM element to be a MessageContext provider.
 * Helper for the exported {@link installMessageContextProvider}
 *
 * @param {EventTarget} providerElement - the node to set as a MessageContext provider
 * @returns {Function} - a function that updates the contextual state relating to that provider
 */
function setupNewContextProvider(providerElement) {
    contextualizer(providerElement, {
        consumerConnectedCallback(consumer) {
            // Emit the provider for this consumer as the context.
            consumer.provide({ value: providerElement });
        },
        consumerDisconnectedCallback() {},
    });

    return function updateContextualState(newValue) {
        const contextualStateData =
            getProviderContextualStateData(providerElement);
        contextualStateData.value = newValue;
        contextualStateData.listeners.forEach((listener) => listener(newValue));
    };
}

/**
 * Set the given DOM element to be a MessageContext provider.
 * Returns a function that can be used to update the contextual state of the provider.
 *
 * Be sure to call {@link uninstallMessageContextProvider} when element is being destroyed
 * (e.g. in `disconnectedCallback`)
 *
 * @param {EventTarget} element - the node to set as a MessageContext provider
 * @returns {Function} - a function that updates the contextual state relating to that provider
 */
export function installMessageContextProvider(element) {
    return setupNewContextProvider(element);
}

/**
 * Clean up resources relating to MessageContext provider's operation.
 *
 * @param {EventTarget} element - the DOM element to uninstall as a MessageContext provider
 */
export function uninstallMessageContextProvider(providerElement) {
    ProviderToContextualStateMap.delete(providerElement);
}

/**
 * Returns the contextual state value associated with a given MessageContext @wire context
 *
 * @param {*} consumerContext - the context to find the contextual state for
 */
export function getContextualStateForConsumerContext(consumerContext) {
    validateContext(consumerContext);

    const providerElement = ConsumerContextToProviderMap.get(consumerContext);

    if (providerElement === undefined) {
        return DefaultContextualState;
    }

    const contextualStateData = getProviderContextualStateData(providerElement);

    return contextualStateData.value;
}

/**
 * Subscribe and execute some behavior when the contextual state changes.
 * Calling this will immediately invoke the provided callback as a convenience
 * to give the caller the current contextual state value.
 *
 * This returns a function to unsubscribe from contextual state changes.
 * At the latest, invoke this unsubscriber in the `disconnectedCallback`.
 *
 * @param {*} consumerContext - the context to track contextual state changes against
 * @param {Function} callback - the behavior to run when the contextual state changes
 * @returns {Function} - function that unsubscribes from contextual state changes
 */
export function subscribeToContextualStateChanges(consumerContext, callback) {
    validateContext(consumerContext);

    if (typeof callback !== 'function') {
        throw new Error(
            `${PUBLIC_MODULE_NAME}: invalid callback function for subscribing to contextual state changes`
        );
    }

    const providerElement = ConsumerContextToProviderMap.get(consumerContext);

    const contextualStateData = getProviderContextualStateData(providerElement);

    // Immediately invoke to give consumer current contextual state value.
    callback(contextualStateData.value);

    // The callback will be called again when a MessageContext provider invokes
    // the function returned from calling `installMessageContextProvider`.
    contextualStateData.listeners.push(callback);

    return function unsubscribeFromContextualStateChanges() {
        const callbackIndex = contextualStateData.listeners.indexOf(callback);
        if (callbackIndex >= 0) {
            contextualStateData.listeners.splice(callbackIndex, 1);
        }
    };
}

export { MessageContext };
