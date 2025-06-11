import { recordSelectionSchema } from 'o11y_schema/sf_lookup';
import { getInstrumentation } from 'o11y/client';
import { InstrumentationObfuscators } from 'lightning/recordPickerCommon';
import crypto from './cryptoPolyfill';

const { obfuscateCustomObjectApiName } = InstrumentationObfuscators;
const LOGGER_NAME = 'Lookup';

function getLogger() {
    return getInstrumentation(LOGGER_NAME);
}

export class InstrumentationHandler {
    _componentInstanceId;
    _objectInfo;

    constructor() {
        this._componentInstanceId = crypto.randomUUID();
    }

    /**
     * @param {LightningRecordPickerCommonObjectInfoModel} objectInfo
     */
    setObjectInfo(objectInfo) {
        this._objectInfo = objectInfo;
    }

    logRecordSelection() {
        const logger = getLogger();
        const payload = {
            targetApiName: obfuscateCustomObjectApiName(
                this._objectInfo.apiName,
                this._objectInfo.isCustomEntity
            ),
            targetApiKeyPrefix: this._objectInfo.keyPrefix,
            componentInstanceId: this._componentInstanceId,
        };

        logger.log(recordSelectionSchema, payload);
    }
}
