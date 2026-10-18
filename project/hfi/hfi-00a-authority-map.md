# HFI-00A — Human-Factors Authority Map

**Packet:** HFI-00A  
**Programme:** [`docs/development/human-factors-low-friction-inhabitation-programme.md`](../../docs/development/human-factors-low-friction-inhabitation-programme.md)  
**Execution plan:** [`docs/development/human-factors-low-friction-inhabitation-execution-plan.md`](../../docs/development/human-factors-low-friction-inhabitation-execution-plan.md)  
**Owning issue:** #195  
**Starting `main`:** `481ffc81c78b3a18c73173f3fc2d82b6adbbfcca`  
**Question:** where does authority currently live for every project layer HFI is allowed to inspect, challenge or later modify?  
**Boundary:** authority recovery only. No design correction, target, doctrine change, pattern change, Reference House geometry change, publication change or compiler expansion is authorised here.

---

## 1. Governing rule

HFI is a cross-cutting investigation, **not a new architectural authority layer**.

Its job is to identify human-factor evidence and defects, then route any accepted consequence back to the narrowest existing owner. The present owner hierarchy is:

```text
external evidence / research
        ↓
Ovid’s House constitution + standing disciplines
        ↓
strategies / patterns where a reusable response is earned
        ↓
selected grammar + project / Reference House architecture
        ↓
technical / delivery / computational representations where legitimately modelled
        ↓
publication drawings and other downstream communication
```

Evidence may force an upstream rewind, but a downstream representation must never become architectural authority merely because it exposes a defect first.

The existing architectural-specificity rule remains binding: **generalise the reason; localise the taste**. A Reference House convenience or one body/task scenario cannot become general Ovid’s House doctrine without independent abstraction and evidence.

---

## 2. Authority / owner map

| HFI concern | Current authority / owner | What that owner presently controls | HFI disposition |
|---|---|---|---|
| programme scope, packet order, proof boundary | `docs/development/human-factors-low-friction-inhabitation-programme.md`; execution plan; issue #195 | what HFI may investigate, packet boundaries, required evidence, integration rules | HFI records findings here, but cannot use programme control itself as architectural evidence |
| long-life / life-course proposition | `docs/manuscript/governing-principles.md` — especially Principles 1, 7, 8 and 11 plus governing proportionality constraints | foreseeable occupant change, useful/generous circulation, repose, intelligible local control, architecture/technology relationship | only HFI-05/08 may propose a hardened upstream change; HFI-00 only maps the current claim |
| low-vigilance / compensatory-attention research frame | `docs/research/repose-and-low-vigilance.md` and its evidence audit | present research argument that repeated occupation should minimise unnecessary monitoring/adaptation; movement and control are existing architectural concerns | HFI extends/tests this evidence family rather than inventing a competing philosophy |
| doctrine ↔ project specificity boundary | `docs/development/architectural-specificity-boundary.md` | prevents project morphology, taste, construction family or grammar from becoming general doctrine accidentally | every later HFI promotion must pass this firewall |
| reusable door/interface response | `docs/patterns/permanent-opening-replaceable-door.md` (`PAT-019`) | permanent opening vs replaceable doorset; fixing/adjustment, threshold and accessibility duties | HFI may challenge reach/force/swing/use consequences; a general reusable change returns here only if independently earned |
| reusable threshold response | `docs/patterns/designed-threshold.md` (`PAT-020`) | datum, wear, movement, weathering, drainage and accessibility at genuine transitions | HFI may challenge level/change-of-plane performance; detail remains condition-specific |
| selected pattern occurrences in RH01 | `docs/reference-house/pattern-occurrence-register.md` | where current patterns actually occur in this Reference House and what proof remains outstanding | occurrence changes follow an owning RH rewind; occurrence never proves a pattern generally |
| ground-floor room order, ordinary front-to-rear route and room-scale planning | `docs/reference-house/ground-floor-development.md` — RH-02 | selected G1 ground-floor topology, room reservations, circulation intent and room-scale adequacy | **RH-02 owns any material HFI defect in ground-floor order/route geometry** |
| principal stair, upper-floor order and upper circulation topology | `docs/reference-house/upper-floor-and-stair-development.md` — RH-03 | three-flight stair concept, stair/landing relationship, upper room order and circulation topology | **RH-03 owns material stair/upper-circulation HFI defects**; later technical checks do not displace that authority |
| occupied door/threshold/control/interface selection | `docs/reference-house/tectonic-integration-rh09.md` — RH-09 | occupied-surface hierarchy, door/window interfaces, substantially level external-threshold intent, accessible electrical accessory band and local service/control datums | **RH-09 owns material occupied-interface defects** unless the defect proves an upstream pattern/doctrine problem |
| whole-house visitability, entrance-level adaptation and coordination obligations | `docs/reference-house/whole-house-coordination-audit.md` — RH-10 | current M4(1)-level visitability intent, step-free internal ground floor, entrance approach/threshold obligation, ground WC access priority and adaptation statements | **RH-10 owns whole-house coordination consequences**; real-site approach remains explicitly unproved |
| current integrated Reference House description / cross-gate authority stack | `docs/reference-house/README.md` | current coordinated house summary and explicit boundary between doctrine, patterns, G-01, project morphology, technical families and real-site facts | useful index, but does not supersede the owning RH gate when a detail conflicts |
| competent external review boundary | `docs/reference-house/external-review-brief.md` — RH-11 package | questions requiring structural, fire/building-control, MEP/acoustic and building-physics/energy competence | HFI-08D may add a bounded inclusive-design/human-factors handoff; HFI cannot self-award M5 |
| computational semantic/proof boundary | `docs/computational/README.md` plus the controlled Reference House executable stack through RH-C5 | bounded plan/structure/service/boundary semantics and one selected stair numeric-method correspondence | HFI may identify a future deterministic check, but **does not create RH-C6 or expand M4 computational scope** |
| current stair numeric correspondence | RH-C5 as summarised by `docs/computational/README.md` | canonical RH stair values compared against selected Approved Document K 2013 private-stair guidance, explicitly not whole-regulation compliance | any stronger HFI stair target must remain a separate architectural/evidence proposition; do not rewrite the external method to manufacture a result |
| delivery translation | `docs/delivery/README.md` and its implementation briefs | translates sufficiently mature propositions into real-project requirements without upgrading research into proof | HFI-08C may add only earned delivery obligations/tests |
| publication representation / drawing lineage | DRW issue #154; `docs/publication/architectural-drawing-programme.md`; DRW execution plan | architectural drawing authority, renderer/source lineage, plate/print proof and publication integration | drawings may expose HFI defects but **cannot correct source geometry locally**; accepted defects rewind architecture first |
| physical-object freeze | PR-02 publication programme / existing DRW-HFI concurrency rule | final private physical-object production after drawing/publication reconciliation | PR-02 must not freeze known stale HFI-sensitive geometry or publication content |

