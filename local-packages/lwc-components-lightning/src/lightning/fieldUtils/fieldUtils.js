import {
    FieldTypes,
    LocalizedFieldTypes,
    DensityValues,
    LabelAlignValues,
    DensityLabelAlignMapping,
    BLOCKLIST_ENTITY_FIELDS,
} from './constants';

export const Fields = FieldTypes;

export const ENTITY_BLOCKLIST = BLOCKLIST_ENTITY_FIELDS;

export const UNSUPPORTED_REFERENCE_FIELDS = [
    'OwnerId',
    'CreatedById',
    'LastModifiedById',
];

/**
 * Determine if Entity and Field name combos are blocklisted
 * @param {String} objectApiName the objectApiName to check
 * @param {String} fieldName the fieldName to check
 * @returns {Boolean} true, if is blocklisted field. false, by default
 */
export function isBlocklistedField(objectApiName, fieldName) {
    if (objectApiName && fieldName) {
        const blocklistedEntity = ENTITY_BLOCKLIST[objectApiName];
        if (blocklistedEntity) {
            return blocklistedEntity.indexOf(fieldName) > -1;
        }
    }
    // cannot evaluate if is blocklisted field
    return false;
}

export const labelAlignValues = LabelAlignValues;

export const densityValues = DensityValues;

export const densityLabelAlignMapping = DensityLabelAlignMapping;

/**
 * Whether the give field type should be localized
 */
function isLocalizedFieldType(type) {
    return LocalizedFieldTypes.includes(type);
}

const getCompoundFieldData = (field, record, fieldInfo, objectInfo) => {
    if (FieldTypes.LOCATION === fieldInfo.dataType) {
        const prefix = field.slice(0, field.indexOf('__c'));
        const longitude = record.fields[prefix + '__Longitude__s'].value;
        const latitude = record.fields[prefix + '__Latitude__s'].value;

        return { value: { longitude, latitude } };
    }

    // fields with no value, it must be derived from the constituant fields
    const compoundFields = getCompoundFields(field, record, objectInfo);
    const ret = { value: {}, displayValue: {} };
    compoundFields.forEach((childField) => {
        if (record.fields[childField]) {
            if (isLocalizedFieldType(objectInfo.fields[childField].dataType)) {
                ret.displayValue[childField] =
                    record.fields[childField].displayValue;
            }

            ret.value[childField] = record.fields[childField].value;
        }
    });

    return ret;
};

/**
 * Given a record will determine if it is a PersonAccount or not
 * @param {Object} record the record to check
 *
 * @returns {boolean} true if the record is a personAccount
 */
export function isPersonAccount(record) {
    if (record.apiName !== 'Account' && record.apiName !== 'PersonAccount') {
        return false;
    }

    return record.fields.IsPersonAccount
        ? record.fields.IsPersonAccount.value
        : false;
}

/**
 * Finds the fields needed to complete the given relationships that are missing
 * from the record
 * @param {object} record Record object with the fields
 * @param {object} relationships Map of reference field names to an object
 *                          containing the name of the relationship field
 *                          and a list of nameFields
 * @return {array} A list of fields that are missing
 */
export function getMissingRelationshipFields(record, relationships) {
    const incompleteFields = Object.keys(relationships).filter(
        (key) => !record.fields[relationships[key].name]
    );

    // Map each incomplete field to an array of its qualified name fields,
    // then concat them into a single array of all the field names
    return Array.prototype.concat.apply(
        [],
        incompleteFields.map((key) =>
            relationships[key].nameFields.map(
                (nameField) => relationships[key].name + '.' + nameField
            )
        )
    );
}

/**
 * Finds all reference relationships in the given objectInfo
 * @param {array} fields A list of unqualified field names
 * @param {object} objectInfo An objectInfo object
 * @return {object} A mapping of reference fields to an object containing
 *                  the name of the relationship field and a list of nameFields
 */
