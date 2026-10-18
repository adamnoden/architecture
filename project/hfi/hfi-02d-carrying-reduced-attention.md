# HFI-02D — Carrying and Reduced-Attention Movement

**Packet:** HFI-02D  
**Programme:** [`docs/development/human-factors-low-friction-inhabitation-programme.md`](../../docs/development/human-factors-low-friction-inhabitation-programme.md)  
**Execution plan:** [`docs/development/human-factors-low-friction-inhabitation-execution-plan.md`](../../docs/development/human-factors-low-friction-inhabitation-execution-plan.md)  
**Owning issue:** #195  
**Baseline `main`:** `58fbf4fc96cbd6023d4ce4d1a0b95094e52a977e`  
**Prior packet:** HFI-02C — vertical life-course  
**Question:** how do carrying, occupied hands, visual occlusion, divided attention and fatigue change ordinary domestic movement, particularly stair use, and what architectural propositions are strong enough to carry into later route/task synthesis without creating premature dimensions?  
**Boundary:** evidence synthesis and mechanism formation only. This packet does **not** set corridor/stair widths, require two handrails, prohibit carrying on stairs, relocate rooms, change the Reference House, define a domestic load limit, create a child-carrying standard, set lighting values, create doctrine/patterns, or add compiler proof.

---

## 1. Purpose

Ordinary domestic movement rarely occurs under laboratory conditions of empty hands, full attention and fresh legs.

People move while:

- carrying groceries, laundry, luggage, trays and cleaning equipment;
- carrying or guiding children;
- holding a phone, keys, mug or other object;
- opening doors while another hand is occupied;
- thinking or speaking;
- tired after exertion or poor sleep;
- moving through low light or an unfamiliar route;
- responding to another person while walking.

HFI-02D tests the proposition that a house should retain useful **movement margin** under those states without turning every route into oversized institutional circulation.

The controlling question is:

> **Which predictable reductions in support, vision and attention should persistent architecture absorb, and which are too variable or user-specific to justify permanent provision?**

---

# 2. Mechanisms must remain separate

“Carrying” is not one variable.

## 2.1 Mass

A carried mass changes muscular/joint demand and can alter balance strategy. The effect depends on mass relative to the person, posture and where the load is held.

## 2.2 Asymmetry

A unilateral load changes frontal-plane demand differently from a balanced two-sided load. A bag in one hand is not equivalent to the same total mass split between both hands.

## 2.3 Occupied hands

A person may be physically capable of carrying a light object while losing immediate access to a handrail, door handle or recovery grasp.

This is an **interface-availability** problem, not merely a strength problem.

## 2.4 Visual occlusion

A bulky object can reduce near-field view even when it is light. This is a visual-information problem distinct from load mass.

## 2.5 Divided attention

Walking while performing another cognitive or social task competes for attentional resources. Stair transitions and descent appear particularly demanding.

## 2.6 Fatigue / reduced reserve

Physical fatigue and sleep restriction can change gait control even in otherwise healthy adults. HFI uses `fatigue` here as a **state modifier**, not a medical diagnosis and not an assumption about any age group.

## 2.7 Dynamic carried person

Carrying a child is not equivalent to carrying a rigid box of the same mass. The carried person can move, alter load distribution and demand attention.

No sufficiently applicable direct child-carrying stair study was identified in this bounded packet search. HFI therefore models the scenario through mechanisms already evidenced elsewhere—occupied hands, variable/asymmetric load, divided attention and possible visual obstruction—rather than inventing a “child-carrying allowance”.

---

# 3. Controlled project scenarios

HFI-01C already freezes the representative cases relevant here.

| Scenario | Interaction carried into 02D |
|---|---|
| `HFI-SC-MOV-05` | stair descent while carrying laundry/luggage; loss of support/visibility/foot-placement margin |
| `HFI-SC-MOV-06` | ordinary circulation under fatigue/reduced attentional reserve |
| `HFI-SC-MOV-07` | stair/landing movement in plausible low light |
| `HFI-SC-LOG-01` | groceries entrance → kitchen with occupied hands |
| `HFI-SC-LOG-02` | repeated laundry route upper → stair → ground |
| `HFI-SC-LOG-05` | carrying child through doors/corners/stairs under occupied hands + distraction |
| `HFI-SC-ARR-05` | inside → garden carrying tray/load through door/threshold sequence |
| `HFI-SC-LC-05` | pregnancy scenario carried forward; no pregnancy-specific inference is made by this packet |

