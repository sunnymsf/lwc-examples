
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
            { label: 'Basic Button Groups', value: 'basic', info: 'Several button groups demonstrating default simple buttons, buttons with icons and variants, and a diverse set of button types contained in a single button group.' },
            { label: 'Button Groups with Disabled Buttons', value: 'disabled', info: 'Button groups containing disabled buttons, which are grayed out and can\'t be clicked. Buttons are disabled individually.' },
            { label: 'Button Groups with Inverse Buttons', value: 'inverse', info: 'Group of buttons that set the inverse variant, which displays with a dark background. The variant is set on each button.' },
            { label: 'Button Group with a Dropdown Menu', value: 'withMenu', info: 'This button group includes a lightning-button-menu as the last button, to provide a dropdown menu.' },
            { label: 'Button Group with a Disabled Dropdown Menu', value: 'withMenuDisabled', info: 'This button group\'s dropdown menu is disabled and can\'t be clicked.' }
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

    get isComponentInverse() {
        return this.selectedExample?.value === 'inverse';
    }

    get isComponentWithMenu() {
        return this.selectedExample?.value === 'withMenu';
    }

    get isComponentWithMenuDisabled() {
        return this.selectedExample?.value === 'withMenuDisabled';
    }
}