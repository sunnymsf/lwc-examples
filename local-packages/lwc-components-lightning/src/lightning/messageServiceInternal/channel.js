import { generateUUID } from './utils';
import { PUBLIC_MODULE_NAME } from './name';

const allMessageChannels = new Set();

export function createMessageChannel() {
    const messageChannel = generateUUID();
    allMessageChannels.add(messageChannel);
    return messageChannel;
}

export function validateMessageChannel(messageChannel) {
    if (!allMessageChannels.has(messageChannel)) {
        throw new Error(`${PUBLIC_MODULE_NAME}: unknown message channel`);
    }
}
