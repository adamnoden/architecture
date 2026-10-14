# PR-00D — Figure and Visual-Argument Register

**Status:** active gate control  
**Date:** 2026-10-14  
**PR-00 baseline:** `3dae9bb1ea7010da94529cb8a48f2f9970be4cdd`  
**Parent programme:** [`PR-00 — Candidate-Book Freeze Execution Programme`](../docs/manuscript/pr00-candidate-book-freeze-programme.md)  
**Umbrella issue:** #71 — `PUB-01 — publication credibility and release programme`  
**COA handoff:** [`Compiler Output Architecture programme`](../docs/computational/compiler-output-architecture-programme.md)

PR-00D completes the principal visual reasoning of *Ovid’s House*. It does not make the book more credible by making it look more technical. Every retained figure must explain an architectural proposition at no greater authority than its source.

> **A publication figure is an argument, not decoration and not proof by appearance.**

---

## 1. Entry state

PR-00A through PR-00C are complete. COA-00 through COA-06 are complete and PASS. The former publication stop-line is therefore released.

The preferred Reference House source substrate is the COA successor family under `docs/reference-house/generated/`:

- `ground-floor-plan.svg`;
- `first-floor-plan.svg`;
- `principal-section.svg`;
- `first-floor-structure.svg`;
- `service-register.md`;
- `boundary-register.md`;
- `output-manifest.json`.

The six pre-COA RH-C1–RH-C4 SVGs remain historical executable evidence. They are **not** the preferred publication source merely because they remain in the repository.

COA outputs are semantic inspection outputs, not finished book figures. PR-00D owns publication selection, simplification, composition, hierarchy, typography and captions.

---

## 2. Figure constitution

Every principal figure must record or make recoverable:

1. **publication purpose** — the proposition or spatial relation the reader should understand;
2. **classification** — `ESSENTIAL ARGUMENT`, `USEFUL ORIENTATION`, `REFERENCE`, or `DECORATIVE / REMOVE`;
3. **source authority** — canonical project source, COA output, or explicitly analytical derivation;
4. **claim boundary** — what the figure does and does not establish;
5. **publication form** — the minimum geometry and annotation needed to carry the argument;
6. **caption duty** — what the reader should learn, including uncertainty where material;
7. **print fitness** — legible in monochrome at intended trim size.

### Graphic rule

Prefer simple analytical linework over pseudo-construction drawing. Use deterministic/code-based SVG where it improves repeatability and correctness, but do not inherit compiler/report aesthetics merely because the source is generated.

### Authority rule

Do not convert any of the following into visually precise facts unless their owning source actually provides them:

- unresolved wall-face construction geometry;
- exact internal door positions or swings;
- finished stair construction;
- structural sizing or capacity;
- exact MEP routes or sizes;
- thermal, moisture, fire or regulatory performance;
- product adequacy;
- outcomes of P03/P04 or external professional review before those results exist.

Where a relationship is known but exact geometry is unresolved, preserve qualitative/unresolved notation or simplify the figure so the unresolved geometry is not falsely implied.

---

## 3. Principal figure inventory

