# HFI-02A — Anthropometry, Reach and Operating Force

**Packet:** HFI-02A  
**Programme:** [`docs/development/human-factors-low-friction-inhabitation-programme.md`](../../docs/development/human-factors-low-friction-inhabitation-programme.md)  
**Execution plan:** [`docs/development/human-factors-low-friction-inhabitation-execution-plan.md`](../../docs/development/human-factors-low-friction-inhabitation-execution-plan.md)  
**Owning issue:** #195  
**Baseline `main`:** `be56783daa3b294721e5da4c0e1788b9563fbeb2`  
**Prior gate:** HFI-01 complete — terminology/scope, evidence architecture, representative scenarios and proportionality method frozen  
**Question:** what body-size, foot-size, reach, grip/dexterity and operating-effort evidence is strong enough to constrain later HFI reasoning, and what percentile/population limitations prevent those observations becoming automatic project dimensions?  
**Boundary:** evidence synthesis and candidate evidence bands only. This packet does **not** set an Ovid's House dimensional target, pass/fail the Reference House, establish preferred stair geometry, set a control mounting range, set a door/window operating-force limit, alter doctrine/patterns, or add compiler proof.

---

## 1. Why this packet exists

The first substantive HFI research packet deals with a dangerous class of evidence: anthropometric tables look precise enough to invite direct design rules.

That shortcut is not defensible.

A percentile is always a statement about:

- one measured variable;
- in one defined population;
- under one measurement definition/posture;
- at one date or survey period;
- with one sampling method;
- for one design direction.

It is not a person.

A 95th-percentile foot length does not imply a 95th-percentile shoulder breadth, stature or reach in the same individual. A 5th-percentile reach value is not a universal control height. Maximum voluntary grip measured on a dynamometer is not an allowable door-handle force. A seated reach measured in one wheeled-mobility-aid study is not an ambulant-adult mounting range.

The purpose of HFI-02A is therefore twofold:

1. establish useful human-variation evidence for later packets; and
2. establish the **inference firewall** that prevents the evidence being misused.

HFI-01 remains controlling:

`person × task × state × route/interface × consequence`

and HFI-01D remains controlling for any later project intervention.

---

# 2. Core anthropometric inference rules

The following rules are binding for later HFI packets unless stronger evidence explicitly supersedes them.

## 2.1 Define the target population before choosing a percentile

An anthropometric value is uninterpretable without its source population.

Later design reasoning must state, as relevant:

- country/geography;
- age range;
- sex stratification where the source uses it;
- disability/mobility-aid inclusion or exclusion;
- survey date/cohort;
- measurement posture;
- clothing/footwear condition;
- device/chair conditions;
- whether the data are measured, scanned, modelled or synthesised.

A percentile imported from a different population remains comparative evidence unless applicability is justified.

## 2.2 Choose the tail by the design direction

There is no general rule that "95th percentile = safer".

Typical directions are:

| Design question | Relevant direction | Why |
|---|---|---|
| clearance / body or object fit | larger relevant dimension | larger envelope is harder to accommodate |
| maximum reachable height/depth for frequent use | lower-reach capability | shorter/lower-reach users govern access |
| minimum reachable boundary | depends on task and posture | low reach can be limited by chair/body/device geometry as well as stature |
| operating force / torque | lower-capability tail | lower strength/dexterity governs operability |
| stair foot-placement interaction | larger foot is one relevant input | but tread use is biomechanical, not foot length alone |
| headroom | taller relevant body/posture | task/posture and movement allowance still matter |

The percentile is selected **after** the task and consequence are known.

## 2.3 A percentile is one variable, not a body archetype

ISO/TR 5716:2025 is especially important here: most real design/environment interactions involve several user attributes simultaneously, and accurate accommodation estimates require multivariate treatment rather than independent univariate percentile cut-offs.

Therefore HFI rejects the fictional constructs:

- “the 5th-percentile person”;
- “the 95th-percentile person”;
- “the average man/woman” as a complete design body;
- one stature value as a proxy for foot length, shoulder breadth, arm reach or strength.

Where several dimensions jointly govern fit, later work should use a multivariate dataset/method, representative boundary cases or explicit scenario testing rather than stacking independent 5th/95th percentile values and pretending the resulting body exists.

## 2.4 5th–95th accommodation is not automatically the HFI ambition

The common 5th–95th shorthand may be useful as an initial reference band, but it does not itself establish:

- the acceptable exclusion rate;
- the correct tail for the task;
- accommodation of disabled users;
- accommodation under temporary impairment;
- a project minimum;
- a safety threshold.

The consequence of disaccommodation matters. HFI-01D governs whether permanent provision for an additional tail is proportionate.

## 2.5 Do not use sex as a capability persona

Many legacy datasets stratify by male/female sex because distributions differ at population level. That may remain useful source metadata.

HFI must not convert that into assumptions such as:

