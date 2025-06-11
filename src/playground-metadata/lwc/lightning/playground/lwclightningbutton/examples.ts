
export const examplesContent: Record<string, any> = {'basic': [ { label: 'basic.html', language: 'html', content: `<template>
    <div class=\"slds-m-top_small slds-m-bottom_medium\">
        <h2 class=\"slds-text-heading_small slds-m-bottom_small\">
            Click the buttons to activate the <code>onclick</code> handler and view the label of the clicked button.
        </h2>

        <!-- Base variant: Makes a button look like a link -->
        <lightning-button variant=\"base\" label=\"Base\" title=\"Looks like a link\" onclick={handleClick} class=\"slds-m-left_x-small\"></lightning-button>

        <!-- Neutral variant (default) -->
        <lightning-button label=\"Neutral\" title=\"Non-primary action\" onclick={handleClick} class=\"slds-m-left_x-small\"></lightning-button>

        <!-- Brand variant: Identifies the primary action in a group of buttons -->
        <lightning-button variant=\"brand\" label=\"Brand\" title=\"Primary action\" onclick={handleClick} class=\"slds-m-left_x-small\"></lightning-button>

        <!-- Brand outline variant: Identifies the primary action in a group of buttons, but has a lighter look -->
        <lightning-button variant=\"brand-outline\" label=\"Brand Outline\" title=\"Primary action with lighter look\" onclick={handleClick} class=\"slds-m-left_x-small\"></lightning-button>

        <!-- Destructive variant: Identifies a potentially negative action -->
        <lightning-button variant=\"destructive\" label=\"Destructive\" title=\"Destructive action\" onclick={handleClick} class=\"slds-m-left_x-small\"></lightning-button>

        <!-- Destructive text variant: Identifies a potentially negative action, but has a lighter look -->
        <lightning-button variant=\"destructive-text\" label=\"Destructive Text\" title=\"Destructive action with a lighter look\" onclick={handleClick} class=\"slds-m-left_x-small\"></lightning-button>

        <!-- Success variant: Identifies a successful action -->
        <lightning-button variant=\"success\" label=\"Success\" title=\"Successful action\" onclick={handleClick} class=\"slds-m-left_x-small\"></lightning-button>
    </div>

    <div class=\"slds-m-vertical_medium\">
        <p>The label of the button that was clicked is: <span class=\"slds-text-heading_small\">{clickedButtonLabel}</span></p>
    </div>
</template>
`} ,
{ label: 'basic.js', language: 'js', content: `import { LightningElement } from \'lwc\';

export default class ButtonBasic extends LightningElement {
    clickedButtonLabel;

    handleClick(event) {
        this.clickedButtonLabel = event.target.label;
    }
}
`}  ],
'disabled': [ { label: 'disabled.html', language: 'html', content: `<template>
    <div class=\"slds-m-top_small slds-m-bottom_medium\">
        <h2 class=\"slds-text-heading_small slds-m-bottom_small\">
                These buttons don\'t respond when you click them.
            </h2>

            <!-- Base variant: Makes a button look like a link -->
            <lightning-button variant=\"base\" label=\"Base\" title=\"Looks like a link\" disabled class=\"slds-m-left_x-small\"></lightning-button>

            <!-- Neutral variant (default) -->
            <lightning-button label=\"Neutral\" title=\"Non-primary action\" disabled class=\"slds-m-left_x-small\"></lightning-button>

            <!-- Brand variant: Identifies the primary action in a group of buttons -->
            <lightning-button variant=\"brand\" label=\"Brand\" title=\"Primary action\" disabled class=\"slds-m-left_x-small\"></lightning-button>

            <!-- Brand outline variant -->
            <lightning-button variant=\"brand-outline\" label=\"Brand Outline\" title=\"Primary action with lighter look\" disabled class=\"slds-m-left_x-small\"></lightning-button>

            <!-- Destructive variant: Identifies a potentially negative action -->
            <lightning-button variant=\"destructive\" label=\"Destructive\" title=\"Destructive action\" disabled class=\"slds-m-left_x-small\"></lightning-button>

            <!-- Destructive text variant: This button is used to indicate a destructive action to the user, like permanently erasing data.  -->
            <lightning-button variant=\"destructive-text\" label=\"Destructive Text\" title=\"Destructive action with a lighter look\" disabled class=\"slds-m-left_x-small\"></lightning-button>

            <!-- Success variant: Identifies a successful action -->
            <lightning-button variant=\"success\" label=\"Success\" title=\"Success\" disabled class=\"slds-m-left_x-small\"></lightning-button>
        </div>
    </template>
`} ,
{ label: 'disabled.js', language: 'js', content: `import { LightningElement } from \'lwc\';

export default class ButtonDisabled extends LightningElement {}
`}  ],
'withIcon': [ { label: 'withIcon.html', language: 'html', content: `<template>
        <div class=\"slds-m-top_small slds-m-bottom_medium\">
            <h2 class=\"slds-text-heading_small slds-m-bottom_small\">
                Buttons with an icon before the label text, the default location.
            </h2>
                <p class=\"slds-m-bottom_medium\">
                    <code>icon-position</code> attribute is omitted to use the default value of <code>left</code>.
                </p>

            <!-- Base variant: Makes a button look like a link -->
            <lightning-button variant=\"base\" label=\"Download\" title=\"Download action with base variant\" icon-name=\"utility:download\" class=\"slds-m-left_x-small\"></lightning-button>

            <!-- Neutral variant (default) -->
            <lightning-button label=\"Download\" title=\"Download action\" icon-name=\"utility:download\" class=\"slds-m-left_x-small\"></lightning-button>

            <!-- Brand variant: Identifies the primary action in a group of buttons -->
            <lightning-button variant=\"brand\" label=\"Download\" title=\"Download action with brand variant\" icon-name=\"utility:download\" class=\"slds-m-left_x-small\"></lightning-button>

            <!-- Destructive variant: Identifies a potentially negative action -->
            <lightning-button variant=\"destructive\" label=\"Delete\" title=\"Delete action with destructive variant\" icon-name=\"utility:delete\" class=\"slds-m-left_x-small\"></lightning-button>
        </div>

        <div class=\"slds-m-top_x-large slds-m-bottom_small\">
                <h2 class=\"slds-text-heading_small slds-m-bottom_small\">
                  Buttons with an icon after the label text.
                 </h2>
                 <p class=\"slds-m-bottom_medium\">
                     <code>icon-position</code> attribute has a value of <code>right</code>.
                 </p>

                <!-- Base variant: Makes a button look like a link -->
                <lightning-button variant=\"base\" label=\"Download\" title=\"Download action\" icon-name=\"utility:download\" icon-position=\"right\" class=\"slds-m-left_x-small\"></lightning-button>

                <!-- Neutral variant (default) -->
                <lightning-button label=\"Download\" title=\"Download action\" icon-name=\"utility:download\" icon-position=\"right\" class=\"slds-m-left_x-small\"></lightning-button>

                <!-- Brand variant: Identifies the primary action in a group of buttons -->
                <lightning-button variant=\"brand\" label=\"Download\" title=\"Download action\" icon-name=\"utility:download\" icon-position=\"right\" class=\"slds-m-left_x-small\"></lightning-button>

                <!-- Destructive variant: Identifies a potentially negative action -->
                <lightning-button variant=\"destructive\" label=\"Delete\" title=\"Delete action\" icon-name=\"utility:delete\" icon-position=\"right\" class=\"slds-m-left_x-small\"></lightning-button>
            </div>
    </template>
`} ,
{ label: 'withIcon.js', language: 'js', content: `import { LightningElement } from \'lwc\';

export default class ButtonWithIcon extends LightningElement {}
`}  ],
'inverse': [ { label: 'inverse.css', language: 'css', content: `.lgc-bg-inverse {
    background-color: rgb(22 50 92);
}

.slds-m-left_x-small {
    margin-left: 0.5rem;
}
  
.slds-p-around_medium {
   padding: 1rem;
}
`} ,
{ label: 'inverse.html', language: 'html', content: `<template>
        <div class=\"slds-m-top_small slds-m-bottom_small\">
                <h2 class=\"slds-text-heading_small slds-m-bottom_xx-small\">
                    Inverse variant of buttons with varying attribute values.
                </h2>
                <p class=\"slds-m-bottom_medium\">
                    <code>variant</code> attribute has a value of <code>inverse</code>
                </p>

            <div class=\"slds-p-around_medium lgc-bg-inverse\"
            style=\"display: flex\">
                <!-- Basic button -->
                <lightning-button variant=\"inverse\" label=\"Download\" title=\"Download action\" class=\"slds-m-left_x-small\"></lightning-button>

                <!-- Button with icon before the label text -->
                <lightning-button variant=\"inverse\" label=\"Download\" title=\"Download action\" icon-name=\"utility:download\" class=\"slds-m-left_x-small\"></lightning-button>

                <!-- Button with icon after the label text -->
                <lightning-button variant=\"inverse\" label=\"Download\" title=\"Download action\" icon-name=\"utility:download\" icon-position=\"right\" class=\"slds-m-left_x-small\"></lightning-button>
            </div>
        </div>

        <div class=\"slds-m-top_medium slds-m-bottom_x-large\">
                <h2 class=\"slds-text-heading_small slds-m-bottom_xx-small\">
                    Inverse variant of buttons that are disabled.
                </h2>
            <ul class=\"slds-list_dotted slds-m-bottom_medium\">
                <li><code>variant</code> attribute has a value of <code>inverse</code></li>
                <li><code>disabled</code> attribute is present</li>
            </ul>

            <div class=\"slds-p-around_medium lgc-bg-inverse\" style=\"display: flex\">
                <!-- Button that is disabled -->
                <lightning-button variant=\"inverse\" label=\"Delete\" title=\"Delete action\" disabled class=\"slds-m-left_x-small\"></lightning-button>

                <!-- Button that is disabled and has an icon before the label text -->
                <lightning-button variant=\"inverse\" label=\"Delete\" title=\"Delete action\" disabled icon-name=\"utility:delete\" class=\"slds-m-left_x-small\"></lightning-button>

                <!-- Button that is disabled and has an icon after the label text -->
                <lightning-button variant=\"inverse\" label=\"Delete\" title=\"Delete action\" disabled icon-name=\"utility:delete\" icon-position=\"right\" class=\"slds-m-left_x-small\"></lightning-button>
            </div>
        </div>
    </template>
`} ,
{ label: 'inverse.js', language: 'js', content: `import { LightningElement } from \'lwc\';

export default class ButtonInverse extends LightningElement {}
`}  ],
'onclick': [ { label: 'onclick.html', language: 'html', content: `<template>
        <div class=\"slds-m-top_medium slds-m-bottom_x-large\">
            <h2 class=\"slds-text-heading_small slds-m-bottom_medium\">
                Buttons with custom <code>onclick</code> handlers.
            </h2>
            <div class=\"slds-card\">
                <div class=\"slds-m-around_medium\">
                    <p class=\"slds-text-heading_x-small slds-m-bottom_medium\">
                        This button\'s handler toggles the icon used on the button and visibility of a content block. </p>
                    <!-- Toggle visibility of a content block when clicked -->
                    <lightning-button label={toggleButtonLabel} title=\"Toggle content action\" icon-name={toggleIconName}
                        onclick={handleToggleClick}>
                    </lightning-button>
                </div>
                <div class=\"slds-m-vertical_large slds-m-around_medium lgc-id_content-toggle\">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
                    dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip
                    ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu
                    fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia
                    deserunt mollit anim id est laborum.
                </div>
            </div>
            <div class=\"slds-card\">
                <div class=\"slds-m-around_medium\">
                    <p class=\"slds-text-heading_x-small slds-m-top_medium slds-m-bottom_large\">
                        This button\'s handler generates random content.</p>

                    <!-- Generate random content when clicked -->
                    <lightning-button label=\"Random greek letter\" title=\"Random greek letter action\"
                        icon-name=\"utility:refresh\" onclick={handleRandomClick} class=\"slds-m-left_x-small\">
                    </lightning-button>
                    <div class=\"slds-m-vertical_large slds-p-vertical_medium slds-border_top slds-border_bottom\">
                        Random greek letter: <span class=\"slds-text-heading_small\">{greekLetter}</span>
                    </div>
                </div>
            </div>
        </div>
    </template>
`} ,
{ label: 'onclick.js', language: 'js', content: `import { LightningElement, track } from \'lwc\';

export default class ButtonOnclick extends LightningElement {
    toggleIconName = \'utility:preview\';
    toggleButtonLabel = \'Hide content\';
    @track greekLetter;

    // when the component is first initialized assign an initial value to the \`greekLetter\` variable
    connectedCallback() {
        this.greekLetter = this.getRandomGreekLetter();
    }

    // Handles click on the \'Show/hide content\' button
    handleToggleClick() {
        // retrieve the classList from the specific element
        const contentBlockClasslist =
            this.template.querySelector(\'.lgc-id_content-toggle\').classList;
        // toggle the hidden class
        contentBlockClasslist.toggle(\'slds-hidden\');

        // if the current icon-name is \`utility:preview\` then change it to \`utility:hide\`
        if (this.toggleIconName === \'utility:preview\') {
            this.toggleIconName = \'utility:hide\';
            this.toggleButtonLabel = \'Reveal content\';
        } else {
            this.toggleIconName = \'utility:preview\';
            this.toggleButtonLabel = \'Hide content\';
        }
    }

    // Handles click on the \'Random greek letter\' button
    handleRandomClick() {
        this.greekLetter = this.getRandomGreekLetter();
    }

    // internal only method of this example component
    // :: this generates a random greek letter string that is inserted into the template
    getRandomGreekLetter() {
        // retrieve a random greek letter from the array
        const letter = this.greek[Math.floor(Math.random() * this.greek.length)];

        // create a temporary <textarea> element using the DOMParser
        // :: this allows for the pretty formatting using the HTML character entities such as \`&alpha;\`
        // :: this allows the browser to automatically convert the string to proper HTML
        const textarea = new DOMParser().parseFromString(
            \`<textarea>\${letter} [ &\${letter}; ]</textarea>\`,
            \'text/html\',
        ).body.firstChild;

        // return the final converted value for output in our component
        return textarea.value;
    }

    // list of greek letter names
    greek = [
        \'alpha\',
        \'theta\',
        \'tau\',
        \'beta\',
        \'vartheta\',
        \'pi\',
        \'upsilon\',
        \'gamma\',
        \'iota\',
        \'varpi\',
        \'phi\',
        \'delta\',
        \'kappa\',
        \'rho\',
        \'varphi\',
        \'epsilon\',
        \'lambda\',
        \'varrho\',
        \'chi\',
        \'varepsilon\',
        \'mu\',
        \'sigma\',
        \'psi\',
        \'zeta\',
        \'nu\',
        \'varsigma\',
        \'omega\',
        \'eta\',
        \'xi\',
        \'Gamma\',
        \'Lambda\',
        \'Sigma\',
        \'Psi\',
        \'Delta\',
        \'Xi\',
        \'Upsilon\',
        \'Omega\',
        \'Theta\',
        \'Pi\',
        \'Phi\',
    ];
}
`}  ],
'accesskey': [ { label: 'accesskey.css', language: 'css', content: `kbd {
    background-color: #eee;
    border-radius: 3px;
    border: 1px solid #b4b4b4;
    box-shadow: 0 1px 1px rgb(0 0 0 / 20%), 0 2px 0 0 rgb(255 255 255 / 70%) inset;
    color: #333;
    display: inline-block;
    font-family: consolas,\"Liberation Mono\",courier,monospace;
    font-size: .85em;
    font-weight: 700;
    line-height: 1;
    padding: 2px 4px;
    white-space: nowrap;
}
`} ,
{ label: 'accesskey.html', language: 'html', content: `<template>
    <div class=\"slds-m-top_xx-small slds-m-bottom_xx-small\">
        <h2 class=\"slds-text-heading_small slds-m-bottom_xx-small\">
            Buttons with custom access keys.
        </h2>
        <div class=\"slds-m-bottom_medium slds-p-bottom_medium slds-border_bottom\">
            To activate the buttons using the access key, press the following keys:
            <ul class=\"slds-list_dotted\">
                <li class=\"slds-m-vertical_x-small\">Mac: &nbsp;<kbd>Control</kbd>&nbsp;+&nbsp;<kbd>Alt</kbd>&nbsp;+&nbsp;<kbd><em>key</em></kbd></li>
                <li class=\"slds-m-vertical_x-small\">Windows: &nbsp;<kbd>Alt</kbd>&nbsp;+&nbsp;<kbd><em>key</em></kbd></li>
                <li class=\"slds-m-vertical_x-small\">Firefox on Windows: &nbsp;<kbd>Alt</kbd>&nbsp;+&nbsp;<kbd>Shift</kbd>&nbsp;+&nbsp;<kbd><em>key</em></kbd></li>
            </ul>
        </div>
        <p>
            The <code>accesskey</code> attribute has a value specified in the button\'s label text
        </p>

        <div class=\"slds-p-vertical_small\">
            <!-- Basic button -->
            <lightning-button label=\"With accesskey \'x\'\" title=\"Download action\" accesskey=\"x\" onclick={handleClick} class=\"slds-m-left_x-small\"></lightning-button>

            <!-- Button with icon before the label text -->
            <lightning-button label=\"With accesskey \'y\'\" title=\"Download action\" accesskey=\"y\" onclick={handleClick} icon-name=\"utility:download\" class=\"slds-m-left_x-small\"></lightning-button>

            <!-- Button with icon after the label text -->
            <lightning-button label=\"With accesskey \'z\'\" title=\"Download action\" accesskey=\"z\" onclick={handleClick} icon-name=\"utility:download\" icon-position=\"right\" class=\"slds-m-left_x-small\"></lightning-button>
        </div>

        <div class=\"slds-m-vertical_medium slds-p-vertical_medium slds-border_bottom slds-border_top\">
            <p>The label of the button that was activated is: <span class=\"slds-text-heading_small\">{clickedButtonLabel}</span></p>
        </div>
    </div>
</template>
`} ,
{ label: 'accesskey.js', language: 'js', content: `import { LightningElement } from \'lwc\';

export default class ButtonAccesskey extends LightningElement {
    clickedButtonLabel;

    handleClick(event) {
        this.clickedButtonLabel = event.target.label;
    }
}
`}  ]};
