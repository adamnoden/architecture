# Coupled wet-pad quadrature — development checkpoint

**Use64-point rules for the next centred wet-pad development comparison.** Nine actual native states now retain the numerical evidence for that choice: centred wet-concrete25/27 controls at16/32/64, zero-G suction at32/64, and an unchanged8-point restoration. Both32→64 loaded comparisons pass the predeclared screens; the wet27 16→32 comparison fails and remains a failed result. This is a numerical development choice for the tested cases, not selection of the pad material, a physical contact law, a post-head detail or the complete house.

The existing finite wet-support builder admits16/32/64-point rules without changing slab mesh, geometry, normal compliance, unilateral law, physical loads, solver ordering or acceptance boundaries. The two centred loaded families retain the existing200mm floor,1.35G/Q2/floor-concrete27 controls and differ only in wet-beam/post concrete25 versus27. The zero-G suction family retains its own adverse160mm south-pad offset; it is not silently presented as a centred signed-envelope control.

The versioned comparison inputs freeze a0.1% plus1e-5kN force criterion and0.1mm centre-of-pressure criterion, alongside the existing0.1kN/kNm head comparison. Each re-equilibrated state must also meet its own exact clipped-affine integration comparison. If16→32 fails, execute64 and retain the same32→64 criteria. These are numerical development screens, not material tolerances or physical contact/concrete resistance.

The reusable method reconstructs the actual affine normal gap from named physical sample coordinates, checks the actual Gauss coordinates/weights and every traction against the unchanged compression-only law within the existing1e-7kN native tensile-residual bound (raw residuals are retained, never clamped), then independently integrates the clipped field. Pad-relative and actual post-axis first moments remain distinct, including the160mm eccentric comparison. Near-zero force produces a null centroid and bounded post-relative first moments; it supplies no physical open-contact verdict. Paired states must preserve actual source/request/geometry and all52 head identities.

Nine analytical/local-coupled controls pass. A real small nonlinear partial-pad fixture deliberately fails both16→32 and32→64 screens despite matching applied force/centre: the coarse exact-integration error remains visible. Uniform and zero-gap controls pass. This fixture is not a52-head house solve.

## Actual coupled results

The [versioned proof](studies/wet-bearing-refinement-proof.json) records nine genuinely executed native responses, all bound to the actual58-source method and exact requests. Each pair is re-equilibrated at its own quadrature order. The maximum head difference below covers all312 components of the same52 physical foundation heads; it cannot replace the local force/centroid or exact same-plane tests.

| Executed comparison | Maximum head change kN/kNm | North force change kN | Largest north centroid change mm | Numerical result |
|---|---:|---:|---:|---|
| Wet25,16→32 |0.000059741 |−0.000058227 |0.048931 |Pass |
| Wet25,32→64 |0.000091648 |−0.000094151 |0.007192 |Pass |
| Wet27,16→32 |0.000342791 |+0.000351540 |0.013913 |**Fail:**16-point exact-field force error |
| Wet27,32→64 |0.000039645 |+0.000040816 |0.004712 |Pass |
| Zero-G suction,32→64 |0 |0 |Not applicable; null centroids |Pass |

The wet27 16-point north force differs from that state's independently reconstructed clipped-affine field by−0.000665527kN, exceeding its0.000533226kN limit. A small global response and a small16→32 centroid difference do not erase that failure. The predeclared conditional64-point continuation applies the same criteria; no threshold was relaxed. At64, north same-plane force errors are−0.000001948kN for wet25 and−0.000000791kN for wet27, with maximum centroid-coordinate errors0.000302mm and0.000582mm respectively.

The restored8-point state reproduces every current aligned8 head component exactly:312 comparisons, maximum difference0. Its north same-plane force error remains−0.003673996kN against0.000437031kN, with centroid errors(+0.333218,+0.237491)mm. Restoration demonstrates unchanged physics at the old order; it does not promote the old local integration to a pass.

## Actual post-head actions

The producer independently sums every signed actual normal force about its actual post axis and adds the factored pad self-weight at the actual pad centre. It compares all six reconstructed head actions with the finite post's actual top wrench, then transports that wrench to the base and adds centred post-body gravity once. Across all18 post/case rows, maximum top reconstruction residual is5.365×10⁻¹²kN/kNm and maximum body-equilibrium residual7.106×10⁻¹⁵kN/kNm.

|64-point control | South head[N kN,Mx kNm,My kNm] | North head[N kN,Mx kNm,My kNm] |
|---|---|---|
| Wet25 |[52.702802,−0.119545,+0.053750] |[0.449022,+0.013947,+0.040140] |
| Wet27 |[52.920772,−0.120370,+0.053837] |[0.546267,+0.016524,+0.048681] |

HereN is positive in compression; stored full six-actions use positive globalZ upward. The omitted table components remain retained in the proof, including actual numerical residuals. Zero-G32/64 retain zero actual pad compression and numerical post-wrench residuals, with no centroid division or physical open-contact/material verdict. These actions inform the still-missing local splitting/bursting and anchorage model; equilibrium does not supply that resistance.

## Retained replay and integration boundary

`wet_bearing_refinement_proof.py --write --captures /ABSOLUTE/CAPTURE/DIRECTORY` verifies every complete request, full-response checksum, original capture manifest and existing physical capture guard before producing the proof. Its compressed JSON crop is lossless: it retains all actual contact IDs, coordinates, areas, gap observations and raw signed forces, both post-end six-wrenches, the exact request/source inventory and all52 head reactions. `--check` replays the same pure `assess_contact` and `compare_contacts` methods plus the independent post-head calculation without requiring the scratch captures or executing a new native solve.

The crop cannot reconstruct the complete native response, plate field, original capture-manifest bytes or omitted signed load programmes. Original full-response/request/manifest checksums identify the verified external capture provenance; missing complete captures require actual reruns to regenerate those full bytes. The proof binds the current numerical method, frozen criteria, producer and actual current floor-parent restoration record. Changed sources, requests, criteria, observed contact data, parent evidence or stored results reject rather than receiving replacement hashes.

Changing the seated helper changes one entry of the58-source floor tuple. All affected floor/cut/interface/cage/profile receipts and shared current-source consumers require their genuine regeneration and exact current-source reconciliation before integration; the nine-state local numerical proof does not refresh them by implication. Ancestors that do not consume that helper retain their valid identities. No source hash is rebound to an old physical response. Full signed loading, floor/corner convergence, material/contact qualification, post-head reinforcement/development, grid/foundation resistance and the coordinated raised house remain open.
