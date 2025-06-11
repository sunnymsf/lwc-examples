import { Observable } from 'lightning/utilsPrivate';
import { RecordInputRepresentationConverter } from './recordInputRepresentationConverter';

export default class ObjectInfosAndRecordState {
    constructor() {
        this._stateObservable = new Observable();
    }

    onRecordConverted(callback) {
        this._stateObservable.subscribe(callback);
    }

    _record;
    _objectInfos;
    _recordInputRepresentationConverter;

    setRecord(value) {
        this._record = value;

        if (!this._record) {
            return;
        }

        if (this._objectInfos) {
            this._notify(this._convertRecord(this._record));
        }
    }

    setObjectInfos(value) {
        this._objectInfos = value;

        if (!this._objectInfos) {
            return;
        }

        if (this._record) {
            this._notify(this._convertRecord(this._record));
        }
    }

    _notify(recordInputRepresentation) {
        this._stateObservable.notify(recordInputRepresentation);
    }

    _convertRecord(record) {
        return this._getConverterInstance().convert(record);
    }

    _getConverterInstance() {
        // perf optimization: initialize _recordInputRepresentationConverter only once
        // to avoid perf impact (if executed frequently) of RecordInputRepresentationConverter constructor considering objectInfos can have significant payloads.
        if (!this._recordInputRepresentationConverter) {
            this._recordInputRepresentationConverter =
                new RecordInputRepresentationConverter(
                    this._objectInfos[this._record.apiName]
                );
        }
        return this._recordInputRepresentationConverter;
    }
}
