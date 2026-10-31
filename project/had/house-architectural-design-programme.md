# HAD — House Architectural Design

**Tracking:** [#943](https://github.com/adamnoden/architecture/issues/943).
**Execution authority:** [PCO node manifest](../control/nodes/architecture.ts).
**Programme map:** [Book resolution programme](../book-resolution-programme.md).

## Question and scope

What should the Reference House look and feel like once doctrine, G-01 and the
controlled current plan/section become complete architectural design?

HAD owns exterior/interior composition, room hierarchy, panelling expression,
kitchens, bathrooms, joinery, lighting, hardware and the visible resolution of
technical elements. IAS owns interior mechanics; OAS owns opening mechanics
and environmental/replacement transitions. HAD does not establish competent
performance validation, final construction readiness or publication freeze.

## Packet topology

The original linear HAD-00…06 outline is superseded by the topology below,
matching issue #943 and the canonical execution graph.

| Stage | Canonical packet | Output |
|---|---|---|
| Brief | HAD-00 | Character, hierarchy, repose and visible-truth boundary |
| Shared interface | TRIAD-IFACE-FREEZE | Controlled source, budgets, ownership and rewind contract shared with IAS/OAS |
| Candidates | HAD-01E | Exterior and court composition |
| Candidates | HAD-01P | Principal interiors |
| Candidates | HAD-01S | Private and service interiors |
| Junctions | IAS-HAD-JUNCTION / alias HAD-02I | Interior assembly and visible-expression reconciliation |
| Junctions | OAS-HAD-JUNCTION / alias HAD-02O | Opening assembly and facade/interior expression reconciliation |
| Synthesis | HAD-02M | Material, finish, fitting and lighting family across actual rooms and assemblies |
| Selection | HAD-03 | Coherent architectural selection and representative visual synthesis |
| Shared integration | TRIAD-GATE | Selected IAS/OAS/HAD outputs describe one house |

Candidates are not final selections. Material/lighting/hardware decisions must
not freeze before the relevant rooms, opening and interior assemblies exist.

## Durable outputs

- [HAD-00 result](had-00-brief-result.md).
- [Shared IAS/OAS/HAD interface contract](../triad-interface-contract.md).
- [Exterior/court candidates](had-01e-exterior-candidates.md).
- [Principal-interior candidates](had-01p-principal-interior-candidates.md).
- [Private/service candidates](had-01s-private-service-candidates.md).
- [Candidate handoff and visual/source verification](had-01-candidate-handoff.md).
- [Architectural design brief](../../docs/reference-house/architectural-design-brief.md).

Use the graph for lifecycle and dependency status; this index carries scope
and restart records rather than a second mutable scheduling table.

## Governing tests

The house should read as settled domestic architecture. Technical intelligence
must resolve into room composition, material, hierarchy and craft. G-01 is not
permission for false historical construction. Concealment requires credible
release and reinstatement; no image may invent spare depth or suppress an
unresolved water, access or safety boundary.

Use the controlled current Reference House/PLT source. Material changes to
plan, section, openings, wall depths, thresholds or service space require an
explicit source rewind and downstream reconciliation. Current roof constraints
remain binding; historic roof descriptions do not replace the current source.

MRA's [moisture design questions](../mra/mra-00-moisture-constitution-threat-model.md)
apply during exploration. BCR routes actual evidence obligations; possible
future PHY/EPR/DEL work is not invented as an early blocker.

## Exit gate

Close HAD only when exterior and representative principal/private/service
interiors form one coherent design; visible IAS/OAS interfaces, materials,
joinery, lighting, kitchen/bathroom and hardware are resolved to BCR input scope;
residual taste decisions are bounded; and TRIAD-GATE establishes one house.

HRS owns later post-BCR/post-MRA architectural synthesis. PLT owns publication
drawings. Neither is asked to invent unresolved HAD decisions.
