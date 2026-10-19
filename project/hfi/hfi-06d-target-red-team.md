# HFI-06D — Target Red-Team

**Packet:** HFI-06D  
**Programme:** [`docs/development/human-factors-low-friction-inhabitation-programme.md`](../../docs/development/human-factors-low-friction-inhabitation-programme.md)  
**Execution plan:** [`docs/development/human-factors-low-friction-inhabitation-execution-plan.md`](../../docs/development/human-factors-low-friction-inhabitation-execution-plan.md)  
**Owning issue:** #195  
**Baseline `main`:** `c31ad8dd3e82cf229bb325d0b4cdb20681384c0e`  
**Target inputs:** HFI-06A / HFI-06B / HFI-06C  
**Question:** does the HFI target architecture survive adversarial attack for percentile misuse, false precision, authority laundering, hidden area inflation, category leakage, target interaction, Reference House overfit and internally contradictory demands before it is allowed to judge the Reference House?  
**Boundary:** target-set adversarial review only. This packet does **not** audit or change the Reference House, revise architecture, set new target families beyond corrections required by the red-team, edit doctrine/patterns, add compiler proof or change publication maturity.

---

## 1. Red-team disposition

**Result: the HFI-06 target architecture survives, with no target requiring withdrawal or numerical correction.**

The strongest challenge remains the new **300 mm preferred principal-stair going**. It survives because it is explicitly a `T4-TARGET — PREFERRED`, not a hard minimum; it sits inside the current external private-stair guidance envelope and evidence-supported candidate region; nearby values are not declared defective; and its plan burden remains visible to later audit/integration.

The broader target set is unusually resistant to pseudo-precision because HFI-06B/C deliberately refused most tempting universal numbers.

No new scalar target is introduced by this packet.

---

# 2. Attack A — percentile misuse

## Failure modes tested

- 95th percentile treated as “95% of people accommodated”;
- 5th-percentile reach/force observations converted directly into universal limits;
- male/female/body/device percentiles stacked into one fictional person;
- wheelchair/device envelopes mixed with ambulant reach/turning assumptions;
- category-specific M4 geometry universalised because it represents a more demanding population.

## Findings

The target set passes.

HFI-06A explicitly prohibits percentile stacking and distinguishes distribution coverage from target confidence. HFI-06C leaves government 5th-percentile operating-force observations as `T3`, not T4 limits. HFI-06B leaves M4(3) turning/door/corridor dimensions category-specific rather than adopting them as universal project targets.

### Lock

> **No HFI-07 result may call a project value deficient solely because it does not match a percentile-derived observation unless HFI-06 explicitly adopted that observation as the correct target for the same scenario/task.**

---

# 3. Attack B — false millimetre precision

## Failure modes tested

- software storage precision mistaken for evidence precision;
- arbitrary rounding disguised as scientific certainty;
- 1 mm cliffs with no functional discontinuity;
- laboratory values copied into architectural schedules without construction/measurement context.

## Findings

The target set passes, with one value requiring explicit interpretation: `300 mm` stair going.

`300 mm` is not presented as “299 fails / 300 passes”. It is a rounded preferred design centre at the strong end of the supported 275–300 mm region and within current private-stair guidance. The record explicitly refuses a hard minimum.

The rise target is a broad `160–185 mm` preferred range rather than a falsely exact single value. Stair consistency is relational; no construction tolerance is fabricated from experimental 10 mm inconsistencies.

Interface/task targets correctly remain relational where evidence cannot discriminate a numeric threshold.

### Lock

> **HFI-07 must preserve target form. A `T4-TARGET` preference is not to be audited as a legal-style `T4-MIN` unless HFI-06 explicitly says so.**

---

# 4. Attack C — regulatory/guidance laundering

## Failure modes tested

- Approved Document guidance relabelled as an Ovid’s House ergonomic optimum;
- non-statutory specialist guidance described as law;
- project target described as compliance;
- external category value stripped of jurisdiction/date/category.

## Findings

The target architecture passes.

Examples correctly separated:

- AD K private-stair ranges/pitch/`2R+G`/headroom remain external `T1` context;
- M4(2)/M4(3) circulation, door, landing, threshold and category geometry remains category-specific external context;
- Part M service-control height guidance remains external rather than becoming a universal Ovid’s House mounting band;
- the Ovid’s House 300 mm preferred going is explicitly a project preference distinct from AD K correspondence;
- empirical government force observations remain `T3` rather than being presented as regulatory limits.

### Lock

Every HFI-07 finding that uses a number should be able to state whether it is testing:

- external `T1/T2` correspondence;
- `T3` evidence context;
- Ovid’s House `T4` target;
- actual `T5` project value.

Never compress these into one “standard”.

---

# 5. Attack D — novelty bias / project exceptionalism

## Failure modes tested

- inventing stronger numbers merely to distinguish Ovid’s House from Building Regulations;
- rejecting established practice because the programme “should discover something”;
- turning every qualitative insight into proprietary doctrine.

## Findings

The target set passes.

HFI-06B explicitly adopts no stronger universal headroom, turning circle, corridor width, door width, threshold scalar, handrail diameter or tread-contrast number. HFI-06C adopts no universal control height, door force, bathroom clearance, worktop height or storage band.

This is evidence that the target stage did **not** optimise for novelty.

The sole prominent new scalar—300 mm preferred stair going—has a documented causal/evidence case and remains inside recognised external guidance rather than inventing an exotic geometry.

---

# 6. Attack E — Reference House incumbency / overfit

## Failure modes tested

- selecting targets because current RH already passes;
- avoiding targets because redesign would be inconvenient;
- strengthening targets purely to force a redesign;
- using existing drawing publication maturity as evidence.

## Findings

The target set passes.

The strongest evidence is the stair:

- current RH going is 280 mm;
- HFI-06B independently selects 300 mm preferred;
- 280 is neither grandfathered in nor rhetorically declared defective;
- the audit is left to HFI-07.

Likewise, the programme does not invent fixed-control, kitchen or sanitary details merely because the RH source does not yet model them; missing data is reserved for `NOT-MODELLED`.

### Lock

> **HFI-07 may not weaken the target to protect current geometry. If a target exposes a material conflict, record it and route it later; do not re-derive the target inside the audit.**

---

# 7. Attack F — hidden area inflation

## Failure modes tested

- every human-factors benefit translated into more floor area;
- M4(3) geometry universalised as “future-proofing”;
- passing/assistance envelopes multiplied throughout the dwelling;
- larger rooms used as substitute for detailed interface design;
- stair generosity adopted without acknowledging run consequences.

## Findings

The target set passes.

HFI-06B rejects universal wider corridors, 1500 mm turns, continuous passing/assistance width and generic larger landings. It instead adopts local conflict-node and manoeuvre-specific clear-envelope targets.

HFI-06C rejects universal larger bathrooms/kitchens and uses task/support/open-state relations.

The 300 mm stair preference does consume more run than 280 mm. This burden is **not hidden**. HFI-05B/05C already require full stair-system/plan comparison and 06B labels 300 as preferred, not mandatory at any cost.

### Residual risk

HFI-07/08 could still accidentally combine individually modest local-clearance improvements into cumulative spatial bloat. Therefore the later audit must report **where** area changes would occur rather than treating every local `IMPROVE` as automatically additive.

---

# 8. Attack G — category leakage / false universality

## Failure modes tested

- wheelchair-category geometry universalised to every dwelling;
- ordinary-use targets claimed as wheelchair proof;
- assistance geometry treated as generic room clearance;
- temporary impairment used to justify permanent specialist equipment;
- “step-free” used as synonym for whole-house accessibility.

## Findings

The target set passes.

- M4(3) dimensions remain category-specific;
- assistance remains actual two-body task geometry;
- specialist rails/lifts/adjustable equipment remain demand-led unless the applicable brief/category requires them;
- dual-use entrance-level fallback is a topological capability target, not a claim that the entire dwelling is wheelchair accessible;
- stairlift compatibility requires real equipment-family geometry before the claim is permitted.

### Lock

Any later HFI-07 PASS must name the claim scope: ordinary usability, visitability, adaptability, wheelchair category, assisted use, object route or another explicit scope.