export function getReferenceRelationships(fields, objectInfo) {
    return fields
        .filter(
            (field) =>
                objectInfo.fields[field] && objectInfo.fields[field].reference
        )
        .reduce((relationships, field) => {
            const fieldInfo = objectInfo.fields[field];
            relationships[field] = {
                name: fieldInfo.relationshipName,
                nameFields: fieldInfo.referenceToInfos[0]
                    ? fieldInfo.referenceToInfos[0].nameFields
                    : [],
            };
            return relationships;
        }, {});
}
/**
/**
 *
 * @param {string} field the field identifier (SOQL syntax)
 * @param {object} record the record
 * @param {object} objectInfo a single object info defining the field
 * @param {boolean} ignoreRecord boolean determining whether to use record check
 * @return {array} a list of constituent fields
 */
export function getCompoundFields(field, record, objectInfo, ignoreRecord) {
    return Object.keys(objectInfo.fields).filter((key) => {
        // TODO: Determine if we ever need to check record or if we can always ignore
        return (
            key !== field &&
            (record.fields[key] || ignoreRecord) &&
            objectInfo.fields[key].compoundFieldName === field
        );
    });
}

function getReferenceInfo(record, fieldInfo) {
    const relationshipName = fieldInfo.relationshipName;
    // TODO: handle multiple referenceToInfos
    const relationshipNameFields = fieldInfo.referenceToInfos[0].nameFields;
    const relationship = record.fields[relationshipName];

    // recordEditForm does not include relationship info when the field isn't included in the page layout.
    // Fall back to the value from the record fields instead.
    const isMissingRelationshipInfo = !relationship || !relationship.value;
    const idField = record.fields[fieldInfo.apiName];
    if (isMissingRelationshipInfo) {
        return {
            referenceId: idField.value,
            displayValue: idField.displayValue,
        };
    }

    // External non-Salesforce Object.
    // Because users are editing the ID as a plain text field based on the object in the remote data source,
    // we need to expose and operate on that ID rather than the internal ID assigned by the local org.
    if (
        fieldInfo.dataType === 'Reference' &&
        fieldInfo.extraTypeInfo === 'ExternalLookup' &&
        relationshipNameFields.indexOf('ExternalId') !== -1
    ) {
        // `referenceId` will be the unique identifier for the record set by the OData source.
        // But because it's not a Salesforce object, the `displayValue` will ALSO contain the same value,
        // just gotten from a different place in the object. We assign these from their respective locations
        // in case we ever update `displayValue` to be the human-readable value instead.
        return {
            referenceId: relationship.value.fields.ExternalId.value,
            displayValue: relationship.displayValue,
        };
    }

    // TODO: Should references support localized fields and thus return a value to complement their displayValue?
    const referenceField = relationship.value.fields;
    const displayValue =
        relationship.displayValue ||
        relationshipNameFields
            .reduce((acc, nameField) => {
                const thisField = referenceField[nameField];
                if (thisField) {
                    return acc + ' ' + thisField.value;
                }
                return acc;
            }, '')
            .trim();
    const referenceId = referenceField.Id?.value || idField.value;
    return {
        referenceId,
        displayValue,
    };
}

/**
 * Get a UiField from a field on a record.
 * objectInfo and objectInfos are optional but at least one must be present
 * @param {string} field the field identifier (SOQL syntax)
 * @param {object} record the record
 * @param {object} objectInfo a single object info defining the field
 * @return {array} a UiField representing the field.
 */
export const getUiField = (field, record, objectInfo) => {
    const fieldInfo = objectInfo.fields[field];
    if (!fieldInfo) {
        throw new Error(`Field [${field}] was not found`);
    }

    // TODO - handle formatting
    // ui sdk formats these field types: currency, date, datetime, time (/ui-services-api/java/src/ui/services/api/soql/FormatFunctionHelper.java
    // ui sdk localizes based on com.force.util.soql.functions.SoqlFunctions.fieldSupportsToLabel(String, String)
    // thomas will expose this in objectInfo but until then i can pivot on that logic
    // - if [currency date datetime time] use value
    // - else if diplayValue is present use it
    // - else use value
    let result = { type: fieldInfo.dataType };

    Object.assign(result, fieldInfo);

    const personAccount = isPersonAccount(record);

    if (fieldInfo.reference) {
        const referenceInfo = getReferenceInfo(record, fieldInfo);

        result.value = referenceInfo.referenceId;
        result.displayValue = referenceInfo.displayValue;
    } else if (isCompoundField(field, objectInfo, personAccount)) {
        const fieldData = getCompoundFieldData(
            field,
            record,
            fieldInfo,
            objectInfo
        );
        Object.assign(result, fieldData);
    } else {
        result.value = record.fields[field] && record.fields[field].value;

        // provide the display value for localizable field types
        if (isLocalizedFieldType(fieldInfo.dataType)) {
            result.displayValue = record.fields[field].displayValue;
        }
    }

    return result;
};

