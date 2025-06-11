import { Observable } from 'lightning/utilsPrivate';
import { Reactive } from 'lightning/recordPickerCommon';
import { StateManager } from 'lightning/recordPickerCommon';
const { combine } = Reactive;

export default class LookupResultsState {
    _lookupMetadataObservable = new Observable();
    _recordsObservable = new Observable();
    _resultsObservable = combine(
        'initialResults',
        this._lookupMetadataObservable,
        this._recordsObservable
    );

    _iconInfoObservable = new Observable();
    _enabledActionsObservable = new Observable();

    _stateManager;
    constructor() {
        this._stateManager = new StateManager();

        this._resultsObservable.subscribe(
            ({ initialResults: { lookupMetadata, records, hasNextPage } }) => {
                this._stateManager.state = {
                    ...this._stateManager.state,
                    lookupMetadata,
                    records,
                    hasNextPage,
                };
            }
        );

        combine(
            'resultsWithThemeInfo',
            this._resultsObservable,
            this._iconInfoObservable
        ).subscribe(
            ({ resultsWithThemeInfo: { iconInfo, initialResults } }) => {
                this._stateManager.state = {
                    ...this._stateManager.state,
                    iconInfo,
                    ...initialResults,
                };
            }
        );

        combine(
            'resultsWithEnabledActions',
            this._resultsObservable,
            this._enabledActionsObservable
        ).subscribe(
            ({
                resultsWithEnabledActions: { enabledActions, initialResults },
            }) => {
                this._stateManager.state = {
                    ...this._stateManager.state,
                    enabledActions,
                    ...initialResults,
                };
            }
        );
    }

    onReady(callback) {
        this._stateManager.subscribe((results) => {
            return callback(results);
        });
    }

    getLookupMetadata() {
        return this._stateManager.state.lookupMetadata;
    }

    setLookupMetadata(metadata) {
        this._lookupMetadataObservable.notify({ lookupMetadata: metadata });
    }

    setRecords(records, hasNextPage = false) {
        this._recordsObservable.notify({ records, hasNextPage });
    }

    setIconInfo(iconInfo) {
        this._iconInfoObservable.notify({ iconInfo });
    }

    setLookupEnabledActions(enabledActions) {
        this._enabledActionsObservable.notify({ enabledActions });
    }
}