---

# 9. Attack H — scalar reduction of relational mechanisms

## Failure modes tested

- corridor width standing in for turn/door manoeuvre;
- switch height standing in for reach/mapping/sequence;
- bathroom size standing in for transfer/control/support/dry staging;
- worktop height standing in for kitchen use;
- route length standing in for domestic task burden.

## Findings

The target set passes strongly.

HFI-06B/C consistently retain relational targets where the causal mechanism is coupled or sequential.

### Auditability requirement

Relational must not become vague prose.

HFI-07 must represent these through observable/source-backed facts, e.g.:

- door leaf + operating position + clear route;
- appliance open envelope + user position;
- control position + consequence/feedback state;
- shower control + direct-spray zone;
- task ledger events;
- support-capable wall + service/fixing-zone relation.

Where source facts do not exist, result is `NOT-MODELLED`, not a qualitative guess.

---

# 10. Attack I — target interaction / internal contradictions

The combined target set was tested for collisions.

## 10.1 Stair: going × rise × run × headroom × handrails × future stairlift

Potential contradiction:

- deeper going and lower rise increase run;
- rail/support envelopes reduce effective width;
- future stairlift may further occupy width/landings;
- headroom/landing geometry may become harder.

**Result:** no logical contradiction because HFI-06B targets a complete stair system, not independent maxima. 300 mm going and 160–185 mm rise are preferred values/range subject to full-system coordination. Stairlift compatibility is separately claim-specific.

**Audit rule:** HFI-07C must test the stair as one system and may return `CONFLICT` if simultaneously satisfying a preferred HFI target and a credible other project duty produces a material unresolved burden.

## 10.2 Continuous ground plane × drainage/weathering

Potential contradiction: low threshold vs water exclusion.

**Result:** explicitly resolved in target wording. The T4 target is integrated traversability + robust drainage/weathering, not flatness.

No contradiction.

## 10.3 Low operating effort × fire/security/weather seals

Potential contradiction: low effort vs reliable closure/resistance.

**Result:** HFI-06C is relational and subordinate to hard technical duties while requiring unnecessary effort to be minimised. No universal force scalar conflicts with specialist requirements.

## 10.4 Local spatial generosity × domestic task compactness

Potential contradiction: enlarging nodes can lengthen other repeated routes or remove storage.

**Result:** HFI-S2 / HFI-05B require local causal allocation rather than blanket enlargement. HFI-07E later owns actual trade-off findings.

## 10.5 Life-course capability × ordinary domestic character

Potential contradiction: future accessibility provisions can institutionalise present space.

**Result:** target set separates neutral concealed/enabling architecture from demand-led specialist equipment and prefers dual-use ordinary rooms.

## 10.6 Controls locality × central system integrity

Potential contradiction: local control everywhere can fragment/duplicate system state.

**Result:** HFI-06C explicitly limits locality to immediate local actions and allows centralisation where whole-house/safety/diagnostic logic warrants it.

No unresolved internal contradiction is found.

---

# 11. Attack J — hidden technical noncompliance

## Failure modes tested

- HFI target phrasing accidentally authorises weakening fire, security, drainage, structure or electrical safety;
- convenience language presented as superior to hard duties.

## Findings

The target set passes.

HFI-05C conflict rules remain embedded throughout 06B/C. Examples:

- threshold target preserves moisture/drainage/weathering;
- force/manipulation targets preserve fire/security/weathering/acoustics;
- future shower target requires technically real drainage/moisture assembly;
- support zones must avoid concealed-service conflicts;
- lift reservation remains unresolved pending structural/fire/services counterfactual.

### Lock

A later project cannot claim “HFI required it” as justification for violating an applicable technical duty. HFI specifies the human requirement; the means must survive the owning technical discipline.

---

# 12. Attack K — housework/care bias

## Failure modes tested

- domestic task routes based on a single assumed household role;
- assistance treated as a permanent female/carer side-role;
- kitchen/laundry targets optimised around one assumed operator body;
- childcare/carrying omitted from repeated-use analysis.

## Findings

The target architecture passes at method level.

