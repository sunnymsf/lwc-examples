import labelCurrentSelection from '@salesforce/label/LightningLookup.currentSelection';

import * as LookupUtils from './utils';
import { COMMON_LOOKUP_CONSTANTS } from './constants';

const i18n = {
    currentSelection: labelCurrentSelection,
};

const compareAlphabeticallyOn = (property) => (a, b) => {
    return a[property] < b[property] ? -1 : 1;
};

export const MetadataManagerUtils = {
    takeNameElementOrElseFirstElement: (acc = null, next) => {
        return acc === 'Name' ? acc : next;
    },

    computeNameField: (nameFields) =>
        nameFields.reduceRight(
            MetadataManagerUtils.takeNameElementOrElseFirstElement
        ),

    isEmptyObject: (obj) => {
        if (obj === undefined || obj === null) {
            return false;
        }

        // eslint-disable-next-line guard-for-in
        for (const name in obj) {
            return false;
        }
        return true;
    },

    getFirstReferencedTargetApiName: (referenceInfos) => {
        if (
            referenceInfos &&
            !MetadataManagerUtils.isEmptyObject(referenceInfos)
        ) {
            return Object.values(referenceInfos).sort(
                compareAlphabeticallyOn('label')
            )[0].apiName;
        }
        return undefined;
    },

    computeObjectInfoWithNameField: (objectInfos, reference) => {
        const nameFields = reference.nameFields;
        if (!Array.isArray(nameFields) || !nameFields.length) {
            return null;
        }

        const referenceApiName = reference.apiName;
        const objectInfo = MetadataManagerUtils.computeObjectInfo(
            objectInfos,
            referenceApiName
        );

        const computedNameField =
            MetadataManagerUtils.computeNameField(nameFields);
        return {
            ...objectInfo,
            nameField: computedNameField,
            optionalNameField: referenceApiName + '.' + computedNameField,
        };
    },

    computeObjectInfo: (objectInfos, objectApiName) => {
        if (!objectInfos || !objectApiName) {
            return {};
        }

        const objectInfo = objectInfos[objectApiName] || {};
        const themeInfo = objectInfo.themeInfo || {};

        return {
            apiName: objectApiName,
            color: themeInfo.color || '',
            iconAlternativeText: objectInfo.label,
            iconName: LookupUtils.getIconOf(objectInfo),
            iconUrl: themeInfo.iconUrl || '',
            keyPrefix: objectInfo.keyPrefix,
            label: objectInfo.label,
            labelPlural: objectInfo.labelPlural,
        };
    },

    /**
     * Computes a map of field info like isRequired, dependentFields, etc.
     * @param {Object} objectInfos - Source record's objectInfos.
     * @param {String} apiName - An api name.
     * @param {String} fieldApiName - The qualified field name.
     * @returns {Object} - A map of field infos.
     */
    computeFieldInfo: (objectInfos, apiName, fieldApiName) => {
        let computedFieldInfo = {};

        if (!objectInfos || !apiName || !fieldApiName) {
            return computedFieldInfo;
        }

        const fieldName =
            LookupUtils.computeUnqualifiedFieldApiName(fieldApiName);

        const fieldInfo = LookupUtils.getField(
            objectInfos,
            apiName,
            LookupUtils.computeUnqualifiedFieldApiName(fieldApiName)
        );

        if (fieldInfo) {
            computedFieldInfo = {
                // See https://sfdc.co/dependent-lookups for more information.
                dependentFields: fieldInfo.filteredLookupInfo
                    ? fieldInfo.filteredLookupInfo.controllingFields
                    : undefined,
                fieldName,
                inlineHelpText: fieldInfo.inlineHelpText,
                isRequired: fieldInfo.required,
                references: fieldInfo.referenceToInfos,
                relationshipName: fieldInfo.relationshipName,
            };
        }

        return computedFieldInfo;
    },

    computeQualifiedFieldApiName: (fieldName = '', sourceApiName = '') => {
        if (fieldName === null) {
            fieldName = '';
        }

        if (sourceApiName === null) {
            sourceApiName = '';
        }

        let apiName = '';

        if (typeof fieldName === 'string' && fieldName.length) {
            const idx = fieldName.indexOf('.');
            if (idx >= 1) {
                apiName = fieldName;
            }
        } else if (
            typeof fieldName === 'object' &&
            typeof fieldName.objectApiName === 'string' &&
            typeof fieldName.fieldApiName === 'string'
        ) {
            apiName = fieldName.objectApiName + '.' + fieldName.fieldApiName;
        }

        if (!apiName.length && fieldName.length && sourceApiName.length) {
            apiName = sourceApiName + '.' + fieldName;
        }

        return apiName;
    },

    /**
     * Computes a map of supported references apis with their infos like nameField, label, iconName etc.
     */
    computeReferenceInfos: (objectInfos = {}, referenceToInfos = []) => {
        if (objectInfos === null) {
            objectInfos = {};
        }

        if (referenceToInfos === null) {
            referenceToInfos = [];
        }

        const groupObjectInfoByApiName = (referenceToInfo) => ({
            name: referenceToInfo.apiName,
            objectInfo: MetadataManagerUtils.computeObjectInfoWithNameField(
                objectInfos,
                referenceToInfo
            ),
        });

        // eslint-disable-next-line no-confusing-arrow
        const collectReferenciesAndSkippedEntities = (acc, next) =>
            next.objectInfo
                ? {
                      references: {
                          ...acc.references,
                          [next.name]: next.objectInfo,
                      },
                      skippedEntities: acc.skippedEntities,
                  }
                : {
                      references: acc.references,
                      skippedEntities: [...acc.skippedEntities, next.name],
                  };

        const { references, skippedEntities } = referenceToInfos
            .map(groupObjectInfoByApiName)
            .reduce(collectReferenciesAndSkippedEntities, {
                references: {},
                skippedEntities: [],
            });

        return {
            references,
            skippedEntities,
            allEntitiesSkipped:
                skippedEntities.length === referenceToInfos.length,
        };
    },
};

