# H1 Ventilation Strategy Decision — v0.2

**Status:** H1 paper-domain ventilation decision; supersedes v0.1 within the frozen H1 research record  
**Date:** 2026-10-04  
**Supersedes:** [H1 Ventilation Strategy Decision v0.1](h1-ventilation-strategy-decision-v01.md)  
**Current evidence boundary:** [Hybrid Ventilation Evidence Trial 01](h1-hybrid-ventilation-evidence-trial-v01.md) established the hybrid family as a research-supported topology with external specialist performance proof required.  
**Historical note:** S2-RUN-01 remains frozen against VENT-CMEV-01 and is not retrospectively changed.

## 1. Decision

For the bounded H1 paper domain, ventilation is approached through a **passive-stack architecture with bounded mechanical assistance**, while CMEV and MVHR remain legitimate alternatives where evidence shows that the hybrid route is inferior or cannot be proved for the house and site.

The selected research family is:

**VENT-HYBRID-STACK-01**

This is not a trusted technical family, a Reference House mandate or a general HSA prescription.

## 2. Why v0.1 was superseded

v0.1 selected central continuous mechanical extract because it reduced compiler complexity.

That logic was computationally convenient but architecturally backwards.

The computational track is downstream of HSA. A system should not become the architectural baseline merely because it produces the easiest computational family.

The revised ordering is established in [H1 Passive Environmental Strategy](h1-passive-environmental-strategy-v01.md):

**reduce load → passive response → bounded mechanical assistance → fully mechanical response where justified**.

## 3. Regulatory finding

The regulatory position is more permissive than the v0.1 decision implied.

The 2026 edition of Approved Document F is successor guidance for the 2026 standards and has its own commencement/transitional regime. It is useful here because it makes the performance structure unusually explicit.

It states, in summary, that:

- other ventilation solutions may be used where they can be shown to satisfy F1(1);
- ventilation may be natural, mechanical or a combination;
- the listed ventilation systems are examples and other systems may be acceptable where an equal level of performance is shown;
- its simple system-specific natural-ventilation guidance is scoped to less-airtight dwellings;
- situations outside that table require expert design advice.

The earlier government response that removed passive-stack guidance from the Approved Document was also explicit: passive stack ventilation was removed because it was uncommon and specialist-designed, **not because it ceased to be a permissible route to compliance**.

The same response stated that natural ventilation in more airtight dwellings requires specialist design.

Therefore:

> **absence from the prescriptive table is not a prohibition; it changes the proof route.**

This is exactly the distinction the compiler-target/evidence model is intended to preserve.

## 4. Airtightness remains deliberate

The house is not made deliberately leaky to obtain natural ventilation.

The revised family assumes:

- controlled envelope airtightness;
- purpose-provided outdoor-air inlets;
- explicit internal transfer routes;
- explicit extract stacks;
- purge openings as a separate intermittent route.

Unintended infiltration does not count as the designed air path.

## 5. Candidate routes

### 5.1 Natural ventilation with intermittent extract

This remains simple and legitimate within the scope of the prescriptive route for less-airtight dwellings.

It is not the selected H1 research family because it still relies on intermittent mechanical wet-room extract and does not test whether a deliberately airtight dwelling can make useful passive stack forces carry more of the normal duty.

**H1 paper posture:** alternate for appropriate airtightness/context.

### 5.2 Pure passive stack ventilation

Principle:

- outdoor air admitted through purpose-provided inlets in dry/habitable rooms;
- transfer through circulation/door routes;
- extraction from wet rooms through near-vertical ducts terminating above the roof;
- flow driven by buoyancy and wind pressure.

Strengths:

- very few moving parts;
- graceful degradation because there may be no powered central dependency;
- low electrical demand;
- compatibility with compact wet/service geography.

Weaknesses:

- driving pressure varies with wind and indoor/outdoor temperature difference;
- low-driving-force periods can under-ventilate;
- strong wind can over-ventilate unless flow is controlled;
- terminal pressure and surrounding geometry matter;
- reverse flow and cross-flow need attention;
- no inherent heat recovery;
- specialist design/evidence is required for an airtight house.

**H1 paper posture:** useful passive capability, not a stand-alone guaranteed family without house-specific proof.

### 5.3 Hybrid passive stack with mechanical assistance

Principle:

Use the same passive supply/transfer/extract topology, but provide low-pressure mechanical assistance when natural driving forces or pollutant/moisture demand would otherwise leave the performance obligation unresolved.

