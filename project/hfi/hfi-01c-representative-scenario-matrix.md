# HFI-01C — Representative Scenario Matrix

**Packet:** HFI-01C  
**Programme:** [`docs/development/human-factors-low-friction-inhabitation-programme.md`](../../docs/development/human-factors-low-friction-inhabitation-programme.md)  
**Execution plan:** [`docs/development/human-factors-low-friction-inhabitation-execution-plan.md`](../../docs/development/human-factors-low-friction-inhabitation-execution-plan.md)  
**Owning issue:** #195  
**Baseline `main`:** `e61e0199cfc50f9afca0653cda5712a647a01819`  
**Prior packets:** HFI-01A terminology + scope; HFI-01B normative/evidence register  
**Question:** what representative people, tasks and states must later HFI research test before any target or Reference House judgement can be derived?  
**Boundary:** scenario architecture only. This packet creates no design target, preferred dimension, defect finding, statutory interpretation or Reference House correction.

---

## 1. Purpose

The HFI methodological spine is:

`person × task × state × route/interface × consequence`

HFI is not allowed to select a dimension first and invent a user afterwards. This packet therefore freezes representative scenarios **before** anthropometry, stair, circulation, threshold, object-route, controls, bathroom, kitchen or adaptability work derives any candidate target.

The matrix exists to:

1. force later research to identify **who is doing what** rather than reason from abstract accessibility language;
2. expose materially different interactions caused by body variation, carrying, temporary impairment, assistance and degraded states;
3. prevent one idealised able-bodied adult becoming the hidden default occupant;
4. prevent the opposite error of one overloaded “vulnerable user” persona bundling unrelated impairments together;
5. expose assumptions about who performs housework, childcare and care.

The set is intentionally bounded. It is not the Cartesian product of every person, task and state. Later packets may add a scenario only when evidence reveals a genuinely distinct interaction that this set cannot test.

---

## 2. Scenario construction rules

### 2.1 Scenario, not persona

A scenario is a specific interaction, not a fictional biography. HFI needs only the human characteristics that materially affect the task.

Useful:

> larger-foot adult × descend stair × ordinary dry state × stair/landing × foot-placement/attention consequence

Not useful without evidence:

> “large older father with bad knees.”

### 2.2 Attributes do not imply deficits

The following rules are binding:

- `older occupant` does not automatically mean weak, slow, cognitively impaired or mobility-aid using;
- `wheelchair user` does not automatically mean reduced upper-body capability or assistance need;
- `shorter/smaller` does not imply child;
- `larger/taller` does not imply reduced mobility;
- pregnancy does not imply pathology;
- a child is not a proxy for cognitive or sensory impairment;
- temporary lower-limb and upper-limb impairment are separate states;
- sensory/cognitive variation is added only where perception, comprehension or feedback genuinely affect the interaction;
- assistance is represented as a two-person interaction, not as proof of permanent dependence.

### 2.3 HFI categories remain distinct

Scenario tags are:

- `V` — visitability;
- `O` — ordinary usability;
- `A` — adaptability/life-course;
- `W` — wheelchair usability;
- `E` — equivalent/dignified use.

These are research tags, not statutory categories. `V`, `O` and `W` are not aliases for M4(1), M4(2) or M4(3).

### 2.4 Degraded states are selective stressors

The house should first work in ordinary conditions, then remain robust under representative degraded states where consequence justifies testing. HFI does **not** require every interface to be optimised simultaneously for low light, wet hands, fatigue, distraction and temporary injury.

### 2.5 Consequence is part of the scenario

A scenario is incomplete unless it names what may matter: additional attention, altered foot/body placement, contortion/repositioning, reach/grip/force, route detour, object rotation/staging, collision/fall/hazard exposure, avoidable dependence, exclusion from principal use, task failure or disproportionate retrofit burden.

The matrix does not assume those consequences occur. It identifies what later packets must test.

---

## 3. Person primitives

These are research primitives, not target percentiles or occupant archetypes.

