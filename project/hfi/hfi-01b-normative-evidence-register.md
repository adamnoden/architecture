# HFI-01B — Normative and Evidence Register

**Packet:** HFI-01B  
**Programme:** [`docs/development/human-factors-low-friction-inhabitation-programme.md`](../../docs/development/human-factors-low-friction-inhabitation-programme.md)  
**Execution plan:** [`docs/development/human-factors-low-friction-inhabitation-execution-plan.md`](../../docs/development/human-factors-low-friction-inhabitation-execution-plan.md)  
**Owning issue:** #195  
**Baseline `main`:** `56126d491e29b3871048c1b1a38d103b9f2606a3`  
**Prior packet:** HFI-01A terminology + scope  
**Question:** what source classes, authority states, applicability fields and source records must HFI freeze before scenarios and topic-specific synthesis begin?  
**Boundary:** source architecture and registry only. This packet does not derive a target, decide a Reference House defect, select a design intervention, reinterpret a statutory category, or complete topic-specific literature synthesis.

---

## 1. Purpose

HFI-01A froze the language of the programme. HFI-01B freezes the **evidence architecture** used to decide what later sources can legitimately prove.

The central control is:

> **Authority and evidential strength are different axes.**

A legal requirement can bind a real project without proving an ergonomic optimum. A controlled experiment can illuminate a human interaction without creating a legal requirement. A consensus standard or professional guide can describe mature good practice without becoming statute. A built precedent can demonstrate feasibility without proving general validity. An Ovid's House preference has no external evidential weight merely because the project prefers it.

HFI therefore refuses one undifferentiated source hierarchy.

---

## 2. Source classes

| Class | Meaning | What it can establish | What it cannot establish by itself |
|---|---|---|---|
| `LAW` | enacted legislation / Building Regulations | binding requirement where jurisdiction, building type and trigger apply | ergonomic optimum, universal good practice or project preference |
| `STATUTORY-GUIDANCE` | Approved Document or equivalent official guidance accompanying law | recognised route/guidance for satisfying relevant legal duties within stated scope | that every recommendation is itself law; preferred Ovid's House geometry |
| `PLANNING-POLICY` | adopted planning policy | planning requirement where the policy and development context apply | Building Regulations compliance or universal housing doctrine |
| `PLANNING-GUIDANCE` | official explanatory / implementation guidance or planning technical standard | interpretation/application context and technical planning requirements where adopted | independent Building Regulations force or ergonomic optimum |
| `OFFICIAL-POLICY-INTENT` | government consultation response, announced policy direction or other official future intent not yet implemented in law/policy | what government has said it intends to change | that the announced change is already in force |
| `CONSENSUS-STANDARD` | BS / ISO / PAS or similar published standard | codified good practice, terminology, methods and benchmark conditions within scope | legal force unless separately required; proof that a value is optimal for this project |
| `GOVERNMENT-RESEARCH` | research commissioned/published by government | relevant technical evidence and review input | government policy unless explicitly adopted as such |
| `PEER-REVIEWED-SYNTHESIS` | systematic review / meta-analysis / review with defined method | synthesis of a stated evidence corpus and its limitations | project-specific truth outside the populations/interventions reviewed |
| `PEER-REVIEWED-EMPIRICAL` | primary experimental, observational or field study | evidence about a defined population, task, exposure and outcome | universal thresholds or project targets without convergence and applicability analysis |
| `EXPERT-GUIDANCE` | professional/inclusive-design guidance, specialist handbook or taskforce report | mature practice knowledge, worked methods and expert judgement | statutory force or causal proof |
| `HISTORICAL-PRECEDENT` | superseded standard or historical design framework | provenance, prior design logic and comparative precedent | current compliance or automatic present-day target |
| `BUILT-PRECEDENT` | realised building / post-occupancy case | feasibility, architectural integration and observed project-specific outcomes where documented | general causal validity |
| `PROJECT-INTERNAL` | Ovid's House doctrine, hypothesis, preference, RH fact or HFI trigger | current project intent, baseline or research question | external validation |

Each source receives **one primary class**. Historical relevance, policy trajectory or mixed methodological character belongs in `Authority/status`, `Applicability` or `Known limits`, not in a second class.

The classes describe **what a source is**, not whether it is good. A poor study remains poor empirical evidence; a high-quality guide remains non-statutory guidance.

---

## 3. Mandatory register fields

Every source admitted into later HFI reasoning must be recoverable against the following fields.

| Field | Required meaning |
|---|---|
| `ID` | stable internal HFI source identifier; workflow provenance only |
| `Source` | exact title / issuing body or authors |
| `Date/version` | publication date, edition, amendment or review state where available |
| `Jurisdiction / population` | legal geography or empirical population/context |
| `Class` | one primary source class from section 2 |
| `Authority / status` | binding, official guidance, adopted policy, consensus practice, non-binding research etc. |
| `Applicability` | the HFI questions to which the source is legitimately relevant |
| `Known limits / nonclaims` | explicit boundary preventing source inflation |
| `Access state` | whether full text, official landing page/metadata, abstract or paid/licensed text is presently available |
| `Checked` | date current status/metadata was checked |

Later topic packets may add study-specific fields such as sample size, experimental geometry, outcome measure, bias or confidence. HFI-01B does not pretend that metadata registration is critical appraisal.

---

## 4. Interpretation rules

### 4.1 Legal applicability is question-specific

For a compliance question, applicable law and statutory routes control regardless of whether another source proposes a more generous condition.

For an Ovid's House preferred-design question, compliance is a floor/boundary rather than proof of optimum. The preferred condition still requires evidence and proportionality.

### 4.2 Do not rank unlike sources on one ladder

A statute is not "stronger evidence" than a biomechanics experiment for a biomechanics question; it is simply a different kind of authority. Conversely, a study cannot displace a binding legal duty merely because its experimental design is excellent.

### 4.3 Consensus does not erase scope

A British or international standard carries weight only inside its scope and assumptions. Public-building guidance must not silently become a private-dwelling target; a measurement standard must not silently become a dimensional design standard.