The preferred arrangement keeps the passive path useful when the fan is stopped.

Strengths:

- natural forces can carry duty when available;
- mechanical power is available as a performance guarantee rather than the first mover;
- one-way extract geography remains simpler than MVHR;
- failure can retain a useful passive route rather than a completely dead duct network;
- compatible with compact wet/service geography;
- exposes passive/assisted capability explicitly rather than reducing ventilation to a named-system flag.

Weaknesses:

- not a simple prescriptive compliance route;
- requires specialist airflow design and control strategy;
- passive-mode pressure/flow must be demonstrated rather than assumed;
- there is a risk of creating a nominally “passive” system whose fan runs most of the time;
- no heat recovery in the base family;
- available products do not by themselves prove the exact detached-house configuration.

**H1 paper posture:** **RESEARCH-SUPPORTED TOPOLOGY / EXTERNAL PERFORMANCE PROOF REQUIRED.**

Identifier:

**VENT-HYBRID-STACK-01**

### 5.4 Central continuous mechanical extract

VENT-CMEV-01 remains technically coherent and useful.

It retains:

- accessible central fan;
- wet-room extract network;
- habitable-room background inlets;
- transfer routes;
- purge ventilation.

Its principal HSA disadvantage is that the fan is the normal driving force by default, adding a continuous active dependency where a credible passive contribution may exist.

**H1 paper posture:** **SUPPORTED FALLBACK / ALTERNATE FAMILY.**

It remains especially credible if the hybrid stack cannot be demonstrated or if the passive-stack geometry becomes awkward enough that the active fallback is effectively continuous anyway.

### 5.5 MVHR

MVHR offers:

- heat recovery;
- filtered/located supply air;
- strong acoustic/pollution-site options;
- good compatibility with very airtight construction when designed and commissioned well.

Its burdens include:

- two duct networks;
- filters;
- two fans;
- heat exchanger;
- condensate;
- balancing;
- greater maintenance and replacement geography.

Those burdens do not make MVHR doctrinally wrong.

If ventilation heat loss, external noise/pollution, filtration or winter comfort dominate, MVHR may be the best project system despite its additional machinery.

**H1 paper posture:** higher-complexity alternate; Reference House selection remains evidence- and site-dependent.

## 6. Family-selection logic

The research logic is approximately:

~~~text
START
  ↓
Can deliberate passive supply + transfer + stack geometry be formed cleanly?
  ├─ NO → compare CMEV / MVHR
  └─ YES
       ↓
Can passive + bounded assist demonstrate IAQ/moisture performance
across the required operating envelope?
  ├─ NO → compare CMEV / MVHR
  └─ YES
       ↓
Does site noise/pollution or ventilation heat loss make
background inlets / no-heat-recovery architecture poor?
  ├─ YES → compare especially MVHR
  └─ NO → VENT-HYBRID-STACK-01 remains credible
~~~

No branch passes merely because its family name sounds desirable.

## 7. What the hybrid family still must prove for a real project

The [Hybrid Ventilation Evidence Trial](h1-hybrid-ventilation-evidence-trial-v01.md) passed the feasibility/evidence-boundary question. It did **not** prove project performance.

A real implementation still requires competent evidence for:

1. whole-dwelling outdoor-air provision;
2. local wet-room moisture/pollutant extraction;
3. transfer-air continuity;
4. low-wind / low-temperature-difference conditions;
5. adverse and high-wind conditions;
6. control against unacceptable over-ventilation;
7. reverse-flow / cross-contamination risk;
8. cold-draught risk at outdoor-air inlets;
9. external noise and pollutant exposure;
10. stack condensation / cold-space detail;
11. assisted-mode fan/duct performance;
12. failure with the fan or electrical supply unavailable;
13. interaction with cooker source capture;
14. interaction with purge / overheating strategy;
15. whole-house energy consequences compared with plausible CMEV/MVHR alternatives.

The exact compiler target owns regulatory applicability and compliance route.

## 8. Control philosophy

The base family should not require cloud services or proprietary home-automation logic.

An assisted system needs a local, inspectable control strategy capable of deciding when mechanical help is required.

Potential inputs may include:

- pressure / airflow;
- temperature difference;
- wind condition;
- relative humidity;
- occupancy/pollutant demand;
- manual boost.

H1 does not choose the exact sensor/control algorithm. The performance evidence must justify it.

## 9. Source-capture cooking remains separate

Cooking can generate a short, high pollutant load that should preferably be captured at source.

