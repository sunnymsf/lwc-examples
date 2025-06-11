/**
 * Collection of all plugin capabilities by name and associated recognized function.
 * When adding new capabilities, be sure to reconsider how we're doing validation in
 * `validatePlugin`. e.g. should plugin fail on registration?
 */
const PLUGIN_CAPABILITIES = Object.freeze({
    ALLOW_SUBSCRIPTION_INVOCATION: 'doesAllowSubscriptionInvocation',
    VALIDATE_SUBSCRIBER_OPTIONS: 'validateSubscriberOptions',
});

/** Collection of registered plugins. */
const PLUGINS = [];

/** Prefix for errors. */
const ERROR_PREFIX = '[Lightning Message Service Plugin Manager]';

/** Prefix for register errors. */
const REGISTER_ERROR_PREFIX = ERROR_PREFIX + ' Could not register plugin';

/**
 * Get one plugin's contribution to whether or not to invoke the subscription
 *
 * @param {Object} plugin - a given plugin
 * @param {Object} args - collection of props to help determine whether to invoke listeners
 *                        contains { publisherContext, subscriberContext, messageChannel, publisherOptions }
 * @return {boolean} true or false based on whether we should invoke the subscription
 */
function doesAllowSubscriptionInvocation(plugin, args) {
    // We did validation in `registerPlugin` that we have the function that we're looking for
    return plugin.definition[PLUGIN_CAPABILITIES.ALLOW_SUBSCRIPTION_INVOCATION](
        args
    );
}

/**
 * Ask whether or not all plugins agree we should invoke the given listener
 *
 * @param {Object} args - collection of props to help determine whether to invoke listeners
 *                        contains { publisherContext, subscriberContext, messageChannel, subscriberOptions }
 * @return {boolean} true or false based on whether or not all plugins agree we should invoke the given listener
 *
 * Consider generalizing this (e.g. pluginsDo(capability, args), e.g. pluginsDo(ALLOW_SUBSCRIPTION_INVOCATION, args))
 * The challenge in generalizing is coming up with an API that can generically fit into the subscriptionManager code.
 * Where are other useful extension points? Should it always return true or false?
 * These details can become clear when reviewing other candidate plugins or other desired extension behavior.
 */
export function pluginsAllowInvocation(args) {
    validateSubscriptionInvocationArgs(args);
    return PLUGINS.every((plugin) =>
        doesAllowSubscriptionInvocation(plugin, args)
    );
}

/**
 * Ensure callers of this method pass in the proper collection of properties
 *
 * @param {Object} args - the collection of props to validate
 */
function validateSubscriptionInvocationArgs(args) {
    const NEEDED_ARGS = [
        'publisherContextualState',
        'subscriberContextualState',
        'messageChannel',
        /* 'subscriberOptions' is optional */
    ];
    const missingArgs = [];

    NEEDED_ARGS.forEach((arg) => {
        if (args[arg] == null) {
            missingArgs.push(arg);
        }
    });

    if (missingArgs.length > 0) {
        throw new Error(
            `${ERROR_PREFIX} Could not consult plugin manager. Missing valid args: '${missingArgs.join(
                ', '
            )}'.`
        );
    }
}

/**
 * Register a plugin to influence Lightning Message Service delivery.
 *
 * Schema of plugin opts is:
 *  - name: the name of the plugin, used for errors messages, etc
 *  - definition: an object with a number of recognized functions:
 *      - doesAllowSubscriptionInvocation: ask if plugin allows invocation
 *      - validateSubscriberOptions: validate the subscriber options
 *
 * @param {Object} pluginOpts - the options relating to the plugin definition
 */
export function registerPlugin(pluginOpts) {
    validatePlugin(pluginOpts);
    PLUGINS.push(pluginOpts);
}

/**
 * Have the all plugins validate the subscriber options.
 *
 * @param {*} subscriberOptions
 */
export function validateSubscriberOptionsInPlugins(subscriberOptions) {
    PLUGINS.forEach((plugin) => {
        // We did validation in `registerPlugin` that we have the function that we're looking for
        plugin.definition[PLUGIN_CAPABILITIES.VALIDATE_SUBSCRIBER_OPTIONS](
            subscriberOptions
        );
    });
}

/**
 * Validate the given plugin args
 *
 * @param {Object} pluginOpts - the options relating to the plugin definition
 */
function validatePlugin(pluginOpts) {
    const pluginName = pluginOpts.name;
    const pluginDefinition = pluginOpts.definition;

    if (pluginName == null) {
        throw new Error(`${REGISTER_ERROR_PREFIX}. Empty plugin name.`);
    }

    if (pluginDefinition == null) {
        throw new Error(
            `${REGISTER_ERROR_PREFIX} ${pluginName}. Empty plugin definition.`
        );
    }

    if (PLUGINS.find((plugin) => plugin.name === pluginName) !== undefined) {
        throw new Error(
            `${REGISTER_ERROR_PREFIX} ${pluginName}. Plugin with name already registered.`
        );
    }

    // In the future, we may allow people to create plugins that don't have ALL of the
    // recognized capabilities, so maybe we can consider lazy validation...
    // For now, the plugin fails at registration time based on whether or not it has all of the existing plugin callbacks
    const missingCapabilities = [];
    Object.values(PLUGIN_CAPABILITIES).forEach((capabilityFunction) => {
        if (
            pluginDefinition[capabilityFunction] == null ||
            (pluginDefinition[capabilityFunction] != null &&
                typeof pluginDefinition[capabilityFunction] !== 'function')
        ) {
            missingCapabilities.push(capabilityFunction);
        }
    });
    if (missingCapabilities.length > 0) {
        throw new Error(
            `${REGISTER_ERROR_PREFIX} ${pluginName}. Missing valid functions: '${missingCapabilities.join(
                ', '
            )}'.`
        );
    }
}