### 4.4 Government publication is not automatically policy

Government-commissioned technical research remains research where the publishing department says its findings are not policy/guidance. Announced policy intention remains intention until law/policy is actually changed.

### 4.5 Empirical evidence must preserve population and task

Age, mobility, body dimensions, country, sample, experimental geometry, laboratory/field setting and outcome measure matter. Later synthesis must not convert a result from one population/task into a universal millimetre target without an explicit inference chain.

### 4.6 Precedent proves possibility before generality

A successful built example can show that generous, inclusive or low-friction architecture can coexist with architectural quality. It does not prove that its dimensions or details should be copied.

### 4.7 Project preference is visible, never disguised

Where evidence leaves a legitimate range and Ovid's House later chooses within it, that final step must be labelled project preference / project judgement rather than falsely attributed to a standard or paper.

---

# Part A — Current England / London normative register

## `HFI-SRC-N01` — Building Regulations 2010, Schedule 1, Part M / Requirement M4

- **Source:** The Building Regulations 2010, Schedule 1, Part M, including requirement M4 categories.
- **Date/version:** point-in-time/current legislation checked 2026-10-18.
- **Jurisdiction:** England.
- **Class:** `LAW`.
- **Authority/status:** binding where applicable through the Building Regulations and project circumstances.
- **Applicability:** legal distinction between M4(1) visitable dwellings, optional M4(2) accessible/adaptable dwellings and optional M4(3) wheelchair user dwellings.
- **Known limits/nonclaims:** the legal categories are not aliases for HFI `visitability`, `ordinary usability` or `wheelchair usability`; legal minimum/category status does not establish an ergonomic optimum.
- **Access state:** official legislation text publicly accessible.
- **Checked:** 2026-10-18.
- **Canonical location:** https://www.legislation.gov.uk/uksi/2010/2214/schedule/1/part/M

## `HFI-SRC-N02` — Approved Document M, Volume 1: Dwellings

- **Source:** HM Government, *Approved Document M: access to and use of buildings, Volume 1: Dwellings*.
- **Date/version:** 2015 edition incorporating 2016 amendments; GOV.UK status checked 2026-10-18.
- **Jurisdiction:** England.
- **Class:** `STATUTORY-GUIDANCE`.
- **Authority/status:** official guidance for Part M dwelling requirements; the current GOV.UK page states categories 2 and 3 apply only where required by planning permission.
- **Applicability:** dwelling approach, entrance, circulation, sanitary provision and category-specific access/use criteria.
- **Known limits/nonclaims:** guidance is not itself the full law; satisfying one guidance route does not prove low-friction use; values are not automatically Ovid's House targets.
- **Access state:** official GOV.UK page/full document publicly available; detailed clause analysis is deferred to topic packets.
- **Checked:** 2026-10-18.
- **Canonical location:** https://www.gov.uk/government/publications/access-to-and-use-of-buildings-approved-document-m

## `HFI-SRC-N03` — Approved Document K

- **Source:** HM Government, *Approved Document K: protection from falling, collision and impact*.
- **Date/version:** 2013 edition; GOV.UK current status checked 2026-10-18.
- **Jurisdiction:** England.
- **Class:** `STATUTORY-GUIDANCE`.
- **Authority/status:** official guidance to relevant Building Regulations requirements.
- **Applicability:** stairs, ramps, guarding and related fall/collision conditions.
- **Known limits/nonclaims:** does not establish preferred HFI stair comfort; RH-C5 already treats one selected private-stair numeric method only as bounded external-guidance correspondence.
- **Access state:** official GOV.UK page/full document publicly available; technical source already bounded separately in RH-C5.
- **Checked:** 2026-10-18.
- **Canonical location:** https://www.gov.uk/government/publications/protection-from-falling-collision-and-impact-approved-document-k

## `HFI-SRC-N04` — Approved Document G

- **Source:** HM Government, *Approved Document G: sanitation, hot water safety and water efficiency*.
- **Date/version:** 2015 edition incorporating 2016 amendments and 2024 amendment; status checked 2026-10-18.
- **Jurisdiction:** England.
- **Class:** `STATUTORY-GUIDANCE`.
- **Authority/status:** official guidance.
- **Applicability:** adjacent technical duties around sanitary conveniences, washing facilities, bathrooms, kitchens, hot water and water use where HFI fixed-use geometry/interfaces intersect them.
- **Known limits/nonclaims:** not a bathroom/kitchen ergonomics handbook and not authority for HFI sequence-of-use targets.
- **Access state:** official GOV.UK page/full document publicly available.
- **Checked:** 2026-10-18.
- **Canonical location:** https://www.gov.uk/government/publications/sanitation-hot-water-safety-and-water-efficiency-approved-document-g

## `HFI-SRC-N05` — Approved Document H

- **Source:** HM Government, *Approved Document H: drainage and waste disposal*.
- **Date/version:** current GOV.UK edition/status checked 2026-10-18.
- **Jurisdiction:** England.
- **Class:** `STATUTORY-GUIDANCE`.
- **Authority/status:** official guidance.
- **Applicability:** adjacent drainage duties where level approaches, thresholds, showers and continuous-ground-plane ambitions intersect water disposal.
- **Known limits/nonclaims:** HFI cannot use level access as a reason to waive drainage/weathering duties; this source does not determine ergonomic usability.
- **Access state:** official GOV.UK page/full document publicly available.
- **Checked:** 2026-10-18.
- **Canonical location:** https://www.gov.uk/government/publications/drainage-and-waste-disposal-approved-document-h

## `HFI-SRC-N06` — Approved Document Q

- **Source:** HM Government, *Approved Document Q: security — dwellings*.
- **Date/version:** 2015 edition; GOV.UK page/status checked 2026-10-18.
- **Jurisdiction:** England.
- **Class:** `STATUTORY-GUIDANCE`.
- **Authority/status:** official guidance.
- **Applicability:** adjacent security obligations for doors/windows/hardware where operating effort, opening and accessible use are considered.
- **Known limits/nonclaims:** does not determine HFI handle/reach/force optimum; security closure remains with its own owner.
- **Access state:** official GOV.UK page/full document publicly available.
- **Checked:** 2026-10-18.
- **Canonical location:** https://www.gov.uk/government/publications/security-in-dwellings-approved-document-q

