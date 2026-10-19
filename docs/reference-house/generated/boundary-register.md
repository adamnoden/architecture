# Reference House — envelope / boundary topology register

> Generated semantic report. It records independent boundary carriers, typed transitions and drainage routes; it does not prove building-physics performance.

**Compile status:** PASS  
**Topology:** MACHINE-CHECKED  
**Performance:** EXTERNAL-NOT-PROVED  
**Source compile:** `16ffc5c68a0247202997603f5fff48737c4c93d89b5947b40336fde0f63b366c`

**Opening obligations:** 18  
**Service-crossing obligations:** 7  
**Registered boundary occurrences:** 1

## Boundary carriers

| Carrier | Role | Kind | Hosts | Critical | Removable | Authority | Description |
|---|---|---|---|---|---|---|---|
| AIR-COURT | air | plan-boundary | G-COURT-EAST, G-COURT-NORTH, G-COURT-SOUTH, G-COURT-WEST, U-COURT-EAST, U-COURT-NORTH, U-COURT-SOUTH, U-COURT-WEST | yes | no | provisional | courtyard-wall room-side air-control boundary |
| AIR-GROUND | air | ground-interface | — | yes | no | provisional | air ground-interface handoff — technical build-up remains external |
| AIR-OUTER | air | plan-boundary | G-OUTER-EAST, G-OUTER-NORTH, G-OUTER-SOUTH, G-OUTER-WEST, U-OUTER-EAST, U-OUTER-NORTH, U-OUTER-SOUTH, U-OUTER-WEST | yes | no | provisional | outer-wall room-side air-control boundary |
| AIR-ROOF | air | roof-field | — | yes | no | provisional | air roof boundary — technical build-up remains external |
| MOI-COURT | moisture | plan-boundary | G-COURT-EAST, G-COURT-NORTH, G-COURT-SOUTH, G-COURT-WEST, U-COURT-EAST, U-COURT-NORTH, U-COURT-SOUTH, U-COURT-WEST | yes | no | provisional | courtyard-wall wetting / drainage / drying strategy |
| MOI-GROUND | moisture | ground-interface | — | yes | no | provisional | moisture ground-interface handoff — technical build-up remains external |
| MOI-OUTER | moisture | plan-boundary | G-OUTER-EAST, G-OUTER-NORTH, G-OUTER-SOUTH, G-OUTER-WEST, U-OUTER-EAST, U-OUTER-NORTH, U-OUTER-SOUTH, U-OUTER-WEST | yes | no | provisional | outer-wall wetting / drainage / drying strategy |
| MOI-ROOF | moisture | roof-field | — | yes | no | provisional | moisture roof boundary — technical build-up remains external |
| THM-COURT | thermal | plan-boundary | G-COURT-EAST, G-COURT-NORTH, G-COURT-SOUTH, G-COURT-WEST, U-COURT-EAST, U-COURT-NORTH, U-COURT-SOUTH, U-COURT-WEST | yes | no | provisional | courtyard-wall insulated boundary |
| THM-GROUND | thermal | ground-interface | — | yes | no | provisional | thermal ground-interface handoff — technical build-up remains external |
| THM-OUTER | thermal | plan-boundary | G-OUTER-EAST, G-OUTER-NORTH, G-OUTER-SOUTH, G-OUTER-WEST, U-OUTER-EAST, U-OUTER-NORTH, U-OUTER-SOUTH, U-OUTER-WEST | yes | no | provisional | outer-wall insulated boundary |
| THM-ROOF | thermal | roof-field | — | yes | no | provisional | thermal roof boundary — technical build-up remains external |
| WEA-COURT | weather | plan-boundary | G-COURT-EAST, G-COURT-NORTH, G-COURT-SOUTH, G-COURT-WEST, U-COURT-EAST, U-COURT-NORTH, U-COURT-SOUTH, U-COURT-WEST | yes | no | provisional | courtyard masonry weathering / drained-cavity boundary |
| WEA-GROUND | weather | ground-interface | — | yes | no | provisional | weather ground-interface handoff — technical build-up remains external |
| WEA-OUTER | weather | plan-boundary | G-OUTER-EAST, G-OUTER-NORTH, G-OUTER-SOUTH, G-OUTER-WEST, U-OUTER-EAST, U-OUTER-NORTH, U-OUTER-SOUTH, U-OUTER-WEST | yes | no | provisional | outer masonry weathering / drained-cavity boundary |
| WEA-ROOF | weather | roof-field | — | yes | no | provisional | weather roof boundary — technical build-up remains external |

