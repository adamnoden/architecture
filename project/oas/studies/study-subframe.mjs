import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { deriveCurrentHouse } from '../../had/studies/current-house.mjs'

const here = new URL('./', import.meta.url)
const read = name => readFileSync(new URL(name, here))
const paths = {
  bay: '../../bcr/studies/bay-interface-study.json',
  window: '../../mat/studies/study-coupled-window.json',
  sash: '../../mat/studies/study-coupled-window-sources.json',
  room: '../../ias/studies/workable-study-floor.json',
}
const inputs = Object.fromEntries(Object.entries(paths).map(([key, path]) => [key, read(path)]))
const { bay, window, sash, room } = Object.fromEntries(Object.entries(inputs).map(([key, value]) => [key, JSON.parse(value)]))
const { model, inputs: compositorInputs } = deriveCurrentHouse()
const { width, centre, sill, spring, head } = model.archOpeningRegister.GROUND.find(o => o.id === 'south-window-0')
assert.deepEqual([centre, width, sill, spring, head], [bay.basis.opening.new, 1000, 750, 2550, bay.basis.opening.head])
const roomFace = bay.basis.roomFace
const lining = model.finishRewind.dry.total
assert.equal(lining, bay.basis.dryFinish)
assert.equal(room.assemblies.finishTradeoffs[0].depthMM, lining)
const assemblyJoint = sash.sources[2].nominalPerimeterJoint
const axis = bay.basis.trialFrameQ
assert.deepEqual(axis, [window.section.frontY, window.section.rearY])
const archRise = head - spring
const radius = ((width / 2) ** 2 + archRise ** 2) / (2 * archRise)
const centreZ = head - radius
const archZ = (halfWidth, normalInset) => centreZ + Math.sqrt((radius - normalInset) ** 2 - halfWidth ** 2)
const unilateralSetting = 2
const oppositeSetting = 2
const fitting = lining + assemblyJoint
const frameWidth = width - 2 * fitting
const e0 = { roomFace, lining, joint: assemblyJoint, normalInset: fitting, frameWidth, frameAxis: axis }
const variants = [
  { id: 'Tight carrier', plate: 3, structureFit: 4, openDryRelease: 5, nominalWetCassette: false },
  { id: 'Separated carrier', plate: 4, structureFit: 5, openDryRelease: 8, nominalWetCassette: false },
].map(profile => {
  const nested = profile.plate + profile.structureFit + profile.openDryRelease
  const additionalInset = nested + unilateralSetting + oppositeSetting - assemblyJoint
  const inset = fitting + additionalInset
  const remainingFrameWidth = width - 2 * inset
  const nominalDryReleaseAfterSettings = profile.openDryRelease - unilateralSetting - oppositeSetting
  return {
    ...profile, nested, additionalInset, remainingFrameWidth, nominalDryReleaseAfterSettings,
    crownZ: head - inset,
    shoulderZ: archZ(remainingFrameWidth / 2, inset),
    outerSashWidthIfProfilesUnchanged: window.section.movingWidth - 2 * additionalInset,
    existingFrameWholeInwardPassAtEachJamb: -additionalInset,
    unchangedExistingFrameRoomFaceShiftIfLiningCharged: additionalInset,
  }
})
assert.equal(e0.frameWidth, 922)
assert.deepEqual(variants.map(x => [x.additionalInset, x.remainingFrameWidth, x.nominalDryReleaseAfterSettings]), [[4,914,1],[9,904,4]])
const comparison = {
  schemaVersion: 1,
  scope: 'Static comparative architectural geometry on the selected Study occurrence. No fit, rating, specimen approval or shape transfer beyond it.',
  sourceBlobs: compositorInputs,
  sourceSha256: Object.fromEntries(Object.entries(inputs).map(([key, value]) => [key, createHash('sha256').update(value).digest('hex')])),
  occurrence: { level: 'GROUND', host: 'outer-south', id: 'south-window-0', centre, width, sill, spring, head, radius, centreZ },
  e0: { ...e0, crownZ: head - fitting, shoulderZ: archZ(frameWidth / 2, fitting) },
  e1: { frameWidth, proposedIsolatedPadQ: [282.5, 317.5], frameFixingLineQ: 300, nominalOldJointReserve: assemblyJoint, hold: '17.5 mm nominal offset to both ends of the trial 35 mm pad; no fixing or support capacity follows.' },
  e2: variants,
  retainedControls: {
    frameAxis: axis, portalCore: bay.basis.portalCoreQ, existingCeiling: 3100,
    release: bay.retainedReleaseLimits, allowedFirstRestPlan: bay.candidate.platformRectangle,
    occupiedApron: bay.selectedInletJoin.newApron,
    roomFaceWithRetainedMineralAndAdditionalPanel: roomFace + lining,
    controls: ['Retain structural arch and support; no packing against glass or trim.', 'Keep the exterior drainage and permanent dry line separately inspectable.', 'Trial weather upstand is kept separately supported. No seal or exit relies on the retained carrier.'],
  },
}

