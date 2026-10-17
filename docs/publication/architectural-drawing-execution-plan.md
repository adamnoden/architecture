<!-- nav-exclude: redirect -->
# Architectural drawing execution plan

**Programme:** DRW  
**Parent issue:** #154  
**Companion charter:** `docs/publication/architectural-drawing-programme.md`  
**Status:** execution plan; authoritative for work ordering and packet boundaries

## 1. Why the programme is being refactored

The architectural drawing programme is conceptually sound but its original stage structure was too horizontal for reliable execution. A stage such as “harden geometry” or “build the renderer” can expand into many coupled decisions before producing a reviewable result. That creates long-running work, weak restart points and a high chance that one stalled implementation blocks the whole programme.

The execution model is therefore changed without changing the architectural objective.

The programme-level rules remain: one controlled geometry source; no invented precision; mathematical/SVG-native output; professional architectural conventions; deliberate page composition; no CAD platform project.

The execution rule becomes:

> **After doctrine and drawing selection are frozen, work vertically, one drawing at a time, from source authority to printed proof.**

Source hardening and renderer capability are no longer giant stages to complete in advance. They grow only when a concrete drawing slice requires them.

## 2. Work-packet contract

A work packet is the normal unit of execution. Programme stages are coordination gates; packets are the units an agent actually performs.

Every packet must satisfy all of the following:

- one dominant question or outcome;
- no more than one material new generic renderer capability unless the capabilities are inseparable;
- an independently reviewable result: a decision record, source-model change, generated SVG, plate proof, validation or closeout record;
- no deliberate red state on `main`;
- tests/validation appropriate to the touched scope are green before closeout;
- all architectural/source decisions needed to reproduce the result are in the repository, not only in chat;
- controlled drawings are regenerated from source; manual post-editing of the SVG is not an accepted completion path;
- the packet ends with a durable handoff on issue #154 containing the commit SHA, evidence produced, checks run, any deviation from plan, and the next packet.

### 2.1 Split rule

A packet must be stopped and split before continuing when any of these becomes true:

- it exposes more than one substantial unplanned architectural-source decision;
- it requires multiple unrelated renderer abstractions before the named artefact can exist;
- it cannot reach a green, reviewable repository state in one focused execution session;
- an apparently local change starts redesigning an already-frozen programme decision;
- progress depends on a speculative generic capability that no frozen drawing currently needs.

The correct response to a packet growing unexpectedly is **not** to keep grinding. Record the discovery, split the dependency, finish the smaller prerequisite first, then resume.

### 2.2 State model

Packets use only these execution states:

- `QUEUED`
- `ACTIVE`
- `BLOCKED`
- `SPLIT`
- `DONE`

Default policy is one `ACTIVE` implementation packet at a time. Parallelism is allowed only when two packets are demonstrably independent and doing so reduces rather than increases coordination risk.

### 2.3 Issue policy

Issue #154 remains the programme handoff record. Do **not** create fifty child issues by default.

Create a separate issue only when a packet becomes independently substantial, is externally blocked, requires a multi-session investigation, or would benefit from its own review history. Otherwise the packet ID and its closeout comment on #154 are sufficient.

## 3. Execution architecture

DRW-00 through DRW-02 remain horizontal because they freeze the rules and the target drawing set. From DRW-03 onward, execution becomes vertical.

Each vertical drawing slice should follow this shape:

```text
view question / plate need
        ↓
source-authority audit
        ↓
minimal source hardening
        ↓
minimal renderer capability
        ↓
generated architectural SVG
        ↓
publication plate composition
        ↓
semantic + graphic + print proof
        ↓
green closeout
```

A later slice reuses everything earned by earlier slices and adds only what its own drawing requires.

## 4. Refactored programme gates

