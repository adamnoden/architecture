# S0 Compiler Target Snapshot — England / 2026-10-03 v0.2

**Target implementation ID:** T-ENG-NDW-2026-10-03-S0-02  
**Normative snapshot date:** 3 October 2026  
**Status:** red-team revision for future S0 runs  
**Supersedes for future research:** T-ENG-NDW-2026-10-03-S0 used by Run 01  
**Purpose:** preserve the same England/new-dwelling/date basis while correcting target-coverage omissions found by S0 Run 01 red-team.  
**Legal status:** research model only; not building-control advice or a declaration of compliance.

> **The law did not change between v0.1 and v0.2. Our model of the applicable obligations improved. That distinction must remain visible.**

## 1. Versioning lesson

Run 01 used the original target snapshot.

The red-team then found source areas the target had failed to map.

Do not edit the old snapshot to make the historical run appear more complete.

Instead:

~~~text
NORMATIVE BASIS
  England
  new dwelling
  application assumption: 2026-10-03
        |
        +-- target model S0-01  -> Run 01
        |
        +-- target model S0-02  -> future run
~~~

This is the first concrete example of:

- regulatory source version;
- target interpretation/implementation version;

being different version dimensions.

## 2. Project basis retained

Same research assumptions as v0.1:

- jurisdiction: England;
- work: erection of a new detached dwelling;
- ordinary low-rise/non-HRB work;
- hypothetical building-control application: 3 October 2026;
- no assumed earlier transitional entitlement;
- S0 remains a partial wall/window/floor/service slice.

The L/F and B transitional reasoning from v0.1 remains unchanged.

## 3. Source areas retained from v0.1

- Part A — Structure;
- Part B — Fire safety;
- Part C — moisture/site preparation;
- Part E — sound, only where applicable;
- Part F — ventilation;
- Part L — energy;
- Part O — overheating;
- Part P — electrical safety interaction.

v0.2 does not repeat the full source-version discussion in v0.1.

It extends and corrects coverage.

## 4. Added source — Part K

**Source:** Approved Document K, 2013 edition for use in England.

Relevant S0 roles:

- K2 protection from falling at an opening window;
- K4 protection against impact with glazing.

### S0 frozen source trigger

WIN01 nominal sill:

**750 mm AFFL**

Approved Document K's guidance shows:

- guarding at opening windows with an 800 mm guarding height;
- window glazing below 800 mm as a critical glazing location.

### Target-model consequence

Generate:

- fall-protection applicability/guarding obligation if the operational/context conditions trigger it;
- critical-glazing obligation for glazing in the critical zone.

The target does not choose the solution.

Possible resolution routes remain external/supported-family questions.

## 5. Added source — Part Q

**Source:** Approved Document Q — Security in dwellings.

Requirement Q1 applies to new dwellings.

The guidance addresses:

- ground-floor windows;
- basement windows;
- other easily accessible windows.

### S0 consequence

WIN01 is described as upper-floor.

That does **not** prove Part Q window guidance is inapplicable.

Applicability depends on exterior access context such as:

- adjacent roof;
- balcony;
- accessible structure/ledge;
- actual height/approach.

Generate an applicability obligation:

~~~text
IS WIN01 EASILY ACCESSIBLE FROM OUTSIDE?
~~~

If yes:

- security performance;
- hardware;
- frame fixing;

enter the evidence graph.

## 6. Added source — Regulation 7 / Approved Document 7

**Source:** Building Regulations 2010 Regulation 7 and Approved Document 7, 2013 edition incorporating 2018 amendments.

Relevant general proposition:

- adequate and proper materials;
- appropriate use/preparation/fixing;
- workmanlike execution.

### S0 consequence

The target now makes materials/workmanship a visible authority.

This is separate from the Long-Life House workmanship-robustness doctrine.

Conceptually:

~~~text
REGULATION 7
  minimum legal/material/workmanship obligation

