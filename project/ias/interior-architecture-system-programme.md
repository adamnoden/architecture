# IAS — Interior Architecture System

**Execution authority:** `project/control/`; live occupancy is separate in ACO.

**Tracking:** [#941 — IAS interior architecture system](https://github.com/adamnoden/architecture/issues/941)

**Programme map:** [`../book-resolution-programme.md`](../book-resolution-programme.md)

## Question and scope

What bounded interior assembly family best realises the Reference House proposition that faster-changing domestic layers should attach, carry services, be maintained and be replaced without routinely consuming slower permanent fabric?

IAS owns the Reference House implementation family for walls, floors, backplanes, panels, service skirtings, grilles, access pieces and their junctions. It does not own room-wide architectural taste, envelope-crossing opening assemblies, competent technical validation or delivery responsibility.

## Work packets and shared gates

The [canonical execution graph](../control/nodes/architecture.ts) owns lifecycle
and dependencies. [Project control](../control/README.md) owns live lease mechanics.
Issue #941 records the authorised parallel topology.

- **IAS-00:** baseline, conventional controls, challengers and invariants.
- **TRIAD-IFACE-FREEZE:** shared IAS/OAS/HAD contract after all three baselines;
  controlled geometry, depth budgets, interfaces, ownership and rewind rules.
- **IAS-01V / IAS-01H:** independent vertical and horizontal candidate exploration
  after the shared contract; neither is a final selection.
- **IAS-02S / IAS-02W:** service/access and wet/kitchen variants against actual candidates.
- **IAS-OAS-JUNCTION / IAS-HAD-JUNCTION:** opening and visible architectural interfaces
  reconciled with the corresponding streams, without silent geometry changes.
- **IAS-03:** compare and select the bounded family; coordinate drawings and disassembly.
- **TRIAD-GATE:** jointly establish one coordinated house before selected BCR input.

This topology supersedes the earlier linear IAS-01…06 packet list. BSR completion
unblocks the baselines; it does not by itself unblock deep candidate exploration.

## IAS-00 current-source baseline

The [baseline and challenger inventory](ias-00-baseline-and-challengers.md) is
prepared against `RH-LAYOUT-REVISION-02`. It retains the conventional W0/W1 and
floor controls, keeps high-burden wall/floor systems rejectable, and checks the
actual nominal depth allocations rather than importing historical technical
results. The represented 350 mm floor package has no unallocated depth; the
ordinary envelope finish allowance is 15 mm. One upper service-panel reservation
overlaps a nominal partition return by 12.5 mm and is explicitly carried into
IAS-01V and IAS-02S / IAS-02W as coordination item I00-C1, not silently repositioned.

This is a read-only baseline packet, not a selected assembly or performance
verdict. BSR closed through PR #950, establishing the chapter/ownership interfaces.
IAS-00 now supplies the shared interface freeze; OAS-00 and HAD-00 must also
complete before that contract. The vertical candidate work then starts with one
quiet wall/attachment datum and one high-service access front, including returns
and removal/reinstatement; horizontal candidates reconcile the 350 mm package.

## Candidate outputs

- [Vertical candidates](ias-01v-vertical-candidates.md).
- [Horizontal candidates](ias-01h-horizontal-candidates.md).
- [Dimensioned section/access comparison](studies/ias-core-sections.svg).

The shared interface contract is complete. These are candidates, not selected
assemblies; services, wet variants and cross-stream junctions follow their
canonical dependencies.

## Parallel interfaces

IAS runs in parallel with OAS #942 and HAD #943 after BSR. It works against the controlled current Reference House/PLT geometry. Any material section-depth, plan, opening or service-space conflict is an explicit rewind request; IAS may not silently fork the house.

OAS owns the opening cassette/envelope crossing; IAS owns the room-side assembly meeting it. HAD owns visible composition/material expression and consumes IAS dimensional/assembly constraints.

## Evidence boundary

IAS may establish architectural geometry, assembly sequence, comparative reasoning and internally controlled details. Fire, acoustic, structural, moisture, product and physical-performance claims beyond internal design evidence remain with EPR/PHY and must be routed by BCR/DEL as appropriate.

## Exit gate

IAS closes when a selected bounded interior system is coordinated across representative conditions; rejected/held alternatives and reasons are explicit; drawings/disassembly logic are sufficient for BCR and prototype/review scoping; every unresolved performance claim has a named downstream evidence owner; and
the shared TRIAD-GATE establishes one coordinated house with OAS and HAD.

Closure is not construction adequacy or physical acceptance.
