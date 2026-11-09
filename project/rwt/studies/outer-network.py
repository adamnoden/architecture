"""Finite network comparison. Run from the repository root. Lengths mm, rates L/s."""
from math import isclose, pi
from pathlib import Path
import json


def read(name):
    return json.loads(Path("project", name).read_text())


def overlap(a, b):
    x, y, w, h = a
    bx, by, bw, bh = b
    return max(0, min(x+w, bx+bw) - max(x, bx)), max(0, min(y+h, by+bh) - max(y, by))


roof = read("mat/studies/ring-roof-family.json")
house = read("had/studies/water-replan.json")["model"]
service = read("rwt/studies/court-service-selection.json")
structure = read("str/studies/house-corner-rewind.json")["changes"]
loads = roof["catchment"]
outer, _, ridge = [mm/1000 for mm in loads["outerCourtRidgeSides"]]
sky = loads["revisedCourt"]["openSide"]/1000
rain = read("rwt/studies/selected-water-event.json")["duty"]["syntheticRainfallMmPerHour"]/3600
shell = house["shell"]
half_run = (outer-ridge)/2
one_outer = (outer**2 - ridge**2)/4
half_network = 2*one_outer*rain
inner = (ridge**2 - sky**2)*rain
direct = sky**2*rain
assert isclose(2*half_network + inner + direct, outer**2*rain)
assert isclose(inner+direct, service["windows"]["cases"][0]["q"])
print(f"At {rain*3600:g} mm/h: outer face {one_outer:.6f} m², {rain*one_outer:.6f} L/s. "
      f"Each N/S outlet {half_network:.6f}. Inner roof {inner:.5f}, court {direct:.5f}.")


def strip_area(x):
    """Outer trapezoid area left of x, measured from the building origin."""
    t = min(outer, max(0, x/1000 + (outer-shell/1000)/2))
    if t < half_run:
        return t*t/2
    if t > outer-half_run:
        return one_outer-(outer-t)**2/2
    return half_run*(t-half_run/2)


# Keep the original and proposed house service positions in the comparison.
# The selected wet-weather housing can be wider than its circular wall bore.
structural_ports = read("had/studies/current-house-services.json")["structuralServiceReview"]
weather_faces = [
    (head["wall"], hole["point"], hole["faceWidth"]/2)
    for head in structural_ports["fixedHeads"] for hole in head["holes"]
]
for old in structural_ports["ports"]:
    replacement = old["replacement"]
    if replacement:
        weather_faces.append((replacement["wall"], replacement["point"], replacement["face"][0]/2))
    else:
        weather_faces.append((old["wall"], old["point"], old["radius"]))


def facade_clearance(face, station):
    wall = "outer-" + face
    limits = [station, shell-station]
    for level, openings in house["openings"].items():
        for o in openings:
            if o["wall"] != wall:
                continue
            centres = [o["centre"]] + [change["new"] for change in structure
                                       if (change["level"], change["id"]) == (level, o["id"])]
            limits.extend(abs(station-c)-o["width"]/2-215 for c in centres)
    for port in house["exteriorPortGeometry"]:
        if port["wall"] == wall:
            limits.append(abs(station-port["p"][0])-port["r"])
    limits.extend(abs(station-point[0])-half_width for side, point, half_width in weather_faces if side == wall)
    return min(limits)-120  # 240 wide installation and removal corridor


def separated(a, b):
    width, depth = overlap(a, b)
    return width == 0 or depth == 0


# Bounding boxes are exclusion tests for a proposed 400-wide surface channel.
# Existing front ramp controls include guards. The N/E basins remain separate.
ground = house["gardenFailureBypass"]
exclusions = [*ground["groundPathEnvelope"], ground["usableGarden"]["plan"],
              ground["frontApproach"]["footprint"]]
for b in service["ground"]["basins"]:
    exclusions.append(b["bounds"])
for obj in read("rwt/studies/over-roof-site-envelope.json")["primitives"]:
    if obj.get("kind") == "scaffold-sole-board":
        x1,x2 = obj["x"]
        y1,y2 = obj["y"]
        exclusions.append([x1,y1,x2-x1,y2-y1])


eave = roof["families"][-1]["outerReceiver"]
p_bed, p_front, p_back = eave["gutterBottomFrontBack"]
assert eave["newPrimarySecondaryZ"][1] > p_back
assert eave["newSecondaryAboveRaisedBack"] < 0
print("Station: west/east flow, arm lengths, invert step, clear service envelope")
stations = [
        ("north", "normal", 9025, 270), ("south", "normal", 11150, 270),
        ("north", "relief", 11750, 397.5), ("south", "relief", 11750, 397.5)]