The packet does not multiply these into a persona matrix. It tests common mechanisms across them.

---

# 4. Evidence additions and applicability

These records extend the HFI-01B register. `HFI-SRC-S03` from HFI-02B remains the existing government domestic-stair source and is reused rather than duplicated.

## `HFI-SRC-D01` — Vallabhajosula et al. 2015 stair dual-task study

- **Source:** Vallabhajosula S, Tan CW, Mukherjee M, Davidson AJ, Stergiou N, *Biomechanical analyses of stair-climbing while dual-tasking*.
- **Date/version:** Journal of Biomechanics 48(6), 2015, 921–929; PMID 25773590.
- **Jurisdiction / population:** laboratory study; 10 healthy adults aged 19–35.
- **Class:** `PEER-REVIEWED-EMPIRICAL`.
- **Authority / status:** peer-reviewed empirical evidence; non-statutory.
- **Applicability:** stair ascent under single task, cognitive dual task, motor dual task (carrying an empty opaque box) and combined cognitive + carrying conditions.
- **Useful finding:** concurrent cognitive work changed stair mechanics more than the simple motor carrying task in this small young sample; effects varied by stair phase and task complexity. The experiment is useful because it isolates a light opaque-box motor task from load mass.
- **Known limits / nonclaims:** very small young sample; ascent only; short laboratory stair; the box was only about `0.28 kg`; the study does **not** separately identify the contributions of hand occupancy and visual occlusion, establish domestic carrying limits or quantify real child/laundry/grocery risk.
- **Access state:** PubMed metadata and open manuscript/full text available.
- **Checked:** 2026-10-18.
- **DOI:** https://doi.org/10.1016/j.jbiomech.2015.02.024
- **PMID:** https://pubmed.ncbi.nlm.nih.gov/25773590/

## `HFI-SRC-D02` — Ojha et al. 2009 attentional demand of stairs

- **Source:** Ojha HA, Kern RW, Lin CHJ, Winstein CJ, *Age affects the attentional demands of stair ambulation: evidence from a dual-task approach*.
- **Date/version:** Physical Therapy 89(10), 2009, 1080–1088.
- **Jurisdiction / population:** 10 healthy older adults >65 and 10 younger adults aged 21–33.
- **Class:** `PEER-REVIEWED-EMPIRICAL`.
- **Authority / status:** peer-reviewed empirical evidence; non-statutory.
- **Applicability:** attentional demand during stair ascent/descent relative to standing.
- **Useful finding:** older participants showed substantially longer response times during stair ambulation than younger participants despite similar standing-task response times, supporting the proposition that stair movement can consume meaningful attentional reserve.
- **Known limits / nonclaims:** small, healthy sample; auditory probe paradigm; not a direct fall-incidence study and not a basis for an age-specific stair dimension.
- **Access state:** abstract/metadata public.
- **Checked:** 2026-10-18.
- **DOI:** https://doi.org/10.2522/ptj.20080187
- **PMID:** https://pubmed.ncbi.nlm.nih.gov/19661159/

## `HFI-SRC-D03` — Telonio et al. 2014 divided visual attention at stair descent transition

- **Source:** Telonio A et al., *The division of visual attention affects the transition point from level walking to stair descent in healthy, active older adults*.
- **Date/version:** Experimental Gerontology 50 (2014), 26–33.
- **Jurisdiction / population:** 16 healthy younger and 16 healthy older adults; five-step laboratory stair.
- **Class:** `PEER-REVIEWED-EMPIRICAL`.
- **Authority / status:** peer-reviewed empirical evidence; non-statutory.
- **Applicability:** approach/transition/steady-state stair descent under visual dual task.
- **Useful finding:** dual tasking affected gait/cognitive performance in both groups, with stronger age-related attentional effects at the transition into descent.
- **Known limits / nonclaims:** small laboratory study; healthy active participants; does not establish a universal transition-zone dimension or lighting/contrast target.
- **Access state:** abstract/metadata public.
- **Checked:** 2026-10-18.
- **DOI:** https://doi.org/10.1016/j.exger.2013.11.007
- **PMID:** https://pubmed.ncbi.nlm.nih.gov/24291246/

