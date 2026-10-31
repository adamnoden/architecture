# Ground-plan owner-feedback revision

```
node --import tsx publication/specimens/plt03b3/prepare.ts
PLT03B3_FORMAT=b5 npx vivliostyle build -c publication/specimens/plt03b3/vivliostyle.config.js
PLT03B3_FORMAT=a4 npx vivliostyle build -c publication/specimens/plt03b3/vivliostyle.config.js
PLT03B3_FORMAT=a2 npx vivliostyle build -c publication/specimens/plt03b3/vivliostyle.config.js
node --import tsx publication/specimens/plt03b3/validate.ts
```

B5/A4 page 1 is the immediately previous ADE candidate (PLT-03B.2), not the
old black-poche v1 drawing. Page 2 is the revised coordination candidate.
Pages are explicitly labelled. A2 contains the revision only. Print at 100%.
The paired first-floor SVGs prove the changed stair/hall/gallery coordinates,
not a newly accepted first-floor publication plate.

Architecture owns the new apertures, partitions, open connections, return
stair and room costs. See [source rationale](../../../docs/reference-house/ground-plan-resolution.md)
and [all 15 feedback dispositions](../../../docs/publication/architectural-plate-owner-feedback-resolution.md).
Historical C1/ADE/v1 proofs regenerate unchanged. No physical acceptance,
shared-token freeze or construction adequacy is claimed.