## `HFI-SRC-N07` — Planning Practice Guidance: housing optional technical standards

- **Source:** MHCLG/DLUHC planning practice guidance on optional technical standards for housing.
- **Date/version:** original 2015 guidance with subsequent updates; checked 2026-10-18.
- **Jurisdiction:** England planning system.
- **Class:** `PLANNING-GUIDANCE`.
- **Authority/status:** official planning guidance.
- **Applicability:** how local planning authorities use optional access standards M4(2)/M4(3), including evidence, viability and site circumstances.
- **Known limits/nonclaims:** does not make M4(2) universally mandatory; planning application of optional standards is not project doctrine.
- **Access state:** official GOV.UK/Planning Practice Guidance publicly accessible.
- **Checked:** 2026-10-18.
- **Canonical location:** https://www.gov.uk/guidance/housing-optional-technical-standards

## `HFI-SRC-N08` — Raising accessibility standards for new homes: government response

- **Source:** UK Government response to consultation on raising accessibility standards for new homes.
- **Date/version:** response last updated 29 July 2022; implementation status re-checked 2026-10-18.
- **Jurisdiction:** England policy development.
- **Class:** `OFFICIAL-POLICY-INTENT`.
- **Authority/status:** official statement proposing to make M4(2) the national minimum, expressly subject to further technical consultation and a future Building Regulations change.
- **Applicability:** policy trajectory/context only.
- **Known limits/nonclaims:** **not evidence that M4(2) is currently the national mandatory baseline.** Current 2026 legislation still labels M4(2) and M4(3) optional requirements; current ADM Volume 1 still states categories 2 and 3 apply only where required by planning permission.
- **Access state:** official GOV.UK consultation outcome publicly accessible.
- **Checked:** 2026-10-18.
- **Canonical location:** https://www.gov.uk/government/consultations/raising-accessibility-standards-for-new-homes

## `HFI-SRC-N09` — London Plan 2021, Policy D7

- **Source:** Greater London Authority, *The London Plan 2021*, Policy D7 Accessible housing.
- **Date/version:** adopted 2021; current adopted-policy status checked 2026-10-18 while a next London Plan remains in development/consultation.
- **Jurisdiction:** Greater London planning policy.
- **Class:** `PLANNING-POLICY`.
- **Authority/status:** adopted London planning policy.
- **Applicability:** London development scenario; at least 10% of applicable dwellings meet M4(3), with the remaining applicable dwellings meeting M4(2), subject to policy wording and exceptions.
- **Known limits/nonclaims:** London-specific planning policy, not a universal Ovid's House rule and not a substitute for Building Regulations proof.
- **Access state:** official GLA policy/guidance pages publicly accessible; 2026 mayoral material continues to describe the 90/10 M4(2)/M4(3) requirement as current London Plan policy.
- **Checked:** 2026-10-18.
- **Canonical location:** https://www.london.gov.uk/publications/housing-design

## `HFI-SRC-N10` — Housing Design Standards London Plan Guidance

- **Source:** Greater London Authority, *Housing Design Standards London Plan Guidance*.
- **Date/version:** adopted 8 June 2023; status checked 2026-10-18.
- **Jurisdiction:** Greater London.
- **Class:** `PLANNING-GUIDANCE`.
- **Authority/status:** adopted London Plan Guidance supporting housing policies including accessible housing implementation.
- **Applicability:** London scenario for step-free approaches, accessible housing coordination and design-quality implementation.
- **Known limits/nonclaims:** guidance sits beneath adopted policy and applies in London; it is not general UK doctrine.
- **Access state:** official GLA guidance publicly accessible.
- **Checked:** 2026-10-18.
- **Canonical location:** https://www.london.gov.uk/programmes-strategies/planning/implementing-london-plan/london-plan-guidance-and-spgs/housing-design-standards-lpg

## `HFI-SRC-N11` — Nationally Described Space Standard

- **Source:** Department for Communities and Local Government / MHCLG, *Technical housing standards — nationally described space standard*.
- **Date/version:** 2015 standard, amended 2016; checked 2026-10-18.
- **Jurisdiction:** England, through the planning route where adopted/applicable.
- **Class:** `PLANNING-GUIDANCE`.
- **Authority/status:** national technical planning standard where relevant planning policy requires it.
- **Applicability:** gross internal area, bedroom/storage and related spatial context; useful as an area baseline/counterweight when HFI later proposes spatial generosity.
- **Known limits/nonclaims:** minimum space compliance does not prove ordinary usability, turning/task performance or HFI proportionality.
- **Access state:** official GOV.UK text publicly accessible.
- **Checked:** 2026-10-18.
- **Canonical location:** https://www.gov.uk/government/publications/technical-housing-standards-nationally-described-space-standard

---

# Part B — Consensus standards and professional / specialist guidance

## `HFI-SRC-S01` — BS 8300-1:2018

- **Source:** BSI, *Design of an accessible and inclusive built environment — Part 1: External environment. Code of practice*.
- **Date/version:** published 31 January 2018; BSI marks it current as checked 2026-10-18.
- **Jurisdiction/scope:** UK consensus standard; external built environment.
- **Class:** `CONSENSUS-STANDARD`.
- **Authority/status:** non-statutory consensus good practice unless adopted/required by another route.
- **Applicability:** external routes, approaches and inclusive external-environment questions.
- **Known limits/nonclaims:** not a dwelling-specific legal requirement and not automatically an Ovid's House site target.
- **Access state:** public BSI metadata; full technical clauses require licensed access.
- **Checked:** 2026-10-18.
- **Canonical location:** https://knowledge.bsigroup.com/products/design-of-an-accessible-and-inclusive-built-environment-external-environment-code-of-practice

## `HFI-SRC-S02` — BS 8300-2:2018

