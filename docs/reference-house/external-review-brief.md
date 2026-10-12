# Reference House — RH-11 External Review Brief

**Status:** review package / ready for competent external issue  
**Date:** 2026-10-12  
**Gate:** `RH-11 — External-review package`  
**Whole-house authority:** [RH-10 Whole-House Coordination Audit](whole-house-coordination-audit.md)  
**Current maturity:** **M3 — Coordinated at virtual-design scope**  
**Regulatory baseline:** [RH-11 Regulatory Baseline](external-review-regulatory-baseline-rh11.md)  
**Response format:** [RH-11 Review Response Template](external-review-response-template-rh11.md)

This package exists to put the coordinated Reference House in front of competent specialists **before** further design confidence is allowed to accumulate.

It is not a request for consultants to complete an unfinished architectural design. It is a request to attack explicit decisions.

> **Find the assumption that fails, state why it fails, identify what evidence would prove it, and say which earlier gate must reopen if it cannot be proved.**

Preparation of this package is not external validation. The Reference House remains M3 until actual review findings are received and resolved.

---

## 1. What is being reviewed

The Reference House is one project-specific integration test for House Kernel. Its current controlled baseline is:

- two-storey detached four-bedroom family house;
- outer shell **12.0 × 10.8 m**;
- open **3.6 × 4.0 m** courtyard;
- G-01 Georgian-derived architectural grammar;
- loadbearing outer/courtyard masonry inner leaves with short-span engineered-timber floor concept;
- concentrated east/service-side plant and service geography;
- central MVHR baseline with continuous-MEV fallback;
- air-to-water heat-pump / stored-DHW / low-temperature hydronic baseline;
- outward-draining low-slope roof with no inner court gutter or internal roof outlet;
- approximately **50 m² PV-capable roof reserve** as a forward Future Homes stress case;
- direct-finished masonry walls by default, with selective controlled attachment/service datums;
- no dependency on house-wide removable linings or access floors.

The current shell, rooms, circulation, elevations, structure, services, envelope, drainage and maintenance geography have passed internal cross-system coordination. They have **not** been structurally engineered, dynamically simulated, product-packed, technically detailed or externally validated.

---

## 2. Review disciplines

Issue the common pack with the relevant discipline appendix.

| Discipline | Review brief | Primary ownership |
|---|---|---|
| Structural engineering | [Structural Review Brief](external-review-structural-rh11.md) | load path, masonry, floor/roof framing, openings, penetrations, PV loads, P03 dependency |
| Fire / building control | [Fire & Building-Control Review Brief](external-review-fire-building-control-rh11.md) | escape, warning, compartment/interface closure, visitability, thresholds, regulatory route |
| MEP / acoustics | [MEP & Acoustic Review Brief](external-review-mep-acoustic-rh11.md) | plant-room packing, MVHR, ASHP/DHW, hydronics, terminals, commissioning, service noise |
| Building physics / energy | [Building-Physics & Energy Review Brief](external-review-building-physics-energy-rh11.md) | envelope, airtightness, moisture, thermal bridges, daylight, overheating, Future Homes/PV |

A reviewer should not be forced to opine outside their competence. Cross-disciplinary concerns should be flagged and handed to the relevant reviewer rather than guessed through.

---

## 3. Common document set

Read these before the discipline appendix.

1. [Reference House README](README.md) — current authority stack and coordinated baseline.
2. [RH-10 Whole-House Coordination Audit](whole-house-coordination-audit.md) — why M3 was awarded and what remains unproved.
3. [RH-10 Whole-House Coordination Map](whole-house-coordination-rh10.svg) — one-page system map.
4. [Brief and Constraint Ledger](brief-and-constraint-ledger.md) — fixed, selected, preferred and open project requirements.
5. [Pattern Occurrence Register](pattern-occurrence-register.md) — actual project use of House Kernel patterns.
6. [Service Crossing Register](service-crossing-register-rh06.md) — controlled penetrations through permanent fabric.
7. [External Access & Maintenance Plan](external-access-maintenance-plan.md) — replacement and maintenance geography.
8. [RH-11 Regulatory Baseline](external-review-regulatory-baseline-rh11.md) — current England guidance snapshot and transition warning.

The discipline appendix then identifies the smaller set of drawings and studies that matter to that review.

---

## 4. How to review it

Do **not** review this as a design presentation and do not optimise around the project's stated philosophy.

For each material assumption, classify it as one of:

- **CONFIRM** — technically credible at the stated scope; no material correction;
- **QUALIFY** — direction is credible but the scope, dimension, dependency or wording must narrow;
- **MATERIAL FINDING** — current assumption is not safe to carry forward without a design or technical change;
- **REWIND** — the finding invalidates an architectural coordinate or system decision owned by an earlier RH gate;
- **OUTSIDE REVIEW SCOPE** — requires another discipline or real-site information.

