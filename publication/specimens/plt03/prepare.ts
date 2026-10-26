import { createHash } from 'node:crypto'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { extname, resolve } from 'node:path'

import type { DrawingPrimitive, DrawingScene } from '../../../compiler/publication-drawing/model.js'
import { renderDrawingSceneSvg } from '../../../compiler/publication-drawing/svg.js'
import { compileReferenceHouse } from '../../../compiler/reference-house/compile.js'
import { createReferenceHouseSource } from '../../../compiler/reference-house/fixture.js'
import { createPlt03CurrentGroundPlanScene } from '../../../compiler/reference-house/plt03-ground-plan.js'
import { createGroundFloorPublicationPlanScene } from '../../../compiler/reference-house/publication-ground-plan.js'
import { createGroundFloorPublicationPlanSource } from '../../../compiler/reference-house/publication-plan-source.js'
import { fetchOpenFontCandidate } from '../typ03/open-fonts.js'
import { renderSpecimenDrawingSceneSvgWithTokens } from './render.js'
import { PLT03_ARTICULATION_TOKENS, PLT03_HIERARCHY_TOKENS } from './tokens.js'

const repoRoot = resolve(import.meta.dirname, '../../..')
const workRoot = resolve(import.meta.dirname, '.work')
const canonicalBaselinePath = resolve(repoRoot, 'docs/reference-house/publication-ground-floor-plan.svg')

const sha256 = (value: string | Buffer): string => createHash('sha256').update(value).digest('hex')

const dataTransport = (path: string): { mime: string; format: string } => {
  const extension = extname(path).toLowerCase()
  if (extension === '.ttf') return { mime: 'font/ttf', format: 'truetype' }
  if (extension === '.otf') return { mime: 'font/otf', format: 'opentype' }
  if (extension === '.woff2') return { mime: 'font/woff2', format: 'woff2' }
  throw new Error(`Unsupported PLT-03 font extension: ${extension || '(none)'}`)
}

const clonePrimitiveForLightPoche = (primitive: DrawingPrimitive): DrawingPrimitive => {
  if (
    primitive.kind === 'rect' &&
    primitive.fill === 'ink' &&
    (primitive.id.startsWith('wall-') || primitive.id.startsWith('plt03-wall-'))
  ) {
    return {
      ...primitive,
      fill: 'faint',
      metadata: {
        ...primitive.metadata,
        representation: 'light-poche'
      }
    }
  }
  return primitive
}

const lightPocheScene = (scene: DrawingScene): DrawingScene => ({
  ...scene,
  primitives: scene.primitives.map(clonePrimitiveForLightPoche)
})

const shiftPrimitiveY = (primitive: DrawingPrimitive, delta: number): DrawingPrimitive => {
  if (primitive.kind === 'line') {
    return {
      ...primitive,
      a: { ...primitive.a, y: primitive.a.y + delta },
      b: { ...primitive.b, y: primitive.b.y + delta }
    }
  }
  if (primitive.kind === 'rect') return { ...primitive, y: primitive.y + delta }
  return { ...primitive, y: primitive.y + delta }
}

/**
 * Purely representational housekeeping for the current-authority specimen.
 * No coordinate below selects architectural geometry: the changes keep
 * relationship/occurrence notation visible against poche, prevent the narrow
 * gallery label from colliding with the courtyard edge and restore the released
 * 136 × 145 mm physical specimen envelope. The raw experiment's north arrow is
 * deliberately discarded because the canonical Reference House owns no true
 * site orientation.
 */
