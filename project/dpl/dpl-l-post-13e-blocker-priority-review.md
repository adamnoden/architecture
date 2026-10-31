# DPL-L — Post-DPL-13E Blocker-Priority / Next-Admission Review

**Issue:** #524  
**Depends on:** DPL-13E #506 / PR #522  
**Reviewed baseline:** `04fe5b884081194688657d64725e9286be4ec3c9`  
**Status:** **PASS DPL-13E; HOLD GENERIC ACCELERATION RESOLUTION AND DPL-15; ADMIT DPL-13F SOURCE/APPLICABILITY INTEGRATION NEXT.**

## 1. Decision

DPL-13E is accepted as complete at its declared authority boundary.

The actual DPL-RS-02 architectural review resolves all sixteen `ARCHITECTURAL_REVIEW / NOT_NATIVE` blockers under project-author-delegated architectural authority while leaving external professional, statutory, site, planning and classification authority untouched.

Current controlled result:

```text
architecturalReviewPass       = 16
substantiveUnresolved         = 11
dueClassificationUnresolved  = 17
substantiveFailure            = 0
wholeSiteConclusion           = UNRESOLVED @ SCREENING
compatibleAtScreening         = NOT_ADMITTED
incompatible                  = NOT_ADMITTED
routeExhaustion               = NOT_IMPLEMENTED
```

The next dependency-correct move is not a generic acceleration engine and not a real-site trial yet.

Admit one bounded packet:

> **DPL-13F — case-specific source/applicability composition integration**

It must consume already-established DPL-09A / DPL-10A authority and surface exact case-specific results for:

- `ENG-COV-SOURCE-APPLICABILITY`;
- `DPL10-COV-SOURCE-COMPOSITION-STATUS`.

Where the current case lacks the project-event/source facts needed for a PASS, DPL-13F must emit an explicit typed unresolved result rather than guessing.

## 2. Remaining substantive blocker inventory — exact 11

After DPL-13E the remaining substantive blockers are:

### External / professional / site / legal evidence — 5

- `RH-PROT-08` — primary structural concept; competent structural evidence;
- `RH-PROT-14` — maintenance geography; actual site-interface evidence;
- `DPL11-COV-SITE-CONTROL` — title / control evidence;
- `DPL11-COV-PHYSICAL-FLOOD-WATER` — external flood/water evidence;
- `DPL11-COV-ACCESS-STATUS` — survey/title/highway/access evidence.

These are not compiler gaps.

### Existing source/applicability integration — 2

- `ENG-COV-SOURCE-APPLICABILITY`;
- `DPL10-COV-SOURCE-COMPOSITION-STATUS`.

These already have owner authority and are the cleanest remaining internal integration seam.

### Planning judgement / evidence — 3

- `DPL10-COV-STRATEGIC-DESIGN-CONTEXT-CAPACITY`;
- `DPL10-COV-LOCAL-QUALITATIVE-EVIDENCE-POLICY`;
- `DPL10-COV-EMERGING-POLICY-MATERIAL-WEIGHT`.

Mechanical source composition may inform these records, but it cannot supply the qualitative judgement.

### Bounded local quantitative opportunity — 1

- `DPL10-COV-LOCAL-QUANTITATIVE-POLICY`.

Croydon contains bounded native numeric methods, but family-level case integration must wait until exact source/status composition is surfaced. This remains downstream of DPL-13F.

## 3. The 17 acceleration blockers — exact owner ecology

DPL-13B does **not** generate opaque acceleration reviews for the England registry.

The rule is narrower:

```text
planning / non-planning entry
  + accelerationTriggers.length > 0
  + at least one referenced site claim is UNKNOWN / ASSUMED / ASSUMED_DEPLOYMENT_DATUM
    ↓
ACCELERATION_REVIEW_REQUIRED
```

The trigger text is carried as owner metadata but is deliberately not executed.

### Planning — 8

1. `DPL10-COV-STRATEGIC-DESIGN-CONTEXT-CAPACITY::ACCELERATION_REVIEW`
2. `DPL10-COV-NEIGHBOUR-AMENITY-PRIVACY-DAYLIGHT::ACCELERATION_REVIEW`
3. `DPL10-COV-TRANSPORT-ACCESS-HIGHWAY-PARKING::ACCELERATION_REVIEW`
4. `DPL10-COV-HERITAGE-DESIGNATION-SETTING::ACCELERATION_REVIEW`
5. `DPL10-COV-TREES-LANDSCAPE-URBAN-GREENING::ACCELERATION_REVIEW`
6. `DPL10-COV-ECOLOGY-BIODIVERSITY-GREEN-INFRASTRUCTURE::ACCELERATION_REVIEW`
7. `DPL10-COV-FLOOD-DRAINAGE-SUDS-PLANNING::ACCELERATION_REVIEW`
8. `DPL10-COV-AIR-QUALITY-NOISE-AGENT-OF-CHANGE::ACCELERATION_REVIEW`

### Non-planning — 9

