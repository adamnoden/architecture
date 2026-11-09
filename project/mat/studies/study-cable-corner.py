"""Check the dry study corner against the selected plan and a bare 2L1.5 cable."""
import json
import math
from pathlib import Path

project = Path(__file__).resolve().parents[2]
house = json.loads((project / "had/studies/water-replan.json").read_text())["model"]
north = next(w for w in house["groundWalls"] if w["id"] == "study-L-north")
wall_x, wall_y = house["envelope"], min(north["finishedFaces"])
emitter = house["groundFurniture"]["service-emitter-study-W"]
assert (wall_x, wall_y) == (429.5, 3150.5)
assert wall_y - 500 > emitter[1] + emitter[3]
assert wall_x + 500 < min(start for start, _ in north["holes"])
west_windows = [w for w in house["openings"]["GROUND"] if w["wall"] == "outer-west"]
assert all(w["centre"] + w["width"]/2 < wall_y-500 or
           w["centre"] - w["width"]/2 > wall_y for w in west_windows)

diameter, depth, axis = 5.7, 45-18, 9
r = diameter / 2
# Take the guide's 6D as an inside radius. Keep the whole circular cable.
R = 6*diameter + r
tangent = axis + R
# Local room coordinates u,v are distances from the two finished walls.
# Forbidden trim quadrant u,v >= depth; its corner is closest at 45 degrees.
diagonal_offset = R*(1-1/math.sqrt(2))
def trim_clearance(offset):
    return math.sqrt(2)*(depth-offset-diagonal_offset) - r

assert axis-r > 0 and trim_clearance(axis) > 7
assert trim_clearance(15) < 0
maximum_axis = depth-diagonal_offset-r/math.sqrt(2)
# A quarter turn in one strip towards a rear entry spans at least R, even
# with zero end, gland and tool allowances and no cable thickness.
assert R > depth
stations = [75, 325]  # same on both faces, distance from wall intersection
assert stations[0] > tangent
around_corner = 2*(stations[0]-tangent) + math.pi*R/2
assert max(around_corner, stations[1]-stations[0], 500-stations[1]) <= 450

def distance_to_rect(x, y, rect):
    u, v, width, height = rect
    return math.hypot(max(0,u-x,x-u-width), max(0,v-y,y-v-height))

cx, cy, body = 800, 2770, house["studyDoorOperation"]["bodyRadius"]
assert body == 300
wall_gap = min(cx-wall_x-45, wall_y-cy-45)-body
furniture_gap = min(distance_to_rect(cx, cy, rect)-body
                    for rect in house["groundFurniture"].values())
assert wall_gap > 25 and furniture_gap > 100
print(f"Study corner X{wall_x}/Y{wall_y}; 6D bend clears trim by {trim_clearance(axis):.2f} mm. "
      f"Maximum equal axis offset {maximum_axis:.2f} mm; at 15 mm: {trim_clearance(15):.2f} mm. "
      f"Support interval across corner {around_corner:.2f} mm. "
      f"Body to trim/furniture {wall_gap:.1f}/{furniture_gap:.1f} mm.")
