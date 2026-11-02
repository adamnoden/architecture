# Reference House — service topology register

> Generated semantic report. This is topology, not pipe/duct routing or MEP performance evidence.

**Compile status:** PASS  
**Topology:** MACHINE-CHECKED  
**Performance:** EXTERNAL-NOT-PROVED  
**Source compile:** `16ffc5c68a0247202997603f5fff48737c4c93d89b5947b40336fde0f63b366c`

## Routes

| Network | Route ID | Service class | Semantic route | Role | Registered crossing | Authority |
|---|---|---|---|---|---|---|
| cooker source capture | R-KX-01 | cooker-extract | KX-01 → EXT-AIR | boundary-link | PEN-KX-01 | provisional |
| domestic water distribution | R-WATER-BATH | domestic-water | SV-01 → U-BATH-TERMINALS | local-branch | — | provisional |
| domestic water distribution | R-WATER-GROUND | domestic-water | G-PLANT-01 → G-WET-TERMINALS | distribution | — | provisional |
| domestic water distribution | R-WATER-RISER | domestic-water | G-PLANT-01 → SV-01 | vertical-trunk | PEN-SV-01 | provisional |
| electrical / data distribution | R-DRY-G | electrical-data | G-PLANT-01 → DRY-G-01 | primary | — | provisional |
| electrical / data distribution | R-DRY-G-BRANCH | electrical-data | DRY-G-01 → DRY-G-TERMINALS | local-branch | — | provisional |
| electrical / data distribution | R-DRY-RISER | electrical-data | G-PLANT-01 → SV-01 | vertical-trunk | PEN-SV-01 | provisional |
| electrical / data distribution | R-DRY-U | electrical-data | SV-01 → DRY-U-01 | primary | — | provisional |
| electrical / data distribution | R-DRY-U-BRANCH | electrical-data | DRY-U-01 → DRY-U-TERMINALS | local-branch | — | provisional |
| foul / soil / vent | R-FOUL-BATH | foul | U-BATH-TERMINALS → SV-01 | local-branch | — | provisional |
| foul / soil / vent | R-FOUL-EXIT | foul | FS-BASE-01 → EXT-SEWER | boundary-link | PEN-FD-01 | provisional |
| foul / soil / vent | R-FOUL-GROUND | foul | G-WET-TERMINALS → FS-BASE-01 | distribution | — | provisional |
| foul / soil / vent | R-FOUL-STACK | foul | SV-01 → FS-BASE-01 | vertical-trunk | PEN-SV-01 | provisional |
| foul / soil / vent | R-SOIL-VENT | foul | SV-01 → EXT-AIR | vent | PEN-SV-RF-01 | provisional |
| external heat-pump connection | R-ASHP-01 | heat-pump-link | ASHP-01 → G-PLANT-01 | boundary-link | PEN-HS-01 | provisional |
| low-temperature hydronic distribution | R-HYD-G | hydronic | G-PLANT-01 → HYD-G-01 | distribution | — | provisional |
| low-temperature hydronic distribution | R-HYD-G-BRANCH | hydronic | HYD-G-01 → HYD-G-TERMINALS | local-branch | — | provisional |
| low-temperature hydronic distribution | R-HYD-RISER | hydronic | G-PLANT-01 → SV-01 | vertical-trunk | PEN-SV-01 | provisional |
| low-temperature hydronic distribution | R-HYD-U | hydronic | SV-01 → HYD-U-01 | distribution | — | provisional |
| low-temperature hydronic distribution | R-HYD-U-BRANCH | hydronic | HYD-U-01 → HYD-U-TERMINALS | local-branch | — | provisional |
| MVHR extract | R-MV-EXT-BATH | mvhr-extract | MV-U-BATH-EXTRACT → SV-01 | local-branch | — | provisional |
| MVHR extract | R-MV-EXT-G | mvhr-extract | MV-G-EXTRACT-TERMINALS → MVHR-01 | distribution | — | provisional |
| MVHR extract | R-MV-EXT-RISER | mvhr-extract | SV-01 → MVHR-01 | vertical-trunk | PEN-SV-01 | provisional |
| MVHR outdoor air / exhaust | R-MV-EA | mvhr-exhaust-air | MVHR-01 → EXT-AIR | boundary-link | PEN-MV-01 | provisional |
| MVHR outdoor air / exhaust | R-MV-OA | mvhr-outdoor-air | EXT-AIR → MVHR-01 | boundary-link | PEN-MV-01 | provisional |
| MVHR supply | R-MV-SUP-G | mvhr-supply | MVHR-01 → MV-G-SUPPLY | distribution | — | provisional |
| MVHR supply | R-MV-SUP-G-BRANCH | mvhr-supply | MV-G-SUPPLY → MV-G-SUPPLY-TERMINALS | local-branch | — | provisional |
| MVHR supply | R-MV-SUP-RISER | mvhr-supply | MVHR-01 → SV-01 | vertical-trunk | PEN-SV-01 | provisional |
| MVHR supply | R-MV-SUP-U | mvhr-supply | SV-01 → MV-U-SUPPLY | distribution | — | provisional |
| MVHR supply | R-MV-SUP-U-BRANCH | mvhr-supply | MV-U-SUPPLY → MV-U-SUPPLY-TERMINALS | local-branch | — | provisional |
| PV electrical route | R-PV-01 | pv-electrical | PV-01 → G-PLANT-01 | boundary-link | PEN-PV-01 | provisional |
| communications entry | R-UE-COMMS | communications | EXT-COMMS → G-PLANT-01 | entry | PEN-UE-01 | provisional |
| utility electricity entry | R-UE-ELECTRIC | utility-electricity | EXT-ELECTRIC → G-PLANT-01 | entry | PEN-UE-01 | provisional |
| utility water entry | R-UE-WATER | utility-water | EXT-WATER → G-PLANT-01 | entry | PEN-UE-01 | provisional |

## Selected crossings

- `PEN-FD-01`
- `PEN-HS-01`
- `PEN-KX-01`
- `PEN-MV-01`
- `PEN-PV-01`
- `PEN-SV-01`
- `PEN-SV-RF-01`
- `PEN-UE-01`

## Maintenance and access obligations

| Target | Access | Via | External |
|---|---|---|---|
| ASHP-01 | replacement | — | yes |
| FS-BASE-01 | inspection | G-SVC-02 | no |
| G-PLANT-01 | isolation | G-GAL-01, G-SVC-02 | no |
| G-PLANT-01 | replacement | G-SVC-02 | yes |
| G-PLANT-01 | working | G-GAL-01, G-SVC-02 | no |
| KX-01 | inspection | G-KIT-02 | no |
| MVHR-01 | filter-service | G-SVC-02 | no |
| MVHR-01 | replacement | G-SVC-02 | yes |
| MVHR-01 | working | G-SVC-02 | no |
| SV-01 | inspection | G-GAL-01, G-SVC-02, U-BATH-01, U-GAL-02 | no |

## Scope boundary

Route coherence, selected crossing ownership and represented access obligations are machine-checked at the bounded compiler scope. Sizing, pressure loss, airflow, acoustics, fire stopping, commissioning, product adequacy and exact routing remain external.
