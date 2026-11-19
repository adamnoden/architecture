"""Nominal Bette 5940 orientation/access comparison; standard-library, source-bound."""
from pathlib import Path
import hashlib
import html
import json
import math
import sys

ROOT = Path(__file__).resolve().parents[3]
OUT = Path(__file__).resolve().parent
INPUTS = ["project/ias/studies/bedroom4-connected-assembly.json",
          "project/had/studies/bedroom4-maintenance-study.json"]
raw = {p: (ROOT / p).read_bytes() for p in INPUTS}
ias, had = [json.loads(raw[p]) for p in INPUTS]
tray = ias["trays"]["NE"]
fixed = {b["id"]: b for b in had["fixed"]}
if any(tray[k] != fixed["NE shower"][k] for k in ("x", "y", "w", "h")):
    raise ValueError("IAS/HAD tray reservations differ: reconcile before comparing")
if (tray["w"], tray["h"]) != (1000, 1000):
    raise ValueError("This manufacturer comparison covers the nominal 1000-square 5940 only")
box, west_box = fixed["north waste boxing"], fixed["west waste boxing"]
stance = had["paths"]["trayServiceApproach"][-1]
route_name = "NE west-facing corner, enlarged north boxing"
matched_routes = [r for r in ias["routes"] if r["name"] == route_name]
if len(matched_routes) != 1:
    raise ValueError("Expected one exact IAS NE route: reconcile its identity before comparing")
old = matched_routes[0]["points"][0]
x, y, w, h = [tray[k] for k in ("x", "y", "w", "h")]
g, half, hole = 210, 500, 90
centres = {"W": [x + g, y + half], "N": [x + half, y + h - g],
           "E": [x + w - g, y + half], "S": [x + half, y + g]}
station = [x, centres["W"][1]]
distance = lambda a, b: math.hypot(a[0] - b[0], a[1] - b[1])
def nearest(p):
    return [max(box["x"], min(p[0], box["x"] + box["w"])),
            max(box["y"], min(p[1], box["y"] + box["h"]))]
def measures(p):
    q = nearest(p)
    return {"centre": p, "closest_north_box_point": q,
            "distance_to_north_box": round(distance(p, q), 3),
            "distance_to_had_stance": round(distance(p, stance), 3)}
cases = {k: measures(p) for k, p in centres.items()}
renewal = {"station": station, "stance_to_station": round(distance(stance, station), 3),
           "station_to_west_drain": round(distance(station, centres["W"]), 3),
           "stance_to_west_drain": cases["W"]["distance_to_had_stance"]}
source_url = "https://content.my-bette.com/produkt_downloads/BetteUltra-1000-mm-462223/BetteUltra-1000-700-25-mm-134290/DS-BetteUltra_1000_mm-DW_0082-IT.pdf"
record = {
    "scope": "Unadopted nominal-plan comparison in the prior IAS/HAD NE wet-room proposal; no STR-HOUSE hybrid",
    "units": "mm; Euclidean point distances in plan, not fitted routes or human reach",
    "source_sha256": {p: hashlib.sha256(b).hexdigest() for p, b in raw.items()},
    "manufacturer_evidence": {"article": "BetteUltra 5940", "document": "DS-BetteUltra_1000_mm-DW_0082-IT.pdf",
                              "url": source_url, "revision_date": None, "accessed": "2026-10-31",
                              "sha256": "8ace4d9321aa118e6e0561e87252dfadf78f5ce147fb4f594b1429337b8d1a33",
                              "nominal_plan": [1000, 1000], "G": g, "H": half, "drain_diameter": hole},
    "source_parsing": {"tray": "IAS trays.NE, checked against HAD fixed NE shower",
                       "boxing": "HAD fixed north/west waste boxing", "old_JT_centre": f"First point of the unique IAS route named {route_name}",
                       "stance": "Final HAD paths.trayServiceApproach point"},
    "finished_room_bounds": ias["clear"], "tray_reservation": tray,
    "north_box": box, "west_box": west_box, "had_stance": stance,
    "orientations": cases, "old_JT_comparison": measures(old), "west_face_enquiry": renewal,
    "assumptions": ["Rotate the base 5940 drain geometry within the retained nominal 1000-square tray reservation.",
                    "G=210 is from the nearest outer side; H=500 is midway along that side. Each orientation is a separate case.",
                    "The proposed west-face station is an authored point on the tray edge, not a panel or operator position.",
                    "Nearest-box distances use the closed gross plan rectangle, without component, wall or tool clearance.",
                    "The HAD stance has an earlier proxy approach witness; this study establishes no reach or manipulation."],
    "unresolved": ["Configured Upstand footprint and finished-wall accommodation", "Matched support, underside and waste assembly",
                   "Outlet direction, branch length, gradient and stack connection", "First release, tool access and whole-body extraction",
                   "Lining/seal reinstatement, tray carrying and actual human operation"],
}

