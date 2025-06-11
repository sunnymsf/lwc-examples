The `lightning/flowSupport` module provides events that enable a component to control flow navigation and notify the flow of changes in attribute values.

The events are supported only in components where the target is `lightning__FlowScreen`.

Events include:

-   `FlowAttributeChangeEvent` — Informs the runtime that a component property has changed.
-   `FlowNavigationBackEvent` — Requests navigation to the previous screen.
-   `FlowNavigationNextEvent` — Requests navigation to the next screen.
-   `FlowNavigationPauseEvent` — Requests the flow runtime to pause the flow.
-   `FlowNavigationFinishEvent` — Requests the flow runtime to terminate the flow.

#### Component Metadata

This example `toDos` component includes the `lightning__FlowScreen` target and sets a property in its `toDos.js-meta.xml` file.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<LightningComponentBundle xmlns="http://soap.sforce.com/2006/04/metadata">
    <apiVersion>47.0</apiVersion>
    <isExposed>true</isExposed>

    <masterLabel>Todos Component</masterLabel>
    <description>This is a simple todos component</description>
    <targets>
        <target>lightning__FlowScreen</target>
    </targets>

    <targetConfigs>

        <targetConfig targets="lightning__FlowScreen">
            <property name="todos" type="String[]" label="Todos" description="list of todos"/>
        </targetConfig>
    </targetConfigs>
</LightningComponentBundle>
```

#### Component Template

The example `toDos` component template includes buttons that work with the flow.

```html
<template>
    List of ToDos:
    <template if:true={hasTodos} for:each={todosList} for:item="todo">
        <div key={todo.id}>{todo.text}</div>
    </template>
    <lightning-input
        label="New Todo"
        type="text"
        onchange={handleUpdatedText}
    >
    </lightning-input>
    <lightning-button
        label="Add Todo"
        title="Add a new todo"
        onclick={handleAddTodo}
    >
    </lightning-button>
    <lightning-button
        label="Go Next"
        title="Finish todos, go next"
        onclick={handleGoNext}
    >
    </lightning-button>
</template>
```

#### Use Events in JavaScript

The component uses the `FlowAttributeChangeEvent` and `FlowNavigationNextEvent` events from `lightning/flowSupport` in JavaScript.

```javascript
import { LightningElement, api, track } from 'lwc';
import {
    FlowAttributeChangeEvent,
    FlowNavigationNextEvent,
} from 'lightning/flowSupport';

export default class Todos extends LightningElement {
    @api
    availableActions = [];

    @api
    get todos() {
        return this._todos;
    }

    set todos(todos = []) {
        this._todos = [...todos];
    }

    @track _todos = [];

    get todosList() {
        return this._todos.map((todo) => {
            return { text: todo, id: Date.now().toString() };
        });
    }

    get hasTodos() {
        return this._todos && this._todos.length > 0;
    }

    handleUpdatedText(event) {
        this._text = event.detail.value;
    }

    handleAddTodo() {
        this._todos.push(this._text);
        // notify the flow of the new todo list
        const attributeChangeEvent = new FlowAttributeChangeEvent(
            'todos',
            this._todos
        );
        this.dispatchEvent(attributeChangeEvent);
    }

    handleGoNext() {
        // check if NEXT is allowed on this screen
        if (this.availableActions.find((action) => action === 'NEXT')) {
            // navigate to the next screen
            const navigateNextEvent = new FlowNavigationNextEvent();
            this.dispatchEvent(navigateNextEvent);
        }
    }
}
```

#### See Also

[Create Flow Screen Components](https://developer.salesforce.com/docs/platform/lwc/guide/use-config-for-flow-screens)
