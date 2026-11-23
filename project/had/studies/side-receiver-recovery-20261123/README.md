# Frozen side-receiver experiment

Read the[owning recovery note](../../side-receiver-recovery-20261123.md). This directory is recoverable exploration, **not current design authority**. Source969 and the copied kernels are explicitly pinned by `case.json` and `case-reader.mjs`.

Run from the repository root:

```sh
node --import tsx project/had/studies/side-receiver-recovery-20261123/run.mjs
node --import tsx project/had/studies/side-receiver-recovery-20261123/coupled-seizure.mjs
node --import tsx project/had/studies/side-receiver-recovery-20261123/geometry.mjs
node --import tsx project/had/studies/side-receiver-recovery-20261123/floor-pointer.mjs
node --import tsx project/had/studies/side-receiver-recovery-20261123/checks.mjs
node --import tsx project/had/studies/side-receiver-recovery-20261123/draw.mjs
```

`run.mjs` contains8explicit valve rigidity/joint sensitivities in the modified tube kernel; the valve has no copper beam compliance. `coupled-seizure.mjs` includes144separate imposed-force controls and512scalar compatible guide-seizure comparisons. These are distinct, explicit model domains. None is an actual-force bound.

`frame-kernel.ts` is the unchanged pure element/factor helper extract from the pinned existing shared-service-frame method. `thermal-experiment.ts` is that pinned tube-flexibility source with explicit supportXY and valve compliance/expansion modifications. The copies are recovery evidence, not permanent competing solvers. Migrate an earned method through the existing shared compiler contract before active use.

Remaining internal work: full3D pipe/frame/valve coupling, independent temperature and guide/friction states, deformed clearance, actual clamp/contact/capture, joined cover/thermal boundary, complete inventory and core/grid receiving. Existing stored/backfeed/relief/material duties remain.
