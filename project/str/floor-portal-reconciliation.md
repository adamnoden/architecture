# Floor and portal reconciliation

**Interim disposition, 12 November 2026.** The monolithic floor/jamb comparison still needs a roof guide that fits its concrete receiver. The full radial cassette fails the provisional concrete side-web screen in the 140 mm outer L-pier arms. Centring it in a hypothetical 180 mm arm clears this local screen and gives a specific candidate for replay. STR-FLOOR-PORTAL remains open, and both final house gates still depend on its resolution.

## Radial receiver at the outer L piers

The [source-bound predecessor](https://github.com/adamnoden/architecture/pull/1489/commits/7a1b697431e9c1556f426068068b96356d3158ca) locates six radial guides on each of four L piers. The complete cassette is 94 × 46 mm in plan. Its 70 × 20 mm tongue carries ±10 mm released travel, 2 mm running allowance at each edge, and 5 mm slide plate plus 6 mm carrier cheek on each side. The local comparison deducts two independent 5 mm setting allowances from the minimum gross concrete web. The 25 mm screening dimension is a comparison input. Required cover, confinement and anchorage remain open.

| Compared at all 24 guides | Gross web | Web after settings | Margin to 25 mm |
| --- | ---: | ---: | ---: |
| 140 mm arm, full cassette | 19.56 mm | 9.56 mm | −15.44 mm |
| 140 mm arm, cassette reduced to bare tongue width | 28.17 mm | 18.17 mm | −6.83 mm |
| 180 mm arm, full cassette centred 20 mm farther into each arm | 39.58 mm | 29.58 mm | +4.58 mm |

The limiting straight-arm station is 725 mm in all three comparisons. The full 140 mm assembly is short even before the two setting deductions. Holding the current radial angle, guide centres and travel length fixed, a narrower cassette alone cannot meet the screen: even a 20 mm envelope, the tongue's width before adding the receiver, is short.

The [standalone calculation](studies/floor-portal-receiver-cover.py) checks the full oriented cassette against the six exposed edges of the L union. It includes controls for a cassette edge crossing the re-entrant corner while all four cassette corners fit, and for the closest point falling between cassette corners. The [receipt](studies/floor-portal-receiver-cover.json) replaces the predecessor summary's rounded 9.60 and 29.62 mm with the values calculated from the recovered coordinates. The 180 mm local plan comparison also clears the retained [H20 layout and H12 stations](studies/current-house-ground-ties.json), with minimum screened plan gaps of 38.98 and 60.13 mm respectively after settings. These gaps address the stated plan obstructions only.

Run the study with Python 3 and compare its stdout with the receipt.

```sh
python3 -B project/str/studies/floor-portal-receiver-cover.py | diff - project/str/studies/floor-portal-receiver-cover.json
```

## Next comparison and dependent evidence

Compare the 180 mm plan with a revised guide location or orientation at 140 mm before choosing a pier geometry. Retain real guide travel and a positive load route in either option. Build the full receiver, bar, link, coupler and bearing detail and demonstrate its cover, splitting restraint and erection tolerances. If the 180 mm pier is pursued, carry the changed body, bar locations, stiffness and mass into the ring, floor collector, feet and foundation model. Re-run the signed 579-case demand and 104 individual-head movement comparisons with all 52 head reactions, plus the strain controls. Reconcile the widened geometry against the occupied rooms, finishes, roof and court receivers, service openings and renewal paths before offering it to either final gate.

The predecessor's coupled results describe its 140 mm comparison. The numerical force and movement records are recoverable at the pinned head, with its [recorded CI run](https://github.com/adamnoden/architecture/actions/runs/43263256156). They do not transfer to the widened pier. The [interface review](floor-portal-interface-review.md) and [shared contract](../triad-interface-contract.md#structural-direction-and-selection-compatibility) continue to govern the withdrawn SAP-C1 structural handoff and the receiving gates.