| Code | Person condition | Purpose | Do not infer |
|---|---|---|---|
| `P-REF` | adult within broadly common body/capability range | ordinary reference interaction | “normal” or only important user |
| `P-LARGE` | larger/taller adult, including larger foot/body envelope where relevant | clearance, foot placement, turning, reach/object handling | fixed percentile or automatic minimum |
| `P-SMALL` | smaller/shorter adult | reach, sightline, leverage and interface placement | child-like capability |
| `P-OLDER` | older adult without bundled impairment assumptions | age-related evidence where age/population itself matters | weakness, disability or cognitive impairment |
| `P-CHILD` | child performing age-appropriate independent domestic action | stair/route/control use | specialist safeguarding scope |
| `P-WC` | wheelchair user | complete route, turning, transfer, fixed-use questions | whole-dwelling compliance or upper-body limitation |
| `P-MOB` | person using a representative mobility aid | aid route/support interaction | one device representing all devices |
| `P-DYAD` | two people moving/operating together, one assisting the other | assistance/care geometry | permanent dependency |

Pregnancy, temporary impairment, occupied hands and similar conditions are state modifiers because they may apply to otherwise different people.

---

## 4. State modifiers

| Code | State | Research purpose |
|---|---|---|
| `S-NOM` | rested, dry, ordinary light, both hands available | reference condition |
| `S-LOWER` | temporary lower-limb impairment / reduced comfortable lower-limb function | stairs, thresholds, bathing, life-course robustness |
| `S-UPPER` | temporary upper-limb impairment | asymmetric reach, door/hardware/control operation |
| `S-ONEHAND` | only one hand practically available | controls, doors, carrying sequences |
| `S-HANDS` | both hands occupied/encumbered | doors, routes, stairs, groceries, laundry, childcare |
| `S-DEX` | reduced grip/dexterity | handles, locks, windows, controls |
| `S-BAL` | reduced balance/stability | stairs, wet rooms, thresholds, assistance |
| `S-PREG` | pregnancy affecting turning, bending, balance or carrying tolerance without assuming pathology | stairs, bathrooms, storage, route robustness |
| `S-WET` | wet hands and/or wet local floor where task plausibly creates it | bathroom/kitchen control and slip/hazard sequences |
| `S-FAT` | fatigue | stair/route attention and repeated-task burden |
| `S-LOWLIGHT` | plausible low domestic light | route/edge/control legibility; not emergency lighting |
| `S-VIS` | reduced visual acuity/contrast sensitivity without diagnosis-specific assumptions | edge, route and control legibility |
| `S-PROC` | reduced processing/working-memory reserve without diagnosis-specific assumptions | route/control comprehension and feedback |
| `S-DIST` | ordinary distraction/divided attention | childcare, carrying, repeated movement |
| `S-UNFAM` | unfamiliar with building/learned control mapping | guest route/control legibility |
| `S-ASSIST` | assisted movement/use by a second person | two-body envelope and coordination |

These states are capability/task based. Later evidence may refine them but may not silently convert them into diagnoses.

---

## 5. Task families

| Code | Task family | Examples |
|---|---|---|
| `T-ARR` | arrive / enter / leave | approach, entrance, guest arrival |
| `T-HMOVE` | horizontal movement | corridor, door, corner, passing |
| `T-STAIR` | vertical movement | ascent, descent, landing, assistance |
| `T-SAN` | sanitary/bathing/dressing | WC, shower, bath, dressing, assistance |
| `T-CTRL` | fixed control/hardware | lighting, heating, ventilation, shade, shower control, latch/lock/window |
| `T-KIT` | fixed kitchen/storage use | appliance access, hot/wet sequence, storage reach |
| `T-HOUSE` | repeated housework/logistics | groceries, laundry, waste, cleaning |
| `T-CARE` | childcare/caregiving | carrying child, assisting another person |
| `T-OBJ` | large/awkward object movement | sofa, mattress, appliance, pram, mobility device |
| `T-ADAPT` | future adaptation | entrance-level sleeping/bathing, stair-lift/lift/support provision |

Loose furniture styling/layout remains outside HFI. `T-OBJ` asks whether persistent architecture makes foreseeable movement materially difficult.

