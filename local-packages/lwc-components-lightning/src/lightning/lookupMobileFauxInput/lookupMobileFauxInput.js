import { api, LightningElement } from 'lwc';

import AriaObserver from 'lightning/ariaObserver';

const BUTTON_SELECTOR = 'button.slds-faux-input';
const ARIA_LABELLEDBY = 'aria-labelledby';
const ARIA_DESCRIBEDBY = 'aria-describedby';

export default class LightningLookupMobileFauxInput extends LightningElement {
    _ariaLabelledBy;
    _ariaDescribedBy;

    @api disabled;

    @api
    set ariaLabelledBy(references) {
        if (references === undefined || references === null) {
            return;
        }
        this._ariaLabelledBy = references;
        this.ariaObserver.connect({
            targetSelector: BUTTON_SELECTOR,
            attribute: ARIA_LABELLEDBY,
            relatedNodeIds: references,
        });
    }

    get ariaLabelledBy() {
        return this._ariaLabelledBy;
    }

    @api
    set ariaDescribedBy(references) {
        if (references === undefined || references === null) {
            return;
        }
        this._ariaDescribedBy = references;
        this.ariaObserver.connect({
            targetSelector: BUTTON_SELECTOR,
            attribute: ARIA_DESCRIBEDBY,
            relatedNodeIds: references,
        });
    }

    get ariaDescribedBy() {
        return this._ariaDescribedBy;
    }

    @api
    focus() {
        if (this.button) {
            this.button.focus();
        }
    }

    constructor() {
        super();
        this.ariaObserver = new AriaObserver(this);
    }

    connectedCallback() {
        if (!this.ariaObserver) {
            this.ariaObserver = new AriaObserver(this);
        }
    }

    renderedCallback() {
        /**
         * In certain contexts, the renderedCallback can be called before the connectedCallback, which causes the ariaObserver
         *  to fail with this error "Invalid sync invocation. It can only be invoked during renderedCallback()".
         * Adding `this.isConnected` to avoid such errors as recommended by ariaObserver docs (See W-13986755).
         */
        if (this.isConnected) {
            this.ariaObserver.sync();
        }
    }

    disconnectedCallback() {
        if (this.ariaObserver) {
            this.ariaObserver.disconnect();
            this.ariaObserver = undefined;
        }
    }

    get button() {
        return this.template.querySelector(BUTTON_SELECTOR);
    }

    handleButtonContainerClick(event) {
        // prevents the native click event from bubbling up through the DOM
        event.stopPropagation();
        event.preventDefault();

        if (!this.disabled) {
            this.dispatchEvent(new CustomEvent('fauxinputclick'));
        }
    }

    handleBlur() {
        this.dispatchEvent(new CustomEvent('blur'));
    }
}
