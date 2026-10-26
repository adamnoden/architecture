import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const workRoot = resolve(import.meta.dirname, '.work')

const fail = (message: string): never => {
  throw new Error(`ADE-06A validation failed: ${message}`)
}

const sha256 = (value: string): string => createHash('sha256').update(value).digest('hex')

const entity = (svg: string, id: string): string => {
  const line = svg.split('\n').find((candidate) => candidate.includes(`data-entity="${id}"`))
  if (!line) fail(`missing SVG entity ${id}`)
  return line
}

const numberAttr = (line: string, name: string): number => {
  const match = line.match(new RegExp(`${name}="(-?[0-9.]+)"`))
  if (!match) fail(`missing ${name} on ${line}`)
  return Number(match[1])
}

const near = (actual: number, expected: number, message: string, tolerance = 0.001): void => {
  if (Math.abs(actual - expected) > tolerance) fail(`${message}: expected ${expected}, got ${actual}`)
}

const manifest = JSON.parse(await readFile(resolve(workRoot, 'manifest.json'), 'utf8')) as {
  pageMm: { width: number; height: number }
  files: Record<string, { sha256: string; bytes: number }>
}

if (manifest.pageMm.width !== 297 || manifest.pageMm.height !== 210) fail('manifest page must be exact A4 landscape')

for (const scale of [100, 50] as const) {
  const name = `ade06a-dimensions-1-${scale}.svg`
  const svg = await readFile(resolve(workRoot, name), 'utf8')
  const expected = scale === 100 ? { h: 60, v: 30 } : { h: 120, v: 60 }

  if (!svg.includes('width="297mm" height="210mm" viewBox="0 0 297 210"')) fail(`${name} is not exact A4 landscape`)
  if (!svg.includes(`data-scale-denominator="${scale}"`)) fail(`${name} scale metadata mismatch`)
  if (sha256(svg) !== manifest.files[name]?.sha256) fail(`${name} fingerprint mismatch`)
  if (Buffer.byteLength(svg) !== manifest.files[name]?.bytes) fail(`${name} byte count mismatch`)

  const horizontal = entity(svg, 'ADE06A-DIM-H-line')
  const vertical = entity(svg, 'ADE06A-DIM-V-line')
  near(Math.abs(numberAttr(horizontal, 'x2') - numberAttr(horizontal, 'x1')), expected.h, `${name} horizontal paper span`)
  near(Math.abs(numberAttr(vertical, 'y2') - numberAttr(vertical, 'y1')), expected.v, `${name} vertical paper span`)

  const hWitness = entity(svg, 'ADE06A-DIM-H-witness-a')
  near(Math.abs(numberAttr(hWitness, 'y2') - numberAttr(horizontal, 'y1')), 1.5, `${name} witness overshoot`)

  const hTick = entity(svg, 'ADE06A-DIM-H-tick-a')
  const tickLength = Math.hypot(
    numberAttr(hTick, 'x2') - numberAttr(hTick, 'x1'),
    numberAttr(hTick, 'y2') - numberAttr(hTick, 'y1')
  )
  near(tickLength, 2.4, `${name} terminal tick physical length`, 0.002)

  const hText = entity(svg, 'ADE06A-DIM-H-text')
  const vText = entity(svg, 'ADE06A-DIM-V-text')
  if (!hText.includes('>6000</text>')) fail(`${name} exact text is not derived from measured model span`)
  if (!vText.includes('>≈ 3000</text>')) fail(`${name} approximate text is not derived from measured model span`)
  if (!vText.includes('rotate(-90')) fail(`${name} vertical dimension text must rotate -90 degrees`)

  for (const id of [
    'ADE06A-DIM-H-witness-a',
    'ADE06A-DIM-H-witness-b',
    'ADE06A-DIM-H-line',
    'ADE06A-DIM-H-tick-a',
    'ADE06A-DIM-H-tick-b',
    'ADE06A-DIM-H-text'
  ]) {
    const node = entity(svg, id)
    if (!node.includes('data-dimensionId="ADE06A-DIM-H"')) fail(`${name} ${id} lost composed dimension identity`)
    if (!node.includes('data-sourceIds="ADE-06A-DIMENSION-FIXTURE"')) fail(`${name} ${id} lost source provenance`)
  }

  if (svg.includes('THIS LABEL MUST NOT DRIVE THE VALUE')) fail(`${name} leaked duplicated semantic label text`)
}

console.log('ADE-06A exact-size dimension composition validation passed.')
