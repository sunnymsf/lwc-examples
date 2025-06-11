/* eslint-disable @lwc/lwc/no-api-reassignments */

import labelOpenInGoogleMaps from '@salesforce/label/LightningMap.openInGoogleMaps';
import labelCoordinatesTitle from '@salesforce/label/LightningMap.coordinatesTitle';
import labelIframeTitle from '@salesforce/label/LightningMap.iframeTitle';
import labelIframeDefaultTitle from '@salesforce/label/LightningMap.defaultTitle';
import labelIframeMarkersTitle from '@salesforce/label/LightningMap.titleWithAddress';
import { api, track } from 'lwc';
import {
    classListMutation,
    guid,
    normalizeString,
    deepCopy,
    escapeHTML,
    normalizeBoolean,
    isCSR,
} from 'lightning/utilsPrivate';
import {
    registerMessageHandler,
    unregisterMessageHandler,
    createMessage,
    postMessage,
} from 'lightning/messageDispatcher';
import { MAP_DOMAIN, buildMapSourceUrl } from 'lightning/mapUtils';
import { isEmptyString, isEmptyObject } from 'lightning/inputUtils';
import { formatAddress, titleCase } from './utils';
import sanitizeHTML from 'lightning/purifyLib';
import { formatLabel } from 'lightning/utils';
import language from '@salesforce/i18n/lang';
import locale from '@salesforce/i18n/locale';
import LightningShadowBaseClass from 'lightning/shadowBaseClassPrivate';

const i18n = {
    openInGoogleMapsString: labelOpenInGoogleMaps,
    coordinatesTitleString: labelCoordinatesTitle,
    primitiveMapIframeTitle: labelIframeTitle,
    markersDefaultTitle: labelIframeDefaultTitle,
    markersTitleString: labelIframeMarkersTitle,
};

const EXTERNAL_GOOGLE_MAPS_URL = 'https://www.google.com/maps/place/';
const EVENT_NAME = {
    SET_MAP_PARAM: 'set-map-param',
};

const ALLOWED_HTML_TAGS = [
    'b',
    'br',
    'del',
    'em',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'i',
    'ins',
    'mark',
    'p',
    'small',
    'strong',
    'sub',
    'sup',
];

const SANITIZE_CONFIG = {
    ALLOWED_TAGS: ALLOWED_HTML_TAGS,
    ALLOWED_ATTR: [],
};

const allowedOptions = [
    'disableDefaultUI',
    'draggable',
    'zoomControl',
    'scrollwheel',
    'disableDoubleClickZoom',
];

const region = locale.split('-')[1];

/**
 * Displays a map with markers for one or more locations.
 */
export default class LightningMap extends LightningShadowBaseClass {
    static validationOptOut = ['class'];

    @track _mapHref = EXTERNAL_GOOGLE_MAPS_URL;
    @track _coordinates = [];
    @track _activeCoordinate = null;
    @track _markersTitle = i18n.coordinatesTitleString;
    _mapTitle = null;

    privateZoomLevel = null;
    privateCenter = null;
    privateMarkers = null;
    privateOptions = {};

    /**
     * @name privateCoordinateItems
     * @type {Array}
     * @private
     * Array that holds all the child primitiveCoordinateItem(s).
     */
    privateCoordinateItems = [];

    mapDomain = MAP_DOMAIN;

    /**
     * Sets the region for the map. Defaults to user locale.
     * Possible values can be found in the "Region Code" column
     * in table at https://developers.google.com/maps/coverage
     */
    @api region = region;

    /**
     * If present, the footer element is displayed below the map.
     * The footer shows an 'Open in Google Maps' link that opens an external window
     * to display the selected marker location in Google Maps. Default value is false.
     *
     * @type {Boolean}
     * @default false
     */
    @api showFooter = false;

