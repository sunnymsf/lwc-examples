import labelAdvancedSearchMobile from '@salesforce/label/LightningLookup.advancedSearchMobile';
import labelMessageWhenBadInputDefault from '@salesforce/label/LightningLookup.messageWhenBadInputDefault';
import labelMruHeader from '@salesforce/label/LightningLookup.recentObject';
import labelMruHeaderMobile from '@salesforce/label/LightningLookup.recentItems';
import labelSearchObjectsPlaceholder from '@salesforce/label/LightningLookup.searchObjectsPlaceholder';
import labelFullSearchResultsMobile from '@salesforce/label/LightningLookup.resultsListHeaderMobile';
import labelTypeaheadResultsMobile from '@salesforce/label/LightningLookup.typeaheadResultsListHeaderMobile';
import labelSearchPlaceholder from '@salesforce/label/LightningLookup.searchPlaceholder';
import { parseError } from 'lightning/fieldUtils';
import labelAdd from '@salesforce/label/LightningLookup.add';
import labelCreateNew from '@salesforce/label/LightningLookup.createNewObject';
import { ACTION_CREATE_NEW } from './constants';
import {
    COMMON_LOOKUP_CONSTANTS,
    GET_LOOKUP_RECORDS_WIRE_CONSTANTS,
} from './constants';
import labelSearch from '@salesforce/label/LightningLookup.search';

const EXTERNAL_ENTITY_REGEXP = /__x$/;

const i18n = {
    add: labelAdd,
    advancedSearchMobile: labelAdvancedSearchMobile,
    createNew: labelCreateNew,
    fullSearchResultsHeader: labelFullSearchResultsMobile,
    mruHeader: labelMruHeader,
    mruHeaderMobile: labelMruHeaderMobile,
    messageWhenBadInputDefault: labelMessageWhenBadInputDefault,
    searchObjectsPlaceholder: labelSearchObjectsPlaceholder,
    searchPlaceholder: labelSearchPlaceholder,
    search: labelSearch,
    typeaheadResultsHeader: labelTypeaheadResultsMobile,
};

/**
 * Compares given array to check if they have identical (string) elements
 * irrespective of their positions.
 * Note - Does not perform deep comparison.
 * @param {Array} array1 - Source array.
 * @param {Array} array2 - Desination array for comparison.
 * @returns {Boolean} true if array1 and array2 have same elements.
 */
function arraysIdentical(array1 = [], array2 = []) {
    if (!Array.isArray(array1) || !Array.isArray(array2)) {
        return false;
    }

    if (array1.length !== array2.length) {
        return false;
    }
    const sortedArray1 = Object.assign([], array1).sort();
    const sortedArray2 = Object.assign([], array2).sort();

    return sortedArray1.toString() === sortedArray2.toString();
}

/**
 * Get advanced search action item for display.
 * @param {String} term the search term to display in the action option
 */
function computeAdvancedSearchOption(isDesktop, term) {
    const common = {
        iconSize: COMMON_LOOKUP_CONSTANTS.ICON_SIZE_X_SMALL,
        value: COMMON_LOOKUP_CONSTANTS.ACTION_ADVANCED_SEARCH,
        text: i18n.advancedSearchMobile.replace('{0}', term),
    };

    return isDesktop
        ? {
              ...common,
              //   highlight: true,
              iconAlternativeText: `${i18n.search}`,
              iconName: COMMON_LOOKUP_CONSTANTS.ICON_SEARCH,
              type: COMMON_LOOKUP_CONSTANTS.OPTION_TYPE_CARD,
          }
        : {
              ...common,
              action: true,
              endIconName: COMMON_LOOKUP_CONSTANTS.ICON_SEARCH,
              endIconNameAlternativeText: `${i18n.search}`,
              type: COMMON_LOOKUP_CONSTANTS.OPTION_TYPE_INLINE,
          };
}

/**
 * Get create new action item for display.
 * @param {String} label - Plural name of target api.
 * @returns {Object} - A create new action item.
 */