const palette = { ink: '#17201e', masonry: '#d5cab5', steel: '#566863', frame: '#b88e59', wet: '#267d9d', dry: '#aa5731', paper: '#faf8f1' }
const label = (x, y, value, size = 3.1, css = '') => `<text x="${x}" y="${y}" font-size="${size}" ${css}>${value}</text>`
const line = (x1, y1, x2, y2, stroke = palette.ink, dash = '') => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width=".42" ${dash}/>`
const box = (x, y, w, h, fill, stroke = 'none', dash = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${stroke}" stroke-width=".35" ${dash}/>`
const page = (title, subtitle, body, width = 420, height = 297) => `<svg xmlns="http://www.w3.org/2000/svg" width="${width}mm" height="${height}mm" viewBox="0 0 ${width} ${height}" role="img" aria-label="${title}">${box(0,0,width,height,palette.paper)}<g font-family="sans-serif" fill="${palette.ink}">${label(16,20,title,8)}${label(16,32,subtitle,4)}${body}</g></svg>\n`
const rule = (x,y,count,scale) => line(x,y,x+count/scale,y) + line(x,y-2,x,y+2) +
  line(x+count/scale,y-2,x+count/scale,y+2) + label(x,y+8,`${count} mm in the assembly`)
const familyRows = [['E0 / E1', e0], ['E2 / separated carrier', variants[1]]]
const sc = 5
const grid = [44, 112, 180].flatMap((y, row) => familyRows.map(([title, variant], col) => {
  const x = col === 0 ? 25 : 229
  const sillSection = row === 2
  const wallY = sillSection ? y + 28 : y + 10
  const frameY = sillSection ? y + 13 - (variant.additionalInset ?? 0) / sc : y + 25 + (variant.additionalInset ?? 0) / sc
  const carrierY = sillSection ? y + 27 : y + 22
  const q = value => x + value / sc
  const layers = [[0,102.5,'#a97561'],[102.5,50,'#eff5f4'],[152.5,70,'#e8e1d6'],[222.5,180,palette.masonry],[402.5,27,'#c7b49d']]
  return [
    label(x,y+1,[ 'JAMB','HEAD / spring section','SILL'][row] + ' · ' + title,4.3),
    ...layers.map(([start,span,fill]) => box(q(start),wallY,span/sc,12,fill)),
    box(q(axis[0]),frameY,(axis[1]-axis[0])/sc,13,palette.frame),
    col === 1 ? box(q(222.5),carrierY,125.5/sc,4/sc,palette.steel) : box(q(282.5),carrierY,35/sc,3/sc,palette.steel),
    line(q(348),frameY+7,q(424),wallY+6,palette.dry),
    line(q(245),sillSection ? y+27 : y+17,q(20),sillSection ? y+30 : y+22,palette.wet),
    label(q(432),y+20,'ROOM',2.8),
    label(x,y+52,row === 2 ? 'Outward pan and drip; keep outlet visible.' : row === 1 ? 'Cavity interception and arch support stay in wall.' : 'Dry fixing and separate stop behind releasable trim.'),
    label(x,y+57,col === 1 ? 'Permanent carrier adds an independent inner closure.' : 'Conventional topology; sparse pads remain a trial.'),
  ].join('')
})).join('')
const plate = page('Study window | same wall, two renewal routes',
  '1:5 detail · current front Study X2100 · comparative section envelopes, not product shapes',
  grid + rule(18,257,100,5) + label(66,261,'Blue · water and intended outward discharge') +
  label(66,268,'Rust · warm-side air closure, intentionally re-sealed at full-frame work') +
  label(245,257,'Weather face Q0 → room face Q429.5') + label(245,264,'Verify fixed stop, thresholds, tool access and representative joint in prototype.'))
const detail = page('Owner choice | keep or remove the carrier',
  '1:2 plan detail · actual joint budgets · sealed perimeter requires a complete matched assembly',
  familyRows.map(([title, variant], i) => {
    const x = 20 + 140 * i
    const h = [12, 21][i]
    return [label(x,58,title,5), box(x,69,42,19,palette.masonry), box(x+42+h/2,69,51,19,palette.frame),
      box(x+44.5,69,i===0 ? 0 : 2,19,palette.steel), line(x+40,105,x+92,105,palette.dry,'stroke-dasharray="1.5 1.5"'),
      line(x+85,103,x+92,105,palette.dry),line(x+85,107,x+92,105,palette.dry),
      label(x,97,i===0 ? '12 between return and frame' : '4 plate + 5 fit + 8 open + 4 setting'),
      label(x,118,i===0 ? 'Hold opening independently; expose dry fixings.' : 'Support frame; release dry trim and separate seal.'),
      label(x,125,'Keep outer tray draining; inspect retained wet stop.'),
      label(x,132,i===0 ? 'Restore both disturbed perimeter seals.' : 'Reinstate inner closure and inspect carrier joints.'),
      label(x,146,(`Trial outer frame width: ${variant.remainingFrameWidth ?? variant.frameWidth} mm`),4),
      label(x,155,i===0 ? 'Whole-frame removal route remains unproved.' : 'Existing frame would need 9 mm more per jamb.'),
      label(x,163,i===0 ? '250 mm partial head draw is a separate task.' : 'Use thinner/repositioned carrier or redesign frame.'),
    ].join('')
  }).join('') + rule(20,181,60,2),297,210)
const outputs = { 'study-subframe.json': JSON.stringify(comparison,null,2)+'\n', 'study-subframe-sections.svg': plate, 'study-subframe-release.svg': detail }
for (const [name, contents] of Object.entries(outputs)) {
  const destination = new URL(name, here)
  if (process.argv.includes('--check')) assert.equal(read(name).toString(),contents,`Regenerate ${name}`)
  else writeFileSync(destination, contents)
}