LLH WORKMANSHIP ROBUSTNESS
  project doctrine about tolerance,
  adjustment, inspection and remediation
~~~

One detail can pass Regulation 7 expectations and still fail the stricter doctrine profile.

## 7. Expanded Part B coverage — B1 escape-window applicability

S0 v0.1 considered fire primarily at:

- lining;
- cavity;
- penetration.

v0.2 adds a B1 applicability contribution.

A window may need to act as an emergency escape window depending on:

- storey height;
- room type;
- room topology;
- protected stair/alternative route;
- whole-house escape strategy.

Where that role applies, Approved Document B provides dimensional/opening conditions.

### S0 consequence

Do not assert WIN01 is an escape window.

Generate:

~~~text
B1_ESCAPE_ROLE(WIN01) = APPLICABLE / NOT_APPLICABLE / UNRESOLVED
~~~

The whole-house fire model supplies the answer.

## 8. Expanded Part B coverage — B4 external fire spread

A window/opening contributes unprotected area to an external wall.

B4 depends on:

- relevant-boundary geometry;
- building position/use/height;
- total unprotected area;
- external-wall fire-resistance strategy.

### S0 consequence

The local bay contributes:

- opening area;
- wall area;
- elevation identity.

It does **not** locally determine B4 conformance.

Because the S0 source has no real site:

**B4 applicability/performance = UNRESOLVED EXTERNAL CONTEXT**

This is a mandatory visible dependency, not an omitted check.

## 9. Expanded Part F coverage — purge ventilation contribution

Under the pre-2027 Part F route pinned by the normative snapshot, habitable rooms require purge ventilation.

Openable windows/doors are one possible route.

### S0 consequence

The final obligation belongs at room/system level.

If R01 is a habitable room:

~~~text
ROOM R01
  requires PURGE_VENTILATION_ROUTE
~~~

WIN01 contributes only if selected for that role.

If selected, the target needs:

- opening type;
- opening angle/operation;
- effective openable area;
- full room floor area.

The frozen S0 bay does not contain enough whole-room information.

Result:

**UNRESOLVED / CONTRIBUTION ONLY**

## 10. Part O remains whole-house

Approved Document O remains registered but not locally evaluated.

The window may contribute:

- glazing area;
- orientation once known;
- solar-gain/product properties;
- openable/free area;
- shading.

Those values feed whole-dwelling overheating analysis.

The bay should never output a standalone Part O pass.

## 11. Operational-window semantics become a target dependency

v0.2 makes explicit that a WINDOW cannot be evaluated only from:

- width;
- height;
- product ID.

Potential semantic roles include:

- FIXED;
- ORDINARY_OPENABLE;
- PURGE_ROUTE;
- EMERGENCY_EGRESS;
- GUARDED;
- RESTRICTED;
- SECURITY_CRITICAL.

These are conceptual requirements.

No implementation schema is selected.

## 12. Coverage matrix v0.2

| Source area | Source registered | S0-02 coverage | Treatment |
|---|---|---|---|
| A Structure | Yes | partial | topology/route + external/native proof |
| B1 Escape | **Yes / expanded** | applicability contribution | whole-house escape context required |
| B2/B3 local fire | Yes | partial | lining/cavity/edge semantics |
| B4 External fire spread | **Yes / expanded** | contribution only | site/elevation context required |
| C Moisture | Yes | partial | boundary route/detail evidence |
| E Sound | Yes | conditional | project/regulatory role explicit |
| F Ventilation | Yes | **room-level contribution expanded** | purge route not assumed to be window |
| K Fall / glazing impact | **Added** | local applicability + evidence obligation | 750 mm sill triggers analysis |
| L Energy | Yes | partial | wall/window/junction + air |
| O Overheating | Yes | contribution only | whole-dwelling analysis |
| P Electrical | Yes | interaction only | circuit design external |
| Q Security | **Added** | applicability conditional | exterior accessibility required |
| Regulation 7 / AD7 | **Added** | general material/workmanship authority | evidence/workmanship route |
| Planning | No | separate target family | not Building Regulations target |

