"""Test a true-pane Study sash and the alternative room-side lift-out against the same arch."""
import argparse
import json
import math
from pathlib import Path

HERE = Path(__file__).resolve().parent
HAD = HERE.parents[1] / "had/studies/water-replan.json"


def grid(width, sill, impost, rows, bite, bar=40):
    columns = 3
    clear_w = (width - (columns - 1) * bar) / columns
    clear_h = (impost - bar / 2 - sill - (rows - 1) * bar) / rows
    w, h = clear_w + 2 * bite, clear_h + 2 * bite
    return {"count": columns * rows, "visible": [clear_w, clear_h], "unit": [w, h],
            "under400Both": max(w, h) < 400, "perimeterM": 2 * (w + h) * columns * rows / 1000}


def window():
    model = json.loads(HAD.read_text())["model"]
    opening = next(o for o in model["archOpeningRegister"]["GROUND"]
                   if (o["wall"], o["id"]) == ("outer-south", "south-window-0"))
    w, sill, spring, crown = (opening[k] for k in ("width", "sill", "spring", "head"))
    assert (opening["centre"], opening["leaves"], w, sill, spring, crown) == (1800, 1, 1000, 750, 2550, 2850)
    finish = model["finishRewind"]["dry"]["total"]
    inset, face, bar, bite, gap, impost = finish + 8, 60, 40, 15, 3, 2440
    rise = crown - spring
    radius = ((w / 2)**2 + rise**2) / (2 * rise)
    centre_z = crown - radius
    clear_w, clear_sill = w - 2 * (inset + face), sill + inset + face
    clear_r = radius - inset - face
    full = grid(clear_w, clear_sill, impost, 4, bite)
    controls = {name: grid(clear_w, clear_sill, z, rows, b)
                for name, z, rows, b in (("springFour", spring, 4, 15), ("springFive", spring, 5, 15),
                                         ("lowerMinimumBite", impost, 4, 13))}
    max_impost = clear_sill + bar / 2 + 3 * bar + 4 * (400 - 2 * bite)
    assert full["under400Both"] and not controls["springFour"]["under400Both"] and controls["springFive"]["under400Both"]
    assert not grid(clear_w, clear_sill, max_impost, 4, bite)["under400Both"]
    assert max(full["unit"]) + 5 < 400 <= max(full["unit"]) + 7
    # Integral of the circular roof ordinate across the jambs above the top of the rail.
    half, fan_bottom = clear_w / 2, impost + bar / 2
    side_top = centre_z + math.sqrt(clear_r**2 - half**2)
    assert side_top > fan_bottom
    fan_m2 = (half * math.sqrt(clear_r**2 - half**2) + clear_r**2 * math.asin(half / clear_r)
              + 2 * half * (centre_z - fan_bottom)) / 1e6
    # Project-specific face-beaded monolithic head. Concentric circles, parallel jambs
    # and a horizontal rail give an exact translational pocket with the face fully removed.
    cut_half, cut_r, cut_bottom = half + bite, clear_r + bite, fan_bottom - bite
    pocket_half, pocket_r, pocket_bottom = cut_half + gap, cut_r + gap, cut_bottom - gap
    cut_m2 = (cut_half * math.sqrt(cut_r**2 - cut_half**2) + cut_r**2 * math.asin(cut_half / cut_r)
              + 2 * cut_half * (centre_z - cut_bottom)) / 1e6
    assert min(pocket_half-cut_half, pocket_r-cut_r, cut_bottom-pocket_bottom) == gap
    assert cut_half > half
    vig_m2 = full["count"] * math.prod(full["visible"]) / 1e6
    # Independent chord integration checks the closed form, including straight legs at each side.
    dx = 2 * half / 10000
    numerical = sum((centre_z + math.sqrt(clear_r**2 - (-half + (i+.5)*dx)**2) - fan_bottom)
                    * dx for i in range(10000)) / 1e6
    assert abs(numerical - fan_m2) < 1e-8
    q_head, q_body = 5.8 * fan_m2, 0.7 * vig_m2
    outside = [w - 2 * inset, crown - sill - 2 * inset]
    sec_radius = radius - inset
    desk_x, _, desk_w, _ = model["groundFurniture"]["study-desk"]
    frame_x = opening["centre"] - outside[0] / 2
    overlap = max(0, min(frame_x + outside[0], desk_x + desk_w) - max(frame_x, desk_x))
    assert outside == [930, 2030] and sec_radius > 300 and sec_radius < 750
    assert crown - inset - spring < 700 and overlap == 920
    return {"occurrence": "GROUND / outer-south / south-window-0", "opening": opening,
            "geometry": {"rawRadius": radius, "centreZ": centre_z, "dryFinish": finish, "inset": inset,
                         "nominal15LessFinish": 15-finish, "outside": outside, "face": face,
                         "clear": clear_w, "clearSill": clear_sill, "bar": bar, "impost": impost, "bite": bite,
                         "opposingRebateWeb": bar-2*(bite+gap), "fanlightClearSideTop": side_top},
            "lower12": full, "glassOnlyKgAtEpdAndTrialDensity": full["count"] * math.prod(full["unit"]) / 1e6 * 20 + cut_m2*10,
            "controls": controls, "impostStrictUpperBoundAt15": max_impost,
            "fanlight": {"cutWidth": 2*cut_half, "cutRadius": cut_r, "cutZ": [cut_bottom, centre_z+cut_r],
                         "cutAreaM2": cut_m2, "glassOnlyKgAt4mm2500KgM3": cut_m2*10,
                         "openPocketWidth": 2*pocket_half, "openPocketRadialAndLinearGap": gap,
                         "throughRetainedSightWidthDeficit": 2*(cut_half-half), "clearM2": fan_m2, "rectangularVisibleM2": vig_m2, "visibleShare": fan_m2/(vig_m2+fan_m2),
                         "centreOnlyWK": {"fanlight": q_head, "rectangles": q_body}, "fanlightShare": q_head/(q_body+q_head)},
            "secondary": {"outsideRadius": sec_radius, "frameMaximumWH": [1000, 2200], "minSashWH": [450, 700],
                          "springHeadGrossHeight": crown-inset-spring, "upperSashLowerEdgeMaximum": crown-inset-700,
                          "frameDeskXOverlap": overlap, "deskXYWH": model["groundFurniture"]["study-desk"]}}


