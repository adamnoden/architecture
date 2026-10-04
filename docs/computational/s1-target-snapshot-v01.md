# S1 Compiler Target Snapshot — England / 2026-10-03 v0.1

**Target implementation ID:** T-ENG-NDW-2026-10-03-S1-01  
**Normative snapshot date:** 3 October 2026  
**Derived from:** T-ENG-NDW-2026-10-03-S0-03  
**Status:** room-scale research target for S1  
**Legal status:** research model only; not building-control advice or a declaration of compliance.

> **As the semantic model grows, target coverage must grow by applicability—not by indiscriminately attaching every Approved Document to every object.**

## 1. Inherited basis

S1 retains the S0 v0.3 project assumptions:

- England;
- new detached dwelling;
- ordinary low-rise / non-HRB;
- hypothetical building-control application: 3 October 2026;
- hypothetical commencement for this fixture: 1 September 2027;
- transitional pre-2027 L/F route remains available for this test because commencement is before the relevant March-2028 deadline;
- Regulation 7 / Approved Document 7 remains a distinct workmanship/material authority.

Inherited target coverage includes:

- A;
- B;
- C;
- E where applicable;
- F;
- K;
- L;
- O contribution only;
- P interaction;
- Q;
- Regulation 7 / Approved Document 7.

## 2. New room-scale source — Part M

S1 adds an internal doorway, a habitable room on the entrance storey, a circulation approach and user-facing service controls.

That wakes up **Approved Document M, Volume 1: Dwellings**.

The current source is the 2015 edition incorporating 2016 amendments.

It defines three dwelling categories:

- M4(1) Category 1 — visitable dwellings;
- M4(2) Category 2 — accessible and adaptable;
- M4(3) Category 3 — wheelchair user dwellings.

M4(1) is the default mandatory category for new dwellings unless an optional requirement M4(2) or M4(3) is applied through planning.

## 3. Frozen S1 accessibility profile

For S1 Run 01:

**M4(1) CATEGORY 1 — TEST TARGET ASSUMPTION**

This means the fixture deliberately tests:

- access to a habitable room on the entrance storey;
- internal doorway/circulation geometry;
- accessible service-control positions.

It does not claim that a future real project will necessarily remain Category 1.

If planning later requires M4(2) or M4(3), the target category changes and Part-M-dependent evidence becomes stale.

## 4. Internal-door contribution

For Category 1 entrance-storey habitable rooms, the target needs:

- door clear-opening width;
- approach direction;
- corridor/passageway clear width;
- local obstruction geometry.

The target does not store “900 mm corridor good” as an object property.

It derives the requirement from the relation:

~~~text
HALL / APPROACH
    ->
INTERNAL DOOR
    ->
HABITABLE ROOM
~~~

For the frozen S1 baseline:

- approach: head-on;
- corridor clear width: 900 mm;
- door clear opening: 800 mm.

This lies inside the Category-1 guidance route being tested.

## 5. Service-control contribution

For Category 1 habitable rooms, wall-mounted switches and sockets should be positioned within the accessibility band described by Approved Document M.

S1 therefore records control/outlet centreline heights as semantic installation data.

Frozen S1 baseline:

- ordinary socket/control centreline: **600 mm AFFL — TEST ASSUMPTION**.

This is inside the 450–1200 mm guidance band for Category 1 habitable-room switches/sockets.

The target does not make the electrical design itself native.

## 6. Part F door role

Under the frozen pre-2027 Part F route, the internal door also contributes to air transfer through the dwelling.

The S1 baseline therefore records:

- finished-floor state known;
- door undercut: **10 mm — TEST ASSUMPTION**.

This is distinct from:

- clear opening width;
- fire role;
- acoustic role;
- architectural position.

One physical door may therefore carry several independent semantic roles.

## 7. Room-level purge ventilation

S1 contains a complete room floor area, so the target can now exercise the Part-F purge-opening route quantitatively.

Frozen room floor area:

**22.68 m²**

For hinged/pivot windows opening at least 30 degrees, the tested guidance route requires minimum total purge opening area:

