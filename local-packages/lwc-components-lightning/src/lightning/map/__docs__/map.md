A `lightning-map` component displays a map of one or more locations, using geocoding data and mapping imagery from Google Maps.
The map image is shown in a container, with an optional list of the locations. The list is visible by default when multiple locations are specified. When you select a location title in the list, its map marker is activated. The list is shown beside or below the map, depending on the width of the container.

`lightning-map` loads content from the Salesforce domain `maps.a.forceusercontent.com` in an iframe. Allow `maps.a.forceusercontent.com` if you use this component in your own domain and you use the Content Security Policy `frame-src` directive, such as in Experience Builder sites or Lightning Out. For more information, see [Content Security Policy in Experience Builder sites](https://help.salesforce.com/articleView?id=networks_security_csp_overview.htm).

This component implements styling from [map](https://www.lightningdesignsystem.com/components/map/) in the
Lightning Design System.

Pass the locations to be displayed via the component's `map-markers` property.

For example:

```html
<template>
    <lightning-map map-markers={mapMarkers}> </lightning-map>
</template>
```

`map-markers` is an array of markers that indicate location.

A marker contains

-   Location Information: A coordinate pair of latitude and longitude, or an address composed of address elements to be geocoded.
-   Descriptive Information: Optional title, description, and an icon. These items are relevant to the marker but not specifically related to location.

#### Marker Properties

Use the following marker properties to customize the map display.

| Property    | Type   | Description                                                                                                                                                                                                                                                                                                                                                                   |
| ----------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `location`  | object | Address elements (City, Country, PostalCode, State, and Street) to be geocoded, or a set of latitude and longitude coordinates. If you specify address elements and coordinates for one location, the map uses the coordinates. To support reliable geocoding of addresses, if you specify Street, you must also specify at least one of City, Country, PostalCode, or State. |
| `title`     | string | Title text for the location, displayed in the location list and in the info window when you click a marker. HTML tags aren't supported and are displayed as unescaped markup.                                                                                                                                                                                                 |
| `description` | string | Text describing the location, displayed in the info window when you click a marker or location title. A subset of HTML tags is supported. See **Using HTML Tags in Descriptions**.                                                                                                                                                                                            |
| `icon`      | string | The icon that's displayed next to the location title in the list. Only Lightning Design System icons are supported. Custom icons are currently not supported in the location list. The default icon is standard:location. For more information, see **Displaying Multiple Addresses and a Title**.                                                                            |
| `value`     | string | An optional unique identifier for a marker. When you select a marker, its value is assigned to the `selected-marker-value` attribute.                                                                                                                                                                                                                                         |
| `type`      | string | A type of shape to use instead of the default map marker. Accepted values are `Circle`, `Rectangle`, and `Polygon`. See **Marking Locations with Shapes**.                                                                                                                                                                                                                    |
| `mapIcon`   | object | A custom SVG icon to use instead of the default map marker. See **Marking Locations with Custom Icons**.                                                                                                                                                                                                                                                                      |

#### Using HTML Tags in Descriptions

HTML tags are supported for use with the `description` property. The supported HTML tags are `b`, `br`, `del`, `em`, `h1`, `h2`, `h3`, `h4`, `h5`,`h6`, `i`, `ins`, `mark`, `p`, `small`, `strong`, `sub`, and `sup`. Other HTML tags you pass to `description` are sanitized and removed.

This example formats some words in a marker description to make them bold and italicized.

```javascript
mapMarkers = [
    {
        location: {
            Street: '1 Market St',
            City: 'San Francisco',
            Country: 'USA',
        },
        title: 'The Landmark Building',
        description:
            'Historic <b>11-story</b> building completed in <i>1916</i>',
    },
];
```

#### Displaying a Single Marker

Here's an example of a marker that uses address elements.

```javascript
import { LightningElement } from 'lwc';

export default class LightningMapExample extends LightningElement {
    mapMarkers = [
        {
            location: {
                City: 'San Francisco',
                Country: 'USA',
                PostalCode: '94105',
                State: 'CA',
                Street: 'The Landmark @ One Market, Suite 300',
            },
            value: 'location001',
            title: 'The Landmark Building',
            description:
                'The Landmark is considered to be one of the city&#39;s most architecturally distinct and historic properties', //escape the apostrophe in the string using &#39;
            icon: 'standard:account',
        },
    ];
}
```

Here's an example of a marker that uses coordinates for latitude and longitude.

```javascript
import { LightningElement } from 'lwc';

export default class LightningMapExample extends LightningElement {
    mapMarkers = [
        {
            location: {
                Latitude: '37.790197',
                Longitude: '-122.396879',
            },
        },
    ];
}
```

For each map marker in the array of map markers, provide either latitude and longitude coordinates or address elements to be geocoded. If you specify both in a single marker, latitude and longitude get precedence.

#### Displaying Multiple Addresses and a Title

When you specify multiple markers in an array, the `lightning-map` component renders a list of tiles with location titles and addresses, with a heading displayed above the list. Each location tile contains an icon, a title, and an address.

Specify the `markers-title` attribute to display a custom heading for your locations. If you don't pass this attribute, the heading is "Markers(n)" where n is the number of markers you provide.

```html
<template>
    <lightning-map
        map-markers={mapMarkers}
        markers-title="Lunch Gems"
        onmarkerselect={handleMarkerSelect}
        selected-marker-value={selectedMarkerValue}
    >
    </lightning-map>
</template>
```

To select a marker on load, use the `selected-marker-value` attribute. Retrieve the selected marker using the `onmarkerselect` handler.

To customize each location tile, you can specify the optional `icon`, `title`, and `description` properties. The `lightning-map` component displays the icon next to the address. The description is displayed in an info window when the user clicks the marker.

Get the selected marker using the `event.target.selectedMarkerValue` property.

```javascript
import { LightningElement, track } from 'lwc';

export default class LightningMapExample extends LightningElement {
    mapMarkers = [
        {
            location: {
                // Location Information
                City: 'San Francisco',
                Country: 'USA',
                PostalCode: '94105',
                State: 'CA',
                Street: '50 Fremont St',
            },

            // For onmarkerselect
            value: 'SF1',

            // Extra info for tile in list & info window
            icon: 'standard:account',
            title: 'Julies Kitchen', // e.g. Account.Name
            description: 'This is a long description',
        },
        {
            location: {
                // Location Information
                City: 'San Francisco',
                Country: 'USA',
                PostalCode: '94105',
                State: 'CA',
                Street: '30 Fremont St.',
            },

            // For onmarkerselect
            value: 'SF2',

            // Extra info for tile in list
            icon: 'standard:account',
            title: 'Tender Greens', // e.g. Account.Name
        },
    ];

    selectedMarkerValue = 'SF1';

    handleMarkerSelect(event) {
        this.selectedMarkerValue = event.target.selectedMarkerValue;
    }
}
```

#### Displaying or Hiding the List of Locations

By default, the list of locations is hidden when you pass in a single marker and displayed when you pass in multiple markers. To hide the list of locations for multiple markers, set `list-view="hidden"`. To display the list of locations for a single marker, set `list-view="visible"`.

Note that if you specify a `type` to display a shape at a location, the list view doesn't show an entry for the location. See **Marking Locations with Shapes**.

The example for specifying `zoom-level` also uses `list-view`.

#### Specifying Zoom Level

If you don't specify the `zoom-level` attribute, the `lightning-map` component calculates a zoom level to accommodate the markers in your map.

To specify a particular zoom level, set `zoom-level` to a value corresponding to a Google Maps API zoom level. Currently, Google Maps API supports zoom levels from `1` to `22` in desktop browsers, and from `1` to `20` on mobile. For more information, see [Zoom Levels](https://developers.google.com/maps/documentation/javascript/tutorial#zoom-levels) in the Google Maps API documentation.

Here's an example that uses `zoom-level` and `list-view` attributes.

```html
<template>
    <lightning-map
        map-markers={mapMarkers}
        zoom-level={zoomLevel}
        list-view={listView}
    >
    </lightning-map>
</template>
```

The component's JavaScript sets the markers, zoom level, and list view visibility.

```javascript
import { LightningElement } from 'lwc';

export default class LightningMapExample extends LightningElement {
    mapMarkers = [
        {
            location: {
                Street: '1000 5th Ave',
                City: 'New York',
                State: 'NY',
            },

            title: 'Museum of Fine Arts',
            description:
                'A grand setting for one of the greatest collections of art, from ancient to contemporary.',
        },
    ];
    zoomLevel = 15;
    listView = 'visible';
}
```

#### Centering the Map

When you have multiple map markers, the component centers the map on a location near the center of the markers by calculating the geometric mean.

Use the `center` attribute to specify a different location for the map's center. You can specify latitude and longitude, or at least one of the address elements: Country, State, City, and PostalCode. Street is optional.

The `center` location format is the same as the `map-markers` location format. However, you can't specify a title, icon, or description for the center.

Here's an example that centers the map using latitude and longitude.

```html
<template>
    <lightning-map
        map-markers={mapMarkers}
        markers-title={markersTitle}
        center={center}
    >
    </lightning-map>
</template>
```

The markers and the center are set in JavaScript.

```javascript
import { LightningElement } from 'lwc';

export default class LightningMapExample extends LightningElement {
    mapMarkers = [
        {
            location: {
                Street: '1000 5th Ave',
                City: 'New York',
                State: 'NY',
            },

            title: 'Metropolitan Museum of Art',
            description:
                'A grand setting for one of the greatest collections of art, from ancient to contemporary.',
        },
        {
            location: {
                Street: '11 W 53rd St',
                City: 'New York',
                State: 'NY',
            },

            title: 'Museum of Modern Art (MoMA)',
            description: 'Thought-provoking modern and contemporary art.',
        },
        {
            location: {
                Street: '1071 5th Ave',
                City: 'New York',
                State: 'NY',
            },

            title: 'Guggenheim Museum',
            description:
                'World-renowned collection of modern and contemporary art.',
        },
    ];

    markersTitle = 'Coordinates for Centering';

    center = {
        location: { Latitude: '40.7831856', Longitude: '-73.9675653' },
    };
}
```

The same map could use address elements to center:

```javascript
center = {
    location: { Street: '170 Central Park West', PostalCode: '10024' },
};
```

#### Showing the Footer

The footer displays a link for opening the map in Google Maps in a new window or tab. By default, the first marker location opens. When viewing a map with multiple locations, select a location from the list before clicking the link to open that location in Google Maps.
The external Google map image shows a marker labeled with the location information that's specified for the marker in `lightning-map`. The title and description aren't included.

To display the footer, specify the `show-footer` attribute.

```html
<template>
    <lightning-map
        map-markers={mapMarkers}
        markers-title={markersTitle}
        show-footer
    >
    </lightning-map>
</template>
```

#### Setting Map Controls

`lightning-map` enables you to specify which map controls to allow. Set the `options` attribute to
enable or disable map controls using the following boolean properties.

| Property                 | Default Value | Description                                                                                                                                                                                                                                                  |
| ------------------------ | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `draggable`              | true          | Enables dragging to pan the map with the mouse. Set to false to prevent dragging. This property affects the map only. Markers aren't draggable.                                                                                                              |
| `zoomControl`            | true          | Shows the +/- zoom controls on the bottom of the map. Set to false to remove the controls and prevent zooming.                                                                                                                                               |
| `scrollwheel`            | true          | Permits zooming with the mouse wheel. Set to false to disable zooming with the mouse wheel when zooming is enabled. If `zoomControl` is false or `disableDefaultUI` is true, the `scrollwheel` setting has no effect because these settings disable zooming. |
| `disableDefaultUI`       | false         | Set to true to remove Map/Satellite and +/- zoom buttons. The satellite view and zooming are disabled. Mouse scrolling and dragging is not affected by `disableDefaultUI`.                                                                                   |
| `disableDoubleClickZoom` | false         | Set to true to disable zooming with a mouse double-click when zooming is enabled.                                                                                                                                                                            |

Zooming behavior is influenced by all the properties except `draggable`.

-   To prevent all zooming, set `zoomControl: false`
-   To prevent all zooming and also remove the Map/Satellite buttons, set `disableDefaultUI: true`
-   To allow zooming, but prevent the scroll wheel from activating zoom, set `scrollwheel: false`
-   To allow zooming, but prevent a double-click from activating zoom, set `disableDoubleClickZoom: true`

This example disables dragging and also disables the default UI, which removes the zoom capability and
Map/Satellite button. The result is a static map.

```html
<template>
    <lightning-map
        map-markers={mapMarkers}
        options={mapOptions}
        zoom-level="14"
    ></lightning-map>
</template>
```

The values of the `options` attribute are set in an object of boolean values in JavaScript.

```javascript
import { LightningElement } from 'lwc';

export default class LightningExampleMapControls extends LightningElement {
    mapMarkers = [
        {
            location: {
                Street: '1000 5th Ave',
                City: 'New York',
                State: 'NY',
            },

            title: 'Metropolitan Museum of Art',
            description:
                'A grand setting for one of the greatest collections of art, from ancient to contemporary.',
        },
    ];
    mapOptions = {
        draggable: false,
        disableDefaultUI: true,
    };
}
```

#### Marking Locations with Shapes

`lightning-map` enables you to customize your maps to use different indicators
for locations instead of the default Google Maps markers.

The `map-markers` attribute supports the `type` property to define colored shapes to mark a location. Available `type` values are `Circle`, `Rectangle`, and `Polygon`. The values are
case-sensitive.

The `type` property works with the following properties to define a shape's appearance.

| `type` Value | Property        | Property Type | Description                                                                                                                              |
| ------------ | --------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `Circle`     | `radius`        | number        | The number in meters for the radius of the circle. This value represents the Earth's surface included in the circle around the location. |
| `Rectangle`  | `bounds`        | object        | Uses `north` and `south` latitude values and `east` and `west` longitude values to specify the corners of the rectangle.                 |
| `Polygon`    | `paths`         | object        | Defines a set of `lat` and `lng` properties for the latitude and longitude coordinates of the polygon's shape.                           |
| All          | `strokeColor`   | string        | Hexadecimal color code or CSS3 color name for the stroke, which creates the edge of the shape.                                           |
|              | `strokeOpacity` | number        | The degree of transparency of the stroke. The value is between 0.0 and 1.0, where 0.0 is transparent and 1.0 is opaque.                  |
|              | `strokeWeight`  | number        | The stroke width in pixels.                                                                                                              |
|              | `fillColor`     | string        | Hexadecimal color code or CSS3 color name to fill the shape.                                                                             |
|              | `fillOpacity`   | number        | The degree of transparency of the fill for the shape. The value is between 0.0 and 1.0, where 0.0 is transparent and 1.0 is opaque.      |

#### Mark a Location with a Circle

This example creates a yellow circle to mark the location.

```html
<template>
    <lightning-map map-markers={mapMarkers} zoom-level="15"></lightning-map>
</template>
```

The `mapMarkers` object defines the `location` and the `type`. The properties specified after `type` define
the circle as having a 200 meter radius, and a yellow color #FFF000 for both the stroke edge and fill, with the edge more opaque than the fill.

```javascript
import { LightningElement } from 'lwc';

export default class MapCircleShape extends LightningElement {
    mapMarkers = [
        {
            location: {
                City: 'San Francisco',
                Country: 'USA',
                PostalCode: '94105',
                State: 'CA',
                Street: '50 Fremont St',
            },
            type: 'Circle',
            radius: 200,
            strokeColor: '#FFF000',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#FFF000',
            fillOpacity: 0.35,
        },
    ];
}
```

#### Mark a Location with a Rectangle

This example shows the JavaScript for defining a rectangle shape for a location.

The `mapMarkers` object sets the `type` to `Rectangle`. The `bounds` property defines the coordinates
of the rectangle for the location. Other properties define the characteristics of the stroke
and fill.

```javascript
import { LightningElement } from 'lwc';

export default class MapRectangleShapeExample extends LightningElement {
    mapMarkers = [
        {
            location: {
                City: 'San Francisco',
                Country: 'USA',
                PostalCode: '94105',
                State: 'CA',
                Street: '500 Howard St',
            },
            type: 'Rectangle',
            bounds: {
                north: 37.788,
                south: 37.774,
                east: -122.395,
                west: -122.412,
            },
            strokeColor: '#0b5411',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#0b5411',
            fillOpacity: 0.35,
        },
    ];
}
```

#### Mark a Location with a Polygon

This example sets the `type` to Polygon and draws a pink polygon with a black outline.
The polygon's segments are defined in the `paths` property using coordinates
specified by the `lat` and `lng` properties.

```javascript
import { LightningElement } from 'lwc';

export default class MapPolygonShape extends LightningElement {
    mapMarkers = [
        {
            location: {
                City: 'San Francisco',
                Country: 'USA',
                PostalCode: '94105',
                State: 'CA',
                Street: '425 Mission St',
            },
            type: 'Polygon',
            paths: [
                { lat: 37.78806990305951, lng: -122.39873856028704 },
                { lat: 37.790689809711886, lng: -122.39540189227252 },
                { lat: 37.79036762555352, lng: -122.39495128115801 },
                { lat: 37.787569651422224, lng: -122.39842742404132 },
                { lat: 37.7879172842749, lng: -122.39886730631976 },
                { lat: 37.7880699030595, lng: -122.39873856028704 },
            ],
            strokeColor: 'black',
            strokeOpacity: 0.35,
            strokeWeight: 2,
            fillColor: 'pink',
            fillOpacity: 0.35,
        },
    ];
}
```

#### Marking Locations with Custom Icons

Pass the `mapIcon` property to the `map-markers` attribute to specify an SVG icon image in place of the Google Maps marker.

Use either `type` or `mapIcon` to customize a given location. You can't use both for one location.

The `mapIcon` property works with the following properties to define the icon's appearance.

| Property        | Type   | Description                                                                                                                                                                                     |
| --------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `path`          | string | SVG path notation to add a vector-based symbol as the icon for a marker.                                                                                                                        |
| `scale`         | number | The amount by which the marker icon is scaled in size. The default value is 1. The marker icon size is multiplied by the scale value to produce the actual output size of the marker in pixels. |
| `anchor`        | Point | Coordinates used to align the marker to the map coordinates when the zoom level changes. The default anchor is (0,0) which can lead to the marker moving when you zoom out. Set the anchor coordinates to account for the width and height of the icon. For example, set the x value equal to half the image width and the y value equal to half the image height.
| `strokeColor`   | string | Hexadecimal color code or CSS3 color name for the stroke, which creates the edge of the custom icon.                                                                                            |
| `strokeOpacity` | number | The degree of transparency of the stroke. The value is between 0.0 and 1.0, where 0.0 is transparent and 1.0 is opaque.                                                                         |
| `strokeWeight`  | number | The stroke width in pixels. The default is 1.                                                                                                                                                   |
| `fillColor`     | string | Hexadecimal color code or CSS3 color name to fill the icon.                                                                                                                                     |
| `fillOpacity`   | number | The degree of transparency of the fill for the icon. The value is between 0.0 and 1.0, where 0.0 is transparent and 1.0 is opaque.                                                              |

This example creates a gold star without an outline as the marker. The list-view is made visible to show that a location with a custom marker is displayed in the list of markers.

```html
<template>
    <lightning-map
        map-markers={mapMarkers}
        zoom-level="15"
        list-view="visible"
    ></lightning-map>
</template>
```

The `path` creates a star that's 245px x 230px. Use an SVG editor to determine the image size, which helps
determine the `anchor` coordinates needed. See [MDN](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Tools_for_SVG)
for a list of SVG tools.

The `anchor` property sets the x coordinate to 122.5 which is half the width of the image, and sets the 
y coordinate to 115 which is half the height of the image. For more information about the `anchor` property, see 
[Markers with vector-based icons](https://developers.google.com/maps/documentation/javascript/markers#symbols) 
in the Google Maps Platform documentation.

The `scale` property sets the star to display at a comfortable size for the map viewed on a desktop.

```javascript
import { LightningElement } from 'lwc';

export default class MapCustomIconExample extends LightningElement {
    mapMarkers = [
        {
            location: {
                City: 'San Francisco',
                Country: 'USA',
                PostalCode: '94105',
                State: 'CA',
                Street: '415 Mission St',
            },
            mapIcon: {
            path: 'M 125,5 155,90 245,90 175,145 200,230 125,180 50,230 75,145 5,90 95,90 z',
            fillColor: 'gold',
            fillOpacity: .8,
            strokeWeight: 0,
            scale: .10,
            anchor: {x: 122.5, y: 115}
            },
        ];
    }
}
```

#### Geocoding Addresses

The `lightning-map` component relies on data from Google for geocoding and mapping imagery. Inaccuracies or geocoding errors in the data can't be fixed by Salesforce.

You can specify a maximum of 10 geocoded address lookups per map. Lookups for both the `map-markers` and `center` attributes count toward the limit of 10 geocoded addresses. To display more markers, provide location values using a pair of latitude and longitude coordinates, which don't require geocoding. Address locations that exceed the geocoding limit are ignored.

We recommend limiting your map to 100 locations in total. For example, if you provide map markers for 5 geocoded addresses, you can provide up to 95 extra markers using latitude and longitude.

All latitude and longitude values must be valid. If you pass in an invalid latitude or longitude, the markers aren't plotted on the map. Latitude values fall within -90 and 90, and longitude values fall within -180 and 180.

Also consider the following:

-   If you specify an address, you must provide at least one of the following values: City, PostalCode, State, or Country.
-   If you pass in both an address and a latitude and longitude, the map plots the marker according to the latitude and longitude values.
-   If a marker in the `map-markers` array is invalid, no markers are plotted on the map.

#### Usage Considerations

`lightning-map` uses the Google Maps Platform and is bound to its terms of service. The use of Google Maps Platform is prohibited in specific territories based on IP addresses. For more information, see [Google Maps Platform Prohibited Territories](https://cloud.google.com/maps-platform/terms/maps-prohibited-territories). `lightning-map` is not supported in these territories and does not load correctly when accessed from the IP addresses associated with these territories. Users in these territories can continue to use Google Maps directly as detailed at [Google Maps Platform Coverage Details](https://developers.google.com/maps/coverage).

#### Custom Events

**`markerselect`**

The event fired when a marker is selected. Select a marker by clicking it on the map or in the list of locations. The value of the selected marker is available on the `selected-marker-value` attribute on the component.

The `markerselect` event returns the following parameter.

| Parameter           | Type   | Description                                             |
| ------------------- | ------ | ------------------------------------------------------- |
| selectedMarkerValue | string | The unique identifier of the currently selected marker. |

The event properties are as follows.

| Property   | Value | Description                                                                                               |
| ---------- | ----- | --------------------------------------------------------------------------------------------------------- |
| bubbles    | true  | This event bubbles up through the DOM.                                                                    |
| cancelable | false | This event has no default behavior that can be canceled. You can't call `preventDefault()` on this event. |
| composed   | false | This event does not propagate outside the template in which it was dispatched.                            |
