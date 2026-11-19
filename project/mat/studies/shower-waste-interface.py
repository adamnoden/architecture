"""Source-bound waste-interface constraints; no installed assembly or fit result."""
from pathlib import Path
import hashlib
import html
import json
import sys

ROOT = Path(__file__).resolve().parents[3]
OUT = Path(__file__).resolve().parent
INPUTS = ["project/mat/studies/enamelled-tray-access.json",
          "project/ias/studies/bedroom4-connected-assembly.json",
          "project/had/studies/bedroom4-maintenance-study.json"]
raw = {p: (ROOT / p).read_bytes() for p in INPUTS}
hashes = {p: hashlib.sha256(b).hexdigest() for p, b in raw.items()}
mat, ias, had = [json.loads(raw[p]) for p in INPUTS]
for p in INPUTS[1:]:
    if mat["source_sha256"].get(p) != hashes[p]:
        raise SystemExit("Retained MAT plan has stale source binding: " + p)
fixed = {b["id"]: b for b in had["fixed"]}
tray, north, west = mat["tray_reservation"], mat["north_box"], mat["west_box"]
for source in (ias["trays"]["NE"], fixed["NE shower"]):
    if any(tray[k] != source[k] for k in ("x", "y", "w", "h")):
        raise SystemExit("IAS/HAD/MAT tray occurrences differ")
if north != fixed["north waste boxing"] or west != fixed["west waste boxing"]:
    raise SystemExit("IAS/HAD/MAT boxing must be reconciled")
evidence = mat["manufacturer_evidence"]
if evidence["article"] != "BetteUltra 5940" or (tray["w"], tray["h"]) != (1000, 1000):
    raise SystemExit("This comparison is limited to the retained nominal 5940 square")
if ias["clear"] != mat["finished_room_bounds"]:
    raise SystemExit("The finished room datums differ")
if west["w"] != ias["boxing"]["westWidth"] or north["h"] != ias["boxing"]["northDepth"]:
    raise SystemExit("IAS and HAD boxing depths differ")
face, drain = mat["west_face_enquiry"]["station"], mat["orientations"]["W"]["centre"]
if face != [tray["x"], drain[1]] or drain != [tray["x"] + evidence["G"], tray["y"] + evidence["H"]]:
    raise SystemExit("Expected the source-bound west orientation and face station")
if north["x"] != west["x"] + west["w"] or north["x"] + north["w"] != face[0]:
    raise SystemExit("The assumed exterior pocket no longer meets the retained boxes")
tecom = {"article": "PDOTT90", "document_page": 1, "printed_revision": None,
         "url": "https://www.tecnomat.it/pub/media/catalog/product/7/c/4/4/piletta_doccia_tecom_low_round_o_mm_h_mm_scarico_o_mm_portata_l_min_in_ottone_25060591_techsheetsup.pdf",
         "retrieved_sha256": "aa8a4f421168e6fd558948c7e106f2bee2214351c1d9f24d66abe8f60a1b1fb3",
         "accessed": "2026-10-31", "centre_to_brass_outlet_end_mm": 167,
         "boundary": "Manufacturer-branded sheet, retailer-hosted; no matched tray seat or installed connector"}
outlet = [drain[0] - tecom["centre_to_brass_outlet_end_mm"], drain[1]]
x_box, x_face, x_outlet = west["x"] + west["w"], face[0], outlet[0]
y_axis, y_north = drain[1], north["y"]
if not (x_box < x_face < x_outlet < drain[0] and tray["y"] < y_axis < y_north):
    raise SystemExit("The west-facing comparison topology changed; reappraise it")