| Gate | Purpose | Completion evidence |
|---|---|---|
| **DRW-00** | Authority, before-state and physical-format freeze | Baseline, current figure disposition, format assumptions, PR-02 block |
| **DRW-01** | Visual doctrine and page grammar | Frozen line/scale/annotation/page doctrine plus specimen proof |
| **DRW-02** | Book-wide drawing register and plate map | Frozen view register, authority map, scales, page classes and plate sequence |
| **DRW-03** | Ground-floor plan vertical slice | First end-to-end publication drawing proving the minimal native renderer |
| **DRW-04** | First-floor plan + paired plan plate | Second plan plus cross-floor parity and facing-page composition |
| **DRW-05** | Principal section vertical slice | Cross-registered longitudinal section and its plate proof |
| **DRW-06** | Principal front elevation vertical slice | Cross-registered front elevation and elevation grammar |
| **DRW-07** | Roof/drainage vertical slice | Roof geometry, falls/water notation and publication roof plate |
| **DRW-08** | Remaining orthographic set | Service section, garden/courtyard material and honest setting/type material as retained by DRW-02 |
| **DRW-09** | Sectional axonometric / synthesis slice | One earned 2.5D hero drawing and spread proof |
| **DRW-10** | Analytical overlays | Structure, service, water/failure and maintenance readings over canonical geometry |
| **DRW-11** | Details + early-book architectural figures | Bounded detail family and accepted Parts I–III architectural figures |
| **DRW-12** | Whole-book integration, adversarial proof and freeze | Full/primer rebuild, generality proof, physical proof, closeout and PR-02 release |

The gate number is not permission to create one giant task. Every gate below is decomposed into packets.

## 5. Packet register

This register is intentionally more granular than the programme charter. Packet boundaries are provisional until the preceding packet closes; they may be split further but should not be silently merged into larger work.

### DRW-00 — authority and baseline

| Packet | Outcome |
|---|---|
| **DRW-00A** | Rebase from current `main`; recover authoritative publication, Reference House, renderer and figure-registry state. |
| **DRW-00B** | Freeze current book figure inventory and before-state SVG/PDF evidence. |
| **DRW-00C** | Record current A4/duplex, margin, binding/gutter and PR-02 physical-format assumptions that drawings must target. |
| **DRW-00D** | Classify current figures as retain / replace / demote / remove and close the baseline gate. |

### DRW-01 — drawing and page doctrine

| Packet | Outcome |
|---|---|
| **DRW-01A** | Curate the bounded precedent sample and extract only transferable drawing/page conventions. |
| **DRW-01B** | Freeze semantic line weights, poche, hatch, typography and monochrome/optional-accent rules in physical paper units. |
| **DRW-01C** | Freeze scale bands, symbols, dimensions, uncertainty notation and label rules. |
| **DRW-01D** | Freeze page classes, facing-page/spread/rotation hierarchy, caption ownership and gutter safe zones. |
| **DRW-01E** | Produce a small doctrine specimen/proof sheet and freeze DRW-01 only after it survives print-size review. |

### DRW-02 — exact drawing register and plate map

| Packet | Outcome |
|---|---|
| **DRW-02A** | Map every Part IV architectural claim to the minimum drawing/view that can prove it. |
| **DRW-02B** | Audit Parts I–III for claims that genuinely need architectural drawings rather than prose/abstract diagrams. |
| **DRW-02C** | Audit candidate details against current source/prototype authority; remove details that would manufacture certainty. |
| **DRW-02D** | Freeze the view register: `ESSENTIAL / SUPPORTING / OPTIONAL / DELETE`, source authority, scale band and page class for every retained view. |
| **DRW-02E** | Freeze the initial plate sequence/book rhythm so renderer work targets real compositions rather than isolated SVGs. |

### DRW-03 — ground-floor plan vertical slice

This is the first end-to-end renderer proof. It must not begin with a general drawing-framework build.

| Packet | Outcome |
|---|---|
| **DRW-03A** | Ground-floor publication-view authority audit: identify exactly what current source geometry can and cannot support. |
| **DRW-03B** | Add only the missing ground-plan source facts required by the frozen view, with authority/precision tests. |
| **DRW-03C** | Implement the minimum shared drawing scene, paper-space style tokens, plan projection and SVG serialization needed for this plan. |
| **DRW-03D** | Add only the plan symbols/annotations actually required: cut walls, openings/doors, stair notation, labels, dimensions, north/section markers as applicable. |
| **DRW-03E** | Generate the controlled ground-floor publication SVG with lineage and determinism checks. |
| **DRW-03F** | Compose the plan on its intended plate, run collision/scale/print proof, close the slice green. |

