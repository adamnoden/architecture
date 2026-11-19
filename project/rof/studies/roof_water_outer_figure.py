"""Draw the source-bound outer normal head, floor bypass and transfer bay."""
from pathlib import Path
import sys

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import Circle, Polygon, Rectangle

from roof_water_edges import primary, fault, eave, p_bed, f_rim
from roof_water_heads import report


HERE = Path(__file__).resolve().parent
plt.rcParams.update({"font.family":"DejaVu Sans","font.size":9,
                     "svg.fonttype":"none","svg.hashsalt":"rof-rwt-outer"})
fig = plt.figure(figsize=(16,10),layout="constrained")
grid = fig.add_gridspec(2,2,width_ratios=[1.45,1])
section = fig.add_subplot(grid[:,0])
plan = fig.add_subplot(grid[0,1])
bay = fig.add_subplot(grid[1,1])
blue, copper, steel, green = "#257ba1", "#b96532", "#657480", "#4c8564"
head = report["heads"][0]
bed = min(p_bed("north",9025-.001),p_bed("north",9025+.001))
rim = f_rim("north",9025)


def box(axis,x,y,width,height,color,alpha=.2,**kwargs):
    axis.add_patch(Rectangle((x,y),width,height,facecolor=color,
                            edgecolor=color,alpha=alpha,**kwargs))


def note(axis,text,point,label):
    axis.annotate(text,point,xytext=label,fontsize=8,
                  arrowprops={"arrowstyle":"-","color":"#69757e","lw":.7},
                  bbox={"facecolor":"white","edgecolor":"none","alpha":.9,"pad":2})


def trough(axis,inside,outside,floor,back,front,color,offset=(0,0),style="-"):
    dx,dz=offset
    axis.plot([inside+dx,inside+dx,outside+dx,outside+dx],
              [floor+back+dz,floor+dz,floor+dz,floor+front+dz],
              color=color,lw=2,linestyle=style)
    axis.plot([inside+dx,outside+dx],[floor-27+dz]*2,color=steel,lw=3,linestyle=style)


box(section,-429.5,6000,429.5,1418,"#bbb4a9",alpha=.17)
box(section,-442.5,6540,220,120,steel,alpha=.6)
box(section,-432.5,6240,200,360,steel,alpha=.35)
box(section,-332.5,6140,1332.5,200,steel,alpha=.35)
box(section,1000,6280,260,60,steel,alpha=.45)
section.plot([-400,200],[eave["newPrimarySecondaryZ"][0]+600*.466307658,
                          eave["newPrimarySecondaryZ"][0]],color="#384653",lw=5)
section.plot([140,220],[7110,eave["newPrimarySecondaryZ"][1]],color=blue,lw=2)
section.plot([200,260,260],[7325,bed+95,bed+95],color=steel,lw=2)
section.plot([140,146,146],[7110,6750,rim-110],color=blue,lw=2)
trough(section,170,520,bed,230,130,copper)
trough(section,125,670,rim-125,125,125,blue)
trough(section,170,520,bed,230,130,copper,(400,-165),"--")

floor=head["catchFloor"]
catch_rim=head["catchRim"]
section.plot([1000,1000,1260,1260],[catch_rim,floor,floor,catch_rim],color=blue,lw=2)
box(section,1035,head["normalFloor"],190,head["normalRim"]-head["normalFloor"],copper)
box(section,1053,6000,154,head["normalFloor"]-6000,steel,alpha=.18)
box(section,1040,6340,180,8,steel,alpha=.65)
collar=head["pipePenetration"]
for edge in [1031, 1229]:
    section.plot([edge, edge], [floor, collar["upstandTop"]], color=blue, lw=1.5)
section.plot([1021,1239],[collar["dripRingZ"]]*2,color=copper,lw=3)
exit_floor=head["return"]["exitFloor"]
section.add_patch(Polygon([[600,exit_floor],[1000,floor],[1000,floor+120],[600,exit_floor+120]],
                         facecolor=blue,edgecolor=blue,alpha=.15))
section.plot([600,1000],[exit_floor,floor],color=blue,lw=2)
section.plot([520,1035],[bed,head["normalFloor"]],color=copper,lw=2)
section.axhline(6300,color="#94999c",linestyle=":",lw=1)
section.axhline(6515,color="#b1b5b7",linestyle=":",lw=1)
section.annotate("",(1600,bed-165),xytext=(800,bed-165),
                 arrowprops={"arrowstyle":"->","color":copper})
