import { LightningElement } from 'lwc';

export default class PopupSourceBasicExample extends LightningElement {
    handleSourceClick(event) {
        event.target.parentNode.open({
            alignment: 'bottom',
            autoFlip: true,
        });
    }

    handleClickOut() {
        this.popupSource.close();
    }

    handleClose() {
        this.popupSource.close();
    }

    get popupSource() {
        return this.template.querySelector('lightning-popup-source');
    }
}
