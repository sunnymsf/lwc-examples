import {
    interaction,
    markEnd,
    markStart,
    perfEnd,
    perfStart,
    error,
} from 'aura-instrumentation';
import { LOGGING_CONSTANTS } from './constants.js';

/**
 * Requests a log entry for tracking user interactions.
 * @param {String} ailtnEventSource - The synthetic event source for the interaction.
 * @param {String} ailtnScope - The component that handles the action. Effectively it's an ancestor of the target component.
 * @param {String} ailtnTarget - The component that handles the event.
 * @param {Object} ailtnContext - The composite of the context from the target and scope. This needs to be a flat map.
 */
export function log(ailtnEventSource, ailtnScope, ailtnTarget, ailtnContext) {
    if (!ailtnEventSource || !ailtnScope || !ailtnTarget) {
        return;
    }
    const _ailtnContext = ailtnContext || {};
    _ailtnContext.sourceCmp = 'lightning:lookup';
    _ailtnContext.time = Date.now();

    interaction(ailtnTarget, ailtnScope, _ailtnContext, ailtnEventSource);
}

export class LookupPerformanceLogger {
    _defaultAttributes;
    _attributes;
    _eventSource = `synthetic-${LOGGING_CONSTANTS.LOG_PERF_TRANSACTION_NAME}`;
    _inProgress = false;
    _transactionName = LOGGING_CONSTANTS.LOG_PERF_TRANSACTION_NAME;
    _wireTriggered = false;

    constructor(defaultAttributes) {
        this._defaultAttributes = defaultAttributes || {};
    }

    startTransaction() {
        this._inProgress = true;
        this._attributes = { ...this._defaultAttributes };
        perfStart(this._transactionName, this._attributes, this._eventSource);
    }

    endTransaction() {
        if (this._inProgress && this._wireTriggered) {
            this._inProgress = false;
            this._wireTriggered = false;
            perfEnd(this._transactionName, this._attributes, this._eventSource);
        }
    }

    startWireMark(wireName) {
        this._startMark(wireName);
    }

    endWireMark(wireName) {
        this._endMark(wireName);
    }

    startRenderMark() {
        if (this._inProgress) {
            this._wireTriggered = true;
            this._startMark('render');
        }
    }

    endRenderMark() {
        if (this._wireTriggered) {
            this._endMark('render');
        }
    }

    mergeTransactionAttributesWith(attributes = {}) {
        this._attributes = { ...this._attributes, ...attributes };
    }

    _startMark(markName, attributes = null) {
        if (this._inProgress) {
            markStart(this._transactionName, markName, attributes);
        }
    }

    _endMark(markName, attributes = null) {
        if (this._inProgress) {
            markEnd(this._transactionName, markName, attributes);
        }
    }
}

export function logError(attributes) {
    error(attributes);
}
