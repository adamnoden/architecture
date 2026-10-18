# HFI-02B — Stairs and Fall-Risk Evidence

**Packet:** HFI-02B  
**Programme:** [`docs/development/human-factors-low-friction-inhabitation-programme.md`](../../docs/development/human-factors-low-friction-inhabitation-programme.md)  
**Execution plan:** [`docs/development/human-factors-low-friction-inhabitation-execution-plan.md`](../../docs/development/human-factors-low-friction-inhabitation-execution-plan.md)  
**Owning issue:** #195  
**Baseline `main`:** `79b55304b3d228b765a594f4495ed00acebcd8fd`  
**Prior packet:** HFI-02A — anthropometry, reach and operating force  
**Question:** what stair geometry, consistency, support and perceptual evidence is strong enough to constrain later HFI reasoning about ordinary domestic stairs, and what remains too uncertain to become an Ovid's House target?  
**Boundary:** evidence synthesis and candidate comparison regions only. This packet does **not** set an Ovid's House stair target, pass/fail the Reference House, change RH-C5, select a handrail detail, define construction tolerances, create doctrine/patterns, or add compiler proof.

---

## 1. Purpose

Stairs are a useful test of the whole HFI method because apparently simple dimensional rules mix several different questions:

- legal/guidance correspondence;
- foot accommodation;
- balance and fall-risk mechanisms;
- comfort and preference;
- geometric consistency and workmanship;
- hand support and balance recovery;
- visual legibility;
- plan-area and architectural consequences.

Those questions must not be collapsed into one number.

The original HFI trigger included the experience of a large-footed occupant feeling that shallow domestic treads demand continuous conscious foot placement. That is a legitimate **research trigger**. It is not evidence that the current Reference House going is wrong.

HFI-02B therefore tests the trigger adversarially.

The controlling separation is:

1. **legal/guidance correspondence** — what current England rules/guidance permit or recommend;
2. **evidence-supported comparison region** — what empirical and professional evidence makes credible for safety/usability comparison;
3. **Ovid's House target** — a later project judgement that can only be derived after proportionality and conflict review.

Only the first two are in scope here.

---

# 2. Controlled Reference House facts — comparison only

The current Reference House facts remain those frozen upstream. They receive no incumbency advantage in this packet.

| Item | Current represented value / position | HFI-02B treatment |
|---|---:|---|
| first-floor level | `+3300 mm` | source fact only |
| total risers | `18` | source fact only |
| flights | `3 × 6 risers` | source fact only |
| goings per flight | `5` | source fact only |
| going | `280 mm` | compared with evidence; not target |
| derived rise | `183.333 mm` | compared with evidence; not target |
| derived pitch | `33.215°` | compared with evidence; not target |
| `2R+G` | `646.667 mm` | RH-C5 correspondence input only |
| clear flight width | `1000 mm` provisional | **not judged here**; 02C/03A interaction |
| stair reservation | `2400–2500 mm` provisional | burden input later; not judged here |
| landing strategy | full landings; no winders | architectural position, evidence-tested qualitatively |
| headroom intent | `≥2000 mm` | current guidance correspondence; no stronger HFI value earned here |

RH-C5 remains untouched. Its `ADK-2013-PRIVATE-STAIR-GEOMETRY` method checks selected numeric correspondence with Approved Document K only. HFI-02B does not rewrite the external method merely because stronger project geometry might later be preferred.

---

# 3. Evidence additions and applicability

These records extend the HFI-01B evidence architecture for the stair packet. Each record preserves source class, scope and nonclaims.

## `HFI-SRC-S01` — Building Regulations 2010, Requirement K1

- **Source:** The Building Regulations 2010, Schedule 1, Part K, Requirement K1 — stairs, ladders and ramps.
- **Date/version:** current legislation status checked 2026-10-18.
- **Jurisdiction / population:** England; buildings to which K1 applies.
- **Class:** `LAW`.
- **Authority / status:** binding legal requirement where applicable.
- **Applicability:** stairs, ladders and ramps must be designed, constructed and installed so as to be safe for people moving between levels.
- **Known limits / nonclaims:** K1 does not itself prescribe an ergonomic optimum or Ovid's House stair geometry.
- **Access state:** official legislation publicly accessible.
- **Checked:** 2026-10-18.
- **Canonical location:** https://www.legislation.gov.uk/uksi/2010/2214/schedule/1/part/K

## `HFI-SRC-S02` — Approved Document K, 2013 edition

- **Source:** HM Government, *Approved Document K: protection from falling, collision and impact*.
- **Date/version:** 2013 edition; current GOV.UK status checked 2026-10-18.
- **Jurisdiction / population:** England; statutory guidance, including private stairs in dwellings.
- **Class:** `STATUTORY-GUIDANCE`.
- **Authority / status:** official guidance to relevant Building Regulations requirements.
- **Applicability:** current private-stair guidance for rise, going, pitch, consistency, headroom, landings, handrails and guarding.
- **Relevant current correspondence:** private stair rise `150–220 mm`; going `220–300 mm`; maximum pitch `42°`; `2R+G` `550–700 mm`; current project RH-C5 already checks this bounded numeric subset.
- **Known limits / nonclaims:** guidance values are not evidence that the lower/upper legal envelope is comfortable or optimal; RH-C5 does not prove whole K1 compliance, stair usability or HFI adequacy.
- **Access state:** official full document publicly accessible.
- **Checked:** 2026-10-18.
- **Canonical location:** https://www.gov.uk/government/publications/protection-from-falling-collision-and-impact-approved-document-k

## `HFI-SRC-S03` — 2025 England domestic-stair research

