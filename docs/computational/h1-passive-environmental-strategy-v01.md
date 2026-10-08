# H1 Passive Environmental Strategy — v0.1

**Status:** H1 paper-domain environmental hierarchy; passive-first ordering remains current, pre-H1 sequencing is historical  
**Purpose:** define the environmental hierarchy used to select and evaluate bounded H1 ventilation, moisture, summer-comfort and heating-demand strategies.  
**Scope:** ventilation, moisture removal, summer comfort and heating-demand reduction.  
**Date:** 2026-10-04

## 1. Course correction

The first H1 ventilation decision selected continuous mechanical extract ventilation largely because it was easy to bound computationally: one fan, one extract network and a familiar prescriptive compliance route.

That was a useful compiler simplification, but the priority was wrong.

HSA already states that passive architecture should do the first work. The computational track must not reverse that principle merely because an active system is easier to encode.

This decision therefore establishes the following order:

**reduce load → passive physical response → bounded mechanical assistance → fully mechanical response where justified**

The order is not ideological. A later stage may win where it produces the better whole-building result. It must, however, earn the added plant, maintenance and replacement burden.

## 2. Airtightness is not ventilation

HSA favours deliberate control of unintended infiltration.

Airtight construction and passive ventilation are compatible because they answer different questions:

- **airtightness** controls accidental airflow through cracks and uncontrolled leakage paths;
- **ventilation** provides intentional airflow through designed, inspectable openings and routes.

H1 must therefore never obtain a ventilation pass by relying on poor airtightness.

Purpose-provided inlets, transfer paths, stacks, purge openings and assisted devices are part of the environmental system. Random leakage is not.

## 3. Separate the environmental jobs

One system should not be asked to solve several distinct problems merely because they all involve air.

H1 separates at least four obligations.

### 3.1 Background indoor-air quality

Provide enough outdoor air and pollutant dilution during ordinary occupation.

This is the whole-dwelling ventilation problem.

### 3.2 Moisture and pollutant source removal

Remove moisture and pollutants near significant sources before they spread.

Examples include:

- bathrooms and showers;
- utility rooms;
- sanitary accommodation;
- cooking.

Cooking source capture is a distinct high-intensity problem and should not be casually collapsed into the background ventilation network.

### 3.3 Purge and summer heat removal

Rapid dilution and summer heat removal are intermittent high-flow problems.

They may use:

- openable windows;
- cross-ventilation;
- stack purge;
- secure night openings;
- mechanical ventilation assistance where justified.

The Part-F background system is not automatically the Part-O overheating strategy.

### 3.4 Winter heat loss and comfort

Ventilation also affects:

- heating demand;
- cold draught risk;
- acoustic comfort;
- external-pollutant exposure.

A system that is mechanically simple but wastes substantial heat or causes persistent draughts is not automatically the lower-complexity architectural answer.

## 4. Environmental hierarchy

### Layer 0 — reduce the load

Before moving air or adding plant, reduce the environmental burden at source.

For H1 this means, where applicable:

- control summer solar gains through orientation, glazing discipline and shading;
- reduce unnecessary internal heat gains;
- use a well-insulated envelope with controlled thermal bridging;
- preserve deliberate airtightness;
- capture cooking pollutants at source;
- contain and rapidly remove moisture at wet sources;
- avoid finishes/material choices that create avoidable indoor pollutant loads where practical.

### Layer 1 — use passive forces and geometry

Exploit useful natural pressure and temperature differences through designed routes.

Candidate measures include:

- purpose-provided outdoor-air inlets to habitable/dry rooms;
- deliberate room-to-room transfer paths;
- near-vertical passive extract stacks from wet rooms;
- wind-assisted roof terminals;
- cross-ventilation;
- openable-window purge;
- secure night ventilation where the architecture and site permit it.

These features must be designed, not assumed.

### Layer 2 — add bounded assistance

Where natural forces cannot reliably meet the obligation, add the smallest active intervention that closes the performance gap.

Examples include:

- low-pressure fan assistance to a passive extract stack;
- automatic boost during weak stack/wind conditions or high moisture load;
- ceiling fans for summer comfort before refrigerant cooling where appropriate;
- local source extract where passive extraction cannot deal with a short high-intensity event.

The active component should be accessible, replaceable and non-destructive to remove.

Where possible, failure of the active component should leave a useful passive residual path rather than blocking it.

### Layer 3 — select a fully mechanical system when it is genuinely better

CMEV or MVHR may be the correct answer where evidence shows that the passive/assisted route is weak because of:

- site noise;
- poor outdoor air quality;
- exposure/wind conditions;
- impossible stack geometry;
- unacceptable cold-air comfort;
- excessive ventilation heat loss;
- demanding filtration requirements;
- inability to prove adequate passive/hybrid performance.

HSA does not require a passive label at the expense of performance.

## 5. H1 ventilation position

The preferred H1 paper-research route became:

**VENT-HYBRID-STACK-01 — Hybrid Passive-Stack Ventilation**

Its intended operating logic is:

~~~text
PASSIVE FORCES ADEQUATE
    → stack operates without powered assistance

PASSIVE FORCES INADEQUATE
    → low-pressure assistance closes the airflow deficit

HIGH LOCAL LOAD
    → temporary boost / source-capture response
~~~

The later [Hybrid Ventilation Evidence Trial](h1-hybrid-ventilation-evidence-trial-v01.md) established this as a **research-supported topology with external specialist performance proof required**. It did not promote the family to trusted technical status.

CMEV remains a supported fallback family.

MVHR remains a legitimate higher-complexity alternate and may be the stronger Reference House choice where heat recovery, filtration, acoustic isolation or inlet control justify the additional ducts, filters, fans, condensate and commissioning burden.

## 6. Passive-first does not mean fan-minimisation by assertion

