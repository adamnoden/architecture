/** Conditional cabinet quantities and section; not an installed plumbing assembly. */
import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { layoutRevision, revisionOpenings } from '../../../compiler/reference-house/georgian/layout-revision.js'

const kitchenBytes = readFileSync(new URL('../../had/studies/kitchen-options.json', import.meta.url), 'utf8')
const kitchen = JSON.parse(kitchenBytes)
const expected = { x: 8100, y: 10982.5, w: 3482.5, h: 600 }
if (layoutRevision.shell !== 12000 || layoutRevision.envelope !== 417.5 || kitchen.basis !== layoutRevision.id || kitchen.adopted !== false) throw Error('Reappraise house/candidate identity')
for (const [key, value] of Object.entries(expected)) if (kitchen.counter[key] !== value) throw Error(`Reappraise kitchen ${key}`)
if (kitchen.dwOpen.x !== 8100 || kitchen.dwOpen.y !== 10382.5 || kitchen.dwOpen.w !== 600 || kitchen.dwOpen.h !== 1150) throw Error('Reappraise dishwasher/staging geometry')
if (kitchen.drawerOpen.x !== 9500 || kitchen.drawerOpen.w !== 1300 || kitchen.ovenOpen.x !== 10800 || kitchen.ovenOpen.w !== 600) throw Error('Reappraise kitchen module allocation')
if (kitchen.windowChange.proposedSill !== 1050 || kitchen.windowChange.oldSill !== 750 || kitchen.windowChange.head !== 2850 || kitchen.windowChange.width !== 1000 || JSON.stringify(kitchen.windowChange.centres) !== '[8100,10200]') throw Error('Reappraise Option B opening proposal')
for (const x of [8100, 10200]) if (!revisionOpenings('GROUND').some(o => o.wall === 'outer-north' && o.kind === 'window' && o.centre === x && o.width === 1000 && (o.sill ?? 750) === 750 && (o.head ?? 2850) === 2850)) throw Error('Reappraise canonical north openings')

const sinkX = kitchen.dwOpen.x + kitchen.dwOpen.w
const module = { x: sinkX, y: kitchen.counter.y, width: kitchen.drawerOpen.x - sinkX, depth: kitchen.counter.h, counterTop: 900 }
// Source: Franke UK product sheets. These describe bowls, not their installed connectors.
const oldSink = { id: 'MRG 610-52', width: 560, depth: 440, bowlDepth: 200, mounting: 'inset', materialAdmission: 'rejected-as-default: acrylic-resin composite' }
const steelSink = { id: 'LAX 110 50-41 / 122.0250.208', width: 530, depth: 440, bowlDepth: 175, mounting: 'undermount', materialAdmission: 'body candidate only; complete assembly unresolved' }
const proposal = { sideThickness: 24, worktopThickness: 30, baseTop: 180, centralMullion: false, fixedShelf: false }
const margins = (s: typeof steelSink | typeof oldSink) => ({ sideGross: (module.width - s.width) / 2, frontRearGross: (module.depth - s.depth) / 2 })
const grossOpening = module.width - 2 * proposal.sideThickness
// Deliberately simplified mounting counterexample: no rim, adhesive, clips or connector height.
const historicalAlignedInsetBottom = module.counterTop - oldSink.bowlDepth
const trialUndermountRim = module.counterTop - proposal.worktopThickness
const trialUndermountBottom = trialUndermountRim - steelSink.bowlDepth
const depthCounterexample = {
  claimedBowlDepthSaving: oldSink.bowlDepth - steelSink.bowlDepth,
  historicalAlignedInsetBottom,
  trialUndermountRim,
  trialUndermountBottom,
  actualDifferenceInThisSimplifiedTrial: trialUndermountBottom - historicalAlignedInsetBottom,
  grossVerticalTerritoryAboveTrialBase: trialUndermountBottom - proposal.baseTop,
  installedBottom: null,
  connectedTrapBottom: null,
  trapRemovalStroke: null,
}
if (grossOpening >= module.width || grossOpening !== 752) throw Error('Nominal module must not become clear aperture')
if (depthCounterexample.claimedBowlDepthSaving !== 25 || depthCounterexample.actualDifferenceInThisSimplifiedTrial !== -5) throw Error('Mounting-datum counterexample changed')
if (margins(steelSink).sideGross !== 135 || margins(steelSink).frontRearGross !== 80) throw Error('Gross margins changed')
const result = {
  schemaVersion: 1,
  basis: layoutRevision.id,
  candidateSource: 'project/had/studies/kitchen-options.json',
  candidateSha256: createHash('sha256').update(kitchenBytes).digest('hex'),
  adopted: false,
  module, oldSink, steelSink, proposal,
  grossMargins: { historical: margins(oldSink), steel: margins(steelSink) },
  grossFrontOpeningBeforeHingesAndHardware: grossOpening,
  actualClearFrontOpening: null,
  depthCounterexample,
  temporaryStaging: { x: 8100, y: 9782.5, width: 3300, depth: 1200 },
  connectionGeometry: { sinkWasteAndOverflow: null, metalTrapAndUnions: null, applianceBranch: null, waterValveHandleSweep: null, tapFixingsAndTails: null },
  acceptance: { connectedFit: 'unknown', completeMaterialAdmission: 'not-established', humanServiceAccess: 'not-established', leakDeclarationAndDrying: 'not-established' },
  scope: 'Published bowl envelope and authored cabinet/mounting comparisons only. No installed waste/trap, safe reach, wet boundary or drainage performance.'
}

