import type { compileRenewableOpenings } from './renewable-openings.js'

/** A dimensioned diagnostic jamb cut at the native carrier mid-height. */
export function drawStudyJambScreen(window: ReturnType<typeof compileRenewableOpenings>['window']) {
  const { fixedFrameWidthMm, opening, schedule } = window
  const extent = Math.max(opening.widthMm, fixedFrameWidthMm) + 100
  const rect = (width: number, y: number, height: number, fill: string) =>
    `<rect x="${(extent - width) / 2}" y="${y}" width="${width}" height="${height}" fill="${fill}"/>`
  const descriptions = schedule.map((seam, index) => {
    const y = 65 + index * 120
    const colour = seam.fit === 'fixed-frame-conflict' ? '#ae492c' : '#755631'
    return [
      `<text x="20" y="${y}" font-size="20">${seam.id} · ${seam.remainingFrameWidth} mm clear width · ${seam.retainedFrameClearanceEachJamb} mm/jamb</text>`,
      rect(opening.widthMm, y + 10, 52, '#c5b89f'),
      rect(seam.remainingFrameWidth, y + 10, 52, '#e3eee8'),
      rect(fixedFrameWidthMm, y + 24, 24, colour),
    ].join('')
  })
  const height = 65 + schedule.length * 120
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${Math.max(extent, 800)} ${height}" role="img" aria-label="Study dry jamb screen"><title>Study window dry jamb screen</title><g font-family="sans-serif" fill="#17201e"><text x="20" y="25" font-size="23">Study dry seam · ${opening.widthMm} mm aperture · fixed ${fixedFrameWidthMm} mm frame</text>${descriptions.join('')}</g></svg>\n`
}
