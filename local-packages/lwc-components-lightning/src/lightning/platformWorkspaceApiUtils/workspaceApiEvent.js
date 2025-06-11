const WORKSPACE_API_EVENT_NAME = 'lightning__workspaceapievent';
const CATEGORY_WORKSPACE_API = 'workspaceAPI';

class WorkspaceAPIEvent extends CustomEvent {
    constructor(methodName, methodArgs, callback) {
        const options = {
            bubbles: true,
            composed: true,
            detail: {
                category: CATEGORY_WORKSPACE_API,
                methodName,
                methodArgs,
                callback,
            },
        };
        super(WORKSPACE_API_EVENT_NAME, options);
    }
}

export { WORKSPACE_API_EVENT_NAME, WorkspaceAPIEvent };