## `HFI-SRC-D04` — Zhang et al. 2018 older-adult stair descent under cognitive dual task

- **Source:** Zhang C, Sun W, Song Q, Gu H, Mao D, *Performance of older adults under dual task during stair descent*.
- **Date/version:** Journal of Exercise Science & Fitness 16(3), 2018, 99–105.
- **Jurisdiction / population:** 30 healthy older women, mean age about 67.
- **Class:** `PEER-REVIEWED-EMPIRICAL`.
- **Authority / status:** peer-reviewed empirical evidence; non-statutory.
- **Applicability:** stair-descent gait/postural control under serial-subtraction dual task.
- **Useful finding:** under dual task, gait speed, foot clearance and hip flexion reduced while step width increased, consistent with altered gait and compensatory stability behaviour.
- **Known limits / nonclaims:** women only; healthy older sample; step-by-step laboratory descent; cognitive task is not a direct proxy for every domestic distraction.
- **Access state:** open-access full article / PubMed.
- **Checked:** 2026-10-18.
- **DOI:** https://doi.org/10.1016/j.jesf.2018.09.001
- **PMID:** https://pubmed.ncbi.nlm.nih.gov/30662502/

## `HFI-SRC-D05` — Wang and Gillette 2017 asymmetric stair load study

- **Source:** Wang J, Gillette JC, *Carrying asymmetric loads during stair negotiation*.
- **Date/version:** Gait & Posture 53 (2017), 67–72.
- **Jurisdiction / population:** 22 college students; three-step stair with `185 mm` rise and `295 mm` tread.
- **Class:** `PEER-REVIEWED-EMPIRICAL`.
- **Authority / status:** peer-reviewed empirical evidence; non-statutory.
- **Applicability:** stair ascent/descent under no load, unilateral and bilateral loads at 10% and 20% body weight.
- **Useful finding:** a 20% body-weight unilateral load produced substantially greater L5/S1 lateral bending, hip abduction and external knee-varus moments than most other tested conditions. The result supports treating asymmetry separately from total carried mass.
- **Known limits / nonclaims:** young sample; short laboratory stair; high experimental loads; joint moments are not direct domestic fall probabilities; `20% body weight` is not an Ovid's House carrying limit.
- **Access state:** abstract/metadata public.
- **Checked:** 2026-10-18.
- **DOI:** https://doi.org/10.1016/j.gaitpost.2017.01.006
- **PMID:** https://pubmed.ncbi.nlm.nih.gov/28113074/

## `HFI-SRC-D06` — Wang and Gillette 2020 postural-stability study

- **Source:** Wang J, Gillette JC, *Mediolateral postural stability when carrying asymmetric loads during stair negotiation*.
- **Date/version:** Applied Ergonomics 85 (2020), 103057.
- **Jurisdiction / population:** 24 healthy young adults; three-step laboratory stair; no load, 20% body-mass bilateral and 20% unilateral load.
- **Class:** `PEER-REVIEWED-EMPIRICAL`.
- **Authority / status:** peer-reviewed empirical evidence; non-statutory.
- **Applicability:** mediolateral postural control under symmetric/asymmetric stair load carriage.
- **Useful finding:** unilateral loading required faster postural adjustments and changed mediolateral centre-of-pressure behaviour; loaded-limb stance during descent reduced the tested postural-stability measure.
- **Known limits / nonclaims:** young healthy sample; high fixed load; does not determine domestic passage/stair width or prove accident risk under everyday lighter loads.
- **Access state:** abstract/metadata public.
- **Checked:** 2026-10-18.
- **DOI:** https://doi.org/10.1016/j.apergo.2020.103057
- **PMID:** https://pubmed.ncbi.nlm.nih.gov/32174345/

## `HFI-SRC-D07` — Qu 2015 lower-limb fatigue and stair gait