- **Source:** Rise and Going Consultancy, *Evidence to support potential changes to Approved Document K guidance on domestic stairs*, commissioned by the then Department for Levelling Up, Housing and Communities.
- **Date/version:** research prepared 2023; published by MHCLG 28 October 2025.
- **Jurisdiction / population:** England domestic-stair guidance review; evidence review plus commissioned/legacy experimental work.
- **Class:** `GOVERNMENT-RESEARCH`.
- **Authority / status:** government-commissioned technical research. GOV.UK explicitly states that findings and recommendations do **not** represent government policy or guidance.
- **Applicability:** domestic rise/going, subjective acceptability, overstep-risk modelling, dimensional consistency and second-handrail questions.
- **Known limits / nonclaims:** literature review was not a comprehensive systematic review; parts of the experimental evidence are older; some source work was conference/unpublished government research; modelled overstep-risk reductions depend on model assumptions and are not direct population accident probabilities.
- **Access state:** full public report.
- **Checked:** 2026-10-18.
- **Canonical location:** https://www.gov.uk/government/publications/evidence-to-support-potential-changes-to-approved-document-k-guidance-on-domestic-stairs

## `HFI-SRC-S04` — BS 5395-1:2010

- **Source:** BSI, *BS 5395-1:2010 — Stairs. Code of practice for the design of stairs with straight flights and winders*.
- **Date/version:** published 28 February 2010; BSI lists the 2010 edition as current on 2026-10-18.
- **Jurisdiction / population:** UK professional/technical practice; broad stair types/buildings.
- **Class:** `CONSENSUS-STANDARD`.
- **Authority / status:** current British Standard code of practice; non-statutory unless separately required.
- **Applicability:** stair design practice including dimensions, landings, handrails, surfaces, slip and lighting considerations.
- **Known limits / nonclaims:** broad-scope code of practice, not empirical proof that one value is optimal for a private dwelling; full clause-level adoption requires licensed text and applicability checking.
- **Access state:** BSI metadata/overview public; full standard licensed.
- **Checked:** 2026-10-18.
- **Canonical location:** https://knowledge.bsigroup.com/products/stairs-code-of-practice-for-the-design-of-stairs-with-straight-flights-and-winders

## `HFI-SRC-S05` — Di Giulio et al. 2020 going experiment

- **Source:** Di Giulio I et al., *Stair Gait in Older Adults Worsens With Smaller Step Treads and When Transitioning Between Level and Stair Walking*.
- **Date/version:** Frontiers in Sports and Active Living, 25 June 2020, 2:63.
- **Jurisdiction / population:** experimental study; 21 younger adults and 20 older adults, older mean age about 74 years.
- **Class:** `PEER-REVIEWED-EMPIRICAL`.
- **Authority / status:** peer-reviewed empirical evidence; non-statutory.
- **Applicability:** stair-going effect on gait velocity, foot clearance, foot overhang, trunk rotation, handrail use and transition effects; tested goings `175, 225, 275, 325 mm`.
- **Known limits / nonclaims:** laboratory stair; modest sample; does not identify one universal safe going or directly compare `280` with `300 mm`.
- **Access state:** open-access full article.
- **Checked:** 2026-10-18.
- **DOI:** https://doi.org/10.3389/fspor.2020.00063

## `HFI-SRC-S06` — Ackermans et al. 2020 older-adult step-dimension study

- **Source:** Ackermans TMA et al., *Stair negotiation behaviour of older individuals: Do step dimensions matter?*
- **Date/version:** Journal of Biomechanics 101 (2020), 109616.
- **Jurisdiction / population:** Liverpool, UK; 68 independently living adults older than 65 years.
- **Class:** `PEER-REVIEWED-EMPIRICAL`.
- **Authority / status:** peer-reviewed empirical evidence; non-statutory.
- **Applicability:** comparison of older-adult stepping profiles on `150 rise / 280 going` and `200 rise / 250 going` stairs.
- **Known limits / nonclaims:** participants were able to negotiate both test stairs step-over-step without handrail/aid; many biomechanical behaviour profiles persisted across the two geometries, so stair geometry cannot be treated as the sole determinant of individual fall risk.
- **Access state:** abstract/metadata public; journal full text subject to access route.
- **Checked:** 2026-10-18.
- **DOI:** https://doi.org/10.1016/j.jbiomech.2020.109616

## `HFI-SRC-S07` — Francksen et al. 2020 inconsistent-riser study

- **Source:** Francksen NC et al., *Negotiating stairs with an inconsistent riser: Implications for stepping safety*.
- **Date/version:** Applied Ergonomics 87 (2020), 103131.
- **Jurisdiction / population:** experimental younger and older adults; `n=26` younger, `n=33` older.
- **Class:** `PEER-REVIEWED-EMPIRICAL`.
- **Authority / status:** peer-reviewed empirical evidence; non-statutory.
- **Applicability:** mechanism by which a `10 mm` inconsistent high riser alters ascent clearance and descent foot contact.
- **Known limits / nonclaims:** one controlled defect magnitude and laboratory stair; does not itself set a construction tolerance.
- **Access state:** abstract/metadata public.
- **Checked:** 2026-10-18.
- **DOI:** https://doi.org/10.1016/j.apergo.2020.103131

## `HFI-SRC-S08` — Francksen et al. 2022 inconsistent-going study

- **Source:** *Underlying mechanisms of fall risk on stairs with inconsistent going size*.
- **Date/version:** Applied Ergonomics 101 (2022), 103678.
- **Jurisdiction / population:** experimental younger and older adults.
- **Class:** `PEER-REVIEWED-EMPIRICAL`.
- **Authority / status:** peer-reviewed empirical evidence; non-statutory.
- **Applicability:** altered foot clearance/contact and variability produced by inconsistent going size.
- **Known limits / nonclaims:** controlled experimental inconsistency; does not establish an Ovid's House workmanship tolerance by itself.
- **Access state:** abstract/metadata public.
- **Checked:** 2026-10-18.
- **DOI:** https://doi.org/10.1016/j.apergo.2022.103678

