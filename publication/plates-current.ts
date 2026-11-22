export type PlateClass = 'PLATE_SINGLE' | 'PLATE_PAIR' | 'PLATE_SPREAD'

interface PlateView {
  readonly title: string
  readonly image: string
  readonly alt: string
  readonly scale: string
  readonly caption: string
}

interface PlatePlacement {
  readonly entryId: 'part-iv'
  readonly anchor: string
  readonly pageClass: PlateClass
  readonly views: readonly PlateView[]
}

const placements: readonly PlatePlacement[] = [
  {
    entryId: 'part-iv',
    anchor: 'Storage and maintenance approach are treated as spatial demands rather than annotations added after the plan is composed.',
    pageClass: 'PLATE_PAIR',
    views: [
      { title: 'Current house — ground floor', image: '../../publication/current/ground-plan.svg', alt: 'Nominal current courtyard-house ground plan', scale: '1:100', caption: 'Ground floor of the accepted 12 m square courtyard layout. Wall and floor assemblies, service fit and structural selection remain open; this nominal plan does not reconcile roof or section datums.' },
      { title: 'Current house — first floor', image: '../../publication/current/first-plan.svg', alt: 'Nominal current courtyard-house first plan', scale: '1:100', caption: 'The accepted upper layout contains four bedrooms, the court, stair and entrance void. Opening sizes and partition depths are nominal reservations; the complete structural and interior scheme awaits selection.' }
    ]
  },
  {
    entryId: 'part-iv',
    anchor: '## Order without false symmetry',
    pageClass: 'PLATE_SINGLE',
    views: [
      { title: 'Current house — principal front', image: '../../publication/current/front-elevation.svg', alt: 'Nominal current five-bay front elevation with centred entrance', scale: '1:100', caption: 'The accepted five-bay front and centred entrance, drawn from the current architectural source. Joinery profiles and the pitched roof remain nominal; floor, foundation and roof assemblies await selection. The raised-ground and reinforced-concrete trials are not adopted by this view.' }
    ]
  },
  {
    entryId: 'part-iv',
    anchor: 'Earlier unequal-storey studies explain a previous choice; they do not describe these current datums.',
    pageClass: 'PLATE_SINGLE',
    views: [
      { title: 'Current house — principal section', image: '../../publication/current/principal-section.svg', alt: 'Nominal current principal section through entrance void and open courtyard', scale: '1:100', caption: 'Section through the entrance void and open court, looking west, with architectural floors at 0 and +3.45 m. Floor layers, foundation envelopes and the roof build-up are provisional representations, not selected construction. This section does not adopt the reinforced-concrete cage or the +715 mm raised-ground trial.' }
    ]
  },
  {
    entryId: 'part-iv',
    anchor: '## Quiet walls and selective infrastructure',
    pageClass: 'PLATE_PAIR',
    views: [
      { title: 'Study — fixed comparison', image: '../../publication/current/study-fixed.svg', alt: 'Furnished Study with fixed joinery and strip floor', scale: 'NTS', caption: 'Fixed joinery and strip flooring in the occupied Study geometry. The furniture and openings are shared with the removable-finish proposal opposite. The occupied-room opening set-out still needs reconciliation with the nominal house plans; this is an appearance comparison, not an accepted detail.' },
      { title: 'Study — timber proposal', image: '../../publication/current/study-timber.svg', alt: 'Furnished Study with hung timber and seated oak finish modules', scale: 'NTS', caption: 'Gravity-hung timber wall faces and seated oak floor modules in the same occupied Study. Protective boundaries and service support remain independent. Owner aesthetic approval and installed performance remain open.' }
    ]
  },
  {
    entryId: 'part-iv',
    anchor: 'Task visibility, glare, arrival in darkness and replacement still require a matched physical trial.',
    pageClass: 'PLATE_SINGLE',
    views: [
      { title: 'Study — tiled comparison', image: '../../publication/current/study-tile.svg', alt: 'Furnished Study with framed tile fields', scale: 'NTS', caption: 'A worked tile-faced comparison on the same occupied room geometry. Its heavier wall finish and more fragmented set-out are reasons to prefer the timber Study proposal. Dry joints and separate removal do not establish wet-room performance or owner acceptance.' }
    ]
  }
]

