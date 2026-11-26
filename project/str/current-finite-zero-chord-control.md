# Exact zero additional chord: admission boundary before a new house comparison

The next bounded stiffness question is whether the actual200 mm floor and finite SW joint can work without the independently authored axial steel-chord allowance. This precedes funding a uniform250 mm floor/level alternative. It does not assert that zero additional chord is conservative for every displacement, contact or member action.

## Current source rejects zero

At source commit867e8042e131a35407c4fe3be21807cdb6d23778, distributed_floor_compatibility.py:82–85 admits an authored conventional140..300 mm band of200 mm depth, but rejects axialRigidityKN<=0. Consequently an exact0 saved case is unsupported. A tiny positive stand-in is not an admissible substitute.

The finite solid already permits chord_axial_rigidity_kn==0 and rejects only negative/nonfinite values. Its concrete stiffness is assembled independently. The full finite comparison separately adds concrete EA=8250×140×200/1000=231000 kN to the native slab-level band; the extra axial allowance is the existing180955.73684677208 kN. Zeroing the latter must preserve the former.

The minimal proposed admission change is axialRigidityKN<=0 to axialRigidityKN<0 in that owning guard. Keep every finite-number, width/depth, positive concrete-modulus, flexural-factor, source-identity and other admission check. Label0 explicitly as no additional axial steel-chord stiffness. Do not remove the physical slab/band or suppress its concrete axial, bending or shear energy.

This recovery branch documents the change; it does not alter the native58 or finite6 method files, does not bypass the guard and has not executed a zero-chord house.

## Analytical positivity and its practical limit

For a real band segment of lengthL mm, with endpoint axial movementsu1/u2 mm, the retained concrete matrix is

Kc=(231000/L)[[1,-1],[-1,1]] kN/mm.

Its eigenvalues are0 and462000/L. Its energy is(1/2)(231000/L)(u2-u1)^2 kNmm: common translation is free, every nonzero relative extension costs positive energy. The omitted steel term is independently nonnegative. Removing it changes stiffness; it creates no local axial release through the real RC.

The same conclusion follows for the actual connected finite solid: its8250 MPa isotropic law at Poisson0.2 has positive shear and bulk moduli. The concrete body's energy remains positive for non-rigid strain when the superposed steel chord is0. This establishes the local constitutive boundary; it does not establish full-house conditioning, convergence, stable support or a valid nonlinear contact active set.

On identical prescribed coordinates, Kold-Kzero is the nonnegative removed-chord contribution. That ordering does not order individual reactions, bending components, relative drift or unilateral bearing states after the complete house is re-solved. No response is transferred from the retained96-case proof.

## Required exact-source control

After the owning admission and identities are integrated:

1. Derive the actual request from the current saved document/compiler, changing only the additional axial allowance to exact0 and the explicitly labelled wind programme for the intended paired test.
2. Preserve the200 mm body,8250 MPa conventional RC law, physical G/Q, source wind origins, all52 heads,32 actual SW contacts, lower serial bodies and three rigid corner controls.
3. Rebuild the native membrane/plate and finite composition. Verify that the final exterior-band concrete EA is still231000 kN and the inserted solid has zero additional chord stiffness; neither may silently fall back to180955.73684677208 kN or a tiny positive substitute.
4. Execute a fresh paired full-house W0 control with the existing admitted-chord case. Do not reuse old head increments, Kq-f arrays or old contact states.
5. Independently replay physical loads, source origin wrenches, component and52-head balances, work and serial-body contact closure at the existing tolerances. Report actual drift, wall/contour demands, contact distribution and reaction changes.
6. If the bounded route is viable, develop an actually routed ordinary reinforcement family and its physical axial stiffness. Only then fund the necessary wider loading/stiffness/adequacy programme. Existing finite and architectural nonacceptance stays explicit.

The additional allowance is a stiffness input, not a proven fabricated2H24 cage. Conversely, zero allowance does not mean the slab has no reinforcement or authorise subtracting guessed bar gravity from the independently authored concrete/body G. Any later changed reinforcement quantities, elastic traces or physical load paths need their actual source model.

## Keep the fallback finite

If the200 mm route still demands an unbuildable joint, compare one coherent250 mm floor/level family and the separate direct-bearing/slip floor with a continuous lateral/roof wall topology described in current-l200-node-recovery.md. Neither can inherit old96 demands.

At held soffit3170,250 mm concrete rises to3420. With the unchanged nominal FIRST3450 it leaves30 mm instead of80 mm for the floor/service build-up. A preserved80 mm arrangement requires FIRST and the actual upper/service/stair/roof level chain to move coherently by50 mm; the existing unjoined HAD raise is a separate input. No headroom or finish fit is inferred.

The current finite producer still explicitly requires200 mm and fixed slab/midplane/cut datums. A future250 coupled case requires the owning producer to derive the real section datums and physical replacement consistently, with fresh analytical/adverse controls. Disabling the200 guard or sending250 into the old200 patch is not that integration.
