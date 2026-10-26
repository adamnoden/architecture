<!-- nav-exclude: redirect -->
# ADE-00 — architectural drawing engine audit + target architecture freeze

**Programme:** ADE — Architectural Drawing Engine capability uplift  
**Parent:** #812  
**Packet:** #813  
**Baseline:** `e7f991bbde5fd085a2fb574de6939f1c600c24bc`  
**Triggered by:** PLT-03 / #746 and PLT-03B / #759 review  
**Status:** decision record

## Decision

**Significant intermediate-layer uplift is required. Complete backend replacement is not earned.**

The current `DrawingScene` + SVG machinery is a sound deterministic terminal vector IR/backend. The failure is the missing architectural representation/compiler layer above it. PLT-03 currently converts architectural facts directly into paper-space lines/rectangles/text, so wall topology, junctions, openings, partition states and uncertainty are lost before styling begins.

Target pipeline:

```text
architectural authority / compiled facts
        ↓
ADE semantic view model (model space + provenance)
        ↓
ADE representation compiler
  - wall networks + joins
  - assembly/layer visibility
  - opening subtraction
  - partition / adjacency states
  - uncertainty grammar
  - scale/profile policy
  - composed notation
        ↓
DrawingScene (paper-space vector IR)
        ↓
existing SVG / PDF backend
```

## Root causes frozen

| Observed defect | Owning cause | Correct response |
|---|---|---|
| outer corner appears bordered/capped | independent wall rectangles; no join topology | ADE-02 |
| inner courtyard wall appears not to connect | separate wall bodies meet only by coordinate coincidence | ADE-02 |
| phantom dashed lines inside openings | uncertainty encoded as extra jamb-like linework | ADE-04 |
| partition existence unclear | unresolved planning boundary collapses to a generic line | ADE-05 |
| wall reads as generic slab | RH-10 layered wall family is discarded in representation | ADE-03 |
| loadbearing inner leaf not legible | no assembly semantics reach the drawing | ADE-03 |
| style changes expose new artefacts | semantic composition is lost before tokens act | ADE-01/02 |
| whole-house iteration discovers local failures too late | no micro-fixture capability surface | ADE-06 |

## Backend assessment

Retain the current backend because it already provides:

- deterministic serialization;
- physical paper dimensions;
- vector-only output;
- explicit architectural scale metadata;
- physical line/type contracts;
- source/entity metadata;
- generic non-Reference-House use;
- a deliberately inspectable final IR.

ADE may later earn small backend extensions such as polygon/path/group/clip support if a proved architectural capability genuinely requires them. No current evidence justifies replacing SVG, adopting a CAD kernel, browser canvas, or a new general-purpose graphics library.

## Architectural source consequence

RH-10 already selects at coordination level:

```text
facing masonry outer weathering leaf
→ drained / insulated cavity
→ substantial loadbearing masonry inner leaf
→ continuous internal air / finish boundary
```

with an approximate geometric family around:

- ~102.5 mm outer masonry leaf;
- ~150–175 mm cavity class;
- ~140 mm structural inner masonry leaf;
- ~15 mm direct finish/tolerance class;
- ~410–435 mm overall coordination family;
- 400–425 mm normal planning family;
- 450 mm stress-test thickness.

At 1:50 this family is physically large enough to show a restrained layered convention. ADE may expose the coordination-level leaf/cavity/inner-leaf distinction, but may not invent insulation type, ties, lintels, DPC, frame position, thermal closure, structural adequacy or exact technical junctions.

## Partition source gate

The current Reference House source owns internal planning boundaries and required adjacencies, not a general finished partition thickness/family.

ADE-05 must decide whether:

1. a distinct unresolved partition-datum convention is architecturally acceptable at this maturity; or
2. the 1:50 plan has exposed a genuine upstream architectural gap and the Reference House now needs a bounded partition-family decision.

ADE must not choose the partition construction for visual completeness.

## Capability-first method

Whole-house redraw is suspended until the following can be proved as small composable fixtures:

1. straight wall run;
2. L corner;
3. T junction;
4. cross junction;
5. closed outer ring;
6. closed courtyard ring;
7. coordination cavity wall;
8. exact/approximate opening;
9. range-width opening;
10. known-centre / unknown-width opening;
11. qualitative opening obligation;
12. unresolved partition datum;
13. required adjacency without invented door;
14. resolved partition family when source authority exists;
15. opening near a corner;
16. composed dimension;
17. 1:100 ↔ 1:50 representation profile;
18. provenance round-trip.

Each capability requires a tiny semantic fixture, machine assertions, exact-size rendered specimen and visual keep/revise/reject verdict before it is composed into Ovid’s House.

## Frozen representation principles

- **Topology before styling.** A wall corner is a semantic join, not a line-join CSS choice.
- **Architectural marks and epistemic marks are different classes.** Uncertainty must not look like hidden construction.
- **Scale changes representation, not truth.** A larger scale may expose more already-owned structure but cannot create authority.
- **Paper-space stays physical.** Typography, strokes, dashes and markers do not double merely because geometry moves from 1:100 to 1:50.
- **More detail must mean more owned architecture.** Decorative technicality is a failure.
- **Basic status must read without a rescue legend.** Permanent wall, layered wall, partition datum, opening and uncertainty need distinct primary graphics.

## Anti-goals

ADE is not authorised to become:

- general BIM/CAD;
- a design constraint solver;
- an automatic plan generator;
- a construction-document platform;
- an arbitrary geometry kernel without an earned view requirement;
- a library of every architectural symbol;
- a renderer that guesses missing source facts;
- a replacement for Reference House architectural authority.

## Migration / rollback

ADE remains additive until the ground-plan migration:

- `drawing-publication-v1` remains immutable;
- the current PLT-03 candidate remains evidence of the direct-primitives seam;
- the A2 1:50 result remains a valid scale/composition finding;
- ADE-01 through ADE-06 develop against generic micro-fixtures first;
- ADE-07 rebuilds the Reference House ground plan through ADE;
- PLT-03 physical review restarts from that candidate;
- ADE-08 proves non-RH generality and first-floor compatibility before PLT-04 rollout.

If ADE fails to improve the drawing materially, it can be rejected without corrupting the released drawing system.

## PLT consequence

The current PLT-03 candidate is no longer eligible for final owner physical acceptance, v2 token extraction or propagation to PLT-04.

The scale finding survives:

> **For the current house size, A2 WALL at true 1:50 composes materially better than A2 at 1:100.**

PLT-03 is now blocked by ADE-07 / #820, not by typography or scale.

**Next authorised packet: ADE-01 / #814 — semantic plan IR + representation-profile contract.**
