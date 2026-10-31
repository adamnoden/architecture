# ADE-SECTION-VIEW — orthographic section integrity contract

**Scope:** owner-directed ADE uplift, [issue #1187](https://github.com/adamnoden/architecture/issues/1187). The accepted ADE plan engine remains intact; ADE-MODEL retains its separately gated construction-information contract and HRS-TECHNICAL retains technical source migration. The successor is ADE-SECTION-PARITY. This is an implementation contract, not evidence that the final Reference House sections have already migrated.

## Decision and rejected alternatives

Use a source-bound **2.5D section context compiler** atop the existing 3D projection, planar-face clipping, mesh-boundary, interval-visibility and SVG terminal. It supplies explicit section orientation and handles the real 3D surfaces visible *beyond* a section, without claiming to infer opaque construction or all physical joints.

Rejected:

- Add a horizontal roof line and a top-of-courtyard line in \`section-exemplar.ts\`: treats the particular image, leaves unmodelled occlusion and same failure in other views.
- Draw the entire section from an imported CAD/BIM kernel: duplicates house ownership, expands the supported domain far past the observed need and risks speculative construction completeness.
- Promote the plan compiler into a 3D engine: its joined orthogonal planar topology and assembly resolution have a legitimate, narrower model.
- Add a second vector renderer: current \`DrawingSceneV2\` already owns exact physical strokes, typography, deterministic SVG/PDF and provenance.

## One-way information boundary

\`\`\`text
current architectural house authority (source IDs, shapes, aperture hosts, roof fields)
               ↓ view-specific 3D geometry adapter
vertical facade material with real holes + explicit roof planes + authored cut faces
               ↓
ADE orthographic section context
 - explicit axis, station, looking direction and retained halfspace
 - original mesh boundaries (before clipping)
 - clipped planar occluders + cut caps
 - exact-depth interval visibility for behind-cut edges
 - two output classes: cut and visible background
               ↓
existing model-to-paper transform and DrawingSceneV2
               ↓
SVG/PDF and physical page proof
\`\`\`

The house adapter is responsible for deriving facade terminations from the same roof/eaves authority used by elevations and roof plans. A wall may not independently choose a 'pretty' termination for a section. An aperture belongs to one host and cuts absence into its material, so a sash grid cannot exist if its host aperture is invalid or not present in the source. Unknown openings cannot be rendered by this nominal geometry API; they remain separate obligation symbols in the existing representation system.

The view compiler takes actual source-space **millimetres**, never paper coordinates. It does not choose floor thickness, support, lintel, rainscreen, insulation, cavity closure, structure, glazing product, slab or foundation. A cut face is **caller-authored** material on the exact cut plane. Clipping planar surfaces does not establish a solid cross-section; a generic roof face does not automatically become a roof assembly or section cap.

## Why the edge extraction order matters

1. Calculate candidate boundaries of the *original* source mesh, merging only proven coplanar tiled seams.
2. Clip those lines to the retained halfspace.
3. Clip planar **occluder faces** to the retained halfspace.
4. Perform interval visibility against the retained faces and explicit cut caps.
5. Emit cut-cap boundaries separately at cut weight; background edges remain subordinate.

If we instead derive outline edges **after** face clipping, the clipping operation creates plausible but fictitious lines along the section plane. These can masquerade as roof or wall construction. The test fixture deliberately spans the plane to reject this regression.

## Supported domain and fail-closed behaviour

- Orthographic cuts normal to world X or Y, looking either direction; right-handed basis and positive camera depth remain explicit.
- Convex planar surface faces as occluders. Non-finite, degenerate, non-planar, non-convex projected faces, invalid/opening overlap, duplicate face identity and off-plane cut faces fail rather than guess.
- Vertical plane-aligned facade rectangles with rectangular nonoverlapping openings. Optional grid detail is generated from the same hosted opening, not positioned independently.
- Roof fields supplied as 3D planar faces. Pitch, ridge, eaves and hips remain **architectural input facts**, not guessed by the view compiler.
- No 3D solids, automatic sectional capping, arbitrary curves, non-planar roof meshes, glass transparency, hatch generation, intricate construction junctions or certified visibility outside the supported planar domain.
- Visibility is geometric, not proof of real-world lighting, structural support, waterproofing or finish legibility.

The generic algorithms contain no Georgian or Reference House measurements. Model-space geometry is independent of print scale. Physical line and text tokens remain governed by the existing v2 terminal.

## Proof / acceptance ladder

**ADE-SECTION-VIEW (this packet):**

- Non-courtyard asymmetric fixture: wall, two hosted windows, a sloping roof behind it, a nearer partial cut screen.
- Host disappearance/overlap and unknown geometry reject; changing host top or window extent changes the only rendered material and grid; behind-cut roof remains visible unless genuinely occluded.
- Both view directions and two axes; visible roof partially masked by the cut; section plane straddling does not fabricate a line.
- Semantic/stable ID, plane/provenance and deterministic model-to-paper output at exact 1:100 and 1:50. Preserve existing engine tests.

**ADE-SECTION-PARITY (next packet):**

- Bind the **accepted current** house facade, courtyard, roof and openings to a single projection source, not historic \`sections-roof-01\` dimensions.
- Migrate principal and service sections without altering historic frozen v1 plates. Prove location and roof termination of the far courtyard facade; determine physically visible rooftop profile by occlusion, not by hardcoded horizontal line.
- Cross-view mutation tests: alter one roof pitch/eaves datum, or one courtyard opening, and establish consistent changes across roof plan, elevation and section.
- Re-run retained 1:50 WALL and 1:100 BOOK physical-page/vector proof, inspect representative rendered outputs and disclose unresolved material/ground/foundation geometry. Only then promote the replacements to current publication/gallery outputs.

A new abstraction should be accepted only if it deletes duplicate scene-specific geometry and works on both the generic fixture and current house. No generic solids engine is earned merely because future technical modelling may use one.
