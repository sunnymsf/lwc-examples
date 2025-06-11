import { LightningElement } from 'lwc';
import generateData from './generateData';

// Add <datatable-with-single-row-selection-mode></datatable-with-single-row-selection-mode> to the lwr-playground to see the table

const columns = [
    { label: 'Label', fieldName: 'name' },
    { label: 'Website', fieldName: 'website', type: 'url' },
    { label: 'Phone', fieldName: 'phone', type: 'phone' },
    { label: 'Balance', fieldName: 'amount', type: 'currency' },
    { label: 'CloseAt', fieldName: 'closeAt', type: 'date' },
];

export default class DatatableWithSingleRowSelectionMode extends LightningElement {
    data = [];
    columns = columns;
    selectedRows = ['1'];
    singleRowSelectionMode = 'radio';

    connectedCallback() {
        this.data = generateData({ amountOfRecords: 100 });
    }

    handleCheckboxChange(event) {
        this.singleRowSelectionMode = event.target.checked
            ? 'checkbox'
            : 'radio';
    }

    get useCheckbox() {
        return this.singleRowSelectionMode === 'checkbox';
    }
}
