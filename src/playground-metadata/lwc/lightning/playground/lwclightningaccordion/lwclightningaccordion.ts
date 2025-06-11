
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
            { label: 'Basic Accordion', value: 'basic', info: 'Accordion with a pre-selected open section, and a button that programmatically opens another section. By default, only one section can be open at a time. You can close a section by opening another section.' },
            { label: 'Accordion with Conditional Section', value: 'conditional', info: 'Accordion sections can be toggled to be visible or not.' },
            { label: 'Accordion with Multiple Open Sections', value: 'multiple', info: 'Accordion sections can be open or closed without restrictions, programmatically or by clicking the section headers.' }
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

    get isComponentConditional() {
        return this.selectedExample?.value === 'conditional';
    }

    get isComponentMultiple() {
        return this.selectedExample?.value === 'multiple';
    }
}