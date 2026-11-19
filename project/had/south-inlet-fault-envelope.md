# Compute each blocked-mouth south inlet fault separately

The conditional south sill insert contains two independently closed wet cells. The compiler follows each through its upper pressure sleeve, lower relief, high atmospheric hood and dedicated receiver. It uses the actual conditional sill geometry and the same hydraulic methods as the prior relief comparison. The indoor inlet remains the reference. [Sill insert](south-inlet-sill-insert.md) · [Native relief basis](south-inlet-relief.md) · [Wet closures](south-inlet-wet-box.md)

Each comparison assumes the affected branch's outside upper mouth is blocked. The other cell and receiver stay separate. There is no credit for the ordinary outlet, overflow into the other cell or manual isolation. A closed lower relief or unavailable hood withholds the open-flow result. The high vent level is measured from its actual clear core and checked against the screened water stage. Hood resistance and real pressure are unresolved.

| Trial per branch | Trough dry reserve | Receiver free-drop reserve | Result |
| --- | ---: | ---: | --- |
| 90 L/min, K = 1.5, 32 mm obstruction, nominal receiver | 10.75 mm | 11.01 mm | Clears the conditional calculation |
| Same with K = 2 | −1.82 mm | 11.01 mm | Lower trough fails |
| Same as first row with plant receiver imposed at Z165 | 10.75 mm | −6.67 mm | Plant terminal free drop fails |

The source steady case keeps the upper sleeve inboard invert 62.85 mm above the utility water stage and 82.85 mm above the plant water stage. These separations explicitly join the upper return to its lower wet-box calculation. The through-wall reverse flow keeps 13.28 mm to the screened crown-air limit under the same 90 L/min challenge. An imposed receiver water level above the free-overflow comparison leaves actual discharge unproved, even when free-drop clearance remains positive. The model provides an independent local-stage sensitivity for each branch. It does not predict the receiving site's water levels.

```sh
node --import tsx scripts/compile-current-design.ts --read-georgian-source |
  node --import tsx scripts/compile-current-design.ts --read-inlet-fault - > inlet-fault.json
node --import tsx scripts/compile-current-design.ts --inlet-fault inlet-fault.json
```

The fixed half-width section and upper sleeve support the bounded comparison only. Flow, lower entrance loss, lower bed obstruction, open path availability and downstream boundary inputs drive the result and the Y/Z sections. The conditional window rewind and both source bindings accompany every result. Provider pressure and sustained flow, actual hood losses and partial blockage, wet impact and closure, frost, independently surveyed disposal and a complete physical qualification remain open.