---

## 6. Route/interface families

| Code | Route/interface |
|---|---|
| `R-APP` | real-site approach / arrival edge |
| `R-ENT` | principal entrance + threshold |
| `R-GRND` | ground-floor principal circulation |
| `R-UPPER` | upper-floor principal circulation / turns / landings |
| `R-STAIR` | stair flights + landings |
| `R-GARD` | internal-to-garden/courtyard route + threshold |
| `R-DOOR` | doors, latches, locks, handles, leaves |
| `R-WIN` | operable windows |
| `R-WC` | entrance-level WC |
| `R-BATH` | bathroom / shower / bath / dressing interface |
| `R-KIT` | kitchen / fixed storage / appliance interface |
| `R-CTRL` | fixed environmental/electrical controls |
| `R-STORE` | fixed household storage |
| `R-OBJ` | complete object route from delivery/removal point to destination |
| `R-ADAPT` | future adaptation route/reservation/interface |

A route may span several interfaces. Later packets test the **whole task chain**, not only the narrowest local dimension.

---

# 7. Frozen representative scenario matrix

The following **49 scenarios** are the minimum representative set for later HFI synthesis. They are not pass/fail tests.

## 7.1 Arrival, visitability and ground-plane scenarios

| ID | Class | Person | Task/state | Route/interface | Question / consequence to test | Later packet(s) |
|---|---|---|---|---|---|---|
| `HFI-SC-ARR-01` | `V,O,E` | `P-REF` | arrive/enter, `S-NOM` | `R-APP → R-ENT → R-GRND` | Is the principal route coherent without unnecessary step-over, detour or door choreography? | 03A / 03B |
| `HFI-SC-ARR-02` | `V,W,E` | `P-WC` | arrive/enter/reach social space + WC, `S-NOM` | `R-APP → R-ENT → R-GRND → R-WC` | Can the same principal system support complete dignified participation, subject to real-site facts? | 03A / 03B / 04A |
| `HFI-SC-ARR-03` | `O` | `P-MOB` | enter using mobility aid, `S-NOM` | `R-ENT → R-GRND` | Do threshold, door and immediate turning demand avoidable repositioning or instability? | 03A / 03B / 04B |
| `HFI-SC-ARR-04` | `O,A` | `P-REF` | enter, `S-LOWER` | `R-APP → R-ENT → R-GRND` | Does ordinary access remain reasonably usable during temporary lower-limb impairment? | 02C / 03B |
| `HFI-SC-ARR-05` | `O` | `P-REF` | move inside→garden carrying tray/load, `S-HANDS` | `R-GRND → R-GARD` | Does threshold/door sequence require freeing hands, unstable handling or avoidable step-over? | 03B / 03D / 04B |
| `HFI-SC-ARR-06` | `E` | `P-WC` | reach intended garden/outdoor destination, `S-NOM` | `R-GRND → R-GARD` | Is participation available through an equivalent route rather than a conspicuously inferior path? | 03A / 03B |
| `HFI-SC-ARR-07` | `V,O` | `P-REF` | first-time visitor finds entrance-level social space/WC, `S-UNFAM` | `R-ENT → R-GRND → R-WC` | Is route/door decision legible without prior learned mapping or excessive searching? | 03A / 04C |

## 7.2 Body variation, horizontal movement and stair scenarios

