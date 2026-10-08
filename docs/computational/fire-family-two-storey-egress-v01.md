# Fire / Escape Family FIRE-H1-2S-EGRESS-01 — Two-Storey Dwelling with Escape-Window Route

**Status:** H1 paper-domain fire/escape family v0.1 — external competent review still required  
**Purpose:** provide one deliberately narrow means-of-warning/escape route for an ordinary two-storey detached H1 research dwelling without pretending to automate fire engineering.  
**Authority:** target/family research only; not a building-release claim and not an HSA architectural requirement.

> **A bounded fire family should make escape logic explicit without disguising professional fire-safety judgement as a generic compiler rule.**

## 1. Bounded building form

The base family assumes:

- detached single-family dwelling;
- ground storey + one upper habitable storey;
- no basement;
- no habitable loft storey;
- upper storey within the selected <=4.5 m escape-window route;
- one internal private stair;
- ordinary low-rise fire strategy;
- no open-plan special fire-engineered stair arrangement;
- no integral garage in v0.1;
- no condition requiring a special-risk strategy.

These are competence restrictions for H1 paper research. They are not architectural judgements about houses outside the family.

## 2. Warning / detection

The target creates the dwelling fire-detection/alarm obligation.

The selected Approved Document route references the relevant alarm system category/grade and BS 5839-6. The model should retain:

- alarm-system family;
- required locations from the selected target;
- electrical/evidence dependency;
- commissioning/installation evidence.

It should not reproduce copyrighted standards as an undocumented internal checklist.

## 3. Ground-storey escape topology

The selected route requires each applicable ground-storey habitable room to resolve its relationship to a final exit through the accepted route.

The H1 base condition favours principal rooms opening to a hall that leads to the final exit. Inner-room conditions remain explicit rather than inferred from a plan drawing.

## 4. Upper-storey escape topology

For the selected low-rise route, upper habitable rooms use the escape-window option rather than relying on a protected stair family.

The H1 base therefore assigns an emergency-escape role to each applicable upper habitable-room window.

This is one bounded regulatory route. Another project may choose a protected stair or another accepted fire strategy.

## 5. Emergency escape-window semantics

Where a window carries the `ESCAPE` role, target-derived checks may include:

- unobstructed openable area;
- openable dimensions;
- sill/bottom-of-opening height;
- operational configuration;
- safe external destination.

The same physical window may also carry ventilation, security, fall-protection and architectural roles. `ESCAPE` is contextual, not a permanent property of the product family.

## 6. Cross-role interaction

An upper escape window may also participate in:

- fall protection / guarding;
- security;
- purge ventilation;
- overheating strategy.

Hardware or geometry cannot discharge one role while silently invalidating another. The shared occurrence is evaluated across the relevant scopes.

## 7. Stair role

ST-PRIVATE-01 contributes the physical/vertical circulation route. FIRE-H1-2S-EGRESS-01 contributes the fire/escape context.

The stair is **not** labelled fire-compliant in isolation.

If a project removes escape-window provision and instead relies on a protected stair, it leaves this family and requires another fire route.

## 8. Hall / final exit

The base topology is conceptually:

~~~text
UPPER ROOMS
   ↓ ordinary stair + room escape windows
GROUND HALL
   ↓
PRINCIPAL ENTRANCE / FINAL EXIT
   ↓
OUTSIDE
~~~

The hall and entrance therefore participate in escape topology. Moving, obstructing or reclassifying them can affect fire egress independently of other entrance/circulation obligations.

## 9. Inner rooms and open-plan restrictions

Inner-room relationships are represented explicitly.

The base family does not accept an unresolved upper habitable-room inner-room condition or an open-plan kitchen/stair arrangement that requires special fire-engineering justification.

Such a design is not declared architecturally invalid. It is **outside this fire family** and needs another accepted strategy.

## 10. Fire-resisting construction remains separate

The escape family does not absorb all Part-B obligations.

Separate target/evidence obligations may still apply to:

- structural fire resistance;
- cavity barriers;
- linings;
- service penetrations;
- roof/cavity interfaces;
- external fire spread;
- special-risk rooms;
- doorsets or protected construction where selected.

B4/site/elevation questions are not solved by the escape family merely because B1 topology is represented.

## 11. Evidence

### Target evidence

- Approved Document / target version and transition;
- selected fire-family applicability.

### Product/system evidence

- alarm system;
- escape-window configuration;
- fire-resisting linings/doors where separately required;
- cavity/fire-stop products.

### External competent evidence

- any condition outside the bounded family;
- unusual structural-fire condition;
- special fire-engineered arrangement;
- professional confirmation that the family interpretation itself is sound.

### Construction evidence

- alarm installation/commissioning;
- escape-window installed opening;
- fire-stopping/cavity barriers;
- fire-resisting assemblies.

## 12. Mutations

### FIRE-M01 — remove escape capability from one upper bedroom window

Expected: selected fire family fails for that room while ordinary stair geometry may remain valid.

### FIRE-M02 — add a restrictor preventing the required escape opening

Expected: escape role fails while another window safety/security role may pass.

### FIRE-M03 — convert hall/stair to open-plan kitchen-stair arrangement

Expected: leave the supported family and require an alternative fire strategy.

### FIRE-M04 — add habitable loft level

Expected: vertical scope changes; family applicability fails.

### FIRE-M05 — block principal final exit

Expected: escape topology fails; other circulation/accessibility roles may also be affected according to their own authority.

### FIRE-M06 — move upper floor beyond the selected escape-window route

Expected: family applicability fails and another fire strategy is required.

## 13. H1 paper posture

~~~text
warning/alarm applicability      TARGET-ROUTE RESEARCH
escape topology                  H1 PAPER FAMILY
escape-window geometry           TARGET / SEMANTIC
ordinary stair contribution      RELATED FAMILY
protected-stair route            OUTSIDE V0.1
open-plan special fire strategy  UNSUPPORTED / EXTERNAL
external fire spread             SITE/ELEVATION SCOPE
structural fire/cavity details   TARGET + PRODUCT/EXTERNAL EVIDENCE
construction fire evidence       PHYSICAL EVIDENCE
~~~

The family allowed H1-PAPER to represent one explicit low-rise escape route. It did not establish a trusted fire engine or a compliant building.

## 14. External-review requirement

Competent building-control/fire review remains a live gate for the assumptions in this family, including:

- applicability;
- missing B1 interactions;
- alarm scope;
- protected-route assumptions;
- fire-resisting-construction dependencies;
- product/evidence boundaries;
- conditions that appear superficially inside H1 but should force another strategy.

A negative review finding is expected to correct the family or narrow it; it is not a reason to hide the uncertainty behind a compiler status.

## 15. Reference House boundary

The Reference House does not inherit FIRE-H1-2S-EGRESS-01 automatically. Its plan, stair, storey levels, openings and fire strategy must be reviewed as an actual project. H1 supplies one research case and a set of questions, not the architectural answer.

## 16. Source anchors

- Approved Document B: https://www.gov.uk/government/publications/fire-safety-approved-document-b
- Approved Document B FAQ: https://www.gov.uk/guidance/approved-document-b-fire-safety-frequently-asked-questions
- 2026 amendment timing: https://www.gov.uk/government/publications/amendments-to-approved-document-b-fire-safety-circular-and-letter/approved-document-b-fire-safety-new-updates-to-support-enhanced-fire-safety