function computeCreateNewOption(label = '') {
    if (label === null) {
        label = '';
    }
    return {
        iconAlternativeText: `${i18n.add}`,
        iconName: COMMON_LOOKUP_CONSTANTS.ICON_ADD,
        iconSize: COMMON_LOOKUP_CONSTANTS.ICON_SIZE_X_SMALL,
        text: `${i18n.createNew}`.replace('{0}', label),
        type: COMMON_LOOKUP_CONSTANTS.OPTION_TYPE_CARD,
        value: ACTION_CREATE_NEW,
    };
}

/**
 * Computes the heading for the display items on desktop.
 * @param {String} entityName - Plural name of target api.
 */
function computeHeadingDesktop(entityName, searchType) {
    return searchType === GET_LOOKUP_RECORDS_WIRE_CONSTANTS.SEARCH_TYPE_RECENT
        ? `${i18n.mruHeader}`.replace('{0}', entityName)
        : '';
}

/**
 * Computes the heading for the display items on mobile.
 * @param {String} term - The term the results are for
 * @param {String} searchType - The type of search
 */
function computeHeadingMobile(term, searchType) {
    let label = '';
    // eslint-disable-next-line default-case
    switch (searchType) {
        case GET_LOOKUP_RECORDS_WIRE_CONSTANTS.SEARCH_TYPE_RECENT:
            label = i18n.mruHeaderMobile;
            break;
        case GET_LOOKUP_RECORDS_WIRE_CONSTANTS.SEARCH_TYPE_TYPEAHEAD:
            label = `${i18n.typeaheadResultsHeader}`.replace('{0}', term);
            break;
        case GET_LOOKUP_RECORDS_WIRE_CONSTANTS.SEARCH_TYPE_FULL:
            label = `${i18n.fullSearchResultsHeader}`.replace('{0}', term);
            break;
    }
    return label;
}

/**
 * Returns items with text slices for highlighting.
 *
 * For example -
 * items = [{ text: "salesforce", subText: "(213)111-4444",...}]
 * term = "sal force"
 * returns -
 * [
 *    {
 *      "text": [
 *        {
 *          "text": "sal",
 *          "highlight": true
 *        },
 *        {
 *          "text": "es"
 *        },
 *        {
 *            "text": "force",
 *            "highlight": true
 *        }
 *      ],
 *      "subText": [
 *        {
 *          "text": "(213)111-4444"
 *        }
 *      ],
 *      ...
 *    }
 *  ]
 *
 * Important caveats -
 *
 * Handling term with substrings:
 * --------------------------------
 * Term is broken up into parts for matching by splitting it using whitespaces.
 * Matching for each part starts from the begining till the end of the original text.
 * Parts that are subtrings of each other may get merged while highlighting.
 * For example -
 * text = "salesforce.com account"
 * term = "salesforce.com a"
 * "salesforce.com" would be highlighted but not "a" because it's a substring of "salesforce.com"
 * however for the term "salesforce.com acc" both "salesforce.com" and "acc" would be highlighted.
 *
 * Handling term with wildcards:
 * --------------------------------
 * Wildcards are not dropped while matching.
 * For example -
 * text = "salesforce.com"
 * term = "sales*"
 * would NOT result in highlighting of "sales". However if text was "sales*foo"
 * then the subtring "sales*" would be highlighted.
 *
 * @param {Array} items - Items representing records.
 * @param {String} term - A search term for matching.
 * @return {Array} - An array of items with text split for highlighting.
 */
function computeHighlightedItems(items, term) {
    const output = [];

    // No-op if items or term is empty.
    if (!items || items.length === 0 || !term) {
        return output;
    }

    // Get unique parts of the term.
    // For example -
    // term = "sal sal sales"
    // words = ["sal","sales"]
    const words = term
        .trim()
        .split(' ')
        .filter((w, i, ar) => {
            return ar.indexOf(w) === i;
        });

    items.forEach((item) => {
        const outputItem = Object.assign({}, item);

        // Creating text list to process text and subText.
        const textList = [];

        // Process text only if it's not empty
        if (item.text) {
            textList.push({ type: 'text', text: item.text });
        } else {
            outputItem.text = null;
        }

        // Process subText only if it's not empty
        if (item.subText) {
            textList.push({ type: 'subText', text: item.subText });
        } else {
            outputItem.subText = null;
        }

        textList.forEach((textItem) => {
            // Get matching indexes for the search term.
            const intervals = getMatchingIndexes(textItem.text, words);
            // If match not found, then return the original text.
            if (intervals.length === 0) {
                outputItem[textItem.type] = [{ text: textItem.text }];
            } else {
                // Get slices of matching text with highlight markers.
                outputItem[textItem.type] = splitTextFromMatchingIndexes(
                    textItem.text,
                    intervals
                );
            }
        });

        output.push(outputItem);
    });

    return output;
}