parts = ['<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297" font-family="Arial,sans-serif" fill="#203c42">',
         '<title>Enamelled tray: four nominal drain orientations in the unadopted IAS/HAD north-east tray reservation</title>',
         '<desc>Source-bound plan and Euclidean distances. Support, waste installation, Upstand fit, human reach and carrying remain unresolved.</desc>']
def rect(a, b, c, d, fill, stroke="none", sw=.35):
    parts.append(f'<rect x="{a}" y="{b}" width="{c}" height="{d}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/>')
def text(a, b, value, size=3.3, fill="#203c42", weight="normal", anchor="start"):
    parts.append(f'<text x="{a}" y="{b}" font-size="{size}" fill="{fill}" font-weight="{weight}" text-anchor="{anchor}">{html.escape(str(value))}</text>')
def line(a, b, c, d, color="#94a5a4", dash="", sw=.45):
    parts.append(f'<path d="M{a},{b} L{c},{d}" stroke="{color}" stroke-width="{sw}" fill="none" stroke-dasharray="{dash}"/>')
def circle(a, b, r, fill, stroke="#316b70", sw=.45):
    parts.append(f'<circle cx="{a}" cy="{b}" r="{r}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/>')
def pt(p):
    return 18 + (p[0] - ias["clear"]["west"]) / 10, 67 + (ias["clear"]["north"] - p[1]) / 10
def plan_box(b, fill, stroke="#667f80"):
    a, v = pt([b["x"], b["y"] + b["h"]]); rect(a, v, b["w"] / 10, b["h"] / 10, fill, stroke)
def segment(p, q, color, dash=""):
    line(*pt(p), *pt(q), color, dash)
fmt = lambda v: f"{v:g}"
rect(0, 0, 420, 297, "#fbfaf6")
rect(0, 0, 420, 3, "#285e64")
text(18, 20, "Enamelled tray · access geometry", 7.5, weight="bold")
text(18, 30, "Bette 5940 / prior IAS–HAD north-east wet-room proposal", 4.1)
text(402, 18, "MAT · 31 OCT 2026", 3.1, anchor="end")
rect(18, 37, 384, 9, "#e6eeeb")
text(22, 43, "Unadopted plan comparison. Support, water boundary, fitted waste and renewal remain unselected.", 3.4)
text(18, 56, "01  Retained nominal plan", 4.1, weight="bold")
text(213, 56, "1:10 at A3", 3.1, anchor="end")
plan_box(west_box, "#ded5c5"); plan_box(box, "#ded5c5")
plan_box(tray, "#e5efed", "#376d70")
text(40, 77, "North boxing", 3.5, weight="bold")
text(40, 83, "757.5 × 250 gross", 3.1)
text(18, 202, "West boxing: 150 gross", 3.1)
text(158.75, 179, "1000 × 1000 nominal tray reservation", 3.2, anchor="middle")
line(217, 82, 217, 67, "#285e64"); line(217, 67, 215, 71, "#285e64"); line(217, 67, 219, 71, "#285e64")
text(217, 63, "N", 3.3, anchor="middle")
for k, p in centres.items():
    a, b = pt(p); circle(a, b, hole / 20, "#c0dcd7" if k == "W" else "#fbfaf6")
    circle(a, b, .65, "#285e64"); text(a + 6, b + 1.2, k, 3.5, weight="bold")
