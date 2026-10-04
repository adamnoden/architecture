# Entrance Family ENTR-DOOR-MCW-01 — Principal External Doorset in Masonry Cavity Wall

**Status:** H1 supported-family candidate v0.1  
**Purpose:** represent the principal entrance as one composed interface spanning accessibility, threshold, security, weather, air, thermal continuity, structure, replacement and architectural arrival.  
**Structural status:** opening/support topology native; head/masonry adequacy external under SAB-H1-01.

> **The entrance is one threshold with several authorities, not a door plus six independent checklists.**

## 1. Supported base family

- new detached dwelling;
- principal private entrance;
- masonry cavity-wall host;
- single-leaf replaceable doorset;
- step-free accessible threshold;
- ordinary external landing/approach;
- explicit weather/air/thermal transitions;
- Part-Q secure-doorset route;
- permanent masonry opening / replaceable doorset.

Later families may add paired doors, sidelights or fanlights.

## 2. Semantic composition

The entrance participates in:

- PRINCIPAL_ARRIVAL;
- ACCESS_ROUTE;
- SECURITY;
- WEATHER;
- AIR;
- THERMAL;
- REPLACEMENT;
- EGRESS contribution;
- architectural hierarchy.

These remain contextual relationships rather than permanent flags on the physical door object.

## 3. Accessibility

For the frozen Category-1 H1 target, the principal entrance relationship contributes:

- site/approach route;
- landing;
- door clear opening;
- accessible threshold;
- internal arrival route.

The target owns the exact regulatory dimensions.

The family chooses the stronger H1 base condition:

**step-free accessible threshold**.

The doorset itself never owns a whole Part-M pass.

## 4. Threshold as first-class interface

The threshold must reconcile:

- accessible crossing;
- external drainage/weather exclusion;
- floor/wall DPC/DPM strategy;
- air continuity;
- thermal continuity;
- door operation;
- replacement.

It therefore composes directly with BF-GF-MCW-01.

A geometry change that improves accessibility but breaks drainage is not a pass.

## 5. Security

The principal external doorset is in Part-Q scope for the H1 new-dwelling target.

The compiler derives:

- security applicability;
- product-evidence requirement;
- installation/fixing evidence;
- any target-required principal-entrance provisions.

It does not hard-code one lock or proprietary doorset.

## 6. Envelope contribution

~~~text
WALL WEATHER / AIR / THERMAL FIELDS
       ↓
HEAD + JAMBS
       ↓
DOOR FRAME
       ↓
THRESHOLD
       ↓
GROUND-FLOOR / WALL PERIMETER
~~~

Changing the doorset may stale product/thermal/security evidence without changing the masonry opening.

## 7. Structure

Native:

- opening identity;
- head-support obligation;
- jamb/residual-wall geometry;
- fixing substrate identity;
- dependency graph.

External:

- lintel/head adequacy;
- masonry capacity;
- structural fixing evidence;
- substructure implications.

## 8. Replacement

The doorset is replaceable independently of the permanent masonry opening.

Replacement must preserve/reinstate:

- security;
- weather;
- air;
- thermal;
- threshold;
- installation evidence.

Routine replacement should not require destruction of permanent masonry.

## 9. Architectural arrival

The entrance may be constrained by a grammar/project profile for:

- rank;
- axis;
- sequence;
- surround;
- relation to hall.

Those obligations are separate from M/Q/envelope validity.

## 10. Workmanship and evidence

Required process:

1. construct permanent opening;
2. survey opening and levels;
3. confirm threshold/landing compatibility;
4. select supported doorset;
5. install/fix;
6. complete envelope transitions;
7. inspect before concealment.

Evidence may be shared at product-family level but installation remains occurrence-specific.

## 11. Mutations

- reduce clear opening → accessibility re-evaluates;
- add threshold upstand → access may fail while weather remains valid;
- flatten threshold but remove drainage → access may pass while moisture fails;
- substitute uncertified lookalike doorset → security evidence fails while geometry remains;
- change external landing level → access + moisture + threshold re-evaluate;
- move entrance off architectural axis → grammar may fail while technical validity remains.

## 12. H1 posture

~~~text
principal-arrival semantics   NATIVE
access applicability          TARGET/NATIVE
threshold composition         SUPPORTED ROUTE
weather/air/thermal           SUPPORTED ROUTE + EXTERNAL PRODUCT/JUNCTION EVIDENCE
security applicability        TARGET/NATIVE
secure doorset performance    EXTERNAL PRODUCT EVIDENCE
structural topology           NATIVE
head/masonry adequacy         EXTERNAL STRUCTURAL EVIDENCE
replacement                   NATIVE SEMANTICS
fire/escape contribution      BUILDING-SCOPE
~~~

## 13. Source anchors

- Approved Document M Volume 1: https://www.gov.uk/government/publications/access-to-and-use-of-buildings-approved-document-m
- Approved Document Q: https://www.gov.uk/government/publications/security-in-dwellings-approved-document-q
- Approved Document L: https://www.gov.uk/government/publications/conservation-of-fuel-and-power-approved-document-l
- Approved Document C: https://www.gov.uk/government/publications/site-preparation-and-resistance-to-contaminates-and-moisture-approved-document-c
