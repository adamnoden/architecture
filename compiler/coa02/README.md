# COA-02 — non-spatial report extraction

**Gate:** COA-02  
**Status:** PASS — accepted in the [completed COA programme](../../docs/computational/compiler-output-architecture-programme.md)\
**Starting main:** `f536143a4a315d3e6442d742a29422cf44348f7a`  
**Issue:** #95  
**Authority effect:** none

## Question

Can report-shaped compiler outputs become ordinary generated documents without losing deterministic traceability or semantic content?

**Answer: yes.** The service and envelope/boundary inspection outputs now have generated Markdown successors derived from the canonical single-pass Reference House system result. Their historical RH-C3/RH-C4 SVGs remain frozen evidence.

## Service topology

Primary successor:

`docs/reference-house/generated/service-register.md`

The report exposes:

- network and service class;
- semantic from/to route;
- route role;
- registered crossing ownership;
- provisional/controlled state;
- selected crossing register;
- explicit maintenance/access obligations;
- compile fingerprint and proof boundary.

It deliberately does **not** imply plan geometry. Pipe/duct position, sizing, pressure loss, airflow, acoustics, fire stopping, commissioning and product adequacy remain outside the view.

## Envelope / boundary topology

Primary successor:

`docs/reference-house/generated/boundary-register.md`

The report exposes:

- independent weather/air/thermal/moisture carriers;
- typed transitions and their opening/service/occurrence reference;
- host boundary or route ownership;
- directional drainage routes;
- obligation counts;
- provisional/controlled state;
- compile fingerprint and proof boundary.

Directional drainage remains in the textual register because the semantic direction itself matters. COA-05 may add a spatial companion if that makes catchment/flow geography materially easier to inspect; carrier/transition registration does not require SVG.

## Determinism

Both committed reports are exact outputs of `compiler/reference-house/output/reports.ts` from `createReferenceHouseOutputContext()`.

The generator is:

`npm run outputs:reports:generate`

COA-02 tests compare the committed documents byte-for-byte with fresh renderer output and verify that every represented service route, boundary carrier and drainage route survives extraction.

## Preservation

The old files remain untouched:

- `docs/reference-house/rhc3-service-topology.svg`
- `docs/reference-house/rhc4-boundary-topology.svg`

They retain their CH-frozen historical-evidence role. The generated Markdown reports supersede them only as the preferred human inspection medium.

No service, envelope or building-performance claim changes.

**Historical handoff:** [COA-03 — shared drawing and uncertainty language](../coa03/README.md), subsequently completed.