H1 should not set an arbitrary target such as “the fan must be off 90% of the year”.

That would optimise a label rather than the building.

The correct sequence is:

1. design the passive route well;
2. model/test the range of natural performance;
3. quantify the residual duty the assist system must carry;
4. compare the whole result with CMEV/MVHR on energy, comfort, maintenance, noise, pollution and resilience;
5. select the family whose total consequences best fit the project and target.

If the assist fan must operate almost continuously to make the passive system work, the project should say so and reconsider the family rather than disguise a mechanical system as passive.

## 7. Evidence boundary for the hybrid route

VENT-HYBRID-STACK-01 still requires competent project evidence for at least:

- low-wind / small indoor-outdoor temperature-difference conditions;
- high-wind conditions and over-ventilation risk;
- adverse wind pressure and reverse-flow risk;
- winter cold-draught and ventilation heat-loss consequences;
- summer operation and interaction with purge/overheating strategy;
- moisture control in wet rooms;
- whole-dwelling air distribution and transfer;
- background inlet acoustics and external air quality;
- stack condensation and cold-space routing;
- assisted-mode airflow and control logic;
- failure with electrical power unavailable;
- as-built verification / commissioning appropriate to the accepted compliance route.

The compiler should not internally invent these proofs.

They may be supplied by validated modelling, product/system evidence and competent specialist design.

## 8. Summer comfort hierarchy

The same passive-first ordering applies to overheating.

H1 should first pursue:

1. limiting unwanted solar gain;
2. useful thermal/storage behaviour where evidence supports it;
3. cross/purge ventilation and safe secure night ventilation;
4. air movement such as ceiling fans where appropriate;
5. mechanical cooling only where the preceding measures cannot provide adequate comfort.

Part O requires mechanical cooling to be a last resort where insufficient heat can otherwise be removed. Current CIBSE TM59 work likewise reinforces design-stage testing of passive summer resilience.

The ventilation family must therefore expose purge and overheating relationships without pretending that background ventilation alone solves summer comfort.

## 9. Heating-demand hierarchy

H1 should similarly distinguish reducing heat demand from supplying heat.

Before plant sizing:

- envelope heat loss;
- thermal bridges;
- airtightness;
- ventilation heat loss;
- useful solar gain without unacceptable summer penalty;
- zoning and controllability

should be resolved as far as practical.

The HEAT-ASHP-RAD-01 family is a bounded H1 plant strategy. It does not replace passive demand reduction and is not an HSA-wide heating prescription.

## 10. Compiler implications

The environmental model should represent **obligations and capabilities**, not merely a named system.

Conceptually:

~~~text
ENVIRONMENTAL OBLIGATION
  ├─ source-load reduction
  ├─ passive capability
  ├─ active-assist capability
  ├─ site/context constraints
  ├─ external performance evidence
  └─ selected family
~~~

This lets two houses discharge the same requirement through different supported families without rewriting the semantic model.

It also prevents the compiler from treating “CMEV selected” as equivalent to “ventilation solved”.

## 11. Relationship to S2 and H1-PAPER

S2-RUN-01 remains a valid historical research record.

Its frozen source selected VENT-CMEV-01 and successfully tested the compiler's ventilation topology semantics at connected-cluster scale.

This later architectural correction did **not** rewrite S2 retrospectively. It changed the preferred family for the subsequent H1 paper research.

The hybrid evidence trial then closed the internal feasibility gate sufficiently for H1-PAPER to proceed while leaving actual airflow performance as external evidence. H1-PAPER is now complete; this document does not create a new pre-H1 gate.

## 12. Current consequence

The durable environmental rule is the hierarchy, not the H1 family name:

- reduce environmental load first;
- exploit passive geometry where it is credible;
- use bounded assistance where natural forces are insufficient;
- retain fully mechanical systems as legitimate alternatives where total performance justifies them;
- keep actual ventilation/heating performance subject to competent project evidence.

VENT-HYBRID-STACK-01 remains a research-supported H1 topology, not a Reference House mandate and not a compiler-native performance proof.

Reference House environmental design should now test this hierarchy against its real orientation, openings, massing, site noise/pollution, summer risk and service geography rather than inheriting the H1 family automatically.

## 13. Source anchors

Primary / regulatory:

- Approved Document F, Volume 1, 2026 edition: https://www.gov.uk/government/publications/approved-document-f-2026
- Future Homes Standard consultation government response (2021), including the continued acceptability of passive stack ventilation outside the prescriptive Approved Document route: https://www.gov.uk/government/consultations/the-future-homes-standard-changes-to-part-l-and-part-f-of-the-building-regulations-for-new-dwellings
- Approved Document O and FAQ: https://www.gov.uk/government/publications/overheating-approved-document-o and https://www.gov.uk/guidance/approved-document-o-overheating-frequently-asked-questions
- Ventilation and indoor air quality in new homes (MHCLG, 2019): https://www.gov.uk/government/publications/ventilation-and-indoor-air-quality-in-new-homes

Technical / research:

- BRE IP 13/94, *Passive stack ventilation systems: design and installation* (current BRE information-paper listing): https://www.thenbs.com/PublicationIndex/documents/details?DocId=83994&Pub=BRE
- CIBSE TM59 (2026), *Overheating risk in dwellings — a design stage methodology*: https://www.cibse.org/knowledge-research/knowledge-portal/tm59-overheating-risk-in-dwellings-a-design-stage-methodology-2026/
- Turner & Walker, controlled passive/hybrid residential ventilation research: https://www.sciencedirect.com/science/article/pii/S0360132313002229

Technology precedent only — not H1 product validation:

- Aereco hybrid ventilation description: https://www.aereco.co.uk/ventilation/ventilation-systems-uk/hybrid-ventilation/