def drawing(data):
    g, o = data["geometry"], data["opening"]
    scale, left, bottom = .235, 265, 570
    def xy(x, z):
        return (left + x*scale, bottom - (z-o["sill"])*scale)

    def arch(inset, fill, stroke):
        x, r = o["width"]/2-inset, g["rawRadius"]-inset
        z = g["centreZ"] + math.sqrt(r*r-x*x)
        a, b = xy(-x, o["sill"]+inset), xy(x, o["sill"]+inset)
        c, d = xy(-x, z), xy(x, z)
        return (f'<path d="M{a[0]:.2f} {a[1]:.2f} L{c[0]:.2f} {c[1]:.2f} '
                f'A{r*scale:.2f} {r*scale:.2f} 0 0 1 {d[0]:.2f} {d[1]:.2f} '
                f'L{b[0]:.2f} {b[1]:.2f} Z" fill="{fill}" stroke="{stroke}"/>')

    def rect(x, lo, w, h, fill):
        px, py = xy(x, lo+h)
        return f'<rect x="{px:.2f}" y="{py:.2f}" width="{w*scale:.2f}" height="{h*scale:.2f}" fill="{fill}"/>'

    def label(x, y, content, size=15, colour="#233e49"):
        return f'<text x="{x}" y="{y}" font-size="{size}" fill="{colour}">{content}</text>'

    w, h = data["lower12"]["visible"]
    elements = ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1010 645" font-family="Arial,sans-serif">',
                '<rect width="1010" height="645" fill="#faf8f0"/>',
                label(32,39,"Study south window  /  one arched leaf, two glass make-ups",25),
                label(32,65,"Lower the real transom 110 mm below the masonry spring. Keep the curved light separately bedded.",16),
                arch(0,"#ded4c2","#95836c"),arch(g["inset"],"#6a766d","#4e5f54"),
                arch(g["inset"]+g["face"],"#f2cd8f","#697a72"),
                rect(-g["clear"]/2,g["clearSill"],g["clear"],g["impost"]+g["bar"]/2-g["clearSill"],"#6a766d")]
    for col in range(3):
        for row in range(4):
            elements.append(rect(-g["clear"]/2+col*(w+g["bar"]),g["clearSill"]+row*(h+g["bar"]),w,h,"#a9d0cf"))
    for z, name in [(o["head"],"crown +2850"),(o["spring"],"spring +2550"),(g["impost"],"rail +2440"),
                    (g["clearSill"],"glass +845"),(o["sill"],"sill +750")]:
        _, y = xy(0,z)
        x0 = 265 if z==o["head"] else 147
        elements.extend([f'<path d="M135 {y:.2f}H{x0}" stroke="#52646b" stroke-dasharray="3 3"/>',
                         label(32,round(y+5,2),name,13)])
    notes=[(112,"12 rectangular vacuum units",22),(145,"Three columns, four rows, with real 40 mm bars.",16),
           (171,"Each unit 273.33 × 393.75 mm at 15 mm bite.",16),
           (197,"Raise the transom to the spring and height becomes 421.25 mm.",16),
           (244,"1 shaped monolithic light",22),(276,"14.8% of clear glass area, 59.0% of centre-only conductance.",16),
           (302,"The shaped pane needs its own supports and replacement access.",16),
           (350,"A stock room-side lift-out",22),(382,"The complete outline is inside S45 size and radius limits.",16),
           (408,"The spring fanlight has 265 mm gross height for a 700 mm",16),
           (433,"minimum sash. Factory gasket and perimeter bedding also fail",16),
           (458,"the default material requirement.",16),
           (506,"40 mm true bar",22),(538,"15 mm bite + 3 mm edge space on each side leave 4 mm",16),
           (563,"between rebate roots. Strength and retention need a real section.",16)]
    elements.extend(label(435,y,t,n) for y,t,n in notes)
    elements.extend([label(32,617,"Architectural comparison in mm. Substrates, joints, independent capture, complete heat loss and weather testing remain open.",14),
                     '</svg>'])
    return "\n".join(elements)+"\n"


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    data = window()
    for suffix, content in [("json", json.dumps(data, indent=2) + "\n"), ("svg", drawing(data))]:
        output = HERE / f"study-window-glazing.{suffix}"
        if args.check:
            assert content == output.read_text(), f"Study glazing {suffix} changed"
        else:
            output.write_text(content)
    print("Study glazing: lower 12-light split, spring controls, shaped head and lift-out checked.")