| ID | Class | Person | Task/state | Route/interface | Question / consequence to test | Later packet(s) |
|---|---|---|---|---|---|---|
| `HFI-SC-MOV-01` | `O` | `P-LARGE` | ascend/descend, `S-NOM` | `R-STAIR` | Do tread/landing conditions create repeated foot-placement compensation for larger foot/body geometry? | 02A / 02B |
| `HFI-SC-MOV-02` | `O` | `P-SMALL` | use stair/handrail, `S-NOM` | `R-STAIR` | Are stride, rail/reach and landing relationships usable for a smaller adult? | 02A / 02B |
| `HFI-SC-MOV-03` | `O` | `P-OLDER` | descend stair, `S-NOM` | `R-STAIR` | What geometry/support materially affects stability/attention in relevant older-adult evidence without presuming impairment? | 02B |
| `HFI-SC-MOV-04` | `O,A` | `P-REF` | use stair, `S-LOWER` | `R-STAIR` | Does stair geometry/support make temporary lower-limb impairment substantially harder than necessary? | 02B / 02C |
| `HFI-SC-MOV-05` | `O` | `P-REF` | descend carrying laundry/luggage, `S-HANDS` | `R-STAIR` | Does carrying remove useful support/visibility/foot-placement margin? | 02B / 02D |
| `HFI-SC-MOV-06` | `O` | `P-REF` | ordinary circulation, `S-FAT` | `R-GRND / R-UPPER / R-STAIR` | Which frictions become materially more consequential when attentional reserve is reduced? | 02D / 03A |
| `HFI-SC-MOV-07` | `O` | `P-REF` | stair/landing movement, `S-LOWLIGHT` | `R-STAIR / R-UPPER` | Are level changes, edges and route continuation legible in plausible low light? | 02B / 02D / 04C |
| `HFI-SC-MOV-08` | `O` | `P-CHILD` | age-appropriate independent stair use, `S-NOM` | `R-STAIR` | Are ordinary tread/rail/route conditions comprehensible and usable without expanding into safeguarding design? | 02B |
| `HFI-SC-MOV-09` | `O` | `P-REF` | turn through principal circulation corner, `S-NOM` | `R-GRND / R-UPPER` | Does effective turning require avoidable sideways/body choreography despite nominal straight widths? | 03A |
| `HFI-SC-MOV-10` | `O` | `P-DYAD` | assisted movement, `S-ASSIST` | `R-GRND / R-UPPER` | Is there usable envelope for assistance at representative turns/doors without demanding two-person width everywhere? | 03A / 05B |
| `HFI-SC-MOV-11` | `O` | `P-REF` | traverse stair/threshold/wet transition, `S-BAL` | `R-STAIR / R-ENT / R-BATH` | Which level changes/support opportunities materially affect stability under reduced balance? | 02B / 03B / 04A |

## 7.3 Repeated domestic-task and object-route scenarios

| ID | Class | Person | Task/state | Route/interface | Question / consequence to test | Later packet(s) |
|---|---|---|---|---|---|---|
| `HFI-SC-LOG-01` | `O` | `P-REF` | groceries entrance→kitchen, `S-HANDS` | `R-ENT → R-GRND → R-KIT` | Do doors/turns/destination sequence force repeated load-down/free-hand/regrip actions? | 02D / 03D / 04D |
| `HFI-SC-LOG-02` | `O` | `P-REF` | laundry between sleeping/bathing and utility/storage, `S-HANDS` | `R-UPPER → R-STAIR → R-GRND` | Is repeated carrying burden driven by avoidable route/door/stair choreography? | 02D / 03D |
| `HFI-SC-LOG-03` | `O` | `P-REF` | waste/recycling to external destination, `S-HANDS` | `R-KIT → R-GRND → R-ENT/R-GARD` | Does route require avoidable door/threshold handling or awkward clean/dirty crossing? | 03D |
| `HFI-SC-LOG-04` | `O` | `P-REF` | move cleaning equipment, `S-HANDS` | `R-GRND / R-STAIR / R-UPPER / R-STORE` | Do storage, doors and stairs make repeated housekeeping unnecessarily cumbersome? | 03D / 04D |
| `HFI-SC-LOG-05` | `O` | `P-REF` | carry child through doors/corners/stairs, `S-HANDS,S-DIST` | `R-GRND / R-STAIR / R-UPPER` | Does building require risky free-hand compensation or high monitoring load under divided attention? | 02D / 03D / 04B |
| `HFI-SC-LOG-06` | `O` | `P-REF` | move representative pram, `S-NOM` | `R-ENT → R-GRND → R-OBJ` | Can complete route manage turns/doors/staging rather than only doorway width? | 03C |
| `HFI-SC-LOG-07` | `O` | `P-REF` | move representative sofa, `S-NOM` | `R-OBJ` | Does complete swept path work with realistic handling/rotation space? | 03C |
| `HFI-SC-LOG-08` | `O` | `P-REF` | move representative mattress/bed component upstairs, `S-NOM` | `R-OBJ → R-STAIR → R-UPPER` | Can object + handlers negotiate stair/landings/turns without implausible or destructive manoeuvres? | 03C |
| `HFI-SC-LOG-09` | `O` | `P-REF` | replace representative washing machine/fridge/dishwasher, `S-NOM` | delivery point → `R-OBJ → R-KIT/utility` | Is credible appliance replacement route available, distinct from plant-maintenance logic? | 03C |
| `HFI-SC-LOG-10` | `W,O` | `P-WC` | move personal mobility device through entrance-level destinations, `S-NOM` | `R-ENT → R-GRND → R-GARD/R-WC` | Does whole route work through doors/turns/destinations, not isolated clear widths? | 03A / 03C |

