# RSI-02 — modest detached Reference Site envelope selection

Issue: #896  
Programme: #891  
Upstream: RSI-00 / #894; RSI-01 / #895

## Decision question

What synthetic parcel gives Ovid's House an **ordinary detached-house constraint** without choosing a site that either comfortably fits the present 12 m shell by construction or makes maintenance impossible by construction?

RSI-01 establishes the governing distinction: frontage pressure matters more than minimum site area. This packet therefore isolates frontage as the main variable.

## Comparison constants

Hold these facts fixed across all three candidates:

```text
parcel depth:          40.0 m
street/front boundary: geographic north
house orientation:     front to street / rigid 180° model rotation
house shell for test:  12.0 × 10.8 m
front setback:          5.0 m
rear-garden depth:     24.2 m
service-side bias:      west / technical flank receives 0.5 m more width than east flank
broad ground fall:      240 mm from street to rear boundary
house ground FFL:      +0.100 m relative to street datum
```

The 24.2 m rear depth is not a copied real garden. It is the deterministic consequence of a 40 m site, 5 m front setback and 10.8 m house depth, and it sits squarely inside the bounded morphology evidence gathered by RSI-01.

Trees, flood, heritage, pathological access and detailed drainage are deliberately not varied in this comparison.

## Candidate family

### A — TIGHT FRONTAGE

```text
parcel:                 13.0 × 40.0 m
area:                   520 m²
house/plot width ratio: 92.3%
total gross side land:   1.0 m
technical west side:     0.75 m
principal east side:     0.25 m
```

**Reading:** extremely valuable as a stress case, but not a good canonical site for RSI-03. It makes a meaningful opposite flank almost impossible before architecture is tested. Failure would tell us too little: the site has largely predetermined it.

Notably, its area is almost identical to DPL-RS-01's 522 m². The difference is morphology, not land quantity.

### B — ORDINARY-TIGHT

```text
parcel:                 14.0 × 40.0 m
area:                   560 m²
house/plot width ratio: 85.7%
total gross side land:   2.0 m
technical west side:     1.25 m
principal east side:     0.75 m
```

**Reading:** credible as a severe detached condition, but still likely to make the service/maintenance doctrine fail for reasons dominated by the existing 12 m width. The 750 mm principal flank is a passage-scale residue rather than a robust side field.

Retain as the immediate narrower counterfactual.

### C — MODEST DETACHED

```text
parcel:                 15.0 × 40.0 m
area:                   600 m²
house/plot width ratio: 80.0%
total gross side land:   3.0 m
technical west side:     1.75 m
principal east side:     1.25 m
```

**Reading:** still materially constrained compared with DPL-RS-01, but not obviously impossible. Both flanks remain real spatial territories, while neither is generous. The technical flank can be challenged as an access/maintenance route rather than simply declared absent. The principal flank is narrow enough that windows, privacy and neighbour distance matter.

This is the strongest canonical collision-test site.

## Comparison with DPL-RS-01

```text
                    RSI C        DPL-RS-01
frontage            15.0 m       17.4 m
depth               40.0 m       30.0 m
area                600 m²       522 m²
house width         12.0 m       12.0 m
total side land      3.0 m        5.4 m
technical side       1.75 m       3.0 m
principal side       1.25 m       2.4 m
front setback        5.0 m        5.2 m
rear garden         24.2 m       14.0 m
```

The new site actually has **more total area**. That is intentional and useful. It prevents RSI from confusing "ordinary detached morphology" with "small land area".

The house gets a normal deep garden but loses 2.4 m of lateral territory. The architectural challenge moves to the place we care about:

- can a 12 m-wide house justify itself on ordinary frontage?
- can both side elevations remain maintainable?
- can the service side still do meaningful work?
- are side windows useful once neighbours are close?
- does the building still read as detached rather than almost site-filling?

## Selection

Select **Candidate C — 15.0 × 40.0 m** as the canonical RSI collision-test Reference Site.

Identity:

```text
RSI-RS-01
kind: SYNTHETIC_MODEST_DETACHED_REFERENCE_SITE
status: SELECTED_FOR_RSI_COLLISION_TEST
```

The selection is not a claim that 15 × 40 m is the average London detached plot. It is the narrowest candidate in this bounded family that still gives the present house two meaningful side territories rather than making one flank a token gap.

Candidate B remains the immediate narrower counterfactual. Candidate A remains a same-area morphology stress test demonstrating why site area alone is misleading.

## Exact local geometry

Use a local metric frame:

```text
origin:          south-west parcel corner
X positive:      east
Y positive:      north
street boundary: Y = 40,000
rear boundary:   Y = 0
```

Parcel:

```text
SW (0, 0)
SE (15,000, 0)
NE (15,000, 40,000)
NW (0, 40,000)
```

Reference House test placement:

```text
west face:       X = 1,750
east face:       X = 13,750
rear/south face: Y = 24,200
front/north face:Y = 35,000
rotation:        180°
```

Derived:

```text
west / technical-side field: 1,750 mm
east / principal-side field: 1,250 mm
front setback:                5,000 mm
rear garden:                 24,200 mm
```

The current unmirrored house is used. As in DPL-RS-01, rigid rotation means model east / technical side maps to geographic west.

## Broad levels

Retain a modest synthetic fall rather than a perfectly frictionless plane:

```text
north / street boundary: Z = +0.000 m
south / rear boundary:   Z = -0.240 m
broad fall:              240 mm over 40 m ≈ 1:167
transverse fall:         none authored
RH ground FFL:           Z = +0.100 m
```

This is existing broad-ground context only. RSI-03 may evaluate arrival/threshold consequences; it may not treat this as finished grading.

## Neighbour context

For the collision test, retain deliberately simplified two-storey side-neighbour pressure rather than inventing window-by-window adjacent houses.

Use approximate context faces 1.8 m outside each side boundary, broadly aligned with the Reference House front/rear zone. Exact roof forms, windows, rights, ground levels and rooms remain unknown.

This yields approximate nearest building-to-building side distances of:

```text
west / technical side: 1.75 + 1.80 = 3.55 m
east / principal side: 1.25 + 1.80 = 3.05 m
```

That is close enough for side openings/privacy/maintenance to become real questions without manufacturing an overlooking verdict.

## Street / access boundary

Assume only:

- an established residential street immediately north;
- physical pedestrian access from the frontage;
- physical service/access opportunity aligned with the west technical-side field;
- no authored crossover consent, vehicle design, gate, refuse position or detailed hardscape.

Those are RSI-03/site-response questions.

## Explicit unknowns

The selected synthetic site does **not** author:

- title/legal boundary evidence;
- planning acceptability;
- neighbour windows/rights;
- exact sewer or utility routes/capacity;
- ground-bearing parameters;
- groundwater/contamination;
- detailed surface-water solution;
- detailed vehicle/refuse/fire access;
- trees or protected landscape;
- final grading/retaining/threshold design.

## Handoff to RSI-03

RSI-03 must now place the **B4 provisional current-house coordination unchanged** on `RSI-RS-01` and ask whether the house survives.

No shell narrowing, room resizing, courtyard rescue or site widening is allowed during the collision test.

Candidate B (14 × 40 m) should remain beside it as the first narrower counterfactual, but architectural redesign is not permitted until RSI-03 has classified the selected-site failures.