- **Source:** BSI, *Design of an accessible and inclusive built environment — Part 2: Buildings. Code of practice*.
- **Date/version:** published 31 January 2018; BSI marks it current as checked 2026-10-18.
- **Jurisdiction/scope:** UK consensus standard; buildings within its stated scope.
- **Class:** `CONSENSUS-STANDARD`.
- **Authority/status:** non-statutory consensus good practice unless separately required.
- **Applicability:** background inclusive-design principles and non-dwelling/common-building questions only where the stated scope fits.
- **Known limits/nonclaims:** **BSI explicitly states BS 8300-2 does not apply to individual dwellings.** It therefore cannot be mined for Ovid's House dwelling dimensions as though it were residential guidance. Dwelling-specific questions should look first to applicable Part M routes, BS 9266 and specialist housing sources.
- **Access state:** public BSI metadata; full technical clauses require licensed access.
- **Checked:** 2026-10-18.
- **Canonical location:** https://knowledge.bsigroup.com/products/design-of-an-accessible-and-inclusive-built-environment-buildings-code-of-practice

## `HFI-SRC-S03` — BS 9266:2013

- **Source:** BSI, *Design of accessible and adaptable general needs housing — Code of practice*.
- **Date/version:** published 31 July 2013; BSI marks it current as checked 2026-10-18.
- **Jurisdiction/scope:** UK; general-needs housing.
- **Class:** `CONSENSUS-STANDARD`.
- **Authority/status:** non-statutory consensus code of practice unless separately required.
- **Applicability:** parking/access routes, dwelling circulation and key rooms/facilities in accessible/adaptable general-needs housing.
- **Known limits/nonclaims:** excludes purpose-designed wheelchair housing and specialist older-person housing; technical values are not to be quoted until licensed text/clauses are inspected directly.
- **Access state:** public BSI metadata; full technical clauses require licensed access.
- **Checked:** 2026-10-18.
- **Canonical location:** https://knowledge.bsigroup.com/products/design-of-accessible-and-adaptable-general-needs-housing-code-of-practice

## `HFI-SRC-S04` — PAS 6463:2022

- **Source:** BSI, *Design for the mind — Neurodiversity and the built environment — Guide*.
- **Date/version:** published 31 October 2022; BSI marks it current as checked 2026-10-18.
- **Jurisdiction/scope:** UK guidance across built-environment contexts.
- **Class:** `CONSENSUS-STANDARD`.
- **Authority/status:** PAS guidance; non-statutory.
- **Applicability:** bounded sensory/cognitive variation, comprehension and environmental-use considerations where they intersect HFI routes/interfaces.
- **Known limits/nonclaims:** must not expand HFI into general neuroarchitecture, clinical claims or specialist life-safety signalling.
- **Access state:** BSI metadata and a downloadable copy are publicly available from BSI; relevant clauses still require direct inspection before substantive use.
- **Checked:** 2026-10-18.
- **Canonical location:** https://knowledge.bsigroup.com/products/design-for-the-mind-neurodiversity-and-the-built-environment-guide

## `HFI-SRC-S05` — ISO 26800:2011

- **Source:** ISO, *Ergonomics — General approach, principles and concepts*.
- **Date/version:** 2011; reviewed/confirmed in 2022 and current as checked 2026-10-18.
- **Jurisdiction/scope:** international ergonomics framework.
- **Class:** `CONSENSUS-STANDARD`.
- **Authority/status:** non-statutory international standard.
- **Applicability:** general person–task–system/environment framing and ergonomics principles.
- **Known limits/nonclaims:** not a residential dimension standard and supplies no automatic house target.
- **Access state:** public ISO metadata/abstract; full text licensed.
- **Checked:** 2026-10-18.
- **Canonical location:** https://www.iso.org/standard/42885.html

## `HFI-SRC-S06` — ISO 7250-1:2017

- **Source:** ISO, *Basic human body measurements for technological design — Part 1: Body measurement definitions and landmarks*.
- **Date/version:** 2017 edition 2; reviewed/confirmed in 2023 and current as checked 2026-10-18.
- **Jurisdiction/scope:** international anthropometric measurement method.
- **Class:** `CONSENSUS-STANDARD`.
- **Authority/status:** measurement/definition standard.
- **Applicability:** consistent body-measurement definitions and dataset interpretation; ISO explicitly notes use as a basis for defining population groups and geometric design of places where people work and live.
- **Known limits/nonclaims:** measurement definitions are not percentile selections or architectural dimensions.
- **Access state:** public ISO metadata/abstract; full text licensed.
- **Checked:** 2026-10-18.
- **Canonical location:** https://www.iso.org/standard/65246.html

## `HFI-SRC-S07` — ISO 15535:2023

- **Source:** ISO, *General requirements for establishing anthropometric databases*.
- **Date/version:** 2023, edition 4; published/current as checked 2026-10-18.
- **Jurisdiction/scope:** international anthropometric database methodology.
- **Class:** `CONSENSUS-STANDARD`.
- **Authority/status:** methodological standard.
- **Applicability:** population definition, sampling/statistical quality and database suitability when HFI later uses anthropometric data.
- **Known limits/nonclaims:** does not specify which percentile Ovid's House should design to and does not establish dwelling geometry.
- **Access state:** public ISO metadata/abstract; full text licensed.
- **Checked:** 2026-10-18.
- **Canonical location:** https://www.iso.org/standard/82541.html

## `HFI-SRC-S08` — RIBA Inclusive Design Overlay

- **Source:** RIBA, *Inclusive Design Overlay to the RIBA Plan of Work*.
- **Date/version:** launched 2023; current usage/status checked 2026-10-18.
- **Jurisdiction/scope:** UK professional design-process guidance.
- **Class:** `EXPERT-GUIDANCE`.
- **Authority/status:** professional process guidance; non-statutory.
- **Applicability:** inclusive-design responsibilities, collaboration and review through project stages.
- **Known limits/nonclaims:** process framework rather than empirical dimensional evidence or compliance proof.
- **Access state:** public RIBA guidance/metadata.
- **Checked:** 2026-10-18.
- **Canonical location:** RIBA / *Inclusive Design Overlay*.

