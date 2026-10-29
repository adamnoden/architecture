# CCR-STAIR — relative datums, discrete flights and input provenance

**Result:** bounded arithmetic/topology repair complete; no stair redesign or spatial/technical approval.
**Inspected baseline:** `c7d994a962be3d17d19ad85bd397f20d872d6817`, 29 October 2026.
**Owner:** [CCR programme](compiler-correctness-repair-programme.md). Current Georgian house selection remains with its architectural owners.

## Reproduced defects

The canonical system path reproduced all four admitted counterexamples before production changes:

| Input | Before | Corrected consequence |
|---|---|---|
| All level datums translated +1000 | Rise changed from 183.333… to238.888… and overall PASS became FAIL | Rise/pitch/2R+G and status unchanged; absolute landings move +1000. A negative translation is also checked |
| Ground FFL alone raised1000 | Incorrectly retained183.333… rise and PASS | Actual2300/18 =127.777… rise; selected rise criterion and overall system FAIL |
| Flight groups5.5,6,6.5 | Fractional counts passed | Controlled invalid discrete-topology diagnostics |
| Three six-rise flights with100 goings per flight | Passed with30000 run | Controlled rise/going mismatch; no regrouping or invented geometry |

Six regression groups initially passed one valid-control group and failed the other five. They now pass through the canonical system and, where relevant, the layered RH-C5 path.

## Owning changes and admitted boundary

`derive.ts` uses `(firstFfl - groundFfl) / riserCount` and adds ground FFL to accumulated landing rises. `compile.ts` rejects non-finite controlling floor/ceiling datums, non-positive or non-finite storey height, reversed ground floor/ceiling, invalid counts and inconsistent rise/going relationships. Existing first-floor/ceiling ordering remains. Ground FFL may be negative; an arbitrary origin does not change stair geometry.

Counts are positive safe integers: JavaScript must represent the discrete count exactly, not merely accept an enormous rounded integer. Flight groups must be non-empty and total the authored riser count. The existing single `goingsPerFlight` declaration supports **equal flights**, each terminating at a landing or upper floor with one more rise than going. The canonical18-rise, three6-rise/5-going flights retain their arithmetic; a coherent two9-rise/8-going control remains admitted. Unequal flights need a justified future representation change. This repair neither assumes missing per-flight values nor adds a general stair solver.

The method adapter now receives the actual source alongside the compiled house. Rise, pitch and2R+G identify both actual floor facts and rise topology; going identifies its actual authored fact. Renaming source fact IDs is checked through both compilation paths and final lineage. The numeric guidance method, authority snapshot, thresholds and method version are unchanged; this repairs the inputs and provenance supplied to it.

An overall failed source cannot be rescued by passing numeric criteria. Conversely, a standalone four-criterion numeric result does not prove flight fit, landing geometry, headroom, support, guarding, access, fire strategy, construction tolerance or legal compliance. The historical fixture remains distinct from RH-LAYOUT-REVISION-02; neither source's geometry is changed.

## Identity and generated outputs

Adding the actual lower-floor provenance legitimately changes the compact result/compile identity. Before this packet, the canonical compile fingerprint was `16ffc5c68a0247202997603f5fff48737c4c93d89b5947b40336fde0f63b366c`; the repaired source produces `c303660f559d97ff794f0cd670d54f9b737726038b58ab36e55abc5b5fd60e6f`.

This preserves the meaning of `HK-RH-COMPILE-1`; it does not claim a new whole-runtime identity guarantee. CCR-IDENTITY still owns that separate audit. The selected method identity is unchanged. CH-05's current lineage expectation now includes the real lower-floor input; the frozen CH-00 baseline and historical fixture evidence are not rewritten.

The existing output generator regenerated the six current inspection artifacts, output manifest and their linked data plate. Both registers change only their compile stamp. All four SVGs are byte-identical after substituting their SHA-256 identity strings: no graphical geometry, labels or layout change is hidden by this repair. Artifact fingerprints change because the visible identity stamp changes; no new physical drawing acceptance is inferred. The data plate is derived through `dataplate:write`, with publication metadata retained because publication content is unaffected. Re-run these generators after serial CCR integration; do not resolve shared output conflicts by hand.

## Historical Lennard consumer reconciliation

Full health exposed a historical consumer that equated today's generated manifest with the immutable Lennard v0.1 candidate's old compile pin. The candidate, verification payload, actual house-source hash and all title/elevation/street evidence pins remain unchanged.

The historical test now binds exact pre-CCR manifest bytes at `compiler/dpl/fixtures/lennard-pre-ccr-reference-output-manifest.json`, retained from source commit `c7d994a962be3d17d19ad85bd397f20d872d6817`, original path `docs/reference-house/generated/output-manifest.json`, Git blob `46e48b0426c3d57579b3b5b79709ffdf62457bb2`. This states when the retained copy was observed, not the original T4 capture date. Artifact paths inside that historical manifest refer to its historical source context, not today's regenerated artifact bytes.

A byte-pin assertion protects that retained manifest, and the original candidate/source/evidence checks still reproduce the frozen T4 result. A separate assertion binds today's manifest to today's canonical compile and confirms that it differs from the candidate pin: current applicability needs revalidation. This prevents historical reproducibility from silently becoming a current-house or current-compiler pass. No historical candidate/result fingerprint is repinned and no identity check is removed.

## Validation and remaining work

Focused stair/RH-C5/lineage tests passed24; the complete Reference House suite passed344; CH-05 passed after its owning lineage correction. Source-level regressions cover positive/negative datum translations, lower-only change, valid alternative equal flights, fractional/non-finite/empty/inconsistent counts, invalid levels/going, renamed fact IDs and controlled diagnostic identities. Type checking passed.

The first full health attempt correctly exposed the stale generated data plate after compile identity changed. The documented broad `dataplate:update` command attempted a local PDF browser launch and failed with `socket() failed: Operation not permitted`; no alternate sandbox/network route or browser flag was used. Since this packet changes no publication content, the narrower existing `dataplate:write` regenerates the actual dependency. The final local full-health attempt passed source/control/tests/output verification and publication manifest validation, then stopped at figure validation because pinned Chrome 155.0.8059.39 was unavailable. Exact-head CI must complete the full check before merge; its run and serial integration identities are recorded in the PR.

CCR-PLAN/DRAINAGE shared outputs must be reconciled from accepted source, and CCR-IDENTITY remains the integrated identity/consumer review. No maturity promotion, current-house construction acceptance or enlarged proof domain follows from this arithmetic repair.
