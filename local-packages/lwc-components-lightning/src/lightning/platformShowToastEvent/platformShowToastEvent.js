import { ShowToastEvent as ToastEvent } from 'lightning/showToastEvent';
import { showToast } from 'lightning/platformNotificationUtils';
import Toast from 'lightning/toast';

export class ShowToastEvent extends ToastEvent {
    constructor(config) {
        const label = (config && config.title) || '';
        super({ toast: Toast, label });
        showToast(config, (forceShowToastAttributes) => {
            Object.defineProperties(this, {
                toastAttributes: {
                    value: forceShowToastAttributes,
                    writable: false,
                },
            });
        });
    }
}
