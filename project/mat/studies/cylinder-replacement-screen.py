"""Check a 300 L successor against existing plant geometry and the W9 cold-day duty."""
import argparse
from contextlib import redirect_stdout
from io import StringIO
import json
from math import isclose, pi
from pathlib import Path
import runpy
import sys

here = Path(__file__).resolve().parent
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--check", action="store_true", help="verify the checked-in figure")
args = parser.parse_args()

# The existing bridge script exports the swept clearance and seat/rail geometry.
# Run its verification path, which checks its SVG without writing anything.
original_args = sys.argv
try:
    sys.argv = [str(here / "plant-inlet-route.py"), "--check"]
    with redirect_stdout(StringIO()):
        inlet = runpy.run_path(sys.argv[0])
finally:
    sys.argv = original_args

cylinder = inlet["cylinder"]
cart = cylinder["handlingRadius"]
union, reserve = inlet["R"], inlet["margin"]
route = inlet["plant_case"]
duty = cylinder["selectedNominalLitres"]
assert duty == 300

# McDonald Commercial Cylinder Sizing Guide, 300 L row, 50 mm mineral finish.
shell_od, shell_h = 600, 1300
jacket_od, jacket_h, stand = 120, 50, 100
finished_od = shell_od + jacket_od
finished_h = shell_h + jacket_h + stand
# Along the radius the body, two gaps and the entire side tail must fit.
max_od = 2 * (cart - 2 * union - 2 * reserve)
required_cart = finished_od / 2 + 2 * union + 2 * reserve
extra_radius = required_cart - cart
after_upsizing = {c["fixed"]: c["minimumPlanReserve"] - extra_radius
                  for c in route["checks"] if c["task"] == "cylinder replacement"}
south, north = route["replacementDoor"]["finishedClearY"]
exit_y = cylinder["replacementCentrePath"][-1][1]
door_gaps = (exit_y - required_cart - south, north - exit_y - required_cart)

# The translated bridge foot has a slightly tighter clearance than the cart.
distance_to_foot = inlet["point_segment"](inlet["centre"], inlet["apparatus"], inlet["west_clear"])
max_bridge_od = 2 * (distance_to_foot - union - reserve)
stock_gap = distance_to_foot - union - finished_od / 2
bare_bridge_gap = distance_to_foot - union - shell_od / 2
bare_minimum_cart = shell_od / 2 + 2 * union + 2 * reserve
assert cylinder["station"][2:] == [700, 700]
assert finished_od == 720 and finished_h == 1450 and max_od == 602
assert round(max_bridge_od, 2) == 600.69 and round(stock_gap, 2) == -34.66
assert required_cart == 484 and door_gaps == (-9, 41)
assert round(bare_bridge_gap, 2) == 25.34 and bare_minimum_cart == 424
assert round(after_upsizing["riser"], 2) == -34 and round(after_upsizing["buffer complete round body"], 2) == -32.34

# Use the looser 602 mm orientation-independent limit to give the tank every
# advantage. Outer shell bounding cylinder credits no wall, dished ends or coil.
area = pi * ((max_od - jacket_od) / 2) ** 2
ideal_litres = area * (cylinder["height"] - stand - jacket_h) / 1e6
minimum_h = duty * 1e6 / area + stand + jacket_h
slim_finished_h = 2150 + stand + jacket_h  # cross-family sensitivity, not a supplied assembly
assert round(ideal_litres, 2) == 291.03 and round(minimum_h, 2) == 1794.13
assert slim_finished_h == route["replacementDoor"]["requiredClearHeight"]
print(f"Stock Ø{finished_od} × {finished_h} mm, moving bridge gap {stock_gap:.2f} mm.")
print(f"Current cart Ø{max_od:.0f} mm body limit, bridge Ø{max_bridge_od:.2f} mm; "
      f"enlarged cart R{required_cart:.0f}, south/north gaps {door_gaps} mm.")
print(f"Conditional bare Ø{shell_od} move: closest bridge gap {bare_bridge_gap:.2f} mm, "
      f"minimum cart radius {bare_minimum_cart:.0f} mm before fittings or protective gear.")