- female = short/weak;
- male = large/strong;
- larger person = better reach in every direction;
- older person = weak or disabled.

The scenario architecture remains capability/body-condition based: `P-LARGE`, `P-SMALL`, `S-DEX`, `S-UPPER`, `S-BAL`, etc.

## 2.6 Measurement condition matters

Anthropometric use must preserve relevant conditions including:

- barefoot versus footwear;
- light clothing versus winter clothing;
- static reach versus functional reach;
- no-trunk-movement versus leaning/extended reach;
- seated posture versus standing;
- one-handed versus two-handed use;
- dry versus wet grip;
- repeated operation versus one maximum voluntary effort;
- clear approach versus oblique/lateral approach;
- wheelchair/mobility-aid geometry and armrest/controller interference.

The design condition should resemble the actual task, not merely the easiest available dataset.

---

# 3. Evidence additions and source applicability

These records extend the HFI-01B evidence architecture for HFI-02A. Each record has one primary HFI-01B class and the mandatory metadata needed to prevent source inflation.

## `HFI-SRC-A01` — ISO 7250-1:2017

- **Source:** ISO 7250-1:2017, *Basic human body measurements for technological design — Part 1: Body measurement definitions and landmarks*.
- **Date/version:** edition 2, August 2017; reviewed and confirmed 2023.
- **Jurisdiction / population:** international measurement method; population must be separately defined by the user/database.
- **Class:** `CONSENSUS-STANDARD`.
- **Authority / status:** current ISO consensus measurement standard; non-statutory unless separately adopted/required.
- **Applicability:** measurement definitions, landmarks and disciplined population comparison for geometric design of places where people work and live.
- **Known limits / nonclaims:** does not choose Ovid's House accommodation percentiles or dimensions.
- **Access state:** ISO metadata/abstract public; full standard licensed.
- **Checked:** 2026-10-18.
- **Canonical location:** https://www.iso.org/standard/65246.html

## `HFI-SRC-A02` — ISO 15535:2023

- **Source:** ISO 15535:2023, *General requirements for establishing anthropometric databases*.
- **Date/version:** edition 4, September 2023.
- **Jurisdiction / population:** international database method; specified population segments are people able to hold ISO 7250-1 measurement postures.
- **Class:** `CONSENSUS-STANDARD`.
- **Authority / status:** current ISO consensus database standard; non-statutory unless separately adopted/required.
- **Applicability:** user-population description, sampling, measurement items and statistics for anthropometric databases using ISO 7250-1 definitions.
- **Known limits / nonclaims:** database methodology is not a dwelling dimensional target; posture eligibility is itself an applicability boundary.
- **Access state:** ISO metadata/abstract public; full standard licensed.
- **Checked:** 2026-10-18.
- **Canonical location:** https://www.iso.org/standard/82541.html

## `HFI-SRC-A03` — ISO/TR 5716:2025

- **Source:** ISO/TR 5716:2025, *Multivariate analysis using anthropometric data and a virtual fit tool*.
- **Date/version:** edition 1, November 2025.
- **Jurisdiction / population:** international design method; target user population must be separately specified and represented in the underlying individual-level data.
- **Class:** `CONSENSUS-STANDARD`.
- **Authority / status:** current ISO Technical Report / consensus-method guidance; non-statutory.
- **Applicability:** fit/accommodation problems involving several anthropometric attributes simultaneously.
- **Known limits / nonclaims:** virtual-fit work requires relevant individual-level measures for a representative population; summary percentiles alone do not reconstruct the joint distribution or produce a project accommodation target.
- **Access state:** ISO abstract and parts of online browsing text public; full publication licensed.
- **Checked:** 2026-10-18.
- **Canonical location:** https://www.iso.org/standard/81577.html

## `HFI-SRC-A04` — SizeUK national sizing survey

- **Source:** SizeUK UK National Sizing Survey / public SizeUK information documentation.
- **Date/version:** data collection began 2001; results/data programme released in the early 2000s, with public information documents subsequently maintained by the data holders.
- **Jurisdiction / population:** UK adult population; more than 11,000 participants, approximately balanced male/female sample, standing and seated scans, broad adult age range, recruitment structured across UK regions and demographic variables.
- **Class:** `GOVERNMENT-RESEARCH`.
- **Authority / status:** UK-government-funded collaborative national survey with retailers, academics and technology partners; empirical evidence, not policy/guidance; detailed dataset access commercially controlled.
- **Applicability:** large-scale UK body-size/shape evidence and demonstration of multivariate body-shape variability.
- **Known limits / nonclaims:** roughly quarter-century-old data; clothing/sizing survey rather than dwelling-use experiment; detailed percentile extraction requires controlled dataset access; children excluded; scanner/manual definitions must be checked before mixing with other sources.
- **Access state:** survey information publicly accessible; detailed database licensed/commercial.
- **Checked:** 2026-10-18.
- **Canonical information:** https://www.size.org/SizeUKInformationV8.pdf

