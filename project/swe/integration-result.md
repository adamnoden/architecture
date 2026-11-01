# SWE — integrated software audit result

Owner direction: 31 October 2026. Single workstream [issue #1174](https://github.com/adamnoden/architecture/issues/1174); registration [PR #1176](https://github.com/adamnoden/architecture/pull/1176); final shared integration [PR #1180](https://github.com/adamnoden/architecture/pull/1180).

## Accepted disposition

All nine findings have an implemented disposition. Four separately leased packets share the final integration after publishing their independent source checkpoints. The final PR must pass its applicable checks on the combined head, followed by four current-main publication preflights and an expected-head merge. Its merge and the parent issue retain final validation, release and cleanup evidence; this document does not substitute for live occupancy.

| Finding | Delivered change | Measured result or acceptance evidence |
|---|---|---|
| 1. Dispatcher occupancy race | Typed conflict enters bounded fresh listing and reranking; other failures remain closed | Live/grace competitors, alternative and empty frontiers, retry exhaustion, fresh generation/CAS and store-failure regressions |
| 2. Obsolete PDF routes | Reuse the canonical site-route/exclusion resolver; inspect actual PDF URI annotations | All 31 audited prepared occurrences use canonical routes: 21 Primer and 10 Working Edition; final-PDF metadata check rejects the obsolete route |
| 3. Serial, incoherent lease listing | One immutable commit inventory; validated SHA-addressed blobs; maximum eight concurrent readers; shared graph reader | At 89 records, 91 requests remain but sequential dependency stages fall from 91 to 14 (84.6% fewer) in the deterministic transport fixture; production latency is not measured |
| 4. Report source drift | Select current main before a fresh child process imports programme source; retry only a proven advance, at most three attempts | Real Git/process regressions cover movement, dependency and Node changes, dirty/divergent histories and unrelated failures; existing freshness guard remains |
| 5. Repeated control setup | Exact runtime/manifest-scoped installed-dependency cache, locked install on miss, immediate safe cache save | One matched hosted sample: 28 seconds cold population to 7 seconds warm setup, 21 seconds/75% less; a different Node patch correctly missed |
| 6. Repeated pinned downloads | Persistent content-identified cache verifies every read/download and replaces atomically | Seven requests cold, zero warm after output deletion; 190 ms to 11 ms in one local sample, with identical staged bytes and provenance |
| 7. Overbroad historical proof | Opt-in exclusion only for tests/READMEs in the existing three compiler subtrees; mixed/unknown/manual inputs run fully | All 16 families and 48 PDF builds retained; an eligible excluded change avoids the audit's 394-second proof job, while full repository health remains mandatory |
| 8. Mermaid source overwrite | Render from transformed Markdown | Regression preserves adaptation, frontmatter/provenance, headings and inserted figure through the rendering seam; no current production entry exercises the latent bug |
| 9. Ambient-locale fingerprints | Explicit code-unit order for new/core and Reference House identities; explicit compatible English order plus tie-break for existing DPL contracts | Three distinct process locales; 337 DPL tests in each; twelve frozen snapshots and six generated output files byte-identical; no evidence migration |

Full reasoning, tests and limitations remain in [control](control-result.md), [publication](publication-result.md), [automation](automation-result.md) and [identity](identity-result.md). Metrics are observations with the stated fixture/sample boundary; they are not additive wall-time savings, fleet benchmarks or cost forecasts.

## Preserved provenance and integration review

| Packet | Independent source retained as an integration parent | Original PR |
|---|---|---|
| SWE-CONTROL | `79a098a90afe3253500c020c21ab299effd4d9ee` | [#1182](https://github.com/adamnoden/architecture/pull/1182) |
| SWE-PUBLICATION | `a14f3cc45b563e58c72e9713108572109a007c24` | [#1184](https://github.com/adamnoden/architecture/pull/1184) |
| SWE-AUTOMATION | `748b2d409032e2e3329dd74ce0ee70098cb2716d` | [#1181](https://github.com/adamnoden/architecture/pull/1181) |
| SWE-IDENTITY | `b7a903f55eccbc8748b885391f675dc68b91d671` | [#1180](https://github.com/adamnoden/architecture/pull/1180) |

Integration reconciles main `d4cad187f71b8c025fa681fab15e4ce847333c67`, including concurrent Primer, gallery and technical-investigation work. Source merges preserve the authored union; generated control projections are regenerated from that union. Each packet retains its UUID/generation and explicitly binds its lease to the shared branch/PR. No runtime-claims state enters source history.

Control's independent source passed canonical repository/PDF checks; identity's independent source also passed the 48-PDF historical replay. The shared head must independently pass canonical `npm run check`, control validation, both production PDFs and their metadata/URI checks, typography and all applicable specialised proofs. Earlier green runs establish packet evidence only. The final PR retains the authoritative combined-head run identities.

Local complete-health/rendering limitations are recorded in the owning results: an unchanged SVG label-boundary failure reproduces on untouched registration source, and the local browser cannot reach its Vivliostyle loopback viewer. Native exact-head CI is therefore required at those representation boundaries. No SVG, font, layout, permission or test tolerance was relaxed.

## Completion boundaries

The temporary cache benchmark workflow is removed; its successful hosted evidence remains recoverable. All controlled DPL snapshots, Reference House identities, output bytes, font pins, licences and physical-proof obligations retain their existing authority. DPL intentionally retains its explicitly documented ICU/runtime collation dependency. This work changes software reliability and execution cost; it does not establish additional architectural maturity, physical adequacy or regulatory acceptance.

After the integration merge, the coordinator records all four packets against that merge, reconciles the single parent issue, verifies canonical lease release, closes superseded packet PRs if GitHub has not recognised their inclusion, and inspects/removes proven workstream residue. Only the verified post-merge closeout may report cleanup clean. The directed nine-finding scope then ends; this is not a claim that the wider project frontier is exhausted.

## Reconciliation on 1 November 2026

The original integration [#1180](https://github.com/adamnoden/architecture/pull/1180) passed its exact-head native checks, but could not merge after independent architectural development advanced `main`: the overlaps were **only** generated `STATUS.md`, `project/control/graph.md` and `docs/project/graph-source.ts`. They are projections, not executable SWE code or independent design authority.

Owner-directed replacement [#1197](https://github.com/adamnoden/architecture/pull/1197) retains 88 original software/source/test/result blobs byte-for-byte on accepted architectural main `febd2803d393c41b2003703791723dc9b950718e`; its initial merge commit `fc6ab1b26a350419d6e2f11d49efcc9c81ba4d10` has #1180's original combined head as a second parent. The three projection files start from the newer architectural main and will be canonically regenerated from both sets of control nodes by the repository's existing `status:update` and post-merge reconciliation workflow. Neither older projection may overwrite newly admitted HAD/STR/RWT/ADE work.

All four SWE work packets were freshly reacquired under **generation 2**, with distinct lease IDs, a shared new branch `work/swe-recovery-20261101` and PR #1197. Earlier generation-1 leases are not relied on. Recovered work still requires full exact-head CI, four fresh native publication preflights, expected-head merge and post-merge status/lease verification; this paragraph records a recovery operation, **not** completion proof.
