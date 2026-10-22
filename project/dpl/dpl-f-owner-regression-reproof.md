# DPL-F — Coverage Foundation owner regression reproof

**Gate:** DPL-F / #434  
**Date:** 2026-10-22  
**Initial DPL-F baseline:** `3dd02fca17c15c7e9be0d71eec5bd9e388d09f05`  
**Repair PR:** #447 — `DPL: reconcile coverage tests after parallel merges`  
**Repair head:** `dd2e1b45c589edacf238469beb83011e7c97b3bb`  
**Repair merge:** `69e15cecec7a740e5229e5ac47ff3c0756fca14b`

## Why this record exists

The first DPL-F validation run failed before it could validate the gate's programme/status changes.

The failure was not caused by DPL-F. It exposed two stale regression call sites already present after the lateral Coverage Foundation merges:

- DPL-02C tests called `evaluateCandidateConformance(candidate)` after the controlled API required the explicit Reference House source argument;
- DPL-09D tests treated `loadTargetSlice()` as returning the target directly after the loader's controlled return shape became `{ authorityClass, target }`.

This was exactly the kind of cross-packet integration defect DPL-F exists to detect.

## Owner rewind

DPL-02C #428 and DPL-09D #429 were temporarily reopened while the defect was investigated.

The repair changed **test harnesses only**:

- DPL-02C now supplies `createReferenceHouseSource()` explicitly to the conformance evaluator in its affected regression probes;
- DPL-09D now reads target identities through the loader's `.target` member.

No change was made to:

- DPL-02C's 38-entry conformance coverage registry;
- any DPL-12B conformance rule;
- DPL-09D's England family registry;
- any England target slice or applicability semantics;
- DPL-04 profile semantics;
- DPL-13A canonical-case semantics;
- whole-site conclusion authority.

## Reproof

PR #447 exact head `dd2e1b45c589edacf238469beb83011e7c97b3bb` passed the complete repository validation workflow before merge, including:

- TypeScript typecheck;
- repository invariants;
- the full DPL test suite;
- documentation build;
- publication PDF build and validation;
- rendered nomenclature regression chain.

It merged as `69e15cecec7a740e5229e5ac47ff3c0756fca14b`.

DPL-02C #428 and DPL-09D #429 were then reclosed as completed.

## Consequence for DPL-F

The owner rewind does **not** alter DPL-F's substantive coverage finding.

It strengthens the gate evidence: the Coverage Foundations are accepted only after their integrated regression harnesses have been reconciled and re-proved together.

DPL-F may therefore resume from `69e15cecec7a740e5229e5ac47ff3c0756fca14b` with the same substantive decision candidate:

> **PASS COVERAGE FOUNDATIONS — HOLD DPL-13B; AUTHORISE DPL-10E PLANNING SCREENING COVERAGE REGISTRY ONLY; THEN RUN DPL-G.**

The final DPL-F PR must itself pass again against this repaired base before merge.