function computeListSize(searchType, isDesktop) {
    return searchType === GET_LOOKUP_RECORDS_WIRE_CONSTANTS.SEARCH_TYPE_FULL &&
        !isDesktop
        ? COMMON_LOOKUP_CONSTANTS.LIST_SIZE_MOBILE_ADVANCED_SEARCH
        : COMMON_LOOKUP_CONSTANTS.LIST_SIZE_DEFAULT;
}

/**
 * Gets placeholder text for lookup input.
 * @param {String} label - Plural name of target api.
 * @returns {String} - Placeholder text for lookup input.
 */
function computePlaceholder(label) {
    let placeholder;
    if (label) {
        // Returns "Search <label>", for example - "Search Accounts".
        placeholder = `${i18n.searchObjectsPlaceholder}`.replace('{0}', label);
    } else {
        // Returns "Search..."
        placeholder = `${i18n.searchPlaceholder}`;
    }
    return placeholder;
}

/**
 * Computes a list of pills for the record values.
 * @param  {Object} record - A record representation.
 * @param {Object} fieldInfo - The record's field info.
 * @param {Object} referenceInfos - The reference api infos.
 * @param {String} externalObjectValue - the local org Id of the referenced entity.
 * @returns {Array} - An array of pills for the record field values.
 */
function computeRecordPills(
    record,
    fieldInfo,
    referenceInfos,
    externalObjectValue
) {
    let pills = [];

    if (!record || !fieldInfo || !referenceInfos) {
        return pills;
    }

    const relationshipField = record.fields[fieldInfo.relationshipName];
    const relationshipFieldValue = isUndefined(relationshipField)
        ? null
        : record.fields[fieldInfo.relationshipName].value;

    // No-op if relationship field value is empty.
    if (!relationshipFieldValue) {
        return pills;
    }

    const apiName = relationshipFieldValue.apiName;
    // No-op if field value and relationship field value are inconsistent for non external entities.
    if (
        relationshipFieldValue.fields.Id.value !==
            record.fields[fieldInfo.fieldName].value &&
        externalObjectValue !== relationshipFieldValue.fields.Id.value
    ) {
        return pills;
    }

    if (apiName in referenceInfos) {
        const referenceInfo = referenceInfos[apiName];
        const pill = {
            iconAlternativeText: referenceInfo.iconAlternativeText,
            iconName: referenceInfo.iconName,
            iconSize: COMMON_LOOKUP_CONSTANTS.ICON_SIZE_SMALL,
            label: relationshipFieldValue.fields[referenceInfo.nameField].value,
            type: COMMON_LOOKUP_CONSTANTS.PILL_TYPE_ICON,
            value: record.fields[fieldInfo.fieldName].value,
            externalObjectValue: isApiExternal(apiName)
                ? relationshipFieldValue.fields.Id.value
                : undefined,
        };
        pills = [pill];
    }

    return pills;
}

/**
 * Computes a list of values from record for the given field.
 * @param  {Object} record - A record representation.
 * @param {String} fieldApiName - The qualified field name.
 * @returns {Array} - An array of the record field values.
 */
function computeRecordValues(objectInfos, record, fieldApiName) {
    if (!objectInfos || !record || !fieldApiName) {
        return [];
    }

    const fieldName = computeUnqualifiedFieldApiName(fieldApiName);

    if (hasEmptyCustomRelationshipFieldValue(objectInfos, record, fieldName)) {
        return [];
    }

    const recordField = record.fields[fieldName];

    return recordField && recordField.value ? [recordField.value] : [];
}

