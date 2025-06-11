import { LightningElement } from 'lwc';
import {
    enable,
    disable,
    addDialListener,
} from '../../../clickToDialService/clickToDialService.js';
/**
 * clickToDialService and all its methods are for internal use only.
 * Use Open CTI in your org instead.
 * For more information, see the Open CTI Dev Guide.
 * https://developer.salesforce.com/docs/atlas.en-us.api_cti.meta/api_cti/sforce_api_cti_intro.htm
 */
export default class LightningExampleAccordionSectionBasic extends LightningElement {
    enableClickToDial() {
        enable();
    }

    disableClickToDial() {
        disable();
    }

    onClickToDial() {
        addDialListener((payload) => {
            // eslint-disable-next-line no-alert
            alert(
                'This alert simulates the onClickToDial method for Open CTI in Lightning Experience. The phone number is dialed sending the following payload: ' +
                    JSON.stringify(payload)
            );
        });
    }
}
