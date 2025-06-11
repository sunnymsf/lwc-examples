import { LightningElement } from 'lwc';

export default class InputRichTextBottomToolbar extends LightningElement {
    myVal = '**Hello**';

    changeHandler(event) {
        this.myVal = event.detail.value;
    }
}
