"""Gravity/contact comparisons for proposed core joints at Z−30, in mm, kN and MPa."""
import json
from math import hypot, isclose, sqrt
from pathlib import Path

here = Path(__file__).resolve().parent
read = lambda name: json.loads((here / name).read_text())
support = read("../../str/studies/open-loggia-support.json")
foundation = read("../../str/studies/current-house-joined-foundation.json")
crossings = {r["shaft"]: r for r in read("floor-pour-boundary.results.json")["directShaftCorePaths"]}
frame = support["finite_floor_frame"]
stair = frame["stair"]["post_section"]
wet = support["wet_wall_beam"]
pier = wet["receiving_pier_check"]
cut_z, placement = -30, 5

# The trimmer is 25 mm west of the stair post and has an actual point load.
# The same 20 mm imperfection (radius) can point anywhere in plan.
# Weak-axis amplification is applied to both directions for the wet piers.
def check_cut(head, top_reaction, full_depth, pcr, imperfection, side_moment=0):
    crossing = crossings[head]
    x, y, width, length = crossing["coreXYWH_mm"]
    cx, cy = x + width/2, y + length/2
    cut_drop = cut_z - crossing["coreBaseZ_mm"]
    assert cut_drop == 150 and cut_z == crossing["ordinaryDpcTopZ_mm"]
    factored_weight_per_mm = 1.35 * width * length * 25 / 1e9
    full_n = top_reaction + full_depth * factored_weight_per_mm
    n = full_n - cut_drop * factored_weight_per_mm
    # Retain the full-height Pcr as a comparison, without taking credit for the
    # shorter shaft. A new opening joint changes the restraint and stiffness.
    gain = 1 / (1-n/pcr)
    avg = n*1000/(width*length)
    # Whole-area elastic plane, with normal force positive down. Max over the
    # four signed corners and all orientations of bounded radial displacements.
    f = 6*hypot(1/width, 1/length)
    offset_ratio = 6*abs(side_moment)/n/width*gain  # side moment in kN mm
    def limits(tol):
        skew = offset_ratio + f*(gain*imperfection + tol)
        return [avg*(1-skew), avg*(1+skew)]
    placement_at_liftoff = (1-offset_ratio)/f - gain*imperfection
    head_row = next(h for h in foundation['heads'] if h['id']==head)
    axial_low, axial_high = head_row["coherentExtreme_N_Cx_Cy_Vx_Vy"][0][:2]
    return {
        "centroidXY_mm": [cx, cy], "full_height_N_kN": full_n,
        "cut_N_kN": n, "retained_Pcr_kN": pcr,
        "axis_M_kNm": (abs(side_moment)+n*imperfection)*gain/1000,
        "biaxial_elastic_min_max_MPa": limits(0),
        "biaxial_5mm_elastic_min_max_MPa": limits(placement),
        "radial_setout_at_first_zero_mm": placement_at_liftoff,
        "pile_axis_minus_core_xy_mm": [a-b for a,b in zip(head_row["xy"],[cx,cy])],
        "separate_pile_N_range_kN": [axial_low, axial_high],
    }

trimmer = frame["long_trimmer"]
rr = trimmer["reaction_envelope"][1]
centre = next(r["xy"] for r in frame["actual_ground_receivers"] if r["id"]=="stair-midpost")
dx = trimmer["axis_x"]-centre[0]
assert dx == -25 and centre[1] == trimmer["y_supports"][1]
mid_beam = frame["stair"]["midlanding_beam"]["reactions"][1]
stair_height = frame["stair"]["post_end"]-crossings["P46"]["coreBaseZ_mm"]
results = {"P46": check_cut("P46", mid_beam+rr, stair_height, stair["Pcr"], 20, rr*dx)}
for head, which in (("P47", "south_reaction"), ("P24", "north_reaction")):
    results[head] = check_cut(head, wet["action"][which], pier["height"], pier["Pcr"], pier["e0"])

assert isclose(results["P46"]["full_height_N_kN"], stair["N"])
assert isclose(results["P24"]["full_height_N_kN"], pier["N"])
assert results["P47"]["full_height_N_kN"] < pier["N"]
for row in results.values():
    assert row["biaxial_elastic_min_max_MPa"][0] > 0
assert results["P46"]["biaxial_5mm_elastic_min_max_MPa"][0] < 0
assert all(results[head]["biaxial_5mm_elastic_min_max_MPa"][0] > 0 for head in ("P47", "P24"))
# For a centred SQUARE with unchanged resultant and offsets, incipient full
# contact occurs at b = 6*(abs(ex)+abs(ey)). This does not widen either core.
stair_cut = results["P46"]
gain = 1/(1-stair_cut["cut_N_kN"]/stair["Pcr"])
square_needed = 6*(gain*(abs(rr*dx)/stair_cut["cut_N_kN"] + 20*sqrt(2)) + placement*sqrt(2))
assert 276 < square_needed < 277
if __name__ == "__main__":
    print(json.dumps({"cutZ_mm": cut_z, "supports": results, "P46_minimum_square_mm": square_needed}, indent=2))