const refineCurrentSceneForSpecimen = (scene: DrawingScene): DrawingScene => ({
  ...scene,
  widthMm: 136,
  heightMm: 145,
  primitives: scene.primitives
    .filter((primitive) => !primitive.id.startsWith('plt03-north-'))
    .map((rawPrimitive) => {
      const primitive = rawPrimitive.id.startsWith('plt03-scale-')
        ? shiftPrimitiveY(rawPrimitive, -6)
        : rawPrimitive

      if (primitive.kind === 'text' && primitive.id === 'plt03-label-G-GAL-01') {
        return {
          ...primitive,
          rotateDeg: -90,
          metadata: {
            ...primitive.metadata,
            representation: 'rotated-for-narrow-gallery'
          }
        }
      }

      if (primitive.kind === 'line' && primitive.id.startsWith('plt03-opening-centre-')) {
        const dx = primitive.b.x - primitive.a.x
        const dy = primitive.b.y - primitive.a.y
        const length = Math.hypot(dx, dy)
        if (length === 0) return primitive
        const ux = dx / length
        const uy = dy / length
        const extensionMm = 2
        return {
          ...primitive,
          a: {
            x: primitive.a.x - ux * extensionMm,
            y: primitive.a.y - uy * extensionMm
          },
          b: {
            x: primitive.b.x + ux * extensionMm,
            y: primitive.b.y + uy * extensionMm
          },
          metadata: {
            ...primitive.metadata,
            representation: 'extended-centre-occurrence-marker'
          }
        }
      }

      if (primitive.kind === 'line' && primitive.id.startsWith('plt03-qualitative-opening-')) {
        let offsetX = 0
        let offsetY = 0
        if (primitive.id.includes('COURT-E')) offsetX = -2
        else if (primitive.id.includes('COURT-W')) offsetX = 2
        else if (primitive.id.includes('GARDEN-CENTRE')) offsetY = -2
        return {
          ...primitive,
          a: { x: primitive.a.x + offsetX, y: primitive.a.y + offsetY },
          b: { x: primitive.b.x + offsetX, y: primitive.b.y + offsetY },
          metadata: {
            ...primitive.metadata,
            representation: 'offset-host-relationship-trace'
          }
        }
      }

      return primitive
    })
})

await rm(workRoot, { recursive: true, force: true })
await mkdir(workRoot, { recursive: true })

const source = createReferenceHouseSource()
const result = compileReferenceHouse(source)
if (result.status === 'FAIL') throw new Error('PLT-03A Reference House compile failed.')

const v1Scene = createGroundFloorPublicationPlanScene(result, createGroundFloorPublicationPlanSource())
const currentScene = refineCurrentSceneForSpecimen(createPlt03CurrentGroundPlanScene(result, source))
const canonicalBaseline = await readFile(canonicalBaselinePath, 'utf8')
const regeneratedBaseline = renderDrawingSceneSvg(v1Scene)
if (regeneratedBaseline !== canonicalBaseline) {
  throw new Error('PLT-03A protected v1 baseline no longer regenerates byte-for-byte from its released scene.')
}

const fontEnv = await fetchOpenFontCandidate('source')
const faces = [
  ['TYP03_SANS_REGULAR', 400],
  ['TYP03_SANS_BOLD', 700]
] as const
const faceRules: string[] = []
const fontFingerprints: Record<string, { sourceName: string; sha256: string }> = {}
for (const [envName, weight] of faces) {
  const sourcePath = fontEnv[envName]
  const bytes = await readFile(sourcePath)
  const transport = dataTransport(sourcePath)
  const dataUri = `data:${transport.mime};base64,${bytes.toString('base64')}`
  faceRules.push(
    `@font-face{font-family:"PLT03 Source Sans";src:url("${dataUri}") format("${transport.format}");font-style:normal;font-weight:${weight};font-display:block}`
  )
  fontFingerprints[envName] = {
    sourceName: sourcePath.split('/').at(-1) ?? sourcePath,
    sha256: sha256(bytes)
  }
}

const exactFontCss = faceRules.join('')
const lightPocheOutlineCss =
  'rect.fill-faint[data-entity^="wall-"],rect.fill-faint[data-entity^="plt03-wall-"]{stroke:#000000;stroke-width:0.28px;stroke-linecap:butt;stroke-linejoin:miter}'

const injectCandidateCss = (svg: string, options: { lightPoche: boolean }): string => {
  if (!svg.includes('</style>')) throw new Error('PLT-03A candidate SVG has no style boundary.')
  const extra = `${exactFontCss}${options.lightPoche ? lightPocheOutlineCss : ''}`
  return svg.replace('</style>', `${extra}</style>`)
}

