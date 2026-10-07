---
id: HSA-P-002
title: Plant Room as Service Hub
kind: pattern
state: active
evidence: established
maturity: []
scales:
  - building
  - zone
domains:
  - services
  - maintenance
  - lifecycle
  - acoustics
  - repose
principles:
  - 1
  - 5
  - 6
  - 8
  - 10
requires: []
completes:
  - HSA-P-001
alternative_to: []
tension_with: []
sequences:
  - service-topology
---

# HSA-P-002 — Plant Room as Service Hub

## Context

A house contains replaceable plant, controls, isolation, distribution equipment and recurring maintenance tasks that otherwise tend to disperse into lofts, cupboards, facades and occupied rooms.

## Problem

Individual components may be technically reachable while the system as a whole remains hard to understand, isolate, work on or replace. Scattered plant also exports noise, heat, service access and later alterations into ordinary rooms.

## Pattern

**Concentrate major distribution, controls and replaceable plant into a service hub where system relationships, working space, isolation and replacement paths are explicit.**

The hub may be a room, enlarged cupboard, utility zone or other proportionate architectural space. It need not resemble commercial plant accommodation.

## Forces

- dedicated space has an area cost;
- concentration can create heat, noise and fire consequences;
- some equipment belongs nearer loads or outside;
- future plant may differ in size and service requirements;
- access must survive storage and later fit-out.

## Relationships

This pattern commonly **completes** [HSA-P-001 — Controlled Utility Entry](controlled-utility-entry.md): the entry controls the transition into the building; the hub turns that transition into legible internal distribution, isolation and replaceable plant.

The relationship is not a hard dependency. A useful hub can exist where utility entries are separated or inherited.

## Design requirements

- draw real working clearances and replacement envelopes;
- keep isolation visible and reachable without moving stored goods;
- provide drainage where credible failures require it;
- manage heat rejection, ventilation and acoustic isolation;
- provide durable lighting and labelling;
- maintain a clear relationship with principal vertical and horizontal distribution routes;
- provide a credible route by which the largest foreseeable replaceable item can leave the building.

## Proportionality

The hub earns its area by concentrating multiple recurring maintenance and replacement tasks. A room devoted to one small appliance may be excessive; a cramped cupboard serving half the house may be false economy.

## Boundary debt

Check fire, acoustic, air and thermal consequences where the hub adjoins occupied or protected space. Drainage and water containment should not create concealed routes into vulnerable fabric.

## Permanent-fabric impact

The pattern may justify a small number of deliberate penetrations and service interfaces in permanent fabric. Those should be designed with the hub rather than accumulated component by component.

## Workmanship and tolerance

Service zones should be dimensioned from installed equipment, real pipe/duct bends, insulation and tool access rather than diagrammatic centre-lines. Equipment replacement should tolerate ordinary installation variation without depending on exact future models.

## Occupation and repose

Fan, pump, compressor and structure-borne noise, heat leakage and alarms must be kept from principal rooms. Routine service access should not depend on passing through bedrooms or principal sitting rooms where a reasonable alternative exists.

## Failure modes

- hub becomes general storage;
- door or access route is too small for replacement;
- one item blocks filters, valves or another item's withdrawal path;
- vibration transmits structurally;
- heat rejection is ignored;
- future replacement plant has nowhere to go.

## Evidence

CIBSE Guide M/M1 treats maintainability and continued performance as design concerns. Circular-design guidance from Arup likewise emphasises access and sufficient working space to undo and remove services components.

## Does not prove

Commercial facilities guidance does not justify commercial-scale plant rooms in houses. The required geometry should come from actual domestic tasks, equipment and replacement scenarios.

## Reference House application

The Reference House places a compact service hub beside the principal vertical service zone, with a direct replacement path to an external door and without using ordinary kitchen cabinetry as plant accommodation.

## Formalisation boundary

Equipment occurrences, required working volumes, replacement paths, access relationships, drainage obligations and system connectivity are candidates for formal representation. Whether the hub is proportionate, quiet enough and architecturally well placed remains architectural and engineering judgement.

---

**Provenance:** migrated from Pattern 02 in [`core-12.md`](core-12.md) and [`pilot/plant-room-service-hub.md`](pilot/plant-room-service-hub.md). Migration does not increase evidence or maturity.