---

## 3. Current Reference House authority relevant to HFI

The current house is **M3 at virtual-design scope**, while the public architectural position and bounded computational track remain M4 at their own scopes. HFI therefore starts from a coordinated but still challengeable house, not from an externally validated accessibility or ergonomics baseline.

The existing human-factors-sensitive authority is deliberately distributed:

- **RH-02** owns the selected ground-floor domestic order and the ordinary all-weather route.
- **RH-03** owns the principal stair concept and upper circulation topology.
- **RH-09** owns selected occupied interfaces, substantially level external-threshold intent and current accessory/control placement assumptions.
- **RH-10** owns whole-house coordination statements about step-free internal ground-floor movement, entrance-level WC/access priority, visitability and life-course adaptation intent.
- **RH-11** owns the current external competent-review boundary.
- **RH-C5** owns only a bounded machine correspondence between controlled stair values and one selected Approved Document K method family.

No one of these may silently overwrite another. If HFI later proves, for example, that the stair geometry is materially wrong, the correction begins at RH-03; RH-C5, generated views and DRW plates become downstream reconciliation work.

---

## 4. Current DRW state and concurrency boundary

At the HFI-00A starting `main`, **DRW-03 is complete** and the first native ground-floor plan vertical slice has been carried through controlled SVG and physical plate proof.

Concurrent DRW work has since entered **DRW-04A**, the first-floor publication-view authority audit. That audit split after exposing a pre-existing upper-circulation continuity defect. Draft PR #200 (`DRW-04A.1 — restore upper-circulation continuity`) is currently open and proposes a bounded RH source correction before DRW-04A resumes.

For HFI authority purposes:

1. unmerged DRW branches are **not current architectural authority**;
2. HFI-00B must freeze its controlled baseline from the then-current merged `main`, not from an open drawing branch;
3. if DRW-04A.1 merges before HFI-00B, its corrected source becomes part of the baseline and HFI records that fact rather than re-litigating the drawing packet;
4. if HFI later finds a material defect in any DRW-visible geometry, the owning RH gate reopens first; the drawing is re-derived afterward;
5. DRW-12 / PR-02 cannot close over a known unresolved HFI-sensitive source change.

