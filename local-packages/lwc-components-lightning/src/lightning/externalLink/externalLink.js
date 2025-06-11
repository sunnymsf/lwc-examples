import { api } from 'lwc';
import LightningShadowBaseClass from 'lightning/shadowBaseClassPrivate';

/**
 * Class representing primitive link rely on forcehelp-to-non-salesforce-resource.
 * Airgap env means limited access to public internet. When InaccessibleHelpResource perm is enable.
 * Any non salesforce resource is blocked. airgap team created forcehelp-link-to-non-salesforce-resource cmp
 * to help resolve the non salesforce resource to a default help page in this case.
 * @extends Element
 */
export default class LightningExternalLink extends LightningShadowBaseClass {
    @api label;
    @api title;
    @api rel;
    @api tabIndex;
    @api
    get href() {
        return this._href;
    }
    set href(value) {
        this._href = value;
        this._isDirty = true;
    }

    _isDirty = true;
}
