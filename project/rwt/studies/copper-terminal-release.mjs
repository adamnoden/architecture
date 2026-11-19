/** Axial first-release diagnostic, not a fitting model or installed-system approval. Units: mm. */
import {readFileSync, writeFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';

function finiteNonnegative(name, value) {
  if (!Number.isFinite(value) || value < 0) throw new RangeError(`${name} must be finite and nonnegative`);
}

/**
 * A rigid carrier between two stationary, opposed socket bodies.
 * Positive translation is rightwards. Available travel is the real unobstructed
 * movement into the opposite end, NOT nut loosening or nominal socket length.
 * Only the FIRST end disengagement is tested; no lateral or full extraction is proved.
 */
export function firstRelease({leftEngagement, rightEngagement, leftAvailableTravel, rightAvailableTravel, separationAllowance}) {
  for (const [name, value] of Object.entries({leftEngagement, rightEngagement, leftAvailableTravel, rightAvailableTravel, separationAllowance})) {
    finiteNonnegative(name, value);
  }
  if (leftEngagement === 0 || rightEngagement === 0) throw new RangeError('Both initial socket engagements must be positive');
  const leftRequiredRightward = leftEngagement + separationAllowance;
  const rightRequiredLeftward = rightEngagement + separationAllowance;
  const leftCanDisengage = rightAvailableTravel >= leftRequiredRightward;
  const rightCanDisengage = leftAvailableTravel >= rightRequiredLeftward;
  return {
    allowedTranslation: {min: -leftAvailableTravel || 0, max: rightAvailableTravel},
    leftRequiredRightward, rightRequiredLeftward,
    leftCanDisengage, rightCanDisengage,
    firstAxialReleaseExists: leftCanDisengage || rightCanDisengage,
    scope: 'Necessary first axial release only; not full withdrawal, seal reuse, support or hydraulic acceptance.'
  };
}

/** Once one terminal body is actually removed, test travel to disengage the remaining socket. */
export function remainingSocketRelease({engagement, separationAllowance, freeTravel}) {
  for (const [name, value] of Object.entries({engagement, separationAllowance, freeTravel})) finiteNonnegative(name, value);
  if (engagement === 0) throw new RangeError('Remaining socket must initially be engaged');
  const requiredTravel = engagement + separationAllowance;
  return {requiredTravel, freeTravel, remainingTravel:freeTravel-requiredTravel,
    remainingSocketCanDisengage:freeTravel >= requiredTravel,
    scope:'Assumes the opposite terminal body has ALREADY been removed; neither its removal nor full carrier extraction is proved.'};
}

/** Strict clearance screen for hardware which remains attached during axial withdrawal. */
export function passage({minimumBore, largestCarriedEnvelope, requiredDiametralClearance}) {
  for (const [name, value] of Object.entries({minimumBore, largestCarriedEnvelope, requiredDiametralClearance})) {
    if (value !== null) finiteNonnegative(name, value);
  }
  if (minimumBore === 0 || largestCarriedEnvelope === 0) throw new RangeError('Bore and envelope must be positive or explicitly unknown');
  if ([minimumBore, largestCarriedEnvelope, requiredDiametralClearance].includes(null)) {
    return {status: 'unknown', remainingDiametralClearance: null, scope: 'Actual carried ring/plate/support envelope is required; a bare-tube diameter cannot substitute.'};
  }
  const remainingDiametralClearance = minimumBore - largestCarriedEnvelope - requiredDiametralClearance;
  return {
    status: remainingDiametralClearance > 0 ? 'positive-clearance-only' : 'interference-or-no-reserve',
    remainingDiametralClearance,
    scope: 'Straight concentric envelope only; no ovality, sag, clocking, friction, joint separation or loaded withdrawal proof.'
  };
}

export const fixture = Object.freeze({
  authority: 'Synthetic diagnostic dimensions, not Conex product dimensions or an adopted house section.',
  leftEngagement: 40, rightEngagement: 50, separationAllowance: 5,
  stopped: {leftAvailableTravel: 0, rightAvailableTravel: 0},
  openedRightBay: {leftAvailableTravel: 0, rightAvailableTravel: 80},
  insufficientRightBay: {leftAvailableTravel: 0, rightAvailableTravel: 44},
  passage: {minimumBore: 150, requiredDiametralClearance: 10, bareTube: 108, retainedPlate: 180}
});

export function derive() {
  const base = {leftEngagement: fixture.leftEngagement, rightEngagement: fixture.rightEngagement, separationAllowance: fixture.separationAllowance};
  const p = fixture.passage;
  return {
    authority: fixture.authority,
    fixedStoppedSockets: firstRelease({...base, ...fixture.stopped}),
    rightTerminalBodyRemoved: remainingSocketRelease({engagement:fixture.leftEngagement, separationAllowance:fixture.separationAllowance, freeTravel:fixture.openedRightBay.rightAvailableTravel}),
    rightBayTooShort: remainingSocketRelease({engagement:fixture.leftEngagement, separationAllowance:fixture.separationAllowance, freeTravel:fixture.insufficientRightBay.rightAvailableTravel}),
    bareTubeOnly: passage({minimumBore:p.minimumBore, largestCarriedEnvelope:p.bareTube, requiredDiametralClearance:p.requiredDiametralClearance}),
    plateStillAttached: passage({minimumBore:p.minimumBore, largestCarriedEnvelope:p.retainedPlate, requiredDiametralClearance:p.requiredDiametralClearance}),
    compressionRingUnmeasured: passage({minimumBore:p.minimumBore, largestCarriedEnvelope:null, requiredDiametralClearance:p.requiredDiametralClearance}),
    excluded: ['Fitting-body removal itself and exact product insertion depths', 'Olive release, tube damage and seal/component reuse', 'Lateral manoeuvres, body flexibility and full-length withdrawal corridor', 'Carrier and terminal supports, movement and loads', 'Court-to-sleeve annular water boundary and floor continuity', 'Hydraulic capacity, safe water level, pressure duty and site acceptance']
  };
}
export function report() { return JSON.stringify(derive(), null, 2) + '\n'; }

export function render() {
  // A3 inspection sheet. Deliberately schematic; synthetic dimensions are labelled.
  const txt = (x,y,text,size=3.7) => `<text x="${x}" y="${y}" font-size="${size}">${text.replaceAll('&','&amp;').replaceAll('<','&lt;')}</text>`;
  const line = (x1,y1,x2,y2,extra='') => `<path d="M${x1},${y1}L${x2},${y2}" stroke="black" stroke-width=".45" fill="none" ${extra}/>`;
  const rect = (x,y,w,h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="black" stroke-width=".45"/>`;
  let s = '<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297"><rect width="420" height="297" fill="white"/><g font-family="Arial, sans-serif" fill="black">';
  s += txt(14,17,'Copper carrier: design the release, not just the joint',6.4);
  s += txt(14,26,'RWT-METALS | 30 October 2026 | not to scale; synthetic fixture, NOT construction dimensions',3.5);
  s += line(14,32,406,32);
  s += txt(14,43,'A   Fixed opposed sockets: undoing fasteners does not remove the tube stops',4.4);
  s += rect(38,61,52,20) + rect(320,61,52,20) + rect(72,66,267,10);
  s += line(72,58,72,84) + line(339,58,339,84);
  s += txt(39,54,'fixed socket / stop',3.2) + txt(321,54,'stop / fixed socket',3.2);
  s += txt(151,62,'rigid, axially constrained carrier',3.4);
  s += txt(25,94,'Synthetic example: left engagement 40; right engagement 50; separation allowance 5.');
  s += txt(25,102,'At both stops, available travel is 0 in either direction. First axial disengagement is impossible.');
  s += txt(25,110,'This does not prohibit a real union or a movable terminal: those change the mechanism.');
  s += line(14,118,406,118);
  s += txt(14,130,'B   Remove one terminal BODY first: a separately designed service operation',4.4);
  s += rect(38,148,52,20) + rect(72,153,267,10);
  s += line(72,145,72,171) + rect(320,135,52,10);
  s += txt(314,130,'terminal lifted clear',3.0);
  s += line(275,158,376,158,'marker-end="url(#arrow)"');
  s += txt(110,146,'remaining left socket disengages by rightward travel',3.2);
  s += txt(25,181,'Authored free bay 80 minus required first movement (40 + 5) = 35 remaining.');
  s += txt(25,189,'A 44 bay fails. Even an 80 bay proves neither full withdrawal nor how the terminal was removed.');
  s += txt(25,197,'Retained olive / plate / support must fit the sleeve. Unknown envelopes remain unknown.');
  s += line(14,205,406,205);
  s += txt(14,217,'C   Two different water boundaries, plus an independent support duty',4.4);
  s += txt(20,229,'W1  Pipe bore and terminal joint: contain conveyed water, including the actual surcharge case.');
  s += txt(20,239,'W2  Court pan / sleeve outside: prevent floodwater bypass; preserve visible outward leak drainage.');
  s += txt(20,249,'S    Carrier and terminal support: carry loads without asking a seal to act as a bearing.');
  s += txt(20,263,'A pressure-capable W1 fitting does not prove W2. A removable cover does not prove renewal.');
  s += line(14,272,406,272);
  s += txt(14,282,'Development choice: reserve accessible release territory; do not transplant the PVC slip-coupling sequence.',3.5);
  s += txt(14,290,'Read ../copper-terminal-renewal.md and the executable fixture. No material exception or house selection is earned.',3.0);
  return s + '</g><defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10Z" fill="black"/></marker></defs></svg>\n';
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  if (args.some(x => x !== '--check') || args.length > 1) throw new Error('Use --check or no argument');
  const root = dirname(fileURLToPath(import.meta.url));
  for (const [name, content] of Object.entries({'copper-terminal-release.json':report(), 'copper-terminal-release.svg':render()})) {
    const path = resolve(root, name);
    if (args.includes('--check')) assert.equal(readFileSync(path,'utf8'), content, `${name} needs regeneration`);
    else writeFileSync(path, content);
  }
  console.log('Copper terminal-release diagnostic checked; no installed-system approval.');
}
