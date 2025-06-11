export const validPlacements = [
  'block-start',
  'block-start-start',
  'block-start-end',
  'block-end',
  'block-end-start',
  'block-end-end',
  'inline-start',
  'inline-start-start',
  'inline-start-end',
  'inline-end',
  'inline-end-start',
  'inline-end-end',
];

export function validatePlacement(placement) {
  return validPlacements.includes(placement);
}