## `HFI-SRC-S09` — Inclusive Housing Design Guide

- **Source:** Jacquel Runnalls / Habinteg Housing Association / Centre for Accessible Environments, *The Inclusive Housing Design Guide* (RIBA Publishing).
- **Date/version:** published 1 October 2024.
- **Jurisdiction/scope:** UK housing; specialist inclusive-housing guidance.
- **Class:** `EXPERT-GUIDANCE`.
- **Authority/status:** specialist practice guidance; non-statutory.
- **Applicability:** accessible/adaptable/inclusive housing, including explicit rationale and good practice around M4(2)/M4(3) and changing needs.
- **Known limits/nonclaims:** recommendations require direct source inspection and later proportionality; not law and not automatically generic doctrine.
- **Access state:** public Habinteg/RIBA metadata; detailed book content requires legitimate access to the publication.
- **Checked:** 2026-10-18.
- **Canonical location:** https://www.habinteg.org.uk/the-inclusive-housing-design-guide

## `HFI-SRC-S10` — Wheelchair Housing Design Guide, 3rd edition

- **Source:** Centre for Accessible Environments / Habinteg, *Wheelchair Housing Design Guide*, 3rd edition (RIBA Publishing).
- **Date/version:** published 1 February 2018.
- **Jurisdiction/scope:** UK wheelchair housing.
- **Class:** `EXPERT-GUIDANCE`.
- **Authority/status:** specialist good-practice guide; non-statutory.
- **Applicability:** activity-based wheelchair housing, route/room/use conditions and M4(3)-adjacent design questions.
- **Known limits/nonclaims:** wheelchair-specific guidance must not silently become the minimum geometry for all ordinary housing; direct technical provisions require source inspection.
- **Access state:** public RIBA/Habinteg metadata; detailed text requires legitimate access.
- **Checked:** 2026-10-18.
- **Canonical location:** https://www.ribabooks.com/wheelchair-housing-design-guide_9781859468289

## `HFI-SRC-S11` — Healthy Homes — a foundation for healthier and resilient communities

- **Source:** Homes England, *Healthy Homes — a foundation for healthier and resilient communities*.
- **Date/version:** first published 6 November 2025; last updated 8 July 2026; checked 2026-10-18.
- **Jurisdiction/scope:** England / Homes England programme and wider good-practice context.
- **Class:** `EXPERT-GUIDANCE`.
- **Authority/status:** Homes England core specifications/good-practice guidance, primarily for Homes England, development partners and design consultants; not Building Regulations.
- **Applicability:** contemporary housing-quality triangulation, including accessibility, future flexibility, dignity and resident control. Its current accessibility core requirement uses M4(2) for homes within its intended delivery context.
- **Known limits/nonclaims:** a Homes England requirement/good-practice enhancement does not alter the national Building Regulations baseline by itself; applicability depends on delivery/funding context.
- **Access state:** public GOV.UK HTML guidance.
- **Checked:** 2026-10-18.
- **Canonical location:** https://www.gov.uk/government/publications/healthy-homes/healthy-homes-a-foundation-for-healthier-and-resilient-communities

---

# Part C — Government-commissioned research and empirical evidence seed register

HFI-01B registers **seed sources and source roles**. It does not yet perform topic-specific synthesis. HFI-02 to HFI-04 must expand and critically appraise the evidence for their exact questions rather than treating this list as exhaustive.

## `HFI-SRC-R01` — Access to and use of buildings: research on demographic and ergonomic requirements

- **Source:** MHCLG, research undertaken by Arup Consultants, *Access to and use of buildings: research on demographic and ergonomic requirements*.
- **Date/version:** published 28 October 2025.
- **Jurisdiction/population:** England regulatory-review context; evidence concerns disabled people and people with long-term health conditions alongside demographic/ergonomic requirements.
- **Class:** `GOVERNMENT-RESEARCH`.
- **Authority/status:** government-commissioned technical research supporting review of Approved Document M.
- **Applicability:** unusually direct contemporary evidence for Part M demographic/ergonomic assumptions, accessibility and spatial/use requirements.
- **Known limits/nonclaims:** GOV.UK explicitly states that findings/recommendations **do not represent government policy or guidance**. They must not be presented as current Building Regulations or adopted AD M changes.
- **Access state:** official GOV.UK landing page and open 255-page report plus appendices available; detailed report analysis belongs in relevant topic packets.
- **Checked:** 2026-10-18.
- **Canonical location:** https://www.gov.uk/government/publications/access-to-and-use-of-buildings-research-on-demographic-and-ergonomic-requirements

## `HFI-SRC-R02` — Ackermans et al. stair-negotiation experiment

- **Source:** Thijs M.A. Ackermans et al., *Stair negotiation behaviour of older individuals: Do step dimensions matter?*, Journal of Biomechanics 101 (2020) 109616. DOI `10.1016/j.jbiomech.2020.109616`.
- **Date/version:** 2020.
- **Population/context:** 68 independently living adults over 65; controlled seven-step stair experiment using two step-dimension configurations.
- **Class:** `PEER-REVIEWED-EMPIRICAL`.
- **Authority/status:** primary research.
- **Applicability:** older-adult stair-negotiation behaviour and whether changing step dimensions changes selected biomechanical stepping profiles; HFI-02B evidence seed.
- **Known limits/nonclaims:** older-adult experimental sample and two bounded stair configurations; the experiment was not a search for an optimal domestic stair dimension and no tested dimension becomes an Ovid's House target from this study alone.
- **Access state:** publisher/PubMed metadata and abstract publicly accessible; accepted manuscript also publicly indexed; full critical appraisal deferred to HFI-02B.
- **Checked:** 2026-10-18.

## `HFI-SRC-R03` — Di Giulio et al. stair-going experiment