~~~text
22.68 / 20 = 1.134 m²
~~~

For opening angles 15–30 degrees:

~~~text
22.68 / 10 = 2.268 m²
~~~

S1 records effective openable area separately from nominal glazing/window area.

This distinction is mandatory.

## 8. Security

Both S1 windows are ground-floor and therefore intentionally treated as easily accessible for the Part-Q test.

The target generates security/product/fixing evidence obligations for both.

This is a deliberate contrast with S0 Run 02, where the test context made upper-floor windows not easily accessible.

## 9. Glazing safety

S1 contains:

- primary window sill at 750 mm;
- secondary window sill at 900 mm.

The low primary glazing therefore enters the Part-K critical-glazing analysis.

The higher secondary sill does not inherit that particular low-sill trigger merely because both windows share a family.

This is an occurrence-specific applicability test.

## 10. External-fire-spread contribution

The two openings occur on different adjacent elevations.

B4 contribution must therefore preserve:

- elevation identity;
- opening area by elevation;
- relevant-boundary context by elevation.

Do not aggregate all windows into one undifferentiated project number.

## 11. Part O contribution

The source records different orientations for the two external walls/windows.

Those properties contribute to whole-dwelling overheating analysis.

S1 does not produce a standalone Part-O pass.

## 12. Fire/escape contribution

The S1 internal door contributes to whole-house escape topology.

The fixture does not declare:

- door fire-resistance role;
- protected-route status;
- room-specific escape-window role.

Those remain whole-house/fire-strategy dependencies.

The correct S1 output is therefore a contribution plus explicit unresolved applicability—not invented fire-door requirements.

## 13. Target-conformance cases

### S1-TGT-01 — Category-1 room access

Input:

- entrance-storey habitable room;
- head-on approach;
- 800 mm clear internal door;
- 900 mm clear passageway.

Expected:

- tested M4(1) doorway/circulation route passes geometrically.

### S1-TGT-02 — local radiator obstruction

Input:

- same doorway;
- emitter moved into the protected local approach/circulation zone.

Expected:

- room-access route becomes invalid/unresolved;
- unrelated window security/thermal evidence remains current.

### S1-TGT-03 — service control too low

Input:

- socket/control centreline = 300 mm AFFL.

Expected:

- M4(1) services/controls obligation fails;
- electrical circuit topology is not automatically invalidated.

### S1-TGT-04 — Part-F door undercut removed

Input:

- air-transfer route relies on door undercut;
- undercut changed from 10 mm to 0.

Expected:

- ventilation transfer-air contribution fails/stales;
- Part-M clear opening can remain passed.

### S1-TGT-05 — purge restrictor

Input:

- two windows originally open >=30 degrees;
- restrictors reduce effective opening condition into 15–30-degree route;
- effective openable area unchanged at 1.50 m².

Expected:

- required purge opening area changes from 1.134 to 2.268 m²;
- purge route fails;
- masonry openings remain geometrically unchanged.

### S1-TGT-06 — accessibility category migration

Input:

- planning condition changes target from M4(1) to M4(2).

Expected:

- Part-M-dependent door/circulation/service evidence becomes stale;
- unrelated structure/weather evidence remains current.

## 14. Target lesson

S1 reinforces a useful rule:

> **Target applicability is attached to semantic roles and relationships, not object names.**

A door does not “have Part M”.

A relationship such as:

> entrance-storey circulation → door → habitable room

creates accessibility obligations under the selected dwelling category.

The same door participates separately in ventilation and fire topology.

## 15. Source anchors

- Approved Document M Volume 1: https://www.gov.uk/government/publications/access-to-and-use-of-buildings-approved-document-m
- Approved Document F: https://www.gov.uk/government/publications/ventilation-approved-document-f
- Approved Document Q: https://www.gov.uk/government/publications/security-in-dwellings-approved-document-q
- Approved Document K: https://www.gov.uk/government/publications/protection-from-falling-collision-and-impact-approved-document-k
- S0 target v0.3: [S0 Compiler Target Snapshot v0.3](s0-target-snapshot-v03.md)