## `HFI-SRC-S09` — Irvine, Snook and Sparshatt 1990 preference study

- **Source:** Irvine CH, Snook SH, Sparshatt JH, *Stairway risers and treads: acceptable and preferred dimensions*.
- **Date/version:** Applied Ergonomics 21(3), September 1990, 215–225.
- **Jurisdiction / population:** US psychophysical experiment; six experiments across 19 stair configurations.
- **Class:** `PEER-REVIEWED-EMPIRICAL`.
- **Authority / status:** peer-reviewed preference/acceptability evidence; non-statutory.
- **Applicability:** subjective stair-dimension preference. Reported optimum in that experiment was `183 mm` rise and `279 or 300 mm` tread/run.
- **Known limits / nonclaims:** old study; US sample; preference is not fall-risk proof; the numerical coincidence with current RH `183.333/280` is not validation of the Reference House.
- **Access state:** abstract/metadata public; full journal article licensed.
- **Checked:** 2026-10-18.
- **DOI:** https://doi.org/10.1016/0003-6870(90)90005-I

## `HFI-SRC-S10` — Reeves et al. 2008 light-handrail study

- **Source:** Reeves ND et al., *Influence of light handrail use on the biomechanics of stair negotiation in old age*.
- **Date/version:** Gait & Posture 28(2), August 2008, 327–336.
- **Jurisdiction / population:** 13 older adults negotiating a purpose-built stair with and without light handrail use.
- **Class:** `PEER-REVIEWED-EMPIRICAL`.
- **Authority / status:** peer-reviewed empirical evidence; non-statutory.
- **Applicability:** handrail use as balance/support input during ordinary stair negotiation in older adults.
- **Known limits / nonclaims:** small sample; light voluntary use is not equivalent to an unexpected fall-arrest event or proof that two rails reduce population fall incidence.
- **Access state:** abstract/metadata public.
- **Checked:** 2026-10-18.
- **DOI:** https://doi.org/10.1016/j.gaitpost.2008.01.014

## `HFI-SRC-S11` — Gosine, Komisar and Novak 2021 handrail-force study

- **Source:** Gosine P, Komisar V, Novak AC, *The effect of handrail cross-sectional design and age on applied handrail forces during reach-to-grasp balance reactions*.
- **Date/version:** Journal of Biomechanics 129 (2021), 110788.
- **Jurisdiction / population:** 16 older and 16 sex-matched younger adults; perturbation/balance-recovery experiment.
- **Class:** `PEER-REVIEWED-EMPIRICAL`.
- **Authority / status:** peer-reviewed empirical evidence; non-statutory.
- **Applicability:** ability to generate recovery forces using different handrail cross-sections after balance loss.
- **Useful observation:** among seven tested cross-sections, a `38 mm` round rail supported recovery from the largest perturbations and high force generation; tapered rails performed worst in that experiment.
- **Known limits / nonclaims:** laboratory perturbation; small sample; does not establish a universal domestic handrail diameter or override architectural/guarding/clearance constraints.
- **Access state:** abstract/metadata public.
- **Checked:** 2026-10-18.
- **DOI:** https://doi.org/10.1016/j.jbiomech.2021.110788

## `HFI-SRC-S12` — Gosine, Komisar and Novak reach-to-grasp study

- **Source:** Gosine P, Komisar V, Novak AC, *The Effect of Handrail Cross-Sectional Design and Age on the Speed and Quality of Reach-To-Grasp Reactions to Recover Balance*.
- **Date/version:** first online 23 April 2022; Human Factors 66(1), 2024, 56–70.
- **Jurisdiction / population:** younger and older adult laboratory perturbation experiment.
- **Class:** `PEER-REVIEWED-EMPIRICAL`.
- **Authority / status:** peer-reviewed empirical evidence; non-statutory.
- **Applicability:** speed/quality of reactive handrail grasp after balance loss and effect of rail cross-section.
- **Known limits / nonclaims:** reactive-recovery experiment rather than ordinary domestic handrail preference; should be triangulated with force and use evidence.
- **Access state:** open-access article.
- **Checked:** 2026-10-18.
- **DOI:** https://doi.org/10.1177/00187208221082439

## `HFI-SRC-S13` — Bjelica, Levine and Novak 2021 contrast study

- **Source:** Bjelica M, Levine IC, Novak AC, *Increasing the contrast of tread edge highlighters improves stair descent safety in older adults with simulated visual impairment*.
- **Date/version:** Applied Ergonomics 97 (2021), 103525.
- **Jurisdiction / population:** 13 older adults; normal/low light, simulated blurred/normal vision, `0/30/50/70%` contrast conditions.
- **Class:** `PEER-REVIEWED-EMPIRICAL`.
- **Authority / status:** peer-reviewed empirical evidence; non-statutory.
- **Applicability:** tread-edge contrast and descent biomechanics under visual/light variation.
- **Known limits / nonclaims:** small sample; simulated visual impairment; one experimental stair. The paper's `≥50%` recommendation is useful evidence but is not automatically an Ovid's House contrast requirement.
- **Access state:** abstract/metadata public.
- **Checked:** 2026-10-18.
- **DOI:** https://doi.org/10.1016/j.apergo.2021.103525

## `HFI-SRC-S14` — Agha, Levine and Novak 2021 nosing-shape study

