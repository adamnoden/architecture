# Current short bridge and signed foundation actions

The explicit current compiler can replay the selected HAD short bridge into the existing STR section calculation and run the existing fixed-base foundation proof. Each route starts from the supplied current design, checks the applicable HAD/STR source identities and returns a comparison with its method and inputs. Previously retained native receipts remain byte identical.

```sh
node --import tsx scripts/compile-current-design.ts --read-georgian-source |
  node --import tsx scripts/compile-current-design.ts --structural-bridge -
node --import tsx scripts/compile-current-design.ts --read-georgian-source |
  node --import tsx scripts/compile-current-design.ts --structural-actions -
```

## Support comparison

The bridge calculation takes its authored axes Y6100 and Y7700 from HAD and checks the retained comparison at 1600 mm on axes. The typed compiler API also permits an explicitly labelled local comparison that moves only the north axis within the retained court corridor. Moving it to Y7730 changes the span to 1630 mm, the clear span to 1030 mm and both members' flexure, torsion and deflection. The trial retains the original load origins and section family. This calculation does not model a relocated node, aperture or changed main load distribution. A closed clear span, an unbound alternative design and an axis outside the corridor each withhold the result.

At the 200 mm trial sections, court and spine envelope bending rise from 33.50 and 29.99 kNm to 34.53 and 31.07 kNm. This compares two local section demands. Retained concrete and steel grades are the source study's assumptions. The existing 200 mm failures remain, and the 250 mm screening result gives no new scope of engineering acceptance.

## Existing signed actions

The foundation route verifies all seven recorded direct input receipts against source bindings, then runs the existing Python generator in check mode. It returns the recomputed receipt with 52 unique heads and 96 distinct wind patterns, each repeated under three documented gravity and suction combinations. The accepted geometric basis may cite the paper loads. An edited snapshot cannot inherit them. The foundation output retains its open soil, section, roof/floor stiffness and connection conditions.

## Explicit signed load and bridge section

```sh
node --import tsx scripts/compile-current-design.ts --read-georgian-source |
  node --import tsx scripts/compile-current-design.ts --read-structural-case - > structural-case.json
node --import tsx scripts/compile-current-design.ts --structural-case structural-case.json
```

The request carries the accepted plan and structural binding digests, a wind pattern index, one named signed combination and the short bridge section comparison. The native fixed-base method accepts the existing gravity and imposed load factors within 0–1.35 and 0–1.5, or the existing stripped/retained suction combination with suction factor within 0–1. The retained shell remains exactly the source minimum. The 96 wind patterns retain their original forces and locations. The chosen combination returns all 52 signed head actions, passive pad releases and equilibrated forces and moments. It recalculates unilateral contact and head routing before returning actions.

At wind pattern 8, changing the stripped suction factor from 1 to 0.75 changes the total vertical action from −324.3375 to −243.2531 kN. P01 changes from −295.0568 to −282.2838 kN; the horizontal force and yaw remain unchanged. Independently summing the returned head forces and their moments reproduces all six totals within 0.005 in their respective units. The source comparison at factor 1 reproduces the retained case.

The bridge request identifies the actual short bridge occurrence, the support axes, one trial section depth and the native C30/S500 material comparison. It returns both cover cases for that explicit section and the local clear span between the retained 600 mm-wide support reservations. Changing the north axis from Y7700 to Y7730 increases the clear span to 1030 mm. Both members still fail at 200 mm under both cover cases. The local bridge comparison and the fixed-base reactions remain independent. The modified bridge axis is outside the foundation method's geometry and does not alter its reactions. An unsupported combination, out-of-range factor, different material grade, stale binding or an edited unbound snapshot withholds that result. The original Python receipts reproduce unchanged.

## Conditional floor, roof and opening interfaces

```sh
node --import tsx scripts/compile-current-design.ts --read-georgian-source |
  node --import tsx scripts/compile-current-design.ts --read-structural-interfaces - > structural-interfaces.json
node --import tsx scripts/compile-current-design.ts --structural-interfaces structural-interfaces.json
```

The replay requests one or more named current interfaces. It checks the plan, structural binding, native method, receipt and declared inputs before running the native producer. The collar and roof shoe outputs compare byte for byte against their receipts. The arch comparison uses the owner method's existing `--check` path. Each result identifies the producer, receipt and source inputs. An unsupported request, stale provenance or edited plan withholds the comparison.

| Interface | Recomputed geometry or control | Scope |
| --- | --- | --- |
| North floor collar | Z3170 soffit, Z3370 slab and Z3415 collar, 200 mm contact, 107.5 mm minimum raw window clearance | Collar geometry, bar cover and documented force comparisons. The pressure field, confinement and steel development remain open. |
| North roof shoe | 60 × 34 mm slot, Ø28 pin, X4340/7660 shifted rods | Independent compression, uplift and normal routes remain separate. Coupled actions, stiffness and installation remain open. |
| Outward arch controls | 160 mm and 180 mm widths retain the 50 mm cavity; both have at least one adverse section ratio above unity | Eight modeled opening occurrences under four response controls per width. No width or physical assembly is accepted. |

The same request also runs the active roof action route and stiffness, principal membrane and permanent floor stops, wall transfers, north cap layer and floor cage methods. These calls verify their named underlying receipt sources and return the recomputed comparison or fail closed. The caller can request any supported subset. The current CLI withholds every one of these references on a differently shaped candidate.

## Acceptance boundary

The current structural compile contract integrates the signed foundation actions, explicit service and wind load sensitivity, local support or section inputs and current joint and opening comparisons. Actual reactions change under the supported signed load case and satisfy the same equilibrium as the existing solver. The bridge records actual axes and reference materials for its bounded geometry and cover cases. The floor, wall, roof and arch replays bind their active comparison sources and retain separate installed authority.

The portal development baseline still needs a confined continuous transfer into both northern piers, its solved joined force and stiffness actions, and the new signed and service replay. That physical design is owned by STR-FLOOR-PORTAL and its downstream gates. These compiler comparisons preserve those limits.

## Source-derived DPC and global contact in the saved house

The default saved engineering document now binds the actual metal-plate cut and executes the native load-origin ledger through its north-collector stage. Its crossing policy conserves originating vertical force and both first moments while separating bypassing ground floors, weather leaves and unresolved mixed reserves. An optional global contact trial reconstructs the signed wind resultant at that cut and computes the additional retained load required for a necessary nonnegative contact envelope. It uses actual pier footprints and grants no unproved floor weight or local splice acceptance.

Changing the cut, pressure-envelope height, additional retained load or its centroid changes the production result and dependent evidence. Save/load, threshold failure/success, unsupported inputs and unchanged nominal plans are covered by the current-design DPC and saved-document tests. A separate nonnegative-reaction LP oracle checks the same source cases without reusing the hull method. The [owning structural reconciliation](../str/floor-portal-reconciliation.md) records the quantitative result, rejected active alternatives and exact remaining joined-model obligations. Those obligations retain STR-FLOOR-PORTAL and the downstream roof gate; source integration does not close them.
