"""Draw the joined court routes and finite junction replacement states."""
from pathlib import Path
import sys

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import Circle, Rectangle

from roof_water_routes import compare, read


HERE = Path(__file__).resolve().parent
data = compare()
receiver = read("had/studies/receiver-selection.json")
plt.rcParams.update({"font.family":"DejaVu Sans", "font.size":9,
                     "svg.fonttype":"none", "svg.hashsalt":"rof-rwt-ground"})
fig, axes = plt.subplots(1, 3, figsize=(17, 7), layout="constrained")
network, junction, lifting = axes
normal, relief, steel = "#257ba1", "#a76538", "#657480"


def path(axis, points, colour, label=None, style="-"):
    axis.plot([p[0] for p in points], [p[1] for p in points], style,
              color=colour, lw=2, label=label)


def box(axis, bounds, colour, alpha=.2, label=None, style="-"):
    axis.add_patch(Rectangle(bounds[:2], bounds[2], bounds[3], facecolor=colour,
                            edgecolor=colour, alpha=alpha, label=label, linestyle=style))


def envelope(axis, bounds, colour, style="-"):
    x0,y0,_,x1,y1,_ = bounds
    box(axis, [x0,y0,x1-x0,y1-y0], colour, style=style)


box(network, [4250,4250,3500,3500], "#d3d0c9", alpha=.15)
box(network, receiver["composition"]["case"], steel)
path(network, data["normal"]["route"], normal, "South-west normal to N")
path(network, data["relief"]["route"], relief, "South-east relief to W / E")
path(network, data["nCarrier"]["routeXY"][:4], normal)
path(network, data["renewal"]["eastCrossoverFirst"]["routeXY"], relief)
for x,y,word in [(4500,4500,"Normal leader"), (7500,4500,"Relief leader")]:
    network.add_patch(Circle((x,y),100,fill=False,edgecolor=steel))
    network.annotate(word, (x,y), xytext=(x-250,y-300), fontsize=9)
network.annotate("West receiver", (6250,6900), xytext=(6350,6200),
                 arrowprops={"arrowstyle":"-", "color":steel})
network.annotate("Separate north carrier", (7000,8500), xytext=(4700,8550),
                 arrowprops={"arrowstyle":"-", "color":normal})
network.set(xlim=(4100,7900), ylim=(4050,9000), title="Normal and relief routes",
            xlabel="X / mm", ylabel="Y / mm")
network.legend(loc="upper left", fontsize=8, frameon=False)

opening = data["renewal"]["accessOpening"]
box(junction, opening, "#86aa85", alpha=.13)
box(junction, [5500,7750,900,100], steel, alpha=.25)
cross = data["renewal"]["eastCrossoverFirst"]
envelope(junction, cross["initialEnvelope"], relief)
envelope(junction, cross["postTranslationEnvelope"], relief, "--")
releases = data["renewal"]["teeJointReleases"]
envelope(junction, releases["TAfterNext40South"], normal)
envelope(junction, releases["waferAfter20North"], steel)
for side in ["west", "east"]:
    row = releases[side]
    x0,x1 = sorted([row["fixedFaceX"],row["compressedFaceX"]])
    box(junction,[x0,7500,x1-x0,200],normal,alpha=.12)
junction.annotate("E first moves 40 west / 40 north", (5900,7650),
                  xytext=(5520,7890), fontsize=8,
                  arrowprops={"arrowstyle":"-", "color":relief})
junction.annotate("T after 30 north, then 40 south", (5900,7585),
                  xytext=(5520,7250), fontsize=8,
                  arrowprops={"arrowstyle":"-", "color":normal})
junction.annotate("Wafer after 20 north", (5900,7440), xytext=(6060,7330),
                  fontsize=8, arrowprops={"arrowstyle":"-", "color":steel})
junction.text(5620,7775,"Concrete tie",fontsize=8)
junction.text(5620,7385,"700 × 355 opening",fontsize=8)
junction.set(xlim=(5480,6420), ylim=(7190,7970), title="Separate first-release states",
             xlabel="X / mm", ylabel="Y / mm")

lift = data["renewal"]["lift"]
box(lifting, opening, "#86aa85", alpha=.13)
for bounds in lift["shoes"]:
    box(lifting, bounds, steel)
box(lifting, lift["ballastBox"], steel, alpha=.4)
for name,bounds in lift["rests"].items():
    box(lifting, bounds, relief if name=="eastSpool" else normal)
    lifting.text(bounds[0],bounds[1]+bounds[3]+55,
                 "E rest" if name=="eastSpool" else "Valve / T rest",fontsize=8)
box(lifting, lift["operatorBay"], "#86aa85", alpha=.13)
lifting.add_patch(Circle(lift["worker"],lift["bodyRadius"],facecolor="#86aa85",alpha=.3))
lifting.add_patch(Circle(lift["mast"],60,facecolor=steel))
path(lifting, [lift["mast"],[5900,7600]], normal)
lifting.annotate("Captured rig with sector stops", lift["mast"], xytext=(6500,9250),
                 fontsize=8, arrowprops={"arrowstyle":"-", "color":steel})
lifting.text(6610,8500,"Operator",fontsize=8)
lifting.text(5350,8810,"250 kg",fontsize=8)
lifting.text(5350,8700,"ballast",fontsize=8)
lifting.set(xlim=(5100,7400), ylim=(7275,9575), title="Occupied lifting and dry rests",
            xlabel="X / mm", ylabel="Y / mm")

for axis in axes:
    axis.set_aspect("equal", adjustable="box")
    axis.spines[["top","right"]].set_visible(False)
    axis.grid(alpha=.12)
fig.suptitle("Court drainage and renewal · finite reference geometry", fontsize=17)
fig.supxlabel("Junction projections show separate elevations and sequential states. The source checks their full 3D clearances. Joint, rig and site qualification remain required.", fontsize=9)
target = HERE/"roof-water-routes.svg"
fig.savefig(target,metadata={"Date":None})
target.write_text("\n".join(line.rstrip() for line in target.read_text().splitlines())+"\n")
if "--png" in sys.argv:
    fig.savefig("/tmp/ovid-swarm-20261110/roof-water-routes.png",dpi=140)
print(target)
