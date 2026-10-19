# HFI-06A — Target Classes and Derivation Method

**Packet:** HFI-06A  
**Programme:** [`docs/development/human-factors-low-friction-inhabitation-programme.md`](../../docs/development/human-factors-low-friction-inhabitation-programme.md)  
**Execution plan:** [`docs/development/human-factors-low-friction-inhabitation-execution-plan.md`](../../docs/development/human-factors-low-friction-inhabitation-execution-plan.md)  
**Owning issue:** #195  
**Baseline `main`:** `4d01396c02b4a8ea493f4a85fbcb058b8dd5ff74`  
**Prior gate:** HFI-05 complete  
**Question:** how may HFI-06 derive quantitative or relational targets without confusing law, external guidance, empirical ranges, Ovid’s House preferences and current Reference House values, or manufacturing false precision from heterogeneous human-factors evidence?  
**Boundary:** target architecture/method only. This packet does **not** choose stair, route, door, turning, threshold, gradient, reach, force or clearance values; audit/redesign the Reference House; edit doctrine/patterns; add compiler proof; or change publication maturity.

---

## 1. Governing rule

A number is not a target because it appears in a regulation, paper, precedent, current drawing or familiar rule of thumb.

Every HFI target must preserve the chain:

`human mechanism → scenario/task/state → measurable relationship → evidence → proportionality/conflict → target class → measurement convention → later project test`

If that chain cannot be stated, the project does not yet have a defensible number.

The programme explicitly prefers **no number** over a precise-looking value whose mechanism or authority is unclear.

---

# 2. Target classes

HFI-06 uses five classes. They must never be collapsed in prose or machine data.

## `T1 — STATUTORY / REGULATORY BOUNDARY`

A requirement or guidance correspondence arising from the applicable legal/regulatory framework at its stated jurisdiction, building category, date and scope.

Examples may later include Approved Document K/M/G relationships where applicable.

Rules:

- record whether the source is law, statutory guidance or another regulatory instrument;
- preserve category/jurisdiction/date;
- do not call a guidance value the Ovid’s House optimum;
- exceeding a minimum does not automatically prove HFI quality;
- an Ovid’s House target may be stronger, but cannot lawfully weaken an applicable hard requirement.

---

## `T2 — EXTERNAL GOOD PRACTICE`

A value/range/relationship recommended by an applicable non-statutory standard, specialist guide or established professional practice.

Examples may come from inclusive-housing guidance, standards or specialist design guides.

Rules:

- retain the population/use/category assumed by the source;
- do not universalise M4(3), wheelchair or care geometry into every house merely because it is well documented;
- record whether the recommendation is evidence-derived, consensus practice or implementation guidance where known.

---

## `T3 — EVIDENCE-SUPPORTED RANGE / RELATIONSHIP`

A range, threshold tendency or relationship supported by empirical/human-factors evidence but not itself an adopted Ovid’s House requirement.

Examples:

- stair support/biomechanical relationships;
- body/reach distributions;
- task-surface/reach findings;
- operating-force effects;
- turning/swept-envelope evidence.

Rules:

- preserve population/sample/task limitations;
- ranges from different studies are not averaged into authority;
- statistical distributions do not automatically become design percentiles;
- if evidence supports only directionality (“greater depth reduces reach burden”), record directionality rather than fabricate an optimum.

---

## `T4 — OVID’S HOUSE TARGET`

A project-level general target deliberately adopted because the mechanism is important, evidence is sufficiently applicable, proportionality survives HFI-05B, conflicts survive HFI-05C and a specific value/range/relationship improves the project beyond merely quoting external minima.

Subclasses:

- `T4-MIN` — Ovid’s House minimum where falling below materially breaks the intended human-factors proposition;
- `T4-TARGET` — preferred design value/range with justified tolerance/flexibility;
- `T4-REL` — relational/non-scalar target where the correct rule is geometric or sequential rather than one dimension.

A `T4` target is **not law**. It is an Ovid’s House design rule and must remain labelled as such.

Admission requires all of:

1. named causal family/mechanism;
2. named representative scenarios/tasks;
3. evidence class/confidence;
4. external regulatory context;
5. explicit proportionality disposition;
6. cross-discipline conflict status;
7. measurement convention;
8. rationale for the selected point/range/relationship rather than a neighbouring plausible value;
9. architectural owner;
10. explicit known limits/nonclaims.

If one of these is materially missing, the proposition remains `T1/T2/T3` context or unresolved rather than becoming `T4`.

---

## `T5 — PROJECT / SITE / PRODUCT VALUE`

A value selected for a particular Reference House, real site, room, product or technical assembly without claiming general Ovid’s House authority.

Examples:

- actual RH corridor width after geometry is resolved;
- actual sill/threshold detail selected for exposure/drainage;
- a manufacturer’s door force/product envelope;
- real-site approach gradient;
- a fitted-appliance door envelope.

Rules:

- a `T5` value may satisfy a `T4` target;
- repeated use of the same `T5` value does not promote it to `T4`;
- current Reference House geometry has no incumbency advantage in target derivation.

---

# 3. Target forms

Not all useful targets are minima.

HFI-06 may use:

| Form | Use |
|---|---|
| `MINIMUM` | falling below is the principal failure mode |
| `MAXIMUM` | exceeding creates burden/hazard, e.g. some reach/force/threshold conditions |
| `RANGE` | both too little and too much can be undesirable |
| `PREFERRED + TOLERANCE` | one design centre is useful but modest variation is harmless |
| `RELATIONSHIP` | two/more dimensions/states must work together |
| `CLEAR-ENVELOPE` | swept/occupied geometry matters more than one scalar |
| `SEQUENCE` | order/locality/set-down/feedback relationship is the requirement |
| `CATEGORY-SPECIFIC` | applies only to an explicit accessibility/use category |
| `NO-NUMERIC-TARGET` | evidence supports a method/check but not a defensible scalar |

The target form must follow the mechanism, not convenience of specification.

---

# 4. Derivation workflow

Every candidate HFI-06 target must pass these steps in order.

## D1 — name the cause

Identify the HFI-05A causal family (`CF-01…CF-09`) and the precise building-side mechanism.

Bad: “accessibility”.  
Good: “CF-03 local ground-plane discontinuity forces extra foot/wheel negotiation on a principal route.”

## D2 — freeze the task and scenarios

Name the relevant HFI-01C scenarios and action state.

A dimension derived for:

- a walking adult;
- a wheelchair approach;
- a carried sofa;
- an assisted transfer;

is not automatically transferable among them.

## D3 — choose the measurable quantity

Use the quantity that actually represents the mechanism.

Examples:

- **clear opening**, not nominal leaf width;
- **effective swept envelope**, not corridor centreline;
- **going/rise/pitch system**, not stair going in isolation;
- **reach from operating position including obstruction depth**, not wall mounting height alone;
- **opening force at the actual hardware condition**, not product marketing category;
- **threshold discontinuity at traversed line**, not visual floor datum alone.

## D4 — assemble authority layers

Record relevant `T1`, `T2` and `T3` sources side-by-side without blending their authority.

Conflicts are preserved, not averaged away.

## D5 — test evidence applicability

Ask:

- same population?
- same task?
- same posture/approach?
- same consequence?
- domestic context transferable?
- technology/current product context relevant?
- source dated/current enough for the claim?

## D6 — apply HFI-05B proportionality

A numerically stronger value must earn its permanent area/cost/carbon/complexity burden.

The mathematical extreme of human accommodation is not automatically the architectural target.

## D7 — apply HFI-05C conflict constraints

Do not select a target whose satisfaction requires violating fire, structure, moisture, electrical, security or other hard technical duties.

Where the target remains system-dependent, use a relational/conditional form.

## D8 — choose target class and form

Only now may a value become `T4`.

If the evidence cannot distinguish sensibly among nearby values, use a range/tolerance or do not create `T4`.

## D9 — define measurement convention

Specify:

- where measurement starts/ends;
- clear vs nominal/structural dimension;
- finished vs unfinished surface;
- closed/open/occupied state;
- loaded/unloaded condition where relevant;
- force application method where relevant;
- tolerance and rounding;
- which obstructions count.

## D10 — record nonclaims

Every target must say what it does **not** prove.

Example: a stair geometry target does not prove whole-stair safety, lighting, handrail quality or regulation compliance.

---

# 5. Anti-pseudo-precision rules

## 5.1 Precision must not exceed evidence or construction meaning

Do not publish 1 mm precision because software stores millimetres.

A value such as `297 mm` requires a reason to prefer 297 over 295/300. If none exists, use an honest rounded target/range.

## 5.2 Do not average heterogeneous sources

If guidance says 300, one study tests 280–320 and another reports a different population, the arithmetic mean is not evidence.

Synthesis is causal/judgemental and must be documented.

## 5.3 Do not stack percentiles into a fictional person

A 95th-percentile male foot, 5th-percentile female reach and wheelchair turning envelope cannot be combined into one synthetic “95% user”.

Each task uses the relevant variable/scenario.

## 5.4 Distinguish distribution coverage from target confidence

A 95th percentile does not mean 95% confidence and does not mean a value is safe/comfortable for 95% of occupants.

## 5.5 Avoid threshold cliffs unsupported by mechanism

If 899 and 900 mm are functionally indistinguishable, do not pretend the design changes from bad to good at 900 unless the target is explicitly a regulatory boundary.

