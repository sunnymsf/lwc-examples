/**
 * This module is used in LWR off-core, for on-core use cases, see lightning/auraUtilsMock
 */

let aura;
let auraPromise = importAura();

auraPromise.catch((e) => {
    console.warn(e);
});

/**
 * Get instance of aura module
 * @param {requestCallback} callback - Called with aura instance when aura exists in the environment
 * @param {requestCallback} failureCallback - Called when aura does not exist in the environment (LWR)
 */
export function getAura(callback, failureCallback = () => {}) {
    // still loading
    if (aura === undefined) {
        auraPromise
            .then(() => {
                if (aura !== null && aura.createComponent !== null) {
                    callback(aura);
                } else {
                    failureCallback();
                }
            })
            .catch(() => {
                failureCallback();
            });

        return;
    }

    // load successful
    if (aura !== null && aura.createComponent !== null) {
        callback(aura);
    } else {
        failureCallback();
    }
}

// eslint-disable-next-line @lwc/lwc/no-async-await
async function importAura() {
    try {
        // eslint-disable-next-line @lwc/lwc/no-async-await
        aura = await import('lightning/auraDynamic');
    } catch (e) {
        aura = null;
        throw e;
    }

    if (!aura) {
        aura = null;
        throw new Error('Failed to import Aura');
    }
}