/**
 * Computes the searchType for the @getLookupRecords wire config
 * @param {Object} requestObject - the request config used to fetch records via getLookupRecords wire
 * @returns {String} - the search type - 'Recent', 'Typeahead', or 'Search'
 */
function computeSearchType(requestObject) {
    if (isFullSearch(requestObject.searchType)) {
        return GET_LOOKUP_RECORDS_WIRE_CONSTANTS.SEARCH_TYPE_FULL;
    }
    return isValidTypeAheadTerm(requestObject.q)
        ? GET_LOOKUP_RECORDS_WIRE_CONSTANTS.SEARCH_TYPE_TYPEAHEAD
        : GET_LOOKUP_RECORDS_WIRE_CONSTANTS.SEARCH_TYPE_RECENT;
}

/**
 * Computes the field API name from a qualified field name.
 * For example - Opportunity.AccountId returns 'AccountId'
 * @param {String} fieldApiName - The qualified field name.
 * @return {String} - The unqualified field name.
 */
function computeUnqualifiedFieldApiName(fieldApiName) {
    if (!fieldApiName) {
        return '';
    }

    const fieldParts = fieldApiName.split('.');
    if (fieldParts.length === 1) {
        return fieldParts[0];
    }
    return fieldParts[fieldParts.length - 1];
}

/**
 * Creates an array of items values not included in valuesToIgnore array.
 * @param {Array} items - The original list of items to be deduped.
 * @param {Array} valuesToIgnore - The list of values to ignore.
 * @returns {Array} - The the deduped and trimmed items list.
 */
// eslint-disable-next-line @lwc/lwc/no-rest-parameter
function difference(items, ...valuesToIgnore) {
    return (items || []).filter((item) => !valuesToIgnore.includes(item.value));
}

/**
 * Returns matching indexes for the terms found in the given text.
 *
 * For example -
 * text = "salesforce"
 * words = ["sal","force"]
 * returns - [[0,3],[5,10]]
 *
 * @param {String} text - Original text for matchin search term.
 * @param {String} words - Distinct words or term parts.
 * @return {Array} - An array of intervals.
 */
function getMatchingIndexes(text, words) {
    let output = [];

    // No-op if text to match or term is missing.
    if (!text || !words) {
        return output;
    }

    const matchIndexes = {};
    // Convert text to lower case for matching.
    const lowerCasedText = text.toLowerCase();

    for (let t = 0; t < words.length; t++) {
        const word = words[t];
        // Convert word to lower case for matching.
        const lowerCasedWord = word.toLowerCase();

        let index = 0,
            start = 0,
            numMatches = 0;

        while (start < text.length && index !== -1 && numMatches < 1) {
            index = lowerCasedText.indexOf(lowerCasedWord, start);
            // Match found.
            if (index > -1) {
                // Get end index for the current term.
                const endIndex = index + lowerCasedWord.length;
                // If some term part was found previously with the same start
                // index then update the endIndex having longest part.
                // For example -
                // text = "salesforce"
                // words = ["sal", "salesf"]
                //
                // For "sal", matchIndexes would be {0:3}
                // For "salesf", matchIndexes would be updated to {0:6}
                if (matchIndexes[index]) {
                    if (matchIndexes[index] < endIndex) {
                        matchIndexes[index] = endIndex;
                    }
                } else {
                    // No matching term part found for the index, make a new entry.
                    matchIndexes[index] = endIndex;
                }
                numMatches++;
                // Increment the start pointer.
                start = endIndex;
            }
        }
    }

    // Convert indexes map into an array of indexes.
    output = Object.keys(matchIndexes).map((interval) => {
        return [parseInt(interval, 10), matchIndexes[interval]];
    });

    return output;
}

function getIconOf(objectInfo) {
    if (!objectInfo || !objectInfo.themeInfo || !objectInfo.themeInfo.iconUrl) {
        return COMMON_LOOKUP_CONSTANTS.ICON_DEFAULT;
    }
    const iconUrl = objectInfo.themeInfo.iconUrl;
    const parts = iconUrl.split('/');
    const icon = parts.pop().replace(/(_\d+)(\.\w*)/gi, '');
    const category = parts.pop();
    return `${category}:${icon}`;
}

