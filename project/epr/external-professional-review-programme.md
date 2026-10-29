# EPR — External professional review

**State:** current-house briefs refreshed; unissued, with no competent review response recorded  
**Maturity:** M1 at current project scope  
**Reference House gate:** `RH-11`  
**Execution register:** `docs/development/validation-execution-register.md`  
**Current upstream design/convergence map:** [`../book-resolution-programme.md`](../book-resolution-programme.md)

## Purpose

Own the project's competent external professional-review evidence route across structural engineering, fire/building control, MEP/acoustics building physics/energy and human factors/inclusive design.

EPR is the workstream identity. `RH-11` remains the Reference House gate that currently packages and receives this review; it is not renamed because it belongs to the established RH gate sequence.

## Current review set

Existing review-item identifiers remain valid:

- `ER-STR-01` — structural engineering;
- `ER-FIRE-01` — fire / building control;
- `ER-MEP-01` — MEP / acoustics;
- `ER-BPE-01` — building physics / energy;
- `ER-HFI-01` — human factors / inclusive design.

These are execution items inside EPR, not competing workstream codes.

## Evidence rule

Issuing a brief, sending an email, holding a meeting or receiving an unprocessed note is not external validation. A material finding must be recorded, routed to the owning Reference House gate, corrected or explicitly dispositioned, and closed with evidence.

Use the existing processing chain:

`finding → affected project object → owning architectural gate → smallest correction → downstream material made stale → closure evidence`

## Book / house-resolution interface

`IAS`, `OAS` and `HAD` will introduce selected assembly/design families that may sharpen, supersede or add professional-review questions. Their authorisation is not evidence, and issue-ready RH-11 material must not be treated as automatically applicable to later changed details.

`BCR` owns comparison between selected architecture and unresolved technical obligations. It should reuse existing RH-11/EPR questions where still applicable, update source references where geometry/details changed, and add only the competent-review questions actually earned by the selected systems.

Material EPR findings rewind through BCR to the owning IAS/OAS/HAD/Reference House decision and are absorbed by HRS before definitive PLT/Part VI freeze. EPR constrains and validates within professional scope; it does not become the architectural designer.

## Boundaries

- `RH-11` owns the current Reference House review package and rewind routing.
- PHY owns physical test evidence; EPR may be a prerequisite for a meaningful PHY test where engineering/specialist judgement is required.
- BCR owns construction-resolution classification and targeted review routing; it does not replace EPR.
- DPL owns jurisdiction, site facts and site-specific deployment evidence.
- DEL consumes EPR findings as delivery requirements mature; it does not substitute for competent review.

Internal M4 controls, drawings, calculations, issue-ready briefs and BCR matrices are not competent external review. This workstream identity does not raise maturity or claim that professional review has occurred.
## Current-house applicability result

[EPR-REFRESH](current-house-review-applicability.md) reconciles all five discipline briefs to RH-LAYOUT-REVISION-02 and the BCR physical findings, including the current roof comparison and partial sanitary/water alternatives. It replaces predecessor facts in the owning briefs, records the remaining issue inputs and updates the execution register. This completes preparation only: no review was commissioned or received, no manual gate closed and no physical finding discharged. Reconcile selected-source changes before issue.

## Current-house refurbishment packets

`EPR-REFRESH` is self-service after HRS-BASELINE and BCR-PREFLIGHT. Audit each RH-11 brief against the accepted 12 × 12 m house; retain, narrow, supersede or rewrite its applicability. Headers must name the reviewed revision and distinguish current questions from historical three-flight/3300 mm/low-slope facts. Produce `project/epr/current-house-review-applicability.md` with concrete discipline questions, required evidence and owning rewinds. A general disclaimer without corrected facts is insufficient.

The existing manual `EPR-RH11` evidence gate consumes refreshed briefs. Brief preparation does not authorise outreach or commissioning and does not constitute review evidence. Refresh again if selected geometry changes materially before issue. BCR's material evidence dependencies remain explicit; a referral alone cannot discharge an unresolved fit, route, topology or safety dependency.


## EPR-BAY-REVIEW — actual practitioner test of the delivery package

After DEL-BAY-PACK, obtain and process real competent designer and contractor/buildability feedback on the selected construction-bay package. This is a manual node; preparing questions is not receipt of review, and no external contact, appointment or spend is implied. Reuse applicable RH-11 responses where the actual source/scope matches; do not duplicate professional effort merely to satisfy a new identifier.

Record `project/epr/bay-review-result.md`: reviewer role/competence and scope, exact package revision, responses and limitations, findings on comprehensibility/buildability/pricing, and accountable dispositions. Ask what must still be invented by the recipient, what should be simplified, and whether conventional construction or existing tools offer a better route. Rejected proposals and a reviewed conventional fallback are valid outcomes. Do not record an adverse review as a pass; unresolved essential matters must enter the commissioned plan as blockers to the affected design/issue, with actual evidence required. Agent role-play cannot close this node.