## 7.4 Controls, doors/windows, bathroom and kitchen scenarios

| ID | Class | Person | Task/state | Route/interface | Question / consequence to test | Later packet(s) |
|---|---|---|---|---|---|---|
| `HFI-SC-USE-01` | `O` | `P-SMALL` | operate frequent room/environmental controls, `S-NOM` | `R-CTRL` | Are reach/sight/feedback relationships usable for shorter adults beyond mounting-height shorthand? | 02A / 04C |
| `HFI-SC-USE-02` | `O` | `P-LARGE` | pass/use door + local control zone, `S-NOM` | `R-DOOR / R-CTRL` | Do leaf, handle/control placement and adjacent geometry create body interference or reach-back? | 03A / 04B / 04C |
| `HFI-SC-USE-03` | `O` | `P-REF` | open/close/lock door, `S-ONEHAND` | `R-DOOR` | Can sequence be completed without disproportionate grip, regrip or bracing? | 02A / 04B |
| `HFI-SC-USE-04` | `O` | `P-REF` | operate door/window hardware, `S-DEX` | `R-DOOR / R-WIN` | What force/grip/feedback relationships materially affect operation? | 02A / 04B |
| `HFI-SC-USE-05` | `O` | `P-REF` | establish shower flow/temp then enter, `S-WET` where task creates it | `R-BATH` | Does control position force entry into spray/hazard zone before control is gained? | 04A |
| `HFI-SC-USE-06` | `O` | `P-SMALL` | operate bath controls from stable position, `S-NOM` | `R-BATH` | Does reach require leaning across bath/hot-water zone or unstable posture? | 02A / 04A |
| `HFI-SC-USE-07` | `O,A` | `P-REF` | use shower/WC, `S-LOWER` | `R-BATH / R-WC` | Can entrance-level sanitary use remain practical without a permanent specialist layout everywhere? | 02C / 04A / 05B |
| `HFI-SC-USE-08` | `W` | `P-WC` | use entrance-level WC/relevant washing facility, `S-NOM` | `R-WC / R-BATH` | Do approach, door, manoeuvre and fixture-use zones support the complete task where wheelchair usability is tested? | 04A |
| `HFI-SC-USE-09` | `O` | `P-DYAD` | assist bathing/toileting/dressing, `S-ASSIST` | `R-BATH / R-WC` | Where assistance is foreseeable, does two-person geometry work without institutionalising every bathroom? | 04A / 05B |
| `HFI-SC-USE-10` | `O` | `P-REF` | fixed kitchen hot/wet task sequence, `S-WET` | `R-KIT` | Do fixed clearances/control/appliance relationships create avoidable cross-over/reach/hazard exposure? | 04D |
| `HFI-SC-USE-11` | `O` | `P-SMALL` | use frequent fixed kitchen/storage zone, `S-NOM` | `R-KIT / R-STORE` | Which reach/storage relationships create repeated avoidable overreach or dependence? | 02A / 04D |
| `HFI-SC-USE-12` | `O` | `P-REF` | use controls/route, `S-LOWLIGHT` | `R-CTRL / R-DOOR / route transition` | Are location, mapping and feedback understandable without importing life-safety signalling scope? | 04C |
| `HFI-SC-USE-13` | `O,A` | `P-REF` | operate door/control/window, `S-UPPER` | `R-DOOR / R-WIN / R-CTRL` | Does temporary upper-limb impairment create avoidable cross-body reach, force or sequence failure distinct from simple one-hand occupancy? | 02A / 04B / 04C |
| `HFI-SC-USE-14` | `O` | `P-REF` | use shower/bathroom transition, `S-BAL,S-WET` | `R-BATH` | Do fixed support/transition relationships materially affect stability under a plausible combined wet + reduced-balance condition? | 04A |
| `HFI-SC-USE-15` | `O` | `P-REF` | identify and operate unfamiliar fixed control/route choice, `S-PROC,S-UNFAM` | `R-CTRL / R-DOOR` | Are mapping, feedback and decision structure intelligible when learned routine and processing reserve are reduced, without making clinical claims? | 04C |

