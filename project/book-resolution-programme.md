# Book resolution programme

**State:** BSR structural root complete; IAS/OAS/HAD and MRA-00 unblocked for parallel work  
**Date:** 2026-10-28  
**Completed root:** [BSR #940](https://github.com/adamnoden/architecture/issues/940)

This programme records the accepted next major development of *Ovid’s House*: the book now has the six-part reader structure needed to design the missing interior/opening architectural systems and finished house, subject that integrated design to deliberately high moisture-resilience assurance, force the resulting propositions through bounded construction resolution, then synthesize one resolved Reference House before final plate/editorial/publication freeze.

It is a programme-control map, not an architectural authority source. Each workstream owns its declared problem; existing `PLT`, `PHY`, `EPR`, `DEL`, `EDA` and `PUB` retain their existing responsibilities.

## Canonical reader sequence

1. **Part I — The Proposition** — why.
2. **Part II — Architecture of the Platform** — architectural consequences.
3. **Part III — Patterns and Generative Sequences** — reusable moves and sequencing.
4. **Part IV — The Reference House: Design Proposition** — one deliberately specific house and its selected systems.
5. **Part V — Making and Proving the Platform** — proportionality, scenarios, validation, technical closure, delivery and commissioning.
6. **Part VI — The House** — the resolved architectural payoff: a concise monograph/plates section rather than a second explanatory case study.

BSR has integrated this topology into the manuscript, navigation and mechanical Working Edition order. Structural placement does not imply that the new systems or final house have already been designed or validated.

## Workstreams

| Code | Workstream | Issue | State | Primary output |
|---|---|---:|---|---|
| `BSR` | Book Structure Refactor | #940 | **complete** | six-part manuscript topology, stubs, ownership and navigation |
| `IAS` | Interior Architecture System | #941 | **unblocked / parallel** | selected wall/floor/panel/skirting/grille/access system and detail family |
| `OAS` | Opening Assembly System | #942 | **unblocked / parallel** | selected window/door/threshold cassette and replacement-interface family |
| `HAD` | House Architectural Design | #943 | **unblocked / parallel** | resolved exterior/interior architecture, materials, joinery, lighting and room language |
| `MRA` | Moisture Resilience Assurance | #959 | **MRA-00 unblocked; integrated-house assault gated** | whole-house moisture failure model, adversarial obligations and post-BCR assurance closeout |
| `BCR` | Buildability & Construction Resolution | #944 | scaffolding ready; substantive convergence gated | construction-resolution matrix, evidence routing and reconciled technical closure |
| `HRS` | House Resolution & Synthesis | #945 | queued final synthesis gate | one authoritative resolved-house design handoff to PLT and Part VI |

## Dependency graph

```text
BSR #940 — COMPLETE
       │
       ├──────── IAS #941 ────────────┐
       ├──────── OAS #942 ────────────┼────► shared triad integration gate
       ├──────── HAD #943 ────────────┘                │
       │                                               │
       └──────── MRA-00 #959 ── assurance questions ───┘
                                                       │
                                      ┌────────────────┼────────────────┐
                                      ▼                ▼                ▼
                                   MRA-01           MRA-02           MRA-03
                                      └────────────────┼────────────────┘
                                                       ▼
                                                    MRA-04
                                                       │
BCR scaffolding + controlled RH/PLT + available evidence ───────────────┤
                                                       ▼
                                                  BCR #944
                                                       │
                                                       ▼
                                                    MRA-05
                                                       │
                                                       ▼
                                                  HRS #945
                                                       │
                                              ┌────────┴────────┐
                                              ▼                 ▼
                                       final PLT work      Part VI source
                                              └────────┬────────┘
                                                       ▼
                                                 renewed EDA
                                                       ▼
                                                    PUB-02
```

Targeted PHY / EPR / DEL obligations are admitted only where the selected design, MRA or BCR earns a concrete evidence need.

## Project-control overlay

[PCO — Project Control & Orchestration](pco/project-control-orchestration-programme.md) [#953](https://github.com/adamnoden/architecture/issues/953) is a priority infrastructure overlay for this programme. It does **not** add a new architectural dependency between BSR and IAS/OAS/HAD; those streams remain substantively unblocked.

PCO exists because the intended fan-out now exceeds what should be scheduled from hand-maintained prose. Already-authorised root exploration may continue, but deep high-concurrency fan-out should use the deterministic PCO execution frontier.

PCO owns execution-control machinery only. It may not redefine architectural authority, promote maturity, or turn possible future PHY/EPR/DEL routes into blockers before a concrete obligation is earned.

## Parallelism rule

IAS, OAS and HAD are intentionally parallel because BSR stabilised their chapter and authority boundaries. MRA-00 may also run now because it inventories and sharpens the assurance standard without selecting their designs.

IAS/OAS/HAD work against the controlled current Reference House/PLT geometry. They may discover reasons that geometry should change; they may **not silently change it**. Any material plan, section, wall-depth, opening, service-space or facade conflict is an explicit rewind request to the owning Reference House/PLT design source.

MRA-00 may publish moisture questions and invariants into those streams, but MRA-01/02/03 wait for the shared selected-house `TRIAD-GATE`. This prevents an expensive deep assurance pass over transient candidate systems.

The shared Wave-0.5 interface freeze, pairwise reconciliation work and triad integration gate recorded in IAS #941, OAS #942 and HAD #943 remain the substantive concurrency controls. PCO represents those gates; it does not replace them.

## Moisture-resilience gate

[MRA #959](https://github.com/adamnoden/architecture/issues/959) is deliberately cross-cutting rather than another local water-detail stream.

The project’s heightened target is that no credible ordinary single failure should be capable of producing prolonged concealed wetting of permanent fabric. Selected compound cases are also tested where normal degradation can coincide with normal weather or service events.

The integrated selected house therefore passes through:

**MRA-01 external water + MRA-02 internal water + MRA-03 vapour/drying → MRA-04 whole-house adversarial matrix → BCR technical resolution → MRA-05 post-BCR closeout.**

`BCR-SCAFFOLD` may proceed independently. `BCR-CONVERGENCE` must consume MRA-04 rather than treating moisture as a generic matrix row. HRS waits for MRA-05 so the final architectural synthesis cannot inherit an undisclosed moisture debt.

## Authority boundaries

- **BSR** is closed as book topology owner; it is not a standing design stream.
- **IAS** owns the selected interior assembly family, not room-wide decorative authorship or competent performance validation.
- **OAS** owns opening/cassette architecture, not facade composition or competent envelope/security/fire validation.
- **HAD** owns visible architectural design, not the engineering mechanics of IAS/OAS.
- **MRA** owns whole-house moisture failure modelling and assurance criteria; it does not replace envelope/building-physics/MEP engineering or site evidence.
- **BCR** owns construction-resolution coordination and evidence routing, not professional judgement or physical proof.
- **HRS** owns post-BCR/post-MRA architectural synthesis, not final plate production or publication manufacture.
- **PLT** remains the publication drawing/plate owner. It must not be asked to invent unresolved architecture.
- **PHY** remains the owner of physical validation.
- **EPR** remains the owner of competent external/professional review.
- **DEL** remains the owner of delivery responsibility, stage and acceptance requirements.
- **DPL** owns site-specific flood, groundwater, drainage-authority and other deployment facts.
- **EDA** remains the editorial-doctrine assurance owner.
- **PUB** remains the publication/release owner.
- **PCO** owns machine-readable workstream/execution control and derived scheduling state; it does not own the architectural/evidential content of the nodes it represents.

## Validation and rewind rule

A downstream technical problem is classified before adding complexity:

1. **detail problem** — return to IAS/OAS/HAD as appropriate;
2. **system problem** — change the relevant technical family within the architecture;
3. **architectural problem** — rewind the Reference House/PLT source rather than disguise the problem with an elaborate workaround;
4. **moisture-assurance problem** — route through MRA’s source/path/failure model and then to the owning design/evidence stream;
5. **external evidence problem** — route to EPR/PHY/DEL/DPL or explicitly defer to a real site/commission.

No workstream may promote internal plausibility into engineering adequacy, physical proof, statutory approval or real-site compatibility.

## Publication consequence

The completed EDA audit and previous publication content freeze remain valid evidence for the manuscript they reviewed, but the six-part source migration makes them **stale as final-production gates** for the enlarged book. The provenance-preserving successor trigger is [`project/eda/eda-successor-trigger-2026-10-28.md`](eda/eda-successor-trigger-2026-10-28.md).

Physical-object preparation under PUB-02 may continue where content-independent. Final content/drawing freeze and manufacture now require, in order:

**IAS/OAS/HAD → MRA integrated-house assault → BCR → MRA post-BCR closeout → HRS → final PLT integration/freeze → renewed EDA assurance → PUB-02 final manufacture gate.**

PCO changes how that sequence is controlled and scheduled; it does not add a publication maturity gate of its own.

BSR completion, MRA authorisation and PCO authorisation do not themselves raise any maturity rating.
