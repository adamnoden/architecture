# S0 Compiler Target Snapshot — England / 2026-10-03 v0.3

**Target implementation ID:** T-ENG-NDW-2026-10-03-S0-03  
**Normative snapshot date:** 3 October 2026  
**Status:** applicability-hardened research target for S0 Run 02  
**Supersedes for future S0 research:** v0.2  
**Legal status:** research model only; not building-control advice or a declaration of compliance.

> **Target selection can depend on future project events. A date known today does not always settle the regulations that will govern work later.**

## 1. Why v0.3 exists

v0.2 corrected missing regulatory coverage.

A further verification of the Future Homes and Buildings Standards exposed a different issue:

**the hypothetical application date alone does not completely settle the eventual Part L / Part F basis.**

The 2026 amendments:

- were published on 24 March 2026;
- come into force for non-HRB work on **24 March 2027**;
- permit qualifying non-HRB work notified/applied for before 24 March 2027 to remain under the previous standards only if that work is commenced before **24 March 2028**.

Therefore the S0 application assumption of **3 October 2026** is eligible for transitional protection, but the protection remains conditional on commencement.

## 2. Target applicability state

For the S0 research project:

~~~text
application / notice:
  2026-10-03

non-HRB:
  yes

future commencement:
  required input
~~~

### Branch A — commencement before 24 March 2028

The previous L/F regulatory standards remain available under the transitional route, assuming the other statutory conditions are met.

### Branch B — commencement on or after 24 March 2028

Do not assume the previous L/F route remains available.

The target must migrate to the applicable 2026 standards/current legal basis.

## 3. Run-02 frozen transition assumption

For **S0 Run 02 only**, use:

**hypothetical commencement: 1 September 2027 — TEST ASSUMPTION**

This is:

- after the new standards' general commencement date;
- before the transitional commencement deadline;
- attached to a pre-24-March-2027 application.

Therefore Run 02 deliberately exercises the transitional previous-standard L/F route.

This is a test fixture, not a prediction about the real Reference House programme.

## 4. Why this matters computationally

A future project target may contain a condition such as:

~~~text
TARGET BASIS:
  previous L/F route

VALID ONLY IF:
  commencement < 2028-03-24
~~~

If the project later records a commencement after that deadline, the compiler must invalidate the target applicability and require recompilation against the appropriate standards.

That is target dependency/invalidation in a real legal setting.

## 5. Regulatory coverage inherited from v0.2

v0.3 retains the v0.2 coverage model:

- A — structure;
- B1 — means of escape / escape-window applicability;
- B2/B3 — local fire obligations as relevant;
- B4 — external fire spread / relevant-boundary contribution;
- C — moisture;
- E — sound where applicable;
- F — ventilation and room-level purge contribution;
- K — fall protection / impact with glazing;
- L — energy and airtightness;
- O — overheating contribution only;
- P — electrical interaction;
- Q — security;
- Regulation 7 / Approved Document 7 — materials and workmanship.

It does not claim whole-house completeness.

## 6. Current L/F route used by Run 02

Because the frozen Run-02 transition condition is satisfied, use the pre-2027 dwelling guidance basis represented by:

- Approved Document L, Volume 1: **2021 edition incorporating 2023 amendments**;
- the corresponding pre-2027 Approved Document F dwelling route.

The 2026 Approved Documents remain registered as the successor target family and as a migration dependency.

## 7. Wall/window implications retained

For the pre-2027 S0 L route, relevant air-boundary guidance includes:

- identify the air-barrier position and continuity on drawings;
- minimise/seal service penetrations;
- dense aggregate block inner leaves may require plaster/parge/liquid membrane treatment to reduce air permeability;
- window/door frames should connect to the primary air barrier;
- structural penetrations should be sealed.

These are route inputs for the S0 boundary family.

## 8. Target conformance cases added

### TGT-S0-03-01 — eligible transitional commencement

Input:

- application = 2026-10-03;
- commencement = 2027-09-01;
- non-HRB.

Expected:

- previous L/F target branch remains available.

### TGT-S0-03-02 — missed transitional commencement

Input:

- application = 2026-10-03;
- commencement = 2028-04-01;
- non-HRB.

Expected:

- previous L/F target basis becomes invalid;
- L/F evidence depending on that target becomes stale;
- unrelated structural/doctrine evidence remains current unless otherwise affected.

### TGT-S0-03-03 — unknown commencement

Input:

- application = 2026-10-03;
- commencement = UNKNOWN.

Expected:

- target applicability = CONDITIONAL / UNRESOLVED;
- release-grade compile prohibited if the distinction affects applicable requirements.

## 9. Version history

- **S0-01** — first partial target used by Run 01.
- **S0-02** — expanded K/Q/Regulation 7/B/F coverage after red-team.
- **S0-03** — retains v0.2 coverage and makes L/F transitional applicability an explicit future-event dependency.

The legal sources did not change between v0.2 and v0.3.

The **target model improved**.

## 10. Source anchors

- Future Homes and Buildings Standards, Building Circular 01/2026: https://www.gov.uk/government/publications/the-future-homes-and-buildings-standards-building-circular-012026
- Building Circular 01/2026 letter: https://www.gov.uk/government/publications/the-future-homes-and-buildings-standards-building-circular-012026/the-future-homes-and-buildings-standards-building-circular-012026-letter
- Building Regulations etc. (Amendment) (England) Regulations 2026: https://www.legislation.gov.uk/uksi/2026/335
- Approved Document L: https://www.gov.uk/government/publications/conservation-of-fuel-and-power-approved-document-l
- Approved Document F: https://www.gov.uk/government/publications/ventilation-approved-document-f
