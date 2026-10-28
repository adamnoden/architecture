# Book resolution programme

**State:** authorised programme; BSR root active, downstream design streams queued behind BSR  
**Date:** 2026-10-28  
**Root:** [BSR #940](https://github.com/adamnoden/architecture/issues/940)

This programme records the accepted next major development of *Ovid’s House*: refactor the book around a six-part reader sequence, design the missing interior/opening architectural systems and finished house, force those propositions through bounded construction resolution, then synthesize one resolved Reference House before final plate/editorial/publication freeze.

It is a programme-control map, not an architectural authority source. Each workstream owns its declared problem; existing `PLT`, `PHY`, `EPR`, `DEL`, `EDA` and `PUB` retain their existing responsibilities.

## Target reader sequence

1. **Part I — The Proposition** — why.
2. **Part II — Architecture of the Platform** — architectural consequences.
3. **Part III — Patterns and Generative Sequences** — reusable moves and sequencing.
4. **Part IV — The Reference House: Design Proposition** — one deliberately specific house and its selected systems.
5. **Part V — Making and Proving the Platform** — proportionality, scenarios, validation, technical closure, delivery and commissioning.
6. **Part VI — The House** — the resolved architectural payoff: a concise monograph/plates section rather than a second explanatory case study.

The actual manuscript refactor belongs to BSR. Until BSR closes, the current manuscript files remain the canonical reader sequence and this target must not be mistaken for an already completed migration.

## Workstreams

| Code | Workstream | Issue | State | Primary output |
|---|---|---:|---|---|
| `BSR` | Book Structure Refactor | #940 | **active root** | six-part manuscript topology, stubs, ownership and navigation |
| `IAS` | Interior Architecture System | #941 | queued after BSR | selected wall/floor/panel/skirting/grille/access system and detail family |
| `OAS` | Opening Assembly System | #942 | queued after BSR | selected window/door/threshold cassette and replacement-interface family |
| `HAD` | House Architectural Design | #943 | queued after BSR | resolved exterior/interior architecture, materials, joinery, lighting and room language |
| `BCR` | Buildability & Construction Resolution | #944 | convergence gate | construction-resolution matrix, evidence routing and reconciled technical closure |
| `HRS` | House Resolution & Synthesis | #945 | final synthesis gate | one authoritative resolved-house design handoff to PLT and Part VI |

## Dependency graph

```text
                                      ┌──────── IAS #941 ────────┐
                                      │                           ├──► targeted PHY / EPR / DEL
BSR #940 ─────────────────────────────┼──────── OAS #942 ────────┘
                                      │
                                      └──────── HAD #943 ───────────────┐
                                                                        │
controlled RH + continuing PLT #422 ────────────────────────────────────┤
DEL #854 + available PHY #912 / EPR #913 evidence ──────────────────────┤
                                                                        ▼
                                                                   BCR #944
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

## Parallelism rule

After BSR establishes the canonical chapter/authority boundaries, IAS, OAS and HAD are intentionally parallel.

They work against the controlled current Reference House/PLT geometry. They may discover reasons that geometry should change; they may **not silently change it**. Any material plan, section, wall-depth, opening, service-space or facade conflict is an explicit rewind request to the owning Reference House/PLT design source.

This keeps parallel work useful without creating divergent houses.

## Authority boundaries

- **BSR** owns book topology only.
- **IAS** owns the selected interior assembly family, not room-wide decorative authorship or competent performance validation.
- **OAS** owns opening/cassette architecture, not facade composition or competent envelope/security/fire validation.
- **HAD** owns visible architectural design, not the engineering mechanics of IAS/OAS.
- **BCR** owns construction-resolution coordination and evidence routing, not professional judgement or physical proof.
- **HRS** owns post-BCR architectural synthesis, not final plate production or publication manufacture.
- **PLT** remains the publication drawing/plate owner. It must not be asked to invent unresolved architecture.
- **PHY** remains the owner of physical validation.
- **EPR** remains the owner of competent external/professional review.
- **DEL** remains the owner of delivery responsibility, stage and acceptance requirements.
- **EDA** remains the editorial-doctrine assurance owner.
- **PUB** remains the publication/release owner.

## Validation and rewind rule

A downstream technical problem is classified before adding complexity:

1. **detail problem** — return to IAS/OAS/HAD as appropriate;
2. **system problem** — change the relevant technical family within the architecture;
3. **architectural problem** — rewind the Reference House/PLT source rather than disguise the problem with an elaborate workaround;
4. **external evidence problem** — route to EPR/PHY/DEL or explicitly defer to a real site/commission.

No workstream may promote internal plausibility into engineering adequacy, physical proof, statutory approval or real-site compatibility.

## Publication consequence

The completed EDA audit and previous publication content freeze remain valid evidence for the manuscript they reviewed, but the authorised enlargement of the book makes them **stale as final-production gates** once BSR changes the canonical source set.

Physical-object preparation under PUB-02 may continue where content-independent. Final content/drawing freeze and manufacture now require, in order:

**BSR → IAS/OAS/HAD → BCR → HRS → final PLT integration/freeze → renewed EDA assurance → PUB-02 final manufacture gate.**

This programme does not itself raise any maturity rating.