- **Source:** Irene Di Giulio et al., *Stair Gait in Older Adults Worsens With Smaller Step Treads and When Transitioning Between Level and Stair Walking*, Frontiers in Sports and Active Living 2 (2020) 63. DOI `10.3389/fspor.2020.00063`.
- **Date/version:** published 25 June 2020.
- **Population/context:** 21 younger adults and 20 older adults; controlled seven-step stair across four goings (175, 225, 275 and 325 mm), with motion/force measurements.
- **Class:** `PEER-REVIEWED-EMPIRICAL`.
- **Authority/status:** primary research; open access.
- **Applicability:** gait, foot clearance/overhang, handrail use and adaptation as going changes; directly relevant to HFI-02B and the original shallow-going/foot-placement trigger.
- **Known limits/nonclaims:** laboratory staircase, bounded sample and selected goings; the paper can inform mechanism/trade-offs but cannot alone establish a preferred domestic going or large-foot percentile rule.
- **Access state:** open primary paper available; detailed critical appraisal deferred to HFI-02B.
- **Checked:** 2026-10-18.

## `HFI-SRC-R04` — Francksen et al. inconsistent-going experiment

- **Source:** Natasha Francksen et al., *Underlying mechanisms of fall risk on stairs with inconsistent going size*, Applied Ergonomics 101 (2022) 103678. DOI `10.1016/j.apergo.2022.103678`.
- **Date/version:** 2022.
- **Population/context:** younger and older adults; controlled stair-use experiment involving inconsistent going dimensions.
- **Class:** `PEER-REVIEWED-EMPIRICAL`.
- **Authority/status:** primary research.
- **Applicability:** consistency/expectation, foot contact/clearance and stair-fall mechanisms; HFI-02B.
- **Known limits/nonclaims:** principally informs dimensional inconsistency and adaptation mechanisms, not a preferred absolute domestic going; full methods/results require topic-level appraisal before use.
- **Access state:** PubMed/publisher abstract and metadata accessible; primary-paper review deferred.
- **Checked:** 2026-10-18.

## `HFI-SRC-R05` — Sheth & Cogle home-modification systematic review

- **Source:** Sohum Sheth & Christopher R. Cogle, *Home Modifications for Older Adults: A Systematic Review*, Journal of Applied Gerontology 42(5) (2023) 1151–1164. DOI `10.1177/07334648231151669`.
- **Date/version:** published online 19 January 2023.
- **Population/context:** older adults; 12 randomised controlled trials of home-modification models in the reviewed corpus.
- **Class:** `PEER-REVIEWED-SYNTHESIS`.
- **Authority/status:** systematic research synthesis.
- **Applicability:** life-course/adaptation evidence, intervention outcomes and the distinction between built-in provision and later modification; HFI-02C/HFI-05B context.
- **Known limits/nonclaims:** home-modification interventions do not directly answer new-build dimensional targets; US/context/intervention heterogeneity and risk-of-bias findings must be preserved.
- **Access state:** abstract/public bibliographic metadata; full review appraisal deferred.
- **Checked:** 2026-10-18.

## `HFI-SRC-R06` — Stark et al. home-modification systematic review

- **Source:** Susan Stark, Marian Keglovits, Marian Arbesman & Deborah Lieberman, *Effect of Home Modification Interventions on the Participation of Community-Dwelling Adults With Health Conditions: A Systematic Review*, American Journal of Occupational Therapy 71(2) (2017). DOI `10.5014/ajot.2017.018887`.
- **Date/version:** 2017.
- **Population/context:** community-dwelling adults/older adults with health conditions; 36 included articles.
- **Class:** `PEER-REVIEWED-SYNTHESIS`.
- **Authority/status:** systematic research synthesis.
- **Applicability:** participation, function, falls and occupational-therapy/home-modification evidence relevant to adaptation and later-life use.
- **Known limits/nonclaims:** primarily intervention evidence, not a new-build dimensional study; study heterogeneity and population context require later appraisal.
- **Access state:** PubMed/publisher abstract and metadata accessible; full review deferred.
- **Checked:** 2026-10-18.

## `HFI-SRC-R07` — Wellecke et al. occupational-therapist survey

- **Source:** Cornelia Wellecke et al., *Accessible design features and home modifications to improve physical housing accessibility: A mixed-methods survey of occupational therapists*, Disability and Health Journal 15(3) (2022) 101281. DOI `10.1016/j.dhjo.2022.101281`.
- **Date/version:** 2022.
- **Population/context:** 144 Australian occupational therapists; cross-sectional online survey in 2021.
- **Class:** `PEER-REVIEWED-EMPIRICAL`.
- **Authority/status:** expert-practice empirical evidence; open-access article.
- **Applicability:** practitioner experience around step-free access, bathroom/bedroom access, home modifications and ageing-in-place/discharge; useful supporting evidence for HFI-02C/HFI-04.
- **Known limits/nonclaims:** Australian professional sample and self-reported expert judgement; not UK law, not causal proof and not a direct dimensional target.
- **Access state:** open article/abstract available; topic-level appraisal deferred.
- **Checked:** 2026-10-18.

---

# Part D — Historical lineage / precedent register

## `HFI-SRC-P01` — Lifetime Homes Standard

- **Source:** Lifetime Homes / Habinteg lineage, revised 16-criterion standard.
- **Date/version:** revised 5 July 2010; historical status checked 2026-10-18.
- **Jurisdiction/context:** UK housing design history.
- **Class:** `HISTORICAL-PRECEDENT`.
- **Authority/status:** influential historical inclusive/adaptable housing standard; no longer the current statutory route.
- **Applicability:** provenance of adaptable/general-needs housing thinking and comparison with later M4(2) development.
- **Known limits/nonclaims:** M4(2) is described by government as broadly equivalent, not textually identical; Lifetime Homes criteria are not current Building Regulations.
- **Access state:** public historical material/criterion summaries available through Habinteg/archived sources.
- **Checked:** 2026-10-18.

## `HFI-SRC-P02` — HAPPI report

- **Source:** Housing our Ageing Population: Panel for Innovation (HAPPI), 2009 report.
- **Date/version:** 2009.
- **Jurisdiction/context:** England/UK older-person housing; public-policy expert-panel context informed by case studies including European examples.
- **Class:** `EXPERT-GUIDANCE`.
- **Authority/status:** expert panel report with historical/precedent value.
- **Applicability:** spatial generosity, adaptability, light, circulation and later-life housing principles; useful counterpoint to purely regulatory minimums.
- **Known limits/nonclaims:** older-person housing focus and case-study/expert method; not general-needs law and not proof that every HAPPI feature belongs in Ovid's House.
- **Access state:** public report/summary sources available.
- **Checked:** 2026-10-18.

