# OCG-01C — Consequence Ledger

**Programme:** OCG — Occupied Change  
**Parent:** [#547 — occupied change and bounded intervention programme](https://github.com/adamnoden/architecture/issues/547)  
**Packet issue:** [#571 — OCG-01C — consequence ledger](https://github.com/adamnoden/architecture/issues/571)  
**Depends on:** OCG-01B / PR #570 / merge `22c6b717cb14055329b52ae7a903d51ca30ff28e`  
**Baseline `main`:** `22c6b717cb14055329b52ae7a903d51ca30ff28e`  
**State:** candidate ledger freeze; becomes the OCG-01C record when merged

## Purpose

Freeze the smallest repeatable ledger that can describe an **intervention consequence envelope** without collapsing heterogeneous effects into one severity, disruption or renovability score.

The ledger is descriptive. It records what happens, how far it propagates, what is known, and what appears to cause it. It does **not** decide whether a consequence is acceptable, disproportionate or worth solving architecturally. That judgement belongs to OCG-01D and later evidence work.

The central rule is:

> **Record consequences separately enough that one good dimension cannot cancel one bad dimension.**

A short service outage does not offset destructive fabric access. A clean work zone does not offset loss of the only bathroom. A small access opening does not make a long recovery tail disappear.

---

## OCG-01C boundary

This record does not:

- define proportionality or acceptance criteria — OCG-01D;
- perform external research — OCG-02;
- select canonical interventions — OCG-03;
- audit doctrine or the Reference House — OCG-04/05;
- assign a scalar severity, score, grade, traffic light or weighted total;
- infer contractor duration where no controlled basis exists;
- treat every consequence as architecture-owned;
- create doctrine, patterns, Reference House changes, compiler constraints, delivery requirements, drawings or publication prose.

---

# 1. Ledger architecture

Every ledger instance has four layers:

1. **Intervention identity** — what is intentionally being changed and under what occupied condition.
2. **Consequence rows** — separate records for fabric/access, services, occupancy, worksite/contamination, logistics, reinstatement and recovery.
3. **Propagation / ownership record** — where consequences extend beyond the direct technical object and what appears to cause them.
4. **Evidence state** — what is observed, controlled, inferred, unknown, not represented or not applicable.

The ledger is intentionally row-based rather than a one-page scorecard. The same intervention may contain several materially distinct consequences in one dimension and should record them separately where combining them would hide causality.

---

# 2. Intervention identity block

Each intervention record begins with:

| Field | Required content |
|---|---|
| Intervention ID | Stable analytical handle for the scenario or test instance |
| Purpose | Plain-language reason for the work |
| Technical object | OCG-01A technical object |
| Intervention class | One OCG-IC1…IC6 class from OCG-01B |
| Starting condition | Relevant incumbent state before work begins |
| Occupied condition | What remains inhabited / in residential use during work |
| Return-to-use condition | What must again be usable for the intervention episode to be considered complete from the occupant side |
| Assumptions | Explicit assumptions needed to analyse the episode |
| Exclusions | Deliberate limits on the scenario |

The identity block is fixed **before** consequence judgement.

A consequence may expose that the intervention was badly designed or awkwardly scoped, but that does not retrospectively change its class.

---

# 3. Consequence-state vocabulary

Each consequence row carries one **consequence state**.

## `PRESENT`

A material consequence is known or represented to occur.

Use `PRESENT` even where the consequence may later be judged proportionate, unavoidable or not architecture-owned.

## `NONE`

The dimension has been examined on the available evidence and no material consequence is present for the stated intervention and occupied condition.

`NONE` is an affirmative finding. It must not be used as a placeholder for missing information.

## `UNKNOWN`

The question is relevant, but the available evidence is insufficient to determine whether the consequence occurs or what its material extent is.

## `NOT_REPRESENTED`

The question is relevant in the real intervention, but the current model, drawing, source record or analysis medium does not contain the information needed to represent it.

This is especially important in later Reference House work. A model silence must not become `NONE`.

## `NOT_APPLICABLE`

The consequence dimension genuinely does not apply to the defined intervention.

Example: a purely visual inspection may have no service consequence to analyse.

These states are mutually distinct. In particular:

> **`NONE` ≠ `UNKNOWN` ≠ `NOT_REPRESENTED` ≠ `NOT_APPLICABLE`.**

---

# 4. Evidence-basis vocabulary

A consequence state is separate from the basis supporting it.

Each material row should identify one or more of the following evidence bases where useful:

## `OBSERVED`

Direct observation, measured project fact or documented completed-work evidence.

## `CONTROLLED_SOURCE`

Explicit fact from a controlled project source: drawing, specification, topology, assembly record, product requirement, site fact or other authoritative project input.

## `EXTERNAL_EVIDENCE`

Supported by external research, standard, guidance, empirical study or industry evidence appropriate to the claim.

## `SUPPORTED_INFERENCE`

A bounded inference from controlled facts where the inferential step is stated and does not overclaim.

## `ASSUMPTION`

A declared scenario assumption used for analysis but not yet evidenced.

## `UNSUPPORTED`

A proposition has been raised but currently lacks enough basis to be treated as a finding.

No numeric confidence percentage is required. Where evidence conflicts, record the conflict explicitly.

---

# 5. Causal-ownership vocabulary

Causal ownership is recorded **per consequence**, not once for the whole intervention.

## `ARCHITECTURE`

Permanent geometry, spatial organisation, service topology or lifespan-layer relationship materially determines the consequence.

## `ASSEMBLY_DETAIL`

The selected assembly, interface, fixing method, product integration or local construction detail materially determines the consequence.

## `CONTRACTOR_METHOD`

Temporary works, sequencing, protection, tool choice, housekeeping, work packaging or competence materially determines the consequence.

## `SITE_PROJECT`

Real site access, occupancy pattern, boundary conditions, external staging, utility facts or other commission-specific circumstances materially determine the consequence.

## `SHARED`

More than one owner materially contributes and separating them would be misleading.

## `UNRESOLVED`

Current evidence cannot honestly allocate cause.

## `NOT_ARCHITECTURE_OWNED`

A useful explicit result where evidence is sufficient to say that permanent architecture is not a material owner, even if the precise downstream owner is not yet important.

This is not a consequence state. A consequence can be both `PRESENT` and `NOT_ARCHITECTURE_OWNED`.

---

# 6. Required consequence dimensions

## 6.1 Access / fabric consequence

Record what must be opened, removed, displaced, penetrated, cut, chased, drilled, broken, lifted or otherwise disturbed merely to expose or manipulate the technical object.

Minimum prompts:

- What is the **access boundary**?
- What permanent fabric or finish is disturbed?
- Is any disturbance destructive rather than reclosable?
- Are technical boundaries such as waterproofing, airtightness, fire, acoustic or weather layers crossed?
- What direct working / withdrawal clearance is needed once access is obtained?

Do not merge later making-good into this field; reinstatement has its own row.

## 6.2 Service consequence

Record material changes in service availability, performance, independence or operating state caused by the intervention.

Minimum prompts:

- Which service is interrupted?
- At what functional/topological scope: component, branch, zone, room group, whole system?
- Which unrelated users or functions are affected?
- Is temporary service provision required?
- Is the outage architecture/topology determined or simply a work-method choice?

Do not infer a duration unless the duration has a controlled basis. `Whole-house water off` may be a valid consequence even where the time is unknown.

## 6.3 Occupancy consequence

Record rooms, routes and ordinary residential functions that become unavailable, constrained, unsafe or materially degraded during the intervention.

Minimum prompts:

- Which rooms or zones are surrendered?
- Which circulation routes are lost or shared with work?
- Which ordinary functions are unavailable: cooking, bathing, toileting, sleeping, laundry, entrance/egress, storage, work/study or others?
- Does the intervention force temporary local or whole-dwelling decant?
- Are unrelated spaces lost only because access or staging passes through them?

Do not reduce occupancy consequence to a room count where the lost function matters more than the number.

## 6.4 Worksite / contamination consequence

Record work-generated conditions that affect the occupied dwelling beyond the direct technical object.

Depending on the intervention this may include:

- dust and fine particulate;
- debris;
- moisture / dirty water;
- fumes, aerosols or odours;
- noise and vibration;
- heat / sparks / hot works;
- temporary hazards and restricted worksite territory.

Minimum prompts:

- What dirty/noisy/wet operations occur?
- Where do they occur?
- What containment is assumed or required?
- What spread remains despite competent ordinary containment?
- Is the consequence created by the permanent architecture, the chosen assembly, the method, or site conditions?

Do not invent particulate, acoustic or exposure quantities without evidence.

## 6.5 Logistics consequence

Record movement and staging required to carry out the intervention.

Minimum prompts:

- worker route from arrival to work face;
- tool and protection route;
- replacement component / material route;
- removed component / debris / waste route;
- staging / laydown territory;
- external access or temporary storage dependencies where relevant;
- collisions with occupied routes or functions.

A route may be geometrically available yet still create material occupied consequence. Conversely, contractor inconvenience alone is not automatically a permanent-architecture defect.

## 6.6 Reinstatement consequence

Record the **reinstatement boundary**: what building construction or finishes must be restored after direct work is complete.

Minimum prompts:

- what must be reclosed or reassembled?
- what must be patched, filled, plastered, sealed, grouted, caulked or redecorated?
- what technical boundaries must be re-established?
- does finish matching enlarge the practical reinstatement area?
- is reclosure deterministic or dependent on artisanal reconstruction?

Reinstatement completion is not automatically return to use.

## 6.7 Recovery consequence

Record residual burden after technical reinstatement but before the stated return-to-use condition.

Minimum prompts:

- final / repeated cleaning;
- dust settlement and wipe-down;
- drying or curing;
- ventilation / odour clearance;
- removal of temporary protection;
- furniture, storage and household reset;
- testing / observation period where relevant to normal use.

Where duration is unknown, record the process rather than inventing a number.

---

# 7. Optional bounded quantitative facts

The ledger permits numbers only where the quantity itself is controlled or observed and genuinely improves the analysis.

Examples include:

- number of rooms losing a stated service;
- number of independent isolation zones affected;
- measured access-panel size;
- known replacement-component dimensions;
- controlled route width / opening width;
- observed or manufacturer-required curing time;
- measured distance through occupied circulation;
- number of finish fields that require reinstatement.

Numbers must retain units and provenance.

The ledger does **not** invite:

- invented duration estimates;
- dust scores;
- noise scores;
- cleanliness grades;
- inconvenience points;
- cost points;
- weighted totals;
- composite `good / bad` arithmetic.

---

# 8. Propagation record

After the dimension rows, record propagation explicitly.

For each material extension beyond the direct technical object/task, state:

| Field | Meaning |
|---|---|
| Propagation target | Fabric, service, room/function, worksite territory, route, reinstatement field or recovery task recruited beyond the direct object |
| Mechanism | Why the consequence extends |
| Consequence state | `PRESENT`, `NONE`, `UNKNOWN`, `NOT_REPRESENTED`, `NOT_APPLICABLE` |
| Causal ownership | OCG causal-ownership vocabulary |
| Evidence basis | OCG evidence-basis vocabulary |
| Note | Short factual statement; no acceptability judgement |

Propagation is not itself failure. It becomes a proportionality question only in OCG-01D and later evidence work.

---

# 9. Compact ledger template

```text
INTERVENTION
ID:
Purpose:
Technical object:
Class:
Starting condition:
Occupied condition:
Return-to-use condition:
Assumptions:
Exclusions:

CONSEQUENCES
1. Access / fabric
   State:
   Facts:
   Extent / bounded quantities:
   Ownership:
   Evidence basis:
   Unknowns:

2. Services
   State:
   Facts:
   Extent / dependencies:
   Ownership:
   Evidence basis:
   Unknowns:

3. Occupancy
   State:
   Facts:
   Rooms / routes / functions affected:
   Ownership:
   Evidence basis:
   Unknowns:

4. Worksite / contamination
   State:
   Facts:
   Containment assumption:
   Ownership:
   Evidence basis:
   Unknowns:

5. Logistics
   State:
   Facts:
   Routes / staging:
   Ownership:
   Evidence basis:
   Unknowns:

6. Reinstatement
   State:
   Facts:
   Reinstatement boundary:
   Ownership:
   Evidence basis:
   Unknowns:

7. Recovery
   State:
   Facts:
   Return-to-use tail:
   Ownership:
   Evidence basis:
   Unknowns:

PROPAGATION
- target / mechanism / state / ownership / evidence / note

COMPLETION STATES
Direct technical task complete when:
Technical reinstatement complete when:
Return to use achieved when:

UNRESOLVED QUESTIONS
- ...
```

The field order is procedural, not a ranking.

---

# 10. Completion-state separation

Every substantive ledger should distinguish three moments where they differ:

## Direct technical completion

The intended inspection, repair, replacement, refit, upgrade or alteration is technically complete and, where relevant, commissioned.

## Reinstatement completion

Disturbed building construction, interfaces and finishes have been restored to the required technical and finish condition.

## Return to use

The stated ordinary residential use can resume without unfinished work controls or residual intervention burden materially preventing that use.

These moments may coincide. The ledger must not assume that they do.

This distinction prevents the recurring analytical error:

> `trade finished` → `intervention finished`.

---

# 11. Representative coverage tests

These examples test only whether the ledger is expressive enough. They do not select the OCG-03 canonical suite or judge the current house.

## IC1 — inspect concealed valve

- **Class:** IC1.
- Access may be `PRESENT` even if the valve itself is not changed.
- Service consequence may be `NONE` if inspection requires no isolation, or `UNKNOWN` if the method is not defined.
- Reinstatement may be `PRESENT` where a finish must be opened merely to inspect.
- A destructive access consequence does not reclassify the intervention.

**Coverage:** PASS.

## IC2 — replace failed valve with broad shutdown

- **Class:** IC2.
- Access/fabric may be small or large.
- Service consequence can state whole-house shutdown without assigning a duration.
- Occupancy can record loss of bathing/cooking water independently.
- Ownership may be `ARCHITECTURE`, `ASSEMBLY_DETAIL`, `CONTRACTOR_METHOD`, `SHARED` or unresolved depending on evidence.

**Coverage:** PASS.

## IC3 — replace one cable / pipe branch

- **Class:** IC3.
- The route can create several access boundaries or one continuous destructive chase.
- Worksite consequence can record dusty cutting independently of service consequence.
- Logistics can record repeated movement through occupied rooms.
- Reinstatement can be much larger than the technical object.

**Coverage:** PASS.

## IC4 — bathroom refit

- **Class:** IC4.
- Occupancy can record loss of bathing/toileting separately from service shutdown.
- Worksite consequence can record wet/dust/noise operations.
- Reinstatement and recovery remain distinct from direct fixture installation.
- The ledger does not presume that the whole consequence should be eliminated.

**Coverage:** PASS.

## IC5 — primary heating-system renewal with unusually low disruption

- **Class:** IC5.
- Several consequence dimensions may legitimately be `NONE` or narrowly `PRESENT`.
- A small consequence envelope does not reduce the technical class.
- No score is needed to show that the intervention is comparatively well bounded.

**Coverage:** PASS.

## IC6 — major structural / spatial alteration

- **Class:** IC6 control case.
- The ledger can record extensive consequences across every dimension.
- The existence of a wide envelope does not itself produce a failure verdict because OCG makes no prior low-disruption promise for arbitrary major alteration.

**Coverage:** PASS.

---

# 12. Integrity tests

## 12.1 Descriptive, not evaluative

PASS. The ledger records consequence facts and ownership without deciding proportionality.

## 12.2 No class contamination

PASS. Intervention class is fixed from technical scope before consequences are recorded.

## 12.3 No scalar pseudo-precision

PASS. No weighted total, colour grade, traffic light or severity score exists.

## 12.4 None vs unknown preserved

PASS. `NONE`, `UNKNOWN`, `NOT_REPRESENTED` and `NOT_APPLICABLE` are distinct states.

## 12.5 Architecture vs method preserved

PASS. Causal ownership is per consequence and can explicitly be `NOT_ARCHITECTURE_OWNED`.

## 12.6 Technical finish vs household recovery preserved

PASS. Direct technical completion, reinstatement completion and return to use are separate states.

## 12.7 Spatial vs topological consequence preserved

PASS. Fabric/access and occupancy can be spatial; service consequence can remain topological; recovery may be temporal/process-based. No polygon is asked to represent them all.

## 12.8 Compact enough for repeated use

PASS. Seven required consequence dimensions plus one propagation section are sufficient to cover the OCG-00C frictions without creating a sprawling trade-specific form.

---

# Result

**OCG-01C PASS — a compact non-scalar consequence ledger is now defined.**

The durable rule is:

> **Record the intervention first; record each consequence independently; record what caused it; never let missing evidence masquerade as no consequence.**

The ledger is now suitable for OCG-02 research notes, OCG-03 canonical scenarios and later doctrine / Reference House reviews.

No consequence recorded by the ledger is automatically excessive. That judgement belongs to **OCG-01D — proportionality framework**.
