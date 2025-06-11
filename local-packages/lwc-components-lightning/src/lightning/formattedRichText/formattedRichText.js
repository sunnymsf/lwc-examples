import { api } from 'lwc';
import { setHooks } from 'lwc';
import LightningShadowBaseClass from 'lightning/shadowBaseClassPrivate';
import sanitizeHTML from 'lightning/purifyLib';
import { richTextConfig } from './richTextConfig';
import { updateRawLinkInfo } from 'lightning/routingService';
import {
    normalizeBoolean,
    isCSR,
    hasOnlyAllowedVideoIframes,
} from 'lightning/utilsPrivate';
import { linkTextNodes } from './linkTextNodes';
import { linkTextNodesSSR } from './linkTextNodesSSR';

// Overriding default sanitization hook to disable it.
// Content is conditionally sanitized within the component
// https://lwc.dev/guide/html_templates#override-the-sanitizehtmlcontent(content)-method
// W-16437378 - Remove this section once setHooks has been removed globally
try {
    setHooks({
        sanitizeHtmlContent(rawHTMLString) {
            return rawHTMLString;
        },
    });
} catch (e) {
    // Do nothing because setHooks is getting
    // called at the app/framework level.
}

/**
 * Displays rich text that's formatted with allowed tags and attributes.
 * Other tags and attributes are removed and only their text content is displayed.
 */

/**
 * W-15751242 resulted in major updates to formatted-rich-text depending on render mode.
 * If loaded in CSR, content gets sanitized. This is rendered as text.
 * If loaded in SSR, content does not get sanitized until it reaches the client.
 */
export default class LightningFormattedRichText extends LightningShadowBaseClass {
    static validationOptOut = ['class'];

    rendered = false;
    _value = '';
    _disableLinkify = false;
    connected = false;
    richText = null;
    rawTextIfSanitizerThrewError = null;
    serverRenderedContent = null;
    linkingRequired = false;

    /**
     * If present, the component does not create links in the rich text.
     * @type {boolean}
     * @default false
     */
    @api
    get disableLinkify() {
        return this._disableLinkify;
    }

    set disableLinkify(val) {
        this._disableLinkify = normalizeBoolean(val);
        this.renderRichText();
    }

    /**
     * Sets the rich text to display.
     * @type {string}
     *
     */
    @api
    get value() {
        return this._value;
    }

    set value(val) {
        this._value = val === undefined || val === null ? '' : String(val);
        this.renderRichText();
    }

    renderedCallback() {
        if (this.linkingRequired) {
            this.linkRichText();
        }
        if (!this.rendered) {
            this.rendered = true;
            this.renderRichText();
        }
    }

    connectedCallback() {
        super.connectedCallback();
        this.classList.add('slds-rich-text-editor__output');
        this.connected = true;

        // Checks if CSR currently & previously rendered in SSR.
        // This checks if markup already exists in the DOM.
        if (isCSR) {
            // eslint-disable-next-line @lwc/lwc/no-inner-html
            this.serverRenderedContent = this.container?.innerHTML;

            if (this.serverRenderedContent) {
                // Syncing server rendered DOM and client component state
                // ensures we render server side non-sanitized content, instead
                // of client side sanitized content, on first paint.
                this.richText = this.serverRenderedContent;
            }
        }
    }

    disconnectedCallback() {
        this.removeLinkClickListeners();
        this.connected = false;
    }

    sanitize(value) {
        if (!value) {
            return value;
        }
        let computedRichTextConfig = richTextConfig;

        if (hasOnlyAllowedVideoIframes(value)) {
            // richTextConfig is shared across all formatted-rich-text components;
            // so create and modify copy of richTextConfig to allow iframes for each component
            computedRichTextConfig = {
                ...richTextConfig,
                ALLOWED_TAGS: richTextConfig.ALLOWED_TAGS.concat(['iframe']),
                ALLOWED_ATTR: richTextConfig.ALLOWED_ATTR.concat([
                    'allowfullscreen',
                ]),
            };
        }
        try {
            return sanitizeHTML(value, computedRichTextConfig);
        } catch {
            // If sanitize failed, throw the unsanitized value to be rendered as text
            throw new Error(
                `
                <lightning-formatted-rich-text> Exception caught when attempting to sanitize: ${value}`,
                { cause: { unsanitizedRawText: value } }
            );
        }
    }

    handleClick(event) {
        const anchor = event.currentTarget;
        if (anchor === null) {
            return;
        }
        const target = anchor.target;
        const url = anchor.href;
        // Grab the link info onclick and dispatch
        updateRawLinkInfo(this, { url, target }).then((linkInfo) => {
            anchor.href = linkInfo.url;
            linkInfo.dispatcher(event);
        });
    }

    renderRichText() {
        if (!isCSR) {
            // If SSR, do not sanitize the value on server, just link if required.
            this.richText = this.disableLinkify
                ? this.value
                : linkTextNodesSSR(this.value);
        }

        if (this.rendered) {
            try {
                // Sanitizer did not throw an error, so this value is cleared
                this.rawTextIfSanitizerThrewError = null;

                // Render richText if the value changes or if previously set in SSR
                this.richText = this.sanitize(this.value);

                // Linking needs to be added in a second tick as the DOM has not been updated yet
                this.linkingRequired = true;
            } catch (e) {
                // eslint-disable-next-line no-console
                console.warn(e.message);

                this.richText = null;

                // If sanitizer throws an error & the value was not sanitized,
                // render it as an unsanitized text value
                this.rawTextIfSanitizerThrewError = e.cause.unsanitizedRawText;
            }
        }
    }

    linkRichText() {
        if (!this.disableLinkify) {
            linkTextNodes(this.container);
        }
        this.links.forEach((link) => {
            link.addEventListener('click', this.handleClick.bind(this));
        });
        this.linkingRequired = false;
    }

    removeLinkClickListeners() {
        this.links.forEach((link) => {
            link.removeEventListener('click', this.handleClick.bind(this));
        });
    }

    get links() {
        return this.container ? [...this.container.querySelectorAll('a')] : [];
    }

    get container() {
        return this.template.querySelector('span');
    }
}