### DRW-04 — first-floor plan and paired-plan plate

| Packet | Outcome |
|---|---|
| **DRW-04A** | Audit and harden only first-floor facts not already earned by DRW-03. |
| **DRW-04B** | Add only genuinely new plan-rendering capability exposed by the first floor. |
| **DRW-04C** | Generate and verify the first-floor publication plan against the same conventions. |
| **DRW-04D** | Produce the ground/first paired facing-page plate at identical scale; prove cross-floor registration and print readability. |

### DRW-05 — principal longitudinal section

| Packet | Outcome |
|---|---|
| **DRW-05A** | Freeze the exact section cut/direction and audit missing vertical geometry. |
| **DRW-05B** | Harden only required level, floor, roof, opening and stair/source geometry. |
| **DRW-05C** | Add minimum section projection, cut/poche, beyond-line and level-marker capability. |
| **DRW-05D** | Generate the principal publication section and cross-check it against both plans. |
| **DRW-05E** | Compose/prove the section plate or spread; close semantic, graphic and physical-scale checks. |

### DRW-06 — principal front elevation

| Packet | Outcome |
|---|---|
| **DRW-06A** | Freeze elevation view and audit facade/opening vertical authority. |
| **DRW-06B** | Harden only facade, opening-head/sill, entrance and termination geometry needed for an honest elevation. |
| **DRW-06C** | Add minimum elevation projection/profile/beyond/surface notation. |
| **DRW-06D** | Generate the front elevation and prove opening parity with plan/section. |
| **DRW-06E** | Compose/prove the elevation plate and freeze the elevation grammar. |

### DRW-07 — roof and drainage

| Packet | Outcome |
|---|---|
| **DRW-07A** | Audit roof/drainage source authority against the frozen roof view. |
| **DRW-07B** | Harden only required roof planes/edges/falls/collection and overflow geometry. |
| **DRW-07C** | Add minimum roof-plan and analytical fall/drainage notation. |
| **DRW-07D** | Generate, compose and prove the roof/drainage plate. |

### DRW-08 — remaining orthographic family

Each retained view is its own packet or pair of packets; do not turn this gate into “finish all remaining drawings”.

| Packet | Outcome |
|---|---|
| **DRW-08A** | Service/transverse section authority audit and required source hardening. |
| **DRW-08B** | Generate, verify and plate-proof the service/transverse section. |
| **DRW-08C** | Generate and prove the garden elevation if retained by DRW-02; split first if new source hardening is substantial. |
| **DRW-08D** | Generate and prove the courtyard elevation/section material if retained; split first if needed. |
| **DRW-08E** | Generate the honest synthetic setting/type plan without inventing site specificity, if retained. |
| **DRW-08F** | Run an orthographic-family parity review and freeze the completed plan/section/elevation/roof substrate. |

A service-side elevation is not pre-authorised. It receives its own packet only if DRW-02 proves it adds non-duplicative architectural information.

### DRW-09 — sectional axonometric / synthesis view

| Packet | Outcome |
|---|---|
| **DRW-09A** | Freeze the hero cut/projection and prove existing orthographic geometry is sufficient; refuse or split missing source work. |
| **DRW-09B** | Add minimum XYZ/extrusion and deterministic parallel-projection capability. |
| **DRW-09C** | Add only required cut-plane clipping, face ordering/culling and projected line-role cleanup. |
| **DRW-09D** | Generate and architecturally review the sectional axonometric. |
| **DRW-09E** | Compose the hero spread, enforce gutter-safe cropping and physically prove it. |

### DRW-10 — analytical overlays

Each overlay is independent and must be reviewable over canonical architectural geometry.

