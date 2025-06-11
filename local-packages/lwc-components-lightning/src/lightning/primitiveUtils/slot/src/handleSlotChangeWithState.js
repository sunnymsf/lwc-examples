import { arraysEqual, arrayIsEmpty } from './helpers.js';

/**
 * Augment the slotchange method with state management
 *
 * @param {Function} callback - callback function
 * @returns {Function} - augmented slotchange method
 */
export function handleSlotChangeWithState(callback) {
  const state = {
    empty: true,
    changed: false,
    oldContent: [],
    newContent: [],
    iteration: 0,
    firstRender: true,
  };

  return function handleSlotChange(e) {
    state.firstRender = state.iteration === 0;
    state.iteration += 1;
    const slotElement = this.template.querySelector(['slot']);
    const newContent = slotElement.assignedElements({ flatten: true });
    if (!arraysEqual(state.oldContent, newContent)) {
      state.oldContent = state.newContent;
      state.newContent = newContent;
      state.empty = arrayIsEmpty(newContent);
      state.changed = true;
    } else {
      state.changed = false;
    }
    callback(state);
  };
}
