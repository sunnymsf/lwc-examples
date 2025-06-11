class RecordInputRepresentationConverter {
    /**
     * The constructor is costly since it runs filtering on objectInfos. Should be initialized only once for the same "objectInfo".
     * @param {*} objectInfo
     */
    constructor(objectInfo) {
        if (!objectInfo) {
            throw new Error('Missing `objectInfo`');
        }
        this.relationshipFields = Object.values(objectInfo.fields)
            .filter((field) => field.relationshipName)
            .reduce((acc, field) => {
                acc[field.relationshipName] = true;
                return acc;
            }, {});
    }

    /**
     * Converts a record representation to a record input representation.
     * A record input representation `fields` attribute only contains non-relationship fields,
     * and the fields' value don't have the {value, displayValue} shape, eg:
     * fields : {
     *    "CaseNumber": "123456" // vs {value: 123456", displayValue: null} in the related record representation
     * }
     * @param {Object} record
     * @returns {Object}
     */
    convert(record) {
        // eslint-disable-next-line no-unused-vars
        const nonRelationshipFields = ([fieldName, fieldValue]) =>
            !this.relationshipFields[fieldName];

        const recordFields = Object.entries(record.fields)
            .filter(nonRelationshipFields)
            .reduce((acc, [fieldName, fieldValue]) => {
                acc[fieldName] = fieldValue.value;
                return acc;
            }, {});

        return {
            apiName: record.apiName,
            fields: {
                Id: record.id ?? null,
                RecordTypeId: record.recordTypeId,
                ...recordFields,
            },
        };
    }
}

export { RecordInputRepresentationConverter };
