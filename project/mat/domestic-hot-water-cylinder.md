# Domestic hot water at the 700 mm plant station

The [cylinder safety route](cylinder-safety-route.md) locates the protection and discharge on the east house. The [mineral replacement study](cylinder-replacement-screen.md) tests catalogue cases, handling and standing loss with the W9 operating case.

**Retain the 300 L stored-water duty. Reject the standard 300-labelled uniSTOR as the specified vessel.** Its potable volume is **273.5 L**, 26.5 L short of a literal 300 L of stored domestic water. Its 50 mm polyurethane insulation also conflicts with the house material policy. The published cylinder dimensions still give a handling comparison. A factory-engineered alternative needs its own pressure vessel, insulation, safety assembly, connections, service space and replacement route. [House service baseline](whole-house-service-baseline.md) · [Material policy](../../docs/reference-house/material-policy.md)

## Identify the actual vessel

Vaillant's merchant circular of 10 February 2025 identifies **0020235274** as the *non-plumbed* VIH RW GB 300 BES. Section 2.3 of its non-plumbed installation manual identifies cylinder article **0010019227**. Vaillant also supplied a pre-plumbed 300 BES, so the installation variant is part of the identification. The non-plumbed manual specifies grade 1.4521 stainless steel and polyurethane. This evidence is specific to the 300 BES. The 250 L uniSTOR pure belongs to a different comparison. [Vaillant merchant circular, existing standard range](https://midsummerwholesale.co.uk/pdfs/high-recovery-cylinder-range---merchant-comms-10.2.25-final--1-.pdf) · [Non-plumbed manual 0020221300_05, pp5, 17–18](https://professional.vaillant.co.uk/downloads/aproducts/cylinders-1/unistor/standard-unistor-cylinder-0020221300-00-1044908.pdf)

| Quantity | 2024 non-plumbed brochure | Non-plumbed installation manual |
|---|---:|---:|
| Potable water / coil water | 273.5 / 15.2 L | 273.5 / 15.2 L |
| Hot-water draw-off under the cited EN 12897 test | 230.9 L | 208.0 L |
| Standing loss in 24 h | 1.6 kWh | 1.59 kWh |
| Printed energy class | B | C in the heat-loss row |

The brochure's 288.7 L total includes the coil water. The EN 12897 hot-water draw-off and mixed volume at 40°C are distinct measurements. Preserve the discrepancy until article-specific test evidence reconciles it. At 10°C cold inlet and 60°C throughout all 273.5 potable litres, ideal mixing gives **455.8 L at 40°C**. That upper bookkeeping case omits stratification losses, return circulation and the delivery-temperature cut-off. Obtain a matched temperature–volume draw profile and the intended sequence of fixture uses before crediting a delivered volume. [Vaillant brochure, p16](https://professional.vaillant.co.uk/downloads/aproducts/unistor-500-800l/vaillant-heat-pump-cylinder-brochure-2024-1198831.pdf#page=16) · [Manual, Appendix C](https://professional.vaillant.co.uk/downloads/aproducts/cylinders-1/unistor/standard-unistor-cylinder-0020221300-00-1044908.pdf#page=17) · [EN 12897 terminology, §3.2](https://preview.sist.si/sist-preview/70484/b6c86f384d3a423dba66bad9b01b6341/SIST-EN-12897-2016-A1-2020.pdf)

## Share a cold day between the cylinder and the rooms

Heating the 273.5 L charge from 10 to 60°C takes **15.90 kWh**, or **3.98 h** at a constant 4 kW net into the water. The original 17.44 kWh and 4.36 h belong to the 300 L duty. Vaillant's 52.5 kW coil rating and roughly 7.5-minute 70% reheat come from a different operating condition. They do not establish the heat pump's net output into the final charging temperature. [Baseline hot-water and heating cards](studies/whole-house-service-baseline.json) · [Calculation](studies/dhw-cylinder-duty.py)

Hold the baseline’s **7.84 kW** space load for 24 h. The original card combines 220 W/K fabric and infiltration, 78 L/s extract ventilation and 25 K inside to outside. In this sensitivity the heat source provides exactly **8 kW while serving the rooms** and **4 kW net while serving domestic hot water**, with exclusive priority. Require the house and water store to end at their starting stored energy. Credit no auxiliary heat or internal gains and omit standing and distribution losses, defrost and switching delays. The 188.16 kWh room duty requires 23.52 h in room mode. The remaining **0.48 h** supplies **55.0 L/day at 40°C** from 10°C inlet. Even the low endpoint of the house demand range exceeds that allowance. [Original room and DHW duties](whole-house-service-baseline.md#heating-water-and-plant)

| Daily mixed draw at 40°C | Net water energy | Exclusive DHW time | Room output needed during the remaining hours | Room energy short at 8 kW |
|---:|---:|---:|---:|---:|
| 60 L | 2.093 kWh | 0.523 h | 8.015 kW | 0.346 kWh |
| 300 L | 10.465 kWh | 2.616 h | 8.799 kW | 17.090 kWh |

The range describes total daily use across two to six occupants. It supplies no simultaneous draw schedule. A larger store can move the heating interval in time. It cannot meet a repeating energy deficit under these assumptions. Compare measured or calculated room load over the actual design day, usable heat-pump capacity in both modes, room recovery, draw sequence, loop losses and defrost before choosing the plant. A revised ventilation strategy needs its own hourly room load. [Service comparison](balanced-service-architecture.md) · [Reproducer](studies/dhw-cylinder-duty.py)

## Reserve the expansion vessel as well as the cylinder

The current 595 mm body is centred in a 700 mm square, with a separate 900 × 700 mm working area to the east. The non-plumbed kit includes a separate **25 L** expansion vessel. The manual locates it near the cylinder and requires annual access to check its pressure. At a shared height, the largest circular footprint touching the cylinder and two station edges is **163.6 mm diameter**. Even an ideal straight cylinder that narrow needs **1,189 mm** of internal height for 25 L. Walls, domed ends, bracket, connection and service clearance increase the required space. This is an exclusion gauge for a vertical side-by-side arrangement. The delivered vessel's shape and bracket position still need locating, together with valve access, support and independent removal. Retain the clear working area and the cylinder's trolley route when testing a separate mount. [Current cylinder station](../had/studies/water-replan.json) · [Native assembly, §§4.2, 5.2.4 and Appendix B](https://professional.vaillant.co.uk/downloads/aproducts/cylinders-1/unistor/standard-unistor-cylinder-0020221300-00-1044908.pdf)