The hybrid background system therefore does not automatically absorb cooker extract.

A source-capture family must coordinate:

- direct exhaust;
- make-up air;
- pressure interaction with passive stacks;
- grease;
- cleaning;
- fire;
- noise.

## 10. Purge and overheating remain separate

Openable windows, cross ventilation, secure night openings and stack purge can contribute to summer resilience.

They are not used to excuse inadequate background ventilation.

Conversely, proving the background ventilation system does not prove overheating performance.

These remain related but distinct obligations.

## 11. Evidence/provenance consequence

VENT-HYBRID-STACK-01 is a useful test of the computational model precisely because it does not fit a simple prescriptive checklist.

A release result may need to distinguish:

~~~text
SYSTEM TOPOLOGY                    SUPPORTED / PROJECT SELECTED
REGULATORY APPLICABILITY           TARGET-DERIVED
PASSIVE AIRFLOW PERFORMANCE        EXTERNAL SPECIALIST EVIDENCE
ASSISTED AIRFLOW PERFORMANCE       EXTERNAL SPECIALIST + PRODUCT EVIDENCE
CONTROL LOGIC                      EXTERNAL DESIGN / PRODUCT EVIDENCE
AS-BUILT VERIFICATION              PHYSICAL EVIDENCE
~~~

That is preferable to pretending the compiler itself has become a ventilation engineer.

## 12. S2 provenance

S2-RUN-01 used VENT-CMEV-01 because that was the frozen family when the source package was compiled.

Its research conclusions about semantic composition, role separation, invalidation and complexity remain valid.

The ventilation-family decision changed **after** the run.

Do not rewrite S2 to make its history cleaner.

## 13. H1-PAPER gate outcome

The original gate required either enough evidence to admit the hybrid topology into H1 paper research or an explicit rejection in favour of another family.

The [Hybrid Ventilation Evidence Trial](h1-hybrid-ventilation-evidence-trial-v01.md) closed that internal gate:

```text
FEASIBILITY / EVIDENCE BOUNDARY      PASS
PROJECT PERFORMANCE / RELEASE        NOT PROVEN
```

H1-PAPER subsequently proceeded with `VENT-HYBRID-STACK-01` as a research-supported topology whose airflow adequacy remained external evidence. H1-PAPER is now complete.

The unresolved question is therefore no longer “may H1-PAPER begin?” It is whether a real Reference House/site can demonstrate that this family outperforms credible CMEV/MVHR alternatives under the passive-first hierarchy.

## 14. Current decision table

| Family | H1 paper status | Normal motive force | Heat recovery | Key proof burden |
|---|---|---|---|---|
| natural + intermittent extract | alternate | natural supply + intermittent fans | no | target/airtightness scope |
| pure PSV | research capability | wind + buoyancy | no | variable airflow performance |
| **VENT-HYBRID-STACK-01** | **research-supported topology** | wind + buoyancy, assisted as required | no | specialist whole-envelope performance |
| VENT-CMEV-01 | supported fallback | continuous fan | no | fan/duct/inlet design + commissioning |
| MVHR | higher-complexity alternate | continuous supply + extract fans | yes | ducting, balancing, filters, condensate, commissioning |

## 15. Reference House boundary

No H1 ventilation family is automatically selected for the Reference House.

Reference House environmental design must test the passive-first hierarchy against the actual orientation, openings, stack geometry, external noise/pollution, winter comfort, summer risk, maintenance geography and competent airflow modelling. The H1 family records provide bounded alternatives and proof questions; they do not decide the architecture.

## 16. Source anchors

- Approved Document F, Volume 1, 2026 edition: https://www.gov.uk/government/publications/approved-document-f-2026
- Future Homes Standard consultation government response (2021): https://www.gov.uk/government/consultations/the-future-homes-standard-changes-to-part-l-and-part-f-of-the-building-regulations-for-new-dwellings
- BRE IP 13/94 listing: https://www.thenbs.com/PublicationIndex/documents/details?DocId=83994&Pub=BRE
- MHCLG, *Ventilation and indoor air quality in new homes* (2019): https://www.gov.uk/government/publications/ventilation-and-indoor-air-quality-in-new-homes
- Turner & Walker, residential passive/hybrid ventilation controller study: https://www.sciencedirect.com/science/article/pii/S0360132313002229
- Aereco hybrid ventilation — technology precedent only, not H1 product validation: https://www.aereco.co.uk/ventilation/ventilation-systems-uk/hybrid-ventilation/