pocket, installed, release = x_face - x_box, x_outlet - x_face, x_outlet - x_box
north_budget = y_north - y_axis
fmt = lambda n: f"{n:g}"
record = {
    "scope": "Services-only necessary conditions in the unadopted IAS/HAD NE tray occurrence; no geometry adoption",
    "units": "mm; axis-aligned plan envelopes, not a three-dimensional fit or release proof",
    "source_sha256": hashes,
    "source_parsing": {"tray_drain_face": "Retained MAT plan, checked against its IAS/HAD sources",
                       "boxes": "HAD fixed north/west waste boxing, checked against MAT",
                       "floor": "IAS wetFFL/deckTop; contextual only, not a new installed support datum"},
    "manufacturer_evidence": {"tray": evidence, "conditional_waste": tecom},
    "datums": {"drain": drain, "conditional_brass_outlet_end": outlet, "west_face_station": face,
               "west_obstruction_x": x_box, "north_obstruction_y": y_north,
               "wet_ffl_z": ias["wetFFL"], "deck_top_z": ias["deckTop"]},
    "retained_geometry": {"tray": tray, "north_box": north, "west_box": west},
    "bounds": {"closed_face_projection_budget": installed, "open_face_west_motion_budget": release,
               "exterior_parking_x_budget": pocket, "north_half_sweep_budget": north_budget,
               "symmetric_centred_sweep_budget_before_margins": 2 * north_budget,
               "conservative_pocket": [x_box, tray["y"], x_face, y_north]},
    "parameters": {"p": "Installed west extent from x_outlet of the specific part being modelled",
                   "r": "West translation of that same part; actual joint-required stroke unknown",
                   "cF": "Closed-face clearance", "cW": "West-obstruction clearance",
                   "cE": "Clearance east of the parked body", "cN": "North-obstruction clearance",
                   "Lx": "Complete released body's actual x length, including retained projections",
                   "W": "Symmetric swept y width about the retained drain centreline"},
    "parameter_domain": "Lengths and clearances are nonnegative; no product or margin values are selected",
    "necessary_conditions": {"closed_face": "p + cF <= closed_face_projection_budget",
                             "face_removed_west_translation": "p + r + cW <= open_face_west_motion_budget",
                             "whole_body_parking": "Lx + cW + cE <= exterior_parking_x_budget",
                             "centred_straight_west_sweep": "W + 2*cN <= symmetric_centred_sweep_budget_before_margins",
                             "face_crossing": "Actual crossing swept envelope plus margins must fit the actual clear aperture"},
    "assumptions": ["Tecom geometry is conditional on a future matched seat and direct west orientation.",
                    "The closed fascia has no assumed pipe penetration; it is removed before the release comparison.",
                    "The release inequality tracks the westernmost point of one rigidly translating part only.",
                    "North/west box footprints are exclusion regions over the motion being compared; height bypass is unproved.",
                    "The centred sweep limit is not a maximum fascia-opening width; offset/rotating paths need new geometry.",
                    "Exterior parking is separate from joint release and passage past the retained supports.",
                    "Keep the tray, frame and every required support fixed during ordinary waste renewal."],
    "unbound_inputs": {k: None for k in ["matched_seat", "installed_connector", "connector_projection",
                      "joint_release_motion", "body_envelope", "clear_aperture", "tool_sweep",
                      "bearing_z", "rim_z", "waste_seat_z", "body_bottom_z", "outlet_z",
                      "rail_envelope", "foot_and_additional_support_envelopes"]},
    "result": "Constraint budgets only; no installed, material, hydraulic, structural, access or renewal pass",
}

parts = ['<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297" font-family="Arial,sans-serif" fill="#203c42">',
         '<title>Shower waste interface: closed-face packing and face-open movement budgets</title>',
         '<desc>Unadopted source-bound plan. No selected connector, sized opening, installed vertical assembly or three-dimensional fit.</desc>']
def rect(x, y, w, h, fill, stroke="none", dash=""):
    parts.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{fill}" stroke="{stroke}" stroke-width=".4" stroke-dasharray="{dash}"/>')
def line(x, y, xx, yy, color="#6e8585", dash="", width=.45):
    parts.append(f'<path d="M{x},{y} L{xx},{yy}" fill="none" stroke="{color}" stroke-width="{width}" stroke-dasharray="{dash}"/>')
def text(x, y, value, size=3.2, weight="normal", anchor="start", color="#203c42"):
    parts.append(f'<text x="{x}" y="{y}" font-size="{size}" font-weight="{weight}" text-anchor="{anchor}" fill="{color}">{html.escape(str(value))}</text>')
def point(x, y, r=1.2, fill="#285e64"):
    parts.append(f'<circle cx="{x}" cy="{y}" r="{r}" fill="{fill}" stroke="#285e64" stroke-width=".4"/>')
def pt(x, y):
    return 18 + (x - ias["clear"]["west"]) / 10, 70 + (ias["clear"]["north"] - y) / 10
def plan_box(b, fill, stroke="#6e8585"):
    x, y = pt(b["x"], b["y"] + b["h"])
    rect(x, y, b["w"] / 10, b["h"] / 10, fill, stroke)

