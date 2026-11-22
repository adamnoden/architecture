# Floor corner — numerical scope and physical joint remain separate

The current rigid southwest L-to-floor trace has not earned a converged local
point demand or a reinforcement selection. The source-bound700/500 comparison
remains a failed result. Its thresholds are not relaxed by admitting a finer
numerical trial.

## Current numerical result — 22 November 2026

The finer250mm mesh has now completed on the recovered sparse/MMD method. Its
actual500→250 comparison fails the unchanged0.1kN/kNm head and5% fixed-cut
screens: maximum head change2.773789kN, with up to32.72% signed twisting change.
The [current canonical cut producer](studies/floor-section-cuts.ts) requires
complete current700,500,250 and both operator-separated controls. Old killed
workers remain source-specific history; they cannot suppress a current result.

The separated controls identify vertical-plate discretisation as the controlling
fixed-cut uncertainty. In-plane-only refinement changes the head response by
0.140420kN and cut integrals by at most0.01046% with vertical500 held; vertical-only
refinement changes the head response by2.795102kN and reproduces the large cut
changes. Neither meets the complete declared screen. Those are mesh-pitch edits,
not slab-thickness selections.

The shared compiler now recovers MITC4 transverse shear from the exact native
assumed-shear field and integrates it on the same physical cuts. Bending plus
shear energy is checked against the actual native plate energy. This supplies
an additional joint-demand component, without differentiating or smoothing the
moment field. It does not supply membrane traction or a closed six-wrench L
free body. A complete finite joint demand and physical transfer model remain
necessary before local reinforcement or global thickness can be selected.

## Existing evidence, before extending the mesh scope

The complete native responses joined at structural checkpoint
`48a2d803c64a2a4a26160cc761ed82a239b7d860` use the same authored
1.35G/Q2/rho27, south-pad+160mm, eight-point wet-bearing comparison. Their
[fixed-cut receipt](studies/floor-section-cuts-proof.json) preserves exact
requests, source identities and full-response checksums.

| Maximum pitch | Governing cell XY, mm | Governing sample XY, mm | Raw absolute bending plus twisting, kNm/m |
|---|---|---|---:|
| 700mm | [1262.5,402.5]–[1812.5,417.5] | [1378.728676,405.669873] | 75.111711 |
| 500mm | [1262.5,402.5]–[1537.5,417.5] | [1320.614338,405.669873] | 107.241682 |

The samples approach the rigid-patch tip at[1262.5,402.5]. Their radius ratio is
1.997774 and the peak ratio1.427762, giving an apparent two-point power of
approximately0.5146. **Inference:** this is consistent with a singular local
response at the retained rigid boundary. Two samples do not establish an
asymptotic exponent, prove the exact continuum behaviour or represent a real
finite concrete joint. Increasing the whole slab to suppress this sample is not
an evidenced design response.

The same comparison changes a52-head component by up to1.686609kN/kNm and fixed
cut integrals by up to15.406607%. The predeclared0.1kN/kNm and5% screens fail.
Fixed-cut convergence is still necessary; apparent point divergence does not
license ignoring the integrated response.

## Historical numerical admission and execution limits

Both the vertical plate case and its sole nested in-plane floor case previously
restricted maximum pitch to500..1800mm. Those were authored numerical comparison
bounds. The MITC4 and CST kernels have no500mm material threshold; the existing
small-domain strip and finite-receiver tests already use250mm cells.

Their admission range is now250..1800mm, without changing laws, support topology,
load factors, voids, stability criteria or acceptance flags. New analytical
controls test250mm material/gravity/first moments, rigid motions, constant-curvature
plate energy and finite-receiver pressure work against the unchanged500mm
controls. Admission tests distinguish reaching the builder from executing a
house solve. This is numerical capability, not a new positive house result.

The intended finer control was250mm in **both** vertical and in-plane pitches,
with the same physical case and common-coordinate wet-beam closure.350mm alone
would not refine the particular550mm interval beside this tip: both500 and350
split it into two cells, whereas250 splits it into three. Maximum-pitch meshes
are not generally nested, so no Richardson extrapolation or convergence order
is inferred from their names.

The250mm whole-house trial was then killed without a complete native response,
first during concurrent execution and again as the sole native worker with
BLAS/OpenMP thread counts fixed to one. The shell reports exit137; its underlying
cause is not established. The [exact request/source execution record](studies/floor-refinement-execution-limit.json)
retains this as unavailable evidence, never a failed or passing numerical screen.
No incomplete field or convergence value is promoted.

The second declared trial was274mm: the largest whole-millimetre pitch below
550/2=275mm. It introduces the same third subdivision of the controlling550mm
interval while refining the rest of the house less than250mm. This isolated
worker was also killed with exit137 before producing a complete response.
Both declared failures remain visible as historical source-specific unavailable
evidence; neither contributes invented fields or a numerical pass. The0.1kN/kNm and5%
screens are unchanged. An actual274mm response could not be relabelled250mm.

The subsequent sparse continuation compared the existing in-plane condensation
against the retained Python oracle and completed the current250mm response. The old
minimum-fill graph and scalar Schur elimination are a plausible scaling
obstacle, not an established cause of either kill. A successful smaller-memory
condensation alone would not be a whole-house solve or a convergence result.

The [MMD result](global-mmd-ordering-result.md),
[ancestor regeneration record](ancestor-regeneration-20261122.md) and current
canonical cut receipt distinguish actual complete fields, verified retained
captures, new producer executions and historical execution failures. The
700/500 failure remains; the finer current comparison is also a failure, not an
execution limit. No historical receipt is rebound to changed native inputs.

## What a numerical pass would still leave open

Stable section integrals can inform a joint/design-strip model; they cannot
select the joint, a reinforcement distribution, bond/development, a physical
bearing law or a complete load envelope. The rigid plane-section footprint
remains an explicit idealisation. If local stresses are needed, replace that
particular idealisation with a finite, dimensioned transfer model or a genuinely
different seated/released connection, then re-solve the complete load path. Do
not release its rotations while silently retaining its former moment restraint
or stability duties.

Keep the completed net live-load route and nodal wet-beam correction. Do not
restart the rejected loaded portal-DPC/crossing-cage repairs or the old released
corner-arch arrangement; the [current structural reconciliation](floor-portal-reconciliation.md)
and [existing architectural rewind](whole-house-corner-rewind.md) own those
findings. The [floor-section result](floor-section-result.md) owns the unselected
slab comparison and its architectural consequences. No slab, joint or house is
adopted here.