- **Source:** Qu X, *Effects of lower-limb muscular fatigue on stair gait*.
- **Date/version:** Journal of Biomechanics 48(15), 2015, 4059–4064.
- **Jurisdiction / population:** 12 healthy young men aged 20–30.
- **Class:** `PEER-REVIEWED-EMPIRICAL`.
- **Authority / status:** peer-reviewed empirical evidence; non-statutory.
- **Applicability:** ascent/descent gait and postural stability before/after induced lower-limb muscular fatigue.
- **Useful finding:** induced fatigue compromised stair gait during descent in the tested sample, while ascent did not show the same effect.
- **Known limits / nonclaims:** very small young male sample and laboratory fatigue protocol; does not establish a domestic “fatigue factor” or new stair dimension.
- **Access state:** abstract/metadata public.
- **Checked:** 2026-10-18.
- **DOI:** https://doi.org/10.1016/j.jbiomech.2015.10.004
- **PMID:** https://pubmed.ncbi.nlm.nih.gov/26477407/

## `HFI-SRC-D08` — Helbostad et al. 2007 fatigue and older-adult gait

- **Source:** Helbostad JL, Leirfall S, Moe-Nilssen R, Sletvold O, *Physical fatigue affects gait characteristics in older persons*.
- **Date/version:** Journals of Gerontology Series A 62(9), 2007, 1010–1015.
- **Jurisdiction / population:** 22 older participants in fatigue group (mean 78 years) plus 22 matched controls (mean 80 years).
- **Class:** `PEER-REVIEWED-EMPIRICAL`.
- **Authority / status:** peer-reviewed empirical evidence; non-statutory.
- **Applicability:** level-walking gait after repeated sit-to-stand fatigue.
- **Useful finding:** fatigue was associated with increased step width, trunk acceleration and gait variability—changes resembling patterns associated with fall risk in older people.
- **Known limits / nonclaims:** level walking rather than stairs; small sample; induced fatigue protocol; supports a reduced-reserve mechanism rather than a dwelling dimension.
- **Access state:** abstract/metadata public.
- **Checked:** 2026-10-18.
- **DOI:** https://doi.org/10.1093/gerona/62.9.1010
- **PMID:** https://pubmed.ncbi.nlm.nih.gov/17895440/

## `HFI-SRC-D09` — Umemura et al. 2021 sleep restriction and gait control

- **Source:** Umemura GS et al., *Sleep deprivation affects gait control*.
- **Date/version:** Scientific Reports 11, 21104 (2021).
- **Jurisdiction / population:** healthy adults under differing sleep-restriction conditions; paced walking paradigm.
- **Class:** `PEER-REVIEWED-EMPIRICAL`.
- **Authority / status:** peer-reviewed empirical evidence; non-statutory.
- **Applicability:** whether reduced sleep can alter sensorimotor gait control independent of structural disability.
- **Useful finding:** acute sleep deprivation impaired tested sensorimotor gait synchronisation; chronic restriction also showed poorer performance than controls on some measures.
- **Known limits / nonclaims:** paced level-walking protocol, not domestic stair study; sleep deprivation is not interchangeable with physical fatigue or distraction; no architectural number follows.
- **Access state:** open-access full article / PubMed.
- **Checked:** 2026-10-18.
- **DOI:** https://doi.org/10.1038/s41598-021-00705-9
- **PMID:** https://pubmed.ncbi.nlm.nih.gov/34702960/

---

# 5. Evidence synthesis

## 5.1 Reduced attention changes movement; stairs are not cognitively free

The dual-task evidence converges on a simple point:

> **Stair negotiation consumes attention, and the demand becomes more consequential when another task competes for that reserve.**

This does not mean every conversation or thought creates a hazard. It means architecture should not assume the user can always allocate full conscious attention to every movement transition.

The evidence is strongest for:

- stair descent;
- the transition from level walking into descent;
- older adults, although dual-task effects are not exclusive to old age;
- more complex concurrent tasks.

This aligns with, but does not by itself prove, the Repose / Low Vigilance proposition that ordinary movement should not demand unnecessary continuous monitoring.

## 5.2 Carrying can remove recovery options before it changes strength demand

An object can be light and still matter because it occupies one or both hands or can block near-field vision.

That produces a distinct architectural problem:

- a handrail may be present but unavailable;
- a door may be operable but require a load-down/regrip sequence;
- a threshold may be visually obscured;
- an abrupt turn may require body/load choreography;
- a misstep may occur with less immediate recovery capacity.

Therefore HFI rejects:

> `If the load is light, carrying has no architectural consequence.`

The relevant question is **what capability the load removes or changes**, not only its kilograms.