    /**
     * Displays or hides the list of locations. Valid values are visible, hidden, or auto.
     * This value defaults to auto, which shows the list only when multiple markers are present.
     * Passing in an invalid value hides the list view.
     */
    @api listView = 'auto';

    /**
     * @param {Integer} value - Corresponds to zoom levels defined in Google Maps API
     * If not specified, automatically chooses an appropriate zoom level
     * to show all markers with comfortable margins.
     */
    set zoomLevel(value) {
        this.privateZoomLevel = value;
        this.sendMessage({ zoomLevel: this.privateZoomLevel });
    }

    /**
     * The zoom levels as defined by Google Maps API.
     * If a zoom level is not specified, a default zoom level is applied to accommodate all markers on the map.
     * @type {number}
     */
    @api
    get zoomLevel() {
        return this.privateZoomLevel;
    }

    /**
     * @param {Object} value - A single address value to center the map around
     */
    set center(value) {
        this.privateCenter = value;
        const computedCenter = this.primitivifyMarker(deepCopy(this.center));
        this.sendMessage({ center: computedCenter });
    }

    /**
     * A location to use as the map's center.
     * If center is not specified, the map centers automatically.
     *
     * @type {object}
     */
    @api
    get center() {
        return this.privateCenter;
    }

    /**
     * Setter for the markersTitle property.
     * @param {String} title - A title string for the list of locations
     */
    set markersTitle(title) {
        this._mapTitle = title;
        this._markersTitle = titleCase(title);
    }

    /**
     * Provides the heading title for the markers. Required if specifying multiple markers.
     * The title is displayed below the map as a header for the list of clickable addresses.
     *
     * @type {string}
     */
    @api
    get markersTitle() {
        return this._markersTitle;
    }

    get mapTitle() {
        if (!isEmptyString(this._mapTitle)) {
            return formatLabel(this.i18n.markersTitleString, this.markersTitle);
        } else if (this.mapMarkers?.length) {
            if (
                this.mapMarkers.length === 1 &&
                !isEmptyObject(this.mapMarkers[0].location)
            ) {
                return formatLabel(
                    this.i18n.markersTitleString,
                    formatAddress(this.mapMarkers[0].location)
                );
            }
            return formatLabel(
                this.i18n.markersDefaultTitle,
                this.mapMarkers.length
            );
        }
        return this.i18n.primitiveMapIframeTitle;
    }
    /**
     * Provides the value of the currently selected marker.
     * Returns undefined if you don’t pass value to map-markers.
     * @type {String}
     */
    @api
    get selectedMarkerValue() {
        if (this._coordinatesMapByKey) {
            const selectedMarker =
                this._coordinatesMapByKey[this._activeMarkerId];

            return selectedMarker?.value;
        }
        return this._initialSelectedMarkerValue;
    }

    set selectedMarkerValue(value) {
        if (this.isMarkerReady) {
            const selectedMarker = this._coordinatesMapByValue[value];
            const selectedMarkerId = selectedMarker?.key;
            if (this._activeMarkerId !== selectedMarkerId) {
                this.selectMarker(selectedMarkerId);
            }
        } else {
            // Marker isn't set yet, keep the value.
            this._initialSelectedMarkerValue = value;
        }
    }

    /**
     * Provides the list of map settings/options.
     * The options contain different map settings with either true/false value.
     *
     * @type {Object}
     */

    @api
    get options() {
        return this.privateOptions;
    }

    /**
     * Setter for the map options  property.
     * @param {Object} opts - A list of settings with boolean values
     */

    set options(opts) {
        let selectedOptions = {};
        Object.keys(opts).forEach((key) => {
            if (!allowedOptions.includes(key)) {
                console.warn('Option ' + key + ' is not a valid map option.');
            } else {
                selectedOptions[key] = normalizeBoolean(opts[key]);
            }
        });
        this.privateOptions = selectedOptions;
        this.sendMessage({ options: this.privateOptions });
    }