- **Source:** Agha S, Levine IC, Novak AC, *Determining the effect of stair nosing shape on foot trajectory during stair ambulation in healthy and post-stroke individuals*.
- **Date/version:** Applied Ergonomics 91 (2021), 103304.
- **Jurisdiction / population:** 14 healthy older adults and 14 older adults with chronic stroke.
- **Class:** `PEER-REVIEWED-EMPIRICAL`.
- **Authority / status:** peer-reviewed empirical evidence; non-statutory.
- **Applicability:** round, square, tapered and no-nosing effects on foot clearance/overhang and step variability.
- **Useful observation:** tapered nosing provided the safest combined result among the tested shapes in that study.
- **Known limits / nonclaims:** small sample, Canadian laboratory context and selected nosing geometries; not sufficient alone to choose the Reference House stair edge detail.
- **Access state:** abstract/metadata public.
- **Checked:** 2026-10-18.
- **DOI:** https://doi.org/10.1016/j.apergo.2020.103304

## `HFI-SRC-S15` — Elkin et al. top-of-flight defect study

- **Source:** Elkin BS, Montgomery RE, Novak AC, Siegmund GP, *A top-of-flight stairway defect affects foot overhang on lower steps during stair descent*.
- **Date/version:** online 22 November 2025; Applied Ergonomics 132, April 2026, 104695.
- **Jurisdiction / population:** experimental adults `n=27` descending a seven-step stair.
- **Class:** `PEER-REVIEWED-EMPIRICAL`.
- **Authority / status:** peer-reviewed empirical evidence; non-statutory.
- **Applicability:** downstream effects of an upper-flight dimensional defect on later foot overhang.
- **Known limits / nonclaims:** modest sample and one defect configuration; two authors declared forensic-consulting interests. Supports consistency mechanism rather than a universal construction tolerance.
- **Access state:** abstract/metadata public.
- **Checked:** 2026-10-18.
- **DOI:** https://doi.org/10.1016/j.apergo.2025.104695

## `HFI-SRC-S16` — 2026 BSR general-access/utility-stair report

- **Source:** Building Safety Regulator / Rise and Going Consultancy, *Approved Document K: general access and utility stairs*.
- **Date/version:** published 14 October 2026.
- **Jurisdiction / population:** England; **general access and utility stairs**, not private domestic stairs.
- **Class:** `GOVERNMENT-RESEARCH`.
- **Authority / status:** current independent technical report supporting possible future Approved Document K review; not current statutory guidance.
- **Applicability:** corroborative evidence on step geometry and overstep risk; useful comparator for the direction of travel in current stair-safety research.
- **Known limits / nonclaims:** scope mismatch prevents importing its proposed general-access geometry directly into the Reference House private stair.
- **Access state:** executive summary and report publicly accessible.
- **Checked:** 2026-10-18.
- **Canonical location:** https://www.gov.uk/government/publications/approved-document-k-general-access-and-utility-stairs

---

# 4. Going: strongest geometric signal, nonlinear benefit

## 4.1 Legal guidance is deliberately broad

Approved Document K allows a private-stair going from `220` to `300 mm`, subject to the other dimensional rules.

That is a compliance envelope, not a claim that `220 mm` and `300 mm` offer equivalent human performance.

HFI therefore rejects:

> `220 mm is permitted, therefore 220 mm is good domestic geometry.`

## 4.2 Smaller goings worsen foot-placement conditions

The strongest convergent mechanism in the evidence is that going governs available support for the foot, especially in descent.

Di Giulio et al. tested `175, 225, 275 and 325 mm` goings. As going reduced:

- gait speed reduced;
- horizontal clearance reduced in ascent;
- trunk rotation increased in descent;
- foot overhang increased in ascent and descent;
- older participants used the handrail more.

The mechanism is therefore not simply “large feet feel cramped”. Going changes the available base of support and the stepping strategy itself.

## 4.3 Current England research suggests diminishing returns, not infinite generosity

The 2025 domestic-stair report is valuable because it asks directly where greater going stops buying much additional subjective benefit.

Its fixed-rise subjective trials found marked improvement as going increased through the smaller conditions. For the statement equivalent to “I felt safe walking down stairs”, significant differences were concentrated through the range up to about `275 mm`; tested goings above that did not continue producing statistically distinct subjective improvements in the same way.

Separately, the report's overstep-risk model predicts continuing benefit from `275` toward `300 mm` and above, but those exact percentage reductions are model-dependent rather than direct accident-rate observations.

The correct inference is therefore:

> **Going has a strong safety/usability mechanism, but benefit is nonlinear. Around 275 mm the subjective evidence is already in a materially better region; 300 mm retains a credible additional foot-accommodation / overstep-risk case but is not “free safety”.**

## 4.4 Candidate comparison region

For later HFI proportionality, `275–300 mm` is a defensible **candidate comparison region** for an ordinary private domestic stair.

This is not an Ovid's House target.

It means later work should compare plausible choices inside this region—including the current `280 mm`—rather than compare one favoured generous stair only against the legal minimum.

### Current RH implication

The current Reference House `280 mm` going is **not shown by HFI-02B to be wrong**.

It sits inside the candidate region and close to:

- the point at which the 2025 subjective study shows diminishing distinction between larger goings;
- the `279/300 mm` preference result from the older Irvine et al. study;
- the `275 mm` condition in contemporary older-adult biomechanics that materially outperforms smaller goings.

Conversely, none of those facts proves `280 mm` is the best Ovid's House choice. `300 mm` remains a credible later comparison because it may buy additional foot support and overstep margin for modest incremental plan burden.

The later question is therefore **280 vs a stronger alternative such as 300**, not “280 must change because the programme began with a complaint about shallow treads.”

---

# 5. Rise: lower is not monotonically better

Approved Document K permits `150–220 mm` private-stair rise.

The evidence makes three points.

## 5.1 Higher rises increase physical demand

