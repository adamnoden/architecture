# Editable east ground receiving level

The editable port is the east fault continuation's far end at X16000. The current RWT receiving interface owns its maximum water level, the outlet, bed and crest. The current HAD court intake supplies the 3.60375 L/s ordinary event and 4.43895 L/s long maintenance event. One versioned case supplies the exact source binding and a trial far-end level to the native east ground method. The [section witness](studies/east-ground-receiving-20mm-lower.svg) plots the fixed bed and the two water levels at 1:25.

| Case | Tailwater | Long duty full-lane head | Long duty half-lane head | Long duty downstream separation |
| --- | ---: | ---: | ---: | ---: |
| Source maximum | −1600 mm | −1571.67 mm | −1549.16 mm | 270.66 mm |
| Lower trial | −1620 mm | −1582.24 mm | −1549.16 mm | 287.69 mm |

Lowering the far water level improves the full-lane sensitivity and lowers the static residual proxy from 50 to 30 mm. The half-width lane remains limited by its bed control. Raising the tail to −1599 mm breaches the authored maximum. A −1700 mm trial crosses the native method's subcritical boundary and requires another method. Both cases fail before producing a schedule or drawing. The source grade, first wetting, actual losses, spill direction, downstream site disposal and installed acceptance still need evidence.

Current native access comparisons require the actual MAT dock file. The old #1430 dock geometry is available only through the explicitly named historical dock comparison. The existing east ground output reproduces on the current source with no level edit.

```sh
node --import tsx scripts/compile-current-design.ts --read-georgian-source |
  node --import tsx scripts/compile-current-design.ts --read-east-ground-receiving - > receiving-case.json
# Edit receiving.farEndWaterLevelMm in receiving-case.json.
node --import tsx scripts/compile-current-design.ts --east-ground-receiving receiving-case.json
node --import tsx project/ccr/studies/current-projection-witnesses.ts --check
```