    /**
     * Setter function, for mapMarkers.
     * Depending on the number of markers passed, we display a single view map or
     * a map with multiple markers and a list of coordinates
     * @param {Object[]} mapMarkers - the markers array with the following format:
     * map-markers = [
     *  {
     *      location: {
     *           City: 'San Francisco',
     *           Country: 'USA',
     *           PostalCode: '94105',
     *           state: 'CA',
     *           street: '50 Fremont St',
     *       },
     *      value: 'unique identifier 001',
     *      // Extra info for tile in sidebar
     *      icon: 'standard:account',
     *      title: 'Julies Kitchen', // e.g. Account.Name
     *  },
     *  {
     *      location: {
     *          City: 'San Francisco',
     *          Country: 'USA',
     *          PostalCode: '94105',
     *          State: 'CA',
     *          Street: '30 Fremont St.',
     *      },
     *      value: 'unique identifier 002',
     *      icon: 'standard:account',
     *      title: 'Tender Greens', // e.g. Account.Name
     *  }
     */
    set mapMarkers(mapMarkers) {
        this.privateMarkers = this.sanitizeMarkers(mapMarkers);
        this.initMarkers(this.privateMarkers);
        this._activeCoordinate = this.privateMarkers[0];
    }

    /**
     * One or more objects with the address or latitude and longitude to be displayed on the map.
     * If latitude and longitude are provided, the address is ignored.
     * @type {array}
     * @required
     */
    @api
    get mapMarkers() {
        return this.privateMarkers;
    }

    /**
     * returns the localized map source to use for the iframe
     */
    get mapSrc() {
        return buildMapSourceUrl({
            resource: 'primitiveMap',
            region: isCSR ? sanitizeHTML(this.region) || region : region,
            language,
        });
    }

    get mapStyle() {
        return 'position: absolute; inset-block-start: 0; inset-inline-start: 0; inset-inline-end: 0; height: 100%; width: 100%; border: 0;';
    }

    /**
     * getter for the i18 constant containing the localized strings
     */
    get i18n() {
        return i18n;
    }

    get isMarkerReady() {
        return (
            this._coordinatesMapByKey && this.privateCoordinateItems.length > 0
        );
    }
    /**
     * returns the href link to open the map on an external window.
     * e.g. "https://www.google.com/maps/place/1+Market+St,+San+Francisco,+CA+94105"
     */
    get mapHref() {
        const activeCoordinate = this._activeCoordinate.location;
        let mapHrefURL = '';

        if (activeCoordinate.Latitude && activeCoordinate.Longitude) {
            mapHrefURL = encodeURI(
                `${EXTERNAL_GOOGLE_MAPS_URL}${activeCoordinate.Latitude},${activeCoordinate.Longitude}`
            );
        } else {
            mapHrefURL = encodeURI(
                `${EXTERNAL_GOOGLE_MAPS_URL}${normalizeString(
                    activeCoordinate.Street
                )}+${normalizeString(activeCoordinate.City)}+${normalizeString(
                    activeCoordinate.State
                )}+${normalizeString(activeCoordinate.PostalCode)}`
            );
        }
        return mapHrefURL;
    }

    /**
     * Controls the visibility of the coordinates list-view/sidebar.
     * See listView attribute.
     */
    get showCoordinatesSidebar() {
        const outputs = {
            visible: true,
            hidden: false,
            auto: this._coordinates && this._coordinates.length > 1,
        };
        return outputs[this.listView];
    }

    connectedCallback() {
        super.connectedCallback();
        this._dispatchId = registerMessageHandler((event) => {
            this.handleMessage(event);
        });

        classListMutation(this.classList, {
            'slds-grid': true,
            'slds-has-coordinates': this.showCoordinatesSidebar,
        });
    }

    disconnectedCallback() {
        if (this._dispatchId) {
            unregisterMessageHandler(this._dispatchId);
        }
    }