Biomechanics literature and the 2025 government review consistently treat higher rise as increasing lower-limb demand. Values above about `200 mm` become increasingly difficult for older/reduced-capability users and are a weak place to start a low-friction domestic stair.

## 5.2 Very low rise has its own problems

Very low steps are not automatically safer. The 2025 synthesis notes that very small rises can become less perceptually obvious and can greatly lengthen the flight. The 1990 preference experiments also found very low rises unattractive.

This rejects:

> `smaller rise is always better.`

## 5.3 Candidate comparison region

The evidence supports a broad serious-comparison region of roughly `150–200 mm`, with the strongest ordinary-domestic comparison concentrated around approximately `160–185 mm` rather than at either statutory extreme.

That narrower region is deliberately **not** called an evidence-mandated target. It reflects convergence among:

- common accessible/gentler-stair guidance;
- the 2025 England review;
- experimental conditions around `170–180 mm`;
- the historical preference optimum around `183 mm`.

### Current RH implication

The current derived rise `183.333 mm` is near the upper edge of that concentrated comparison region but is **not established as a defect**.

A later 280-vs-300 going comparison cannot change going in isolation: floor-to-floor height, riser count, flight run, landings and architectural reservation must be re-evaluated as a system.

---

# 6. Pitch and `2R+G`: derived geometry versus inherited formula

## 6.1 Pitch

Approved Document K's `42°` private-stair maximum is a statutory-guidance boundary, not a comfort target.

For plausible candidate rise/going combinations around the regions above, pitch naturally falls materially below that ceiling—roughly high-20s to low/mid-30s degrees depending on the selected pair.

HFI-02B therefore treats pitch primarily as a **derived check on the selected rise/going pair**, not as the variable to optimise first.

The current RH pitch `33.215°` is within a plausible evidence-supported comparison region. It is not proved optimal or defective here.

## 6.2 `2R+G`

The current Approved Document K correspondence rule `550–700 mm` remains binding inside RH-C5's declared external-guidance method.

It is not adopted as HFI's primary comfort/safety optimiser.

The 2025 England report explicitly revisits the historic formula and notes that it can constrain greater goings even where the safety mechanism points toward more tread depth.

Therefore:

- RH-C5 keeps checking `2R+G` exactly as its external method requires;
- HFI may later prefer a stair within the legal/guidance envelope for reasons not reducible to `2R+G`;
- HFI must not rewrite the Approved Document method to make a preferred house geometry pass.

---

# 7. Dimensional consistency: strong evidence, separate from nominal geometry

Nominal rise/going and consistency are separate safety variables.

Francksen et al. found that a single `10 mm` inconsistent high riser changed foot clearance/contact in both younger and older adults. Participants did not adequately anticipate and compensate before the defective step.

The inconsistent-going study similarly found altered foot contact/clearance and increased variability under local going inconsistency.

The recent Elkin et al. study is particularly useful because a top-of-flight defect changed foot overhang several steps **downstream** from the defect, even where later step geometry was uniform.

The architectural implication is strong:

> **A stair should not merely have good nominal dimensions; the transition from landing to first step and the repeated geometry through the flight must be predictably consistent.**

However, HFI-02B does **not** convert experimental `10 mm` defects, the 2025 report's worked tolerances or any one study into an Ovid's House construction tolerance.

A final tolerance is a delivery/workmanship question requiring:

- the selected stair construction;
- achievable fabrication/site tolerance;
- finish build-up;
- datum strategy;
- measurement convention;
- technical review.

The strong HFI proposition is **consistency matters**. The millimetre tolerance remains downstream.

---

# 8. Descent and transition deserve more weight than a static section

Stair descent repeatedly emerges as the more demanding direction because reduced support/overhang and visual estimation of the next edge matter strongly.

The Di Giulio study also found that transition between level walking and stair walking matters. The user does not materialise in a perfect steady-state gait halfway down a flight; entry and exit are part of the task.

This matters for:

- top/bottom landing geometry;
- first/last riser consistency;
- visual edge information;
- approach alignment;
- nearby door/turn choreography.

HFI therefore rejects stair evaluation based only on a section drawing of one ideal repeated tread.

Later Reference House audit must consider the **whole approach → landing → flight → landing sequence** where geometry exists.

---

# 9. Landings and winders

The current Reference House uses three straight flights with full landings and no winders.

That position is compatible with the present evidence in the limited sense that it:

- avoids varying inner/outer going within a winder;
- provides explicit transition/recovery zones;
- makes repeated tread geometry easier to understand and construct consistently.

But HFI-02B does not create a universal rule that more landings are always safer.

Reasons for restraint:

- every transition is itself a gait/perceptual transition;
- additional landings increase total route length and area;
- people with low vision can find level-to-stair transitions demanding;
- no evidence reviewed here establishes an optimum number of landings for a domestic floor-to-floor rise.

The useful proposition is:

> **Where a landing is used, it should provide a credible transition and recovery zone without creating local pinch, door conflict or dimensional inconsistency.**

Exact landing dimensions remain HFI-03A / HFI-06B territory, with stair-lift/assistance implications in HFI-02C.

---

# 10. Handrails: ordinary support and reactive recovery are different benefits

Handrails have at least three human-factors roles:

1. light support/guidance during ordinary movement;
2. optional support for users with lower balance/strength reserve;
3. a reactive grasp/recovery surface after perturbation or misstep.

The evidence is stronger when those roles remain distinct.

## 10.1 A graspable rail is materially useful

Reeves et al. found that even light handrail use changed older-adult stair biomechanics in ways consistent with improved stability/support.

Reactive-balance studies show that users can apply substantial multidirectional forces after balance loss and that the ability to reach, grasp and load the rail matters.

