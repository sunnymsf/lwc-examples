
export const examplesContent: Record<string, any> = {'basic': [ { label: 'basic.html', language: 'html', content: `<template>
    <div class=\"slds-m-top_medium slds-m-bottom_x-large\">
        <h2 class=\"slds-text-heading_medium slds-m-bottom_medium\">
            Button group using simple buttons.
        </h2>

        <!-- Button group: simple buttons -->
        <lightning-button-group>
            <lightning-button label=\"Refresh\"></lightning-button>
            <lightning-button label=\"Edit\"></lightning-button>
            <lightning-button label=\"Save\"></lightning-button>
        </lightning-button-group>
    </div>

    <div class=\"slds-m-top_medium slds-m-bottom_x-large\">
        <h2 class=\"slds-text-heading_medium slds-m-bottom_medium\">
            Button group using several button variations.
        </h2>

        <!-- Button group: simple buttons -->
        <lightning-button-group>
            <lightning-button label=\"Refresh\"></lightning-button>
            <lightning-button label=\"Edit\"></lightning-button>
            <lightning-button label=\"Save\" icon-name=\"utility:save\"></lightning-button>
            <lightning-button label=\"Delete\" variant=\"destructive\" icon-name=\"utility:delete\"></lightning-button>
        </lightning-button-group>
    </div>

    <div class=\"slds-m-top_medium slds-m-bottom_x-large\">
        <h2 class=\"slds-text-heading_medium slds-m-bottom_medium\">
            Button group using several button types (standard, icon, stateful, icon-stateful, menu).
        </h2>

        <!-- Button group: simple buttons -->
        <lightning-button-group>
            <lightning-button label=\"Refresh\"></lightning-button>
            <lightning-button label=\"Edit\"></lightning-button>
            <lightning-button label=\"Save\" icon-name=\"utility:save\"></lightning-button>
            <lightning-button-icon icon-name=\"utility:delete\" variant=\"border-filled\" alternative-text=\"Delete\"></lightning-button-icon>
            <lightning-button-icon icon-name=\"utility:settings\" variant=\"border-filled\" alternative-text=\"Settings\"></lightning-button-icon>
            <lightning-button-stateful
                selected={buttonStatefulState}
                label-when-off=\"Follow\"
                label-when-on=\"Following\"
                label-when-hover=\"Unfollow\"
                icon-name-when-off=\"utility:add\"
                icon-name-when-on=\"utility:check\"
                icon-name-when-hover=\"utility:close\"
                onclick={handleButtonStatefulClick}
            ></lightning-button-stateful>
            <lightning-button-icon-stateful
                icon-name=\"utility:like\"
                selected={buttonIconStatefulState}
                alternative-text=\"Like\"
                onclick={handleButtonIconStatefulClick}>
            </lightning-button-icon-stateful>
            <lightning-button-menu alternative-text=\"Show menu\">
                <lightning-menu-item label=\"Menu Item One\" value=\"item1\"></lightning-menu-item>
                <lightning-menu-item label=\"Menu Item Two\" value=\"item2\"></lightning-menu-item>
                <lightning-menu-item label=\"Menu Item Three\" value=\"item3\"></lightning-menu-item>
            </lightning-button-menu>
        </lightning-button-group>
    </div>
</template>
`} ,
{ label: 'basic.js', language: 'js', content: `import { LightningElement } from \'lwc\';

export default class ButtonGroupBasic extends LightningElement {
    buttonStatefulState = false;
    buttonIconStatefulState = false;

    handleButtonStatefulClick() {
        this.buttonStatefulState = !this.buttonStatefulState;
    }

    handleButtonIconStatefulClick() {
        this.buttonIconStatefulState = !this.buttonIconStatefulState;
    }
}
`}  ],
'disabled': [ { label: 'disabled.html', language: 'html', content: `<template>
    <div class=\"slds-m-top_medium slds-m-bottom_x-large\">
        <h2 class=\"slds-text-heading_medium slds-m-bottom_medium\">
            Button group with simple disabled buttons.
        </h2>

        <!-- Button group: simple buttons -->
        <lightning-button-group>
            <lightning-button label=\"Refresh\" disabled></lightning-button>
            <lightning-button label=\"Edit\" disabled></lightning-button>
            <lightning-button label=\"Save\" disabled></lightning-button>
        </lightning-button-group>
    </div>

    <div class=\"slds-m-top_medium slds-m-bottom_x-large\">
        <h2 class=\"slds-text-heading_medium slds-m-bottom_medium\">
            Button group with several disabled button variations.
        </h2>

        <!-- Button group: simple buttons -->
        <lightning-button-group>
            <lightning-button label=\"Refresh\" disabled></lightning-button>
            <lightning-button label=\"Edit\" disabled></lightning-button>
            <lightning-button label=\"Save\" icon-name=\"utility:save\" disabled></lightning-button>
            <lightning-button label=\"Delete\" variant=\"destructive\" icon-name=\"utility:delete\" disabled></lightning-button>
        </lightning-button-group>
    </div>
</template>
`} ,
{ label: 'disabled.js', language: 'js', content: `import { LightningElement } from \'lwc\';

export default class ButtonGroupDisabled extends LightningElement {}
`}  ],
'inverse': [ { label: 'inverse.css', language: 'css', content: `.lgc-bg-inverse {
    background-color: rgb(22 50 92);
}
`} ,
{ label: 'inverse.html', language: 'html', content: `<template>
    <div class=\"slds-m-top_medium slds-m-bottom_x-large\">
        <h2 class=\"slds-text-heading_medium slds-m-bottom_medium\">
            Button group inverse variant with simple buttons.
        </h2>

        <div class=\"slds-p-around_medium lgc-bg-inverse\">
            <!-- Button group: simple buttons -->
            <lightning-button-group>
                <lightning-button label=\"Refresh\" variant=\"inverse\"></lightning-button>
                <lightning-button label=\"Edit\" variant=\"inverse\"></lightning-button>
                <lightning-button label=\"Save\" variant=\"inverse\"></lightning-button>
            </lightning-button-group>
        </div>
    </div>

    <div class=\"slds-m-top_medium slds-m-bottom_x-large\">
        <h2 class=\"slds-text-heading_medium slds-m-bottom_medium\">
            Button group inverse variant with several button variations.
        </h2>

        <div class=\"slds-p-around_medium lgc-bg-inverse\">
            <!-- Button group: button variantions -->
            <lightning-button-group>
                <lightning-button label=\"Refresh\" variant=\"inverse\"></lightning-button>
                <lightning-button label=\"Edit\" variant=\"inverse\"></lightning-button>
                <lightning-button label=\"Save\" icon-name=\"utility:save\" variant=\"inverse\"></lightning-button>
                <lightning-button label=\"Delete\" icon-name=\"utility:delete\" variant=\"inverse\"></lightning-button>
            </lightning-button-group>
        </div>
    </div>
</template>
`} ,
{ label: 'inverse.js', language: 'js', content: `import { LightningElement } from \'lwc\';

export default class ButtonGroupInverse extends LightningElement {}
`}  ],
'withMenu': [ { label: 'withMenu.html', language: 'html', content: `<template>
    <div class=\"slds-m-top_medium slds-m-bottom_x-large\">
        <h2 class=\"slds-text-heading_medium slds-m-bottom_medium\">
            Button group using simple buttons and a <em>buttonMenu</em>.
        </h2>

        <!-- Button group: simple buttons and a button-menu -->
        <lightning-button-group>
            <lightning-button label=\"Refresh\"></lightning-button>
            <lightning-button label=\"Edit\"></lightning-button>
            <lightning-button label=\"Save\" icon-name=\"utility:save\"></lightning-button>
            <lightning-button-menu alternative-text=\"Show menu\" variant=\"border-filled\">
                <lightning-menu-item label=\"Menu Item One\" value=\"item1\"></lightning-menu-item>
                <lightning-menu-item label=\"Menu Item Two\" value=\"item2\"></lightning-menu-item>
                <lightning-menu-item label=\"Menu Item Three\" value=\"item3\"></lightning-menu-item>
            </lightning-button-menu>
        </lightning-button-group>
    </div>
</template>
`} ,
{ label: 'withMenu.js', language: 'js', content: `import { LightningElement } from \'lwc\';

export default class ButtonGroupWithMenu extends LightningElement {}
`}  ],
'withMenuDisabled': [ { label: 'withMenuDisabled.html', language: 'html', content: `<template>
    <div class=\"slds-m-top_medium slds-m-bottom_x-large\">
        <h2 class=\"slds-text-heading_medium slds-m-bottom_medium\">
            Button group using simple buttons and a disabled <em>buttonMenu</em>.
        </h2>

        <!-- Button group: simple buttons and a button-menu -->
        <lightning-button-group>
            <lightning-button label=\"Refresh\"></lightning-button>
            <lightning-button label=\"Edit\"></lightning-button>
            <lightning-button label=\"Save\" icon-name=\"utility:save\"></lightning-button>
            <lightning-button-menu alternative-text=\"Show menu\" variant=\"border-filled\" disabled>
                <lightning-menu-item label=\"Menu Item One\" value=\"item1\"></lightning-menu-item>
                <lightning-menu-item label=\"Menu Item Two\" value=\"item2\"></lightning-menu-item>
                <lightning-menu-item label=\"Menu Item Three\" value=\"item3\"></lightning-menu-item>
            </lightning-button-menu>
        </lightning-button-group>
    </div>
</template>
`} ,
{ label: 'withMenuDisabled.js', language: 'js', content: `import { LightningElement } from \'lwc\';

export default class ButtonGroupWithMenuDisabled extends LightningElement {}
`}  ]};
