import {
    urlRegexString,
    emailRegexString,
    tagRegexString,
    createHttpHref,
    createEmailHref,
} from 'lightning/utilsPrivate';

const linkRegex = new RegExp(
    `${tagRegexString}|${emailRegexString}|${urlRegexString}`,
    'gi'
);

const createHttpLink = function (match) {
    const href = createHttpHref(match);
    return `<a href="${href}" target="_blank" rel="noopener">${match}</a>`;
};

const createEmailLink = function (match) {
    const href = createEmailHref(match);
    return `<a href="${href}">${match}</a>`;
};

// SSR is not impacted by security vunerabilities and cannot use the DOM (see W-14765820)
export const linkTextNodesSSR = function (text) {
    if (typeof text !== 'string') {
        return '';
    }

    return text.replace(linkRegex, (match, tagMatch, emailMatch, hrefMatch) => {
        if (tagMatch) {
            return tagMatch;
        } else if (hrefMatch) {
            const endsWithQuote = hrefMatch.endsWith('&quot');
            let href = hrefMatch;
            if (endsWithQuote) {
                href = hrefMatch.slice(0, hrefMatch.lastIndexOf('&quot'));
            }
            return createHttpLink(href) + (endsWithQuote ? '&quot' : '');
        } else if (emailMatch) {
            return createEmailLink(emailMatch);
        }
        return match;
    });
};