This is not decorative trim. It is a functional support/recovery interface.

## 10.2 Cross-section matters

The Gosine/Komisar/Novak experiments show that handrail cross-section affects both grasp quality and force generation. In the tested recovery experiment, a `38 mm` round rail performed especially well, while tapered rails performed poorly.

`38 mm round` is therefore a credible **candidate evidence point** for later detail comparison.

It is not yet an Ovid's House handrail standard.

## 10.3 One rail versus two

The 2025 domestic-stair research gives a nuanced answer.

Participants/focus groups valued choice of either side, especially in descent and under carrying/use variation. Two rails can support:

- dominant/preferred hand choice;
- one-side temporary impairment;
- carrying with one hand occupied;
- support on both ascent/descent orientations;
- reactive access to a rail after a disturbance.

But the report does **not** establish that simply adding a second rail will significantly reduce population fall incidence for users who do not ordinarily use rails.

Therefore HFI rejects:

> `two handrails automatically solve domestic stair falls.`

The stronger proposition is:

> **A second usable rail has credible support, recovery, life-course and carrying value; whether it earns permanent spatial provision must be tested against clear width, stair reservation, guarding, architecture and actual user scenarios.**

If later Ovid's House work prefers two rails, usable stair width should be evaluated as the width **between the effective rail/support envelopes**, not merely wall-to-wall shell width.

The current provisional `1000 mm` clear-flight figure is not judged in HFI-02B; width/adaptation interaction belongs to 02C/03A.

---

# 11. Visual legibility, lighting and tread-edge information

The evidence supports a general proposition more strongly than an exact photometric/contrast target:

> **A person descending a stair benefits from being able to identify the tread edge reliably under plausible domestic visual conditions.**

## 11.1 Contrast helps

Bjelica et al. found improved descent measures at higher edge-contrast conditions, particularly under simulated visual impairment. Their small study proposed at least `50%` contrast as a useful balance of performance/safety under the tested setup.

That number is **not** promoted to an Ovid's House threshold because:

- `n=13`;
- simulated rather than naturally occurring visual impairment;
- one stair/material/lighting arrangement;
- contrast measurement and ageing/material maintenance matter in practice.

HFI-06 may later decide whether a numerical contrast requirement is justified after broader evidence review.

## 11.2 Edge treatment must describe the real edge

The broader stair-vision literature reviewed for the programme supports placing visual information at the true tread edge rather than setting a highlighter substantially back from it, because a displaced cue can itself distort foot placement.

## 11.3 Avoid perceptual noise

Busy patterned stair surfaces can make edge extraction harder, particularly for low-vision/older users. This aligns with Repose / Low Vigilance without requiring a clinically styled stair.

The project implication is not “paint every stair like an institution”. It is to make tread geometry **legible rather than visually ambiguous**, using material/edge detail that can be architecturally integrated.

## 11.4 Lighting

Low illumination can worsen stair negotiation, but visual acuity/contrast impairment can matter at least as much as illuminance in some experiments.

HFI-02B therefore does not derive a standalone lux target. Lighting remains a joint HFI/environmental/electrical question and later control/lighting work should preserve:

- useful illumination at the stair;
- avoidance of edge-obscuring glare;
- clear transition perception;
- reliable lighting control where needed before stair use.

---

# 12. Nosing and tread edge geometry

Nosing shape changes the effective relationship between tread edge and foot trajectory.

Agha et al. compared no, square, round and tapered nosings in healthy and post-stroke older adults. Tapered and round shapes improved different foot-clearance/overhang measures, but the round shape also showed greater step-to-step variability; the authors judged tapered the safest combined tested option.

This is useful evidence that the stair edge should be designed as a human interface rather than drawn as an arbitrary decorative profile.

It is insufficient to establish a universal Ovid's House nosing detail because:

- sample size was small;
- only selected profiles were tested;
- flooring/slip/material/visual contrast interact with geometry;
- technical stair construction and wear matter.

Result: **candidate detail evidence only**. No nosing target is created by HFI-02B.

---

# 13. Headroom

Current Approved Document K guidance uses `2.0 m` headroom for ordinary stairs, subject to its detailed measurement conditions/exceptions.

HFI-02A established that taller-body accommodation must use the relevant tall-body/posture tail rather than average stature, but HFI-02B did not find strong contemporary domestic evidence supporting a specific preferred value materially above `2.0 m`.

Therefore:

- `2.0 m` remains a current statutory-guidance correspondence point;
- low headroom remains an obvious collision/attention hazard;
- HFI does **not** invent a stronger numerical target from intuition alone;
- any later additional margin must be justified by evidence, geometry/proportionality and actual headroom representation.

The current Reference House headroom intent is consequently **not judged beyond its existing guidance correspondence**.

---

# 14. Carrying and occupied hands — bounded handoff to HFI-02D

The stair evidence already shows why carrying matters:

- carrying can occupy one or both hands;
- carried objects can obscure downward view;
- a child/laundry/luggage load changes balance and recovery options;
- a rail only helps if a hand can reach/use it;
- two-side rail availability can preserve a support choice when one side/hand is unavailable.

However, HFI-02B does **not** perform the full carrying/reduced-attention study. That is HFI-02D.

02B carries forward only this constraint:

> **A stair geometry/support judgement made solely for an unencumbered, attentive, two-hands-free adult is incomplete.**

The detailed frequency/consequence/proportionality of carrying scenarios remains untouched until 02D.

---

# 15. Candidate evidence regions — not project targets

The following table is the primary quantitative output of HFI-02B.

