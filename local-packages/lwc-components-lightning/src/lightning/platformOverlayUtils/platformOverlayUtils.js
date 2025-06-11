import { parseOptions } from './overlayOptions';
import { OverlayPanel } from './overlayPanel';

export function showCustomOverlay(configuration, eventDispatcher) {
    const parameters = parseOptions(configuration);

    return new Promise((resolve, reject) => {
        parameters.onCreate = (panelInstance) => {
            resolve(new OverlayPanel(panelInstance));
        };
        try {
            eventDispatcher(parameters);
        } catch (e) {
            reject(e);
        }
    });
}
