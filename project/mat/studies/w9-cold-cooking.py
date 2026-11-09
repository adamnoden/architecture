"""Bound the W9 cooking mode at unchanged flow, including its actual kitchen."""
import json
import math
from pathlib import Path

here = Path(__file__).parent
def read(name):
    return json.loads((here / name).read_text())

house = read("../../had/studies/water-replan.json")["model"]
system = read("balanced-service-architecture.json")
network = read("w9-network-development.json")
leakage = read("whole-house-leakage-duty.json")
heat = system["nativeW9HeatContract"]
inside, outside = 20, -10
pre, post = heat["nativePreheaterW"], heat["nativePostheaterW"]
eta = 0.60
modes = {m["id"]: m for m in system["modes"]}
room_flow = next(m["kitchenSupplyLps"] for m in system["dedicatedKitchenSupplyModes"] if m["mode"] == "cooking")
room_w = system["retainedEmitterCapacityComparison"]["kitchenExisting45_40_20_W"]
for key, mode in modes.items():
    q = mode["totalBalancedSupplyLps"]
    c = 1.2*q
    preheated = outside + pre/c
    recovered = preheated + eta*(inside-preheated)
    maximum = recovered + post/c
    remaining = post-c*(16-recovered)
    assert (maximum >= 16) == (key == "continuous")
    print(f"{key}: {maximum:.3f} C upper comparison; reserve at 16 C {remaining:.1f} W")

q = modes["cooking"]["totalBalancedSupplyLps"]
c = 1.2*q
cold_out = outside + eta*(inside-outside)
max_flow = ((1-eta)*pre+post)/(1.2*(16-cold_out))
min_eta = 1-(inside-16+post/c)/(inside-outside-pre/c)
assert math.isclose(max_flow, 125) and max_flow < q and 0.60 < min_eta < 0.61
print(f"16 C cooking requires recovery {min_eta:.4%} or higher; max flow at 60% {max_flow:.1f} L/s")
for supply in (15, 16):
    post_needed = max(0,c*(supply-cold_out)-(1-eta)*pre)
    space = room_w - 1.2*room_flow*(inside-supply)
    print(f"{supply} C: {post_needed:.1f} W postheat; kitchen has {space:.2f} W for all other losses")
    assert (post_needed <= post) == (supply == 15)
# External postheat REPLACES the internal 900 W in this comparison.
needed = c*(16-cold_out) - (1-eta)*pre
for case in network["nativeCases"]:
    if case["flowSupplyExtractLps"] == [q,q]:
        print(f"Native 16 C gap {(needed-post)/c:.4f} K, equivalent to "
              f"{(needed-post)/case['fanPowerW'][0]:.1%} of supply fan input at "
              f"{case['pressureSupplyExtractPa'][0]} Pa; heat transfer is unverified.")
post_external = 1200
assert post < needed < post_external and c*(16-cold_out) > post_external
print(f"W9 replacement postheat: {post_external-needed:.1f} W reserve; minimum preheat "
      f"{(c*(16-cold_out)-post_external)/(1-eta):.1f} W")
vtc = system["conventionalLowerMassAlternative"]
unequal = next(r for r in vtc["unequalStreamHeatComparison"]["cases"]
               if r["centralSupplyLps"]==144 and r["preheaterLeavingC"]==-5
               and r["smallerStreamRecoveryFraction"]==eta)
assert vtc["separateCaptureTopology"]["cooking"]["separateCaptureLps"] == room_flow
vtc_cap = unequal["postheatTo16W"]+unequal["native1670PostheatReserveW"]
vtc_c = 1.2*unequal["centralSupplyLps"]
assert vtc_cap==1670 and unequal["maximumSupplyWith1670PostheatC"]<15
print(f"VTC at 144/96 plus separate capture: {unequal['preheatW']:.0f} W external preheat "
      f"then {unequal['postheatTo16W']:.1f} W for 16 C; even 15 C lacks "
      f"{vtc_c*(15-unequal['maximumSupplyWith1670PostheatC']):.1f} W.")