## `HFI-SRC-A05` — CIEHF Design for Everybody

- **Source:** Chartered Institute of Ergonomics & Human Factors, *Design for Everybody* project/resource.
- **Date/version:** project data collection April 2020–March 2021; resource status checked 2026-10-18.
- **Jurisdiction / population:** international volunteer project; more than 300 online responses, not a representative UK probability sample.
- **Class:** `EXPERT-GUIDANCE`.
- **Authority / status:** professional human-factors resource; non-statutory.
- **Applicability:** evidence/guidance that designers need current, diverse body-size data and that stale/narrow source populations can exclude users.
- **Known limits / nonclaims:** the project's online sample is not used here as a UK dimensional dataset or basis for target percentiles.
- **Access state:** public CIEHF resource.
- **Checked:** 2026-10-18.
- **Canonical location:** https://ergonomics.org.uk/design-for-everybody.html

## `HFI-SRC-A06` — Dodds et al. 2014 British grip-strength data

- **Source:** Dodds RM et al., *Grip Strength across the Life Course: Normative Data from Twelve British Studies*, PLOS ONE 9(12): e113637.
- **Date/version:** published 4 December 2014.
- **Jurisdiction / population:** Great Britain general-population studies; 49,964 participants, 60,803 observations, ages 4–90+.
- **Class:** `PEER-REVIEWED-EMPIRICAL`.
- **Authority / status:** peer-reviewed pooled individual-level empirical research; non-statutory.
- **Applicability:** population variation and life-course change in maximal handgrip capability.
- **Known limits / nonclaims:** cross-sectional centiles; clinical dynamometer grip task; mixed measurement protocols; recognised determinants such as height not included in the main centile model; **not directly convertible into door/window/control operating forces**.
- **Access state:** full open-access article.
- **Checked:** 2026-10-18.
- **DOI:** https://doi.org/10.1371/journal.pone.0113637

## `HFI-SRC-A07` — 2025 published MHCLG / Arup Part M research

- **Source:** *Access to and use of buildings: research on demographic and ergonomic requirements*, Ove Arup & Partners for government.
- **Date/version:** final report R02 dated 2 November 2022; published by MHCLG 28 October 2025.
- **Jurisdiction / population:** England accessibility research; literature/qualitative/experimental work, with experimental studies particularly involving disabled people and wheeled mobility-aid users.
- **Class:** `GOVERNMENT-RESEARCH`.
- **Authority / status:** government-commissioned research; GOV.UK explicitly states findings/recommendations do **not** represent government policy or guidance.
- **Applicability:** seated/wheeled-aid reach; door/window/handle force; approach/posture effects; evidence gaps relevant to HFI.
- **Known limits / nonclaims:** not statutory guidance; some force analyses combined participant groups because the ambulant-disabled sample was too small; several topics carry explicit further-research recommendations.
- **Access state:** full report and appendices publicly accessible on GOV.UK.
- **Checked:** 2026-10-18.
- **Canonical location:** https://www.gov.uk/government/publications/access-to-and-use-of-buildings-research-on-demographic-and-ergonomic-requirements

## `HFI-SRC-A08` — PeopleSize 2008

- **Source:** PeopleSize 2008 anthropometric database/software reference, Open Ergonomics / associated commercial dataset lineage.
- **Date/version:** 2008 edition referenced in the current evidence corpus.
- **Jurisdiction / population:** compiled anthropometric source drawing on multiple underlying datasets; exact population depends on selected PeopleSize population/user group.
- **Class:** `EXPERT-GUIDANCE`.
- **Authority / status:** proprietary/commercial compiled anthropometric reference; non-statutory and not treated here as peer-reviewed primary population research.
- **Applicability:** legacy body/foot/reach dimensions, arbitrary-percentile exploration and source comparison where exact population/measurement provenance is retained.
- **Known limits / nonclaims:** source surveys/dates vary; compiled values do not become current UK national statistics merely because software exposes a percentile; full provenance must be recovered before target use.
- **Access state:** commercial/proprietary; selected values are reported secondarily in standards/research literature.
- **Checked:** 2026-10-18.

## `HFI-SRC-A09` — Bodyspace, 3rd edition

- **Source:** Stephen Pheasant and Christine M. Haslegrave, *Bodyspace: Anthropometry, Ergonomics and the Design of Work*, 3rd edition.
- **Date/version:** 2006.
- **Jurisdiction / population:** expert anthropometric compilation with British and other source datasets; population varies by table/source.
- **Class:** `EXPERT-GUIDANCE`.
- **Authority / status:** established ergonomics reference text; non-statutory.
- **Applicability:** anthropometric design method and legacy comparative body-dimension values.
- **Known limits / nonclaims:** source data include older surveys; table values require the exact measurement/population citation; not a current UK national survey and not a direct dwelling target source.
- **Access state:** commercial book; selected material quoted/reproduced in secondary professional literature.
- **Checked:** 2026-10-18.

