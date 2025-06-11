import { LightningElement } from 'lwc';

export default class InputRichTextCustomButton extends LightningElement {
    replacement;
    start;
    end;
    selectMode;

    format;
    formatValue;

    formatOptions = [
        { label: 'font', value: 'font' },
        { label: 'size', value: 'size' },
        { label: 'link', value: 'link' },
        { label: 'bold', value: 'bold' },
        { label: 'list', value: 'list' },
        { label: 'clean', value: 'clean' },
        { label: 'code', value: 'code' },
    ];

    isCodeBlockFormat = false;

    showCustomMarkupButtons = true;
    preventCloseOnClickOut = true;
    showCustomButtonGroup = true;
    showToolBarButtonGroup = true;

    handleCodeBlockButtonClick() {
        // Toggle Code Block Button pressed state
        this.isCodeBlockFormat = !this.isCodeBlockFormat;
        const inputRichText = this.template.querySelector(
            'lightning-input-rich-text'
        );
        let format = inputRichText.getFormat();

        // Set or unset code-block format based on format on current selection
        if (format['code-block']) {
            inputRichText.setFormat({ 'code-block': false });
        } else {
            inputRichText.setFormat({ 'code-block': true });
        }
    }

    handleSelectionChange() {
        const inputRichText = this.template.querySelector(
            'lightning-input-rich-text'
        );
        let format = inputRichText.getFormat();

        // Update code-block button pressed state based on selection
        if (format['code-block']) {
            this.isCodeBlockFormat = true;
        } else {
            this.isCodeBlockFormat = false;
        }
    }

    handleShowCustomMarkupButton() {
        this.showCustomMarkupButtons = !this.showCustomMarkupButtons;
    }

    handleToggleCloseOnClickout() {
        this.preventCloseOnClickOut = !this.preventCloseOnClickOut;
    }

    handleReplacementChange(event) {
        this.replacement = event.detail.value;
    }

    handleStartChange(event) {
        this.start = parseInt(event.detail.value, 10);
    }

    handleEndChange(event) {
        this.end = parseInt(event.detail.value, 10);
    }

    handleSelectModeChange(event) {
        this.selectMode = event.detail.value;
    }

    handleClick() {
        const rte = this.template.querySelector('lightning-input-rich-text');
        rte.setRangeText(
            this.replacement,
            this.start,
            this.end,
            this.selectMode
        );
    }

    handleClickReset() {
        this.template.querySelector('lightning-input-rich-text').value =
            '1234567890';
    }

    handleFormatChange(event) {
        this.format = event.detail.value;
    }

    handleFormatValueChange(event) {
        if (this.format === 'bold') {
            this.formatValue = event.detail.value === 'true';
        } else {
            this.formatValue = event.detail.value;
        }
    }

    handleClickSetFormat() {
        const rte = this.template.querySelector('lightning-input-rich-text');
        const myFormat = this.format;
        const myFormatValue = this.formatValue;
        const formatObject = {};
        formatObject.key = this.format;
        formatObject[myFormat] = myFormatValue;
        rte.setFormat(formatObject);
        // rte.setFormat({bold: true, color: 'green'});
    }

    handleToggleSelect(event) {
        event.target.selected = !event.target.selected;
    }

    openPopup(event) {
        event.target.showPopup();
    }

    closePopup() {
        this.template
            .querySelectorAll('lightning-rich-text-toolbar-button')[0]
            .closePopup();
    }

    handleEvent(event) {
        this.eventFiredName = event.type;
    }

    handlePopupClickout(event) {
        if (this.preventCloseOnClickOut) {
            event.preventDefault();
        }
        this.eventFiredName = event.type;
    }

    handleShowToolBarButtonGroup(event) {
        this.showToolBarButtonGroup = event.detail.checked;
    }

    handleShowCustomButtonGroup(event) {
        this.showCustomButtonGroup = event.detail.checked;
    }
}
