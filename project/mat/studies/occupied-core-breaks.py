"""Compare three upper-core separations against the actual clipped MAT floor field."""
import argparse
import json
import runpy
from itertools import pairwise
from math import dist
from pathlib import Path

HERE = Path(__file__).resolve().parent
field = runpy.run_path(str(HERE / "ground-field-assembly.py"))


def read(name):
    return json.loads((HERE / name).read_text())


def edge_segments(core, mesh, flange):
    """Return open and obstructed parts of a flange, including its full projection."""
    x, y, w, h = core
    result = {}
    for face, axis, base, direction, start, end in (
        ("south", 0, y, -1, x, x+w), ("north", 0, y+h, 1, x, x+w),
        ("west", 1, x, -1, y, y+h), ("east", 1, x+w, 1, y, y+h),
    ):
        ticks = sorted({start, end, *(v for v in mesh[axis] if start < v < end)})
        far = base + direction * flange
        low, high = sorted((base, far))
        across = sorted({low, high, *(v for v in mesh[1-axis] if low < v < high)})
        segments = []
        for a, b in pairwise(ticks):
            along = (a+b)/2
            open_side = all(field["inside"](mesh, *((along, (p+q)/2) if axis == 0
                            else ((p+q)/2, along))) for p, q in pairwise(across))
            if segments and segments[-1][2] == open_side:
                segments[-1][1] = b
            else:
                segments.append([a, b, open_side])
        result[face] = segments
    return result


def field_edge_length(edges):
    return sum(b-a for parts in edges.values() for a, b, available in parts if available)


def compare():
    house = read("../../had/studies/water-replan.json")["model"]
    piers = read("floor-pour-boundary.results.json")["directShaftCorePaths"]
    floor = read("ground-field-assembly.results.json")
    pan = read("current-ground-pier-boundary.json")["fullPanChallenger"]
    assert pan["z"] == [-80, -79] and house["northNormalRoute"]["floorJoin"]["innerDpc"] == [-180, -30]
    assert [p["shaft"] for p in piers] == ["P46", "P47", "P24"]
    walls = {row["id"]: row for row in house["groundWalls"]}
    assert set(walls) == {row["id"] for row in floor["wallBaseRegister"]}
    finished_mesh = field["BASE"]["field_topology"](house)[1]
    # Preserve the original finished-face exclusions and add the mineral base's own footprint.
    dpc_walls = [{**walls[r["id"]], "id": "mineral-base-" + r["id"],
                  "finishedFaces": r["proposedDpcFaces"]} for r in floor["wallBaseRegister"]]
    widened = {**house, "groundWalls": list(walls.values()) + dpc_walls}
    wide_mesh = field["BASE"]["field_topology"](widened)[1]
    out = {}
    for pier in piers:
        core = pier["coreXYWH_mm"]
        x, y, w, h = core
        perimeter = 2*(w+h)
        edges = edge_segments(core, wide_mesh, 30)
        out[pier["shaft"]] = {
            "core": core, "shaft": pier["axisXY_mm"], "perimeter": perimeter,
            "roomAtFinishedFaces": field_edge_length(edge_segments(core, finished_mesh, .01)),
            "roomAtMineralFaces": field_edge_length(edge_segments(core, wide_mesh, .01)),
            "roomFlange30": field_edge_length(edges), "edges": edges,
            "plate12kg": w*h*12*7900/1e9,
        }
    assert [r["roomAtFinishedFaces"] for r in out.values()] == [692, 878, 826]
    assert [r["roomAtMineralFaces"] for r in out.values()] == [381, 775, 826]
    assert [r["roomFlange30"] for r in out.values()] == [381, 775, 826]
    assert out["P46"]["edges"]["west"][0][2] is False
    assert out["P47"]["edges"]["south"] == [[2772.5, 2787, True], [2787, 3002, False], [3002, 3032.5, True]]
    assert out["P24"]["edges"]["north"] == [[2772.5, 3032.5, False]]
    # Native P46 bars also bound anchor-head and aggregate clearance at the trial plate.
    cage = read("../../str/studies/open-loggia-support.json")["finite_floor_frame"]["stair"]["midlanding_beam"]["joint_paths"]["column_cage"]
    bars = [row["points"][0][:2] for row in cage if row["id"] in ("PC0", "PC1", "PC2", "PC3") and row["dia"] == 16]
    assert len(bars) == 4
    for pitch, expected in [(120,16.27), (90,37.48)]:
        studs = [(125+i*pitch/2, 125+j*pitch/2) for i in (-1,1) for j in (-1,1)]
        clear = min(dist(bar, stud) for bar in bars for stud in studs) - 16/2 - 25/2
        assert round(clear, 2) == expected
    old_link = next(r for r in cage if r["id"] == "PL-50")
    assert old_link["dia"] == 6 and set(v[2] for v in old_link["points"]) == {-50}
    assert -42 - (-50+3) == 5 and -42 - (-75+3) == 30
    assert floor["panelLayout"]["connectedCutPieces"] == 80
    return out