## `HFI-SRC-A10` — Gilbertson & Barber-Lomax 1994 power/pinch grip study

- **Source:** Louise Gilbertson and Sarah Barber-Lomax, *Power and Pinch Grip Strength Recorded Using the Hand-Held Jamar® Dynamometer and B+L Hydraulic Pinch Gauge: British Normative Data for Adults*, British Journal of Occupational Therapy 57(12):483–488.
- **Date/version:** December 1994.
- **Jurisdiction / population:** 260 adults (130 men, 130 women), ages 15–92, Cambridgeshire.
- **Class:** `PEER-REVIEWED-EMPIRICAL`.
- **Authority / status:** peer-reviewed occupational-therapy empirical study; non-statutory.
- **Applicability:** demonstrates that power, tip, tripod and lateral pinch are distinct grip capabilities and vary with age/sex in the sampled population.
- **Known limits / nonclaims:** small regional, old sample; restricted full text; not a current national force dataset and not a hardware operating-force standard.
- **Access state:** abstract/metadata public; full article restricted.
- **Checked:** 2026-10-18.
- **DOI:** https://doi.org/10.1177/030802269405701209

---

# 4. Body size and shape: what the evidence permits

## 4.1 Stature is useful context, not a design proxy

Common British sources themselves demonstrate dataset dependence. Legacy Bodyspace/CIEHF examples and SizeUK summaries place central adult stature in broadly similar but not identical ranges, differing by several centimetres depending on source, survey period and definition.

That is useful population context and almost useless as a substitute for the dimensions HFI actually needs.

A person's:

- arm reach;
- shoulder breadth;
- hip breadth;
- hand size;
- foot length;
- grip capability;
- seated eye/shoulder height;
- device envelope

cannot responsibly be inferred from stature alone for design acceptance.

**HFI finding A-BODY-01:** later packets must use the dimension(s) that actually constrain the task. Stature may describe a population but does not become a universal scale factor.

## 4.2 Body shape is multivariate

SizeUK's value is partly methodological: thousands of scanned people with many measurements show why “average dimensions” do not describe one average body shape.

ISO/TR 5716:2025 formalises the same problem. If corridor/corner usability depends on shoulder breadth + depth + arm position + carried object, or bathroom use depends on seated geometry + reach + chair dimensions, independent percentile tables can misstate actual accommodation.

**HFI finding A-BODY-02:** use multivariate or scenario-based accommodation when several dimensions interact materially. Do not construct a synthetic extreme body by combining unrelated 95th-percentile dimensions.

## 4.3 Population currency matters

SizeUK is substantially newer than mid-century British surveys but was collected in the early 2000s. CIEHF's Design for Everybody work explicitly identifies the continuing need for more current and diverse anthropometric data.

**HFI finding A-BODY-03:** source age is an evidence limitation, especially for dimensions affected by secular/population change. Vintage does not automatically invalidate a dataset, but later target derivation must not call a historical table “current UK population” without qualification.

---

# 5. Foot size and the stair trigger

The original HFI trigger included large-foot users experiencing shallow treads as a repeated attention/placement burden. HFI-02A can now bound the anthropometric part of that claim but **cannot resolve the stair question**.

## 5.1 Legacy UK reference band

Across legacy British PeopleSize/Bodyspace-derived sources, bare-foot length estimates place the lower adult female tail at roughly **220 mm** and the upper adult male tail around **287–290 mm** in some commonly cited 5th/95th-percentile tables.

Other older British compilations report materially different tail values, demonstrating the sensitivity to source vintage, sample and measurement definition.

Therefore this is recorded only as:

> **candidate UK legacy bare-foot reference envelope: approximately 220 mm to approximately 290 mm across commonly cited lower/upper adult tails; source-dependent, not an HFI design range.**

This is deliberately not a new stair-going proposition.

## 5.2 Why foot length does not equal tread depth

The stair interaction also depends on:

- footwear length and sole geometry;
- ascent versus descent;
- foot angle/yaw on the tread;
- heel/toe overhang strategy;
- going, rise and pitch together;
- nosing geometry;
- handrail/support use;
- gait and step sequencing;
- visual conditions;
- carrying/occupied hands;
- larger body geometry beyond the foot alone.

A 290 mm bare foot does **not** imply “290 mm minimum going”, and a 280 mm going does not pass merely because it approaches a foot-length statistic.

**HFI finding A-FOOT-01:** foot-length distribution is a required input to HFI-02B, not a stair target.

## 5.3 Footwear must be explicit

Domestic stair use occurs barefoot, socked, in slippers and in shoes/boots. A project rule intended to support ordinary arrival/departure and upper-floor movement cannot silently assume the smallest condition.

