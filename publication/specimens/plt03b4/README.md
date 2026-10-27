# PLT B4 circulation and opening comparison

Current owner-review candidate for image-7/image-8 feedback, issue #892.
Architecture is owned by `docs/reference-house/ground-plan-resolution.md` and
`compiler/reference-house/plan-resolution.ts`. This is not a physical acceptance
or token freeze. Stair headroom/framing and service equipment fit remain open.

B5 and A4: B3 on page 1, B4 on page 2, both at 1:100.
A2: B4 only, at 1:50. Print at actual size, without fit scaling.
The courtyard reduces to 3600 × 3300 mm to provide a 1032.5 mm cross passage;
study and service reservations stay unchanged from B3.

```bash
node --import tsx publication/specimens/plt03b4/prepare.ts
PLT03B4_FORMAT=b5 npx vivliostyle build -c publication/specimens/plt03b4/vivliostyle.config.js
PLT03B4_FORMAT=a4 npx vivliostyle build -c publication/specimens/plt03b4/vivliostyle.config.js
PLT03B4_FORMAT=a2 npx vivliostyle build -c publication/specimens/plt03b4/vivliostyle.config.js
node --import tsx publication/specimens/plt03b4/validate.ts
```

Preparation checks the complete-system compile, bounded occupied-route fields,
historical ADE fingerprints and retained B3 source/scene/SVG hashes. Validation
measures finished-PDF horizontal and vertical scale from existing room-label
anchors, page dimensions/counts, 6 pt note size and embedded Source Sans/Unicode.
The scene uses no bay-axis labels as measurement crutches. Paired first-floor
SVGs are coordination evidence, not an accepted upper-floor publication plate.