| Variable / feature | Evidence-supported comparison position | Confidence / limitation | Current RH relationship |
|---|---|---|---|
| private-stair going | `275–300 mm` is a credible later comparison region | strong directional evidence; exact optimum not established | `280 mm` lies inside region |
| rise | broad serious-comparison region about `150–200 mm`; concentrated ordinary-domestic comparison around `160–185 mm` | exact optimum weaker than going evidence; task/user effects remain | `183.333 mm` near upper edge of concentrated region |
| pitch | derive from selected rise/going; evidence points materially below `42°` legal ceiling for low-friction design | not an independently optimised variable | `33.215°` plausible; no verdict |
| `2R+G` | preserve `550–700 mm` as current external-guidance correspondence | not primary HFI optimiser | `646.667 mm` corresponds; no comfort claim |
| rise/going consistency | high priority | strong convergent mechanism | detailed RH construction tolerance not represented |
| top/bottom transition consistency | high priority | recent empirical support | detailed built geometry not represented |
| full landings / no winders | credible current strategy, not universal rule | exact landing optimum not established | current architecture consistent with evidence direction |
| handrail availability | strong support/recovery value | fall-incidence effect of second rail alone less certain | final rail geometry not represented |
| `38 mm` round rail | credible candidate detail point | small laboratory recovery studies; not target | not represented |
| second handrail | credible candidate for later proportionality/life-course review | width/architecture/carrying interaction unresolved | not judged |
| tread-edge contrast | clearly useful where edge legibility is at risk | exact contrast threshold not yet robust enough | not represented |
| `≥50%` contrast | one study's evidence point | small sample / simulated visual impairment | **not target** |
| tapered nosing | credible candidate detail point | one small empirical study | not represented |
| headroom | retain `2.0 m` guidance correspondence; no stronger HFI number earned | contemporary ergonomic evidence sparse | current intent `≥2.0 m`; no stronger verdict |

These values/features are **candidate research outputs**, not Reference House requirements.

---

# 16. What HFI-02B says about the current Reference House — and what it does not

## 16.1 Going

The current `280 mm` going survives this research packet as a **credible candidate**, not as a proven target.

This is a material correction to the original trigger hypothesis. The research does not support assuming that 280 mm is obviously too shallow merely because a size-11 user experiences some domestic stairs as shallow.

The later useful comparison is likely to be whether `300 mm` earns its additional plan length over `280 mm`, given:

- possible additional foot support / overstep margin;
- three-flight cumulative run consequence;
- stair reservation;
- landing/upper-plan effects;
- whole-house area/carbon/architectural burden.

That is HFI-05B/HFI-06 work, not 02B.

## 16.2 Rise

The current `183.333 mm` rise is not an obvious low-friction optimum, but neither is it shown to be poor. It remains within the serious candidate region.

A lower rise would require a different riser count or floor-to-floor strategy and must therefore be assessed as a system rather than praised abstractly.

## 16.3 Pitch

The current `33.215°` pitch is substantially below the statutory `42°` ceiling and within the range generated by credible candidate rise/going pairs. It is not independently validated.

## 16.4 Full landings / no winders

The current topology survives as a plausible low-friction strategy. No stronger claim is made.

## 16.5 Missing detail remains missing

The Reference House still does not author enough detail to judge:

- exact handrail count/position/cross-section;
- rail continuity and terminations;
- final clear width between rails;
- exact landing usable envelope;
- tread/nosing construction;
- actual built rise/going tolerance;
- edge contrast/material;
- stair lighting;
- final headroom profile through the whole route;
- guarding interaction.

HFI-02B does not draw these details to manufacture a pass/fail result.

---

# 17. Rejected hypotheses / shortcuts

## R1 — foot length directly sets stair going

**Rejected.** Larger feet are relevant, but going interacts with gait, descent overhang, rise, pitch, nosing and footwear. HFI-02A's foot data cannot be converted directly into a tread dimension.

## R2 — the Approved Document K `42°` maximum is a comfort target

**Rejected.** It is a guidance ceiling inside a compliance framework, not evidence that a near-42° private stair is low-friction.

## R3 — `2R+G` proves a stair is comfortable

**Rejected as a primary HFI optimiser.** It remains an external-guidance correspondence check. The 2025 review itself questions its contemporary safety relevance where larger goings are considered.

## R4 — deeper is always better

**Rejected.** Going has a strong beneficial direction, but subjective benefit plateaus/diminishes while plan-area burden continues. Proportionality is required.

## R5 — smaller rise is always better

**Rejected.** Very low rise can create perceptual and route-length problems. The rise/going pair must be assessed together.

## R6 — two handrails automatically reduce fall incidence

**Rejected.** Two usable rails have credible support/recovery/carrying/life-course benefits, but evidence is not strong enough to claim that the second rail alone materially reduces population fall incidence in all ordinary domestic use.

## R7 — `38 mm round` is now the Ovid's House rail standard

**Rejected.** It is a strong candidate evidence point from balance-recovery experiments, not a project target.

## R8 — `50%` tread-edge contrast is now the project threshold

**Rejected.** Useful empirical point; insufficient evidence breadth for universal adoption here.

## R9 — more landings are always safer

**Rejected / unsupported.** Landings can support rest/recovery and straight-flight topology, but transitions and area have their own effects.

## R10 — the 1990 `183/279–300` preference result validates the current RH stair

**Rejected.** The numerical coincidence is interesting, not proof. The study is old and preference-focused.

## R11 — the user's large-foot trigger proves the current `280 mm` going is wrong

**Rejected.** The trigger correctly opened the question; current evidence places `280 mm` inside a credible domestic comparison region.

## R12 — current coordination/drawings protect the RH stair from later change

**Rejected.** If later proportionality/target work selects a different stair, RH-03 must rewind regardless of downstream coordination cost.

---

# 18. Forward obligations

## HFI-02C — vertical life-course

