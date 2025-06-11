import { createContextProvider, readonly } from 'lwc';

// a map of provider element => the context
const ContextDataMap = new WeakMap();

/**
 * Base class for the context wire adapter.
 */
class BaseContextWireAdapter {
    // context object
    _contextValue;
    // refernce to the callback for providing the context value to consumer
    _dataCallback;

    constructor(dataCallback) {
        this._contextValue = null;
        this._dataCallback = dataCallback;
        this._dataCallback(this._contextValue);
    }

    update(_config, context) {
        if (!context) {
            return;
        }
        // we only care about the context, no config is expected or used
        if (!hasOwnProperty.call(context, 'value')) {
            throw new Error(`Invalid context provided`);
        }
        this._contextValue = context.value;
        this._dataCallback(this._contextValue);
    }

    connect() {
        // noop
    }

    disconnect() {
        // noop
    }

    static configSchema = {};
    static contextSchema = { value: 'required' };
}

/**
 * returns a class reference of a context adapter with specific name
 * @param {String} name - name of the context adapter
 * @returns the class reference of the named context adpapter
 */
const createContextWireAdapter = (name) => {
    return class extends BaseContextWireAdapter {
        static get adapterName() {
            return name;
        }
    };
};

/**
 * retrieve the context data of a provider,
 * if not found, a new one will be created
 * @param {Element} provider
 * @returns
 */
const getContextData = (provider) => {
    let contextData = ContextDataMap.get(provider);
    if (contextData === undefined) {
        // collection of consumers' callbacks and default context value for provider instance
        contextData = {
            consumers: [],
            value: null,
        };
        ContextDataMap.set(provider, contextData);
    }
    return contextData;
};

/**
 * Emits a context value for given provider element
 * @param {Element} provider  - provier element
 * @param {*} newValue - value to provide
 */
const provideNewContext = (provider, newValue) => {
    const contextData = getContextData(provider);
    // provide the provider's context value to all consumers
    contextData.value = readonly(newValue);
    contextData.consumers.forEach((consumer) => {
        consumer.provide({ value: readonly(newValue) });
    });
};

export class WireUtil {
    // reference to the context adapter class of specfic name
    contextWireAdapter;
    // reference to the context providing function for the wire adapter
    contextualizer;

    /**
     * @param {String} name - @wire's context name.
     */
    constructor(name) {
        this.contextWireAdapter = createContextWireAdapter(name);
        this.contextualizer = createContextProvider(this.contextWireAdapter);
    }

    /**
     * Performs initial setup for the @wire's context provider.
     * @param {Element} provider - provider element
     * @param {*} value - value to be provided.
     */
    initializeContextProvider(provider, newValue) {
        this.contextualizer(provider, {
            consumerConnectedCallback(consumer) {
                // create the context data for the provided if needed
                const contextData = getContextData(provider);
                const { consumers, value } = contextData;
                // register the new consumer's callback
                consumers.push(consumer);
                // push the current context value to consumer
                consumer.provide({ value });
            },
            consumerDisconnectedCallback(consumer) {
                // unregister the consumer
                const contextData = getContextData(provider);
                const index = contextData.consumers.indexOf(consumer);
                if (index < 0) {
                    console.warn(
                        `Context data listener not found for ${provider}.`
                    );
                    return;
                }
                contextData.consumers.splice(index, 1);
            },
        });
        if (newValue !== undefined) {
            provideNewContext(provider, newValue);
        }
    }

    provideContextValue(provider, value) {
        provideNewContext(provider, value);
    }
}