const out: string[] = []
const add = (v: string) => out.push(v)
const esc = (v: string) => v.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
const text = (x: number, y: number, v: string, size = 3, colour = '#223b3c') => add(`<text x="${x}" y="${y}" font-size="${size}" fill="${colour}">${esc(v)}</text>`)
add('<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297" font-family="DejaVu Sans,sans-serif"><rect width="420" height="297" fill="#fffef8"/><defs><pattern id="unknown" width="3" height="3" patternUnits="userSpaceOnUse"><path d="M0 3L3 0" stroke="#b6b4ab" stroke-width=".2"/></pattern></defs>')
text(15, 16, 'IAS / Sink cabinet: a metal bowl is not a complete assembly', 5)
text(15, 25, 'Conditional HAD kitchen option B · no selected kitchen, plumbing fit or material exception · dimensions in mm', 3.2)
text(15, 40, 'PLAN 1:5 / 800 module; counter depth 600', 3.5)
const px = (x: number) => 15 + x / 5
const py = (y: number) => 55 + (600 - y) / 5
add(`<rect x="15" y="55" width="160" height="120" fill="#f4f0e7" stroke="#3e5759" stroke-width=".4"/>`)
for (const x of [0, module.width - proposal.sideThickness]) add(`<rect x="${px(x)}" y="55" width="${proposal.sideThickness / 5}" height="120" fill="#c6b99c"/>`)
add(`<rect x="${px(120)}" y="${py(520)}" width="112" height="88" fill="none" stroke="#a14c3d" stroke-dasharray="1.2 1" stroke-width=".35"/>`)
add(`<rect x="${px(135)}" y="${py(520)}" width="106" height="88" fill="#cedfe1" fill-opacity=".7" stroke="#286a71" stroke-width=".5"/>`)
text(52, 105, 'LAX: 530 × 440 outside', 3.2)
text(52, 114, 'Bowl / connection position', 2.8)
text(52, 121, 'not inferred from this box', 2.8)
text(15, 184, 'Front access from south / no fixed centre mullion proposed', 2.8)
text(15, 193, '24 side trials → 752 gross opening BEFORE hinges / hardware', 2.8)
text(15, 202, '135 side and 80 front / rear margins are GROSS territories.', 2.8)
text(15, 211, 'No tap, clips, waste body, trap or handle sweep fitted here.', 2.8)
text(15, 224, 'Plain blue: steel candidate. Red dash: historical resin bowl.', 2.8)
text(15, 233, 'Left: dishwasher module x8100–8700; keep connections', 2.8)
text(15, 241, 'accessible before machine withdrawal. No route is admitted.', 2.8)
text(15, 254, 'No deep drawers or fixed shelf across the service task.', 3.2)
text(15, 263, 'The cabinet and worktop need support independent of', 2.8)
text(15, 271, 'removable doors, plumbing and any local witness surface.', 2.8)

text(235, 40, 'SECTION ENVELOPE 1:5 / mounting comparison', 3.5)
text(250, 49, '30 trial datum band; worktop cutout not represented', 2.5)
const sx = (d: number) => 250 + d / 5
const sz = (z: number) => 55 + (900 - z) / 5
add(`<rect x="250" y="55" width="120" height="6" fill="none" stroke="#3e5759" stroke-dasharray="1 1" stroke-width=".3"/>`)
add(`<rect x="${sx(80)}" y="${sz(trialUndermountRim)}" width="88" height="35" fill="#cedfe1" stroke="#286a71" stroke-width=".5"/>`)
add(`<path d="M${sx(80)} ${sz(900)}V${sz(700)}H${sx(520)}V${sz(900)}" fill="none" stroke="#a14c3d" stroke-dasharray="1.2 1" stroke-width=".35"/>`)
add(`<rect x="${sx(0)}" y="${sz(trialUndermountBottom)}" width="${module.depth / 5}" height="${(trialUndermountBottom - proposal.baseTop) / 5}" fill="url(#unknown)" stroke="#9a9689" stroke-dasharray="1 1" stroke-width=".25"/>`)
text(270, 122, 'UNALLOCATED / NOT A FIT PASS', 3.1)
text(270, 131, 'Waste + overflow + trap + unions', 2.7)
text(270, 139, 'Valves + handles + appliance branch', 2.7)
text(270, 147, 'Supports + hands + tools + release', 2.7)
text(270, 162, 'Installed service envelopes are unknown.', 2.7)
add(`<path d="M250 ${sz(180)}H370M245 ${sz(0)}H375" stroke="#3e5759" stroke-width=".45"/>`)
text(374, sz(900) + 2, '900', 2.7)
text(374, sz(870) + 2, '870 trial', 2.7)
text(374, sz(695) + 3, '695 trial', 2.7)
text(374, sz(180) + 2, '180 trial', 2.7)
text(374, sz(0) + 2, '0', 2.7)
text(235, 248, 'A 25 shallower bowl does not earn 25 extra service space.', 2.8)
text(235, 257, 'With an authored 30 worktop, this undermount trial ends', 2.8)
text(235, 265, '5 LOWER than the aligned inset comparison. Rim, seal,', 2.8)
text(235, 273, 'clip and outlet dimensions are deliberately not invented.', 2.8)
text(15, 288, 'A3 at 100% · Source and admission limits: project/ias/ias-03-sink-cabinet.md · Hatched territory carries no product or performance approval.', 2.6)
add('</svg>')
for (const [name, content] of [['sink-cabinet.json', JSON.stringify(result, null, 2) + '\n'], ['sink-cabinet.svg', out.join('\n') + '\n']]) {
  const path = fileURLToPath(new URL(name, import.meta.url))
  if (process.argv.includes('--check')) { if (readFileSync(path, 'utf8') !== content) throw Error(`${name} stale`) }
  else writeFileSync(path, content)
}
console.log(JSON.stringify({ grossOpening, depthCounterexample, admission: result.acceptance }, null, 2))