Carry forward:

- rail availability and usable width interaction;
- stair-lift compatibility;
- landing/turning envelope;
- assistance;
- whether a future lift/reservation is proportionate;
- entrance-level living/bathing as alternative adaptation strategy.

Do **not** assume the current `1000 mm` provisional clear width is sufficient merely because 02B did not judge it.

## HFI-02D — carrying / reduced attention

Carry forward:

- rail availability when one/both hands are occupied;
- visibility of treads while carrying;
- child/laundry/luggage scenarios;
- fatigue/distraction and ordinary low-attention use.

## HFI-03A — circulation geometry

Carry forward:

- stair approach/landing transitions;
- door/corner conflicts near stair entry/exit;
- clear width measured against actual rail/support geometry.

## HFI-04 / HFI-05C

Carry forward:

- integrated stair lighting/control;
- tread-edge material/contrast;
- nosing/slip detail;
- guarding/handrail architecture;
- structure, workmanship and G-01 conflict review.

## HFI-06B — movement targets

Only HFI-06B may decide whether the candidate regions become an Ovid's House minimum/target, and only after HFI-05 proportionality/conflict synthesis.

Any stronger target must remain separate from RH-C5's Approved Document K method.

---

# 19. Evidence limitations and open questions

HFI-02B deliberately leaves the following unresolved:

1. **280 versus 300 mm going** — evidence supports both as serious candidates; proportionality not yet applied.
2. **preferred rise within the candidate region** — no single value has sufficient convergent evidence to become a project target here.
3. **exact two-handrail case** — support value is credible; spatial and life-course case still pending.
4. **handrail diameter/profile** — `38 mm round` is promising experimental evidence, not final detail.
5. **construction tolerance** — consistency mechanism is strong; allowable tolerance depends on actual construction/delivery system.
6. **landing dimensions** — no exact domestic HFI value earned.
7. **headroom beyond 2.0 m** — no strong contemporary evidence found for an extra project margin.
8. **numerical edge contrast** — direction strong; exact threshold evidence too narrow.
9. **nosing geometry** — tapered profile promising; needs technical/material integration.
10. **carrying/occupied-hand effect size** — handed explicitly to HFI-02D.
11. **actual Reference House detailed stair geometry** — insufficient source detail for handrail/nosing/light/tolerance judgement.

Missing evidence is not permission to choose the most generous value by intuition.

---

# 20. Adversarial checks

Before closing HFI-02B, the packet was tested against the main predictable biases.

### Trigger confirmation bias

Did the programme merely confirm the original shallow-tread complaint?

**No.** `280 mm` survives as a credible candidate; the result is more conservative than the trigger hypothesis.

### Standards worship

Was Approved Document K treated as optimum?

**No.** It remains compliance/guidance authority, separate from ergonomic evidence.

### Research inflation

Was the 2025 government report treated as policy or systematic-review certainty?

**No.** It is government research; GOV.UK disclaims policy status, and the report's review/model limitations are recorded.

### Single-study numerology

Were `183 mm`, `38 mm` or `50%` promoted because one experiment produced a neat number?

**No.** Each remains a candidate evidence point with explicit limits.

### Bigger-is-better bias

Did deeper/lower automatically win?

**No.** Diminishing benefit, flight length, area and architectural consequences remain live.

### Older-person stereotyping

Was “older” treated as universally frail?

**No.** Evidence from older populations is used for measured biomechanics only; HFI-01C's capability/state distinctions remain controlling.

### Current-geometry incumbency

Did current RH coordination protect `280/183.333/33.215°`?

**No.** Those values may still be rejected later; 02B simply refuses to reject them without evidence.

### Downstream sunk cost

Would existing DRW/compiler work prevent a stair rewind?

**No.** Accepted later change must reopen RH-03 and regenerate downstream outputs.

---

# 21. Findings and authority consequences

## Findings

1. **Going is the strongest stair-geometry HFI variable in the reviewed evidence.** Smaller goings worsen foot support/overhang and stepping behaviour, especially in descent.
2. **The benefit of greater going is nonlinear.** `275–300 mm` is the credible later comparison region; there is no evidence basis for “as deep as possible”.
3. **The current RH `280 mm` going is not shown to be defective.** This materially weakens the programme's original trigger hypothesis while leaving `300 mm` as a credible later alternative.
4. **Rise should stay materially away from the high end of the private-stair legal envelope.** Roughly `160–185 mm` is the concentrated comparison region carried forward, not a target.
5. **Pitch is best treated as a consequence of the rise/going pair.** The statutory `42°` ceiling is not a comfort target.
6. **`2R+G` remains external-guidance correspondence, not the primary HFI optimiser.**
7. **Dimensional consistency is strongly supported as a safety principle.** Top-of-flight and local inconsistencies can alter stepping downstream.
8. **Handrails are functional balance/support/recovery interfaces.** A second rail has credible value but must survive width/life-course/proportionality review.
9. **Visual tread-edge legibility is supported; exact contrast values are not yet robust enough for project target status.**
10. **Nosing profile matters, but current evidence does not justify one mandatory project detail.**
11. **No stronger HFI headroom number than the current `2.0 m` guidance correspondence was earned.**
12. **Carrying is materially relevant but intentionally deferred to HFI-02D rather than being half-solved here.**

## Architectural / maturity consequences

**None.**

No Reference House geometry, stair specification, governing principle, pattern, compiler method, publication content or maturity state changes.

## RH-C5 consequence

**None.**

The existing Approved Document K numeric correspondence method remains unchanged and bounded exactly as before.

## Stale downstream artefacts

**None.**

No accepted architectural change has occurred.

## Exact next packet

**HFI-02C — vertical life-course.** Not started by HFI-02B.