def drawing(rows):
    svg = ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 555" role="img" aria-labelledby="title desc">',
           '<title id="title">Where the room sheet meets the three upper cores</title>',
           '<desc id="desc">Scaled plans show how the wider masonry damp course interrupts the proposed 30 mm returns around the stair and two wet-wall support cores. A section sets the metal cap at the top of the masonry damp course.</desc>',
           '<rect width="1000" height="555" fill="#fbfaf6"/><g font-family="DejaVu Sans,Arial,sans-serif" fill="#193846">']
    def text(x, y, label, size=14, bold=False):
        svg.append(f'<text x="{x}" y="{y}" font-size="{size}" font-weight="{700 if bold else 400}">{label}</text>')
    def line(a,b,color,width):
        svg.append(f'<path d="M{a[0]:.2f} {a[1]:.2f} L{b[0]:.2f} {b[1]:.2f}" fill="none" stroke="{color}" stroke-width="{width}"/>')
    def rect(x,y,w,h,fill):
        svg.append(f'<rect x="{x:.2f}" y="{y:.2f}" width="{w:.2f}" height="{h:.2f}" fill="{fill}"/>')
    text(35,32,"REFERENCE HOUSE  /  GROUND FLOOR",13,True)
    text(34,76,"Where the room sheet can meet each support",33,True)
    text(35,104,"Plans at one scale, north up. Edge colours include the proposed 215 mm masonry bases.",15)
    line((34,121),(966,121),"#abb8b7",1)
    positions=[(115,142),(428,142),(746,142)]
    labels=["P46   Stair post","P47   South receiver","P24   North receiver"]
    for (name,r),(ox,oy),label in zip(rows.items(),positions,labels):
        x,y,w,h=r["core"]
        s=.35
        shape_y=oy+35+(450-h)*s/2
        def plan(px,py):return ox+(px-x)*s,shape_y+(y+h-py)*s
        rect(ox,shape_y,w*s,h*s,"#e1ded3")
        text(ox-57,oy+13,label,18,True)
        for face,parts in r["edges"].items():
            for a,b,ok in parts:
                if face in ("north","south"):
                    side=y+h if face=="north" else y
                    u,v=plan(a,side),plan(b,side)
                else:
                    side=x+w if face=="east" else x
                    u,v=plan(side,a),plan(side,b)
                line(u,v,"#087879" if ok else "#af4a22",6)
        sx,sy=plan(*r["shaft"])
        line((sx-5,sy),(sx+5,sy),"#253944",1.6);line((sx,sy-5),(sx,sy+5),"#253944",1.6)
        text(ox-55,367,f'{r["roomFlange30"]:.0f} / {r["perimeter"]:.0f} mm to sheet',15,True)
    line((41,400),(74,400),"#087879",6);text(84,405,"30 mm room-sheet flange",14)
    line((325,400),(358,400),"#af4a22",6);text(368,405,"Wall or outer return required",14)
    text(704,405,"+  Shaft axis beneath core",14)
    line((34,422),(966,422),"#abb8b7",1)
    text(36,450,"Section through a room-facing edge",17,True)
    rect(56,462,128,14,"#d0cec4"); rect(56,476,128,7,"#354d56"); rect(56,483,128,40,"#d0cec4")
    line((184,480),(184,508),"#087879",3);line((184,508),(239,508),"#087879",3)
    text(256,482,"Core cap at −42 to −30 mm",14)
    text(256,507,"Room sheet at −80 to −79 mm",14)
    text(583,476,"Separate anchorage on each cap face.",14)
    text(583,500,"Embedded edges must be built before the wall.",14)
    text(36,543,"Trial section, enlarged. The floor field, anchors and exposed wall base have independent duties.",13)
    return "\n".join(svg+["</g></svg>"])+"\n"


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--write", action="store_true")
    args = parser.parse_args()
    runpy.run_path(str(HERE / "occupied-core-actions.py"))
    rows = compare()
    path = HERE / "occupied-core-breaks.svg"
    if args.write:
        path.write_text(drawing(rows))
    else:
        assert path.read_text() == drawing(rows), "Regenerate occupied-core-breaks.svg with --write"
    print("Occupied core flange at P46/P47/P24:", [r["roomFlange30"] for r in rows.values()])