The direct evidence is stronger for hand occupancy, dual-tasking and load distribution than for quantifying adult near-field occlusion. 02D therefore preserves visual occlusion as a plausible mechanism but does not assign it an independent risk magnitude.

## 5.3 Heavier/asymmetric loads add a separate physical mechanism

The Wang/Gillette evidence supports a second proposition: load distribution matters.

A unilateral load at the high experimental condition changed trunk/lower-limb moments and postural-control measures more than a comparable bilateral condition.

HFI does **not** convert `20% body weight` into a domestic carrying rule. The useful inference is only:

> **A one-handed/asymmetric load cannot be modelled as a neutral object that merely occupies space.**

This matters to groceries, luggage, a laundry basket held off-centre, a vacuum cleaner, a child on one hip and similar scenarios, but each remains task-specific.

## 5.4 Cognitive distraction and carrying are not interchangeable

The small Vallabhajosula study is useful because its simple motor dual task (light opaque box) and cognitive task did not affect stair ascent in the same way.

HFI therefore rejects a single generic “dual-task penalty”.

Later scenario evaluation should identify whether the relevant mechanism is:

- occupied hands;
- visual occlusion;
- load mass/asymmetry;
- cognitive division;
- fatigue;
- or a combination.

## 5.5 Fatigue supports robustness, not a special geometry table

Physical fatigue altered gait/postural-control measures in both stair and level-walking studies. Sleep restriction can also alter gait control.

The evidence does not justify a numerical “fatigue allowance”.

It does justify testing whether an architectural proposition only works when the user has high physical/attentional reserve.

A design that requires precise repeated compensation under nominal conditions has less margin when the user is tired.

---

# 6. Stair-specific implications

HFI-02B already established that stair descent, transition, dimensional consistency, edge legibility and usable handrails are material mechanisms. HFI-02D strengthens their relevance under non-ideal use.

## 6.1 The approach-to-descent transition deserves protection

Telonio et al. found particularly strong attentional effects at the transition into descent.

Later stair/route work should therefore attack:

- a door or leaf conflict immediately at the top/bottom transition;
- a route decision that coincides with first-step commitment;
- a pinch/turn requiring abrupt load repositioning;
- ambiguous edge/level information;
- landing geometry that leaves no credible pause/recovery state.

These are **questions**, not current Reference House defects. Final door/landing/interface geometry is not fully modelled at HFI resolution.

## 6.2 Handrails are more valuable when one hand remains available

HFI-02B already found a credible case for a second usable rail without proving a universal two-rail requirement. 02D reinforces the mechanism:

- carrying can occupy one hand;
- direction/asymmetry determines which hand remains free;
- a second rail can increase the chance that a useful rail is on the available side.

But:

- a two-handed load can make both rails unavailable;
- a second rail cannot compensate for poor stair geometry;
- added rail envelopes can reduce usable clear width;
- no study reviewed here proves that two rails eliminate carrying-related falls.

Therefore the candidate proposition remains conditional rather than doctrinal.

## 6.3 “Do not carry anything on stairs” is not an architectural strategy

Safety advice may reasonably tell high-risk users to keep a hand free, but a family house will predictably generate inter-storey movement of:

- laundry;
- bedding;
- luggage;
- cleaning equipment;
- personal items;
- children in some households.

HFI should not treat foreseeable ordinary behaviour as design misuse merely because a safer behavioural instruction can be imagined.

The architectural response is not necessarily to make the stair enormous. It is to ask whether:

- the stair itself has robust geometry/support/legibility;
- transitions do not add needless task conflict;
- frequent domestic routes minimise avoidable extra door/turn/level choreography;
- there is somewhere stable to pause before committing to a difficult transition when the plan naturally permits it.

---

# 7. Horizontal routes, doors and thresholds

The evidence base is thinner here than for stairs. HFI-02D therefore does not manufacture corridor widths from carrying studies.

It does establish several testable route mechanisms for HFI-03/04.

## 7.1 Load-down and regrip are observable friction events

A routine carrying route may be architecturally poor when it repeatedly requires the occupant to:

1. stop;
2. put the load down or trap it against the body;
3. free a hand;
4. operate a door/control;
5. pick/regrip the load;
6. immediately negotiate a threshold/turn.