    renderedCallback() {
        if (this._initialSelectedMarkerValue) {
            const value = this._initialSelectedMarkerValue;
            this._initialSelectedMarkerValue = null;
            this.selectedMarkerValue = value;
        }
    }

    /**
     * Function to normalize and store the coordinates being passed.
     * We store an array with all the coordindates as well as a map for easy access.
     * @param {Object} mapMarkers - Array of Coordindates
     */
    initMarkers(mapMarkers) {
        const mapMarkersLength = mapMarkers.length;
        const coordinates = [];
        const coordinatesMapByKey = {};
        const coordinatesMapByValue = {};
        let i = 0,
            coordinate = {},
            key;

        for (i; i < mapMarkersLength; i++) {
            key = guid();
            coordinate = deepCopy(mapMarkers[i]);
            coordinate.key = key;
            coordinate.formattedAddress = formatAddress(coordinate.location);
            if (!coordinate.icon) {
                coordinate.icon = 'standard:location';
            }
            coordinates.push(coordinate);
            coordinatesMapByKey[key] = coordinate;
            if (coordinate.value) {
                coordinatesMapByValue[coordinate.value] = coordinate;
            }
        }

        this._coordinates = coordinates;
        this._coordinatesMapByKey = coordinatesMapByKey;
        this._coordinatesMapByValue = coordinatesMapByValue;

        const markers = this._coordinates.map((marker) =>
            this.primitivifyMarker(marker)
        );

        this.sendMessage({ markers });
    }

    handleCoordinateRegister(event) {
        event.stopPropagation(); // suppressing event since its not part of public API
        this.privateCoordinateItems.push(event.srcElement);
    }

    /**
     * Click handler for the coordinate click.
     * On click we post the coordinate key to the primitive map so it can get selected
     * @param {Object} event - The event object containing the key of the coordinate clicked
     */
    handleCoordinateClick(event) {
        const key = event.detail.key;
        this.selectMarker(key);
        this.sendMessage({
            activeMarkerId: this._activeMarkerId,
        });
        this.dispatchSelectedMarkerValue();
    }

    /**
     * Click handler for the coordinate hover.
     * @param {Object} event - The event object containing the key of the coordinate hovered
     */
    handleCoordinateHover(event) {
        this._hoverMarkerId = event.detail.key;
        this.sendMessage({
            hoverMarkerId: this._hoverMarkerId,
        });
    }

    /**
     * Handle messages from the child iframe
     * @param {Object} event - The event object
     */
    handleMessage(data) {
        const messageType = data.event;
        if (messageType === 'markerselect') {
            const key = data.arguments.key;
            this.selectMarker(key);

            this.dispatchSelectedMarkerValue();
        }
    }

    dispatchSelectedMarkerValue() {
        // notify interop for property change.
        if (isCSR) {
            // disabled because the event is wrapped in isCSR
            /* eslint-disable @lwc/lwc/no-unsupported-ssr-properties, @lwc/lwc/no-restricted-browser-globals-during-ssr */
            this.dispatchEvent(
                new CustomEvent('change', {
                    composed: true,
                    bubbles: true,
                    detail: {
                        selectedMarkerValue: this.selectedMarkerValue,
                    },
                })
            );
            /* eslint-enable @lwc/lwc/no-unsupported-ssr-properties, @lwc/lwc/no-restricted-browser-globals-during-ssr */
        }
    }

    selectMarker(key) {
        const activeCoordinate = this._coordinatesMapByKey[key];
        this._activeCoordinate = activeCoordinate;

        this._activeMarkerId = key;

        // unselect other child coordinateitems from the coordinates list
        this.privateCoordinateItems.forEach((coordinate) => {
            if (coordinate.guid === key) {
                coordinate.selected = true;
            } else {
                coordinate.selected = false;
            }
        });

        if (isCSR) {
            // fire select event
            // eslint-disable-next-line lightning-global/no-custom-event-bubbling, @lwc/lwc/no-restricted-browser-globals-during-ssr
            const markerSelectEvent = new CustomEvent('markerselect', {
                bubbles: true,
                composed: true,
                detail: {
                    selectedMarkerValue: this.selectedMarkerValue,
                },
            });

            // disabled because event is wrapped in isCSR
            // eslint-disable-next-line @lwc/lwc/no-unsupported-ssr-properties
            this.dispatchEvent(markerSelectEvent);
        }
    }

