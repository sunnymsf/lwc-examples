import sdsHooks from './sds.hooks.custom-props.css';
import sldsHooks from './slds.hooks.custom-props.css';
import sldsSharedHooks from './slds.shared.hooks.custom-props.css';
import { isCSR } from 'lightning/utilsPrivate';

if (isCSR) {
    // these are prepended in array order, so they will appear in <head> in reverse
    [sldsSharedHooks, sldsHooks, sdsHooks].forEach( sheet => {
        const sheetString = sheet[0]();

        // use style elements
        const styleElement = document.createElement('style');
        styleElement.appendChild(document.createTextNode(sheetString));
        document.head.prepend(styleElement);
    });
}


export default '';
