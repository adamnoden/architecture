# Fire / Escape Family FIRE-H1-2S-EGRESS-01 — Two-Storey Dwelling with Escape-Window Route

**Status:** H1 target/family candidate v0.1  
**Purpose:** provide one deliberately narrow whole-house means-of-warning/escape route for an ordinary two-storey detached H1 dwelling before connected-room/stair research proceeds.  
**External review:** mandatory before Gate B is treated as complete.

> **The first fire family should constrain the house enough that escape logic is explicit, not attempt to automate fire engineering.**

## 1. Supported building form

The base family assumes:

- detached single-family dwelling;
- ground storey + one upper habitable storey;
- no basement;
- no habitable loft storey;
- upper storey a maximum of **4.5 m above external ground level** for the selected route;
- one internal private stair;
- ordinary low-rise fire strategy;
- no open-plan special fire-engineered stair arrangement;
- no integral garage in v0.1;
- no sleeping accommodation requiring a special-risk strategy.

The 2026 Approved Document B amendments in force from 30 September 2026 concern second-stair provisions for residential buildings over 18 m and do not materially alter this bounded H1 route.

## 2. Warning / detection

The target generates a dwelling fire-detection/alarm obligation.

The current Approved Document B route recommends at least:

- Grade D2;
- Category LD3;
- in accordance with BS 5839-6.

The compiler records:

- alarm system family;
- required locations from the selected target;
- electrical/evidence dependency;
- commissioning/installation evidence.

It does not reproduce copyrighted BS rules as an internal undocumented checklist.

## 3. Ground-storey escape topology

For each ground-storey habitable room other than the kitchen, the selected route requires one of:

- direct opening onto a hall leading to a final exit; or
- an emergency escape window/external door under the target route.

H1 base preference:

> principal ground-floor rooms connect to the entrance/circulation hall leading to the final exit.

Inner-room conditions are explicitly modelled rather than inferred from plan appearance.

## 4. Upper-storey escape topology

For the selected upper storey <=4.5 m route, each upper habitable room other than the kitchen must have either:

- an emergency escape window/external door; or
- direct access to a protected stair.

H1 v0 selects:

**emergency escape window for each upper habitable room**

as the default family route.

The stair remains an ordinary private stair rather than automatically becoming a protected stair enclosure.

## 5. Emergency escape-window semantics

Where a window carries the ESCAPE role, the target checks the current Approved Document B route including:

- minimum unobstructed openable area;
- minimum openable dimensions;
- maximum bottom-of-openable-area height above floor;
- ability to remain open;
- safe external destination.

The physical window remains the same stable entity used by:

- ventilation;
- security;
- fall protection;
- architectural order.

ESCAPE is a contextual role.

## 6. Critical role interaction

An upper escape window may also carry:

- fall-protection/guarding role;
- security role;
- purge-ventilation role;
- overheating contribution.

A limiter or hardware solution cannot discharge one role while silently invalidating another.

The compiler therefore evaluates configuration compatibility across the shared occurrence.

## 7. Stair role

ST-PRIVATE-01 contributes:

- vertical route;
- landings;
- connected storeys;
- headroom/opening;
- arrival sequence.

FIRE-H1-2S-EGRESS-01 contributes the fire/escape context.

The stair is **not** labelled FIRE_COMPLIANT in isolation.

If a future mutation removes escape-window provision and relies on a protected stair instead, the project leaves this family and enters a different fire family.

## 8. Hall / final exit

The base topology includes:

~~~text
UPPER ROOMS
   ↓ ordinary stair + room escape windows
GROUND HALL
   ↓
ENTR-DOOR-MCW-01
   ↓
FINAL EXIT / OUTSIDE
~~~

The hall and principal entrance therefore participate in escape topology.

Moving or obstructing the entrance can affect fire egress as well as Part M/architecture.

## 9. Inner rooms

The target represents inner-room relationships explicitly.

H1 base family does not allow an upper habitable room to become an unresolved inner room merely because the plan still “works”.

Where the current target allows an inner room only with an appropriate escape-window route, that requirement is generated from topology.

## 10. Fire-resisting construction

The family does not imply that no fire-resisting construction is required elsewhere.