    /**
     * Create marker for sending to primitive map.
     * Extract only information that is relevant to primitive map
     * @param {Object} marker  - a marker containing location and related information.
     * @returns {Object} marker - a marker with only keys relevant to primitive map.
     */
    primitivifyMarker(marker) {
        let primitifiedMarker = null;

        if (marker?.location) {
            primitifiedMarker = {
                key: marker.key,
                title: escapeHTML(marker.title || ''),
                description: marker.description,
                ...marker.location,
            };
            // Add support for custom marker icons
            if (marker.mapIcon) {
                primitifiedMarker.icon = marker.mapIcon;
            }
            // Add support for different shapes
            if (typeof marker.type === 'string') {
                primitifiedMarker.type = marker.type;
                primitifiedMarker.strokeColor = marker.strokeColor;
                primitifiedMarker.strokeOpacity = marker.strokeOpacity;
                primitifiedMarker.strokeWeight = marker.strokeWeight;
                primitifiedMarker.fillColor = marker.fillColor;
                primitifiedMarker.fillOpacity = marker.fillOpacity;

                switch (marker.type) {
                    case 'Circle':
                        primitifiedMarker.radius = marker.radius;
                        break;
                    case 'Rectangle':
                        primitifiedMarker.bounds = marker.bounds;
                        break;
                    case 'Polygon':
                        primitifiedMarker.paths = marker.paths;
                        break;
                    default:
                        break;
                }
            } else {
                primitifiedMarker.type = 'marker';
            }
        }
        return primitifiedMarker;
    }

    /**
     * Method helper to posts messages to the map iframe
     * @param {Object} param - The payload to post to the iframe
     * @param {String} event - Then name of event, by default it's set-map-param.
     */
    sendMessage(params, event) {
        event = event || EVENT_NAME.SET_MAP_PARAM;
        if (this.iframeLoaded) {
            if (this._handler) {
                const message = createMessage(this._dispatchId, event, params);
                postMessage(this._handler, message, '*');
            }
        }
    }

    /**
     * handler function for when the iframe is loaded, at which point we
     * store a reference for the callback postToWindow method for iframe communication.
     * We also post the first payload of coordindates to the primitive map
     * @param {Object} event - The event object containing the postToWindow callback
     */
    handleIframeLoad(event) {
        this._handler = event.detail.callbacks.postToWindow;

        const center = this.center
            ? this.primitivifyMarker(deepCopy(this.center))
            : null;
        const zoomLevel = this.zoomLevel;
        const markers = deepCopy(this._coordinates).map((marker) =>
            this.primitivifyMarker(marker)
        );
        const options = this.privateOptions;

        this.iframeLoaded = true;
        this.mapIframe = event.detail;

        this.sendMessage({ center, markers, zoomLevel, options });
    }

    sanitizeMarkers(mapMarkers) {
        if (!Array.isArray(mapMarkers)) {
            return [];
        }

        return mapMarkers.map((marker) => {
            const newMarker = deepCopy(marker);
            newMarker.description = isCSR
                ? sanitizeHTML(marker.description || '', SANITIZE_CONFIG)
                : null;

            return newMarker;
        });
    }

    /**
     * This will return only cordinates of type markers.
     * So only the list view  markers will appear on the right side list eliminating shapes.
     */
    get filteredMarkers() {
        var list = this._coordinates.filter((coordinate) => {
            return !coordinate.type || coordinate.type === 'marker';
        });

        return list;
    }
}
