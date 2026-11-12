# Floor/portal runtime recovery — 11 November 2026

STR-FLOOR-PORTAL remains incomplete and PR1482 remains draft. The last published calculation head is **c9e10a696b01b4ecabfb3e78b8d5afc39678ebce**; exact-head CI **43046937078 passed**. The execution environment became unavailable at16:24; a fresh read-only git-status attempt returned “No usable execution environment is available.” No newer local result is being described as CI-validated or adopted.

### Completed locally after the published head

- The explicit square corner comparison — outer250 wide to1430,120×120 re-entrant square haunch — completed all four named controls and physical equilibrium. In the gravity ULS control, maximum collector torque rose **4.776→9.663kNm**. Positive-X wind/suction strong moment rose **101.6→111.6kNm**. Added stiffness does not establish an acceptable cage.
- Releasing all52 head rotations while retaining their translations reduced the P10−1mm kinematic head-tension response from1478.37 to **742.98kN**. Other51 head translations remained fixed. This is a stiffness sensitivity, not a predicted settlement or shaft resistance.
- Actual unilateral contact recovery was completed. Under gravity ULS all22 old core bearings were active and no M24 tension link was active; the largest core compression was53.982kN. Under the positive-X, no-favourable-G suction control, all22 M24 links were active, the largest tension was17.434kN, and all22 old core bearings were open. Cap bearing quadrature opens and closes independently.
- Native roof interior field recovery includes point-load fixed-end actions and local beam flexibility. An independent split-element solve gave displacement error9.99e−16mm/rad; native outer-rafter force comparison5.27e−16 relative; native ring-plan moment difference1.19e−7Nmm. All four cases passed endpoint-displacement closure (maximum6.22e−15). Maximum global translation component in the retained ring/outer-rafter fields was3.858mm for gravity ULS and7.506mm for positive-X suction.
- The25mm upper-spandrel clearance comparison, at13 source arch stations per opening and both normal faces, reached a minimum **24.8336mm** in those four cases. Roof local flexibility is included. The upper infill is still carried as an arch-section rigid-offset comparison; tolerances, its own field and complete signed/thermal domain are not admitted.
- The square-corner steel lever was corrected to follow its actual45mm two-arc transition over1230–1430 (R233.472mm), despite the concrete retaining250 width to1430. Endpoint/reflection controls passed.

### New adverse physical finding

The historical90×10×60 L-cap cruciform cannot be treated as adequate. The published G+720με thermal comparison puts28.478kN in one direction of a single key. Even uniform depth bearing gives M=F×30mm and approximately **570MPa elastic plate stress** (W=90×10²/6). No selected steel grade or welded-key strength was proved. The equivalent complete jamb-key group reaches18.116kN in the cold comparison, so checking only its individual Gauss shares would understate demand.

An unselected replacement was parameterised but **NOT SOLVED** before loss of execution: six L keys at local(200,70),(475,70),(725,70) and the swapped leg coordinates,70×12×30; jamb key90×12×30. A triangular bearing-pressure comparison uses its real2h/3 resultant and work-conjugate stiffness105EI/(11h³), with concrete effective-area factor3/4. Those stations avoid known H20 end groups and H12 distribution stations350/600; finite hoops, actual couplers, welded stock/cover and force capacity remain unproved.

### Recoverable boundaries

The next repository handoff file will preserve the exact executed findings and logged source-patch reconstruction. Local-only files were last under /workspace/scratch/e1275bf739e2/floor-portal-resume and /workspace/scratch/e1275bf739e2/structural-review. The unavailable executor prevents a fresh byte-level inventory. In particular, do not infer that the latest key edits or all local changes are preserved merely from these paths.

Still required: joint-zone and mesh sensitivity; full square-corner signed demand; shear/torsion longitudinal charge and directional link schedule; complete cap/coupler/stub/weld and DPC lower anchor; hardware mass/RC replacement; independent pressure/mass and guard-release domains; coordinated room/port adoption; actual support compliance and qualified physical interfaces. No plot, procurement, fabrication or professional appointment was made.

Generation2 lease is currently verified through16:53:16.843UTC. It will be released with an explicit handoff after the durable record is read back if execution cannot resume.

## Source recovery assets

- [Native roof field module reconstruction](studies/floor-portal-roof-fields.recovery.txt) preserves the full module assembled from the logged patch calls. It is deliberately a text recovery asset, not a live imported study. The old executor could not be read again to prove its final byte identity.
- [Integration and short-key patch log](studies/floor-portal-integration.recovery.patch) preserves the field/contact, eigenstrain, section-transition and later key edits. The field/contact controls executed before the final key changes. The last key patch was syntax-parsed only; it has no numerical receipt.
- The earlier local square-corner geometry/union delta is NOT completely byte-preserved by these files. Recover from the old worktree if possible; otherwise reconstruct it and rerun it. Do not attribute a newly reconstructed file to the previous successful solve.

The preceding geometry delta added parameter defaults corner_width=160, corner_end=1430, corner_haunch=0, joint_rigid_scale=1. The square comparison used corner_width=250 and corner_haunch=120. Outer rectangles were207.5..457.5 from the ring corner axis332.5 to face-local1430 and from10570 to11667.5. The ordinary strip remained252.5..412.5. Each inner re-entrant corner had a120×120 square block; the southwest example was[457.5,457.5,577.5,577.5],Z3170..3920.

Every collector retained a rectangles list containing its ordinary strip and two corner patches. Every L had a haunches list. The floor-port assignment, plate exclusions, physical load assignment, disjoint RC union and source-body replacement recognised those same rectangles/haunches. Collector beam width was250 only inside the stated corner zones, with actual counted steel EA retained. The square concrete shoulder did not taper. The steel S-transition remained1230..1430.

