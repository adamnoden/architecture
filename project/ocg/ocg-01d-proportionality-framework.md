# OCG-01D — Proportionality Framework

**Programme:** OCG — Occupied Change  
**Parent:** [#547 — occupied change and bounded intervention programme](https://github.com/adamnoden/architecture/issues/547)  
**Packet issue:** [#572 — OCG-01D — proportionality framework](https://github.com/adamnoden/architecture/issues/572)  
**Depends on:** OCG-01C / PR #578 / merge `bc40e49ba23625c8dffa5e182be1d5a59f64d210`  
**Baseline `main`:** `bc40e49ba23625c8dffa5e182be1d5a59f64d210`  
**State:** candidate framework freeze; becomes the OCG-01D record when merged

## Purpose

Freeze how OCG will decide whether an intervention consequence deserves a **permanent architectural response**, a narrower assembly/detail response, a temporary work-method response, further evidence, or no change at all.

The framework exists to stop the programme from making the intuitive but dangerous move:

> `disruption exists` → `the house should permanently accommodate it`.

That inference is not valid by itself.

A permanent response consumes real architecture every day, while the intervention it helps may occur rarely or never. It can add area, joints, cost, carbon, maintenance, fire/acoustic/moisture risk, tolerance sensitivity and visual complexity. OCG therefore treats **accepting some disruption** as a legitimate outcome where permanent provision would be worse.

The governing rule is:

> **Reduce foreseeable intervention consequence only where the whole-life architectural burden of doing so is proportionate to the consequence actually avoided.**

No universal scalar score is created.

---

## OCG-01D boundary

This record does not:

- perform the external research needed to populate probabilities, consequence evidence or precedent — OCG-02;
- select canonical interventions — OCG-03;
- judge current Ovid’s House doctrine or the Reference House — OCG-04/05;
- authorise any new panel, void, manifold, access floor, service zone, removable lining, riser, prefabricated assembly or other response;
- change doctrine, patterns, Reference House geometry, compiler constraints, drawings, delivery requirements or publication prose;
- establish numerical pass/fail thresholds or a weighted renovability score.

This is the decision method only.

---

# 1. Preconditions before proportionality is judged

A consequence is not eligible for architectural response merely because it appears in a discussion.

Before a response is considered, the analysis must state:

1. the intervention and OCG class;
2. the occupied condition;
3. the relevant OCG-01C consequence row(s);
4. consequence state and evidence basis;
5. causal ownership or unresolved causality;
6. what specific consequence a candidate response is intended to change.

## 1.1 Model silence is not a design brief

`UNKNOWN` and `NOT_REPRESENTED` consequences normally require evidence or model improvement before permanent response design.

A design response may be explored experimentally, but it must not be promoted merely to cure uncertainty.

## 1.2 Architecture must be a material owner

If a consequence is credibly `NOT_ARCHITECTURE_OWNED`, OCG must not create permanent fabric to solve it.

Where ownership is `CONTRACTOR_METHOD`, `SITE_PROJECT` or predominantly another authority, the default route is back to that owner unless permanent architecture demonstrably creates or worsens the problem.

## 1.3 A consequence may be real and still need no response

`PRESENT` means the consequence exists. It does not mean the consequence is excessive.

The framework therefore separates:

- **existence** — OCG-01C;
- **cause** — OCG-01C / evidence;
- **proportionality of response** — OCG-01D;
- **architectural design** — later owning authority.

---

# 2. Two ledgers, not one score

A proportionality review compares two non-scalar ledgers:

## A. Intervention consequence ledger

What happens if the incumbent architecture remains unchanged?

This is the OCG-01C record.

## B. Permanent-response burden ledger

What does the proposed response cost the building over its life, including when no intervention is occurring?

The decision is made by reasoned comparison between these ledgers.

Neither ledger is converted into points.

---

# 3. Intervention-side considerations

These describe why reducing a consequence may matter. They do not by themselves justify a permanent response.

## 3.1 Foreseeability / recurrence

Ask:

- Is this intervention expected maintenance, finite-life replacement, common refit, plausible upgrade, life-course adaptation or speculative possibility?
- Is there external evidence that the intervention actually recurs in ordinary dwellings?
- Is it likely to happen several times during the life of the permanent fabric, once, or only under unusual circumstances?
- Does one intervention represent a family of repeated tasks sharing the same architectural provision?

Use evidence categories rather than invented annual probabilities where robust probability data do not exist.

A rare intervention can still deserve provision where the consequence is severe or irreversible. A frequent intervention can still fail proportionality where the permanent response is extremely costly or damaging.

## 3.2 Consequence character

Use the OCG-01C dimensions separately:

- access / fabric;
- services;
- occupancy;
- worksite / contamination;
- logistics;
- reinstatement;
- recovery.

Do not allow low consequence in one dimension to compensate arithmetically for high consequence in another.

## 3.3 Irreversibility / slow-fabric damage

Give particular attention where foreseeable faster-life work repeatedly consumes slower-life fabric.

Questions include:

- Is permanent structural or envelope fabric destroyed merely to reach a short-life component?
- Are technical boundaries repeatedly broken and rebuilt?
- Does each intervention permanently degrade a surface, tolerance or assembly relationship?
- Is exploratory demolition needed because routes or fixings are illegible?

Irreversible slow-fabric damage is a strong reason to investigate an interface response, but not an automatic mandate for universal demountability.

## 3.4 Functional criticality during occupation

Ask what ordinary function is lost and whether alternatives exist.

Examples:

- losing the only WC is different from losing one of several sockets;
- losing all water differs from isolating one basin;
- blocking the only stair differs from surrendering a spare room;
- loss of the only kitchen may have a different consequence from local appliance loss.

Do not encode criticality as a universal score; domestic configuration matters.

## 3.5 Recovery tail

A technically small intervention may deserve attention where access and making-good create a long or repeated recovery burden.

Ask whether the recovery tail is:

- intrinsic to the technical work;
- created by destructive access;
- created by a wet reinstatement method;
- primarily contractor/method-dependent;
- avoidable through a smaller interface change.

---

# 4. Permanent-response burden ledger

Every candidate permanent response must be attacked as if it were itself a new building system requiring justification.

## 4.1 Area and volume

Record:

- plan area consumed;
- wall/floor/ceiling depth consumed;
- clear-room dimensions lost;
- structural/service zones enlarged;
- working clearances permanently reserved;
- knock-on geometric effects.

A few millimetres repeated throughout a house may matter more than a larger local zone that solves several credible tasks.

## 4.2 Capital cost

Consider:

- extra material and labour at initial construction;
- specialist products or trades;
- coordination/detail-design cost;
- testing and commissioning;
- future replacement cost of the maintainability provision itself.

Do not invent costs where no basis exists; record cost direction or evidence need instead.

## 4.3 Embodied and operational carbon

Ask whether the response:

- adds permanent material solely for hypothetical future work;
- enables repeated reuse or avoids destructive replacement enough to repay that material burden;
- adds thermal bridges, air leakage, control loads or other operational penalties;
- creates components with their own finite replacement cycles.

No automatic claim is made that demountability is lower carbon.

## 4.4 Fire performance

Ask whether the response introduces:

- additional cavities;
- penetrations;
- access doors/panels;
- closure interfaces;
- combustible or concealed service zones;
- dependence on fire stopping that must survive repeated opening.

Maintainability cannot be purchased by casually weakening compartmentation or fire robustness.

## 4.5 Acoustic performance

Ask whether joints, removable panels, cavities or access routes reduce:

- airborne sound insulation;
- impact isolation;
- flanking control;
- rattle/vibration robustness.

A silent, solid domestic wall may be worth more than easy access to a service that should not be in that wall in the first place.

## 4.6 Moisture / weather / airtightness

Ask whether repeated opening or extra interfaces create risk to:

- waterproofing;
- weather shedding;
- drainage planes;
- vapour control;
- airtightness;
- condensation control;
- wet-room integrity.

OCG must prefer moving access to the dry/service side over making a waterproofing layer itself repeatedly removable where possible.

## 4.7 Thermal performance

Consider:

- insulation continuity;
- thermal bridges;
- reduced insulation thickness;
- service void interactions;
- access-hatch performance;
- ageing of seals and interfaces.

## 4.8 Structural continuity and robustness

Ask whether the response:

- weakens diaphragms or bracing;
- fragments load paths;
- requires repeated structural penetrations;
- substitutes a removable/adjustable interface for useful continuity;
- creates tolerance-sensitive bearings or fixings;
- increases local damage risk during repeated access.

Structural clarity remains upstream of convenience.

## 4.9 Workmanship and tolerance

Ask:

- Can ordinary competent builders execute the detail reliably?
- Does the response require persistent precision that site reality will not deliver?
- Will repeated removal/reinstatement still fit after paint, movement, dirt and minor damage?
- Does the detail tolerate scrappy future workmanship without compromising slow fabric?
- Are fixings legible and replaceable?

A theoretically reversible detail that becomes seized, misaligned or cosmetically damaged after one cycle has not earned its complexity.

## 4.10 Maintenance burden created by the response

A serviceability feature can become another thing to service.

Check for:

- seals that age;
- clips/fixings that loosen;
- hinges/latches that seize;
- cavities that collect dust or pests;
- access covers that rattle;
- labels/records that become stale;
- inspection requirements created solely by the new system.

The programme must not create **maintenance infrastructure whose own maintenance exceeds the burden it was meant to remove**.

## 4.11 Product dependence and obsolescence

Ask whether future access or replacement depends on:

- proprietary panels;
- unusual clips or profiles;
- one manufacturer;
- software/cloud support;
- specialist tooling;
- exact replacement parts unlikely to persist over building-life timescales.

Prefer ordinary replaceable parts and mechanically intelligible interfaces where performance is otherwise equal.

## 4.12 Security / abuse / accidental access

Ask whether access provision:

- weakens external security;
- makes hazardous systems too casually accessible;
- invites occupant damage or tampering;
- creates child-access or accidental-operation risks.

`Accessible` remains distinct from `exposed`.

## 4.13 Architectural and visual effect

Ask whether the response degrades:

- calm surfaces;
- material solidity;
- proportion;
- room character;
- domestic familiarity;
- tactile quality;
- legibility of permanent architecture.

Serviceability is not entitled to make the house look like a laboratory, hospital, office raised floor, ship or plant room.

## 4.14 Institutional / technical character

Explicitly red-team whether a response introduces:

- grids of access panels;
- excessive visible fixings;
- service-rail aesthetics;
- generic modularity;
- conspicuous technical hardware;
- permanent circulation sized around rare contractor movements;
- over-labelled or over-instrumented domestic space.

The project’s rule remains:

> **Do not optimise construction or maintenance convenience at the expense of permanent architectural quality.**

---

# 5. Counterfactual test

Every proposed response must state a credible **without-response** and **with-response** intervention sequence.

## Without response

Describe the incumbent intervention using the OCG-01C ledger.

## With response

Describe exactly which consequence rows materially change.

Then ask:

- Does the response actually reduce the claimed consequence?
- Does it merely move the consequence elsewhere?
- Does it reduce one intervention while worsening another?
- Does it reduce contractor effort but not occupant consequence?
- Does it replace an occasional wet repair with permanent joints and seals?
- Does it work after furniture, finishes and real products are present?
- Can the component actually be withdrawn, not merely reached?

A response that cannot state its changed sequence has not earned promotion.

---

# 6. Smallest-effective-response rule

Where response is warranted, prefer the smallest architectural intervention that materially reduces the evidenced consequence.

Candidate response scale, from least to most permanent:

1. **Information / stewardship** — records, physical indexing, route knowledge.
2. **Delivery / method** — temporary protection, sequencing, local extraction, work packaging.
3. **Component / fixing** — ordinary replaceable part, accessible fixing, standard isolator.
4. **Interface / detail** — removable trim, dry-side access, designed closure, withdrawal allowance.
5. **Local service geography** — service edge, bounded route, local access zone.
6. **Primary topology / spatial provision** — riser, plant room, larger distribution strategy.
7. **Whole-house demountability / generic flexibility** — highest burden; exceptional justification required.

This is not a hierarchy of virtue. It is a bias against using a large permanent response where a smaller one solves the same evidenced problem.

---

# 7. Temporary-works substitution test

Before making architecture permanent, ask:

> **Could competent ordinary temporary works handle this consequence adequately at the intervention frequency involved?**

Examples potentially owned by temporary method include:

- dust partitions;
- floor/furniture protection;
- local extraction;
- work-hours management;
- temporary water/power provision;
- staging and housekeeping;
- removal bags and waste containment;
- temporary acoustic controls.

A permanent response becomes more plausible where architecture makes competent temporary control unusually difficult, repeatedly ineffective or spatially impossible.

Temporary method is not a free pass for bad architecture. The test is whether ordinary competent method is **proportionate**, not whether an heroic contractor could improvise around the building.

---

# 8. Whole-life recurrence test

Permanent provision should be considered against the life of the slow fabric it occupies.

Ask:

- How many credible intervention families use the same provision?
- Does the provision solve one rare event or many ordinary future tasks?
- Does it survive changes in technology/product type?
- Is the provision likely to remain understandable and operable decades later?
- Does it reduce repeated destruction of slower layers?

A local riser or service edge that supports many foreseeable interventions may justify itself more readily than a custom hatch serving one speculative object.

Do not convert this into discounted-cost arithmetic unless suitable evidence later exists.

---

# 9. Decision routes

OCG proportionality reviews may conclude with one of the following routes.

## `MORE_EVIDENCE`

The consequence, frequency, ownership or response burden is too uncertain to decide.

## `NO_CHANGE`

The consequence is real but current architecture remains the more proportionate whole-life choice.

This is a successful OCG result, not a failure to invent.

## `ACCEPT_DISRUPTION`

The intervention should honestly remain materially disruptive because reducing it would require disproportionate permanent provision.

This route is especially relevant to rare or IC6 control cases.

## `METHOD_RESPONSE`

Competent temporary works, sequencing or delivery practice is the proper response; no permanent architectural change is justified.

## `DETAIL_RESPONSE_CANDIDATE`

Evidence suggests a local assembly/interface/fixing/isolation change could materially reduce consequence with limited permanent burden. Route to the owning detail/pattern authority for design and proof.

## `ARCHITECTURAL_RESPONSE_CANDIDATE`

Evidence suggests a topology, geometry or permanent serviceability provision may be proportionate. Route to the owning architectural authority for design and full downstream revalidation.

These are routing conclusions, not grades. They do not form an ordinal scale.

---

# 10. Decision record template

```text
INTERVENTION
ID / class:
Occupied condition:
Relevant OCG-01C consequence rows:
Evidence basis:
Causal ownership:

PROBLEM STATEMENT
Specific consequence proposed for reduction:
Why it matters:
Foreseeability / recurrence evidence:
Irreversibility / criticality notes:

CANDIDATE RESPONSE
Response description:
Owning architectural authority:
Without-response sequence:
With-response sequence:
Consequence rows materially changed:

PERMANENT-RESPONSE BURDEN
Area / volume:
Capital / replacement cost:
Embodied / operational carbon:
Fire:
Acoustic:
Moisture / weather / airtightness:
Thermal:
Structural:
Workmanship / tolerance:
New maintenance burden:
Product / obsolescence dependence:
Security / abuse:
Architectural / visual effect:
Institutional-character risk:
Unknowns:

ALTERNATIVES
Smaller response considered:
Temporary-method response considered:
No-change / accept-disruption case:

ROUTE
MORE_EVIDENCE / NO_CHANGE / ACCEPT_DISRUPTION / METHOD_RESPONSE /
DETAIL_RESPONSE_CANDIDATE / ARCHITECTURAL_RESPONSE_CANDIDATE

Reasoned conclusion:
```

No score total is permitted.

---

# 11. Adversarial examples

These are method tests only, not project findings.

## Example A — concealed valve requires repainting

A valve replacement is IC2. Suppose access requires a small plaster opening and whole-wall repainting.

A universal removable wall lining is not automatically justified.

The framework asks:

- how often the valve/access family recurs;
- whether services should be in that wall at all;
- whether a local trim/service edge solves the problem;
- whether repainting once in decades is more proportionate than permanent panel joints;
- whether temporary protection already contains the work adequately;
- what acoustic/fire/visual burden a removable lining creates.

Possible valid outcomes include `DETAIL_RESPONSE_CANDIDATE` **or** `NO_CHANGE`.

## Example B — broad water shutdown for one component

The service consequence is present and potentially architecture/topology-owned.

The framework asks whether one additional ordinary local isolator materially narrows repeated interventions with low burden, versus whether a universal manifold would add excessive fittings, space and failure points.

The likely response scale is tested from smallest to largest rather than jumping to maximum zonability.

## Example C — bathroom refit produces dust and wet-work

A bathroom refit is IC4 and will remain real construction.

The framework distinguishes:

- dust caused by demolition of avoidably buried services;
- wet work intrinsic to durable tiling/waterproofing;
- temporary containment properly owned by contractor method;
- whether dry-side service access materially changes the sequence.

It does not treat “some dust remains” as evidence that a dedicated contractor corridor is required.

## Example D — major structural replanning

An IC6 intervention may have a very wide consequence envelope.

The framework can conclude `ACCEPT_DISRUPTION` because permanent universal flexibility would compromise the ordinary house for a rare arbitrary future rearrangement.

This is exactly why IC6 exists as a control class.

---

# 12. Integrity tests

## 12.1 No automatic design response

PASS. `PRESENT` consequence does not imply permanent provision.

## 12.2 No scalar score

PASS. Intervention benefit and permanent-response burden remain plural ledgers.

## 12.3 Negative result is valid

PASS. `NO_CHANGE`, `METHOD_RESPONSE` and `ACCEPT_DISRUPTION` are first-class conclusions.

## 12.4 Existing authority preserved

PASS. OCG routes accepted responses to the owning architectural/detail/delivery authority rather than designing inside the audit.

## 12.5 Temporary works kept in scope

PASS. Permanent architecture must prove why competent ordinary temporary method is insufficient.

## 12.6 Architectural quality protected

PASS. Visual, tactile, spatial and domestic-character costs are explicit permanent burdens rather than dismissed as aesthetics after the fact.

## 12.7 Builder reality protected

PASS. Workmanship, tolerance and repeated-operation robustness are explicit tests.

## 12.8 Serviceability infrastructure can fail proportionality

PASS. The framework explicitly counts area, cost, joints, maintenance, obsolescence and technical penalties created by the response itself.

---

# Result

**OCG-01D PASS — the OCG evaluation frame is complete.**

The durable decision principle is:

> **A foreseeable intervention consequence is not a licence to add permanent infrastructure. Compare the consequence avoided with the whole-life burden of the response, prefer the smallest effective intervention, and permit no change as a positive result.**

OCG-00 and OCG-01 now provide a controlled baseline, problem register, terminology, intervention classes, consequence ledger and proportionality method.

The programme can now move to **OCG-02 — evidence and precedent research** without designing the answer in advance.
