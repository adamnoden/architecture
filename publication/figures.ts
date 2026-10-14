interface FigurePlacement {
  readonly entryId: string
  readonly id: string
  readonly anchor: string
  readonly image: string
  readonly alt: string
  readonly caption: string
}

const placements: readonly FigurePlacement[] = [
  {
    entryId: 'part-i',
    id: 'D-F01',
    anchor:
      'The term does not imply exposed services, plug-in rooms or visible modularity. The platform has four principal parts—permanent fabric, replaceable systems, designed interfaces and maintenance geography—joined by an assembly hierarchy and governed throughout by workmanship robustness.',
    image: 'figures/selective-permanence-platform.svg',
    alt: 'Selective permanence and the architectural platform',
    caption:
      'Selective permanence separates slower architectural commitments from faster-changing systems. The bands are qualitative rather than fixed service lives. Most ordinary renewal should terminate at a designed interface; unavoidable crossings into permanent fabric remain sparse, deliberate and documented.'
  },
  {
    entryId: 'part-ii',
    id: 'D-F02',
    anchor:
      'One component may legitimately perform several jobs, but the combination should be intentional.',
    image: 'figures/designed-interface-functions.svg',
    alt: 'Functional decomposition of a designed interface',
    caption:
      'A designed interface allocates duties rather than asking one buried joint to do everything. Support, restraint, movement, boundary continuity, tolerance and future removal are questions to assign deliberately. A real junction may combine some duties and omit others; this is a functional diagram, not a construction detail.'
  },
  {
    entryId: 'part-ii',
    id: 'D-F03',
    anchor:
      'Different systems require different answers; there is no universal tray, tell-tale or sensor.',
    image: 'figures/failure-architecture-sequence.svg',
    alt: 'Failure architecture from first defence through recovery',
    caption:
      'Failure architecture designs the second consequence as deliberately as the first defence. Passive geometry and locality form the base layer; detection and isolation shorten the event; access, drying and reinstatement complete recovery. The sequence is a review logic, not a prescribed plumbing or control topology.'
  },
  {
    entryId: 'part-ii',
    id: 'D-F04',
    anchor: '**Withdrawal** — how the component leaves and its replacement arrives.',
    image: 'figures/maintenance-geography-route.svg',
    alt: 'Maintenance route from approach to withdrawal',
    caption:
      'Maintenance access is a continuous geography, not a hatch. Approach, working space, disconnection and withdrawal must all exist at the scale of the actual person, tool and component. The route may extend through rooms, stairs, roofs, courtyards, landscape and the site entrance; failure in any one geometry breaks the route.'
  },
  {
    entryId: 'part-iii',
    id: 'D-F05',
    anchor:
      'The Physical Service Index asks for enough durable, local information that a future competent person can find primary systems and isolations even when the original software, contractor or owner is gone.',
    image: '../docs/manuscript/figures/pattern-language-fields-sequence.svg',
    alt: 'Pattern-language fields and one generative service-topology sequence',
    caption:
      'The pattern language and its generative sequences are different structures. Twenty-one active patterns are grouped here into five editorial fields for reading; the groups are not a taxonomy. At right, service topology shows one sequence in which high-consequence spatial decisions precede detailed routes, with explicit rewind when later complexity exposes a weak earlier move. Strategies coordinate several patterns; held candidates remain unresolved and outside the canonical count.'
  },
  {
    entryId: 'part-iv',
    id: 'D-F06',
    anchor: '- technical and maintenance geography made spatially explicit.',
    image: 'figures/reference-house-type-orientation.svg',
    alt: 'Reference House type and orientation',
    caption:
      'Reference House type and orientation. The house is organised as a compact two-storey ring around an open court, with a concentrated service flank and a legible front-to-court-to-garden sequence. Dimensions describe the current virtual type; compass orientation, utilities and neighbouring conditions remain contingent on a real site.'
  },
  {
    entryId: 'part-iv',
    id: 'D-F07',
    anchor:
      'This is characteristic of the broader method: historical language is used to establish hierarchy, not to import spectacle.',
    image: 'figures/reference-house-spatial-sectional-order.svg',
    alt: 'Reference House spatial and sectional order',
    caption:
      'Spatial and sectional order. Rank is relational rather than owned by one proxy: shared rooms and arrival structure the ground floor, private rooms occupy the upper level, and the courtyard recentres both. The slightly more generous ground storey establishes domestic primacy without a piano-nobile effect.'
  },
  {
    entryId: 'part-iv',
    id: 'D-F08',
    anchor:
      'If engineering later demonstrates otherwise, the architecture must respond. The present drawings are not permitted to convert plausibility into adequacy.',
    image: 'figures/reference-house-structural-assembly-logic.svg',
    alt: 'Reference House structural and assembly logic',
    caption:
      'Structural and assembly logic at pre-engineering scope. The courtyard turns the floor plate into comparatively short span fields between outer and inner permanent walls; local openings are treated as explicit interruptions rather than site cuts through a finished system. The hierarchy is architectural coordination, not structural adequacy.'
  },
  {
    entryId: 'part-iv',
    id: 'D-F09',
    anchor: 'Principal rooms remain free of primary wet, soil, large-duct and plant routes.',
    image: 'figures/reference-house-service-maintenance-geography.svg',
    alt: 'Reference House service and maintenance geography',
    caption:
      'Service and maintenance geography. High-consequence infrastructure is concentrated around the service flank: plant and utility functions below, family bathroom above, and a bounded vertical zone between them. The diagram shows owned geography rather than exact pipe, duct or cable routes.'
  },
  {
    entryId: 'part-iv',
    id: 'D-F11',
    anchor:
      'The architectural implication is subtle but significant: landscape cannot be treated as independent decoration. Permanent raised planters, fountains, stores or other fixed objects must not casually consume the only credible maintenance position.',
    image: 'figures/reference-house-external-maintenance-geography.svg',
    alt: 'Reference House external maintenance geography',
    caption:
      'External maintenance geography. Working space is reserved around the house and inside the courtyard so façade, roof-edge, rainwater and plant tasks can be approached by ordinary temporary means. Landscape remains subordinate to those task-specific routes rather than consuming them after design.'
  },
  {
    entryId: 'part-iv',
    id: 'D-F10',
    anchor:
      'A separate higher-level emergency overflow provides an independent failure route before abnormal standing water reaches internal thresholds.',
    image: 'figures/reference-house-water-failure-geography.svg',
    alt: 'Reference House water and failure geography',
    caption:
      'Water and failure geography. Four low-slope roof fields drain away from the courtyard toward inspectable external edges. The court manages principally its own open-to-sky area through a short primary route toward the service side, with an independent higher-level overflow for abnormal water. Geometry reduces consequence; it does not establish hydraulic capacity.'
  }
]

function figureBlock(placement: FigurePlacement): string {
  return `![${placement.alt}](${placement.image})\n\n*${placement.caption}*`
}

export function applyPublicationFigures(entryId: string, markdown: string): string {
  const entryPlacements = placements.filter((placement) => placement.entryId === entryId)

  for (const placement of entryPlacements) {
    if (markdown.includes(`](${placement.image})`)) {
      throw new Error(`${placement.id} is already present in ${entryId}; remove duplicate figure composition.`)
    }

    const first = markdown.indexOf(placement.anchor)
    if (first < 0) {
      throw new Error(`${placement.id} anchor changed in ${entryId}; re-place the figure deliberately.`)
    }
    if (markdown.indexOf(placement.anchor, first + placement.anchor.length) >= 0) {
      throw new Error(`${placement.id} anchor is ambiguous in ${entryId}; choose a unique placement.`)
    }

    const end = first + placement.anchor.length
    markdown = `${markdown.slice(0, end)}\n\n${figureBlock(placement)}${markdown.slice(end)}`
  }

  return markdown
}

export function publicationFigurePlacements(): readonly FigurePlacement[] {
  return placements
}
