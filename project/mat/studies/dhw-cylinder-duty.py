"""Check the 300-litre house duty against the identified non-plumbed uniSTOR."""
import json
import math
from pathlib import Path

here = Path(__file__).resolve().parent
baseline = json.loads((here / "whole-house-service-baseline.json").read_text())
house = json.loads((here / "../../had/studies/water-replan.json").read_text())["model"]
host = house["servicesInterface"]["plant"]["cylinder"]
duty, heating = baseline["hotWater"], baseline["heat"]
nominal = host["selectedNominalLitres"]
assert nominal == baseline["plant"]["cylinder"]["selectedNominalLitres"] == 300

# Vaillant 2024 brochure, p16, article 0020235274. The non-plumbed IOM
# 0020221300_05, appendix C, independently gives the same actual volume.
potable, primary, gross = 273.5, 15.2, 288.7
assert math.isclose(potable + primary, gross)
cold, mixed, stored = 10, 40, 60
cp = 4.186 / 3600  # kWh per litre-kelvin under the house water-mass approximation
dhw_kw = 4.0
mixed_ideal = potable * (stored - cold) / (mixed - cold)
charge_kwh = potable * cp * (stored - cold)
assert math.isclose(nominal * cp * (stored - cold), duty["idealReheatKWhFrom10to60"])
assert math.isclose(nominal * cp * (stored - cold) / dhw_kw, duty["reheatHoursAt4kWNet"])

# Exclusive DHW priority, starting and ending the hypothetical day at the
# same stored energy. Use the original MEV heat card, not the W9 HRV challenger.
room_kw = heating["designCompatibilityDutyKW"]
load_kw = next(row["MEVkW"] for row in heating["thermalSensitivity"]
               if row["fabricPlusInfiltrationWK"] == 220 and row["deltaTK"] == 25)
draws = duty["deliveredDailyRangeLitres40C"]
hours = 24
priority_available = hours * (1 - load_kw / room_kw)
max_daily_draw = priority_available * dhw_kw / (cp * (mixed - cold))
assert 0 < max_daily_draw < min(draws)
print(f"Stored-water shortfall {nominal-potable:.1f} L; perfect mix {mixed_ideal:.2f} L; "
      f"initial full charge {charge_kwh:.3f} kWh / {charge_kwh/dhw_kw:.3f} h.")
print(f"At {room_kw:g} kW room / {dhw_kw:g} kW DHW: {priority_available:.3f} h available "
      f"for water, {max_daily_draw:.2f} L/day at {mixed} C.")
for litres in draws:
    water_kwh = litres * cp * (mixed - cold)
    priority_h = water_kwh / dhw_kw
    room_required = hours * load_kw / (hours - priority_h)
    deficit = hours * load_kw - (hours - priority_h) * room_kw
    assert priority_h > priority_available and room_required > room_kw and deficit > 0
    print(f"{litres} L: {water_kwh:.3f} kWh, {priority_h:.3f} h water, "
          f"{room_required:.3f} kW required in room mode, {deficit:.3f} kWh room deficit.")

# Largest vertical circular body alongside the centred cylinder at a common
# height: contact with two sides of the square station and the cylinder itself.
sx, sy, size, side = host["station"]
bx, by, diameter, depth = host["body"]
assert size == side and diameter == depth == 595
assert math.isclose(sx + size/2, bx + diameter/2) and math.isclose(sy + size/2, by + depth/2)
corner_radius = (math.sqrt(2)*size/2 - diameter/2) / (1 + math.sqrt(2))
assert math.isclose(math.sqrt(2)*(size/2 - corner_radius), corner_radius + diameter/2)
min_height = 25e6 / (math.pi * corner_radius**2)
print(f"Side-by-side corner limit {2*corner_radius:.1f} mm OD; "
      f"25 L requires at least {min_height:.1f} mm at that diameter before walls or ends.")
