# Direct vertical plate block without duplicate node-map energy springs

The actual sparse solve already adds the complete physical vertical plate through `Tᵀ Kplate T`. The previous builder additionally expanded each retained energy mode into six-component frame-node spring maps. The solver built a full spring matrix for those maps before masking their stiffness out, then still evaluated their extensions and diagnostic forces. This duplicates a representation, not physical stiffness.

One downstream consumer is essential: `continuous_rc_portal.solve_continuous_rc_case` includes `½Σ(force × relative)` over raw spring rows in its unchanged1e−7 global work/energy check. Therefore modal diagnostics cannot simply disappear. Actual bearing, roof, wet-support, member and named-plate-load recovery uses its own physical IDs and operators; it does not consume the node-map terms of `VERTICAL-FLOOR/energy/*` diagnostics.

The default `direct-sparse-plate-block-v1` policy now keeps the checked condensed operator and energy modes but creates **no mixed-node vertical energy springs**, in either initial build or section replacement. After convergence, the sparse solver computes each diagnostic extension as its original retained mode dotted with the actual work-mapped port displacement. It returns the same modal IDs, unit stiffness, bilateral activity, extension and force contribution, explicitly marked diagnostic-only, with empty node-map terms. This preserves the existing global energy consumer without a second physical stiffness route.

Any explicit legacy vertical energy rows are filtered **before** spring triplet/CSR assembly. Their diagnostic extensions are evaluated only after physical convergence; they never enter the physical active-set matrix. All other springs and every member remain in their original assembly: the filter matches only `VERTICAL-FLOOR/energy/`. No WET, ROOF or JOINED mode is dropped. Physical residual, contact activity, singularity and work/energy thresholds are unchanged.

`materialised-frame-energy-springs-v1` remains an explicit independent `FrameModel.solve` oracle. Direct-policy frames reject that incompatible solver rather than silently omitting plate stiffness. Section replacement preserves the selected policy and binds the new actual operator/port map; a stale direct binding rejects. Public vertical results and explicit floor-section evidence record the numerical policy. The direct guard stores no bound self-method, avoiding an additional frame self-cycle during common-coordinate rebuilds.

Focused tests compare both sparse representations against the independent legacy frame solve under compression and opening contact, physical ROOF/JOINED springs, WET-named members, global work/energy and every member/contact force. A small independent52-head spatial fixture compares all312 reaction components under both load signs. Section-operator replacement covers both policies; guard, stale-map and immediate reference-count cleanup controls are included. These are component/fixture tests, **not** an actual whole-house solve.

The existing700mm response exposes1156 retained port reactions, counted with bounded64KiB streaming rather than loading the15.8MB full response. A single dense1156² float64 matrix is10.2MiB; a near-full positive modal basis can induce about1.33million mixed-node records before their Python tuple/list/six-component overhead and duplicate sparse triplets. Actual modal rank was not extracted. The change removes those mixed-node records and disabled matrix rows while retaining the checked operator/basis.

The sparse vertical Schur method still materialises dense `Kir` and its full interior response simultaneously; only `Kir` survives for named loads and displacement recovery. WithI interior andP retained coordinates, those two arrays alone occupy16IP bytes during condensation. A later exact improvement could retain CSC coupling and solve RHS columns in blocks while assembling the same retained Schur matrix. The unused `referenceInteriorLoad` field has no current consumer. Neither change is folded into this first correction.

The preceding individual250mm full native run was killed bySIG9 after163.225s with observed maximum childRSS4,427,904KiB. That is execution evidence, not a proven kill cause or a valid native result. This successor changes three existing native source hashes and requires a fresh, serial250mm native experiment plus an unchanged control before dependent proof regeneration. At the component checkpoint no native house solve, source-account edit or receipt rehash had been performed.


The subsequent [exact source72512dc8 full250 attempt](studies/compact-floor250-execution-history.json)
was killed bySIG9 after440.076s, with observed maximum childRSS4,441,812KiB.
No complete native result or convergence field was produced. This does not
identify its kill cause or invalidate the independent component equivalence
checks; it does prevent promoting an actual250mm result.

A later bounded diagnostic stopped the same actual request before its FIRST
vertical condensation:1478 retained ports,13,585 interiors,15,063 total DOFs,
4999 cells and340,339 stored stiffness entries. The denseKir/response pair has a
321,258,080byte float64 minimum, and condensedK/modes34,951,744bytes. Observed
process peak was170,400KiB at that stop. These initial-stage quantities alone do
not locate the later4.24GiB allocation; final assembly/factorisation still needs
phase evidence. No physical law or numerical acceptance threshold changes.
