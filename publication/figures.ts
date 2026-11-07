import { applyPublicationIntegrityEdits } from './integrity-edits.js'
import { applyPublicationPlates } from './plates.js'

interface FigurePlacement {
  readonly entryId: string
  readonly anchor: string
  readonly image: string
  readonly alt: string
  readonly caption: string
}

const placements: readonly FigurePlacement[] = [
  {
    entryId: 'part-i',
    anchor:
      'The term does not imply exposed services, plug-in rooms or visible modularity. The platform has four principal parts—permanent fabric, replaceable systems, designed interfaces and maintenance geography—joined by an assembly hierarchy and governed throughout by workmanship robustness.',
    image: 'figures/selective-permanence-platform.svg',
    alt: 'Selective permanence and the architectural platform',
    caption:
      'Selective permanence separates slower architectural commitments from faster-changing systems. The bands are qualitative rather than fixed service lives. Most ordinary renewal should terminate at a designed interface; unavoidable crossings into permanent fabric remain sparse, deliberate and documented.'
  },
  {
    entryId: 'part-ii',
    anchor:
      'One component may legitimately perform several jobs, but the combination should be intentional.',
    image: 'figures/designed-interface-functions.svg',
    alt: 'Functional decomposition of a designed interface',
    caption:
      'A designed interface allocates duties rather than asking one buried joint to do everything. Support, restraint, movement, boundary continuity, tolerance and future removal are questions to assign deliberately. A real junction may combine some duties and omit others; this is a functional diagram, not a construction detail.'
  },
  {
    entryId: 'part-ii',
    anchor:
      'Different systems require different answers; there is no universal tray, tell-tale or sensor.',
    image: 'figures/failure-architecture-sequence.svg',
    alt: 'Failure architecture from first defence through recovery',
    caption:
      'Failure architecture designs the second consequence as deliberately as the first defence. Passive geometry and locality form the base layer; detection and isolation shorten the event; access, drying and reinstatement complete recovery. The sequence is a review logic, not a prescribed plumbing or control topology.'
  },
  {
    entryId: 'part-ii',
    anchor: '**Withdrawal** — how the component leaves and its replacement arrives.',
    image: 'figures/maintenance-geography-route.svg',
    alt: 'Maintenance route from approach to withdrawal',
    caption:
      'Maintenance access is a continuous geography, not a hatch. Approach, working space, disconnection and withdrawal must all exist at the scale of the actual person, tool and component. The route may extend through rooms, stairs, roofs, courtyards, landscape and the site entrance; failure in any one geometry breaks the route.'
  },
  {
    entryId: 'part-iii',
    anchor:
      'The Physical Service Index asks for enough durable, local information that a future competent person can find primary systems and isolations even when the original software, contractor or owner is gone.',
    image: '../docs/manuscript/figures/pattern-language-fields-sequence.svg',
    alt: 'Pattern-language fields and one generative service-topology sequence',
    caption:
      'The pattern language and its generative sequences are different structures. Twenty-one active patterns are grouped here into five editorial fields for reading; the groups are not a taxonomy. At right, service topology shows one sequence in which high-consequence spatial decisions precede detailed routes, with explicit rewind when later complexity exposes a weak earlier move. Strategies coordinate several patterns; held candidates remain unresolved and outside the canonical count.'
  }
]

function figureLabel(placement: FigurePlacement): string {
  return placement.alt
}

function figureBlock(placement: FigurePlacement): string {
  return `![${placement.alt}](${placement.image})\n\n*${placement.caption}*`
}

export function applyPublicationFigures(entryId: string, markdown: string): string {
  markdown = applyPublicationIntegrityEdits(entryId, markdown)
  const entryPlacements = placements.filter((placement) => placement.entryId === entryId)

  for (const placement of entryPlacements) {
    if (markdown.includes(`](${placement.image})`)) {
      throw new Error(`${figureLabel(placement)} is already present in ${entryId}; remove duplicate figure composition.`)
    }

    const first = markdown.indexOf(placement.anchor)
    if (first < 0) {
      throw new Error(`${figureLabel(placement)} anchor changed in ${entryId}; re-place the figure deliberately.`)
    }
    if (markdown.indexOf(placement.anchor, first + placement.anchor.length) >= 0) {
      throw new Error(`${figureLabel(placement)} anchor is ambiguous in ${entryId}; choose a unique placement.`)
    }

    const end = first + placement.anchor.length
    markdown = `${markdown.slice(0, end)}\n\n${figureBlock(placement)}${markdown.slice(end)}`
  }

  return applyPublicationPlates(entryId, markdown)
}

export function publicationFigurePlacements(): readonly FigurePlacement[] {
  return placements
}
