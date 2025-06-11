import { LightningElement } from 'lwc';
import exampleItems from './../../__mockData__/exampleData.js';

const { allOptions, initialItems } = exampleItems;
export default class MobileGroupedComboboxBasic extends LightningElement {
    inputText = '';
    noResults = false;
    currentInputValue = '';
    focusToggle = false;
    placeholder = 'Search here ...';
    items = initialItems;
    selectedOptionPillItem = '';
    showActivityIndicator = false;

    handleInputChange(event) {
        this.noResults = false;
        this.currentInputValue = event.detail.value;

        if (this.currentInputValue) {
            let obj = [];

            this.pushActionButtonItemIntoObject(obj);
            this.pushOptionsIntoObject(
                obj,
                `Results for "${this.currentInputValue}"`
            );

            if (obj[1].items.length === 0) {
                this.noResults = true;
                obj = [];
            }

            this.items = obj;
        } else {
            this.items = initialItems;
        }
    }

    handleSelected(event) {
        const selectedValue = event.detail.value;

        // If action button is clicked
        if (selectedValue === 'showAllResults') {
            if (this.currentInputValue) {
                let obj = [];
                this.pushOptionsIntoObject(
                    obj,
                    `All Results for "${this.currentInputValue}"`
                );
                this.items = obj;
            } else {
                this.items = initialItems;
            }
        } else {
            // If an option is selected
            allOptions.forEach((option) => {
                if (option.value === selectedValue) {
                    this.selectedOptionPillItem = [
                        {
                            type: 'icon',
                            label: option.text,
                            iconName: 'standard:contact',
                            alternativeText: 'Contact',
                        },
                    ];
                }
            });
        }
    }

    matchAndHighlightText(text) {
        let textParts = text;
        let matchFound = false;
        if (
            text.toLowerCase().indexOf(this.currentInputValue.toLowerCase()) >
            -1
        ) {
            matchFound = true;
            const startIndex = text
                .toLowerCase()
                .indexOf(this.currentInputValue.toLowerCase());
            const endIndex = startIndex + this.currentInputValue.length;
            textParts = [];
            textParts.push({
                text: text.slice(0, startIndex),
            });
            textParts.push({
                highlight: true,
                text: text.slice(startIndex, endIndex),
            });
            textParts.push({
                text: text.slice(endIndex),
            });
        }

        return {
            matchFound,
            textParts,
        };
    }

    constructOptionsList() {
        let itemsCopy = JSON.parse(JSON.stringify(allOptions));
        let optionItems = [];
        let optionText = {};
        let optionSubText = {};
        itemsCopy.forEach((item) => {
            optionText = this.matchAndHighlightText(item.text);
            optionSubText = this.matchAndHighlightText(item.subText);

            item.text = optionText.matchFound
                ? optionText.textParts
                : item.text;
            item.subText = optionSubText.matchFound
                ? optionSubText.textParts
                : item.subText;

            if (optionText.matchFound || optionSubText.matchFound) {
                optionItems.push(item);
            }
        });

        return optionItems;
    }

    pushActionButtonItemIntoObject(object) {
        object.push({
            type: 'action',
            action: true,
            text: 'Show All Results',
            value: 'showAllResults',
            endIconName: 'utility:search',
            endIconAlternativeText: 'Show all results',
        });
    }

    pushOptionsIntoObject(object, label) {
        const items = this.constructOptionsList();
        object.push({
            label,
            items,
        });
    }
}