HFI-01C scenarios explicitly expose housework/care assumptions. HFI-03D/06C treat groceries, laundry, waste, cleaning, care/childcare and garden-serving as tasks rather than attaching them to a demographic identity. Human-variance targets avoid one fixed operator body.

### Residual audit obligation

HFI-07 must not choose only the easiest household task route to represent. It should audit the frozen representative set where source geometry permits.

---

# 13. Attack L — unresolved questions disguised as targets

Two major unresolved propositions were checked for accidental promotion.

## Future through-floor lift reservation

Still `UNRESOLVED`.

No reservation dimensions, shaft size, structural rule or universal Ovid’s House requirement exists. One buildable low-burden counterfactual remains necessary before adoption/rejection.

## Laundry topology

Still `UNRESOLVED / PROJECT-TOPOLOGY`.

No upstairs/downstairs rule, duplication requirement, chute rule or stair-crossing threshold exists.

### Result

The target stage correctly refuses to resolve architectural questions through invented numbers.

---

# 14. Attack M — missing measurement conventions

## Numeric targets

### 300 mm going / 160–185 mm rise

Measurement convention is tied to the applicable private-stair finished-geometry method; HFI-07 must compare represented finished/source geometry consistently with the external method where correspondence is claimed.

### External category dimensions

Use the applicable guidance’s definition of clear opening, corridor width, threshold, gradient, landing etc.; do not substitute structural/gross dimensions.

## Relational targets

They require named states/facts rather than one datum.

### Finding

HFI-06A provides sufficient architecture for HFI-07A to determine modelability before auditing. Where the current source does not encode the needed finished/open/occupied state, `NOT-MODELLED` is the correct result.

No additional HFI-06 numeric convention is required.

---

# 15. Attack N — target proliferation / usability of the target system

A target architecture can become unusable if every research observation becomes a rule.

## Findings

HFI-06B/C contain many IDs, but they collapse into a smaller set of operational families:

1. stair support/consistency;
2. route/manoeuvre envelopes;
3. ground-plane continuity;
4. functional reach/operating effort;
5. opening/control sequences and feedback;
6. sanitary support/control/wet-dry sequence;
7. fixed-work open states/staging/storage;
8. domestic task event chains;
9. life-course enabling relationships.

Most IDs are audit handles for discrete relations, not doctrine or building-wide scalar schedules.

### Risk control

HFI-08A should integrate only the smallest general set. HFI-05D already limits principle candidates to HFI-P1/P2 and strategies HFI-S1/S2/S3.

No target-ID dump should be promoted directly into reader-facing doctrine.

---

# 16. Attack O — could the 300 mm preference be downgraded?

This is the red-team’s most important substantive challenge.

Arguments for downgrade to merely `T3` or a broad range:

- current RH 280 mm already lies in the evidence-supported region;
- subjective benefit appears to flatten above roughly 275 mm in the cited domestic stair research;
- direct population-level fall reduction from 300 vs 280 is not established;
- deeper going increases stair run.

Arguments for retaining `T4-TARGET — PREFERRED 300 mm`:

- the target is explicitly **not** a minimum or safety cliff;
- 300 sits at the upper end of the serious evidence-supported ordinary-domestic candidate region;
- increased foot-support/overstep margin is causally relevant for larger feet and descent;
- it remains within current private-stair guidance rather than extrapolating beyond recognised geometry;
- selecting a preferred project value requires choosing somewhere within the supported region; 300 expresses the project’s low-friction preference while leaving proportional audit authority intact;
- HFI-07 can distinguish `PASS`/`IMPROVE`/`CONFLICT` and need not treat 280 as failure solely because 300 is preferred.

### Red-team decision

**Retain 300 mm as `T4-TARGET — PREFERRED`.**

Add the interpretive lock:

> **The distance from 300 mm is not itself a severity metric. HFI-07 must judge the whole stair mechanism and architectural burden; 300 is a preferred design centre, not a linear scoring function.**

No record edit to HFI-06B is required because its existing wording already states this substance.

---

# 17. Attack P — could the rise band be narrower?

`160–185 mm` is intentionally broad.