function getSearchTypeAndItems(groupedItems) {
    const groupedRecords = groupedItems.find((item) => !!item.items);
    if (groupedRecords) {
        return {
            searchType: groupedRecords.searchType,
            items: groupedRecords.items,
        };
    }
    return {};
}

/**
 * Checks if the given term is contains any CJK characters.
 * @param {String} term - A search term.
 * @return {Boolean} - True if the term contains any CJK characters.
 */
function hasCJK(term = '') {
    if (term === null) {
        return false;
    }

    if (typeof term !== 'string') {
        return false;
    }

    const chars = term.trim().split('');
    for (let i = 0; i < chars.length; i++) {
        if (
            /^[\u1100-\u1200\u3040-\uFB00\uFE30-\uFE50\uFF00-\uFFF0]+$/.test(
                chars[i]
            )
        ) {
            return true;
        }
    }
    return false;
}

function isApiExternal(apiName) {
    return EXTERNAL_ENTITY_REGEXP.test(apiName);
}

/**
 * Checks if the given searchType is of type 'full'
 * @param {String} searchType - the searchType from the config object
 * @returns {Boolean} - True if full search
 */
function isFullSearch(searchType) {
    return searchType === GET_LOOKUP_RECORDS_WIRE_CONSTANTS.SEARCH_TYPE_FULL;
}

/**
 * Checks if the given searchType is of type 'recent'
 * @param {String} searchType - the searchType to check
 * @retuns {Boolean} - true if recent search
 */
function isMRU(searchType) {
    return searchType === GET_LOOKUP_RECORDS_WIRE_CONSTANTS.SEARCH_TYPE_RECENT;
}

/**
 * Checks if the given searchType is of type 'typeahead'
 * @param {String} searchType - the searchType to check
 * @returns {Boolean} - true if typeahead search
 */
function isTypeAhead(searchType) {
    return (
        searchType === GET_LOOKUP_RECORDS_WIRE_CONSTANTS.SEARCH_TYPE_TYPEAHEAD
    );
}

function isUndefined(value) {
    return value === undefined;
}

/**
 * Checks if the given term is a valid search term.
 * @param {String} term - A search term.
 * @return {Boolean} - True if the term is a valid search string.
 */