## 13. Applicability inputs newly required

Future S0 source/context must state or explicitly mark unknown:

- floor level / height above exterior ground;
- exterior fall height;
- whether window opens;
- opening geometry/mechanism;
- whether window is used for purge ventilation;
- whether window is used for emergency egress;
- room classification / floor area;
- external accessibility for security;
- relevant-boundary/site geometry;
- whole-house fire/escape role.

This is a direct result of target red-teaming.

## 14. Conformance cases for the target itself

The target needs tests, not only prose.

### TGT-S0-02-01 — low sill

Input:

- sill 750 mm;
- opening window;
- upper-floor fall risk.

Expected:

- K fall/guarding obligation generated;
- K critical-glazing obligation generated.

### TGT-S0-02-02 — fixed high-sill window

Input:

- fixed glazing;
- sill > 800 mm;
- no critical adjacent door condition.

Expected:

- opening-window guarding route not generated;
- window critical-glazing trigger from low sill not generated.

### TGT-S0-02-03 — easily accessible window

Input:

- new dwelling;
- window accessible from adjacent roof.

Expected:

- Q security obligation generated.

### TGT-S0-02-04 — inaccessible upper window

Input:

- upper-floor window;
- no accessible roof/ledge/route.

Expected:

- Q window-security applicability may resolve NOT APPLICABLE under this route, subject to complete context.

### TGT-S0-02-05 — escape role

Input:

- whole-house fire model marks WIN01 as emergency egress.

Expected:

- B1 escape-window dimensional/operational obligations generated.

### TGT-S0-02-06 — purge role

Input:

- habitable room;
- WIN01 nominated as purge route.

Expected:

- Part F opening-performance contribution generated.

### TGT-S0-02-07 — relevant boundary proximity

Input:

- same bay moved close to relevant boundary.

Expected:

- B4 external-fire-spread obligations become active/stale;
- unrelated floor/member evidence remains current.

### TGT-S0-02-08 — ordinary workmanship

Input:

- conventional S0-A finish.

Expected:

- Regulation 7/workmanship authority still exists;
- conventional construction is not auto-passed merely because it is familiar.

## 15. Target regression principle

Every future target revision should run all earlier target conformance cases unless:

- the normative source deliberately changed;
- the test is superseded;
- the changed expectation is explicitly recorded.

This is the regulatory equivalent of compiler regression testing.

## 16. v0.1 versus v0.2

### v0.1 got right

- normative date/transition discipline;
- separation of Approved Documents from law;
- partial-coverage honesty;
- A/B/C/E/F/L/O/P source map;
- rule/source version distinction.

### v0.1 missed

- K;
- Q;
- Regulation 7/AD7;
- B1 window-role applicability;
- B4 site-context contribution;
- Part F room/window role interaction.

### v0.2 lesson

A target cannot be validated by asking:

> did we list the obvious Approved Documents?

It needs **adversarial examples that should generate obligations**.

## 17. Use

Future S0 Run 02 should target:

**T-ENG-NDW-2026-10-03-S0-02**

Run 01 remains pinned to:

**T-ENG-NDW-2026-10-03-S0**

Do not rewrite that history.

---

## Authoritative source anchors

- Approved Documents collection: https://www.gov.uk/government/collections/approved-documents
- Approved Document B: https://www.gov.uk/government/publications/fire-safety-approved-document-b
- Approved Document F: https://www.gov.uk/government/publications/ventilation-approved-document-f
- Approved Document K: https://www.gov.uk/government/publications/protection-from-falling-collision-and-impact-approved-document-k
- Approved Document Q: https://www.gov.uk/government/publications/security-in-dwellings-approved-document-q
- Approved Document 7: https://www.gov.uk/government/publications/material-and-workmanship-approved-document-7
- Building Regulations 2010: https://www.legislation.gov.uk/uksi/2010/2214