This preserves both programmes without pretending their timelines are serial.

---

## 5. Non-authority / anti-shortcut map

The following are useful evidence or representations but **must not be mistaken for the owner of an HFI conclusion**:

- publication SVGs or plate layouts;
- generated compiler inspection drawings;
- an RH-C5 `PASS` result outside its stated method boundary;
- an existing pattern occurrence in RH01;
- one Reference House dimension merely because it is already coordinated;
- one user annoyance or anecdote merely because it triggered HFI;
- one regulation/standard value treated automatically as Ovid’s House target;
- G-01 or Georgian precedent used to preserve an otherwise avoidable barrier;
- real-site approach, parking or pavement assumptions invented for the site-agnostic Reference House.

---

## 6. Findings from authority recovery

### F00A-01 — HFI already has upstream constitutional hooks

No new parent philosophy is required merely to justify the programme. Existing authority already covers foreseeable occupant change, useful/generous circulation, repose, understandable movement and intelligible local control. HFI’s job is to test and sharpen those claims with better human-factors evidence.

### F00A-02 — current accessibility content is fragmented by legitimate ownership

The project already contains stair comfort intent, level-access intent, control-height assumptions, visitability obligations, threshold patterns and life-course statements, but they live in different owners because they are different kinds of proposition. HFI should create a cross-cutting evidence/taxonomy layer without flattening those owner boundaries.

### F00A-03 — the Reference House remains challengeable

RH01’s M3 coordination status means current geometry is a controlled design proposition, not an incumbent that HFI must rationalise. A later material HFI finding can reopen the correct RH gate.

### F00A-04 — computation is downstream of architectural target formation

RH-C5 is valuable evidence that the current stair can be checked deterministically against one declared external method. It is not authority for human comfort, falls risk, inclusive design or a future stronger Ovid’s House stair target.

### F00A-05 — DRW can reveal defects without owning them

The active DRW-04A.1 split demonstrates the required control behaviour: a publication-authority audit exposed an architectural-source problem and routed correction upstream instead of drawing around it. HFI adopts the same rule.

---

## 7. Rejected interpretations

HFI-00A rejects these shortcuts:

- **“HFI is the new owner of accessibility.”** False. HFI coordinates research and findings; existing architectural layers retain ownership.
- **“Approved Document M/K values are already project targets.”** False. They are regulatory/guidance evidence at their stated boundary until HFI-01/02/06 classifies them.
- **“RH-C5 proves the stair is good.”** False. It proves only bounded numeric-method correspondence.
- **“DRW geometry becomes canonical because it is printable.”** False. Publication geometry remains derived from controlled architectural source.
- **“The current RH plan should be protected because it is coordinated.”** False. Coordination is not external validation and grants no incumbency advantage against material HFI evidence.
- **“All HFI outcomes should become patterns or doctrine.”** False. Many may remain project-specific, delivery-specific, established-practice confirmations or negative findings.

---

## 8. Checks

HFI-00A acceptance is satisfied when:

- current `main` and programme authority are identified;
- constitutional, research, pattern, RH, computational, delivery and publication owners are mapped;
- current DRW concurrency is recorded without treating unmerged work as authority;
- rewind ownership is explicit for ground plan, stair/upper circulation, occupied interfaces and whole-house visitability;
- RH-C5 remains bounded and no implicit RH-C6 is created;
- no architectural dimension, target, pattern, doctrine or compiler behaviour is changed.

This packet intentionally requires no external web research: it recovers **project authority**, not substantive human-factors evidence. External evidence begins under HFI-01.

---

## 9. Authority / maturity consequences

**None.** HFI-00A creates an internal control record only.

- Ovid’s House doctrine: unchanged.
- Pattern language: unchanged.
- Reference House: unchanged at M3 virtual-design scope.
- Computational track: unchanged at bounded M4 scope.
- Publication / DRW: unchanged by this packet.
- Delivery: unchanged.

No downstream artefact becomes stale merely because this map now exists.

---

## 10. Exact next packet

**HFI-00B — controlled baseline.**

Freeze the exact then-current HFI-sensitive Reference House facts and source identities: RH-02 ground-floor order, RH-03 stair/upper-floor geometry, RH-09 occupied interfaces/thresholds, RH-10 visitability assumptions and RH-C5 stair-method semantics. Re-read `main` first so any DRW-04A.1 merge is either incorporated explicitly or excluded explicitly.