| ID | Figure family | Class | Publication purpose | Source authority / starting material | Disposition |
|---|---|---|---|---|---|
| D-F01 | Selective permanence / different change rates / architectural platform | **ESSENTIAL ARGUMENT** | Explain why the house distinguishes enduring fabric, durable interfaces and faster-changing systems without treating the building as a generic kit of parts. | Parts I §§2–4; governing principles; established change-layer lineage as acknowledged in manuscript. | **AUTHOR NEW** publication-native analytical SVG. No pseudo-numeric lifespan precision. |
| D-F02 | Designed interface: component + designed interface + component | **ESSENTIAL ARGUMENT** | Show that support, restraint, movement, sealing, finish and access can be assigned deliberately rather than collapsed into one irreversible junction. | Part II ch. 6; HSA-P-008; HSA-P-022; interface research. | **AUTHOR NEW** analytical junction diagram; abstract enough not to imply an engineered detail. |
| D-F03 | Failure architecture / water consequence | **ESSENTIAL ARGUMENT** | Explain first defence versus second consequence: contain, make visible, isolate, drain/dry and recover instead of relying only on perfect prevention. | Part II ch. 7; HSA-P-017; HSA-P-018; fail-safe water strategy. | **AUTHOR NEW** causal/spatial diagram. Avoid implying one mandatory plumbing topology. |
| D-F04 | External maintenance geography | **ESSENTIAL ARGUMENT** | Show maintenance as approach + support + work position + handling/withdrawal + reinstatement, extending beyond the envelope into site/landscape geometry. | Part II ch. 8; `docs/manuscript/maintenance-geography-external.md`; RH `external-maintenance-access-rh08.svg` as project occurrence. | **AUTHOR NEW** general analytical figure; RH drawing may appear separately as an occurrence. |
| D-F05 | Pattern-language relationship / generative sequence | **REFERENCE** | Let a reader understand sparse pattern relationships, sequence and rewind without reading the repository authoring model. | `publication/part-iii.md`; canonical 21 patterns; `docs/patterns/service-topology-sequence.md`. | **AUTHOR NEW** sparse publication map. Do not imply one mandatory whole-house topology. |
| D-F06 | Reference House type and orientation | **ESSENTIAL ORIENTATION** | Establish the compact courtyard type and how ground/upper plans, section and elevations relate. | COA generated ground/first plans + A–A section; RH morphology/elevations where needed. | **DERIVE** publication set from COA; add only minimum type/orientation context. |
| D-F07 | Reference House spatial/sectional order | **ESSENTIAL ARGUMENT** | Show hierarchy, courtyard, entrance/arrival relation and vertical order without turning G-01 into a project-specific plan rule. | COA plans/section; frozen G-01 v0.1; Part IV chs. 13–14. | **DERIVE** from COA with publication-native labels/caption. |
| D-F08 | Reference House material / structural / assembly logic | **USEFUL ORIENTATION** | Explain current pre-engineering structural concept and permanent/changeable relationship while keeping capacity unresolved. | COA first-floor structure; RH structural coordination; RH09 tectonic family. | **DERIVE / REDRAW** only if it materially improves ch. 15. Must say topology/coordination, not adequacy. |
| D-F09 | Reference House service / maintenance geography | **ESSENTIAL ARGUMENT** | Show how plant, riser, high-service rooms, horizontal distribution and access cluster spatially. | COA service register; COA plans; RH service topology records. | **AUTHOR DERIVATIVE** plan/topology overlay from canonical relationships. Exact routes remain unresolved where source does not own them. |
| D-F10 | Reference House water / roof failure geography | **ESSENTIAL ARGUMENT** | Explain outward roof drainage, courtyard primary/emergency routes and visible failure geography as a project decision. | RH08 roof/drainage coordination; COA boundary register; relevant plan geometry. | **REFINE / REDRAW** existing RH08 analytical material for book. Do not claim drainage capacity. |
| D-F11 | Reference House external maintenance geography | **ESSENTIAL ARGUMENT** | Demonstrate one project occurrence of access zones around façade/roof/courtyard. | RH08 external-maintenance plan + COA plan geometry. | **REFINE / REDRAW** as publication occurrence, not general proof. |
| D-F12 | Reference House future intervention scenarios | **USEFUL ORIENTATION**, promote to essential only if prose remains weaker without it | Show where representative future work starts/stops: plant replacement, window replacement, wet-room isolation/access, new dry service, roof/gutter work. | Part IV ch. 18; Part V ch. 25; canonical patterns and RH geometry. | **AUTHOR NEW** small-multiple/sequence only where scenario geometry is actually known. Label as scenarios. |
| D-F13 | Evidence / maturity model | **DECORATIVE / REMOVE unless demonstrated necessary** | Existing prose/table already communicates the distinction. | Reader's Guide; project maturity model. | Do not add a diagram merely to visualise administration. Reconsider only if print proof shows a comprehension problem. |

