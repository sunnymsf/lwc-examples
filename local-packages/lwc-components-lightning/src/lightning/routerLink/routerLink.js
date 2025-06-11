import { LightningElement, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { isValidPageReference } from 'lightning/utilsPrivate';

/**
 * Displays a page reference based router link as a hyperlink.
 */
export default class LightningRouterLink extends NavigationMixin(
    LightningElement
) {
    /**
     * tabindex for the anchor element,
     * indicates that its element can be focused,
     * and where it participates in sequential keyboard navigation
     * @type {number}
     *
     */
    @api tabIndex;

    /**
     * The text to display when the mouse hovers over the link.
     * A link doesn't display a tooltip unless a text value is provided.
     *
     * @type {string}
     *
     */
    @api title;

    /**
     * Specifies where to open the link. Options include _blank, _parent, _self, and _top.
     * This value defaults to _self.
     * @type {string}
     *
     */
    @api target = '_self';

    value;
    anchorHref = '#';
    validLink = false;

    /**
     * The navigation target, should be a pageReference
     * @type {object}
     *
     */
    @api
    get to() {
        return this.value;
    }
    set to(value) {
        this.value = value;
        if (this.isConnected) {
            this.updateAnchorHref();
        }
    }

    connectedCallback() {
        this.updateAnchorHref();
    }

    updateAnchorHref() {
        if (isValidPageReference(this.value)) {
            this[NavigationMixin.GenerateUrl](this.value).then((url) => {
                if (url !== null) {
                    this.anchorHref = url;
                    this.validLink = true;
                } else {
                    // valid page reference but no match
                    this.resetAnchor();
                }
            });
        } else {
            // invalid page reference
            this.resetAnchor();
        }
    }

    resetAnchor() {
        this.anchorHref = '#';
        this.validLink = false;
    }

    handleClick(event) {
        // no-op for `#` url
        event.stopPropagation();
        event.preventDefault();
        // use lightning/navigation to handle any pageReference navigates
        if (this.validLink) {
            this[NavigationMixin.Navigate](this.value);
        }
    }

    get anchorElement() {
        return this.template.querySelector('a');
    }

    /**
     * Sets focus on the element.
     */
    @api
    focus() {
        this.anchorElement.focus();
    }

    /**
     * Removes keyboard focus from the element.
     */
    @api
    blur() {
        this.anchorElement.blur();
    }

    /**
     * Simulates a mouse click on the url and navigates to it using the specified target.
     */
    @api
    click() {
        this.anchorElement.click();
    }
}
