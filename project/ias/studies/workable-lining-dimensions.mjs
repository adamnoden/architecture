export const studyWallPanel = { faceMm: 18, captureMm: 7, fitMm: 2, pitchMm: 420, rowDatumsMm: [150, 700, 2260, 3000] };
export const roomSideGrillePlateMm = 4;

export function grossSlotArea(slotLength, slotWidth, count) {
  return slotLength * slotWidth * count;
}
