"""Falsification and geometric reservations for the 300 BES comparison, in mm."""
from contextlib import redirect_stdout
from io import StringIO
import json
from math import dist, hypot, pi, tan
import runpy
import sys
from pathlib import Path

studies = Path(__file__).resolve().parent


def read(path):
    return json.loads((studies / path).read_text())


def distance_to_segment(point, a, b):
    vx, vy = b[0] - a[0], b[1] - a[1]
    px, py = point[0] - a[0], point[1] - a[1]
    t = max(0, min(1, (px * vx + py * vy) / (vx * vx + vy * vy)))
    return hypot(px - t * vx, py - t * vy)


def path_clearance(point, path, radius):
    return min(distance_to_segment(point, a, b) for a, b in zip(path, path[1:])) - radius


def rectangle_distance(point, bounds):
    x, y, width, depth = bounds
    return hypot(max(x-point[0], 0, point[0]-x-width), max(y-point[1], 0, point[1]-y-depth))


model = read("../../had/studies/water-replan.json")["model"]
plant = model["servicesInterface"]["plant"]
plant_case = read("east-water-plant.json")["plant"]
grid = read("../../str/studies/current-house-grid.json")
threshold = read("plant-threshold.json")
cylinder, buffer = plant["cylinder"], plant["buffer"]
centre = cylinder["replacementCentrePath"][0]
assert centre == [9860, 4250] and cylinder["handlingRadius"] == buffer["handlingRadius"] == 425
# Read the actual bridge trial through its existing non-writing verification path.
saved_args = sys.argv
try:
    sys.argv = [str(studies / "plant-inlet-route.py"), "--check"]
    with redirect_stdout(StringIO()):
        inlet = runpy.run_path(sys.argv[0])
finally:
    sys.argv = saved_args
upstream = inlet["upstream"]
shortest_upstream = dist(centre, upstream) - cylinder["handlingRadius"]
assert shortest_upstream > 821 and shortest_upstream > 600

# Trial outlet coordinates, not measured valve centres. Each D1 path drops.
temperature_relief = (10035, 4520, 1420)
expansion_relief = (10120, 4720, 1500)
manifold = (10035, 4580, 1360)
bend = (10035, 4800, 1140)  # virtual intersection of 45° and vertical tangents
tundish = (10035, 4800, 1100)
paths = [[valve, manifold, bend, tundish] for valve in (temperature_relief, expansion_relief)]
for path in paths:
    assert all(a[2] > b[2] for a, b in zip(path, path[1:]))
    assert all(dist(p[:2], centre) >= cylinder["body"][2]/2+7.5 for p in path)
# Both halves of the through run slope 1:1 due north. The branch vector is
# perpendicular in 3D, so these are achievable axes for a right-angle tee.
assert temperature_relief[0] == manifold[0] == bend[0]
assert temperature_relief[1]+temperature_relief[2] == manifold[1]+manifold[2] == bend[1]+bend[2]
assert manifold[1]-expansion_relief[1] == manifold[2]-expansion_relief[2]
assert tundish[:2] == bend[:2]
radius = 30  # trial centreline bend; actual part must fit straight, socket and removal budgets
takeoff = radius*tan(pi/8)
assert bend[2]-tundish[2]-takeoff > 27
arc_correction = 2*takeoff-radius*pi/4
d1 = [sum(dist(a, b) for a, b in zip(p, p[1:]))-arc_correction for p in paths]
between_valves = dist(temperature_relief, manifold)+dist(expansion_relief, manifold)
assert max(*d1, between_valves) < 600
# The D1 tubes separate from the stationary receiving assembly after cold drain.
# Only the Ø120 permanent tundish/support/drop reservation is credited in transport.
station = tundish[:2]
reserve = 60
cart_gaps = [path_clearance(station, u["replacementCentrePath"], u["handlingRadius"] + reserve)
             for u in (cylinder, buffer)]
riser_gap = rectangle_distance(station, plant["riser"]) - reserve
assert min(*cart_gaps, riser_gap) >= 25
for name in ("radRoutineBody", "radAfter150PullBody", "controlsBody", "bufferFrontServiceBody"):
    x, y, radius = plant_case["emitterJoin"][name]
    assert dist(station, (x, y)) - radius - reserve >= 25, name
