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
and environmental/replacement transitions. ROF owns roof-system architecture;
RWT owns building-side rainwater collection/conveyance. HAD owns how those
systems resolve visibly into the house. HAD does not establish competent
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
| Selection | HAD-03 | Coherent architectural selection and representative visual synthesis using the current roof/water baseline provisionally |
| Roof/water integration | ROF-RWT-GATE | Selected roof/rainwater systems reconciled with HAD expression and OAS-owned threshold consequences |
| Shared integration | TRIAD-GATE | Selected IAS/OAS/HAD outputs, including the reconciled roof/water architecture, describe one house |

Candidates are not final selections. Material/lighting/hardware decisions must
not freeze before the relevant rooms, opening and interior assemblies exist.

HAD-03 is allowed to complete its current convergence without pretending that
the existing 25° twin-pitch roof and symbolic drainage are final technical
selections. The separate ROF-RWT-GATE then reconciles the architectural
expression against the selected roof/water systems before TRIAD-GATE. This
preserves completed/in-flight HAD work without allowing provisional roof/water
assumptions to bypass whole-house coordination.

## Durable outputs

- [HAD-00 result](had-00-brief-result.md).
- [Shared IAS/OAS/HAD interface contract](../triad-interface-contract.md).
- [Roof/rainwater interface contract](../roof-water-interface-contract.md).
- [Exterior/court candidates](had-01e-exterior-candidates.md).
- [Principal-interior candidates](had-01p-principal-interior-candidates.md).
- [Private/service candidates](had-01s-private-service-candidates.md).
- [Candidate handoff and visual/source verification](had-01-candidate-handoff.md).
- [Architectural design brief](../../docs/reference-house/architectural-design-brief.md).

Use the graph for lifecycle and dependency status; this index carries scope
and restart records rather than a second mutable scheduling table.

## Material synthesis

- [Selected material, fitting and lighting family](had-02m-material-finish-synthesis.md).
- [Material relationship board](studies/selected-material-family.svg).

HAD-02M selects architectural intent without adopting actual products or fitted
rooms. HAD-03 owns furnished-room/visual convergence and actual fit dispositions;
U-ENS3 and the IAS wet/access obligations are not resolved by a palette.

Roof covering/patina/eaves/rainwater-goods expression may be explored in HAD,
but final roof/water material choices remain conditional on ROF/RWT system
selection and shared compatibility checks.

## Convergence development

- [Selected expression and furnished rear-room/kitchen study](had-03-furnished-design-study.md).
- [Scaled front, interior elevation and furnished plan](studies/selected-house-study.svg).

HAD-03 is started and incomplete. The worked kitchen uses solid-pier stations
and a dry prep table because a continuous 900-high worktop would cross 750-sill
windows. Actual fitted products/operations and wet/private-room resolution remain
explicit; the shared triad gate cannot pass on this representative partial set.

The current roof silhouette/eaves/cornice remain a provisional architectural
baseline during HAD-03. A material ROF/RWT finding may trigger an explicit
architectural rewind at ROF-RWT-GATE; current drawings do not get veto power.

## Governing tests

The house should read as settled domestic architecture. Technical intelligence
must resolve into room composition, material, hierarchy and craft. G-01 is not
permission for false historical construction. Concealment requires credible
release and reinstatement; no image may invent spare depth or suppress an
unresolved water, access or safety boundary.

Use the controlled current Reference House/PLT source. Material changes to
plan, section, openings, wall depths, thresholds or service space require an
explicit source rewind and downstream reconciliation. The present no-flat-roof
constraint remains operative unless ROF explicitly earns a rewind; historic
roof descriptions do not replace the current source.

MRA's [moisture design questions](../mra/mra-00-moisture-constitution-threat-model.md)
apply during exploration. ROF/RWT construct the preferred roof/water system;
MRA later attacks that selected result. BCR routes actual evidence obligations;
possible future PHY/EPR/DEL work is not invented as an early blocker.

## Exit gate

Close HAD-03 when exterior and representative principal/private/service
interiors form one coherent architectural selection and its remaining taste/fit
questions are bounded. Do not imply that HAD-03 alone finalises the roof/water
system.

HAD becomes a coordinated TRIAD input only after ROF-RWT-GATE has reconciled
the selected roof/rainwater architecture and TRIAD-GATE establishes one house.

HRS owns later post-BCR/post-MRA architectural synthesis. PLT owns publication
drawings. Neither is asked to invent unresolved HAD/ROF/RWT decisions.