# Reference House — service topology register

> Generated semantic report. This is topology, not pipe/duct routing or MEP performance evidence.

**Compile status:** PASS  
**Topology:** MACHINE-CHECKED  
**Performance:** EXTERNAL-NOT-PROVED  
**Source compile:** `8993f24a8feded8a03d55bc7463654034d3ddd0bc54e283b81f2fbb466ad8aba`

## Routes

| Network | Service class | Semantic route | Role | Registered crossing | Authority |
|---|---|---|---|---|---|
| cooker source capture | cooker-extract | KX-01 → EXT-AIR | boundary-link | PEN-KX-01 | provisional |
| domestic water distribution | domestic-water | SV-01 → U-BATH-TERMINALS | local-branch | — | provisional |
| domestic water distribution | domestic-water | G-PLANT-01 → G-WET-TERMINALS | distribution | — | provisional |
| domestic water distribution | domestic-water | G-PLANT-01 → SV-01 | vertical-trunk | PEN-SV-01 | provisional |
| electrical / data distribution | electrical-data | G-PLANT-01 → DRY-G-01 | primary | — | provisional |
| electrical / data distribution | electrical-data | DRY-G-01 → DRY-G-TERMINALS | local-branch | — | provisional |
| electrical / data distribution | electrical-data | G-PLANT-01 → SV-01 | vertical-trunk | PEN-SV-01 | provisional |
| electrical / data distribution | electrical-data | SV-01 → DRY-U-01 | primary | — | provisional |
| electrical / data distribution | electrical-data | DRY-U-01 → DRY-U-TERMINALS | local-branch | — | provisional |
| foul / soil / vent | foul | U-BATH-TERMINALS → SV-01 | local-branch | — | provisional |
| foul / soil / vent | foul | FS-BASE-01 → EXT-SEWER | boundary-link | PEN-FD-01 | provisional |
| foul / soil / vent | foul | G-WET-TERMINALS → FS-BASE-01 | distribution | — | provisional |
| foul / soil / vent | foul | SV-01 → FS-BASE-01 | vertical-trunk | PEN-SV-01 | provisional |
| foul / soil / vent | foul | SV-01 → EXT-AIR | vent | PEN-SV-RF-01 | provisional |
| external heat-pump connection | heat-pump-link | ASHP-01 → G-PLANT-01 | boundary-link | PEN-HS-01 | provisional |
| low-temperature hydronic distribution | hydronic | G-PLANT-01 → HYD-G-01 | distribution | — | provisional |
| low-temperature hydronic distribution | hydronic | HYD-G-01 → HYD-G-TERMINALS | local-branch | — | provisional |
| low-temperature hydronic distribution | hydronic | G-PLANT-01 → SV-01 | vertical-trunk | PEN-SV-01 | provisional |
| low-temperature hydronic distribution | hydronic | SV-01 → HYD-U-01 | distribution | — | provisional |
| low-temperature hydronic distribution | hydronic | HYD-U-01 → HYD-U-TERMINALS | local-branch | — | provisional |
| MVHR extract | mvhr-extract | MV-U-BATH-EXTRACT → SV-01 | local-branch | — | provisional |
| MVHR extract | mvhr-extract | MV-G-EXTRACT-TERMINALS → MVHR-01 | distribution | — | provisional |
| MVHR extract | mvhr-extract | SV-01 → MVHR-01 | vertical-trunk | PEN-SV-01 | provisional |
| MVHR outdoor air / exhaust | mvhr-exhaust-air | MVHR-01 → EXT-AIR | boundary-link | PEN-MV-01 | provisional |
| MVHR outdoor air / exhaust | mvhr-outdoor-air | EXT-AIR → MVHR-01 | boundary-link | PEN-MV-01 | provisional |
| MVHR supply | mvhr-supply | MVHR-01 → MV-G-SUPPLY | distribution | — | provisional |
| MVHR supply | mvhr-supply | MV-G-SUPPLY → MV-G-SUPPLY-TERMINALS | local-branch | — | provisional |
| MVHR supply | mvhr-supply | MVHR-01 → SV-01 | vertical-trunk | PEN-SV-01 | provisional |
| MVHR supply | mvhr-supply | SV-01 → MV-U-SUPPLY | distribution | — | provisional |
| MVHR supply | mvhr-supply | MV-U-SUPPLY → MV-U-SUPPLY-TERMINALS | local-branch | — | provisional |
| PV electrical route | pv-electrical | PV-01 → G-PLANT-01 | boundary-link | PEN-PV-01 | provisional |
| communications entry | communications | EXT-COMMS → G-PLANT-01 | entry | PEN-UE-01 | provisional |
| utility electricity entry | utility-electricity | EXT-ELECTRIC → G-PLANT-01 | entry | PEN-UE-01 | provisional |
| utility water entry | utility-water | EXT-WATER → G-PLANT-01 | entry | PEN-UE-01 | provisional |

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