**HFI finding A-FOOT-02:** HFI-02B must distinguish bare-foot anthropometry from the actual shod-use envelope and must state any footwear allowance rather than hiding it inside a percentile.

---

# 6. Reach: static anatomy is not functional access

Reach evidence is especially vulnerable to misuse because a mounting height can look like a one-dimensional problem.

## 6.1 Reach must name the task and posture

Relevant distinctions include:

- standing versus seated;
- front versus side approach;
- vertical versus horizontal reach;
- comfortable/no-trunk-movement versus extended/leaning reach;
- precision/manipulation versus touch/contact;
- clear approach versus obstruction/reveal/countertop;
- wheelchair/mobility-aid armrest/control geometry;
- one-hand use;
- repeated versus exceptional reach.

For frequent or precision operation, “can touch if leaning/stretching” is a poor default definition of usability.

**HFI finding A-REACH-01:** later control design must distinguish **comfortable operational reach** from **extended maximum reach**.

## 6.2 2025 published wheeled-mobility-aid reach study

The MHCLG/Arup experimental study provides useful current disabled-user observations. It deliberately distinguishes reach with and without trunk movement.

Selected observations include:

- overhead/raised-arm reach distributions extending from about **1210 mm at the 5th percentile** to **1840 mm at the 95th percentile** in the relevant wheeled-mobility-aid sample;
- lateral side-reach, no trunk movement, vertical-height observations of about **710 mm (5th)**, **1015 mm (50th)** and **1180 mm (95th)**;
- lateral side-reach, no trunk movement, horizontal observations of about **298 mm (5th)**, **525 mm (50th)** and **700 mm (95th)** in the relevant test configuration.

These are **study observations, not an Ovid's House control band**.

The sample/task is not the whole dwelling population; dimensions vary by approach; device geometry matters; and the report itself identifies further research needs including ambulant-disabled populations and obstructed/countertop reach.

**HFI finding A-REACH-02:** wheelchair/wheeled-aid reach must not be represented by standing anthropometry scaled downward. Person + posture + mobility device + approach geometry form one interaction.

## 6.3 Shorter/smaller ambulant users remain a separate evidence need

The government study is valuable for disabled/wheeled-aid interaction but does not eliminate the need for ordinary ambulant lower-reach evidence.

HFI-01C `P-SMALL` remains necessary independently of `P-WC`.

**Gap A-REACH-G01:** later HFI-04C/06C target work should seek strong current ambulant functional-reach data before setting an Ovid's House mounting envelope. HFI-02A does not promote the current RH-09 `450–1200 mm AFFL` band from inherited guidance into project doctrine.

---

# 7. Grip, dexterity and strength

## 7.1 Strength varies materially across the population and life course

Dodds et al. pool 60,803 grip observations from 49,964 participants in 12 British general-population studies across ages 4–90+.

Their source-stratified medians show a clear life-course pattern:

- increase through childhood/adolescence;
- early-adult peak;
- broad maintenance through midlife;
- decline thereafter.

In the paper's sex-stratified data, peak median dynamometer grip was approximately **51 kg** in males and **31 kg** in females. By age 80, around one quarter of participants met the paper's clinical definition of weak grip using its 2.5-SD threshold.

The design conclusion is **not** that a house should be designed to a kilogram value.

The useful conclusion is that a fixed interface calibrated casually around a healthy young-adult maximum will systematically overestimate capability across a real lifetime population.

**HFI finding A-FORCE-01:** low operating effort is supported by population variation and life-course evidence, but maximal grip data must not be mechanically translated into hardware force limits.

## 7.2 Grip type matters

Dynamometer power grip, tip pinch, tripod pinch, lateral/key pinch, wrist torque, downward lever force, pushing and pulling are different biomechanical actions.

Gilbertson & Barber-Lomax directly measured four distinct grips in a British adult sample; the government force experiment separately shows strong action/posture differences in push, pull and downward force.

**HFI finding A-FORCE-02:** no single “hand strength” number may authorise doors, windows, knobs, keys, taps and controls as one class. Later packets must use task-matched evidence.

## 7.3 Repetition and posture matter

A one-off maximum voluntary effort is not a good target for a frequently used domestic interface.

Later design should distinguish:

- maximum capability;
- comfortable/repeatable operation;
- one-handed use;
- awkward/lateral posture;
- wet/slippery grip;
- reduced dexterity;
- occupied opposite hand;
- need for simultaneous pushing/pulling and latch operation.

**HFI finding A-FORCE-03:** the design objective is not merely “below maximum possible force”. Repeated domestic controls should avoid demanding near-limit exertion or compound grip + posture + balance compensation.

---

# 8. Task-specific operating-force evidence

## 8.1 2025 published door/window force experiment

The MHCLG/Arup study tested push, pull and downward handle forces with anterior/front and lateral/side approaches. Its report treats the 5th percentile as the lower capability tail of interest for accommodation.

