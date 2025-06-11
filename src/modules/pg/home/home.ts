import { LightningElement } from 'lwc';

import { lwcLightningRoutes, auraLightningRoutes } from './routes';

export default class App extends LightningElement {
    lwcLightningRoutes = lwcLightningRoutes
    auraLightningRoutes = auraLightningRoutes
}