operator = model["plantReferenceDoor"]
assert path_clearance(station, operator["operatorCentrePath"], operator["retainedBodyRadius"]+reserve) >= 25
assert rectangle_distance(station, cylinder["workingEast"]) >= reserve+25

# A dedicated Ø90 formed slab sleeve, independent of the occupied six-service riser.
sleeve_radius = 45
beam_gaps = []
for g in grid["girders"].values():
    low, high = g["extent"]
    a, b = ((g["datum"], low), (g["datum"], high)) if g["axis"] == "y" else ((low, g["datum"]), (high, g["datum"]))
    beam_gaps.append(distance_to_segment(station, a, b)-g["width"]/2-sleeve_radius)
for g in grid["crossBeams"].values():
    beam_gaps.append(distance_to_segment(station, g["a"], g["b"])-g["width"]/2-sleeve_radius)
for h in grid["heads"]:
    x, y = h["xy"]
    w, d = h["capXY"]
    assert rectangle_distance(station, (x-w/2, y-d/2, w, d)) > sleeve_radius
assert min(beam_gaps) == 240

# D2 falls continuously through an open/accessible undercroft. Millimetres.
# Candidate external riser and alternative southern basin are kept independent.
east_x, end_y, grade = 12450, 2500, threshold["dock"]["outsideGrade"]
assert grade == -1800
d2_start_z, below_slab_z, end_z = 1000, -900, grade-50
south_bend_y, terminal_x = 2600, 12350
run_e, run_s = east_x-station[0], station[1]-south_bend_y
dogleg = hypot(east_x-terminal_x, south_bend_y-end_y)
runs = (run_e, run_s, dogleg)
z_elbow = below_slab_z-sum(runs)/80
assert d2_start_z-below_slab_z >= 300 and z_elbow > end_z
foul_port = model["servicesInterface"]["eastFoulExit"]["path"][-1]
assert foul_port == [12000, 5625, 2616.875] and foul_port[2] > d2_start_z
lower_east = grid["girders"]["outer-E"]["z"][0]
assert lower_east-below_slab_z-reserve >= 210
external = [(east_x, station[1]), (east_x, south_bend_y), (terminal_x, end_y)]
route = [station, *external]
for h in grid["heads"]:
    assert path_clearance(h["xy"], route, h["shaftDiameter"]/2+reserve) >= 25
# All concrete head undersides are higher than the new run's crown.
assert min(h["capZ"][0] for h in grid["heads"]) - below_slab_z - reserve >= 90
rain = read("../../rwt/studies/forked-side-outlet.json")
basin, spill = rain["basin"], rain["spill"]
potable_x, potable_y, potable_r = 12250, 3150, 100  # matched plant-inlet-route proposal
assert path_clearance((potable_x, potable_y), route, potable_r+reserve) == 40
assert basin[0]-east_x-reserve == 40 and basin[1]-end_y-150 == 100
assert spill[0]-terminal_x-150 == 50
assert spill[1] < end_y < spill[1]+spill[3]
assert min(basin[0], spill[0])-max(x for x, _ in external)-reserve == 40
assert threshold["dock"]["plan"][2]-end_y-150 == 750
length = (d2_start_z-below_slab_z+sum(hypot(run, run/80) for run in runs)+z_elbow-end_z)/1000
# Approved Document G Table 3: maximum straight equivalent resistance, metres.
# Charge each of the four changes in direction as one full bend, including the 45° dogleg.
equivalent = {od: length + 4*per_bend for od, per_bend in ((22, .8), (28, 1), (35, 1.4))}
assert equivalent[22] > 9 and equivalent[28] < 18  # G1/2 comparator
assert equivalent[28] > 9 and equivalent[35] < 18  # G3/4 comparator
print(f"Fixed seat minimum {shortest_upstream:.1f}; D1 valve/tundish {d1[0]:.1f}/{d1[1]:.1f}; valve/valve {between_valves:.1f} mm")
print(f"Fixed body to carts {cart_gaps[0]:.1f}/{cart_gaps[1]:.1f}; riser {riser_gap:.1f}; sleeve-to-beam {min(beam_gaps):.1f} mm")
print(f"D2 length {length:.3f} m; equivalent lengths (22/28/35) " + "/".join(f"{value:.3f}" for value in equivalent.values()))
