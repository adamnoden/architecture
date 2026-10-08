# H1 Services Target Extension — G / H / Low-Carbon Heat v0.1

**Status:** frozen H1 paper-domain target extension  
**Normative basis:** England, new detached dwelling, H1 paper-target assumptions  
**Purpose:** add the whole-house service requirements that become active once water, drainage and heating are represented.

## 1. Added target areas

H1 whole-house services require explicit coverage of:

- **Part G** — sanitation, hot-water safety and water efficiency;
- **Part H** — foul-water drainage and waste disposal;
- **Water Supply (Water Fittings) Regulations 1999** as an external water-system requirement/evidence source;
- the selected **Part L** heat-pump/heating route;
- existing Part F, P, M and Regulation 7 interactions.

These requirements did not need to be fully exercised in the S0/S1 room fixtures.

## 2. Part G — semantic subjects

Part G obligations belong at several scopes.

### Dwelling scope

- water-efficiency target;
- overall hot/cold water system;
- hot-water safety strategy.

### Plant / storage scope

- hot-water storage;
- safety devices;
- expansion/relief;
- discharge route;
- maintenance access.

### Outlet / wet-room scope

- wholesome-water supply;
- hot-water supply where required;
- scalding/temperature-control obligations where applicable;
- sanitary appliance provision.

The compiler must not attach “Part G compliant” to a tap.

## 3. Part H — semantic subjects

Part H adds:

- branch discharge pipes;
- stacks;
- vents/air-admittance where selected;
- below-ground drainage;
- access/rodding;
- inspection chambers/manholes;
- connection to the site foul-water system.

Approved Document H explicitly expects pipes to be reasonably accessible for repair and rodding access where blockages cannot otherwise be cleared.

That aligns with HSA's maintenance-geography and serviceability principles without turning the guidance itself into HSA authority.

## 4. Drainage geometry

The target owns:

- pipe sizes;
- branch-length limits;
- gradients;
- venting conditions;
- access requirements.

The wet-service family owns:

- fixture/stack topology;
- branch identity;
- source geometry;
- service-zone routing.

The compiler may derive:

- horizontal run;
- required fall;
- destination level;
- clashes.

It must not invent a valid gravity route where the geometry cannot physically achieve one.

## 5. Hot-water storage safety

Where an unvented hot-water cylinder is selected, Part G creates safety-discharge obligations including:

- safety devices;
- visible tundish;
- discharge route;
- continuous fall where required;
- safe termination;
- access.

Those are plant/service-route obligations.

They are not decorative plumbing details.

## 6. Water quality / stagnation

H1 adds the project objective:

> **keep hot/cold water routes short, avoid dead legs and avoid unnecessary stored branch volume.**

This is supported by HSE guidance to avoid stagnation and unnecessarily long pipework.

Do not turn the objective into a universal numerical limit without the relevant technical source.

## 7. Heat-pump route

HEAT-ASHP-RAD-01 supplies the selected H1 paper-domain heating topology.

Target/evidence inputs include:

- room heat-loss calculation;
- heat-pump efficiency/performance;
- selected design flow temperature;
- controls/weather compensation;
- commissioning;
- hot-water-cylinder interaction where applicable.

Space heating water and potable hot water remain different networks.

The family is a bounded research condition, not an HSA-wide heating requirement.

## 8. Water-efficiency target

The H1 target records the applicable new-dwelling water-efficiency requirement.

The current standard Part-G route uses:

- 125 litres/person/day;
- 110 litres/person/day where the optional requirement applies.

The compiler target owns which target applies.

The service family contributes fixtures/appliance performance data.

## 9. Cross-domain interactions

### Floor level changes

Can affect:

- drainage falls;
- entrance accessibility;
- hot-water/sanitary branch geometry.

### Wet-room movement

Can affect:

- stack distance;
- drainage route;
- ventilation extract;
- electrical zones;
- service access.

### Hot-water cylinder relocation

Can affect:

- hot-water branch length;
- safety discharge;
- heating circuit;
- plant access.

### Product substitution

Can affect:

- water efficiency;
- hot-water safety;
- isolation;
- evidence.

## 10. Paper conformance mutations

### H1-SVC-T01 — branch route too flat

Input:

- fixture/stack geometry cannot produce target-required fall.

Expected:

- drainage route FAIL/UNSUPPORTED;
- compiler must not route through structure invisibly.

### H1-SVC-T02 — blocked rodding access

Expected:

- maintainability/Part-H access obligation fails;
- pipe capacity evidence may remain current.

### H1-SVC-T03 — unvented cylinder discharge hidden/inaccessible

Expected:

- hot-water safety route fails.

### H1-SVC-T04 — long dead-leg mutation

Move a low-use outlet far from its zonal service wall.

Expected:

- project water-quality/maintenance warning;
- pipe quantity and hot-water wait/waste evidence re-evaluate.

### H1-SVC-T05 — optional water-efficiency target migration

125 → 110 litres/person/day.

Expected:

- fixture/water-efficiency evidence stale;
- drainage topology does not automatically fail.

## 11. Current authority

This document records the service-target scope used by the H1 paper research. It does not establish executable Part G/H coverage, statutory compliance or a Reference House services design.

P0 demonstrates only the minimal semantic/obligation/evidence mechanism. Any future Part G/H executable work must be justified by a live project or professional-review question rather than by this paper inventory alone.

## 12. Source anchors

- Approved Document G: https://www.gov.uk/government/publications/sanitation-hot-water-safety-and-water-efficiency-approved-document-g
- Approved Document H: https://www.gov.uk/government/publications/drainage-and-waste-disposal-approved-document-h
- HSE hot/cold water systems: https://www.hse.gov.uk/legionnaires/hot-and-cold.htm
- Approved Document L 2026: https://www.gov.uk/government/publications/approved-document-l-2026