export const getUiFields = (fields, record, objectInfos) => {
    const fieldValues = fields.map((field) =>
        getUiField(field, record, objectInfos)
    );
    return fieldValues;
};

/**
 * Determine if any field in a list of fields
 * is updateable
 * @param {array} fields list of constituent fields
 * @param {object} record the record
 * @param {object} objectInfo object info
 *
 * @returns {Boolean} true if any of the fields are updateable, otherwise false
 */
export function compoundFieldIsUpdateable(fields, record, objectInfo) {
    return fieldAttributesTruthy('updateable', fields, objectInfo);
}

/**
 * Determine if any field in a list of fields
 * is createable
 * @param {array} fields list of constituent fields
 * @param {object} record the record
 * @param {object} objectInfo object info
 *
 * @returns {Boolean} true if any of the fields are updateable, otherwise false
 */
export function compoundFieldIsCreateable(fields, record, objectInfo) {
    return fieldAttributesTruthy('createable', fields, objectInfo);
}

/**
 * Checks is the attribute in a list of fields is truthy for all
 * fields
 * @param {String} attribute The attribute to check
 * @param {Array} fields List of fields to check
 * @param {Object} objectInfo ObjectInfo to check in
 *
 * @returns {Boolean} true if any of the fields are truthy, false otherwise
 */
function fieldAttributesTruthy(attribute, fields, objectInfo) {
    for (let i = 0; i < fields.length; i++) {
        if (!objectInfo.fields[fields[i]]) {
            throw new Error(`Constituent field "${fields[i]}" does not exist`);
        }
        if (objectInfo.fields[fields[i]][attribute]) {
            return true;
        }
    }
    return false;
}

/**
 *
 * Determines if a field actually has contituent fields,
 * because some fields might identify themselves as compound
 * but without constituent fields we can't treat them as compound
 *
 * @param {string} field the field identifier (SOQL syntax)
 * @param {object} objectInfo a single object info defining the field
 * @param {boolean} personAccount if this object is a PersonAccount (Name is compound)
 *                                  https://help.salesforce.com/articleView?id=account_person.htm&type=5
 * @returns {boolean} true if the field is a compound field, false if it is not
 */
export function isCompoundField(field, objectInfo, personAccount = false) {
    const fieldInfo = objectInfo.fields[field];
    if (!fieldInfo) {
        // a field that does not exist is not compound
        // this is safety to prevent gacks and probably should not generally happen
        return false;
    }

    if (fieldInfo.compound === false) {
        return false;
    }

    const keys = Object.keys(objectInfo.fields);
    for (let i = 0; i < keys.length; i++) {
        if (
            keys[i] !== field &&
            objectInfo.fields[keys[i]].compoundFieldName === field
        ) {
            // special case for when person accounts are enabled, but this is not a personAccount. In this case
            // the Name field of an account looks like a compound field but is not.
            if (
                objectInfo.apiName === 'Account' &&
                objectInfo.fields[keys[i]].compoundFieldName === 'Name' &&
                !personAccount
            ) {
                return false;
            }

            return true;
        }
    }

    return false;
}

/**
 * Normalize the given error object.
 * @param  {Error | Object} err This could be a javascript Error or an error emitted from LDS (ErrorResponse).
 * @return {Object} An object with a string message and a string detail
 */
