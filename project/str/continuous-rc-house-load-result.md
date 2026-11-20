# Continuous RC portal and actual loaded floor

The current development comparison joins the actual perforated first-floor membrane, finite north upstands, four conventional RC portal feet and the source 52-head grid. It replaces the problematic loaded portal DPC with four **finite 20 mm RC continuity members**. This is a structural comparison with a coordinate-defined waterstop hold, not an installed or complete-house selection.

## Single authored model

`rc_portal_monolithic.py --read` returns the source-bound, unpopulated case. Standard input is `{ "case": ..., "name": ... }`. The numerical proof supplies the openly authored laws and the actual source floor programme. The sole floor input is `houseCase.joinedCase.floor`; the shared compiler derives this from its existing distributed-floor stage. A second floor definition is not supported.

The worked normal core is 290 mm, the north upstands are 200 mm, and the raw opening/span/spring/rise and radial arch section remain source-bound. The 775 mm finished portal retains 40 mm lining and has 202.5 mm cellular glass on each normal face. The 15.625% glass reduction is explicit and thermally unqualified. The source ground level remains 0; the raised 715 proposal cannot be combined without actual transforms.

## Load path and load introduction

The native source supplies 96 signed programme identities. Forty-eight physical floor/outer-portal pressure programmes are unique: the paired IDs differ only in roof duties excluded here. Each executed case solves all 52 heads with the actual finite grid and unilateral four-L comparison interfaces. No old fixed-base reaction increments, roof action, P0 foundation state or unjoined gravity is added.

At the north opening, the old gross lower-wall floor share is removed and actual open-portal pressure is applied to the physical posts, arch/infill receiving points and slab-edge/upstand. Exposure starts at the source garden walking level **−152.5 mm**, not 0 or the source recipe base −180. The 27.5 mm below-walk source band is explicitly removed; force and first moments are independently checked against circular-segment integrals. The full negative-pressure portal receives −12.8821747586 kN. The source floor pressure at Z3370 is transferred to the membrane at Z3270 with its complete 100 mm eccentric work couple.

Posts and upstands use consistent Timoshenko point and distributed loads, including their physical selfweight and admitted source GMAX/Q actions. Those external vertical cards are baseline-source tributary challenges; floor-aperture edits do not regenerate them. The shared current-house route rejects an edited floor combined with the external GMAX/Q option until an actual tributary remapping exists. Baseline sweep controls do not claim complete floor gravity or a full 48-programme GMAX/Q envelope. Recovered physical end actions are `K·u − f_equivalent`. Interior records include distributed-load boundaries, both sides of point force/couple stations, and all component-moment stationary points. Each member separately checks the six-component physical load equilibrium. These component extrema are not a proof of maximum nonlinear reinforcement interaction.

The reduced nodal-system energy balance is exact for that discretisation. Load-only internal energy constants of internally loaded floor/member condensation are not recovered, so this is not presented as total physical strain energy.

## Reviewable evidence

- `studies/rc_member_load_test.py`: independent uniform-load fixed-end vector, simply supported midspan bending/stationary cut, point force/couple jump and oblique offset-master wrench/virtual-work controls.
- `studies/monolithic_rc_state_proof.py --write`: one actual native31 state, physical member/cap/adjacent-grid cuts and computed floor/barrier drawings.
- `studies/monolithic_rc_sweep.py --write`: all 48 unique physical cases / 96 source identities, simultaneous governing component actions, actual 52-head wrenches, selected additional GMAX/Q controls and uncached replay. Its explicit completion count governs; a checkpoint is not a completed sweep.

## Executed envelope

The frozen `monolithic-rc-native96-proof.json` executes **48 unique physical wind programmes**, represents all **96 source identities** by checked exact pairing, adds the two explicitly selected GMAX/Q controls W7/W31, and repeats W31 with the unchanged uncached native solver. The replay member-action difference is exactly zero. The largest global wrench residual is 1.542×10⁻⁸ kN/kNm and the reduced energy relative residual is 1.671×10⁻¹¹. Independent verification reconstructs every stored component envelope and sums all 52 source-position head wrenches.

Maximum frame translation is **5.7381 mm, W35**. The signed vertical head reaction ranges from **−86.1884 kN at P12/W28** to **+95.2425 kN at P10/GMAXQ-W7**. The largest unqualified four-L tie demand is **165.2233 kN at SE/GMAXQ-W7**. These values are actual simultaneous subsystem comparisons; omitted whole-house stabilising gravity, soil resistance and installed tie capacity are not inferred. Component envelopes retain the complete simultaneous six-component cut and its case ID. Fresh uncached replays independently rebuild the translation governor W35 and the actual worked-cage governors G0.9/W31, GMAXQ/W7 and GMAXQ/W31. Every physical end/cap/grid cut, interior component extremum and all 52 head wrenches reproduce within 6.55×10⁻¹¹ kN/kNm; these remain necessary finite screens, with joint and water-control duties open.

## Remaining engineering

The four normal DPC contact laws are removed only at the proposed continuous RC portal feet. The waterstop replacement is not included as an accepted material or seal in the elastic model. These feet overlap the 140 mm heated-side core; calling them outdoor piers would be wrong. Actual barrier metal, thickness, continuous H12 penetrations, seals, leakage/gas/air duties and thermal returns require a compatible detail in the stated coordinates. The retained masonry DPCs and source hydraulic datums remain binding.

Arch/infill pressure transfer and joint-panel mechanics remain local qualifications. The four-L comparison still assumes unqualified shear/key and tension-tie laws. The inherited lower-cap/head transfer, soil/pile connection, worked reinforcement/cap-grid joint cage and its development are not accepted by a gross-elastic stress diagnostic. Twenty-eight canonical receiving paths are still incomplete; the roof, vertical slab loads and whole-house gravity are not silently imported. All physical, owner, thermal, water-control, roof and complete-house acceptance flags remain false.
