# PCO-APPLICABILITY — assessment subjects and source applicability

**Result:** complete at source monitoring and reporting scope; no maturity assessment or design acceptance.
**Starting main:** `04212ccdddab5a56b0599061cc6724444e409a08`, 29 October 2026.
**Authority:** [PCO programme](project-control-orchestration-programme.md), issue #953; [HRS baseline](../hrs/hrs-baseline-result.md) and [Current House Basis](../../docs/reference-house/current-house-basis.md) retain architectural applicability authority.

## Reproduced failure

Before production changes, passing only `compiler/reference-house/georgian/layout-revision.ts` to the existing changed-path watch returned `{state: 'fresh', changedEvidence: []}` for both Reference House and Computational track. Their evidence prose had not changed, so that answer was true only about the registered evidence files. The status/CLI did not separately expose the changed design subject. Separately, an unavailable Git baseline produced unknown internal states but the old CLI's empty stale list fell through to “no monitored evidence has changed.”

The correction separates three questions: did evidence content change, did controlling subject/source content change, and what maturity/applicability judgement is actually earned? The first two are watches. The third remains an explicit assessment; neither unchanged watch state nor completed execution promotes an M-level.

## Named subjects and actual source boundaries

`project/maturity-subjects.ts` exhaustively binds the existing twelve assessment IDs to named assessed subjects/revisions, bounded controlling source files or owning directories, and explicit applicability limits. The typed map requires an entry when an assessment is added. It does not replace the evidence chains, ratings, review dates or authored assessment prose in `project/maturity.ts`.

The Reference House assessment still names the historical RH-00–RH-10 technical house and HFI-RW-01 stair rewind. The Computational track assessment still names the historical fixture/domain and RH-C5/CH evidence. Their watches include both that historical source and the seven actual Georgian/interface inputs identified by HRS, so a change to the accepted successor cannot disappear behind unchanged historical review prose. Computational source watches include the owning shared kernels/adapters/methods: changed controlling-input provenance can require reassessment even when canonical geometry is unchanged. No compile fingerprint is hard-coded as a proxy for all applicability.

Pattern, grammar, doctrine and research watches retain their own source boundaries. Prototype/review/deployment/delivery bindings explicitly withhold current-house transfer or real-world acceptance. Publication retains its final integration/release holds. These are the limits already established by the owning evidence and HRS, not newly earned technical assessments. A source directory is a deliberately bounded ownership watch, not inferred transitive provenance or a new dependency graph; changes within it can conservatively call for review. Inputs outside the declared watch still require professional/editorial judgement if materially relevant.

The evidence-content baseline remains `c3701c5f3985063dec77f8fdb83e6ea96b131f00`. The new subject-source watch starts from HRS's inspected `f75668d39bdebb389b12721c28230549566bf8b9`. That is an exact inspection/content boundary, **not the date or proof of an assessment**. Friendly subject/revision labels are not claimed as content fingerprints. Existing evidence is preserved at its original scope; the new watch does not retroactively validate that source or assert that an old rating applies to revision 02.

## Runtime and reporting behaviour

The evidence watch retains fresh/stale/unknown content states. The subject watch reports unchanged, reassessment-required or unknown, with changed source paths. It compares tracked working content as well as committed changes against the source baseline, so an uncommitted design edit is visible. Directory matching respects path boundaries; a similarly named sibling does not trigger another source owner.

A missing/unreadable/non-ancestor Git baseline is unknown. A named source absent from the subject inspection baseline is also unknown for the affected binding. Unknown is not flattened into unchanged or an empty “no changes” statement. Status renders separate evidence and subject tables, with named scopes and applicability limits; the CLI reports both watches and retains the M-level unchanged. Even unchanged source content is explicitly insufficient for automatic applicability to a successor design.

No dispatcher ranking, lease schema, DAG dependency, claim ceiling, M-level, review date, historical proof identity or house geometry changes. Only this bounded PCO execution node closes. Generated control projections remain generated from their owning sources under normal main automation.

## Validation

Seven new tests cover:

1. The recorded layout-only probe: Reference House and Computational source applicability require reassessment while unchanged evidence remains distinguishable; ratings stay M3/M4.
2. A method/provenance-only edit: Computational applicability changes independently of geometry and unrelated assessments.
3. Review-prose, unrelated-file and similarly named sibling-directory controls.
4. A real temporary Git repository: an uncommitted tracked layout edit is detected, and restoration plus unrelated content stays unchanged.
5. Missing baseline and missing named baseline source: unknown in APIs, CLI text and rendered status.
6. Unreadable repository and non-ancestor baseline: controlled unknown, never fresh.
7. Exhaustive named scopes and explicit historical/current-house limits.

TypeScript and all 95 project-control/workflow/proof-scope tests pass. Runtime inspection finds no missing source binding at the recorded HRS baseline. Repository/public surface/build and full exact-head CI evidence belong in the PR. Monitoring can identify recorded content changes and missing applicability evidence; it cannot judge architectural adequacy, discover unrecorded real-world change or perform the required substantive reassessment.
