
import { LightningElement, track } from 'lwc';

import { examplesContent } from './examples';

const encodedJSONStringify = (value: any) => {
    const valueJson = JSON.stringify(value);
    return encodeURIComponent(valueJson);
};

export default class ComponentPlayground extends LightningElement {
    @track selectedExample;
    @track codeBlocksEncoded = '';
    @track exampleDescription = '';

    private popoverEl;
    private isExpanded: boolean = false;
    private button;

    get options() {
        return [
            { label: 'Basic Buttons', value: 'basic', info: 'Button variants display the buttons with different colors to convey different meanings. The default variant is neutral.' },
            { label: 'Disabled Buttons', value: 'disabled', info: 'Disabled buttons are grayed out and can\'t be clicked.' },
            { label: 'Buttons with Icons', value: 'withIcon', info: 'Buttons can include a utility icon next to the label for decorative purposes. The default icon position is left.' },
            { label: 'Inverse Buttons', value: 'inverse', info: 'Buttons with the inverse variant are transparent and have light-colored labels, which works well with a dark background.' },
            { label: 'Buttons with Custom onclick Actions', value: 'onclick', info: 'Buttons can use custom onclick handlers to perform actions.' },
            { label: 'Buttons with Accesskey and Tabindex Attributes', value: 'accesskey', info: 'Buttons define access key shortcuts with the accesskey attribute, and use the tabindex attribute to determine the order in which those buttons are visited when using the tab key.' }
        ].map((option: any) => ({
            ...option,
            active: this.selectedExample?.value === option.value,
            keyValue: option,
            iconSymbol: this.selectedExample?.value === option.value ? 'check' : 'none',
            iconSprite: this.selectedExample?.value === option.value ? 'utility' : null,
            iconColor: '#0176D3',
        }));
    }

    private onOptionClick(e: CustomEvent) {
        this.isExpanded = false;
        if (e.detail?.value !== this.selectedExample?.value) {
            this.selectedExample = e.detail;
            this.updateUIElements();
        }
        this.popoverEl?.closePopover();
    }

    get iconSymbol(): string {
        return this.isExpanded ? 'chevronup' : 'chevrondown';
    }

    applyStyle(component, styles) {
        Object.keys(styles).forEach(key => {
            component.style.setProperty(key, styles[key]);
        });
    }

    changeButtonStyle () {
        if (this.isExpanded) {
            this.button?.classList.add('expanded');
            this.button?.classList.remove('shrink');
        } else {
            this.button?.classList.add('shrink');
            this.button?.classList.remove('expanded');
        }
    }

    onButtonClick() {
        if (!this.isExpanded) {
            this.isExpanded = true;
            this.changeButtonStyle();
        }
    }

    onClose() {
        this.isExpanded = false;
        this.changeButtonStyle();
    }

    connectedCallback() {
        this.selectedExample = this.options[0];
        this.updateUIElements();
        requestAnimationFrame(() => {
            this.button = this.template?.querySelector('dx-button').shadowRoot?.querySelector('button');
            this.button?.classList.add('shrink');
            this.popoverEl = this.template?.querySelector('dx-popover');
        });
    }

    updateUIElements() {
        this.exampleDescription = this.selectedExample?.info || '';
        this.updateCodeBlocks();
    }

    updateCodeBlocks() {
        const example = examplesContent[this.selectedExample?.value];

        const codeBlockItems: { codeBlock: string, header: string, language: string }[] = [];

        example.forEach(({ label, language, content }) => {
            codeBlockItems.push({
                codeBlock: content,
                header: label,
                language: language
            });
        });

        // Encode the array of code blocks
        this.codeBlocksEncoded = encodedJSONStringify(codeBlockItems);
    }

    get isComponentBasic() {
        return this.selectedExample?.value === 'basic';
    }

    get isComponentDisabled() {
        return this.selectedExample?.value === 'disabled';
    }

    get isComponentWithIcon() {
        return this.selectedExample?.value === 'withIcon';
    }

    get isComponentInverse() {
        return this.selectedExample?.value === 'inverse';
    }

    get isComponentOnclick() {
        return this.selectedExample?.value === 'onclick';
    }

    get isComponentAccesskey() {
        return this.selectedExample?.value === 'accesskey';
    }
}