print(f"At old height at most {ideal_litres:.2f} L; a lossless 300 L bounding volume needs {minimum_h:.2f} mm finished height.")

# Exclusive space heat / hot-water priority, starting and ending with the same
# stored energy. Postheat uses separate electricity. No preheat or fan heat.
system = json.loads((here / "balanced-service-architecture.json").read_text())
service = inlet["baseline"]
heat = system["nativeW9HeatContract"]
flows = (96, 128)
rows = {(r["totalLps"], r["effectiveRecovery"]): r for r in heat["sensitivities"]
        if (r["insideC"], r["outsideC"]) == (20, -10)}
assert heat["proposedMinimumSupplyC"] == 16
for flow in flows:
    assert rows[flow, .7]["postheatTo16W"] <= heat["nativePostheaterW"] < rows[flow, .6]["postheatTo16W"]
normal, cooking = (rows[flow, .7]["roomHeatIf16SupplyAnd220WK_W"] / 1000 for flow in flows)
room_kw = service["heat"]["designCompatibilityDutyKW"]
water = service["hotWater"]
coil_kw = water["idealReheatKWhFrom10to60"] / water["reheatHoursAt4kWNet"]
cp = 4.186 / 3600  # kWh / L K
draw = max(water["deliveredDailyRangeLitres40C"]) * cp * (40 - 10)
charge_hours = draw / coil_kw
room_demand = 22 * normal + 2 * cooking  # illustrative two hours cooking
headroom = room_kw * (24 - charge_hours) - room_demand
assert isclose(draw, 10.465) and isclose(headroom, 1.3036)
for useful, expected in ((0, -1.8764), (1, -0.2864)):
    # Each kWh of water losses ties up 1/4 hour at the coil, denying the rooms
    # 2 kWh. At most 1 kWh can return as a coincident useful internal gain.
    penalty = room_kw / coil_kw - useful
    margin = headroom - 1.59 * penalty
    assert isclose(margin, expected)
    print(f"{useful:.0%} useful tank loss: break-even {headroom/penalty:.4f} kWh/day; "
          f"1.59 kWh/day comparator gives {margin:.4f} kWh room margin.")
buffer_kwh = service["plant"]["primaryBuffer"]["requiredUsableAlwaysConnectedLitres"] * cp * 5
print(f"One uninterrupted charge defers {normal*charge_hours:.2f}–{cooking*charge_hours:.2f} kWh; "
      f"100 L with a fully available 5 K swing carries {buffer_kwh:.3f} kWh.")