joint_rigid_scale multiplied375mm floor-joint and107.5mm arch cutbacks. For scale<1 the jamb level list additionally contained3170 and3920; L cutbacks changed consistently. No scale0 or0.5 solve completed. The constant-joint default reproduced the four old head controls before the later key parameter edit.

## Last observed local files

These paths are recovery hints, not proof that the unavailable filesystem survives:

- /workspace/scratch/e1275bf739e2/floor-portal-resume — owned worktree; last published HEADc9e10a69.
- /workspace/scratch/e1275bf739e2/structural-review/floor-portal-square-corner.json — completed four-case comparison,374935bytes.
- /workspace/scratch/e1275bf739e2/structural-review/floor-portal-free-head-rotation.json — G and P10±1mm comparison,283245bytes.
- /workspace/scratch/e1275bf739e2/structural-review/floor-portal-contact-recovery.json — completed four-case actual-contact receipt.
- /workspace/scratch/e1275bf739e2/structural-review/floor-portal-roof-field.json — completed four-case field receipt,2604647bytes. Its listed source hashes matched the then-current files at16:19 before the later short-key parameter edit.
- /workspace/scratch/e1275bf739e2/structural-review/floor-portal-domain.npz and .npz.json — full579-case matrices; their durable summary is already on c9e10a69.
- /workspace/scratch/e1275bf739e2/structural-review/floor-portal-movements.json — full110 response objects; the six strain and104 head-card receipt is already on c9e10a69.
- /workspace/scratch/e1275bf739e2/structural-review/root-cage-review.py/.json; room-replay-handoff.md; room-replay-review.mjs/.json — parent/reviewer scratch evidence, separate from the owning code.

Known modified/new source names before loss were floor_portal_house.py, floor_portal_loads.py, floor_portal_coupled.py, floor_portal_sections.py, floor_portal_section_review.py, floor_portal_movements.py, floor_portal_roof.py, floor_portal_frame.py and new floor_portal_roof_fields.py. This is a log-based list, not a post-outage git-status result. Python cache residue was also known. No local residue was deleted.

## Additional exact observed controls

| Case | Ring/outer-rafter maximum global translation component, mm | Minimum13-station spandrel comparison gap, mm |
|---|---:|---:|
| Characteristic G with declared adverse budgets |2.03093332394|25.00033702624|
| Characteristic Q including blocked water |0.73823775127|24.97208109129|
|1.35G+1.5Q |3.85803272628|24.96279426989|
| Positive-X wind plus suction, no favourable G |7.50630271052|24.83363610665|

At the last row's gap witness, face0/opening2100/station2285.34553559/normal402.5, steel Uz was−0.23710427544mm and the arch-section top offset Uz−0.07074038209mm. These small local gaps do not certify the unresolved upper infill field, its closure or tolerances.

Free-head-rotation G alone gave P10 compression120.568611kN and maximum recorded house translation1.850524mm. P10−1mm gave P10 tension742.978042kN; P10+1mm gave P10 compression994.494193kN and a different head's maximum tension405.752818kN. All other head translations were fixed. The largest balance residual in those three local runs was0.00855Nmm.

The published579case reference, before the new corner/key comparison, has maximum individual H12 cap-anchor force6.00404kN, H20 L-cap-anchor7.90766kN, jamb DPC bar28.08354kN and L DPC bar45.89238kN. These are component extrema with separate case witnesses. They are not simultaneous or a hardware strength certificate. The six strain controls can exceed those force peaks.

The triangular key depth formula is a mechanics derivation, not a measured joint law: q(x)=2Fx/h² gives centroid2h/3, M(x)=Fh(2/3−t+t³/3), and integral0..1 of the square bracket² equals11/105. The steel force-conjugate compliance is11h³/(105EI). The current key candidate requires actual bearing/contact, confinement, plate/weld and material checks; a sampled root moment cannot be excused by this stiffness calculation.

## Coordinated room handoff

The parent's exact remote handoff is [issue1103 comment6801288097](https://github.com/adamnoden/architecture/issues/1103#issuecomment-6801288097). It preserves the centred160/local250/square-haunch geometry, bed2/3/4 emitters, asymmetric family column, explicit actual soil axis and remaining continuous removal holds. Do not recenter the family pipe from a cabinet bounding box. The earlier rear-room candidate retained one Ø160 floor port relocated from(567.5,11177.5) to(685,10935), with its high dogleg below the slab; no second hole was authorised or added. All room changes remain candidates.

## Resume sequence

1. Read current main, prior PRs and the actual claim. Acquire a new canonical lease if this one has been released; preserve all predecessor branches.
2. Recover any surviving local files before reconstruction. Compare their bytes with these notes, published c9 and current main. Never assume the unavailable worktree was empty or safe to discard.
3. Reproduce the source four-case controls and full native interior fields. Check the actual applied ring load vectors against the source Load.place vector; retain each member's local fixed-end loads. Keep eigenstrain mechanical-force subtraction separate from kinematic displacement recovery.
4. Run the square-corner governing signed cases and actual steel-transition section checks, then joint-zone/mesh/head-compliance comparisons. Preserve the9.663kNm gravity torsion adverse result.
5. Solve the short-key alternative with its actual roots and pressure-centroid offsets before sizing it. Keep the failed90×10×60 comparator. Add missing actual hardware mass/RC displacement and finite bars/couplers/hoops before adoption.
6. Complete the remaining internal domains named above; reconcile room-source changes and regenerate owning artifacts. Exact-head CI, fresh publication preflight and parent coordination remain required for any merge.

This recovery commit changes evidence only. It does not install the text module, apply its patch, supersede the last numerically verified calculation, mark STR complete, or release a construction decision.