for face, name, station, radius in stations:
    west = (one_outer/2+strip_area(station))*rain
    east = half_network-west
    west_arm = shell/2 + station + 2*radius
    east_arm = shell/2 + shell-station + 2*radius
    gap = facade_clearance(face, station)
    assert gap > 0 and east > 0 and west > 0
    offset = 900 if name == "normal" else 0
    lane = [station-200, shell+offset if face == "north" else -3250, 400, 3250-offset]
    assert all(separated(lane, rect) for rect in exclusions), (face, station, lane)
    print(face, name, station, f"{west:.5f}/{east:.5f} L/s, "
          f"{west_arm/1000:.4f}/{east_arm/1000:.4f} m, "
          f"{abs(west_arm-east_arm)/200:.2f} mm, {gap:.1f} mm")


def normal_flow(width_mm, depth_mm, fall=0.004, roughness=0.020):
    # Straight, uniform, rectangular open channel; no inlet, turn, tail or freeboard credit.
    w, h = width_mm/1000, depth_mm/1000
    area = w*h
    return 1000*area*(area/(w+2*h))**(2/3)*fall**0.5/roughness


def overflow_head(width_mm):
    # Critical specific energy with one velocity head added, as in the east ground study.
    adverse = (width_mm-10)*0.75
    return 2000*((half_network/adverse)**2/9.81)**(1/3)


long_spill = overflow_head(1200)
short_spill = overflow_head(180)
# 1:200 crest over 1.2 m and opposing 5 mm set-out errors, all paid before splash.
reserve = p_back-p_front-long_spill-1200/200-10
assert short_spill > p_back-p_front and 0 < reserve < 5
assert normal_flow(100, 75) < half_network < normal_flow(100, 90)
print(f"Half-clear 200 mm trough: {normal_flow(100,75):.3f} L/s at 75 mm, "
      f"{normal_flow(100,90):.3f} at 90. Crest head {short_spill:.2f}/{long_spill:.2f} mm "
      f"for 180/1200, final reserve {reserve:.2f} mm.")
print(f"After 150 mm first drop and two 5 mm errors, spacing to lower rim at crown "
      f"{p_bed-150-6760-10:.2f} mm. Hardware hanging below spends this margin.")

intake = read("had/studies/receiver-selection.json")
# Reusing the service chamber as a permanent 450-square foot: two actual conflicts.
north_l = house["northNormalRoute"]["normal"]["crossIntake"]["containment"]["westBay"]["plan"]
chamber = intake["access"]["corner"]["N"]
w, h = chamber[2:]
def box_at(x, y):
    return [x-w/2, y-h/2, w, h]
nw = overlap(box_at(4500,7500), north_l)
ne = overlap(box_at(7500,7500), service["ground"]["ordinary"]["crewAccess"])
assert nw == (450,395) and ne == (50,75)
print("Four independent service-sized feet would cover NW intake / NE crew platform", nw, ne)
assert facade_clearance("north",9175) < 0  # fails the later structural opening shift
# An RWT-06 service chamber and its removal shoe are used in different states.
# Permanent equipment must fit in both states even when they never coincide.
shoe = service["handling"]["shoes"][-1]
gap = shoe[0] - (chamber[0] + chamber[2])
assert gap < w
print(f"Available N terminal bay between temporary chamber and renewal shoe: {gap:g} mm for a {w:g} mm box.")
print("No independent flow credit for two low legs reaching the same N site.")

# Trial southern connection. The tube is submerged at its destination.
rib = intake["services"]["guard"]
port_y = intake["composition"]["case"][1]
cross_y = rib["rib"][0][1]
axis_at_rib = -750 + (port_y-cross_y)*0.015
rib_underside = rib["axisZ"] - rib["sectionReservation"][1]/2
length_m = ((7500-5820)+(port_y-4500))/1000
velocity = (inner/1000)/(0.75*pi*0.150**2/4)
loss = 1000*(8 + 0.06*length_m/0.1125)*velocity**2/(2*9.81)
assert isclose(length_m,3.73) and isclose(rib_underside-axis_at_rib-100,104.75)
print(f"South trial: {length_m:.3f} m, rib clearance {rib_underside-axis_at_rib-100:.2f} mm, "
      f"head loss at full inner-roof flow {loss:.2f} mm. Four-foot connection unproved.")


if __name__ == "__main__":
    import argparse
    from network_figure import network_svg
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--svg", type=Path, help="write the candidate network diagram")
    parser.add_argument("--check-svg", type=Path, help="compare the committed diagram")
    args = parser.parse_args()
    plate = network_svg(house, service, outer*1000, ridge*1000, sky*1000, stations, half_network, inner+direct, read("mat/studies/plant-threshold.json")["dock"]["plan"])
    if args.svg:
        args.svg.write_text(plate)
    if args.check_svg:
        assert args.check_svg.read_text() == plate, "Network diagram is stale"