## `HFI-SRC-P03` — Built domestic precedents

- **Source:** to be populated by HFI-03/HFI-05 with realised domestic projects selected for explicit HFI questions.
- **Date/version:** open requirement.
- **Jurisdiction/context:** project-specific.
- **Class:** `BUILT-PRECEDENT`.
- **Authority/status:** precedent only.
- **Applicability:** demonstrate whether route generosity, level access, adaptable planning or task/logistics improvements can be integrated without institutional character or indiscriminate area growth.
- **Known limits/nonclaims:** no precedent is admitted merely because it looks generous; each must document the relevant mechanism and project burden.
- **Access state:** **OPEN SOURCE REQUIREMENT**.
- **Owner:** HFI-03 / HFI-05.

---

# Part E — Project-internal source class

## `HFI-SRC-I01` — Ovid's House / HFI internal material

The following are `PROJECT-INTERNAL` sources:

- governing principles and Repose research;
- HFI programme/execution controls;
- HFI-00 authority/baseline/friction records;
- HFI-01A terminology;
- Reference House facts and hypotheses;
- user-trigger hypotheses such as large-foot stair discomfort, tight furniture turns and shower-control sequencing;
- later Ovid's House preferred targets once legitimately selected.

They may establish **what the project currently believes, represents or asks**. They do not become external evidence through repetition.

Where later synthesis says "Ovid's House prefers X", the supporting chain should be legible as:

`external evidence / normative boundary -> applicable range/trade-off -> HFI proportionality -> explicit project judgement`

not:

`project preference -> search for a source that appears to justify it`.

---

# Part F — Required evidence-family coverage and open requirements

The programme issue names minimum evidence families. HFI-01B must prove that none can silently disappear simply because no source has yet been selected.

| Required family | Current registered coverage | Later owner / action |
|---|---|---|
| England Building Regulations / AD M | N01–N02 | topic packets inspect exact clauses when needed |
| stairs / guarding regulatory baseline | N03 | HFI-02B + existing RH-C5 boundary |
| relevant G/H/Q interfaces | N04–N06 | HFI-03B / 04A / 04B / 05C |
| 2025 demographic/ergonomic Part M research | R01 | HFI-02/03/04 topic extraction |
| BS inclusive/access guidance | S01–S04 | respect scopes; S02 explicitly excludes individual dwellings; inspect primary clauses only when needed |
| accessible/adaptable housing guidance | S03, S09, S10 | HFI-02C / 03 / 04 |
| London M4(2)/M4(3) scenario | N09–N10 | retain as London scenario, never universal doctrine |
| anthropometric data/method limits | S06–S07 | HFI-02A must add actual population datasets |
| ergonomics / human factors framework | S05 | HFI-02A / 04 add task-specific evidence |
| stair biomechanics / falls | R02–R04 | HFI-02B systematic search/appraisal |
| occupational therapy / home modification | R05–R07 | HFI-02C / 04 supporting evidence |
| ageing-in-place / older housing | P02 + R05/R06 | HFI-02C; add contemporary evidence where material |
| housing post-occupancy evidence | not yet adequately covered | **OPEN SOURCE REQUIREMENT — HFI-02C / HFI-03D / HFI-05** |
| bathroom / toileting / dressing ergonomics | not yet topic-specific | **OPEN SOURCE REQUIREMENT — HFI-04A** |
| kitchen / fixed work / storage ergonomics | not yet topic-specific | **OPEN SOURCE REQUIREMENT — HFI-04D** |
| doors/windows/hardware force/grip | not yet topic-specific | **OPEN SOURCE REQUIREMENT — HFI-02A / HFI-04B** |
| environmental/electrical controls | not yet topic-specific | **OPEN SOURCE REQUIREMENT — HFI-04C** |
| furniture/logistics / swept paths | P03 not populated | **OPEN SOURCE REQUIREMENT — HFI-03C** |
| domestic task routes / housework/care | no direct source yet | **OPEN SOURCE REQUIREMENT — HFI-03D / HFI-01C scenarios** |
| built domestic precedents | P03 placeholder | **OPEN SOURCE REQUIREMENT — HFI-03 / HFI-05** |
| area/cost/carbon/energy counter-evidence | N11 is only context | **OPEN SOURCE REQUIREMENT — HFI-01D / HFI-05B** |
| privacy/security/moisture conflict evidence | N05/N06 establish adjacent normative routes only | HFI-05C pulls from owning discipline rather than HFI inventing evidence |

An open source requirement is **not a programme gap** if its owner is explicit and the packet that needs it has not begun. It becomes a gap if a later packet attempts a conclusion without disposing of the requirement.

---

## 5. Evidence-admission rules for later packets

A later HFI packet may use a source substantively only if it answers all applicable questions below.

1. **Identity:** is the exact source/version recoverable?
2. **Currentness:** for normative material, is it current for the relevant jurisdiction/date?
3. **Authority:** is it law, guidance, policy, standard, research, precedent or project judgement?
4. **Applicability:** does its population/building type/task/jurisdiction match the proposition being made?
5. **Access:** has the actual relevant text/method/results been inspected, rather than a search snippet or secondary summary?
6. **Limits:** what does the source explicitly or methodologically not prove?
7. **Convergence:** for a consequential design claim, is one source enough, or is triangulation required?
8. **Conflict:** if sources disagree, is the disagreement preserved rather than averaged away?
9. **Translation:** what inference is needed to move from the source result to architecture?
10. **Ownership:** does the conclusion stay inside HFI or require another discipline / RH gate?

For paid or licensed standards/guides, public metadata is enough to **register** the source in 01B. It is not enough to quote or rely on technical clauses later. The relevant primary text must be legitimately inspected first.

