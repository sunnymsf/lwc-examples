import { addressFormat } from 'lightning/internationalizationLibrary';

const FORMAT_CODE_MAP = {
    A: 'street',
    C: 'city',
    S: 'province',
    Z: 'postalCode',
    K: 'country',
};

export const parseLocaleFormat = function (format) {
    if (isValidFieldFormat(format)) {
        return format
            .toUpperCase()
            .split(/(?=[A-Z])/)
            .map((formatCode) => FORMAT_CODE_MAP[formatCode]);
    }
    return [];
};

export function getInputOrder(config) {
    const { countryCode, hasCountryPicklist, langCode, showCompactAddress } =
        config;

    let inputOrder = addressFormat.getAddressInputOrderAllField(
        langCode,
        countryCode
    );
    // always show country picklist as the first field
    // to match aloha behavior
    if (hasCountryPicklist) {
        inputOrder = 'K' + inputOrder.replace('K', '');
    }

    const parsed = parseLocaleFormat(inputOrder);

    // TD-0120510 Render single textarea as two separate inputs
    if (showCompactAddress) {
        const index = parsed.indexOf('street');
        if (index > -1) parsed.splice(index + 1, 0, 'subpremise');
    }

    return parsed;
}

export function getRequiredFields(config) {
    const { countryCode, langCode } = config;

    const requireFields = addressFormat.getAddressRequireFields(
        langCode,
        countryCode
    );

    return parseLocaleFormat(requireFields);
}

function isValidFieldFormat(value) {
    return typeof value === 'string' && /^[ACSZK]+$/i.test(value);
}
