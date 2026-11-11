# STR-FLOOR-PORTAL — radial guide hardware force path

Status: **bounded hardware screen; not a fabrication detail or construction acceptance**.

The generation-3 structural work has converged on a different support function from
the historical cruciform key. Vertical compression/uplift and horizontal plan shear
remain separate duties. The roof-to-RC plan connection is a **radial guided
receiver**: it resists plan-tangential movement and deliberately permits radial roof
breathing.

The live hardware screen is `floor_portal_guide_hardware.py`. It consumes the
same full579-case domain receipt used by the member/section checks; hardware demand
is therefore not copied into a second stale table.

## Leading geometry

- L stations: six clear positions per L, local (200,70), (475,70), (725,70)
  and their swapped-leg coordinates.
- L tongue comparator: 70 wide x 20 thick x 60 engaged depth.
- Jamb tongue comparator: 50 wide x 20 thick x 60 engaged depth.
- Released-direction receiver travel: **+/-10 mm reserved**, with2 mm running
  allowance at every pocket edge.
- No slot-end contact, guide friction or favourable vertical load is credited.

The 90 mm jamb tongue is physically rejected. With the same +/-10 mm swept pocket,
two independent5 mm steel-setting budgets and the retained four H12 bars, it has
-12.37 mm clearance. The 50 mm tongue has +7.63 mm. The L pockets retain
+41.60 mm to the primary H20 cage and +68.23 mm to the conservatively treated
intermediate-H12 stations after the same setting budgets.

## Live demand and first material screens

The exact50 mm-jamb full579 run on PR #1485 reaches:
- L guide: 28.473 kN, 0.114 mm active slip and244.050 MPa elastic plate-root
  screen;
- jamb guide: 4.309 kN and51.714 MPa elastic plate-root screen;
- maximum released jamb travel6.263 mm.

The six strain comparisons plus104 signed +/-1 mm head motions reach only5.793 mm
released travel and121.443 MPa at the worst L guide.

The hardware screen uses **S355 only as a parent-metal strength comparator**, not
as a material procurement decision. It combines the existing elastic plate-root
screen with direct blade shear in a von-Mises comparator. It also reports gross
side-bearing pressure against the project's existing C30 `.85 fck / 1.5`
comparator. Neither check accepts receiver splitting, edge breakout or local
confinement.

The intended force path is:

1. shop-fabricated roof-side radial tongue;
2. accessible RC-side guided receiver with mechanically retained, replaceable
   sliding/guide surfaces;
3. broad-face tangential bearing into the receiver;
4. positive cast-in/mechanically anchored transfer from receiver to the RC cap;
5. existing explicit cap compression contact and vertical anchors carry vertical
   compression/uplift independently.

A parent-metal-developing shop root connection is required. The model does **not**
credit a partial fillet weld as if it were the plate. The receiver must not rely on
adhesive anchorage, friction against the concrete cap or accidental slot-end impact.

## Why this topology is conventional

This is the same kinematic separation used in structural guided bearings. Mageba's
RESTON FORCE guide bearings explicitly separate horizontal-force transfer from
vertical-force support and transmit force in one specified direction; its current
guided/sliding bearing literature likewise uses guide bars to permit one horizontal
movement axis while restraining the perpendicular axis. Freyssinet's mechanical
guided bearings use the same functional split.

References are topology precedents only, not product selections:

- https://www.mageba-group.com/ch/data/docs/en_SG/54174/BROCHURE-RESTON-FORCE-BEARING-ch-en.pdf?v=1.0
- https://www.mageba-group.com/ch/data/docs/en_AE/53897/BROCHURE-RESTON-SPHERICAL-bearings-ch-en.pdf?v=1.1
- https://www.freyssinet.com/wp-content/uploads/2021/04/Brochure-Freyssinet-mechanical-bearings.pdf

## Still open

The next finite hardware layer is receiver cheek/plate bending, positive anchorage,
concrete splitting/confinement, root weld preparation/inspection, sliding material
and corrosion pair, dust/debris protection and replacement access. The live screen
also reports a3% sliding-friction force comparator; that force still has to be
replayed through the connected assembly before friction is accepted.

Only after that should the same selected hardware be admitted to the final roof-cap
cage and occupied-room/service replay. Hardware mass and displaced concrete must
then enter the physical ledger.
