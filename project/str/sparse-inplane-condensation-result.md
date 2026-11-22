# Sparse in-plane condensation: isolated numerical successor

The physical CST membrane, omitted apertures, edge bands, finite beam interpolation, retained ports and load assembly are unchanged. This successor replaces Python fill-graph/elimination only when its explicit recorded policy selects a sparse block Schur solve. It supplies no structural convergence, complete signed envelope, joint resistance, house adoption or acceptance.

`compile_perforated_floor(..., numerical_backend='auto-fine-sparse-v1')` selects SciPy only for pitch<500mm;500mm and coarser retain the original Python elimination oracle. Explicit `python` and `scipy-sparse` comparisons are admitted. An unknown policy, missing SciPy, singular/indefinite interior or failed numerical check stops explicitly; there is no backend fallback or physical regularisation. Selection, policy, runtime versions and operator-cache identity are recorded in `numericalCondensation`.

The sparse method assembles the same physical dictionary matrix into CSC blocks. Interior rotations receive reversible0.001 coordinate normalisation; retained rotations keep the existing milliradian work-dual scale. SuperLU uses symmetric minimum-degree ordering, no equilibration and no row-pivot rescue. Symmetric row/column permutations and strictly positive pivots are required. Pivots are converted back to physical-coordinate units before applying the unchanged1e−9 threshold. A materially asymmetric matrix is rejected rather than repaired.

The existing positive-energy reconstruction and1e−3 rigid-mode gates remain unchanged. Interior solve residuals are checked at1e−8 relative scale. A new1e−6 absolute source-work gate checks both rigid translations and the0.001rad rigid rotation against the actual assembled physical load vector. The load-only particular energy is recorded separately from port strain energy. No support, spring, stiffness, retained mode or aperture is added.

Cache identity includes actual geometry, omissions, bands, port patches, law, pitch, finite receivers, requested backend policy and selected backend. Pressure loads are excluded intentionally: cached sparse factors/couplings are reused while each actual new load is solved and reduced again. Tests verify factor identity, signed load changes, zero loads, quadratic particular energy and geometry/material/policy invalidation. Sparse caches do not retain Python Schur steps or a dense interior inverse.

The public distributed-floor case admits250mm, so its loader now binds the existing `vertical-floor-requirements.txt` lock at the first actual sparse consumer. This is an executed dependency, not an unused helper registration. Source counts change distributed23→24, north24→25, continuous26→27, joined28→29, house29→30 and monolithic30→31. Vertical36 and floor58 remain unchanged by union deduplication, but their inherited/nested identities still change. Compiler inventories and affected receipts must follow the same dependency; no existing receipt is rehashed here. The dependency test verifies inheritance, late deduplication and lock-edit invalidation without a native solve.

| Observed actual-source in-plane control | Python oracle | Sparse method |
| --- | --- | --- |
|500mm:3472 triangles,3946DOFs,12ports |1.776s |0.500s |
|250mm:6966 triangles,7660DOFs,12ports |Not executed |0.984s |

The500mm operators differ by at most5.12e−11kN/mm in condensed stiffness and9.75e−12kN in condensed force. Particular energies are19.65529058772944 and19.655290587729965kNmm. The actual250mm result has7648 interior coordinates, minimum physical interior pivot2.39739346, maximum rigid residual1.05e−9kN, energy reconstruction relative error1.88e−12 and source rigid-work residual3.04e−10kNmm. These are observed local-stage timings, not whole-house performance promises.

Both actual-source controls are reproducible tests in [perforated_floor_sparse_test.py](studies/perforated_floor_sparse_test.py). They obtain geometry through the existing source builder and explicitly trap before `FrameModel.solve`; no coupled house solve runs. Independent small-system controls compare the unchanged Python `_schur`, sparse Schur and dense potential energy/source work. Perforations, finite-boundary pressure, retained exact-zero rows, rigid modes, singular/indefinite interiors, physical-unit pivot thresholds, missing-backend behaviour and changed-load cache reuse are covered.

```sh
cd project/str/studies
OPENBLAS_NUM_THREADS=1 python3 -B -m unittest perforated_floor_sparse_test perforated_floor_receiving_test floor_mesh_scope_test distributed_floor_compatibility_test.CondensationTest
```

The earlier individual250/274 whole-house workers exited137 without results. This work does **not** prove their kill cause, or that this change removes their controlling resource limit: the initial500mm in-plane oracle itself completed quickly. The next decisive experiment is the actual250mm whole-house native case, run serially on the successor source identity, with phase/resource evidence if it fails. All affected ancestor and current receipts must subsequently be genuinely regenerated. Predecessor receipts remain on their original source identity and are not rehashed into this candidate.


The first full250mm successor execution is now retained as [exact historical
execution evidence](studies/sparse-floor250-execution-history.json): source
`d054ea76`, native tuple`f2de55ea`,163.225seconds, SIGKILL and maximum child
RSS4,427,904KiB. No native response or convergence result exists. This narrows the
next computational question but does not establish the kill cause. A read-only
audit found large scalar vertical-plate energy representations alongside the
same directly assembled condensed plate block; an exact compact representation
is being investigated separately, preserving global energy diagnostics.