export function parseError(err) {
    let message = '',
        output = {},
        detail = '';

    if (err) {
        if (err.body && err.body.output) {
            // ErrorResponse with Record Output Error
            // https://developer.salesforce.com/docs/atlas.en-us.uiapi.meta/uiapi/ui_api_responses_error_with_output.htm
            message = err.body.message;

            if (err.body.output.errors.length > 0) {
                detail = err.body.output.errors[0].message;
            }

            // output is part of the recordUi error response,
            // so we will include it.
            output = JSON.parse(JSON.stringify(err.body.output));
        } else if (Array.isArray(err.body) && err.body.length > 0) {
            // ErrorResponse with normal UIAPI error.
            message = err.body[0].message;
            detail = err.body[0].errorCode;
        } else if (err.body && err.body.message) {
            // ErrorResponse with body that has a message.
            message = err.body.message;
        } else if (err.body && err.body.error) {
            // LDS Error
            message = err.body.error;
        } else if (err.body) {
            // ErrorResponse with unknown body.
            message = err.body;
        } else if (err.statusText) {
            // ErrorResponse with no body.
            message.err = err.statusText;
        } else if (err.message) {
            // Vanilla js error.
            message = err.message;
        } else {
            // Unknown error.
            message = err;
        }
    }

    return { message, detail, output };
}

export function createErrorEvent(err) {
    const parsed = parseError(err);
    return new CustomEvent('error', {
        detail: parsed,
    });
}

/**
 * Creates a list of fully qualified
 * fieldnames with no duplicats
 */
class FieldSet {
    /**
     *
     * @param {String} objectApiName The object name
     */
    constructor(objectApiName) {
        this._set = new Set();
        if (typeof objectApiName !== 'string') {
            throw new Error('objectApiName must be a string');
        }
        this._apiName = objectApiName;
    }

    set objectApiName(objectApiName) {
        if (typeof objectApiName !== 'string') {
            throw new Error('objectApiName must be a string');
        }
        this._apiName = objectApiName;
    }

    /**
     * Add a single field
     * @param {String} val unqualified field name
     */
    add(val) {
        this._set.add(val);
    }

    /**
     * Add a list of fieldnames
     * @param {Array} arr Array of unqualified field names
     */
    concat(arr) {
        arr.forEach((item) => {
            this.add(item);
        });
    }

    // using a method here rather than a getter
    // because this seemed clearer

    /**
     * @returns {Array} a list of fully qualified field names
     */
    getList() {
        const apiName = this._apiName;
        return [...this._set].map((field) => {
            return `${apiName}.${field}`;
        });
    }

    /**
     * @returns {Array} a list of unqualified field names
     */
    getUnqualifiedList() {
        return [...this._set];
    }
}

/**
 * Convenience function because you can't use
 * Set() in aura directly, also this
 * puts the "qualification" of fields in one place
 *
 * @param {String} objectApiName An object api name (entity name) to qualify fields
 * @returns {FieldSet} Field set has one method: add() to add a fieldname and one attribute list,
 *                     which you can use to get the qualified list of api names (an array)
 */
export function getFieldSet(objectApiName) {
    return new FieldSet(objectApiName);
}

/**
 *
 * Converts a Salesforce layout response into a list of fields.
 *
 * Rolls compound field constituents up to parent
 * https://developer.salesforce.com/docs/atlas.en-us.uiapi.meta/uiapi/ui_api_responses_record_layout.htm#ui_api_responses_record_layout
 * @param {Object} record the record response
 * @param {String} apiName An object api name (entity name)
 * @param {String} layoutType The layout type for the record
 * @returns {Map} a map of field names to their layout labels.
 */
export function getFieldsForLayout(record, apiName, layoutType) {
    let layoutData = record.layout;
    if (record.layouts) {
        layoutData = extractLayoutFromLayouts(
            record.layouts,
            apiName,
            layoutType || 'Full' // fallback to 'Full' since that is the default layout
        );
    }
    if (layoutData) {
        const fieldsFromLayout = getFieldsFromLayoutResponse(
            layoutData,
            record.objectInfos[apiName]
        );

        if (Array.isArray(fieldsFromLayout)) {
            return fieldsFromLayout.reduce((seed, field) => {
                seed[field.fieldName] = {
                    label: field.fieldLabel,
                };
                return seed;
            }, {});
        }
    }
    return {};
}

function extractLayoutFromLayouts(layouts, apiName, layout) {
    const entityLayout = layouts && layouts[apiName];
    if (!entityLayout) {
        return null;
    }

    const layoutId = Object.keys(entityLayout)[0];
    if (layoutId && entityLayout[layoutId] && entityLayout[layoutId][layout]) {
        if (entityLayout[layoutId][layout].View) {
            return entityLayout[layoutId][layout].View;
        }
        if (entityLayout[layoutId][layout].Edit) {
            return entityLayout[layoutId][layout].Edit;
        }
    }
    return null;
}

