# DPL-13E — Authored Reference House Architectural-Conformance Review Ledger

**Issue:** #506  
**Depends on:** DPL-K #502 / PR #505  
**Landed DPL-K baseline:** `6eb965582819df4e5b12bd26b8d9e19cb352be42`  
**Status:** **MECHANISM IMPLEMENTED; PROJECT-AUTHOR REVIEW NOT YET AUTHORED**

## Purpose

DPL-K established that sixteen of DPL-RS-02's twenty-seven substantive unresolved blockers are not missing compiler evaluators. DPL-02 deliberately classifies them as:

```text
resolutionMode = ARCHITECTURAL_REVIEW
executableStatus = NOT_NATIVE
```

DPL-13E therefore introduces a deterministic evidence seam for **human-authored architectural conformance judgement** without reclassifying that judgement as native computation.

The governing rule is:

> **The machine may validate, bind, fingerprint and aggregate an architectural review. It may not author the architectural verdict.**

## Exact authority scope

The review universe is derived from the current DPL-02 conformance-coverage registry, not maintained as a second hand-written runtime list.

The resulting sixteen clauses are:

- `RH-I01`
- `RH-I03`
- `RH-I04`
- `RH-I05`
- `RH-I06`
- `RH-I07`
- `RH-PROT-02`
- `RH-PROT-03`
- `RH-PROT-05`
- `RH-PROT-07`
- `RH-PROT-09`
- `RH-PROT-10`
- `RH-PROT-11`
- `RH-PROT-12`
- `RH-PROT-13`
- `RH-PROT-15`

The runtime derives this set only where all three DPL-02 conditions hold:

```text
resolutionMode = ARCHITECTURAL_REVIEW
executableStatus = NOT_NATIVE
unresolvedBlocksPositiveConformance = true
```

The ledger's declared review scope must equal that complete set exactly.

## Explicit exclusions

DPL-13E cannot review or discharge:

- `RH-PROT-08` — external professional / structural evidence;
- `RH-PROT-14` — site-interface evidence;
- DPL-11 title, flood/water or access evidence;
- planning judgement/evidence;
- opaque acceleration-trigger disposition;
- any site incompatibility or route-exhaustion proposition.

These remain with their existing owning authorities.

## Ledger contract

A DPL-13E ledger records:

- schema and ledger id;
- `SCREENING` assurance profile;
- exact site id;
- exact candidate id, revision and fingerprint;
- exact Reference House source fingerprint;
- exact DPL-02 coverage-registry fingerprint;
- exact DPL-02 authority-source fingerprint;
- reviewer identity, role and authority basis;
- authored timestamp;
- the complete architectural-review scope;
- zero or more authored clause reviews;
- per-review result: `PASS | UNRESOLVED | FAIL`;
- per-review reason and evidence/source references;
- deterministic review-record and ledger fingerprints.

Review order and evidence-reference order are canonicalised because they are semantically set-like. Material changes to reason, evidence, reviewer authority, candidate identity or governing DPL-02 authority alter identity.

## Candidate / authority binding

The current controlled DPL-RS-02 identities are:

```text
site fingerprint      = c1bc2e7fe0fc5778cda25de81ea0e4f0161962a59d5de80d6bea28d2df33e142
candidate fingerprint = c0b4618cb8203e4dfddcf7e7ef852fa6c92e905fcd8e3a7e5322154e11903d81
case fingerprint      = 0ee4d52ed66097ff735fee2d505ce6dbcc0ca5fac254dd9ea4308c7a90c04ecf
```

These are frozen evidence for the present packet, but the runtime does not trust decorative copied hashes. It compares the ledger against the actual composed DPL-RS-02 candidate and current DPL-02 registry/authority identities and fails closed on mismatch.

## Composition semantics

DPL-12B remains unchanged.

It continues to report these sixteen clauses as `OPEN / EXTERNAL_OR_UNMODELLED`, which correctly states that they are not natively evaluated.

DPL-13E composes **above** that layer:

```text
DPL-12B candidate conformance
        ↓
DPL-13C complete SCREENING blocker ledger
        ↓
DPL-13E exact authored architectural-review overlay
        ↓
existing DPL-13C aggregation semantics
```

An authored review changes only the exact matching Reference House aggregation record:

- `PASS` → `POSITIVE_RESOLVED`;
- `UNRESOLVED` → remains `SUBSTANTIVE_UNRESOLVED`;
- `FAIL` → `SUBSTANTIVE_FAILURE` at candidate/conformance level.

Missing reviews remain exactly as the original DPL-12B `OPEN` records. Nothing disappears merely because a ledger exists.

The source record carries both ledger and clause-review fingerprints so the human evidence remains visible in the deterministic result identity.

## Result restraint

DPL-13E does not add a new whole-site result rule.

The existing DPL-13C aggregator remains authoritative.

Adversarially, even a **test-only all-PASS** architectural ledger changes the repaired RS-02 blocker counts only from:

```text
substantiveUnresolved        = 27
classificationUnresolved     = 17
substantiveFailure           = 0
```

to:

```text
substantiveUnresolved        = 11
classificationUnresolved     = 17
substantiveFailure           = 0
```

and still yields:

```text
UNRESOLVED @ SCREENING
compatibleAtScreening = NOT_ADMITTED
incompatible = NOT_ADMITTED
routeExhaustion = NOT_IMPLEMENTED
```

Likewise, an authored architectural `FAIL` is not site incompatibility. It may show that the present candidate does not conform to the controlled Reference House proposition, but DPL still lacks general route-exhaustion / invariant-site-blocker authority.

## Current project review state

No project-author architectural verdict is authored by this packet.

Therefore the **actual project state remains pending** for all sixteen architectural-review clauses.

This is deliberate. DPL-13E implements the controlled place where a genuine project-author review can be recorded; it does not manufacture one because the software machinery is ready to receive it.

Synthetic PASS / UNRESOLVED / FAIL ledgers exist only inside adversarial tests and carry explicit test-only reviewer authority. They are not project evidence.

## Adversarial proof

The DPL-13E tests prove at minimum:

- the exact sixteen-clause scope is derived from DPL-02 authority;
- a full test-only PASS ledger cannot emit `COMPATIBLE`;
- a partial ledger resolves only reviewed clauses;
- omitted clauses remain explicitly unresolved;
- authored `UNRESOLVED` stays unresolved;
- authored `FAIL` cannot emit `INCOMPATIBLE`;
- `RH-PROT-08`, `RH-PROT-14` and foreign owner clauses are rejected;
- duplicate review clauses are rejected;
- candidate, Reference House and DPL-02 authority mismatches are rejected;
- review/evidence ordering is identity-neutral;
- material reason/evidence changes invalidate identity;
- review composition cannot mutate candidate identity or select another architecture.

## What remains after the mechanism

DPL-13E does **not** remove any actual project blocker until a genuine architectural review is authored.

After that review is supplied, a fresh gate must decide the next dependency-correct move. The remaining candidate paths are expected to include:

- typed owner-side disposition of the seventeen acceleration reviews;
- the two existing source/applicability integration gaps;
- bounded local-quantitative integration;
- external/professional/site/legal evidence;
- planning judgement/evidence;
- DPL-15 real-site work only when real evidence has become the dominant unanswered question.

`COMPATIBLE`, `INCOMPATIBLE`, route exhaustion, DPL-15, DPL-16 and downstream publication claims remain held.
