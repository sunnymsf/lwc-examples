/**
 * Check if the label has slotted text
 * @param {*} e - slot change event
 * @returns {Boolean}
 */
export function hasSlotText(e) {
  const slotContent = e.target.assignedNodes({ flatten: true });
  return slotContent.some((node) => node.textContent.trim() !== '');
}