function getFieldsFromLayoutResponse(layout, objectInfo) {
    const processedFieldNames = {};

    const fieldsAccumulator = (
        listToReduce,
        fieldsGetterFn,
        optionalValues
    ) => {
        return listToReduce.reduce((fields, item) => {
            return fields.concat(fieldsGetterFn(item, optionalValues));
        }, []);
    };

    const getFieldsFromLayoutComponent = (
        layoutComponent,
        [pageLayoutLabel, lookupIdApiName]
    ) => {
        // normalize compound fields, de-dupe (dupes are just caused by compound fields)
        // this assumes that layoutItems only ever have more than one component if they are
        // a compound field
        let fieldName = layoutComponent.apiName;
        const fieldInfo = objectInfo.fields[layoutComponent.apiName];

        // checking for fieldInfo filters out layout items that aren't fields
        if (fieldInfo && fieldInfo.compoundFieldName) {
            fieldName = fieldInfo.compoundFieldName;
        }
        if (fieldInfo && !processedFieldNames[fieldName]) {
            processedFieldNames[fieldName] = true;
            const isCompound =
                fieldInfo.compound || fieldInfo.compoundFieldName !== null;
            const isLookupOrNotLookup =
                lookupIdApiName === null || lookupIdApiName === fieldName;
            return {
                fieldName,
                // The label could have a page layout override which should be used,
                // taking into account if it's a lookup or compound field.
                fieldLabel:
                    (isLookupOrNotLookup || isCompound) && pageLayoutLabel
                        ? pageLayoutLabel
                        : layoutComponent.label,
            };
        }
        return []; // empty array so concat adds nothing
    };
    const getFieldsFromItem = (item) => {
        return fieldsAccumulator(
            item.layoutComponents,
            getFieldsFromLayoutComponent,
            [item.label, item.lookupIdApiName]
        );
    };
    const getFieldsFromRow = (row) =>
        fieldsAccumulator(row.layoutItems, getFieldsFromItem);
    const getFieldsFromSection = (section) =>
        fieldsAccumulator(section.layoutRows, getFieldsFromRow);
    const getFieldsFromSections = (sections) =>
        fieldsAccumulator(sections, getFieldsFromSection);
    return getFieldsFromSections(layout.sections);
}

/**
 *
 * Given a field will determine if it is a Person Name field (when PersonAccount is enabled)
 *
 * @param {Object} field field of record
 * @returns {boolean} true if the record is a personAccount
 */
export function isPersonNameField(field) {
    return (
        field &&
        (Fields.PERSON_NAME === field.extraTypeInfo ||
            Fields.SWITCHABLE_PERSON_NAME === field.extraTypeInfo)
    );
}

function isTypeUnsupportedReference(fieldName) {
    return UNSUPPORTED_REFERENCE_FIELDS.indexOf(fieldName) !== -1;
}

export function isTypeReference(fieldName, uiField) {
    if (isTypeUnsupportedReference(fieldName)) {
        return false;
    }

    return Fields.REFERENCE === uiField.type;
}

export function isTypeReferenceWithLightningLookupSupported(
    fieldName,
    uiField
) {
    return (
        isTypeReference(fieldName, uiField) &&
        // No extra type info indicates this is a reference to a local Salesforce object.
        (uiField.extraTypeInfo === null ||
            // Or, "ExternalLookup" but no externalId indicates this is a cross-org Salesforce object.
            (uiField.extraTypeInfo === 'ExternalLookup' &&
                !hasReferenceToExternalIdField(uiField)))
    );
}

export function isTypeReferenceWithLightningLookupUnsupported(
    fieldName,
    uiField
) {
    return (
        isTypeReference(fieldName, uiField) &&
        hasReferenceToExternalIdField(uiField)
    );
}