---

## 4. Existing visual material — status by role

### Preferred source material

The COA successor drawings are the preferred Reference House plan/section/structure source because they share orientation, section registration, uncertainty notation and one canonical compile identity.

### Project-occurrence material worth mining

The following may support publication figures after deliberate review rather than direct inclusion:

- `gross-morphology-baseline.svg`;
- `outer-elevations-rh10.svg`;
- `courtyard-elevations-study.svg`;
- `roof-drainage-plan-rh08.svg`;
- `external-maintenance-access-rh08.svg`;
- `environmental-coordination.svg`;
- `energy-heat-topology-rh10.svg`;
- `tectonic-interface-family-rh09.svg`;
- `service-riser-section-rh06.svg`.

Their development/control labels and original visual hierarchy do not automatically belong in the book.

### Open-evidence figures

Prototype drawings such as P03 floor-edge options and the P04 wall/ceiling rig may explain **what is to be tested** if the manuscript genuinely needs that explanation. They must not be styled or captioned as validated construction details before physical results exist.

### Historical / research-only figures

RH-C1–RH-C4 frozen artefacts, RH-C0 comparator drawings and G-01 D8 falsification diagrams remain provenance/research evidence. They should enter the candidate book only where a specific publication argument requires that history.

---

## 5. PR-00D execution slices

These are internal execution slices, not new top-level programmes.

### D0 — inventory and figure constitution

This register. Freeze purpose, classification, authority and source strategy before drawing production.

**Gate:** no principal figure begins without a named argument and authority boundary.

### D1 — core architectural argument figures

Produce D-F01 through D-F04 first:

1. selective permanence / platform;
2. designed interface;
3. failure architecture;
4. maintenance geography.

These figures carry the book's central architectural proposition and do not depend on Reference House taste.

**Gate:** each must work in monochrome, stand at publication scale, and remain style-neutral.

### D2 — pattern-language reference figure

Produce D-F05 only after checking that the map is materially clearer than prose. Keep the graph sparse and separate pattern relationship from sequence order.

### D3 — Reference House orientation and architectural argument

Produce D-F06 through D-F08 from the COA successor substrate plus canonical RH/G-01 sources.

**Gate:** publication simplification must not remove uncertainty in a way that invents geometry or technical adequacy.

### D4 — Reference House systems, maintenance and scenarios

Produce D-F09 through D-F12 selectively. Prefer one strong figure over several control diagrams. Service/boundary registers remain source material; their tabular/report form need not be reproduced visually unless spatial form answers a reader question.

### D5 — whole-book visual QA and integration

For every retained figure:

- verify source and caption;
- test monochrome and intended trim size;
- remove repo/gate vocabulary from reader-facing labels;
- check consistency with surrounding prose;
- check that repeated visual language means the same thing throughout;
- remove figures that do not carry enough explanatory load;
- run publication validation / print preparation before PR-00D close.

---

## 6. Explicit non-goals

PR-00D does **not**:

- redesign COA or reopen its historical evidence;
- create COA-07;
- expand Metamorph Compiler supported domain;
- add missing engineering detail so a figure looks finished;
- invent a complete Georgian generative grammar;
- turn Reference House choices into Ovid’s House doctrine;
- resolve P03/P04 or competent professional review graphically;
- make the book image-rich for its own sake.

---

## 7. Gate

PR-00D passes when:

1. every chapter whose argument materially depends on a figure has one;
2. every retained principal figure has an explicit purpose, source and claim boundary;
3. the Reference House figure set derives from current trustworthy source material rather than obsolete RH-C presentation artefacts;
4. figures are legible and restrained in monochrome at intended trim size;
5. no figure implies technical, physical or regulatory proof beyond current authority;
6. decorative or redundant figures have been removed rather than retained to increase image count.

Only then does PR-00E — whole-book editorial hardening — begin.