Reported 5th-percentile forces were:

| Test action | 5th-percentile observed force |
|---|---:|
| anterior push | **16.7 N** |
| anterior pull | **25.3 N** |
| anterior downward handle force | **18.7 N** |
| lateral push | **16.8 N** |
| lateral pull | **29.8 N** |
| lateral downward handle force | **36.0 N** |

For comparison, the same dataset's 50th-percentile observations were materially higher (for example 60.0 N anterior push and 93.5 N anterior pull), demonstrating the breadth of capability distribution.

The report notes that the anterior downward 5th-percentile result suggests handle operation should not exceed 18.7 N in that tested condition, while also recommending further work.

## 8.2 Why HFI does not adopt those numbers now

The study itself records important limitations:

- COVID-era research changes affected data collection;
- the ambulant-disabled sample was too small for the intended separate force analysis;
- participant groups were combined for the force analysis;
- test handle height/configuration was fixed;
- anterior and lateral posture produced different capability;
- the authors call for a larger ambulant-disabled sample and further handle-profile research.

Therefore:

> **16.7 / 25.3 / 18.7 / 16.8 / 29.8 / 36.0 N are candidate task-specific research observations, not Ovid's House force limits.**

They are strong enough to reject the assumption that common door-guidance maxima automatically represent low-friction operation for the lower-capability tail.

They are not strong enough, alone, to freeze a universal house value.

**HFI finding A-FORCE-04:** HFI-04B should synthesise this experiment with dwelling-specific guidance, hardware mechanics, repeated operation, approach geometry, latch/closer interaction and other empirical evidence before HFI-06C considers a project value.

## 8.3 Approach geometry is part of force capability

The force table varies substantially between anterior and lateral conditions. This means the architecture around a door/window can influence effective operability even where the hardware is unchanged.

A nominal low-force handle may still perform poorly if a wall return, furniture, wheelchair position or door swing forces an awkward approach.

**HFI finding A-FORCE-05:** operating-force review must include approach/posture and sequence, not a hardware datasheet value in isolation.

---

# 9. Dexterity and manipulation

HFI-02A finds enough evidence to establish the method but not enough to create one universal torque/knob target.

Relevant interface variables include:

- required pinch versus power grip;
- knob diameter/profile;
- smooth versus ridged/slip-resistant surface;
- wrist rotation/ulnar-radial deviation;
- simultaneous push-and-turn or pull-and-turn actions;
- key insertion/alignment;
- visual/tactile feedback;
- wet hands;
- glove use where plausible;
- one-handed stabilisation.

The 2025 government report's source review and PeopleSize summaries include wrist-twist/ridged-knob torque evidence, but the underlying evidence base is smaller and less population-robust than the British grip-strength data.

**HFI finding A-DEX-01:** later HFI should prefer interface forms that reduce dependence on fine pinch, high wrist torque and simultaneous compound actions where the architectural choice can do so cheaply; numeric torque limits require task-specific synthesis in HFI-04B/04C.

---

# 10. Candidate evidence bands — explicitly not targets

This table exists to prevent later packets having to rediscover the evidence while also preventing premature design adoption.

| Evidence family | Candidate observation/band | Confidence / limitation | Later owner |
|---|---|---|---|
| UK adult bare-foot length | legacy lower/upper adult tails roughly **220–290 mm** across commonly cited British compilations | `E-LOW/MODERATE` for modern target use; source-vintage/definition dependent; footwear excluded | 02B |
| general British maximal grip | peak medians about **51 kg male / 31 kg female** in Dodds et al.; large age distribution and later-life decline | `E-HIGH` for population variation/life-course mechanism; **not operating-force target** | 04B / 04C |
| wheeled-aid lateral vertical reach, no trunk movement | approx **710 / 1015 / 1180 mm** at 5th/50th/95th in study condition | `E-MODERATE`; specific disabled/wheeled-aid sample and geometry | 04A / 04C |
| wheeled-aid lateral horizontal reach, no trunk movement | approx **298 / 525 / 700 mm** at 5th/50th/95th | `E-MODERATE`; configuration-specific | 04A / 04C |
| wheeled-aid raised-arm reach | approx **1210–1840 mm** 5th–95th in study condition | `E-MODERATE`; not frequent-control range | 04C |
| anterior push force | **16.7 N** 5th-percentile experimental observation | `E-MODERATE`; sample/configuration limits | 04B |
| anterior pull force | **25.3 N** 5th-percentile experimental observation | `E-MODERATE`; sample/configuration limits | 04B |
| anterior downward handle force | **18.7 N** 5th-percentile experimental observation | `E-MODERATE`; source suggests relevance but further research requested | 04B |
| lateral push/pull/down | **16.8 / 29.8 / 36.0 N** 5th-percentile observations | `E-MODERATE`; demonstrates posture/action sensitivity | 04B |