function hasReferenceToExternalIdField(uiField) {
    // Safety: Validate the data structure is shaped the way we expect.
    const isSafeToAccess =
        uiField &&
        Array.isArray(uiField.referenceToInfos) &&
        uiField.referenceToInfos.length > 0 &&
        uiField.referenceToInfos[0] &&
        Array.isArray(uiField.referenceToInfos[0].nameFields);

    if (!isSafeToAccess) {
        return false;
    }

    // Logic: The presence of the name field "ExternalId" indicates this is
    // an non-Salesforce external object, presumably from an OData source.
    return uiField.referenceToInfos[0].nameFields.indexOf('ExternalId') !== -1;
}

/**
 * For OData External Lookup, the value needs to be the ID in the current org
 * rather than the external ID or we can't create a clickable link to the item.
 */
export function getInternalIdForExternalObject(recordFields, uiField) {
    // Safety: Validate the data structure is shaped the way we expect.
    // It is valid for the value to be null, indicating there isn't a value
    // and then just getting the ID property directly will crash. (@W-8736312)
    const isSafeToAccess =
        uiField &&
        uiField.relationshipName &&
        recordFields &&
        recordFields[uiField.relationshipName] &&
        recordFields[uiField.relationshipName].value;

    if (isSafeToAccess) {
        return recordFields[uiField.relationshipName].value.id;
    }

    return null;
}

/**
 * Get the fieldError for the given fieldName. For each field error, if the error key matches the fieldName,
 * it is the non-compound field error. If it doesn't match, then check the "constituentField" field inside the
 * error object, if it matches, it's the compound field error to be returned.
 * For more details: https://developer.salesforce.com/docs/atlas.en-us.uiapi.meta/uiapi/ui_api_responses_record_exception_error.htm
 * @param  {Object} The fieldErrors which contain errors for multiple fields.
 * @param  {String} A field name.
 * @return {Object} A fieldError for the given fieldName
 */
export function getFieldError(fieldErrors, fieldName) {
    let fieldError;
    let fieldErrorsNames = Object.keys(fieldErrors);
    for (let i = 0; i < fieldErrorsNames.length; i++) {
        let fieldErrorsName = fieldErrorsNames[i];
        if (fieldErrorsName === fieldName) {
            // Non-compound field error
            fieldError = fieldErrors[fieldErrorsName][0];
            break;
        }
        // If the fieldErrorsName doesn't match the given fieldName
        // need to look up the inside error array and check if the
        // constituentField matches the given fieldName.
        for (let j = 0; j < fieldErrors[fieldErrorsName].length; j++) {
            // Check if the field is a constituent of a compound field
            if (
                fieldErrors[fieldErrorsName][j].constituentField === fieldName
            ) {
                fieldError = fieldErrors[fieldErrorsName][j];
                break;
            }
        }
        // If the fieldError for the given fieldName is found, break from the outer loop
        if (fieldError) {
            break;
        }
    }
    return fieldError;
}

/**
 * Find the fields that are missing in the given record
 * @param {Object} objectInfo - Object info
 * @param {Object} record - Record data
 * @param {string[]} fields - List of field names
 * @returns The list of fields that's missing in the given record
 */
export function getMissingFields(objectInfo, record, fields) {
    const personAccount = isPersonAccount(record);
    let missingCompoundFields = [];
    let missingFields = fields.filter((fieldName) => {
        // if field name is not found in object info, it is probably a bad name, so ignore it
        const fieldData = objectInfo.fields[fieldName];
        if (!fieldData) {
            return false;
        }
        // since getRecord does not automatically return constituent fields
        // like getRecordUi, we need to manually add them to the missingFields list
        // if no constituent fields found, we treat as a non-compound field
        if (isCompoundField(fieldName, objectInfo, personAccount)) {
            const compoundFields = getCompoundFields(
                fieldName,
                record,
                objectInfo,
                true
            );
            missingCompoundFields = missingCompoundFields.concat(
                compoundFields.filter((constituentField) => {
                    return !record.fields[constituentField];
                })
            );
            return !compoundFields.length;
        }
        return !record.fields[fieldName];
    });

    // Get the missing relationship fields
    // These fields may be missing if they have been removed from the page layout
    // but need to be rendered as part of record*form
    const relationships = getReferenceRelationships(fields, objectInfo);
    const missingRelationshipFields = getMissingRelationshipFields(
        record,
        relationships
    );

    missingFields = missingFields.concat(
        missingRelationshipFields,
        missingCompoundFields
    );

    return missingFields;
}