Target obligations remain for, as applicable:

- structural fire resistance;
- cavity barriers;
- linings;
- service penetrations;
- roof/cavity interfaces;
- boundary/external-fire-spread;
- special-risk rooms.

Those remain separate scope-correct propositions.

## 11. Kitchen / open-plan restriction

H1 v0 does not support an open-plan arrangement where the only stair/escape route must pass through a kitchen or another configuration requiring special fire-engineering justification.

Return:

**OUTSIDE FIRE-H1-2S-EGRESS-01 / SELECT ANOTHER FIRE STRATEGY**

This is a deliberate domain constraint, not an architectural condemnation.

## 12. B4 remains site/elevation scope

External-fire-spread analysis is not solved by the escape family.

Openings continue to contribute to:

- elevation;
- relevant-boundary;
- site fire model.

FIRE-H1-2S-EGRESS-01 therefore addresses primarily B1/means-of-warning-and-escape topology.

## 13. Evidence

### Target evidence

- Approved Document B version / transition;
- selected fire-family applicability.

### Product/system evidence

- alarm system;
- escape-window configuration;
- fire-resisting linings/doors where separately required;
- cavity/fire-stop products.

### External competent evidence

- any condition outside the standard family;
- unusual structural fire condition;
- special fire-engineered arrangement.

### Construction evidence

- alarm installation/commissioning;
- escape-window installed opening;
- fire-stopping/cavity barriers;
- fire-resisting assemblies.

## 14. Mutations

### FIRE-M01 — remove escape capability from one upper bedroom window

Expected:

- selected fire family fails for that room;
- ordinary stair geometry remains valid.

### FIRE-M02 — add fixed restrictor preventing required escape opening

Expected:

- escape role fails;
- fall-protection role may pass.

### FIRE-M03 — convert entrance hall/stair to open-plan kitchen-stair arrangement

Expected:

- leave supported family;
- fire-engineered/alternative route required.

### FIRE-M04 — add habitable loft level

Expected:

- building exceeds H1 fire-family vertical scope;
- protected-stair/other fire route required.

### FIRE-M05 — block principal final exit

Expected:

- escape topology fails;
- Part-M route may also fail depending obstruction.

### FIRE-M06 — move upper floor level above 4.5 m route threshold

Expected:

- family applicability invalid;
- fire target migration required.

## 15. Complexity behavior

The author selects:

> H1 two-storey escape-window fire family

and authors:

- storeys;
- rooms;
- circulation;
- windows/doors;
- site levels.

The system derives:

- alarm obligation;
- room escape roles;
- inner-room checks;
- final-exit topology;
- window operational evidence;
- cross-role conflicts.

The author does not manually mark every bedroom with a separate fire checklist.

## 16. H1 posture

~~~text
warning/alarm applicability      SUPPORTED TARGET ROUTE
ground-floor escape topology     SUPPORTED
upper escape-window topology     SUPPORTED
escape-window geometry           TARGET/NATIVE
ordinary stair contribution      SUPPORTED
protected-stair fire family      NOT SELECTED IN V0.1
open-plan special fire strategy  UNSUPPORTED / EXTERNAL
B4 external fire spread          SITE/ELEVATION SCOPE
structural fire/cavity details   TARGET + PRODUCT/EXTERNAL EVIDENCE
construction fire evidence       FUTURE PHYSICAL EVIDENCE
~~~

## 17. External-review requirement

This family is intentionally prepared **before** the external competent review so that a reviewer has something concrete to attack.

Do not promote it to “trusted H1 fire route” until the review addresses:

- applicability;
- missing B1 interactions;
- alarm scope;
- protected-route assumptions;
- fire-resisting-construction dependencies;
- product/evidence boundaries.

## 18. Source anchors

- Approved Document B: https://www.gov.uk/government/publications/fire-safety-approved-document-b
- Approved Document B FAQ: https://www.gov.uk/guidance/approved-document-b-fire-safety-frequently-asked-questions
- 2026 amendment timing: https://www.gov.uk/government/publications/amendments-to-approved-document-b-fire-safety-circular-and-letter/approved-document-b-fire-safety-new-updates-to-support-enhanced-fire-safety
