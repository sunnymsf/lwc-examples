
export const examplesContent: Record<string, any> = {'basic': [ { label: 'basic.html', language: 'html', content: `<template>
    <p class=\"slds-text-heading_small\">{activeSectionMessage}</p>

    <lightning-button onclick={handleSetActiveSectionC} label=\"Open Section C\"></lightning-button>

    <lightning-accordion class=\"example-accordion\"
                         onsectiontoggle={handleToggleSection}
                         active-section-name=\"B\">
        <lightning-accordion-section name=\"A\" label=\"Accordion Title A\">
            <lightning-button-menu slot=\"actions\"
                                  alternative-text=\"Show menu\"
                                  icon-size=\"x-small\"
                                  menu-alignment=\"right\">
                <lightning-menu-item value=\"New\" label=\"Menu Item One\"></lightning-menu-item>
                <lightning-menu-item value=\"Edit\" label=\"Menu Item Two\"></lightning-menu-item>
            </lightning-button-menu>
            <p>This is the content area for section A.</p>
            <p>.</p>
            <p>.</p>
            <p>.</p>
            <p>The section height expands to fit your content.</p>
        </lightning-accordion-section>

        <lightning-accordion-section name=\"B\" label=\"Accordion Title B\">
            <p>This is the content area for section B.</p>
            <p>.</p>
            <p>.</p>
            <p>.</p>
            <p>The section height expands to fit your content.</p>
        </lightning-accordion-section>

        <lightning-accordion-section name=\"C\" label=\"Accordion Title C\">
            <p>This is the content area for section C.</p>
            <p>.</p>
            <p>.</p>
            <p>.</p>
            <p>The section height expands to fit your content.</p>
        </lightning-accordion-section>
    </lightning-accordion>
</template>
`} ,
{ label: 'basic.js', language: 'js', content: `import { LightningElement } from \'lwc\';

export default class LightningExampleAccordionBasic extends LightningElement {
    activeSectionMessage = \'\';

    handleToggleSection(event) {
        this.activeSectionMessage = \'Open section name:  \' + event.detail.openSections;
    }

    handleSetActiveSectionC() {
        const accordion = this.template.querySelector(\'.example-accordion\');

        accordion.activeSectionName = \'C\';
    }
}
`}  ],
'conditional': [ { label: 'conditional.html', language: 'html', content: `<template>
    <p class=\"slds-text-heading_small\">{activeSectionMessage}</p>

    <lightning-button onclick={handleToggleSectionD} label=\"Toggle Section D\"></lightning-button>

    <lightning-accordion class=\"example-accordion\"
                         onsectiontoggle={handleToggleSection}
                         active-section-name=\"B\">
        <lightning-accordion-section name=\"A\" label=\"Accordion Title A\">
            <p>This is the content area for section A.</p>
            <p>Donec vitae tellus egestas, faucibus ipsum ac, imperdiet erat. Nam venenatis non ante at sagittis. Integer vel purus eget nunc semper placerat. Nam tristique quam leo, et posuere enim condimentum quis. Ut sagittis libero id lectus tempor maximus. Nunc ut tincidunt eros, a hendrerit leo. Suspendisse quis fermentum dolor. Nulla euismod consectetur leo, id condimentum nunc consequat quis.</p>
        </lightning-accordion-section>

        <lightning-accordion-section name=\"B\" label=\"Accordion Title B\">
            <p>This is the content area for section B.</p>
            <p>Nam at elit et justo scelerisque ullamcorper vel a felis. Mauris sit amet lorem sed est sagittis blandit nec ac turpis. Ut a mi id turpis pharetra ornare. Nullam rhoncus feugiat nunc, ac pulvinar felis pulvinar at. Nullam efficitur aliquet justo et ultricies. Maecenas eu felis aliquam, tincidunt elit at, suscipit leo. Duis ut urna nec nibh hendrerit lacinia. Sed non auctor libero. Sed pellentesque tempor mollis.</p>
        </lightning-accordion-section>

        <lightning-accordion-section name=\"C\" label=\"Accordion Title C\">
            <p>This is the content area for section C.</p>
            <p>Nulla ornare ipsum felis, vel aliquet dui blandit vel. Integer accumsan velit quis mauris pharetra, nec sollicitudin dui eleifend. Cras condimentum odio mi, nec ullamcorper arcu ullamcorper sed. Proin massa arcu, rutrum a ullamcorper nec, hendrerit in sem. Etiam tempus eros ut lorem tincidunt, id condimentum nulla molestie. Morbi hendrerit elit pretium, ultrices neque non, ullamcorper justo. Quisque vel nisi eget eros efficitur semper. Nulla pulvinar venenatis quam vitae efficitur. Nam facilisis sollicitudin quam ac imperdiet.</p>
        </lightning-accordion-section>

        <template if:true={isDVisible}>
            <lightning-accordion-section name=\"D\" label=\"Accordion Title D\">
                <p>This is the content area for section D.</p>
                <p>Suspendisse est eros, maximus et risus a, luctus bibendum eros. Etiam ultrices tellus vehicula neque ornare, viverra venenatis purus accumsan. Aenean viverra finibus odio, vitae bibendum nisi tincidunt sed. Ut at porta dui. Praesent varius eleifend quam eget gravida. Curabitur maximus, leo sit amet dapibus gravida, mi ligula lacinia turpis, id feugiat tellus urna quis odio. Nullam tristique orci eu magna hendrerit vestibulum. Sed id purus at metus tristique tristique et vitae arcu. Sed molestie odio felis, sit amet lacinia mauris rutrum nec. Morbi semper lacinia tellus bibendum faucibus. Vestibulum eget ornare sapien, eget ultrices orci.</p>
            </lightning-accordion-section>
        </template>
    </lightning-accordion>
</template>
`} ,
{ label: 'conditional.js', language: 'js', content: `import { LightningElement } from \'lwc\';

export default class LightningExampleAccordionConditional extends LightningElement {
    activeSectionMessage = \'\';
    isDVisible = false;

    handleToggleSection(event) {
        this.activeSectionMessage = \'Open section name:  \' + event.detail.openSections;
    }

    handleToggleSectionD() {
        this.isDVisible = !this.isDVisible;
    }

    get isMessageVisible() {
        return this.activeSectionMessage.length > 0;
    }
}
`}  ],
'multiple': [ { label: 'multiple.html', language: 'html', content: `<template>
    <p>{activeSectionsMessage}</p>

    <lightning-accordion allow-multiple-sections-open
                         onsectiontoggle={handleSectionToggle}
                         active-section-name={activeSections}>
        <lightning-accordion-section name=\"A\" label=\"Accordion Title A\">
            <p>This is the content area for section A.</p>
            <p>Donec vitae tellus egestas, faucibus ipsum ac, imperdiet erat. Nam venenatis non ante at sagittis. Integer vel purus eget nunc semper placerat. Nam tristique quam leo, et posuere enim condimentum quis. Ut sagittis libero id lectus tempor maximus. Nunc ut tincidunt eros, a hendrerit leo. Suspendisse quis fermentum dolor. Nulla euismod consectetur leo, id condimentum nunc consequat quis.</p>
        </lightning-accordion-section>

        <lightning-accordion-section name=\"B\" label=\"Accordion Title B\">
            <p>This is the content area for section B.</p>
            <p>Nam at elit et justo scelerisque ullamcorper vel a felis. Mauris sit amet lorem sed est sagittis blandit nec ac turpis. Ut a mi id turpis pharetra ornare. Nullam rhoncus feugiat nunc, ac pulvinar felis pulvinar at. Nullam efficitur aliquet justo et ultricies. Maecenas eu felis aliquam, tincidunt elit at, suscipit leo. Duis ut urna nec nibh hendrerit lacinia. Sed non auctor libero. Sed pellentesque tempor mollis.</p>
        </lightning-accordion-section>

        <lightning-accordion-section name=\"C\" label=\"Accordion Title C\">
            <p>This is the content area for section C.</p>
            <p>Nulla ornare ipsum felis, vel aliquet dui blandit vel. Integer accumsan velit quis mauris pharetra, nec sollicitudin dui eleifend. Cras condimentum odio mi, nec ullamcorper arcu ullamcorper sed. Proin massa arcu, rutrum a ullamcorper nec, hendrerit in sem. Etiam tempus eros ut lorem tincidunt, id condimentum nulla molestie. Morbi hendrerit elit pretium, ultrices neque non, ullamcorper justo. Quisque vel nisi eget eros efficitur semper. Nulla pulvinar venenatis quam vitae efficitur. Nam facilisis sollicitudin quam ac imperdiet.</p>
        </lightning-accordion-section>
    </lightning-accordion>
</template>
`} ,
{ label: 'multiple.js', language: 'js', content: `import { LightningElement } from \'lwc\';

export default class LightningExampleAccordionMultiple extends LightningElement {
    activeSections = [\'A\', \'C\'];
    activeSectionsMessage = \'\';

    handleSectionToggle(event) {
        const openSections = event.detail.openSections;

        if (openSections.length === 0) {
            this.activeSectionsMessage = \'All sections are closed\';
        } else {
            this.activeSectionsMessage = \'Open sections: \' + openSections.join(\', \');
        }
    }
}
`}  ]};