export class MetadataManager {
    fieldApiName;
    fieldInfo;
    fieldLevelHelp;
    /**
     * The reference api infos for given field.
     * For example -
     * {
     *  'Opportunity': {
     *          apiName: 'Opportunity',
     *          color: 'FCB95B',
     *          iconAlternativeText: 'Opportunity',
     *          iconName: 'standard:opportunity',
     *          iconUrl: 'http://.../standard/foo.png',
     *          keyPrefix: '006',
     *          label: 'Opportunity',
     *          labelPlural: 'Opportunities',
     *          nameField: 'Name',
     *          optionalNameField: 'Opportunity.Name',
     *      },
     *  'Account': {..},
     *  ...
     * }
     * @type {Object}
     */
    referenceInfos = {};
    skippedEntities = [];
    allEntitiesSkipped;

    _sourceObjectInfo = {};
    _targetObjectInfo = {};

    get dependentFields() {
        return this.fieldInfo.dependentFields;
    }

    get isFieldRequired() {
        return this.fieldInfo.isRequired;
    }

    get isSingleEntity() {
        return Object.keys(this.referenceInfos || {}).length === 1;
    }

    get optionalNameFields() {
        let references = this.referenceInfos;
        if (references === null) {
            references = {};
        }

        const optionalNameFields = [];
        for (const reference in references) {
            if (
                // eslint-disable-next-line no-prototype-builtins
                references.hasOwnProperty(reference) &&
                // eslint-disable-next-line no-prototype-builtins
                references[reference].hasOwnProperty('optionalNameField')
            ) {
                optionalNameFields.push(
                    references[reference].optionalNameField
                );
            }
        }
        return optionalNameFields;
    }

    get sourceApiName() {
        return this._sourceObjectInfo.apiName;
    }

    get sourceEntityLabel() {
        return this._sourceObjectInfo.label;
    }

    get targetApiName() {
        return this._targetObjectInfo.apiName;
    }

    get targetApiKeyPrefix() {
        return this._targetObjectInfo.keyPrefix;
    }