Ovid’s House targets should state tolerances/relationships where appropriate.

## 5.6 Do not convert qualitative evidence into invented numbers

If evidence only establishes:

- keep controls local;
- provide state feedback;
- model open appliance states;
- provide a credible landing point;

then those remain `T4-REL` candidates, not made-up millimetres.

---

# 6. Effective geometry over nominal geometry

HFI targets should normally use **effective occupied geometry**.

Examples:

- route width after fixed radiators/joinery/door leaves where relevant;
- clear door opening at the usable opening angle;
- turning envelope including body/object orientation;
- stair going measured by the applicable convention;
- reach including counter/sink/window obstruction depth;
- appliance clearance with door/rack open and user operating position;
- threshold as actually traversed including grate/track/sill discontinuities.

A structural drawing dimension is not automatically the human-use dimension.

---

# 7. Dynamic-state rule

Where ordinary operation changes geometry, the target must name the state.

Potential states include:

- door open/closed;
- drawer extended;
- dishwasher rack extended;
- oven door open;
- window open;
- stairlift parked/in use where later modelled;
- assisted pair occupying a sanitary zone;
- person carrying representative load.

A target tested only in the most convenient closed state is invalid if the actual task requires another state.

---

# 8. Regulatory relationship

For each quantitative family HFI-06B/C must show a simple authority stack:

`applicable T1 boundary → relevant T2 good practice → relevant T3 evidence → proposed T4 target (if earned) → T5 project value later`

This prevents two opposite errors:

- **standards worship:** assuming external minimum/good practice is the project optimum;
- **project exceptionalism:** inventing a stronger number without showing why established practice is insufficient.

A valid result may be:

> **No stronger Ovid’s House target justified; adopt the applicable external good-practice relationship explicitly.**

Novelty is not required.

---

# 9. Target strength and evidence confidence

A strong design target can arise from different evidence structures, but the basis must be explicit.

### `HIGH`

Multiple applicable sources/mechanisms converge; little inference is required.

### `MODERATE`

Mechanism is credible and evidence useful, but population/context/implementation requires judgement.

### `LOW / PROVISIONAL`

Evidence is sparse/indirect or the selected point within a range is substantially project preference.

Rules:

- low-confidence targets should normally remain preferred values/ranges rather than hard minimums;
- regulatory `T1` status is independent of empirical confidence—law/guidance must still be followed at its legal boundary;
- familiar industry practice does not automatically increase HFI evidence confidence.

---

# 10. Burden-sensitive target selection

Where several values all satisfy the human mechanism, choose the least burdensome value that preserves the intended benefit **unless** a modest extra increment buys disproportionate option value.

This rule prevents both:

- minimum chasing; and
- generosity escalation.

For spatial targets HFI-06B must expose at least qualitatively:

- plan-area consequence;
- effect on adjacent room/storage geometry;
- structure/services implications where material;
- whether local geometry can solve the mechanism more efficiently than a global number.

---

# 11. Relationship targets are first-class

Several major HFI results should probably **not** become one number.

Likely `T4-REL` families include:

- control location relative to decision/consequence zone;
- hot/heavy landing surface relative to extraction point;
- door swing relative to operating/control position;
- route clearances through turns rather than one corridor width;
- future sanitary support zone relative to known services;
- appliance open state + body operating envelope;
- local assistance geometry;
- continuous ground plane + drainage/weathering conditions.

HFI-06C must not demote these merely because they are harder to put in a schedule.

---

# 12. Category and claim scoping

Every target must declare scope such as:

- ordinary ambulant use;
- visitability;
- accessible/adaptable dwelling category;
- wheelchair-user dwelling category;
- temporary impairment scenario;
- object/furniture movement;
- assisted use;
- maintenance-only access.

A category-specific target cannot be silently promoted to universal ordinary-use doctrine.

Conversely, a general ordinary-use target cannot be claimed as wheelchair accessibility proof unless it actually tests the required wheelchair scenario/category.

---

# 13. Target record schema

Each HFI-06B/C candidate should use a record containing:

- `target_id`;
- `name`;
- `cause_family`;
- `domain`;
- `scenario_ids`;
- `task/state`;
- `target_class` (`T1…T5`);
- `target_form`;
- `value/range/relationship`;
- `units` where numeric;
- `direction` (`min/max/range/preferred`);
- `measurement_convention`;
- `T1_context`;
- `T2_sources`;
- `T3_evidence`;
- `evidence_confidence`;
- `HFI-05B_disposition`;
- `HFI-05C_constraints`;
- `burden_notes`;
- `architectural_owner`;
- `known_limits/nonclaims`;
- `later_RH_source_field` if represented;
- `machine_checkability` = `NOT-ASSESSED` until HFI-09C.

No field for a weighted “friction score” is authorised.

---