def render_fit_figure(*, station_width, current_body_diameter, candidate_body_diameter,
                      current_cart_radius, candidate_cart_radius, door_low_y, door_high_y,
                      route_y):
    """Draw the two plan sections at 1:8 on A3. All dimensions and Y coordinates are mm.

    The candidate radius is the study's complete carriage envelope at the exit.
    door_low_y and door_high_y are finished jamb faces; route_y is the existing
    exit centreline. Seat both station bodies on the existing station centre.
    """
    scale = 1 / 8
    station_x, station_y = 103, 141
    door_x, door_y = 293, 145
    half = station_width * scale / 2
    body = candidate_body_diameter * scale / 2
    cart = candidate_cart_radius * scale
    north, south = (door_y - (y - route_y) * scale for y in (door_high_y, door_low_y))
    north_clear = door_high_y - (route_y + candidate_cart_radius)
    south_clear = route_y - candidate_cart_radius - door_low_y
    overhang = (candidate_body_diameter - station_width) / 2
    offset = route_y - (door_low_y + door_high_y) / 2

    def gap(value):
        return f"{abs(value):g} mm {'overlap' if value < 0 else 'clear'}"

    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297" role="img" aria-labelledby="title desc">
  <title id="title">Cylinder replacement fit at the station and east door</title>
  <desc id="desc">The {candidate_body_diameter:g} millimetre jacketed cylinder exceeds the {station_width:g} millimetre station. At the east door the larger trolley has {gap(south_clear)} at the south jamb and {gap(north_clear)} at the north jamb. All outlines share a scale of one to eight.</desc>
  <defs>
    <style>
      text {{font-family:"DejaVu Sans",Arial,sans-serif;fill:#182d36}}
      .title {{font-size:9px;font-weight:bold}}
      .heading {{font-size:5.8px;font-weight:bold}} .sub {{font-size:3.7px}}
      .kicker {{font-size:3.05px;font-weight:bold;letter-spacing:.55px;fill:#385965}}
      .label {{font-size:3.3px}} .fine {{font-size:3.15px;fill:#405963}}
      .metric {{font-size:5.8px;font-weight:bold;fill:#953d25}}
      .old {{fill:none;stroke:#267778;stroke-width:.55;stroke-dasharray:2.7 1.5}}
      .new {{fill:#f8e8df;fill-opacity:.85;stroke:#a24929;stroke-width:.7}}
      .station {{fill:none;stroke:#405963;stroke-width:.58}}
      .dim {{fill:none;stroke:#53636b;stroke-width:.32}}
      .call {{fill:none;stroke:#a24929;stroke-width:.42}}
      .axis {{stroke:#819097;stroke-width:.26;stroke-dasharray:2 .9 .4 .9}}
    </style>
    <pattern id="wall" width="2.5" height="2.5" patternUnits="userSpaceOnUse"><rect width="2.5" height="2.5" fill="#dbe1df"/><path d="M0 2.5L2.5 0" stroke="#a8b7b6" stroke-width=".4"/></pattern>
  </defs>
  <rect width="420" height="297" fill="#fcfcfa"/>
  <text class="kicker" x="14" y="15">HOUSE SERVICES  /  DOMESTIC HOT WATER</text>
  <text class="title" x="14" y="31">Cylinder replacement fit</text>
  <text class="sub" x="14" y="42">McDonald nominal 300 L study envelope against the existing plant station and east exit.</text>
  <path d="M14 50H406" stroke="#203f48" stroke-width=".8"/>
  <path d="M202 58V223" stroke="#ced6d5" stroke-width=".4"/>
  <text class="kicker" x="14" y="62">01  /  STATION PLAN</text>
  <text class="heading" x="14" y="72">Jacket against the reserved square</text>
  <text class="sub" x="14" y="80">Both cylinders share the existing centre.</text>
  <text class="kicker" x="213" y="62">02  /  EXIT PLAN</text>
  <text class="heading" x="213" y="72">Trolley at the finished jambs</text>
  <text class="sub" x="213" y="80">The exit line is {abs(offset):g} mm {'south' if offset < 0 else 'north'} of the opening midpoint.</text>
  <g aria-label="Station plan">
    <rect x="{station_x-half:g}" y="{station_y-half:g}" width="{2*half:g}" height="{2*half:g}" fill="#eaf0ed"/>
    <circle class="new" cx="{station_x}" cy="{station_y}" r="{body:g}"/>
    <rect class="station" x="{station_x-half:g}" y="{station_y-half:g}" width="{2*half:g}" height="{2*half:g}"/>
    <circle class="old" cx="{station_x}" cy="{station_y}" r="{current_body_diameter*scale/2:g}"/>
    <path d="M{station_x-2} {station_y}h4m-2 -2v4" class="dim"/>
    <text class="label" x="{station_x}" y="{station_y-8}" text-anchor="middle">Current body Ø{current_body_diameter:g}</text>
    <path class="dim" d="M{station_x-half:g} {station_y-half-1:g}V91m0 2h{2*half:g}m0 -2v{station_y-half-92:g}"/>
    <text class="label" x="{station_x}" y="90" text-anchor="middle">{station_width:g}  station</text>
    <path class="call" d="M{station_x-body:g} {station_y+6:g}V200m0 -2h{2*body:g}m0 2V{station_y+6:g}"/>
    <text class="label" x="{station_x}" y="204" text-anchor="middle">Ø{candidate_body_diameter:g}  finished jacket</text>
    <text class="metric" x="14" y="218">{abs(overhang):g} mm {'overhang' if overhang > 0 else 'clear'} per side</text>
  </g>
  <g aria-label="Door plan" transform="translate(0 8)">
    <circle class="new" cx="{door_x}" cy="{door_y}" r="{cart:g}"/>
    <circle class="old" cx="{door_x}" cy="{door_y}" r="{current_cart_radius*scale:g}"/>
    <path class="axis" d="M{door_x-cart-7:g} {door_y}H{door_x+cart+3:g}"/>
    <path class="axis" d="M{door_x:g} {north:g}V{south:g}"/>
    <path d="M{door_x-2} {door_y}h4m-2 -2v4" stroke="#273e45" stroke-width=".45"/>
    <text class="label" x="{door_x}" y="{door_y-9}" text-anchor="middle">Current trolley Ø{2*current_cart_radius:g}</text>
    <text class="label" x="{door_x}" y="{door_y+10}" text-anchor="middle">Revised trolley Ø{2*candidate_cart_radius:g}</text>
    <g fill="url(#wall)" stroke="#3c515a" stroke-width=".55">
      <rect x="{door_x-7}" y="{north-5:g}" width="14" height="5"/>
      <rect x="{door_x-7}" y="{south:g}" width="14" height="5"/>
    </g>
    <path class="dim" d="M{door_x-8:g} {north:g}H220m2 -2v{south-north+4:g}m-2 -2h{door_x-228:g}"/>
    <text class="label" transform="translate(219 {(north+south)/2:g}) rotate(-90)" text-anchor="middle">{door_high_y-door_low_y:g} clear opening</text>
    <path class="call" d="M{door_x+7} {north:g}h10l7 7h29"/>
    <text class="label" x="350" y="{north+6:g}">North jamb Y{door_high_y:g}</text>
    <text class="fine" x="350" y="{north+11:g}">{gap(north_clear)}</text>
    <path class="dim" d="M{door_x+cart+2:g} {door_y}h6"/>
    <text class="label" x="364" y="{door_y-2}">Route centre</text>
    <text class="fine" x="364" y="{door_y+3}">Y{route_y:g}</text>
    <path class="call" d="M{door_x+7} {south:g}h10l7 -7h29"/>
    <text class="label" x="350" y="{south-7:g}">South jamb Y{door_low_y:g}</text>
    <text class="fine" x="350" y="{south-2:g}">{gap(south_clear)}</text>
  </g>
  <path d="M14 227H406" stroke="#bccac8" stroke-width=".5"/>
  <text class="kicker" x="14" y="238">READING THE OUTLINES</text>
  <path class="old" d="M14 248h12"/>
  <text class="label" x="29" y="249">Existing body or handling envelope</text>
  <path class="call" d="M14 258h12" style="stroke-width:.8"/>
  <text class="label" x="29" y="259">Replacement body or handling envelope</text>
  <text class="kicker" x="185" y="238">SCOPE OF THE CHECK</text>
  <text class="label" x="185" y="248">The station outline excludes fittings and safety equipment.</text>
  <text class="label" x="185" y="256">The trolley retains the study’s side-tail and handling allowances.</text>
  <text class="label" x="185" y="264">Jamb marks locate the finished faces. Wall thickness is schematic.</text>
  <path d="M14 273H406" stroke="#203f48" stroke-width=".6"/>
  <text class="fine" x="14" y="283">Plan dimensions in mm  ·  Both plans 1:8 when printed at A3</text>
  <path class="dim" d="M330 284v-3m0 1.5h62.5m0 -1.5v3"/>
  <text class="fine" x="361.25" y="280" text-anchor="middle">500 mm</text>
</svg>
'''

figure = render_fit_figure(
    station_width=cylinder["station"][2],
    current_body_diameter=cylinder["body"][2],
    candidate_body_diameter=finished_od,
    current_cart_radius=cart, candidate_cart_radius=required_cart,
    door_low_y=south, door_high_y=north, route_y=exit_y,
)
target = here / "cylinder-replacement-fit.svg"
if args.check:
    assert target.read_text() == figure, "Regenerate cylinder-replacement-fit.svg"
else:
    target.write_text(figure)