| Packet | Outcome |
|---|---|
| **DRW-10A** | Structural/span overlay. |
| **DRW-10B** | Service/maintenance-geography overlay. |
| **DRW-10C** | Roof water/failure overlay, reusing DRW-07 substrate rather than redrawing the roof. |
| **DRW-10D** | External-maintenance/setting overlay. |
| **DRW-10E** | Decide whether a separate spatial/sectional-hierarchy drawing still earns its place; delete it if plans/sections already carry the argument. |
| **DRW-10F** | Analytical-family consistency and plate proof. |

### DRW-11 — bounded details and Parts I–III

| Packet | Outcome |
|---|---|
| **DRW-11A** | Freeze the small detail register against current technical/prototype authority. |
| **DRW-11B** | Produce/prove the permanent-opening / replaceable-frame detail if authorised. |
| **DRW-11C** | Produce/prove the service-wall/riser detail if authorised. |
| **DRW-11D** | Produce one further highest-value authorised interface detail; additional details require explicit value, not completionism. |
| **DRW-11E** | Freeze retain/redraw/delete decisions for the existing Parts I–III figures under the new doctrine. |
| **DRW-11F-n** | Implement each accepted new/redrawn early-book figure as its own restart-safe packet (`n` = one figure). |
| **DRW-11G** | Review early-book figures as a family and prove they do not revert to presentation-deck grammar. |

### DRW-12 — integration, proof and handoff

| Packet | Outcome |
|---|---|
| **DRW-12A** | Replace the publication figure registry/build inputs with the controlled drawing/plate sources; remove superseded active paths deliberately. |
| **DRW-12B** | Rebuild full book and primer; resolve page/spread rhythm and captions without editing controlled drawings manually. |
| **DRW-12C** | Complete semantic/cross-view/style/collision/determinism/vector checks plus non-RH01 synthetic generality fixtures. |
| **DRW-12D** | Run whole-book physical-size print proof and adversarial architectural reading; reopen only the smallest owning packet for material failures. |
| **DRW-12E** | Freeze renderer/style/view-spec versions, record before/after inventory and limitations, close DRW and release PR-02. |

## 6. Dependency policy

The dependency chain is intentionally shallow:

```text
DRW-00 → DRW-01 → DRW-02
                    ↓
                  DRW-03
                    ↓
                  DRW-04
                    ↓
                  DRW-05
                    ↓
                  DRW-06
                    ↓
                  DRW-07
                    ↓
                  DRW-08
                    ↓
                  DRW-09
                    ↓
                  DRW-10
                    ↓
                  DRW-11
                    ↓
                  DRW-12
```

This is the default order, not a licence to enlarge a gate. Within a gate, packets close one at a time.

A later packet may be skipped when DRW-02 has already classified its output as unnecessary. A skipped packet is recorded as `NOT_REQUIRED`, not silently forgotten.

## 7. Restart and stall protocol

Before starting a packet, the agent must recover from the repository and issue #154 rather than relying on chat context. The start note should state:

- packet ID;
- exact outcome;
- owning source files / artefacts likely to change;
- prerequisites already satisfied;
- acceptance checks.

If execution stalls:

1. stop adding scope;
2. identify the smallest unresolved dependency;
3. record it on #154;
4. split a prerequisite packet if necessary;
5. restore/retain a green repository state;
6. resume only after the prerequisite closes.

A stalled packet is not failure. Continuing to accumulate unrelated unfinished changes inside it is failure of execution discipline.

## 8. Completion note template

Every packet closeout on #154 should be short but lossless:

```text
DRW-XXY — DONE

Outcome:
- ...

Authority / decisions:
- ...

Evidence / artefacts:
- ...

Checks:
- ...

Commit:
- <sha>

Next:
- DRW-...
```

For a split packet, record the new packet IDs and why the original boundary proved too large.

## 9. Success criterion for the refactor

The execution refactor succeeds if the programme can be paused after any completed packet and another agent can resume from the repository without reconstructing a half-finished stage from chat.

No future handoff should need to say “DRW-04 is about 60% done”. It should be possible to say instead:

> `DRW-03C` through `DRW-03E` are complete; `DRW-03F` is next.

That granularity is deliberate. It is the control system that makes the larger architectural ambition executable.