For PDFs, later detailed analysis must use the project's normal PDF inspection discipline rather than relying on snippets or extracted context alone.

---

## 6. Current normative finding: M4(2) policy intention is not current national law

The source register exposes one material semantic trap early.

The 2022 government response announced an intention to make M4(2) the minimum accessibility standard for new homes in England, subject to further technical consultation and a change to the Building Regulations. On the sources checked for this packet on **18 October 2026**, the current Building Regulations still identify M4(2) and M4(3) as optional requirements, and the current Approved Document M Volume 1 page still states categories 2 and 3 apply only where required by planning permission.

Therefore HFI must keep three propositions separate:

1. **current national legal/guidance state**;
2. **announced policy direction**;
3. **London planning policy**, which already requires M4(2)/M4(3) proportions through its own route.

No later HFI text may collapse those into "England now requires M4(2)" without re-verifying that the law has actually changed.

---

## 7. Evidence-strength discipline

HFI will not assign a global numeric score such as `source strength = 8/10`. That would falsely combine unlike concepts.

Later synthesis should instead report, where material:

- **authority fit** — does the source govern the project/question?
- **directness** — does it study the actual task/interface/population?
- **method quality** — is the empirical method suitable and adequately controlled?
- **external validity** — how far can it travel beyond the source context?
- **convergence** — is the result supported by independent evidence traditions?
- **architectural translation risk** — how many inference steps sit between evidence and a design proposition?

This allows, for example, an Approved Document to have high authority fit for compliance but weak directness for comfort optimisation, while a biomechanics study can have high directness for foot-placement mechanics but no legal authority.

---

## 8. Anti-drift rules

The following are prohibited unless a later packet explicitly proves the inference:

- calling a non-statutory guide a legal requirement;
- calling a government-commissioned report government policy when the publisher says otherwise;
- treating announced future policy as implemented law;
- importing BS 8300-2 values into an individual dwelling despite its explicit scope exclusion;
- importing wheelchair-specific guidance as a universal ordinary-housing minimum;
- deriving a project target from one anthropometric percentile without population/task reasoning;
- treating one laboratory result as a universal domestic threshold;
- using a built precedent as causal evidence merely because it appears successful;
- citing a paid standard's technical value from a secondary summary without inspecting the primary clause;
- using current RH geometry as corroborating evidence for itself;
- using Ovid's House preference as if it were an external source;
- treating regulatory compliance as proof of low-friction inhabitation;
- treating "more generous than regulation" as self-evidently better.

---

## 9. Search / verification method used in HFI-01B

HFI-01B performed **source registration**, not full literature synthesis.

Priority order for source identity/currentness was:

1. legislation.gov.uk for enacted law;
2. GOV.UK / official department pages for Approved Documents, planning guidance and commissioned research;
3. Greater London Authority for London policy/guidance;
4. BSI / ISO official metadata for standards;
5. RIBA / Habinteg / Homes England for professional/specialist guidance;
6. PubMed, primary publishers and institutional repositories for empirical research seeds.

No technical dimension is admitted solely from a search-result snippet. No paid-standard clause has been treated as inspected. Topic-specific research packets remain responsible for primary-text review and critical appraisal before drawing conclusions.

---

## 10. Findings

1. The programme needs **two separate questions** for every external source: *what authority does it carry?* and *what evidential claim can it support?*
2. England national law/guidance, London planning policy and future policy intention are three distinct layers and must remain distinct.
3. Approved Documents provide essential regulatory baselines but do not answer the programme's preferred-usability questions by themselves.
4. BS/ISO/PAS sources are valuable benchmarks/methods, but scope and primary-text access matter before technical provisions can be used. BS 8300-2's explicit exclusion of individual dwellings is a particularly important guardrail.
5. The 2025 MHCLG/Arup Part M research is a particularly relevant contemporary technical source, but its own publication explicitly denies policy/guidance status.
6. Anthropometric measurement/database standards support methodological discipline, not percentile selection.
7. Peer-reviewed stair and home-modification evidence is now seeded with recoverable primary bibliographic identities, but substantive inference remains intentionally deferred.
8. Several evidence families—bathrooms, kitchens, controls, object swept paths, domestic task routes, post-occupancy and burden/counter-evidence—remain explicit later-packet source requirements rather than being filled superficially here.
9. Project hypotheses and preferences remain a separate internal source class with zero automatic external evidential weight.

---

## 11. Rejected shortcuts

- **Build a single source ranking.** Rejected because legal authority, empirical quality and architectural applicability are orthogonal.
- **Fully research every HFI topic in 01B.** Rejected because it would collapse HFI-02/03/04 into one unbounded literature review before scenarios are frozen.
- **Treat BSI/RIBA landing pages as technical source text.** Rejected; metadata is sufficient for registration only.
- **Fill every open evidence family with whatever source is easiest to find.** Rejected; explicit open requirements are more honest and preserve later question-led research quality.
- **Promote the 2025 Part M research directly into project targets.** Rejected; it requires topic-level appraisal and the publisher explicitly distinguishes it from policy/guidance.
- **Use BS 8300-2 as dwelling authority because it is a respected inclusive-design standard.** Rejected because its published scope explicitly excludes individual dwellings.

---

## 12. Authority / architecture / maturity consequences

**None.**

HFI-01B changes no architecture, Reference House geometry, preferred dimension, doctrine, pattern, compiler behaviour, publication content, statutory interpretation or maturity state.

It creates a controlled register and evidence-admission discipline for later HFI work.

### DRW concurrency

Baseline `main` includes DRW-04C, which generated/locked a controlled first-floor publication SVG from existing canonical sources. It changes downstream drawing representation, not the HFI evidence architecture. HFI-01B therefore creates no DRW stale artefact.

### Stale downstream artefacts

**None.**

---

## 13. Exact next packet

**HFI-01C — scenario matrix.**

Freeze representative `person × task × state` scenarios before target derivation so later research cannot cherry-pick a convenient user. Include carrying, occupied hands, temporary impairment, ageing, assistance/care, wet/low-light states and representative object movement.

**HFI-01C is not started by this packet.**