const hierarchy = injectCandidateCss(
  renderSpecimenDrawingSceneSvgWithTokens(lightPocheScene(v1Scene), PLT03_HIERARCHY_TOKENS),
  { lightPoche: true }
)
const articulation = injectCandidateCss(
  renderSpecimenDrawingSceneSvgWithTokens(currentScene, PLT03_ARTICULATION_TOKENS),
  { lightPoche: false }
)
const combined = injectCandidateCss(
  renderSpecimenDrawingSceneSvgWithTokens(lightPocheScene(currentScene), PLT03_HIERARCHY_TOKENS),
  { lightPoche: true }
)

const outputs = {
  baseline: canonicalBaseline,
  hierarchy,
  articulation,
  combined
} as const

for (const [name, svg] of Object.entries(outputs)) {
  await writeFile(resolve(workRoot, `${name}.svg`), svg, 'utf8')
}

const semanticDiff = {
  hierarchy: {
    classes: ['R'],
    changes: [
      'Source Sans 3 replaces the historical working Arial family in specimen space.',
      'Cut/profile/primary/secondary weights are narrowed for the candidate hierarchy.',
      'Label/note/marker paper sizes are reduced modestly.',
      'Legacy solid-black wall bodies become light poche with a controlled outline.'
    ],
    unexplained: []
  },
  articulation: {
    classes: ['R', 'S'],
    changes: [
      'Legacy DRW-03B exact internal aperture proxies are removed; current required-adjacency shared edges are shown instead.',
      'Legacy DRW-03B courtyard/garden exact proxies are removed; current numeric or host-wide opening authority is shown instead.',
      'Legacy stair reservation/path/orientation proxy is removed; only current 18-riser, 6/6/6 and 300 mm going authority remains.',
      'Internal partition thickness proxy is removed; current internal planning boundaries remain lines because thickness is unresolved.',
      'External/courtyard wall bodies use the minimum 400 mm extent of the controlled 400–425 mm planning range.',
      'Opening jamb marks express aperture extent/uncertainty only; no frame/reveal position is asserted.',
      'Unknown-width occurrence markers extend beyond wall poche and host-wide qualitative traces are offset from poche solely to remain legible.',
      'The narrow gallery label is rotated within its own space to avoid a courtyard-edge collision.',
      'The current-authority specimen remains in the protected 136 × 145 mm physical envelope and emits no north arrow because true site orientation is not owned.'
    ],
    unexplained: []
  },
  combined: {
    classes: ['R', 'S'],
    changes: [
      'Applies the HIERARCHY representational changes to the current-authority ARTICULATION substrate.'
    ],
    unexplained: []
  }
} as const

const currentAuthorityChecks = {
  noLegacyPublicationSourceImport: true,
  internalDoorGeometry: 'absent',
  internalPartitionThickness: 'absent',
  stairPlanPathOrWell: 'absent',
  frameRevealConstruction: 'absent',
  thresholdProfile: 'absent',
  exactQualitativeApertureExtents: 'absent',
  trueSiteOrientation: 'absent'
} as const

const manifest = {
  schemaVersion: 1,
  packet: 'PLT-03A',
  parent: 'PLT-03 / #746',
  sourceBoundary: 'PLT-02 / #742 / merge 1b70e063a7bbdab3880f4d09d604b4d79ef8ca03',
  typographyBoundary: 'TYP-06C / Source Sans 3 Regular 400 + Bold 700',
  canonicalMutation: false,
  compileStatus: result.status,
  baseline: {
    path: 'docs/reference-house/publication-ground-floor-plan.svg',
    sha256: sha256(canonicalBaseline),
    regeneratedByteIdentical: true
  },
  candidates: Object.fromEntries(
    Object.entries(outputs).map(([name, svg]) => [name, {
      sha256: sha256(svg),
      bytes: Buffer.byteLength(svg),
      currentAuthority: name === 'articulation' || name === 'combined'
    }])
  ),
  currentAuthorityChecks,
  semanticDiff,
  candidateTokens: {
    hierarchy: PLT03_HIERARCHY_TOKENS,
    articulation: PLT03_ARTICULATION_TOKENS,
    status: 'specimen-only-not-frozen'
  },
  fontFingerprints
}
await writeFile(resolve(workRoot, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')

console.log('Prepared PLT-03A baseline, hierarchy, articulation and combined SVG candidates.')
