# COA-04 — Reference House plan and section successor set

**Gate:** COA-04  
**Status:** PASS subject to repository CI and generated-output verification  
**Starting main:** `07d0f310341e647cac59fdeff6219a2285089549`  
**Issue:** #95  
**Authority effect:** none

## Question

Can the Reference House be inspected through genuinely coordinated architectural plans and a principal section without allowing the renderer to invent missing construction geometry?

**Answer: yes.** COA-04 introduces a new generated spatial-inspection set derived from the canonical single-pass Reference House compile. The three RH-C1 historical SVGs remain untouched.

## Successor outputs

- `docs/reference-house/generated/ground-floor-plan.svg`
- `docs/reference-house/generated/first-floor-plan.svg`
- `docs/reference-house/generated/principal-section.svg`

All three carry:

- stable successor output identity;
- renderer version;
- canonical source compile fingerprint;
- compile status;
- deterministic regeneration from one `ReferenceHouseOutputContext`.

## Plan improvements

The successor plans now communicate, in one view:

- north-up orientation with a visible north arrow;
- human room names as the visual hierarchy, semantic IDs retained secondarily;
- `A–A` section registration;
- overall shell and courtyard dimensions;
- front bay axes;
- numeric openings at the precision actually owned (`approximate`, `range`, `unknown width with known centre`);
- qualitative opening obligations as whole-host dotted relationships rather than fake centre openings;
- required room connections as whole shared-edge obligations rather than invented doors;
- provisional vs controlled boundary state;
- wall and stair planning values as notes, explicitly not construction geometry;
- canonical compile fingerprint and proof-boundary note.

## Section improvements

The successor principal section is explicitly `A–A`, south-to-north and carries `S` / `N` end registration. It shows:

- GF FFL, ground clear ceiling, first FFL, upper clear ceiling and the full `outer cornice/eaves control +6250 mm` datum;
- the open courtyard;
- outward low-slope roof screening fields;
- derived +1100 / +2200 stair landing guides;
- overall depth and court depth;
- human architectural field labels;
- a reserved right annotation zone so datum labels cannot be clipped by the viewBox;
- an explicit reminder that no floor build-up, stair strings/treads/guards/headroom or exact well geometry is being asserted.

## Uncertainty discipline

The renderer distinguishes three different cases that the old plans could visually blur:

1. **numeric centre + numeric/ranged width** — draw the owned extent;
2. **numeric centre + unknown width** — mark the owned centre and state that width is unresolved;
3. **host relationship known + centre absent** — mark the whole host as qualitative and do not choose a point.

Required room connectivity follows the same discipline: the full mathematically shared candidate edge is marked, not a plausible door location.

## Deliberate absences

The drawings still do not contain:

- wall faces or wall build-ups;
- exact internal door positions or swings;
- finished stair well/string/tread/guard/headroom geometry;
- structural member sizes;
- service routing;
- fire, thermal, moisture, acoustic or regulatory proof.

Those omissions are now visible as omissions rather than being easy to mistake for renderer incompleteness.

## Preservation

The CH-frozen RH-C1 drawings remain byte-identical historical evidence. COA-04 creates new successor paths only.

**Publication consequence:** after COA-04 passes, PR-00D may use these three successor views as trustworthy source material for Reference House plan/section figures. Publication still owns crop, caption, hierarchy and final figure composition.

**Next gate:** COA-05 — topology successor views.