## 7.5 Life-course, adaptation and equivalent-use scenarios

| ID | Class | Person | Task/state | Route/interface | Question / consequence to test | Later packet(s) |
|---|---|---|---|---|---|---|
| `HFI-SC-LC-01` | `A,O` | `P-REF` | live temporarily without upper-floor essential functions, `S-LOWER` | entrance-level sleeping + `R-WC/R-BATH/R-KIT` | Is credible short/medium-term entrance-level living possible without shell reconstruction? | 02C / 04A |
| `HFI-SC-LC-02` | `A` | `P-OLDER` | remain in house after future mobility reduction | state evidence-defined, not inferred from age | `R-STAIR / R-ADAPT` | Which early irreversible provisions reduce future adaptation burden, and which should remain demand-led? | 02C / 05B |
| `HFI-SC-LC-03` | `A` | `P-MOB` | future stair-lift adaptation, `S-NOM` | `R-STAIR / R-ADAPT` | Is stair/landing reservation plausibly compatible with lower-burden future adaptation without claiming product feasibility? | 02C |
| `HFI-SC-LC-04` | `A,W` | `P-WC` | test future vertical wheelchair route, `S-NOM` | `R-ADAPT` | Is reserving lift/other vertical provision warranted or disproportionate in area/cost/carbon/complexity? | 02C / 05B |
| `HFI-SC-LC-05` | `O,A` | `P-REF` | ordinary use during pregnancy, `S-PREG` | `R-STAIR / R-BATH / R-STORE` | Do permanent geometries create materially avoidable turning, bending, balance or carrying burden? | 02D / 04A / 04D |
| `HFI-SC-LC-06` | `E,O` | `P-DYAD` | host/assist visitor with mobility limitation, `S-ASSIST` | `R-APP → R-ENT → R-GRND → R-WC` | Does assistance remain dignified and compatible with principal use rather than service-route treatment? | 03A / 03B / 04A |

---

## 8. Housework, childcare and care assumption audit

HFI must not encode an unspoken household sociology into geometry.

Rejected assumptions:

- one gender performs groceries, laundry, cleaning, waste or cooking;
- one gender carries children or provides care;
- the physically larger adult always handles heavy/object-moving tasks;
- an older occupant is necessarily the care recipient rather than caregiver;
- a wheelchair user cannot perform housework or caregiving;
- a child is always accompanied on every age-appropriate domestic movement;
- every household contains children, older people or a conventional family structure;
- a dedicated service route is inherently acceptable for a disabled occupant or caregiver.

The matrix assigns domestic/care tasks to **capability states**, not social roles. If later evidence distinguishes roles because real-world exposure/frequency differs, HFI may use it only with an explicit evidence basis.

### 8.1 Required role-rotation check

Before HFI-03D or HFI-04D concludes that a domestic-task burden is trivial, the task must be checked against at least:

1. a reference adult in nominal condition;
2. the relevant carrying/occupied-hand state;
3. one materially different body/capability condition where evidence suggests the interaction changes.

This does not require every task to be tested by every person primitive.

---

## 9. Coverage proof against HFI-01C minimums