Where a reviewer disagrees with a project choice but it remains technically credible, record that as advice rather than manufacturing a failure.

### Evidence standard

A useful finding identifies:

1. the current project assumption;
2. why it may be wrong or incomplete;
3. the governing technical principle / requirement / evidence;
4. the consequence if unchanged;
5. the smallest credible correction;
6. the earlier RH gate, drawing or occurrence that becomes stale.

---

## 5. Rewind protocol

A negative review is a successful outcome if it narrows the design honestly.

For every `MATERIAL FINDING` or `REWIND`, record:

```text
finding
→ affected project object / pattern occurrence
→ affected RH authority
→ smallest correction
→ downstream documents made stale
→ evidence required to close finding
```

Typical examples:

- floor/roof depth materially exceeds controlled section → reopen RH-04/RH-05;
- service riser cannot carry a safe maintainable bundle → reopen RH-06/RH-07 before enlarging it;
- MVHR cannot meet acoustic/space obligations proportionately → invoke continuous-MEV fallback;
- wall family needs >450 mm generally → reopen RH-02/RH-03 geometry;
- escape strategy needs a protected stair that changes plan/openings → reopen RH-03/RH-04;
- overheating cannot be solved without materially different openings/shading → reopen RH-04/RH-07;
- courtyard causes unacceptable daylight/energy consequences on a real site → reopen the selected project brief/morphology explicitly rather than weaken doctrine.

Do not resolve a material finding by quietly changing a dimension in a downstream detail.

---

## 6. Cross-discipline interfaces that deserve deliberate attack

Several objects sit exactly where failures tend to hide between professional scopes.

### `G-PLANT-01`

Structural openings, fire closure, water failure, MVHR, DHW/hydraulics, dry electrical distribution, acoustics and replacement all meet in a **2.9 × 2.2 m gross** room.

No discipline should assume another has proved the available volume.

### `SV-01`

The **900 × 700 mm clear** vertical zone carries soil/vent, water, dry distribution and two principal MVHR trunks. Its roughly **1050 × 850 mm** framed floor opening is only an engineering starting envelope.

Fire stopping, acoustic separation, support, access and congestion must be considered together.

### Low-slope roof + PV

Roof structure, thermal continuity, waterproofing, drainage, fire/electrical separation, PV mounting and maintenance access share one shallow roof field. No discipline may use the same physical zone twice by assumption.

### Window family `OW-01`

One interface must reconcile masonry structure, thermal bridge control, air/water continuity, security, escape-window free opening, replacement and G-01 reveal proportions.

### Courtyard

The court is simultaneously architecture, environmental modifier, drainage catchment, maintenance working area and structural ring. Any recommendation that changes its width/height/openings must state which of those other roles it affects.

---

## 7. Things reviewers should not assume

The project does **not** claim that:

- House Kernel is a building standard;
- a pattern occurrence proves technical adequacy;
- Approved Documents are legislation or the only compliance route;
- G-01, the courtyard, masonry, MVHR, ASHP, PV or the low-slope roof are universal House Kernel preferences;
- the current surrogate east service side is a real site fact;
- the Reference House is ready for construction;
- the 400–425 mm wall family is a specified wall;
- the 350 mm floor zone contains a proved engineered floor;
- the 50 m² PV reserve is a compliance calculation;
- M3 means externally validated.

If any project document nevertheless implies one of those claims, flag the wording as a defect.

---

## 8. Requested reviewer output

Use the [response template](external-review-response-template-rh11.md) or provide equivalent information.

The most useful response contains:

- a one-paragraph overall verdict;
- critical/material findings first;
- explicit assumptions the reviewer considers credible;
- missing information required before technical design;
- at least two concrete red-team cases;
- exact rewind triggers where applicable;
- items outside the reviewer's competence/scope;
- the applicable regulations/standards/guidance versions used.

A long generic design commentary is less useful than five falsifiable findings.

---

## 9. Gate consequence

RH-11 package preparation passes when a competent reviewer can attack the coordinated house without first inventing the missing question, reconstructing project authority from chat or being asked to design the architecture from scratch.

Actual reviewer responses are a **separate evidence event**.

They may:

- confirm the M3 baseline;
- force local technical qualification;
- reopen RH-03 through RH-10;
- alter pattern occurrences without altering House Kernel doctrine;
- generate new prototype work;
- or expose a problem serious enough to demote the Reference House until resolved.

No maturity increase follows merely from issuing this pack.