**None of these values is an Ovid's House minimum, maximum or target.**

HFI-06 owns target architecture only after HFI-02 through HFI-05 complete.

---

# 11. Scenario application map

HFI-02A provides evidence inputs to the frozen HFI-01C scenarios without judging the Reference House.

| Scenario | 02A evidence contribution | Still unresolved here |
|---|---|---|
| `HFI-SC-MOV-01` larger-foot stair use | foot-length variation is real; larger-foot condition must be represented | tread biomechanics, footwear, going/rise/pitch, descent behaviour → 02B |
| `HFI-SC-MOV-02` smaller adult stair/rail | body/reach tails cannot be inferred from average stature | rail/stair geometry → 02B |
| `HFI-SC-USE-01` shorter adult frequent controls | lower comfortable reach matters; task/approach must be defined | control mounting/sequence → 04C |
| `HFI-SC-USE-03` one-hand door operation | maximum grip is wrong metric; action/compound operation matters | door/hardware synthesis → 04B |
| `HFI-SC-USE-04` reduced dexterity door/window | grip type, torque and posture materially matter | hardware target → 04B |
| `HFI-SC-USE-06` smaller adult bath controls | functional reach + stable posture matter more than height alone | bath hazard/sequence geometry → 04A |
| `HFI-SC-USE-11` smaller adult storage | reach direction, obstruction and frequency matter | fixed storage/work-zone architecture → 04D |
| `HFI-SC-USE-13` temporary upper-limb impairment | one-side/one-hand capability cannot be represented by bilateral maximum | interface sequence/force → 04B/04C |
| `HFI-SC-ARR-02`, `USE-08` wheelchair use | person + chair/device + approach + functional reach must be treated jointly | route/transfer/fixed-use geometry → 03A/04A |

No scenario receives a PASS/FAIL in HFI-02A.

---

# 12. Rejected hypotheses and shortcuts

The following are rejected by HFI-02A.

## `RHYP-02A-01` — “Design to the 95th percentile” is a sufficient rule

**Rejected.** Design direction, population, consequence and multivariate interaction determine the relevant tail and accommodation strategy.

## `RHYP-02A-02` — a 95th-percentile person exists as one useful body model

**Rejected.** Percentiles apply to variables; multivariate accommodation requires joint data or representative fit methods.

## `RHYP-02A-03` — stature is a sufficient proxy for body fit

**Rejected.** Reach, breadth, depth, hand, foot and strength vary independently enough to require task-relevant measures.

## `RHYP-02A-04` — bare-foot length can directly set stair going

**Rejected.** Foot length is one input; the stair is a gait/biomechanics/geometry system. HFI-02B owns the synthesis.

## `RHYP-02A-05` — maximum grip strength can set domestic hardware force

**Rejected.** Grip dynamometry, door push/pull, lever depression, pinch, torque and repeated one-handed operation are different tasks.

## `RHYP-02A-06` — one seated reach range can set all house controls

**Rejected.** Standing/seated, front/side, comfortable/extended, obstruction, precision and device geometry materially change functional reach.

## `RHYP-02A-07` — age can stand in for capability

**Rejected.** Population-level decline is real, but an older-person label must not automatically import weakness, reduced dexterity or disability.

## `RHYP-02A-08` — sex-stratified population tables should become sex-specific house rules

**Rejected.** Source stratification can reveal distribution differences; HFI design scenarios remain body/capability based.

## `RHYP-02A-09` — the current 450–1200 mm RH-09 accessory/control band is validated by 02A

**Rejected.** It remains a current inherited-guidance fact. HFI-04C and HFI-06C must evaluate sequence, reach, task frequency and population evidence before any project target is formed.

## `RHYP-02A-10` — the 2025 government experimental force values are ready-made Ovid's House limits

**Rejected.** They are high-value task-specific evidence with acknowledged sample/configuration limitations; synthesis is still required.

---

# 13. Evidence gaps that later packets must preserve

HFI-02A does **not** hide the following gaps:

1. **current open UK foot distribution:** no sufficiently current, openly accessible national foot-length/width dataset was recovered that is strong enough to displace the legacy reference band;
2. **footwear allowance:** later stair work needs an explicit shod-use treatment rather than assuming bare foot;
3. **ambulant functional reach:** stronger current task-specific evidence is needed before an Ovid's House control-height envelope is justified;
4. **domestic repeated operating force:** more task-specific evidence is needed for doors/windows/hardware under repeated real domestic use rather than maximum laboratory exertion;
5. **pinch/torque/dexterity:** evidence is more fragmented than power-grip data and must be matched to actual hardware action;
6. **combined-state effects:** wet hands, one-handed operation, fatigue and awkward approach can compound capability loss, but HFI must not invent multipliers without evidence;
7. **children:** HFI-02A does not derive child-specific control/stair targets; age-appropriate tasks require their own evidence where later decisions depend on them;
8. **wheelchair diversity:** one wheeled-mobility-aid sample cannot represent all manual/powered/attendant devices and user postures;
9. **multivariate individual-level data:** strong summary tables may still be insufficient for precise joint accommodation estimates.

