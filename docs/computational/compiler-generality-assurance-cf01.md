# Compiler Generality Assurance — CF-01 Contrast Fixture Gate

**Status:** planned post-RH-C1 gate; **BLOCKED until RH-C1 passes**  
**Date:** 2026-10-12  
**Upstream:** [`reference-house-executable-slice.md`](reference-house-executable-slice.md)  
**Reference fixture:** [`../reference-house/model-baseline-rhc0.md`](../reference-house/model-baseline-rhc0.md)

## Purpose

RH-C1 deliberately answers a narrow question: can one canonical semantic source reproduce the frozen Reference House deterministically? A successful answer proves useful things about source authority, dependency propagation and deterministic projection. It does **not** prove that the resulting abstractions describe more than that one house.

CF-01 is the explicit generality challenge that follows RH-C1. Its job is to detect accidental Reference-House-shaped assumptions before structure, services and boundary semantics deepen the implementation.

The contrast fixture is **not a second fully developed Reference House**. It is a cheap, architecturally plausible adversarial fixture designed after RH-C1, when there is concrete code to attack.

---

## Lossless comparison with work already in the repository

| Idea | Repository state before CF-01 | Disposition |
|---|---|---|
| semantic entities rather than drawing primitives | already explicit in `formal-architectural-model.md` and `executable-architecture.md` | **ALREADY PLANNED** |
| source facts separated from derived facts and outputs | explicit in formal model; hardened by RH-C0 authored→derived contract | **ALREADY PLANNED** |
| distinguish House Kernel doctrine, grammar, technical authority and project fixture choices | explicit in computational authority boundary and architectural-specificity work | **ALREADY PLANNED** |
| identify dependency consequences before implementation | RH-C0.4 produced `rhc0-mutation-map.md` | **DONE / INPUT TO RH-C1** |
| implement mutation tests so source changes propagate through calculations and drawings | explicit RH-C1 requirement | **ALREADY PLANNED** |
| define semantic/drawing parity rather than trusting visual resemblance | RH-C0.6 comparator audit + RH-C1 parity gate | **ALREADY PLANNED** |
| keep compiler bounded rather than claiming arbitrary architecture | explicit “closed world by design” position | **ALREADY PLANNED** |
| pre-C1 audit of every entity for architectural meaning versus fixture convenience | partly achieved by RH-C0 and the formal model, but not as a separate remaining stage | **MOSTLY DONE; KEEP AS C1 IMPLEMENTATION DISCIPLINE** |
| explicitly test whether C1 core abstractions encode the courtyard house by accident | no concrete post-C1 fixture/gate existed | **NEW — CF-01** |
| use a deliberately unlike second house without fully designing another Reference House | no standing work item existed | **NEW — CF-01** |
| distinguish mutation testing from cross-fixture generality testing | implicit but not recorded as a programme distinction | **NEW EXPLICIT DISTINCTION** |
| require the contrast test before broad compiler growth | previous sequence moved directly RH-C1 → RH-C2 | **NEW SEQUENCING GATE** |

The main conclusion is therefore **not** “do another large pre-C1 research phase”. RH-C0 already absorbed most of the useful pre-C1 hardening. The missing protection is a second, structurally different fixture *after* C1 exists.

---

## Three different things the tests prove

### 1. Reference House reproduction

RH-C1 asks whether the frozen Reference House can be represented once and regenerated deterministically.

This tests **fixture fidelity**.

### 2. Reference House mutations

The RH-C0 mutation map changes high-leverage source facts and predicts propagation, conflict, review and stale-evidence consequences.

This tests **dependency correctness**.

A hundred mutations of one house can still leave a model whose ontology silently assumes that all houses look like that house.

### 3. Contrast fixture

CF-01 supplies a different but deliberately small house arrangement through the same semantic core.

This tests **bounded generality**.

Passing CF-01 still does not prove universal architecture. It only gives materially stronger evidence that the core is not a one-house drawing program.

---

## RH-C1 implementation discipline

Do not pre-generalise RH-C1 for an imagined second house. That would recreate the speculative compiler growth that P0 deliberately stopped.

Instead, whenever RH-C1 introduces a core entity, field or invariant, keep the distinction visible between:

1. **semantic core** — architectural concept justified independently of this fixture, such as space identity, containment, host opening, level or derived relationship;
2. **fixture data** — the Reference House's particular courtyard, room topology, stair grouping, four-bay field, dimensions and opening membership;
3. **derived projection** — geometry, calculations and drawings computed from source facts.

Warning signs during C1 include APIs or invariants that silently imply:

- every building has a courtyard;
- the courtyard is centred;
- every house has exactly two storeys;
- every principal elevation has four regular bays;
- every stair has three flights of six rises;
- every room arrangement follows the Reference House ring topology;
- G-01 or Georgian-derived composition is the default architectural language.

The correct C1 response is usually to **localise the Reference House fact**, not to build a speculative universal abstraction.

---

## Designing the contrast fixture

Do **not** freeze its detailed design now. Choose it after RH-C1 passes, using the actual implementation to identify the assumptions most worth attacking.

The fixture should be just architecturally coherent enough to avoid meaningless geometry. It should differ from the Reference House across several high-leverage C1 dimensions while staying inside a deliberately bounded domestic problem.

Candidate contrasts include:

- no courtyard or internal void;
- materially asymmetric room topology;
- a façade rhythm that is not the Reference House four-bay field;
- a different stair topology, or a fixture in which stair optionality is itself the challenge;
- different room counts and adjacencies;
- non-G-01 / neutral architectural grammar;
- opening placement driven by room/host relationships rather than inherited Reference House axes.

These are candidate attack dimensions, not a brief to maximise difference. CF-01 should use the **smallest fixture that exposes accidental assumptions**.

Do not pull structure, MEP, detailed envelope physics or regulations into CF-01 merely to make the second house feel complete. The fixture should challenge the RH-C1 semantic scope first.

---

## Pass conditions

CF-01 passes only if all of the following hold:

1. the Reference House and contrast fixture use the same core semantic mechanisms rather than separate fixture-specific compilers;
2. core code contains no branching on fixture identity to rescue either house;
3. Reference-House-specific courtyard, four-bay, stair and grammar facts remain fixture/project data rather than hidden universal requirements;
4. shared integrity invariants remain meaningful on both fixtures;
5. deterministic calculations and relevant drawings regenerate from each fixture source without private duplicate geometry;
6. the RH-C1 mutation suite still passes for the Reference House;
7. at least one accidental assumption discovered by the contrast fixture is either removed, localised to fixture data, or deliberately declared as a supported-domain restriction;
8. any new abstraction is justified by both worked cases or by an independently established semantic need, not by aesthetic tidiness;
9. the compiler continues to fail closed where the contrast fixture is outside its supported domain;
10. the result is described as **two-fixture bounded evidence**, not general architectural validity.

If the second fixture requires contorted exceptions, CF-01 fails. Refactor the semantic boundary before deeper compiler slices amplify the mistake.

---

## Programme position

```text
RH-C0  model freeze                 PASS
   ↓
RH-C1  deterministic Reference House
   ↓
CF-01  adversarial contrast fixture / generality gate
   ↓
RH-C2  structural view
   ↓
RH-C3  service view
   ↓
RH-C4  envelope / boundary view
   ↓
RH-C5  selected target calculations
```

CF-01 is a **gate on architectural generalisation**, not a new maturity level and not a claim that the compiler should support arbitrary houses.

The principle is simple:

> **First prove that the program describes the house. Then try to prove that it does not only describe that house.**