rect(0, 0, 420, 297, "#fbfaf6"); rect(0, 0, 420, 3, "#285e64")
text(18, 19, "Shower waste · interface budgets", 7.5, "bold")
text(18, 29, "Retained north-east tray occurrence / conditional west-facing Tecom PDOTT90", 3.8)
text(402, 18, "MAT · 31 OCT 2026", 3, anchor="end")
rect(18, 36, 384, 10, "#e6eeeb")
text(22, 42.8, "Necessary conditions only. No adopted opening, installed assembly or fit result.", 3.5)
text(18, 57, "01  Retained plan and exterior pocket", 4.1, "bold")
text(218, 64, "1:10 at A3", 3, anchor="end")
px, py = pt(x_box, y_north)
rect(px, py, pocket / 10, (y_north - tray["y"]) / 10, "#f4ead6", "#b68031", "1.5 1")
plan_box(west, "#ded5c5"); plan_box(north, "#ded5c5"); plan_box(tray, "#e5efed", "#376d70")
text(56, 80, "North boxing", 3.4, "bold")
text(56, 87, "South edge y" + fmt(y_north), 2.9)
text(158.75, 163, "1000 × 1000 nominal tray", 3.2, anchor="middle")
text(158.75, 168, "No support or waste body drawn", 2.8, anchor="middle")
ax, ay = pt(x_box, y_axis); fx, fy = pt(*face); ox, oy = pt(*outlet); dx, dy = pt(*drain)
line(ax, ay, dx, dy, "#285e64", "1.5 1")
text(42, 111, "Sweep axis y" + fmt(y_axis), 3.1)
point(dx, dy, evidence["drain_diameter"] / 20, "#fbfaf6"); point(dx, dy, .7)
point(ox, oy); point(fx, fy, 1, "#fbfaf6")
text(145, 110, "Drain x" + fmt(drain[0]), 3.2)
line(143, 112, dx + 4, dy - 2)
text(130, 143, "Conditional outlet x" + fmt(x_outlet), 3.1)
line(128, 139, ox + 1, oy + 2)
text(114, 151, "Face x" + fmt(x_face), 3.1)
line(112, 148, fx, fy + 3)
_, sweep_top = pt(x_face, y_axis + north_budget)
_, sweep_bottom = pt(x_face, y_axis - north_budget)
line(ax + 1, sweep_top, fx - 1, sweep_top, "#b68031", "1.5 1")
line(ax + 1, sweep_bottom, fx - 1, sweep_bottom, "#b68031", "1.5 1")
line(101, sweep_top, 101, sweep_bottom, "#b68031")
line(98, sweep_top, 104, sweep_top, "#b68031"); line(98, sweep_bottom, 104, sweep_bottom, "#b68031")
text(42, 133, "Centred sweep W", 3.1)
text(42, 140, "≤ " + fmt(2 * north_budget) + " before margins", 3.1)
text(42, 156, "Exterior parking pocket", 3.1, "bold")
line(ax, 181, fx, 181, "#b68031"); line(ax, 178, ax, 184, "#b68031"); line(fx, 178, fx, 184, "#b68031")
text((ax + fx) / 2, 189, fmt(pocket) + " in x", 3.5, "bold", "middle")
text(18, 206, "West exclusion plane x" + fmt(x_box) + "; boxes retained.", 3)
text(18, 213, "Dashed sweep limits do not size the fascia opening.", 3)

text(242, 57, "02  Separate the two connection states", 4.1, "bold")
text(242, 68, "Outlet end → face: " + fmt(installed), 3.5)
text(242, 75, "Outlet end → west obstruction: " + fmt(release), 3.5)
rect(242, 83, 160, 39, "#e6eeeb")
text(247, 93, "FACE CLOSED · installed envelope", 3.5, "bold")
text(247, 108, "p + cF ≤ " + fmt(installed) + " mm", 6.3, "bold")
text(247, 117, "p = installed west projection from the outlet end", 2.9)
rect(242, 131, 160, 47, "#f4ead6")
text(247, 141, "FACE REMOVED · west translation", 3.5, "bold")
text(247, 156, "p + r + cW ≤ " + fmt(release) + " mm", 6, "bold")
text(247, 166, "r moves the same part that defines p.", 3)
text(247, 173, "Available travel bound; actual joint release unproved.", 2.8)
text(242, 190, "Whole-body parking is independent:", 3.3, "bold")
text(242, 200, "Lx + cW + cE ≤ " + fmt(pocket) + " mm", 4.6, "bold")
text(242, 208, "Lx includes all retained body projections.", 3)
text(242, 214, "cF / cW / cE are separate clearances, not fixed values.", 2.8)
line(18, 222, 402, 222)
text(18, 233, "03  Clear opening and retained supports remain unbound", 4.1, "bold")
text(18, 243, "Clear width / height must contain the actual crossing swept envelope plus its margins.", 3.5)
text(18, 251, "Keep the tray, frame and every required support fixed. No rail length is used as an aperture dimension.", 3.3)
text(18, 259, "W + 2cN ≤ " + fmt(2 * north_budget) + " applies to the centred straight-west sweep against the north-box footprint only.", 3.2)
text(18, 271, "Sources: retained MAT plan and IAS/HAD JSON; Tecom PDOTT90 p1 (167 mm centre-to-brass-end). Dimensions in mm.", 2.8)
text(18, 279, "Seat, complete body, connector, tool motion and vertical support datums are unknown. No installed vertical assembly is drawn.", 2.8)
text(18, 287, "Reproduce: python project/mat/studies/shower-waste-interface.py --check · Source fingerprints and assumptions in companion JSON.", 2.7)
parts.append("</svg>")
for suffix, body in [("json", json.dumps(record, indent=2, ensure_ascii=False) + "\n"), ("svg", "\n".join(parts) + "\n")]:
    target = OUT / f"shower-waste-interface.{suffix}"
    if "--check" in sys.argv:
        if not target.exists() or target.read_text() != body:
            raise SystemExit("Stale study: " + str(target))
    else:
        target.write_text(body)