A gap is not permission to use the current Reference House value as default truth.

---

# 14. Handoffs

## HFI-02B — stairs and falls

Carry forward:

- larger-foot/body variation;
- legacy foot-length reference envelope with low/moderate modern-target confidence;
- explicit footwear requirement;
- rejection of foot-length = going;
- need to study rise, going, pitch, descent, nosing, landings, handrails, headroom, lighting/contrast and carrying as one system.

## HFI-02C / 02D

Carry forward:

- capability changes cannot be reduced to age;
- temporary impairment/carrying states should modify task capability rather than create permanent personas;
- support/operability under one-hand and reduced-attention states still requires task research.

## HFI-03A

Carry forward:

- multivariate fit rule for body + turning + assistance;
- body breadth/shape cannot be reduced to stature;
- route fit requires effective geometry after interfaces/objects.

## HFI-04A

Carry forward:

- comfortable functional reach versus extended reach;
- wheelchair/device + approach geometry;
- stable posture/hazard-zone logic for bath/shower use.

## HFI-04B

Carry forward:

- exact 2025 experimental door/window force observations and limitations;
- grip-action distinctions;
- approach/posture effects;
- need to treat latch/lock/closer/door movement as a sequence rather than one force value.

## HFI-04C

Carry forward:

- current RH-09 `450–1200 mm` is not validated by 02A;
- frequent/precision controls should normally be evaluated against comfortable functional reach rather than maximum extended reach;
- standing/seated and shorter/wheeled-aid conditions remain separate evidence paths.

## HFI-04D

Carry forward:

- obstruction/countertop reach cannot be inferred from free-space reach;
- fixed storage should be frequency-sensitive and not designed from average stature alone.

## HFI-06

Carry forward the percentile firewall:

> A project target may use a percentile only when the target population, measurement definition, design direction, scenario/consequence and proportionality rationale are explicit.

---

# 15. Red-team of HFI-02A

Before closeout, the packet was attacked for the following errors.

### False precision

**Control:** legacy foot values are kept approximate and source-bounded; current experimental values retain their task/sample context; no final dimension is derived.

### Percentile worship

**Control:** design direction and consequence precede percentile choice; 5th/95th is a reference convention, not project doctrine.

### Synthetic extreme body

**Control:** ISO/TR 5716 multivariate principle explicitly prevents stacking independent extremes into one fictional person.

### Able-bodied default

**Control:** current disabled/wheeled-aid reach and force evidence is included separately rather than scaled from general anthropometry.

### Disability bundling

**Control:** a wheelchair user is not assumed weak; an older user is not assumed impaired; strength/reach states stay distinct.

### Sex stereotyping

**Control:** sex-stratified source data remain descriptive evidence, not user personas or house rules.

### Strength-to-force category error

**Control:** dynamometer grip is evidence of population variation, not a door/window force limit.

### Current-house anchoring

**Control:** current stair going, stair width and RH-09 control band receive no incumbency advantage and no pass/fail result.

### Standards/guidance conflation

**Control:** ISO methods, government research, expert guidance and project evidence retain HFI-01B source classes and authority limits.

### Evidence-gap concealment

**Control:** current UK foot data, ambulant functional reach, repeated domestic hardware operation and dexterity/torque gaps remain explicit.

---

# 16. Findings and authority consequences

## Findings

1. Anthropometry is task- and population-specific; a percentile has no design meaning without direction and applicability.
2. A single “5th/95th percentile person” is invalid for multivariate fit; joint accommodation requires multivariate or scenario-based treatment.
3. Foot-size variation is material enough to carry into stair research, but foot length alone cannot determine stair going.
4. Comfortable functional reach and extended reach are different design conditions; frequent controls should not casually depend on maximum stretch/lean.
5. Wheeled-mobility-aid reach is an interaction among person, posture, device and approach geometry, not a scaled standing-body problem.
6. British grip evidence strongly supports life-course/population variation in capability but does not translate directly to domestic operating-force limits.
7. Current government experimental force evidence shows that lower-tail push/pull/lever capability can be materially below common guidance forces in some tested actions; task-specific synthesis remains necessary.
8. Operating effort must be reviewed with grip type, posture, approach, repetition, one-handed use and interface sequence.
9. Existing Reference House dimensions/control bands remain unjudged.

## Architectural / maturity consequences

**None.**

This packet creates research constraints and handoffs only. It does not alter the Reference House, governing principles, patterns, compiler or maturity state.

## Stale downstream artefacts

**None.**

No accepted architectural change exists to stale DRW/publication/computational outputs.

## Exact next packet

**HFI-02B — stairs and fall risk.** Not started by HFI-02A.