    get targetLabel() {
        return this._targetObjectInfo.label || this.targetApiName;
    }

    get targetPluralLabel() {
        return this._targetObjectInfo.labelPlural;
    }

    constructor(fieldName, objectInfos, record, selectedEntityApiName) {
        if (
            !fieldName ||
            !Object.keys(record || {}).length ||
            !Object.keys(objectInfos || {}).length
        ) {
            return;
        }

        this._sourceObjectInfo = MetadataManagerUtils.computeObjectInfo(
            objectInfos,
            record.apiName
        );
        // Update field info.
        this.fieldApiName = MetadataManagerUtils.computeQualifiedFieldApiName(
            fieldName,
            this._sourceObjectInfo.apiName
        );

        this.fieldInfo = MetadataManagerUtils.computeFieldInfo(
            objectInfos,
            this._sourceObjectInfo.apiName,
            this.fieldApiName
        );

        this.fieldLevelHelp = this.fieldInfo.inlineHelpText;

        const computeReferenceInfosResult =
            MetadataManagerUtils.computeReferenceInfos(
                objectInfos,
                this.fieldInfo.references
            );

        this.referenceInfos = computeReferenceInfosResult.references;
        this.skippedEntities = computeReferenceInfosResult.skippedEntities;
        this.allEntitiesSkipped =
            computeReferenceInfosResult.allEntitiesSkipped;

        this._targetObjectInfo = MetadataManagerUtils.computeObjectInfo(
            objectInfos,
            selectedEntityApiName || this.getTargetApiName()
        );
    }

    getTargetObjectIconDetails() {
        return {
            iconAlternativeText: this._targetObjectInfo.iconAlternativeText,
            iconName: this._targetObjectInfo.iconName,
        };
    }

    getTargetObjectAsScope() {
        let objectInfo = this._targetObjectInfo || {};

        return {
            iconUrl: objectInfo.iconUrl,
            label: objectInfo.label,
            labelPlural: objectInfo.labelPlural,
            name: objectInfo.apiName,
        };
    }

    getTargetApiName() {
        return this.isTargetEntityEmptyOrStale()
            ? MetadataManagerUtils.getFirstReferencedTargetApiName(
                  this.referenceInfos
              )
            : this._targetObjectInfo.apiName;
    }

    getEntitiesLabelInfo() {
        return {
            sourceEntityLabel: this.sourceEntityLabel,
            targetEntityLabelPlural: this.targetPluralLabel,
            targetLabel: this.targetLabel,
        };
    }

    getNameField(apiName = this.targetApiName) {
        return (
            Object.prototype.hasOwnProperty.call(
                this.referenceInfos,
                apiName
            ) && this.referenceInfos[apiName].nameField
        );
    }

    getEntityOptions() {
        const references = this.referenceInfos || {};
        const chosenApi = this.targetApiName;
        const referenceApiNames = Object.keys(references);

        if (referenceApiNames.length <= 1) {
            return null;
        }

        const createEntityOptionForTargetApiName = (targetApiName) => {
            const item = {
                text: references[targetApiName].label || targetApiName,
                type: COMMON_LOOKUP_CONSTANTS.OPTION_TYPE_INLINE,
                value: targetApiName,
            };
            if (chosenApi && targetApiName === chosenApi) {
                item.highlight = true;
                item.iconAlternativeText = `${i18n.currentSelection}`;
            }
            item.iconSize = COMMON_LOOKUP_CONSTANTS.ICON_SIZE_X_SMALL;
            item.iconName = references[targetApiName].iconName;

            return item;
        };

        return referenceApiNames
            .map(createEntityOptionForTargetApiName)
            .sort(compareAlphabeticallyOn('text'));
    }

    isTargetEntityEmptyOrStale() {
        return (
            MetadataManagerUtils.isEmptyObject(this._targetObjectInfo) ||
            !Object.prototype.hasOwnProperty.call(
                this.referenceInfos,
                this._targetObjectInfo.apiName
            )
        );
    }
}
