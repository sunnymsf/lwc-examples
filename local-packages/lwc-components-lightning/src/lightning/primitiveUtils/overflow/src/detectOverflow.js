/**
 * Detects the overflow of an element.
 *
 * @param {Object} parent - positioning values of the parent
 * @param {Object} child - positioning values of the child
 * @returns {Object} - object containing overflow values
 */
export function detectOverflow(parent, child) {
  return {
    'block-start': parent['block-start'] - child['block-start'],
    'inline-end': child['inline-end'] - parent['inline-end'],
    'block-end': child['block-end'] - parent['block-end'],
    'inline-start': parent['inline-start'] - child['inline-start'],
  };
}
