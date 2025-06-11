export function updatePlacement(originalPlacement, clippedSides) {
  const placementParts = originalPlacement.split('-');
  const main = placementParts[0];
  let side = placementParts[1] || null;
  let edge = placementParts[2] || null;

  const sideMapping = {
    block: {
      'block-start': 'end',
      'block-end': 'start',
    },
    inline: {
      'inline-start': 'end',
      'inline-end': 'start',
    },
  };

  const edgeMappings = {
    start: 'start',
    end: 'end',
  };

  for (const clippingSide of clippedSides) {
    // Get our positions that are clipping
    const [clipMain, clipSide] = clippingSide.split('-');

    // Flip main position
    if (main === clipMain && sideMapping[main][clippingSide]) {
      side = sideMapping[main][clippingSide];
    }
    // Flip side position
    else if (side === clipSide || (!edge && clipSide)) {
      edge = edgeMappings[clipSide];
    }
    // Flip edge position
    else if (edge && clipSide) {
      edge = edgeMappings[clipSide];
    }
  }

  return [main, side, edge].filter(Boolean).join('-');
}