## Typed transitions

| Transition | Kind | Reference | Carriers | Host / route | Authority |
|---|---|---|---|---|---|
| INT-AIR-COURT-GROUND | wall-ground | — | AIR-COURT, AIR-GROUND | — | provisional |
| INT-AIR-COURT-ROOF | wall-roof | — | AIR-COURT, AIR-ROOF | — | provisional |
| INT-AIR-OUTER-GROUND | wall-ground | — | AIR-GROUND, AIR-OUTER | — | provisional |
| INT-AIR-OUTER-ROOF | wall-roof | — | AIR-OUTER, AIR-ROOF | — | provisional |
| INT-GROUND-SVC-PEN-FD-01 | service-penetration | PEN-FD-01 | AIR-GROUND, MOI-GROUND, THM-GROUND, WEA-GROUND | — | provisional |
| INT-MOI-COURT-GROUND | wall-ground | — | MOI-COURT, MOI-GROUND | — | provisional |
| INT-MOI-COURT-ROOF | wall-roof | — | MOI-COURT, MOI-ROOF | — | provisional |
| INT-MOI-OUTER-GROUND | wall-ground | — | MOI-GROUND, MOI-OUTER | — | provisional |
| INT-MOI-OUTER-ROOF | wall-roof | — | MOI-OUTER, MOI-ROOF | — | provisional |
| INT-OPEN-G-COURT-NORTH-O01 | threshold | G-COURT-NORTH-O01 | AIR-COURT, MOI-COURT, THM-COURT, WEA-COURT | G-COURT-NORTH | provisional |
| INT-OPEN-G-COURT-SOUTH-O01 | threshold | G-COURT-SOUTH-O01 | AIR-COURT, MOI-COURT, THM-COURT, WEA-COURT | G-COURT-SOUTH | provisional |
| INT-OPEN-G-FRONT-D01 | opening | G-FRONT-D01 | AIR-OUTER, MOI-OUTER, THM-OUTER, WEA-OUTER | G-OUTER-SOUTH | provisional |
| INT-OPEN-G-FRONT-W01 | opening | G-FRONT-W01 | AIR-OUTER, MOI-OUTER, THM-OUTER, WEA-OUTER | G-OUTER-SOUTH | provisional |
| INT-OPEN-G-FRONT-W02 | opening | G-FRONT-W02 | AIR-OUTER, MOI-OUTER, THM-OUTER, WEA-OUTER | G-OUTER-SOUTH | provisional |
| INT-OPEN-G-FRONT-W04 | opening | G-FRONT-W04 | AIR-OUTER, MOI-OUTER, THM-OUTER, WEA-OUTER | G-OUTER-SOUTH | provisional |
| INT-OPEN-U-COURT-NORTH-O01 | opening | U-COURT-NORTH-O01 | AIR-COURT, MOI-COURT, THM-COURT, WEA-COURT | U-COURT-NORTH | provisional |
| INT-OPEN-U-COURT-SOUTH-O01 | opening | U-COURT-SOUTH-O01 | AIR-COURT, MOI-COURT, THM-COURT, WEA-COURT | U-COURT-SOUTH | provisional |
| INT-OPEN-U-FRONT-W01 | opening | U-FRONT-W01 | AIR-OUTER, MOI-OUTER, THM-OUTER, WEA-OUTER | U-OUTER-SOUTH | provisional |
| INT-OPEN-U-FRONT-W02 | opening | U-FRONT-W02 | AIR-OUTER, MOI-OUTER, THM-OUTER, WEA-OUTER | U-OUTER-SOUTH | provisional |
| INT-OPEN-U-FRONT-W03 | opening | U-FRONT-W03 | AIR-OUTER, MOI-OUTER, THM-OUTER, WEA-OUTER | U-OUTER-SOUTH | provisional |
| INT-OPEN-U-FRONT-W04 | opening | U-FRONT-W04 | AIR-OUTER, MOI-OUTER, THM-OUTER, WEA-OUTER | U-OUTER-SOUTH | provisional |
| INT-QOPEN-RHCF-COURT-E-G | opening | RHCF-COURT-E-G | AIR-COURT, MOI-COURT, THM-COURT, WEA-COURT | G-COURT-EAST | provisional |
| INT-QOPEN-RHCF-COURT-E-U | opening | RHCF-COURT-E-U | AIR-COURT, MOI-COURT, THM-COURT, WEA-COURT | U-COURT-EAST | provisional |
| INT-QOPEN-RHCF-COURT-W-G | opening | RHCF-COURT-W-G | AIR-COURT, MOI-COURT, THM-COURT, WEA-COURT | G-COURT-WEST | provisional |
| INT-QOPEN-RHCF-COURT-W-U | opening | RHCF-COURT-W-U | AIR-COURT, MOI-COURT, THM-COURT, WEA-COURT | U-COURT-WEST | provisional |
| INT-QOPEN-RHCF-GARDEN-CENTRE-G | opening | RHCF-GARDEN-CENTRE-G | AIR-OUTER, MOI-OUTER, THM-OUTER, WEA-OUTER | G-OUTER-NORTH | provisional |
| INT-QOPEN-RHCF-GARDEN-CENTRE-U | opening | RHCF-GARDEN-CENTRE-U | AIR-OUTER, MOI-OUTER, THM-OUTER, WEA-OUTER | U-OUTER-NORTH | provisional |
| INT-ROOF-SVC-PEN-PV-01 | roof-penetration | PEN-PV-01 | AIR-ROOF, MOI-ROOF, THM-ROOF, WEA-ROOF | — | provisional |
| INT-ROOF-SVC-PEN-SV-RF-01 | roof-penetration | PEN-SV-RF-01 | AIR-ROOF, MOI-ROOF, THM-ROOF, WEA-ROOF | — | provisional |
| INT-RW-PEN-CD-01 | rainwater-collection | PEN-CD-01 | AIR-GROUND, MOI-GROUND, THM-GROUND, WEA-GROUND | RW-COURT-EMERGENCY + RW-COURT-PRIMARY | provisional |
| INT-SVC-PEN-HS-01 | service-penetration | PEN-HS-01 | AIR-OUTER, MOI-OUTER, THM-OUTER, WEA-OUTER | G-OUTER-EAST | provisional |
| INT-SVC-PEN-KX-01 | service-penetration | PEN-KX-01 | AIR-OUTER, MOI-OUTER, THM-OUTER, WEA-OUTER | G-OUTER-EAST | provisional |
| INT-SVC-PEN-MV-01 | service-penetration | PEN-MV-01 | AIR-OUTER, MOI-OUTER, THM-OUTER, WEA-OUTER | G-OUTER-EAST | provisional |
| INT-SVC-PEN-UE-01 | service-penetration | PEN-UE-01 | AIR-OUTER, MOI-OUTER, THM-OUTER, WEA-OUTER | G-OUTER-EAST | provisional |
| INT-THM-COURT-GROUND | wall-ground | — | THM-COURT, THM-GROUND | — | provisional |
| INT-THM-COURT-ROOF | wall-roof | — | THM-COURT, THM-ROOF | — | provisional |
| INT-THM-OUTER-GROUND | wall-ground | — | THM-GROUND, THM-OUTER | — | provisional |
| INT-THM-OUTER-ROOF | wall-roof | — | THM-OUTER, THM-ROOF | — | provisional |
| INT-WEA-COURT-GROUND | wall-ground | — | WEA-COURT, WEA-GROUND | — | provisional |
| INT-WEA-COURT-ROOF | wall-roof | — | WEA-COURT, WEA-ROOF | — | provisional |
| INT-WEA-OUTER-GROUND | wall-ground | — | WEA-GROUND, WEA-OUTER | — | provisional |
| INT-WEA-OUTER-ROOF | wall-roof | — | WEA-OUTER, WEA-ROOF | — | provisional |

## Directional drainage routes

| Route | Kind | Direction | From → to | Visible failure | Authority |
|---|---|---|---|---|---|
| RW-COURT-EMERGENCY | courtyard-emergency | service-side | higher-level independent courtyard overflow inlet → visible above-ground east/service outlet | yes | provisional |
| RW-COURT-PRIMARY | courtyard-primary | service-side | courtyard surface / east-side removable-grate collector → external east/service inspection point | yes | provisional |
| RW-ROOF-EAST | roof-field | outward | east roof field → outer east collection edge / corner returns | yes | provisional |
| RW-ROOF-NORTH | roof-field | outward | north roof field → outer north collection edge / corner returns | yes | provisional |
| RW-ROOF-SOUTH | roof-field | outward | south roof field → outer south collection edge / corner returns | yes | provisional |
| RW-ROOF-WEST | roof-field | outward | west roof field → outer west collection edge / corner returns | yes | provisional |

## Scope boundary

Boundary topology and represented obligations are machine-checked at the bounded compiler scope. U-values, ψ-values, condensation, airtightness, rain resistance, drainage capacity, fire/acoustic performance and product compliance are not proved here.
