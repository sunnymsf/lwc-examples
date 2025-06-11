import { isCSR } from 'lightning/utilsPrivate';
export const DEFAULT_LOCATION = { lat: 37.790091, lng: -122.396848 };

/* eslint-disable @lwc/lwc/no-restricted-browser-globals-during-ssr */
const getCurrentPosition =
    isCSR && navigator?.geolocation?.getCurrentPosition
        ? navigator.geolocation.getCurrentPosition.bind(navigator.geolocation)
        : (success, error) => error?.();

export function getLocation() {
    return new Promise((resolve) => {
        getCurrentPosition(
            (position) => {
                resolve({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
            },
            () => resolve(DEFAULT_LOCATION)
        );
    });
}