const plateStyle = `<style>
@page hk-plate { size: A4; margin: 0; @top-left { content: none; } @top-right { content: none; } @bottom-left { content: none; } @bottom-right { content: none; } }
.hk-plate-page { page: hk-plate; break-before: page; break-after: page; position: relative; left: 50%; transform: translateX(-50%); width: 210mm; height: 297mm; margin: 0; overflow: hidden; box-sizing: border-box; font-family: Arial, Helvetica, sans-serif; background: #fff; }
.hk-plate-page--pair-start, .hk-plate-page--spread-start { break-before: left; }
.hk-plate-header { position: absolute; left: 22mm; right: 22mm; top: 14mm; display: flex; justify-content: space-between; align-items: baseline; gap: 6mm; }
.hk-plate-title { margin: 0; font: 700 11pt/1.15 Arial, Helvetica, sans-serif; }
.hk-plate-scale { margin: 0; font: 8.3pt/1 Arial, Helvetica, sans-serif; white-space: nowrap; }
.hk-plate-drawing { position: absolute; left: 50%; top: 34mm; transform: translateX(-50%); margin: 0; max-width: none; width: auto; height: auto; }
.hk-plate-caption { position: absolute; left: 22mm; right: 22mm; bottom: 24mm; margin: 0; font: 8.3pt/1.35 Arial, Helvetica, sans-serif; color: #555; }
.hk-plate-furniture { position: absolute; left: 30mm; top: 32mm; width: 145mm; }
.hk-plate-furniture .hk-plate-title { margin-bottom: 3mm; }
.hk-plate-furniture .hk-plate-scale { margin-bottom: 12mm; }
.hk-plate-furniture .hk-plate-caption { position: static; max-width: 132mm; color: #000; }
</style>`

function viewPage(view: PlateView, extraClass = ''): string {
  return `<section class="hk-plate-page ${extraClass}" data-plate-image="${view.image}">
<header class="hk-plate-header"><p class="hk-plate-title">${view.title}</p><p class="hk-plate-scale">${view.scale}</p></header>
<img class="hk-plate-drawing" src="${view.image}" alt="${view.alt}">
<p class="hk-plate-caption">${view.caption}</p>
</section>`
}

function placementBlock(placement: PlatePlacement): string {
  if (placement.pageClass === 'PLATE_SINGLE') return viewPage(placement.views[0], 'hk-plate-page--single')
  if (placement.pageClass === 'PLATE_PAIR') {
    const [left, right] = placement.views
    return `${viewPage(left, 'hk-plate-page--pair hk-plate-page--pair-start')}\n${viewPage(right, 'hk-plate-page--pair')}`
  }

  const view = placement.views[0]
  return `<section class="hk-plate-page hk-plate-page--spread hk-plate-page--spread-start">
<div class="hk-plate-furniture"><p class="hk-plate-title">${view.title}</p><p class="hk-plate-scale">${view.scale}</p><p class="hk-plate-caption">${view.caption}</p></div>
</section>
${viewPage(view, 'hk-plate-page--spread')}`
}

export function applyPublicationPlates(entryId: string, markdown: string): string {
  const entryPlacements = placements.filter((placement) => placement.entryId === entryId)
  if (entryPlacements.length === 0) return markdown

  const images = entryPlacements.flatMap((placement) => placement.views.map((view) => view.image))
  if (new Set(images).size !== images.length) throw new Error(`Duplicate controlled plate image in ${entryId}`)

  let styled = false
  for (const placement of entryPlacements) {
    for (const view of placement.views) {
      if (markdown.includes(view.image)) throw new Error(`${view.alt} is already present in ${entryId}; remove duplicate plate composition.`)
    }

    const first = markdown.indexOf(placement.anchor)
    if (first < 0) throw new Error(`${placement.pageClass} anchor changed in ${entryId}; re-place the plate deliberately.`)
    if (markdown.indexOf(placement.anchor, first + placement.anchor.length) >= 0) throw new Error(`${placement.pageClass} anchor is ambiguous in ${entryId}; choose a unique placement.`)

    const end = first + placement.anchor.length
    const prefix = styled ? '' : `${plateStyle}\n\n`
    styled = true
    markdown = `${markdown.slice(0, end)}\n\n${prefix}${placementBlock(placement)}${markdown.slice(end)}`
  }

  return markdown
}

export function publicationPlatePlacements(): readonly PlatePlacement[] {
  return placements
}
