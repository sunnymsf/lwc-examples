import labelSearchObjectsPlaceholder from '@salesforce/label/LightningLookup.searchObjectsPlaceholderMobile';
import labelPanelHeader from '@salesforce/label/LightningLookup.panelHeaderMobile';

const i18n = {
    searchObjectsPlaceholder: labelSearchObjectsPlaceholder,
    panelHeader: labelPanelHeader,
};

/**
 * Computes the header for the selection panel
 * @param {String} label Label for the source object
 * @returns {String} - Header for the selection panel
 */
function computePanelHeader(label = '') {
    // Returns "Relate <label> to" for example - "Relate Account to"
    return `${i18n.panelHeader}`.replace('{0}', label);
}

/**
 * Prefixes 'Search' to placeholder text for lookup input.
 * @param {String} label Plural name of target api.
 * @returns {String} Placeholder text for lookup input.
 */
function computePlaceholder(label = '') {
    return `${i18n.searchObjectsPlaceholder}`.replace('{0}', label);
}

export { computePanelHeader, computePlaceholder };