1. `DPL11-COV-LEGAL-BOUNDARY-TITLE::ACCELERATION_REVIEW`
2. `DPL11-COV-PRIVATE-RIGHTS::ACCELERATION_REVIEW`
3. `DPL11-COV-NEIGHBOUR-PRIVATE-PROCESS::ACCELERATION_REVIEW`
4. `DPL11-COV-SEWER-UNDERTAKER::ACCELERATION_REVIEW`
5. `DPL11-COV-UTILITIES::ACCELERATION_REVIEW`
6. `DPL11-COV-GROUND-ENVIRONMENT::ACCELERATION_REVIEW`
7. `DPL11-COV-PHYSICAL-FLOOD-WATER::ACCELERATION_REVIEW`
8. `DPL11-COV-ACCESS-STATUS::ACCELERATION_REVIEW`
9. `DPL11-COV-CONSTRUCTION-LOGISTICS::ACCELERATION_REVIEW`

Total:

```text
planning       = 8
non-planning   = 9
----------------
opaque reviews = 17
```

## 4. Why a generic acceleration resolver is rejected

These records are not seventeen missing boolean functions.

Their underlying questions include:

- whether neighbour geometry creates a potentially categorical amenity conflict;
- whether an access/highway condition is decision-critical;
- whether credible heritage/ecology/tree/flood/noise evidence changes screening priority;
- whether title/private-right ambiguity can defeat the site;
- whether sewer/network/utility constraints are material now;
- whether ground/contamination/water conditions warrant early investigation;
- whether construction logistics or temporary rights threaten feasibility.

A common resolver would need to do at least one forbidden thing:

- parse owner prose as executable law/judgement;
- infer adverse/benign disposition from a synthetic value keyword;
- treat `AUTHORED` provenance as owner-side review authority;
- infer absence of a problem from absence of external evidence;
- collapse planning/legal/professional judgement into generic machine truth.

DPL-13D.1 already demonstrated the danger: authored synthetic heritage/noise facts cannot suppress opaque review merely because their provenance improved.

Decision:

> **Keep all 17 explicit until typed owner-specific authority or real evidence resolves them. Do not create a generic acceleration engine.**

## 5. Why DPL-13F comes before DPL-15

Two current substantive blockers are different from the rest: their authority is already present and mechanical.

### England source/applicability

DPL-09A already defines the source-selection semantics and explicitly permits a narrow source-selection result to be `PASS`, `UNRESOLVED`, `UNSUPPORTED` or `NOT_APPLICABLE` without claiming technical compliance.

The present runtime, however, does not surface that case-specific source-selection result into DPL-13C aggregation.

DPL-13F should consume the exact current England target/source identities and current case facts. It must **not** infer missing future building-control notice/application/commencement events. If those are decision-critical to transition selection, the correct case-specific result is `UNRESOLVED` with named missing facts.

### Planning source composition/status

DPL-10A already separates development-plan membership, other material-consideration status, source chronology and qualitative planning weight.

The current RS-02 case has an exact controlled Croydon target under the exact London strategic parent. DPL-13F should surface the mechanical source/status composition already present without converting it into policy compliance or permission.

This is useful work even if one or both records remain unresolved: it replaces a generic owner-family placeholder with an exact provenance-bearing case result.

## 6. Local quantitative work remains one gate downstream

`DPL10-COV-LOCAL-QUANTITATIVE-POLICY` is now due in RS-02 because an exact Croydon local target exists.

But bounded local numeric obligations should be composed only after DPL-13F proves the exact source/status identity being used for the case.

Therefore:

> **Do not jump directly to Croydon numeric PASSes before source/status composition is explicit.**

A post-DPL-13F gate may admit a narrowly scoped Croydon quantitative packet if the source/status result supports it.

## 7. DPL-15 remains held for one packet

Real-site work is approaching the critical path because the remaining blocker ecology is increasingly dominated by evidence classes that synthetic fixtures cannot supply.

However, opening DPL-15 before consuming the two already-built source/status spines would mix a known internal integration omission with genuinely external uncertainty.

Decision:

> **Hold DPL-15 through DPL-13F only. Reconsider immediately afterwards.**

## 8. Positive / negative result authority remains held

Nothing in DPL-L admits:

- `COMPATIBLE @ SCREENING`;
- `INCOMPATIBLE`;
- route exhaustion;
- optimisation;
- a third synthetic fixture;
- Reference House geometry changes;
- generic all-borough policy support.

Even if DPL-13F positively resolves both source/status records, substantial external evidence, planning judgement and 17 owner-classification reviews remain.

## 9. Exact next packet — DPL-13F

Admit only:

> **DPL-13F — case-specific source/applicability composition integration**

Required behaviour:

1. consume exact DPL-RS-02 case/candidate/source identity;
2. consume DPL-09A / current England target source authority without claiming technical compliance;
3. consume DPL-10A / exact London + Croydon source/status composition without claiming planning compliance;
4. map only the two exact DPL-13C owner records named above;
5. preserve `PASS | UNRESOLVED | UNSUPPORTED | NOT_APPLICABLE` semantics at the narrow source-selection/status scope;
6. expose missing project-event/source facts explicitly;
7. fingerprint all decision-critical source/case inputs;
8. fail closed on stale target/source/case identity;
9. leave the 17 acceleration records unchanged;
10. leave the other nine substantive blockers unchanged;
11. refuse `COMPATIBLE`, `INCOMPATIBLE` and route exhaustion;
12. make no Reference House mutation.

## 10. Closeout

DPL-13E materially changed the programme: architectural judgement is no longer the dominant unresolved substantive class.

The remaining internal work should now shrink rather than expand the compiler.

DPL-13F is the last clearly justified generic internal-integration packet before another adversarial gate decides whether the programme should move into bounded Croydon quantitative integration or real-site evidence.
