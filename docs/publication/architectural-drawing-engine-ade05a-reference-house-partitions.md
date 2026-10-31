<!-- nav-exclude: redirect -->
# ADE-05A — Reference House internal-partition source decision

**Programme:** ADE — Architectural Drawing Engine capability uplift  
**Parent:** #812 / #818  
**Packet:** #834  
**Baseline:** `2a6edb261ff0d16b6217864896a81a9e21c8978f`

## Decision

The current Reference House `internal-planning` segments are not merely optional diagram lines. Each current segment separates named room or circulation reservations and is therefore promoted to **physical non-loadbearing partition intent**.

This does not select any internal door or aperture. Existing `requiredAdjacencies` remain connectivity obligations only.

The physical partition family is:

- **family:** dry-framed, non-loadbearing;
- **coordination thickness:** **100–150 mm range**, provisional and representable;
- **datum relationship:** body centred on the existing planning datum for coordination representation;
- **replaceability:** bounded rebuildable assembly, not a universally relocatable partition system;
- **services:** service-free; services remain in accessible infrastructure rather than being legitimised inside the partition;
- **product:** none selected.

The old publication-only 125 mm body is not revived as source authority. ADE may later choose a representative value inside the owned range for a clearly identified drawing profile; that representation value is not a construction specification.

## Why all current boundaries become physical intent

The canonical fixture contains sixteen `internal-planning` segments. Every one separates named room/circulation reservations. None is merely an abstract zoning line with no enclosing role.

Their exact locations retain their existing frozen/provisional authority. The new decision changes the **kind of architectural intent**, not the precision of their coordinates.

Future or newly introduced planning boundaries may still remain unresolved datums. ADE-05B's faint-locus grammar therefore remains necessary; it simply no longer describes the present sixteen Reference House segments.

## Why this family

OCG-02B / PR #585 found that occupied-change value comes from **selective lifespan separation and bounded replaceability**, not universal demountability. Its counter-evidence included a relocatable housing partition system abandoned after poor use, acoustics, tolerance/visual damage and repeated connection problems. The stronger project precedent is a durable host with locally replaceable subassemblies.

A conventional-feeling dry non-loadbearing family satisfies that result better than either extreme:

- masonry would make ordinary internal reconfiguration unnecessarily destructive;
- a relocatable office-style panel system would over-prioritise reconfiguration and risk domestic acoustic, tolerance and visual quality;
- ordinary dry framing can be locally rebuilt while remaining compatible with established acoustic, fire, impact and wet-area variants.

The 100–150 mm range is a **coordination envelope**, not a selected build-up. Current mainstream dry partition systems span multiple configurations through and around that band, with materially different acoustic, fire and robustness performances. The Reference House therefore owns enough thickness to coordinate a mature plan without pretending to have completed technical design.

## Performance boundary

The family carries obligations, not unproved ratings:

- acoustic privacy;
- impact and fixing robustness;
- fire performance where required;
- moisture resistance where required;
- stable door-set interfaces.

For England, Building Regulations Schedule 1 requirement E2 requires reasonable resistance to sound from internal walls between bedrooms or rooms containing a WC and other rooms, subject to its stated exceptions. Approved Document E remains the relevant statutory guidance. ADE-05A records the obligation only; it does not select a tested wall construction or claim a numeric performance.

## Explicitly not modelled

ADE-05A does **not** select:

- stud/frame material, profile or centres;
- board product, number of layers or thickness;
- cavity insulation;
- tested acoustic or fire rating;
- wet-area board, membrane or tile backing;
- door jamb/head reinforcement;
- deflection head;
- floor, ceiling or abutment fixing details;
- sealants or perimeter closures;
- skirting/finish junction;
- service penetrations;
- any service route inside the partition.

These are technical-design decisions. If later technical design requires a wall outside the 100–150 mm coordination envelope, the source must be reopened rather than forcing the selected system into the drawing allowance.

## Source implementation

`compiler/reference-house/internal-partitions.ts` is a Reference House source adjunct rather than a mutation of `BoundarySource`.

That separation is deliberate:

- existing boundary coordinates remain planning datums and retain RH-C1 authority;
- room areas remain planning reservations, not newly asserted finished clear areas;
- physical partition intent and assembly authority are separately inspectable;
- the frozen core fixture is not silently reinterpreted as having wall faces it never owned.

The adjunct maps every current internal planning boundary exactly once to `RH-PART-DRY-01`. Regression tests reject missing/duplicate mappings, mappings to non-internal boundaries, invalid coordination ranges and family mismatches.

## Downstream consequence

ADE-06 may now include a truthful physical-partition comparator in the exact-size capability atlas.

ADE-07 may compile the current Reference House internal partitions through ordinary wall topology using this source authority. Internal doors remain unresolved and must continue to use adjacency/uncertainty semantics until an upstream architectural source selects them.

PLT-03 remains blocked from token freeze until the ADE-07 replacement plate passes exact-size physical review.

## Evidence boundary

- OCG-02B / PR #585 — maintainability and reversible-construction research; selective lifespan separation and bounded replaceability accepted, universal demountability rejected.
- Building Regulations 2010, Schedule 1, Part E — current internal acoustic requirement: <https://www.legislation.gov.uk/uksi/2010/2214/schedule/1/2026-07-20>
- Approved Document E — resistance to sound: <https://www.gov.uk/government/publications/resistance-to-sound-approved-document-e>
- British Gypsum White Book selector — current dry non-loadbearing partition families and coordination thickness/performance variation: <https://www.british-gypsum.com/specification/white-book-specification-selector/internal-partitions-walls>

Manufacturer information is used only to establish that the coordination envelope is technically plausible. It is not product selection or proof of Reference House compliance.