| Required condition | Frozen coverage |
|---|---|
| larger/taller body | `MOV-01`, `USE-02` |
| smaller/shorter body | `MOV-02`, `USE-01`, `USE-06`, `USE-11` |
| older occupant | `MOV-03`, `LC-02` |
| temporary lower-limb impairment | `ARR-04`, `MOV-04`, `USE-07`, `LC-01` |
| temporary upper-limb impairment | `USE-13` |
| wheelchair use | `ARR-02`, `ARR-06`, `LOG-10`, `USE-08`, `LC-04` |
| mobility aid | `ARR-03`, `LC-03` |
| occupied hands | `ARR-05`, `MOV-05`, `LOG-01`–`LOG-05` where applicable |
| one-handed operation | `USE-03` |
| groceries | `LOG-01` |
| laundry | `LOG-02` |
| carrying child | `LOG-05` |
| awkward object | `LOG-07`, `LOG-08`, `LOG-09` |
| assistance/care by second person | `MOV-10`, `USE-09`, `LC-06` |
| wet hands/floor | `USE-05`, `USE-10`, `USE-14` |
| fatigue | `MOV-06` |
| low light | `MOV-07`, `USE-12` |
| reduced balance | `MOV-11`, `USE-14` |
| reduced dexterity | `USE-04` |
| furniture movement | `LOG-07`, `LOG-08` |
| appliance movement | `LOG-09` |
| pram movement | `LOG-06` |
| pregnancy | `LC-05` |
| children | `MOV-08`, plus `LOG-05` as care/carrying context |
| sensory variation | `MOV-07`, `USE-12`, plus `S-VIS` available where evidence establishes distinct effects |
| cognitive/comprehension variation | `ARR-07`, `USE-15` via unfamiliarity / reduced processing reserve without diagnosis claims |
| dignity/equivalent route | `ARR-02`, `ARR-06`, `LC-06` |
| household/care-role assumptions | section 8 + `LOG-*`, `USE-09`, `LC-06` |

No minimum declared by the programme/audit is orphaned.

---

## 10. Coverage proof against later research families

| Later family | Scenario basis |
|---|---|
| 02A anthropometry/reach/force | `MOV-01`, `MOV-02`, `USE-01`–`USE-04`, `USE-06`, `USE-11`, `USE-13` |
| 02B stairs/falls | `MOV-01`–`MOV-08`, `MOV-11` |
| 02C vertical life-course | `ARR-04`, `MOV-04`, `USE-07`, `LC-01`–`LC-04` |
| 02D carrying/reduced attention | `MOV-05`–`MOV-07`, `LOG-01`–`LOG-05`, `LC-05` |
| 03A circulation | `ARR-01`–`ARR-03`, `ARR-07`, `MOV-09`, `MOV-10`, `LOG-10`, `LC-06` |
| 03B continuous ground plane | `ARR-01`–`ARR-06`, `MOV-11`, `USE-05`, `USE-07` |
| 03C object movement | `LOG-06`–`LOG-10` |
| 03D domestic task routes | `LOG-01`–`LOG-05` |
| 04A bathing/toileting/dressing | `USE-05`–`USE-09`, `USE-14`, `LC-01`, `LC-06` |
| 04B doors/windows/hardware | `ARR-03`, `ARR-05`, `USE-02`–`USE-04`, `USE-13` |
| 04C environmental/electrical controls | `ARR-07`, `USE-01`, `USE-12`, `USE-13`, `USE-15` |
| 04D kitchen/storage/fixed work | `LOG-01`, `LOG-04`, `USE-10`, `USE-11`, `LC-05` |
| 05B proportionality | all scenarios where benefit competes with permanent burden; especially `MOV-10`, `USE-09`, `LC-02`–`LC-04` |
| 07 Reference House audit | scenario set becomes the person/task basis for later `PASS / IMPROVE / CONFLICT / UNRESOLVED / NOT-MODELLED` judgements |

---

## 11. Rules for later packet use

### 11.1 Evidence must name scenario applicability

A source or candidate finding must state which scenario(s) it informs. Evidence that cannot be connected to a plausible HFI scenario cannot silently create a project target.

