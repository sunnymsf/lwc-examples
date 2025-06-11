import { PUBLIC_MODULE_NAME } from './name';
import { validateSubscriberOptionsInPlugins } from './pluginManager';

export function validateListener(listener) {
    if (typeof listener !== 'function') {
        throw new Error(`${PUBLIC_MODULE_NAME}: invalid listener function`);
    }
}

export function validateSubscriberOptions(subscriberOptions) {
    if (
        subscriberOptions !== undefined &&
        typeof subscriberOptions !== 'object'
    ) {
        throw new Error(
            PUBLIC_MODULE_NAME +
                ': invalid subscriberOptions. It must be an object.'
        );
    }

    validateSubscriberOptionsInPlugins(subscriberOptions);
}

export function validatePublisherOptions(publisherOptions) {
    if (
        publisherOptions !== undefined &&
        typeof publisherOptions !== 'object'
    ) {
        throw new Error(`${PUBLIC_MODULE_NAME}: invalid publisherOptions`);
    }
}

export function validateMessage(message) {
    if (typeof message !== 'object') {
        throw new Error(
            `${PUBLIC_MODULE_NAME}: invalid message. message must be serializable object or null`
        );
    }
}
