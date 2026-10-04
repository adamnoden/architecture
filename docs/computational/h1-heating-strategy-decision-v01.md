# H1 Heating Strategy Decision — v0.1

**Status:** programme decision  
**Purpose:** choose one low-carbon H1 space-heating family that preserves service accessibility and avoids making the floor itself a service component.

## Decision

Select:

**HEAT-ASHP-RAD-01 — air-to-water heat pump with low-temperature hydronic radiators**

Do not select embedded wet underfloor heating as the H1 baseline.

## Why

### Regulatory/future fit

The 2026 Future Homes Standard requires new homes to use low-carbon heating routes; government guidance states gas boilers will not meet the performance standard. Air-to-water heat pumps are explicitly addressed in Approved Document L 2026.

The earlier Part-L route used by the current S0/S1 fixture also supports heat pumps, and encourages low-temperature wet systems.

### Doctrine fit

Radiators are:

- visible/legible;
- replaceable;
- isolatable;
- easy to inspect;
- compatible with accessible low-level service routes.

Wet underfloor heating embeds a large pipe network into the floor assembly.

That directly conflicts with:

> **No service is permitted inside the permanent fabric of the building.**

A future removable dry-floor heating panel could become a domain extension if prototype evidence justifies it.

### Complexity

The family requires:

- one external heat-pump unit;
- one accessible internal hydraulic/plant interface;
- one accessible distribution network;
- replaceable room emitters.

It does not require every occupied floor to become active plant.

## Design-temperature position

Do not hard-code one heat-pump flow temperature as architectural truth.

The competent heating design must determine:

- room-by-room heat loss;
- design external temperature;
- emitter output;
- flow/return temperatures;
- heat-pump capacity;
- controls.

H1 requires a low-temperature design route and records the selected design flow temperature as evidence.

A design above 55°C leaves the ordinary H1 low-temperature route unless explicitly justified.

The project preference is:

> **size fabric and emitters so the heat pump can operate as cool as practical, especially outside peak conditions.**

## Hot water

The heat pump may also charge a dedicated hot-water cylinder in the accessible plant/service core.

The potable-water distribution system is a separate WET-CORE family.

Do not collapse:

- space heating water;
- domestic hot water;
- cold water

into one generic hydronic network.

## Source anchors

- Approved Document L 2026: https://www.gov.uk/government/publications/approved-document-l-2026
- Future Homes Standard policy summary: https://www.gov.uk/government/publications/carbon-budget-and-growth-delivery-plan-heat-and-buildings-factsheet/cbgdp-investor-factsheet-heat-and-buildings-web-accessible
- MCS heat-pump design guidance: https://mcscertified.com/
