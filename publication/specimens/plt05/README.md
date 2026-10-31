# Georgian re-plan review pack

Eight pages: ground, first, attic, front, rear, roof section, developed stair,
service access. B5/A4 true 1:100; A2 true 1:50. Print at 100%, no fit scaling.

```bash
node --import tsx publication/specimens/plt05/prepare.ts
PLT05_FORMAT=b5 npx vivliostyle build -c publication/specimens/plt05/vivliostyle.config.js
PLT05_FORMAT=a4 npx vivliostyle build -c publication/specimens/plt05/vivliostyle.config.js
PLT05_FORMAT=a2 npx vivliostyle build -c publication/specimens/plt05/vivliostyle.config.js
node --import tsx publication/specimens/plt05/validate.ts
```

Owning architectural decision: `docs/reference-house/georgian-replan.md`.
The manifest explicitly denies whole-system successor revalidation and physical
acceptance. Retained B6/PLT04 source and drawing evidence remains unchanged.