A narrower band would create false authority because actual floor-to-floor height and integer riser count govern the practical T5 value, and the evidence does not establish a universal optimum within the band.

### Decision

Retain `160–185 mm` as a preferred range.

No centre value is added.

---

# 18. Attack Q — should there be more numeric interface targets?

Candidates tested:

- switch height;
- door force;
- shower-control offset;
- worktop height;
- storage band;
- assistance clearance;
- bathroom size;
- domestic route length.

### Decision

**No.**

The existing evidence supports action/posture/sequence relationships more strongly than universal scalars. Adding numbers now would reduce epistemic quality rather than improve design control.

External/category/product numbers remain available where their scope actually matches the task.

---

# 19. HFI-07 result-vocabulary readiness

The execution plan requires one frozen result vocabulary before audit.

HFI-06D confirms the planned vocabulary is sufficient:

- `PASS` — represented facts satisfy the applicable HFI target/claim;
- `IMPROVE` — represented condition is usable/credible but materially below an earned Ovid’s House preference or contains avoidable compensation worth architectural consideration;
- `CONFLICT` — satisfying the HFI proposition appears to compete materially with another valid project/technical requirement and needs reconciliation;
- `UNRESOLVED` — evidence/decision remains genuinely open despite representation;
- `NOT-MODELLED` — the authoritative RH source does not represent enough facts to judge.

### Important distinction

`NOT-MODELLED` is not `UNRESOLVED`.

- `NOT-MODELLED` = project source lacks the audit fact.
- `UNRESOLVED` = the question itself remains open after represented facts/evidence are considered.

This vocabulary should be formally frozen at HFI-07A before individual RH findings are issued.

---

# 20. HFI-06 gate decision

The target architecture is ready to judge the Reference House.

It satisfies the HFI-06D attacks for:

- percentile misuse;
- pseudo-precision;
- authority laundering;
- novelty seeking;
- RH incumbency/overfit;
- hidden area inflation;
- category leakage;
- scalar reduction;
- internal contradiction;
- technical-duty conflict;
- housework/care bias;
- unresolved-question laundering;
- measurement/state ambiguity;
- target proliferation.

No target is withdrawn or changed.

The remaining risks are now **audit/integration risks**, not target-formation defects.

---

# 21. HFI-07A handoff

Before any Reference House PASS/IMPROVE finding, HFI-07A must:

1. freeze the result vocabulary above;
2. inventory which HFI-06 target facts the current RH source can actually represent;
3. distinguish direct source facts from derivable facts;
4. identify relational targets whose input geometry/state is missing;
5. preserve current external/T4/T5 authority classes;
6. mark absent facts `NOT-MODELLED` without drawing/assuming them;
7. identify site-only questions that cannot be answered by the site-agnostic RH;
8. identify current compiler/source facts that can assist the audit without broadening their proof authority;
9. keep target derivation closed—HFI-07 is not allowed to move the goalposts to fit the house.

---

# 22. Closeout

**Packet:** HFI-06D — target red-team  
**Baseline:** `c31ad8dd3e82cf229bb325d0b4cdb20681384c0e`  
**Exact question answered:** the HFI-06 target set survives adversarial review for percentile misuse, false precision, authority/category leakage, novelty, current-house overfit, area inflation, target interactions, technical conflict and unresolved-question laundering.  
**Main challenge:** 300 mm preferred stair going was explicitly attacked and retained as a `T4-TARGET — PREFERRED`, not a hard minimum or severity scale; 160–185 mm rise remains a broad preferred range.  
**No-number result upheld:** interface/task relationships remain relational where evidence does not support universal scalars.  
**No target changes:** none required.  
**Audit vocabulary prepared:** `PASS / IMPROVE / CONFLICT / UNRESOLVED / NOT-MODELLED`, with `NOT-MODELLED ≠ UNRESOLVED`.  
**Checks:** no Reference House audit/rewind or geometry change; no doctrine/pattern/compiler/publication/maturity change.  
**HFI-06 gate:** if merged green, HFI-06A through HFI-06D are complete and target formation is frozen for the audit.  
**Exact next packet:** **HFI-07A — modelability / coverage audit.**
