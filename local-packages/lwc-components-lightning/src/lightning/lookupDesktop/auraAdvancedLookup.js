import { getAura } from 'lightning/auraUtils';
import { showCustomOverlay } from 'lightning/deprecatedOverlayUtils';

/**
 * Returns the dependent field bindings map for a given Record representation.
 * @param  {Object} record - A record representation.
 */
export function getDependentFieldBindingsAuraAdvancedLookup(
    record,
    dependentFields
) {
    if (!record || !dependentFields || !dependentFields.length) {
        return undefined;
    }

    return dependentFields.reduce(
        (acc, field) => ({
            ...acc,
            [field]: _getFieldValue(record, field),
        }),
        {}
    );
}

function _getFieldValue(record, field) {
    const fields = record.fields;

    if (['Id', 'RecordTypeId'].includes(field)) {
        return record[_uncapitalize(field)] || null;
    }

    if (
        !fields ||
        !fields[field] ||
        typeof fields[field].value == 'undefined'
    ) {
        return null;
    }

    return fields[field].value;
}

function _uncapitalize(s) {
    return s.charAt(0).toLowerCase() + s.slice(1);
}

/**
 * Shows advanced search panel having scoped search results.
 * @param {Object} attrs - Attributes for lookupAdvanced component.
 * Schema -
 * {
 *      additionalFields: {Array},
 *      contextId: {String},
 *      dependentFieldBindings: {Map},
 *      entities: {Array},
 *      field: {String},
 *      groupId: {String},
 *      label: {String},
 *      maxValues: {Integer},
 *      placeholder: {String},
 *      recordId: {String},
 *      saveCallback: {Function},
 *      scopeMap: {Object},
 *      scopeSets: {Object},
 *      source: {String},
 *      term: {String},
 * }
 */
export function showAuraAdvancedLookupModal(attrs) {
    showCustomOverlay({
        isTransient: true,
        isScrollable: false,
        isFullScreen: true,
        flavor: 'large',
        autoFocus: false,
        title: attrs.label,
    }).then((panel) => {
        updatePanel(panel._panelInstance, attrs);
    });
}

/**
 * Updates panel by setting it's body and footer.
 * @param {Object} panel - Instance of panel created, an Aura Component.
 * @param {Object} attrs - Attributes for lookupAdvanced component.
 */
function updatePanel(panel, attrs) {
    if (!panel || !attrs) {
        return;
    }
    setPanelFooter(panel)
        .then(setPanelBody(panel, attrs))
        .catch((error) => {
            throw new Error(error);
        });
}

/**
 * Sets an instance of lookupAdvanced to panel's body.
 * @param {Object} panel - Instance of panel, an Aura Component.
 * @param {Object} attrs - Attributes for lookupAdvanced component.
 * @returns {Promise} a promise used to resolve the creation of lookupAdvanced.
 */
function setPanelBody(panel, attrs) {
    attrs.panel = panel;
    const promise = new Promise((resolve, reject) => {
        getAura((aura) => {
            aura.createComponent(
                'forceSearch:lookupAdvanced',
                attrs,
                (cmp, status, error) => {
                    if (status === 'SUCCESS') {
                        panel.update({
                            body: cmp,
                        });
                        resolve();
                    } else {
                        reject(error);
                    }
                }
            );
        });
    });
    return promise;
}

/**
 * Sets an instance of lookupAdvancedFooter to panel's footer.
 * @param {Object} panel - Instance of panel, an Aura Component.
 * @return {Promise} a promise used to resolve the creation of
 * lookupAdvancedFooter.
 */
function setPanelFooter(panel) {
    const promise = new Promise((resolve, reject) => {
        getAura((aura) => {
            aura.createComponent(
                'forceSearch:lookupAdvancedFooter',
                { 'aura:id': 'lookupAdvancedFooter' },
                (cmp, status, error) => {
                    if (status === 'SUCCESS') {
                        panel.set('v.footer', cmp);
                        resolve();
                    } else {
                        reject(error);
                    }
                }
            );
        });
    });
    return promise;
}