a, b = pt(old); line(a - 2, b - 2, a + 2, b + 2, "#8b6654", sw=.65); line(a - 2, b + 2, a + 2, b - 2, "#8b6654", sw=.65)
text(a - 1, b - 4, "JT reference", 2.9, "#8b6654")
segment(centres["W"], nearest(centres["W"]), "#7d9292", "1.1 1.1")
segment(stance, station, "#b68031", "1.5 1.2"); segment(station, centres["W"], "#316b70", "1.5 1.2")
a, b = pt(stance); circle(a, b, 2, "#d9ad62", "#a77731")
text(40, 145, "HAD stance", 3.4, weight="bold"); text(40, 151, "950 / 10200", 3.1)
a, b = pt(station); rect(a - 1.5, b - 1.5, 3, 3, "#316b70")
text(69, 102, "West-face station", 3.2, weight="bold"); text(69, 107, "Design direction only", 2.9)
line(99, 109, a - 2, b - 2, "#316b70")
text(18, 215, "Four alternative Ø90 centres; one orientation per installation.", 3.1)
text(18, 221, "Dotted segments compare points. They are not fitted pipe routes.", 3.1)

text(242, 56, "02  Distances in plan", 4.1, weight="bold")
text(242, 64, "Shortest point-to-box / direct point-to-stance", 3.2)
rect(242, 70, 160, 10, "#e6eeeb")
for xx, label in [(246, "Drain"), (263, "Centre x / y"), (332, "To box"), (372, "To stance")]:
    text(xx, 76.5, label, 3.1, weight="bold")
for i, (k, row) in enumerate(cases.items()):
    yy = 89 + i * 12
    if i % 2 == 0: rect(242, yy - 7, 160, 12, "#f0f2ee")
    text(247, yy, k, 3.5, weight="bold")
    text(263, yy, " / ".join(fmt(v) for v in row["centre"]), 3.2)
    text(347, yy, f'{row["distance_to_north_box"]:.1f}', 3.3, anchor="end")
    text(392, yy, f'{row["distance_to_had_stance"]:.1f}', 3.3, anchor="end")
text(242, 143, "Box: retained gross rectangle, including its boundary.", 3.0)
text(242, 149, f'Old JT centre: {record["old_JT_comparison"]["distance_to_north_box"]:.1f} to box; access geometry does not transfer.', 3.0)
text(242, 165, "03  West-face enquiry", 4.1, weight="bold")
text(242, 173, "Station: " + " / ".join(fmt(v) for v in station), 3.3)
for yy, label, value in [(182, "Stance → station", renewal["stance_to_station"]),
                         (190, "Station → west drain", renewal["station_to_west_drain"]),
                         (198, "Stance → west drain", renewal["stance_to_west_drain"])]:
    text(242, yy, label, 3.3); text(395, yy, f"{value:.1f}", 3.5, weight="bold", anchor="end")
text(242, 209, "The station locates an enquiry, not a reachable panel.", 3.0)
text(242, 215, "Support feet, trap, tools and hands still need real envelopes.", 3.0)
line(18, 231, 402, 231)
text(18, 241, "Renewal must be drawn as separate tasks", 3.9, weight="bold")
text(18, 250, "Top cleaning · whole waste release · local lining / seal release · support release · protected tray carrying.", 3.4)
text(18, 257, "Required joints and the water boundary must be reinstated. This plan supplies no removal sequence or physical section.", 3.2)
text(18, 271, "Evidence: Bette DW_0082-IT, undated; accessed 31 October 2026. Rotations and west-face station are authored comparisons.", 2.9)
text(18, 278, "Geometry: IAS connected-assembly and HAD maintenance JSON; source SHA256 fingerprints and exact coordinates in the companion record.", 2.9)
text(18, 285, "Configured Upstand footprint, finished wall sizes, support, trap, outlet route, actual reach and carrying remain unresolved.", 2.9)
parts.append("</svg>")
for suffix, body in [("json", json.dumps(record, indent=2, ensure_ascii=False) + "\n"), ("svg", "\n".join(parts) + "\n")]:
    target = OUT / f"enamelled-tray-access.{suffix}"
    if "--check" in sys.argv:
        if not target.exists() or target.read_text() != body: raise SystemExit(f"Stale study: {target}")
    else:
        target.write_text(body)
