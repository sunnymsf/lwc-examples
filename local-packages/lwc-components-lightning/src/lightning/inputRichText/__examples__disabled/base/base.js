import { LightningElement } from 'lwc';

export default class InputRichTextBase extends LightningElement {
    myVal = '**Hello**';

    changeHandler(event) {
        this.myVal = event.detail.value;
    }
}
