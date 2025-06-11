import { LightningElement, wire, api } from 'lwc';
import { MessageContext } from 'lightning/messageService';

export default class MessageContextConsumer extends LightningElement {
    @wire(MessageContext) messageContext;

    @api
    getMessageContext() {
        return this.messageContext;
    }
}