### 11.2 Missing evidence stays missing

If no defensible evidence exists, later packets must record uncertainty. They may not substitute anecdote, import a value from an unrelated building type, promote current RH geometry because convenient, assume a regulatory minimum is an ergonomic optimum, or invent a percentile/body envelope.

### 11.3 Scenario relevance is not target entitlement

Even where a scenario exposes benefit from more space or a different interface, HFI-01D and HFI-05B still own proportionality. A scenario alone cannot justify permanent area/cost/carbon/technical burden.

### 11.4 Controlled extension only

A later packet may add a scenario only if:

1. a material human interaction is not represented;
2. the new scenario is meaningfully distinct rather than cosmetic;
3. the reason for addition is recorded;
4. it does not merely justify a desired target;
5. downstream research/target/audit records depending on scenario completeness are updated if already completed.

Minor variation should use an existing scenario plus a person/state modifier rather than a new ID.

---

## 12. Explicit non-scenarios / scope firewall

These are not HFI scenarios unless a later packet identifies a bounded architectural interaction:

- thermal comfort in itself;
- acoustic performance in itself;
- daylight performance in itself;
- fire evacuation strategy or alarm design;
- structural capacity;
- drainage capacity or waterproofing design;
- security threat modelling;
- plant/service maintenance unrelated to ordinary occupation;
- construction-site ergonomics;
- loose-furniture styling/layout preference;
- specialist clinical care environments;
- invented real-site gradients, parking or pavement conditions.

Where these disciplines materially alter an HFI interaction, HFI records the handoff/conflict but does not take technical ownership.

---

## 13. Anti-drift rules

| Rejected interpretation | Reason |
|---|---|
| “Every scenario must work without assistance.” | Assistance can be legitimate; dependence must be judged against intended use and proportionality. |
| “Wheelchair scenario means design the entire house to M4(3).” | Scenario testing and regulatory category selection are separate. |
| “Older occupant means impaired occupant.” | Age and capability are separate variables. |
| “Child scenario means childproof every interface.” | Age-appropriate use is distinct from safeguarding/product-safety design. |
| “Large body = 95th percentile target.” | Person primitives do not establish percentile values. |
| “Every degraded state must combine with every task.” | The matrix is representative, not combinatorial. |
| “If a scenario exposes friction, enlarge the space.” | Cause and proportionality come first. |
| “Housework scenarios describe who should do housework.” | They test architectural burden, not household roles. |
| “A separate accessible route is acceptable if it technically works.” | Equivalent/dignified use remains explicit. |
| “If RH cannot represent the scenario, infer geometry from drawings.” | HFI-07 uses `NOT-MODELLED` where controlled source is insufficient. |

---

## 14. Findings and authority consequences

### Findings

1. A bounded set of **49 representative scenarios** covers the declared people/task/state minimums without a combinatorial test explosion.
2. Body variation, age, impairment, device use and assistance must remain separate variables rather than stereotype bundles.
3. Degraded states are selective stressors, not a universal design baseline.
4. Domestic labour and care are material architectural tasks, but HFI must not encode gendered or family-structure assumptions.
5. Complete route/task sequences are often the correct unit; isolated widths, reach heights and openings are insufficient descriptions of use.
6. Equivalent/dignified participation is explicitly represented rather than assumed from geometric access.
7. Sensory/cognitive variation is represented through bounded capability states and familiar/unfamiliar-use questions without HFI claiming clinical expertise.
8. The matrix creates no entitlement to a larger building. Benefit still must survive HFI-01D proportionality and HFI-05B synthesis.

### Architectural / maturity consequences

**None.**

No current Reference House dimension or claim has been judged acceptable or defective. No target, pattern, doctrine, computational method or maturity state changes.

### Stale downstream artefacts

**None created by this packet.**

The scenario matrix is upstream research control. DRW may continue from current architectural authority; if later HFI research proves a material defect, the owning RH gate will be rewound before affected drawings are regenerated.

### Exact next packet

**HFI-01D — proportionality/evaluation method.** Not started by HFI-01C.
