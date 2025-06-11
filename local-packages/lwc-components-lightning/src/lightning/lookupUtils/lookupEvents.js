class LookupEventDispatcher {
    constructor(lookupComponent) {
        this.dispatchEvent =
            lookupComponent.dispatchEvent.bind(lookupComponent);
    }

    dispatchChangeEvent(value) {
        this.dispatchEvent(createChangeEvent(value));
    }

    dispatchErrorEvent(error) {
        this.dispatchEvent(createErrorEvent(error));
    }

    dispatchCreateEvent(value, callback) {
        this.dispatchEvent(createCreateNewEvent(value, callback));
    }

    dispatchEntityOptionSelect(value) {
        this.dispatchEvent(createEntityOptionSelectEvent(value));
    }

    dispatchLookupRecordsRequestEvent(requestParams, shouldLoadMore) {
        this.dispatchEvent(
            // eslint-disable-next-line no-use-before-define
            new LookupRecordsRequestEvent(requestParams, shouldLoadMore)
        );
    }

    dispatchPillRemoveEvent(removedValue) {
        this.dispatchEvent(createPillRemoveEvent(removedValue));
    }

    dispatchRecordItemSelectEvent(selectedValue) {
        this.dispatchEvent(createRecordItemSelectEvent(selectedValue));
    }

    dispatchAdvancedLookupOptionSelectEvent() {
        this.dispatchEvent(createAdvancedLookupOptionSelectEvent());
    }

    dispatchAdvancedLookupRecordSelection(selectedRecord) {
        this.dispatchEvent(
            createAdvancedLookupRecordSelectionEvent(selectedRecord)
        );
    }
}

function createChangeEvent(value) {
    return new CustomEvent('change', {
        bubbles: true,
        composed: true,
        detail: { value },
    });
}

function createErrorEvent(error) {
    // eslint-disable-next-line lightning-global/no-custom-event-bubbling
    return new CustomEvent('error', {
        bubbles: true,
        composed: true,
        detail: { error },
    });
}

/**
 * @param {String} value - apiName of the entity for which to create new
 * @param {Function} callback - function to be called after a new record is created
 */
function createCreateNewEvent(value, callback) {
    // eslint-disable-next-line lightning-global/no-custom-event-bubbling
    return new CustomEvent('createnew', {
        bubbles: true,
        composed: true,
        detail: { value, callback },
    });
}

function createEntityOptionSelectEvent(value) {
    // eslint-disable-next-line lightning-global/no-custom-event-bubbling
    return new CustomEvent('entityoptionselect', {
        bubbles: true,
        composed: true,
        detail: { value },
    });
}

/**
 * @param {String} removedValue - the value of the pill removed from the input.
 */
function createPillRemoveEvent(removedValue) {
    return new CustomEvent('pillremove', {
        detail: { removedValue },
    });
}

/**
 * @param {String} selectedValue - the value selected from the selection panel.
 */
function createRecordItemSelectEvent(selectedValue) {
    return new CustomEvent('recorditemselect', {
        detail: { selectedValue },
    });
}

function createAdvancedLookupOptionSelectEvent() {
    return new CustomEvent('advancedlookupoptionselect');
}

function createAdvancedLookupRecordSelectionEvent(selectedRecord) {
    return new CustomEvent('recordselected', {
        detail: { selectedRecord: selectedRecord },
    });
}

class LookupActionsDataRetrievedEvent extends CustomEvent {
    constructor(actionsMetadata) {
        super('dataretrieved', {
            detail: actionsMetadata,
        });
    }
}

class LookupActionsErrorEvent extends CustomEvent {
    constructor(message) {
        super('error', {
            detail: { message },
        });
    }
}

class DataSourceRecordsRetrieveEvent extends CustomEvent {
    constructor(records, hasNextPage) {
        super('recordsretrieve', {
            detail: { value: records, hasNextPage },
        });
    }
}

class LookupMetadataRetrieveEvent extends CustomEvent {
    constructor(metadata) {
        super('metadataretrieve', {
            detail: { value: metadata },
        });
    }
}

class LookupRecordsRequestEvent extends CustomEvent {
    /**
     * @param {key, value} requestParams - the request parameters to send to parent
     * @param {Boolean} shouldLoadMore - if true lazy load more records with current request params
     */
    constructor(requestParams, shouldLoadMore) {
        super('lookuprecordsrequest', {
            detail: { requestParams, shouldLoadMore },
        });
    }
}

class DataSourceErrorEvent extends CustomEvent {
    constructor(message) {
        super('error', {
            detail: { message },
        });
    }
}

class DataSourceLoadStartEvent extends CustomEvent {
    constructor() {
        super('dataloadstart');
    }
}

export {
    LookupEventDispatcher,
    LookupActionsDataRetrievedEvent,
    LookupActionsErrorEvent,
    DataSourceRecordsRetrieveEvent,
    DataSourceErrorEvent,
    DataSourceLoadStartEvent,
    LookupMetadataRetrieveEvent,
    LookupRecordsRequestEvent,
};