One such event may be trivial. A repeated daily route containing several is a legitimate HFI question.

This does not imply every door should be automatic or every room open-plan.

## 7.2 Clear width is not the only carrying variable

A nominally wide route can still be awkward if:

- doors reduce the effective path at the point of use;
- handles/controls require reach-back while carrying;
- a tight 90° turn follows a doorway;
- radiators/joinery intrude at shoulder/load height;
- the carried object blocks sight of a small level change.

Conversely, a modest route may work well if its sequence is straight, predictable and uncluttered.

HFI-03A/03D must therefore test **route choreography**, not infer usability from corridor width alone.

## 7.3 Thresholds become more consequential under occupied attention

A tiny change in level may be manageable when visible and anticipated yet become more consequential when near-field vision is obstructed or attention is divided.

This strengthens the existing continuous-ground-plane question without allowing HFI to override drainage/weathering obligations.

---

# 8. Domestic task geography

HFI-02D does not relocate functions, but it establishes why repeated task geography matters.

## 8.1 Groceries

The relevant future test is not “is the corridor wide?” but:

> **How many doors, turns, level changes and load-down/regrip actions exist from principal arrival to a plausible kitchen set-down point?**

## 8.2 Laundry

The Reference House places sleeping/bathing upstairs and utility geography on the ground floor. That makes some vertical laundry movement foreseeable.

02D does not call this a defect. It makes the route a legitimate HFI-03D audit case because it is repeated and inherently load-bearing.

## 8.3 Waste/cleaning

Waste and cleaning equipment create asymmetric, dirty/wet or bulky-load variants. Their routes should be tested as complete domestic sequences rather than isolated door widths.

## 8.4 Childcare

The programme must test carrying/guiding a child without assuming every household has children or that one gender performs the task.

No child-specific architectural dimension is earned here. The relevant mechanisms are already covered by occupied hands, dynamic/asymmetric load, divided attention and route choreography.

---

# 9. Candidate propositions carried forward

These are **research outputs**, not doctrine or targets.

### `HFI-02D-P1` — attention margin

> **Ordinary movement should not depend on the occupant supplying full attentional reserve to compensate for avoidable architectural ambiguity or choreography.**

Strength: **strong qualitative candidate**, particularly for stairs/transitions.  
Later owner: HFI-05A/05D.

### `HFI-02D-P2` — carrying is multi-mechanism

> **Carrying must be evaluated through the capability it changes—hands, vision, mass distribution, attention and body envelope—not through object weight alone.**

Strength: **strong method proposition**.  
Later owner: HFI-03C/03D/05A.

### `HFI-02D-P3` — transition protection

> **Where a consequential level change begins, avoid stacking unnecessary door, turn, decision or load-repositioning demands onto the same moment.**

Strength: **moderate-to-strong candidate**; exact architectural form remains route-specific.  
Later owner: HFI-03A/03B/04B/05C.

### `HFI-02D-P4` — recovery/support opportunity

> **A route used under foreseeable reduced reserve should preserve useful support/recovery opportunities where proportionate rather than assuming both hands and full balance reserve are always available.**

Strength: **moderate candidate**; does not itself require two rails or a specific rail geometry.  
Later owner: HFI-05B/06B.

### `HFI-02D-P5` — repeated carrying choreography

> **Repeated load-down, regrip, door-operation and abrupt-turn sequences are legitimate architectural friction when persistent geometry creates them.**

Strength: **moderate candidate**, to be tested against complete domestic task routes.  
Later owner: HFI-03D/04B/05B.

### `HFI-02D-P6` — reduced reserve is a robustness test

> **Fatigue and divided attention are not separate design categories; they are stress tests of whether ordinary geometry remains forgiving when human reserve is lower than nominal.**

Strength: **moderate-to-strong method proposition**.  
Later owner: HFI-05A/05D.

---

# 10. Rejected hypotheses

## 10.1 “Carrying proves corridors and stairs should simply be wider” — rejected

The evidence does not produce a generic width increment for carrying. Geometry must be tested by task, object, turns, doors, support and proportionality.

## 10.2 “A light object is irrelevant” — rejected

A light object can occupy hands or obstruct near-field vision even when muscular demand is trivial.

## 10.3 “A heavy load can be represented only by total kilograms” — rejected