# Reverse check for a bypassed core; even both electric elements cannot hold 15 C.
assert outside + (pre+post)/c < 15

x,y,w,h = house["rooms"]["kitchenDining"]["bounds"]
assert x+w == y+h == house["shell"]-house["envelope"]
west = next(row for row in house["groundWalls"] if row["id"]=="loggia-east-weather")
assert west["finishedFaces"][1] == x
windows = [a for a in house["openings"]["GROUND"] if a["kind"]=="window"
           and ((a["wall"]=="outer-north" and x<=a["centre"]<=x+w) or
                (a["wall"]=="outer-east" and y<=a["centre"]<=y+h))]
assert len(windows)==3
opening_area = 0
for a in windows:
    width = a["width"]/1000
    rise = (a["head"]-a["spring"])/1000
    radius = ((width/2)**2+rise**2)/(2*rise)
    angle = 2*math.asin(width/(2*radius))
    opening_area += width*(a["spring"]-a["sill"])/1000 + radius**2*(angle-math.sin(angle))/2
wall_area = (w+2*h)/1000 * (house["sections"]["firstFFL"]-house["sections"]["groundFFL"])/1000
floor = w*h/1e6
plane = .26*(wall_area-opening_area) + 1.6*opening_area + .18*floor
# Fully expose three wall faces and the floor. Leave the south boundary and
# every bridge, reveal and air bypass visible against the residual budget.
area = wall_area+floor
p = leakage["proposedDevelopment"]
loss = next(r for r in p["pressureChallenges"] if r["uniformPressure_Pa"]==4 and r["exponent"]==.65)
air = loss["heatLoss_W_per_K"]*area/leakage["geometry"]["referenceEnvelope_m2"]
remaining = room_w - 1.2*room_flow*(inside-15) - (plane+air)*(inside-outside)
south_cold = .26*w/1000 * (house["sections"]["firstFFL"]/1000) * (inside-outside)
assert math.isclose(opening_area, 4.8363, abs_tol=.0001)
assert math.isclose(remaining, 68.4, abs_tol=.1) and remaining < south_cold
print(f"Three arches {opening_area:.3f} m2, plane {plane*30:.1f} W, "
      f"allocated uniform leakage {air*30:.1f} W; all other losses at 15 C <= {remaining:.1f} W")
# Normalise the catalogue exponent to the lower, retained 45/40 output.
body = next(r for r in read("whole-house-service-baseline.json")["heat"]["emitterSchedule"]
            if r["id"]=="kitchen-E")
gain = room_w*((23.5/22.5)**body["nCoefficient"]-1)
assert gain > 1.2*room_flow and gain+remaining > south_cold
print(f"Same emitter at 46/41: {gain:.1f} W extra; full cold south sensitivity "
      f"then leaves {remaining+gain-south_cold:.1f} W at 15 C supply.")
# Intersect the same cooking flow with an independently specified +50 Pa
# dirty filter increment only if it is additional to the selected OEM datum.
for trial in network["pressureBudgetComparators"]:
    p = trial["nativeTrialPressurePa"]
    low,high = trial["afterOneUniformFlowSilencerVisualReadPa"]
    assert (high-50>0) == (p==300)
    print(f"{p} Pa cooking: {low-50:.1f}..{high-50:.1f} Pa for further extract losses")
for r in network["staticSupplyPropagation"]:
    target = 30 if r["flowLps"]==96 else 45
    per_path = target-10*math.log10(3)
    print(f"{r['flowLps']} L/s, {r['trialPressurePa']} Pa: silenced duct source to listening "
          f"position requires {r['staticOnlyResidualLwaDBA']-per_path:.1f} dB net level difference; "
          f"casing {r['unaffectedCasingLwaDBA']-per_path:.1f} dB")