# 14. Decision outcomes allowed in HFI-06B/C

For each candidate family, later packets may conclude:

1. `ADOPT-T4-MIN`;
2. `ADOPT-T4-TARGET`;
3. `ADOPT-T4-REL`;
4. `ADOPT-EXTERNAL-T2` — no project-specific stronger target needed;
5. `RETAIN-T3-RANGE` — evidence useful but not target-ready;
6. `CATEGORY-SPECIFIC-ONLY`;
7. `PROJECT/SITE-T5-ONLY`;
8. `NO-NUMERIC-TARGET`;
9. `UNRESOLVED`.

“Research found a number” is not an outcome.

---

# 15. Worked abstract examples — method only

These are **not target selections**.

### Example A — stair going

- cause: `CF-02`;
- T1: applicable private-stair regulatory/guidance method;
- T3: biomechanical/foot-support evidence and ranges;
- 05B: stronger-than-current comparison conditional;
- 05C: complete stair-system/plan/headroom constraints;
- 06B task: decide whether a rounded stronger `T4-TARGET` is earned or current/external practice remains sufficient.

No value is adopted in 06A.

### Example B — principal route

If straight-run width alone does not predict the relevant turn/door manoeuvre, the target may be:

- local `CLEAR-ENVELOPE` / `T4-REL` at the conflict node;
- plus an external/category minimum where applicable;

rather than a universal wider corridor number.

### Example C — control height

If mounting height is only one contributor to approach/reach/mapping/sequence, retain applicable T1/T2 height context but prefer a `T4-REL` around operating position and action sequence unless evidence supports a stronger bounded numeric target.

---

# 16. Reference House firewall

HFI-06 target formation must be blind to whether current RH geometry happens to pass.

Rules:

- derive the candidate independently;
- only HFI-07 compares target to RH;
- do not select 280 mm because RH stair is 280;
- do not select an existing corridor width because changing it is inconvenient;
- do not weaken a target because drawings/publication are advanced;
- do not strengthen a target merely to force a redesign.

Existing geometry has **zero evidential weight** in target choice.

---

# 17. Construction and tolerance boundary

A design target is not necessarily the same as a site acceptance tolerance.

HFI-06 may state a preferred/minimum design relationship. Delivery tolerances belong to the correct technical/delivery layer unless human use depends directly on the finished value.

Where finished geometry matters, target records must say whether the value is measured to:

- finished face;
- nosing;
- handrail/handle centre;
- clear opening;
- top of floor finish;
- another explicit datum.

Do not use structural set-out values as a proxy without stating finish build-up.

---

# 18. HFI-06D red-team obligations created now

HFI-06D must later attack at least:

- percentile laundering;
- false one-millimetre precision;
- regulatory values mislabelled as project targets;
- project values promoted to general rules;
- silent M4(3)/wheelchair universalisation;
- area inflation hidden behind minimum dimensions;
- target interactions that make the combined house impossible;
- clear vs nominal dimension confusion;
- open/dynamic state omissions;
- target cliffs with no functional discontinuity;
- values selected because the current RH already passes;
- values selected for novelty rather than evidence;
- relational evidence forced into scalar targets;
- source dates/jurisdictions/categories dropped during synthesis.

---

# 19. Computational boundary

HFI-06A creates a target data model concept, not compiler authority.

Machine-checkability remains `NOT-ASSESSED` until HFI-09C.

Even later, machine proof must distinguish:

- correspondence with T1 external guidance;
- compliance with a T4 Ovid’s House rule;
- comparison of a T5 project value.

The existing RH-C5 Approved Document K method must not be rewritten if HFI later adopts a stronger stair target; these are separate rule families.

---

# 20. Closeout

**Packet:** HFI-06A — target classes and derivation method  
**Baseline:** `4d01396c02b4a8ea493f4a85fbcb058b8dd5ff74`  
**Exact question answered:** HFI now has an authority-preserving target architecture that distinguishes statutory/regulatory boundaries (`T1`), external good practice (`T2`), evidence-supported ranges/relationships (`T3`), deliberately adopted Ovid’s House targets (`T4`) and project/site/product values (`T5`).  
**Key rules:** derive from mechanism and frozen scenario; choose effective measurable geometry; preserve source authority; apply proportionality/conflict before adopting T4; prefer honest ranges/relationships/no number over pseudo-precision; define measurement state/convention; keep category claims bounded; current RH geometry has no influence on target choice.  
**Target forms:** minimum, maximum, range, preferred+tolerance, relationship, clear-envelope, sequence, category-specific and no-numeric-target are all legitimate.  
**Checks:** no actual quantitative target selected; no Reference House audit/rewind; no doctrine/pattern/compiler/publication/maturity change.  
**Exact next packet:** **HFI-06B — movement targets.**