Asymmetry and how the load is carried materially change biomechanics.

## 10.4 “Dual-task evidence creates a universal distraction penalty” — rejected

Cognitive and motor secondary tasks affect movement differently; task type and population matter.

## 10.5 “Two handrails solve carrying on stairs” — rejected

They may improve support availability when one hand is free but cannot solve two-handed loads, poor geometry or all fall mechanisms.

## 10.6 “Users should simply never carry anything on stairs” — rejected as an architectural premise

Behavioural advice may be appropriate for specific high-risk users. Ordinary family-house design cannot classify all predictable inter-storey carrying as misuse.

## 10.7 “Design for the heaviest conceivable domestic load” — rejected

That would convert rare/user-specific conditions into permanent geometric inflation without an evidence/proportionality chain.

## 10.8 “Fatigue means add a fixed safety factor to dimensions” — rejected

No reviewed evidence supports one numerical fatigue multiplier for domestic geometry.

## 10.9 “Pregnancy requires a distinct geometric standard here” — rejected

Pregnancy remains a representative temporary state in HFI-01C. 02D found no basis for a pregnancy-specific movement dimension; later bathroom/storage/task work may identify specific mechanisms without treating pregnancy as disability.

---

# 11. Reference House consequences at this stage

No pass/fail audit occurs before HFI-07.

The current house nevertheless exposes specific later questions.

| Current condition | 02D disposition |
|---|---|
| `280 mm` going / `183.33 mm` rise | unchanged; 02B remains controlling research |
| three straight flights / full landings / no winders | qualitatively compatible with predictable carrying transitions; not a pass |
| provisional `~1000 mm` clear stair width | not a carrying target; later width-between-rails / adaptation / passing conflict remains unresolved |
| second handrail | live candidate only; no requirement created |
| upper sleeping/bathing + ground utility | vertical laundry/cleaning route becomes an explicit HFI-03D audit case, not a defect |
| principal entrance → kitchen/garden routes | groceries/tray scenarios remain explicit HFI-03D/03B cases |
| final doors/swings at stair/route transitions | not modelled sufficiently for 02D judgement |
| low-light/lighting controls | remains HFI-04C/environmental interface; no lux target here |

The packet creates **no stale DRW artefact** because it changes no architecture.

---

# 12. Evidence limits and open questions

02D deliberately leaves several holes visible.

1. No sufficiently applicable direct study of **real domestic child carrying on stairs** was identified in this bounded packet search; box/load studies must not be presented as identical.
2. Most load-carriage stair studies use **young healthy adults and short laboratory stairs**.
3. High experimental loads such as `20% body weight` illuminate mechanism but should not be treated as ordinary household design loads.
4. Adult near-field **visual occlusion from bulky domestic loads** is less directly evidenced than stair vision/attention generally; the mechanism is plausible but an independent risk magnitude is not quantified here.
5. Direct evidence connecting domestic **door/threshold choreography while carrying** to fall/injury outcomes is limited; later route analysis should therefore treat load-down/regrip as an observed friction mechanism, not a quantified accident predictor.
6. Physical fatigue, sleep loss and cognitive distraction are different states. HFI may use all as robustness tests but must not merge them into one pseudo-clinical condition.
7. No evidence reviewed here justifies a universal **carried-object envelope**; HFI-03C owns representative object envelopes and swept paths.
8. No evidence reviewed here proves an optimal **number of doors/turns** on a domestic carrying route; HFI-03D/05B must judge frequency, consequence and architectural burden.

---

# 13. Handoff

HFI-02D completes the HFI-02 research group by adding reduced-reserve and carrying mechanisms to the anthropometry, stair/fall-risk and vertical-life-course evidence already frozen.

It hands forward:

- `02D-P1` attention margin;
- `02D-P2` carrying as multi-mechanism;
- `02D-P3` transition protection;
- `02D-P4` recovery/support opportunity;
- `02D-P5` repeated carrying choreography;
- `02D-P6` reduced reserve as robustness test;
- explicit evidence limits preventing width inflation or pseudo-precision;
- the vertical laundry/cleaning route as a later Reference House audit case;
- groceries, tray/garden and child-carrying scenarios as route/task questions rather than current defects.

No Ovid's House target is created.

**Exact next packet:** `HFI-03A — circulation geometry`.