function isValidSearchTerm(term) {
    if (!term) {
        return false;
    }
    const normalizedTerm = term.replace(/[()"?*]+/g, '').trim();
    return normalizedTerm.length >= 2 || hasCJK(normalizedTerm);
}

/**
 * Checks if the given term is a valid typeahead search term.
 * @param {String} term - A search term.
 * @return {Boolean} - True if the term is a valid typeahead string.
 */
function isValidTypeAheadTerm(term) {
    if (!term) {
        return false;
    }
    const normalizedTerm = term.replace(/[()"?*]+/g, '').trim();
    return (
        normalizedTerm.length < 255 &&
        (normalizedTerm.length > 2 || hasCJK(normalizedTerm))
    );
}

/**
 * Takes a string and delimiter and splits only on the first occurrence
 * i.e. Account.Owner.Alias ==> ['Account', 'Owner.Alias']
 * @param {String} input
 * @param {String} delimiter
 */
const _splitOnce = (input, delimiter) => {
    const all = input.split(delimiter);
    const first = all[0];
    const rest = all.slice(1).join(delimiter);
    return [first, rest];
};

const _computeFieldDisplayValue = (fieldInfo) => {
    if (!fieldInfo) {
        return undefined;
    }
    if (
        fieldInfo.displayValue !== undefined &&
        fieldInfo.displayValue !== null
    ) {
        return fieldInfo.displayValue.toString();
    }
    if (fieldInfo.value !== undefined && fieldInfo.value !== null) {
        return fieldInfo.value.toString();
    }
    return '';
};

const resolveFieldValueFromRecord = (fieldApiName, record) => {
    const DOT = '.';

    if (!fieldApiName) {
        return undefined;
    }

    if (!fieldApiName.includes(DOT)) {
        return _computeFieldDisplayValue(record.fields[fieldApiName]);
    }

    const [nestedEntityName, rest] = _splitOnce(fieldApiName, DOT);
    const nestedEntity = record.fields[nestedEntityName];
    if (!nestedEntity || !nestedEntity.value) {
        return undefined;
    }

    return resolveFieldValueFromRecord(rest, nestedEntity.value);
};

/**
 * Returns the formated records to be displayed as individual combobox options
 * @param {Array} records - records to create individual options for
 * @param {Object} displayFields - an array of two element: [primaryField, secondaryField]
 * @param {Object} iconDetails - the iconDetails for the entity being mapped
 * @param {String} optionType - how to display the items (inline or card)
 * @returns {Array} - The list of options formatted for groupedCombobox to consume
 */
function mapLookupWireRecords(
    records,
    [primaryField, secondaryField],
    iconDetails,
    optionType
) {
    return records.map((record) => {
        const fields = record.fields;
        return {
            ...iconDetails,
            iconSize: COMMON_LOOKUP_CONSTANTS.ICON_SIZE_SMALL,
            subText: resolveFieldValueFromRecord(secondaryField, record),
            text: fields[primaryField].value,
            type: optionType,
            value: isApiExternal(record.apiName)
                ? fields.ExternalId.value
                : fields.Id.value,
            externalObjectValue: isApiExternal(record.apiName)
                ? fields.Id.value
                : undefined,
        };
    });
}

/**
 * Maps records into their ui representations
 * record have to contain the name field of their referenced api
 * @param {Array} records
 */
function mapRecordUiWireRecords(
    recordsWithReferencedApiNameField,
    objectInfos
) {
    const pills = recordsWithReferencedApiNameField
        .filter((record) => record.referencedApiNameField)
        .map((record) => ({
            iconAlternativeText: record.apiName,
            iconName: getIconOf(objectInfos[record.apiName]),
            label: record.fields[record.referencedApiNameField].value,
            type: COMMON_LOOKUP_CONSTANTS.PILL_TYPE_ICON,
            value: isApiExternal(record.apiName)
                ? record.fields.ExternalId.value
                : record.id,
            externalObjectValue: isApiExternal(record.apiName)
                ? record.id
                : undefined,
        }));

    const invalidValues = recordsWithReferencedApiNameField
        .filter((record) => !record.referencedApiNameField)
        .map((record) => record.id);

    return { pills, invalidValues };
}

/**
 * Merges overlapping intervals.
 *
 * For example -
 * intervals = [[0,3],[1,4],[5,7]]
 * returns - [[0,4],[5,7]]
 *
 * @param {Array} intervals - An array of intervals to merge.
 * @return {Array} - An array of merged intervals.
 */
function mergeIntervals(intervals) {
    if (!intervals || !intervals.length) {
        return [];
    }

    intervals.sort((a, b) => {
        return a[0] !== b[0] ? a[0] - b[0] : a[1] - b[1];
    });

    let prev = intervals[0];
    const output = [prev];
    const intervalsLength = intervals.length;

    for (let i = 0; i < intervalsLength; i++) {
        const curr = intervals[i];
        if (curr[0] <= prev[1]) {
            prev[1] = Math.max(prev[1], curr[1]);
        } else {
            output.push(curr);
            prev = curr;
        }
    }

    return output;
}

/**
 * Parses LDS error object.
 * @param {Object} error - LDS error object from wire adapter.
 * @return {String} - error message.
 *
 */
function parseLdsError(error) {
    const formattedError = parseError(error);
    return formattedError.message || formattedError.detail;
}

/**
 * Splits text using indexes and adds highlight marker.
 *
 * For example -
 * text = "salesforce"
 * intervals = [[0,3]]
 * returns -
 * [
 *  {
 *    "text": "sal",
 *    "highlight": true
 *  },
 *  {
 *    "text": "esforce"
 *  }
 * ]
 *
 * @param {String} text - Original text for matching indexes.
 * @param {Array} intervals - An array of intervals to highlight.
 * @return {Array} - An array of text items with highlighting.
 */
function splitTextFromMatchingIndexes(text, intervals) {
    const output = [];

    // No-op if text or intervals is missing.
    if (!text || !intervals || intervals.length === 0) {
        return output;
    }

    // Merge intervals to avoid incorrect slicing.
    const _intervals = mergeIntervals(intervals);

    // Sort array based on first value.
    _intervals.sort((prev, next) => {
        return prev[0] > next[0];
    });

    let prevMatchEndIdx = 0;

    for (let i = 0; i < _intervals.length; i++) {
        const startIdx = _intervals[i][0];
        const endIdx = _intervals[i][1];

        // Push part before start index.
        const prevText = text.substring(prevMatchEndIdx, startIdx);
        if (prevText) {
            output.push({ text: prevText });
        }

        // Push part having match.
        output.push({
            text: text.substring(startIdx, endIdx),
            highlight: true,
        });

        // Update previous match index with current end index.
        prevMatchEndIdx = endIdx;
    }

    // Push remaining text.
    const remainingText = text.substring(prevMatchEndIdx);
    if (remainingText) {
        output.push({ text: remainingText });
    }

    return output;
}

/**
 * Returns the relationship field (example: Account, CustomField__r) field
 * related to a lookup field (example: AccountId, CustomField__c).
 * @param  {Object} objectInfos - The object infos.
 * @param  {Object} record - A record representation.
 * @param {String} unqualifiedFieldApiName - The unqualified field name (qualified: Contact.AccountId, unqualified: AccountId)
 * @returns {Object}
 */
function getRelationshipField(objectInfos, record, unqualifiedFieldApiName) {
    const field = getField(
        objectInfos,
        record.apiName,
        unqualifiedFieldApiName
    );
    if (!field) {
        return null;
    }
    return record.fields[field.relationshipName];
}

/**
 * Determines whether the record's custom relationship field (__r) associated to
 * the provided fieldName value is empty.
 * @param  {Object} objectInfos - The object infos.
 * @param  {Object} record - A record representation.
 * @param {String} unqualifiedFieldApiName - The unqualified field name.
 * @returns {Object}
 */
function hasEmptyCustomRelationshipFieldValue(
    objectInfos,
    record,
    unqualifiedFieldApiName
) {
    const customRelationshipField = getRelationshipField(
        objectInfos,
        record,
        unqualifiedFieldApiName
    );
    return customRelationshipField && !customRelationshipField.value;
}

function getKeyPrefix(recordId) {
    return recordId ? recordId.trim().slice(0, 3) : null;
}

function getEntityApiNameFromRecordId(objectInfos, recordId) {
    const keyPrefix = getKeyPrefix(recordId);
    if (keyPrefix) {
        const associatedObjectInfo = Object.values(objectInfos).find(
            (objectInfo) => objectInfo.keyPrefix === keyPrefix
        );
        return associatedObjectInfo ? associatedObjectInfo.apiName : undefined;
    }
    return undefined;
}

function getField(objectInfos, apiName, unqualifiedFieldApiName) {
    if (!objectInfos || !apiName || !unqualifiedFieldApiName) {
        return null;
    }
    return (
        objectInfos[apiName] &&
        objectInfos[apiName].fields[unqualifiedFieldApiName]
    );
}

export {
    arraysIdentical,
    computeAdvancedSearchOption,
    computeCreateNewOption,
    computeHeadingDesktop,
    computeHeadingMobile,
    computeHighlightedItems,
    computeListSize,
    computePlaceholder,
    computeRecordPills,
    computeRecordValues,
    computeSearchType,
    computeUnqualifiedFieldApiName,
    difference,
    getIconOf,
    getSearchTypeAndItems,
    hasCJK,
    isApiExternal,
    isFullSearch,
    isMRU,
    isTypeAhead,
    isUndefined,
    isValidSearchTerm,
    isValidTypeAheadTerm,
    resolveFieldValueFromRecord,
    mapLookupWireRecords,
    mapRecordUiWireRecords,
    mergeIntervals,
    parseLdsError,
    splitTextFromMatchingIndexes,
    getRelationshipField,
    hasEmptyCustomRelationshipFieldValue,
    getEntityApiNameFromRecordId,
    getField,
};