note(section,"Primary liner and 27 mm carrier",(420,bed),(-450,7850))
note(section,"Secondary water behind primary",(146,6850),(-450,7740))
note(section,"Front apron toe at R260",(260,bed+95),(-450,7630))
note(section,"Head and upper spool lift 800",(1130,7400),(1350,7890))
section.annotate("",(1130,head["normalRim"]+800),xytext=(1130,head["normalRim"]),
                 arrowprops={"arrowstyle":"->","color":steel,"lw":1.5})
note(section,"Independent catch and covered return",(900,floor+50),(1350,7710))
note(section,"Dry collar and separate drip",(1229,collar["upstandTop"]),(1350,7560))
note(section,"Arm passes below the lower collector",(700,6340),(-450,6040))
note(section,"Fork and removable bearing halves",(1130,6340),(1350,6150))
note(section,"Adjacent arch envelope +6515",(-150,6515),(1500,6520))
note(section,"Adjacent opening head +6300",(-150,6300),(1500,6340))
section.set(xlim=(-500,2450),ylim=(5950,8170),xlabel="Radial distance outward from facade / mm",
            ylabel="Height above ground floor / mm",title="North normal head at X9025 · section")
section.set_aspect("equal",adjustable="box")

box(plan,600,-120,400,240,blue)
box(plan,1000,-225,260,450,blue)
plan.add_patch(Circle((1130,0),99,facecolor="white",edgecolor=blue,lw=2))
plan.add_patch(Circle((1130,0),77,facecolor=steel,edgecolor=steel,alpha=.25))
plan.add_patch(Rectangle((1035,-95),190,190,fill=False,edgecolor=copper,linestyle="--"))
for sign in (-1,1):
    plan.annotate("",(650,sign*65),xytext=(1190,sign*170),
                  arrowprops={"arrowstyle":"->","connectionstyle":"arc3,rad="+str(sign*.2),"color":blue})
note(plan,"198 OD dry collar",(1130,99),(660,310))
note(plan,"248 total clear bypass\n124 after half-width obstruction",(1130,-165),(650,-380))
note(plan,"240 clear covered return",(800,120),(650,240))
plan.set(xlim=(550,1330),ylim=(-450,380),xlabel="Radial distance / mm",ylabel="Along facade / mm",
         title="Catch floor · widest body is above the arches")
plan.set_aspect("equal",adjustable="box")

box(bay,1600,-1200,800,1600,green,alpha=.09)
bay.add_patch(Rectangle((1600,-300),750,600,fill=False,edgecolor=steel,lw=2))
bay.plot([1600,1600],[-300,300],color=copper,lw=3,linestyle="--")
bay.plot([1600,2350],[-350,-350],color=steel,lw=2)
bay.add_patch(Circle((2000,-700),300,facecolor=green,edgecolor=green,alpha=.22))
box(bay,2030,-225,260,450,blue)
box(bay,1630,-120,400,240,blue)
bay.annotate("",(2160,0),xytext=(1450,0),arrowprops={"arrowstyle":"->","color":blue})
note(bay,"Worker remains beside the draw",(2000,-700),(2460,-700))
note(bay,"Entire catch and return\ninside before inner gate closes",(2000,100),(2460,180))
note(bay,"Outer and side gates locked",(2350,-200),(2460,-230))
bay.set(xlim=(1400,3100),ylim=(-1250,450),xlabel="Radial distance / mm",ylabel="Along from head / mm",
        title="Captured catch after 1030 outward transfer")
bay.set_aspect("equal",adjustable="box")
for axis in [section,plan,bay]:
    axis.spines[["top","right"]].set_visible(False)
    axis.grid(alpha=.12)
fig.suptitle("Outer collection and head renewal · finite reference geometry",fontsize=17)
fig.supxlabel("Separate installed and withdrawal states are illustrated. Dashed copper shows a primary module after the heads are removed. Temporary works require qualification.",fontsize=9)
svg=HERE/"roof-water-outer.svg"
fig.savefig(svg,metadata={"Date":None})
svg.write_text("\n".join(line.rstrip() for line in svg.read_text().splitlines())+"\n")
if "--png" in sys.argv:
    fig.savefig("/tmp/ovid-swarm-20261110/roof-water-outer.png",dpi=140)
print(svg)
