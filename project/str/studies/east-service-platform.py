"""Resolve the inboard staff support and ladder on the RWT upper-first reference."""
import itertools
import json
import math
import sys
from pathlib import Path

here = Path(__file__).resolve().parent
root = here.parents[2]
def read(path):
    return json.loads((root/path).read_text())
spool = read("project/rwt/studies/upper-first-release.json")
grid = read("project/str/studies/current-house-grid.json")
house = read("project/had/studies/water-replan.json")["model"]
crew = spool["wellAndCrew"]
rim = spool["rimWeather"]
xy = crew["platformPlan"]
x,y,w,h = xy
assert xy == [6250,6220,1150,600] and crew["crewPlatformLevel"] == -800
assert len(spool["positiveLockReference"]["crownCases"][0]["bridges"]) == 3
assert grid["girders"]["court-E"]["z"] == [-630,-180]
assert crew["proposedCatchFloor"] == -1100
pile_x, pile_y = [6200,7450], [5100,5900]
ledgers = [6260,6380]
panel_width = w/3
steel_limit, shear_limit, E = 170, 95, 200000  # comparison MPa and N/mm²

def rhs(depth,width,t):
    area=width*depth-(width-2*t)*(depth-2*t)
    I=(width*depth**3-(width-2*t)*(depth-2*t)**3)/12
    return area,I,2*I/depth

def near(actual, target):
    assert abs(actual-target)<1e-6,(actual,target)

# Charge the complete point to one bearing bar and one rib. The detachable
# cartridge has its own 50 kg total budget, not a licence to lift by hand.
P = 1.5*crew["pointLoadKn"]
panel_g = .050*9.81
panel_q = 5*panel_width*h/1e6
panel_uls = 1.35*panel_g+1.5*panel_q
bar_span = panel_width/2
bar_moment = P*bar_span/4 + panel_uls*bar_span/4  # kN mm, full module adverse
bar_stress = 1000*bar_moment/(8*50**2/6)
# Slab point acts at outermost allowed 200-square centre; whole module gravity
# and distributed load at its true centroid. Signed contacts are indispensable.
cg = y+h/2
point_north=y+h-crew["pointFootprint"][1]/2
def contacts(load, py):
    north=load*(py-ledgers[0])/(ledgers[1]-ledgers[0])
    return load-north,north
sp,np=contacts(P,point_north)
sg,ng=contacts(panel_uls,cg)
south,north=sp+sg,np+ng
_,rib_I,rib_W=rhs(100,50,5)
rib_moment=P*(point_north-ledgers[1])+panel_uls*(y+h-ledgers[1])
rib_stress=1000*rib_moment/rib_W
# Use the full uplift from one panel on ONE captive 20 mm shoulder. The
# parallel connections never rely on uniform sharing or plate-on-plate friction.
pin_d=20
pin_shear=-south*1000/(2*math.pi*pin_d**2/4)
inner_bearing=-south*1000/(12*pin_d)
outer_bearing=-south*1000/(2*8*pin_d)
# Full point in one panel; simultaneous dead/live uniform on all three.
span=pile_x[1]-pile_x[0]
# The ladder heel bears on a pinned lug on the south ledger directly.
# Add its entire factored 2 kN load in magnitude even though the downward
# heel force opposes uplift at the critical south panel contact.
reaction_totals=[abs(sp+3*sg)+3,np+3*ng]
_,ledger_I,ledger_W=rhs(110,100,10)
ledger_stress=max(reaction_totals)*span/4*1000/ledger_W
ledger_deflection=max(reaction_totals)*1000*span**3/(48*E*ledger_I)
# Conservatively put both absolute transverse reactions onto the same side
# stringer, with no cancellation in its root moment.
_,side_I,side_W=rhs(160,90,16)
gate_wind=.725*1.1*rim["structuralReservation"]["gate"]["windPressureHypothesisKpa"]
gate_weight=.030*9.81
gate_ecc=gate_weight*.725/2
# Charge the common gate/ladder overturning to this same stringer, too.
guard_moment=1.5*((1+gate_wind+1)*2.0+gate_ecc)
side_moment=sum(r*(pos-pile_y[1]) for r,pos in zip(reaction_totals,ledgers))+guard_moment*1000
crosshead_twist=guard_moment*1e6/(2*100*90*10)
assert crosshead_twist<shear_limit
side_stress=1000*side_moment/side_W
assert max(bar_stress,rib_stress,ledger_stress,side_stress,inner_bearing,outer_bearing)<steel_limit
assert pin_shear<shear_limit and ledger_deflection<3

# Prove the pile reference actions as two simply supported EW ledgers on
# positive longitudinal seats. Each vertical action conserves N, Nx and Ny.
def heads(load, px, py):
    a=(px-pile_x[0])/span; b=(py-pile_y[0])/(pile_y[1]-pile_y[0])
    result=[load*i*j for i in (1-a,a) for j in (1-b,b)]
    points=list(itertools.product(pile_x,pile_y))
    near(sum(result),load)
    near(sum(n*p[0] for n,p in zip(result,points)),load*px)
    near(sum(n*p[1] for n,p in zip(result,points)),load*py)
    return result
# 9 kN full frame allowance including all demountables. Vary its unknown
# centre across the full declared footprint; include both 0.9 and 1.35 G.
# Allow 2 kN on the ladder with the full platform occupancy and 5 kPa field.
states=[]
for gx,gy,gf,px,py in itertools.product([6100,7500],[5100,6820],[.9,1.35],
                                         [x+100,x+w-100],[y+100,point_north]):
    data=[heads(9*gf,gx,gy),heads(P,px,py),heads(1.5*3*panel_q,x+w/2,cg),heads(3,6570,6262)]
    states.append([sum(vals) for vals in zip(*data)])
guard=rim["structuralReservation"]["gate"]
H=1.5*(1+gate_wind+1)  # one guard point, gate wind, ladder pull
head_z=-1600
M=H*(1100-head_z)/1000+1.5*gate_ecc
# Full X- and Y-overturning couples on one pair each, deliberately adverse.
# Pins/bracing supply positive shear. No base friction or equal H share.
overturn=M*(1/(span/1000)+1/((pile_y[1]-pile_y[0])/1000))
minimum=min(min(row) for row in states)-overturn
maximum=max(max(row) for row in states)+overturn
head_d=30
pin_resultant=math.hypot(max(abs(minimum),maximum),H)*1000
assert pin_resultant/(2*math.pi*head_d**2/4)<shear_limit
assert pin_resultant/(head_d*20)<steel_limit
assert pin_resultant/(2*head_d*12)<steel_limit
# One post takes guard+gate+ladder action, including its rail's 275 mm offset.
A,I,Z=rhs(100,100,8)
postH=1+gate_wind+1
post_base=-900
post_M=1.5*(postH*(1100-post_base)/1000+gate_ecc)
post_sigma=post_M*1e6/Z
torsion=H*.275
tau=torsion*1e6/(2*(100-8)**2*8)
post_equiv=math.hypot(post_sigma,math.sqrt(3)*tau)
# Service deflection, apply stated fully combined H at the free top.
post_f=postH*1000*(1100-post_base)**3/(3*E*I)
assert post_equiv<steel_limit and post_f<10

# 82-degree 600-wide ladder. Check the THREE-DIMENSIONAL path model: at all
# z on this vertical run the person's horizontal section fits the R300 disc.
# Front and back limits are extrema at opposite ends of the climb.
floor=crew["crewPlatformLevel"]; ladder_x=6570; top_y=6145
toe=top_y+(30-floor)/math.tan(math.radians(82))
well_south=crew["proposedClearWell"][1]
flange=spool["geometry"]["flange"]
body_r=crew["radius"]; placement=5; target=25
back_min=well_south+body_r+placement+target-top_y
back_max=flange[1]-math.sqrt((body_r+spool["geometry"]["flangeOD"]/2+placement+target)**2
                          -(ladder_x-flange[0])**2)-toe
def flange_gap(centre_x,back):
    return math.hypot(centre_x-flange[0],toe+back-flange[1])-body_r-spool["geometry"]["flangeOD"]/2-placement
assert back_min==310 and back_max>330 and flange_gap(ladder_x,330)>=target
assert flange_gap(6900,310)<0
# The landing joins the source walk by going south to Y6475 first, then
# across to the two recorded stations. Its smallest flange distance occurs
# at the northernmost landing point until the inherited transverse phase.
assert crew["route"][1][1]==6475
assert crew["routeProof"]["minimumFlangePlanGapAfter5"]>=target
assert ladder_x-300>=x and ladder_x+300<=x+w and y<=toe<=y+h
# Fixed steel/opposite rim remains below the deck and clear after the entire
# platform/ladder has been captured and removed. All brackets stop at Y6430.
retained_north=ledgers[1]+50
roll_min=min(next(b["minimum"] for b in s["angular"] if b["axis"]=="Y")
             for s in spool["completeAngularProof"]["sweeps"])
draw_min=spool["postTranslation"]["wholeLockedY"][0]
assert min(roll_min-5,draw_min)-retained_north-5>=25
p36=next(p for p in grid["heads"] if p["id"]=="P36")
cap_gap=p36["xy"][0]-p36["capXY"][0]/2-(pile_x[1]+150)
assert cap_gap==50
assert 1970-(30+1900)>=25
# Gate hinges 25 west of clear aperture, opens SOUTH. 725 x 40 leaf.
# Both open sweep and closed active leaf stay south of the climber's path.
hinge=[6195,6075]; leaf=725; half=20
assert toe+310-body_r-(hinge[1]+half)>=25
assert ladder_x-(hinge[0]+half)-body_r-placement>=25
door_tip=house["southCourtWeatherDoor"]["openLeafNorthTip"]
assert hinge[1]-leaf-half-door_tip>=200
assert 5480-door_tip-body_r-placement>=25
print(f"Panel contacts {south:.2f}/{north:.2f} kN. Bar/rib/ledger/side {bar_stress:.1f}/{rib_stress:.1f}/{ledger_stress:.1f}/{side_stress:.1f} MPa.")
print(f"Post {post_equiv:.1f} MPa, {post_f:.2f} mm. Foundation envelope {minimum:.2f} to {maximum:.2f} kN, H {H:.2f} kN.")
print(f"Ladder backset {back_min:.1f}..{back_max:.1f}; old gap {flange_gap(6900,310):.1f}, revised {flange_gap(ladder_x,330):.1f} mm. 450 bridge remains.")

# Self-egress to the pre-opened south court leaves, then the house. After
# descending from the ladder the body first advances south of the flange.
door=house["southCourtWeatherDoor"]
assert door["hinges"]==[[5150,4250],[6850,4250]]
assert min(6000-5150,6850-6000)-door["leafEach"][1]/2-body_r-placement>500
# Purchase and landing split into three units; normalising unknown brackets
# into one bound is explicit, not silently treating bare steel as all-up mass.
panel_bars=21*.008*.050*.383334*8000
panel_ribs=3*.6*rhs(100,50,5)[0]*.008
assert panel_bars+panel_ribs<50
# Three-point bracket pair, one pin at a time. Member bending + shear
# superposition below is a conservative elastic gross-section screening.
ledger_v=max(reaction_totals)*1000/(2*10*(110-20))
ledger_eq=math.hypot(ledger_stress,math.sqrt(3)*ledger_v)
assert ledger_eq<steel_limit
print(f"Ledger combined {ledger_eq:.1f} MPa; 50 kg panel incl. {panel_bars+panel_ribs:.2f} kg nominal bars/ribs; cap gap {cap_gap:.0f} mm.")
web_shear=(sum(reaction_totals)+H)*1000/(2*16*(160-32))
side_twist=H*.275*1e6/(2*(160-16)*(90-16)*16)
assert math.hypot(side_stress,math.sqrt(3)*(web_shear+side_twist))<steel_limit
at_head=30-post_base
head_f=postH*1000*at_head**2*(3*(1100-post_base)-at_head)/(6*E*I)
assert head_f<2.6
wet_water=spool["nominalSpoolLoads"]["tubeWaterKg"]+spool["nominalSpoolLoads"]["bendWaterGrossBoxBoundKg"]
trap_volume=crew["proposedClearWell"][2]*crew["proposedClearWell"][3]*60/1e6
assert wet_water>trap_volume and -1010-(-1040)>=30
# Independent founded steel stays below the rim and does not borrow node steel.
assert 5800+65 < rim["structuralReservation"]["formedEdge"]["plan"][1]
assert 6170+65 < 6245 and 6970-65 > 6895
def rounding(v): return round(v,3)
data={
 "status":"Proposed person-only independent platform for the unadopted upper-first E spool. No site, hydraulic, structural or worker admission.",
 "bridgeDepth":450,"sourceWell":crew["proposedClearWell"],"platformXYZ":[x,y,floor,w,h],
 "panelCount":3,"panelMassLimitKg":50,"workingFootSquareMm":200,"livePointAndArea":[5,5],
 "panelContactUltimateKN":[rounding(south),rounding(north)],"ledgerAxesY":ledgers,
 "sectionsMm":{"panelRib":[100,50,5],"ledger":[110,100,10],"sideStringer":[160,90,16],"guardPost":[100,100,8]},
 "referenceMPa":{"bar":rounding(bar_stress),"rib":rounding(rib_stress),"ledgerEquivalent":rounding(ledger_eq),
                 "sideEquivalent":rounding(math.hypot(side_stress,math.sqrt(3)*(web_shear+side_twist))),"guardEquivalent":rounding(post_equiv)},
 "foundation":{"newAxesXY":list(itertools.product(pile_x,pile_y)),"maximumHeadPlan":300,"headZ":head_z,
               "staticDeadKNLimit":9,"envelopePerHeadKN":[rounding(minimum),rounding(maximum)],"oneHeadShearKN":rounding(H),
               "clearToP36Mm":cap_gap,"siteResistance":None},
 "entry":{"ladderTop":[ladder_x,top_y,30],"ladderToe":[ladder_x,rounding(toe),floor],"inclinationDeg":82,
          "gateClearX":[6220,6920],"gateHingeXY":hinge,"southRamp":[6245,5750,650,375],
          "bodyRadius":body_r,"combinedRelativeAllowance":placement,"creditedBackset":[310,330],
          "limitingBackset":rounding(back_max),"oldCentredGap":rounding(flange_gap(6900,310)),
          "newLowerGap":rounding(flange_gap(ladder_x,330)),"headDeflectionMm":rounding(head_f)},
 "fixedNorthLimitY":retained_north,"lockedDrawSouthY":draw_min,"storageGrossUpperL":rounding(trap_volume),
 "possibleWaterKg":rounding(wet_water),"wholeMethodAccepted":False,
}
# Left is plan. Right is the N-S load path, showing the open catcher underneath.
def text(x,y,s,size=14): return f'<text x="{x}" y="{y}" font-size="{size}">{s}</text>'
def line(points,colour,width=2):
    pairs=" ".join(f"{a:.1f},{b:.1f}" for a,b in points)
    return f'<polyline points="{pairs}" fill="none" stroke="{colour}" stroke-width="{width}" stroke-linejoin="round"/>'
def plan(a,b): return 40+(a-6000)*.215,405-(b-5000)*.125
def rect(x,y,w,h,col):
    a,b=plan(x,y+h)
    return f'<rect x="{a:.1f}" y="{b:.1f}" width="{w*.215:.1f}" height="{h*.125:.1f}" fill="{col}"/>'
def sec(y,z):return 542+(y-4975)*.234,400-(z+1740)*.102
out=['<svg xmlns="http://www.w3.org/2000/svg" width="1040" height="535" viewBox="0 0 1040 535">',
     '<title>Independent platform for the east inlet release</title><desc>Three lift-out panels work on two short ledgers. Independent posts carry guard and staff loads to four heads. The shifted ladder misses the retained flange.</desc>',
     '<rect width="1040" height="535" fill="#faf9f5"/><g font-family="Arial, sans-serif" fill="#253e45">',
     text(28,38,'Independent support for the east inlet release',25),
     text(28,69,'PLAN · axes in mm',15),text(536,69,'SECTION · south to north',15),
     rect(*crew["proposedClearWell"],'#dadcd2'),rect(x,y,w,h,'#bdd7cf'),
     rect(6245,5750,650,375,'#e2ceb1')]
for xx in (x+panel_width,x+2*panel_width):
    out.append(line([plan(xx,y),plan(xx,y+h)],'#47796b'))
for yy in ledgers:out.append(line([plan(pile_x[0],yy),plan(pile_x[1],yy)],'#37677b',3))
for xx,yy in itertools.product(pile_x,pile_y):out.append(rect(xx-95,yy-95,190,190,'#435a65'))
px,py=plan(flange[0],flange[1])
out.append(f'<ellipse cx="{px:.1f}" cy="{py:.1f}" rx="{142.5*.215:.1f}" ry="{142.5*.125:.1f}" fill="#b56d52"/>')
for who,c in ((6900,'#a34f37'),(ladder_x,'#37695d')):
    a,b=plan(who,toe+330)
    out.append(f'<ellipse cx="{a:.1f}" cy="{b:.1f}" rx="{300*.215:.1f}" ry="{300*.125:.1f}" fill="none" stroke="{c}" stroke-dasharray="4 3"/>')
out.append(line([plan(hinge[0],hinge[1]-725),plan(*hinge),plan(6920,6075)],'#a18355',2))
out.append(text(38,97,'Dashed footprints · old in rust, shifted in green',12))
out.extend([line([plan(ladder_x,top_y),plan(ladder_x,toe),plan(ladder_x,6475),plan(6455,6475)],'#a15934',4),
            text(37,429,'Green = three panels · Rust = retained inlet flange'),
            text(37,454,'Dark squares = four new, independent heads'),
            text(37,478,'Shift the ladder 330 west of the former gate centre.')])
for yy in pile_y:out.append(line([sec(yy,head_z),sec(yy,-880)],'#435a65',8))
out.extend([line([sec(pile_y[0],-930),sec(retained_north,-930)],'#37677b',7),
            line([sec(y,floor),sec(y+h,floor)],'#487b6e',6),
            line([sec(6125,-1040),sec(6125,-1100),sec(6970,-1100)],'#6093a9',3),
            line([sec(5800,-900),sec(5800,1080),sec(6075,1080)],'#725651',5),
            line([sec(top_y,30),sec(toe,floor)],'#a15934',4),
            line([sec(5100,0),sec(6125,0)],'#aca89b',6),
            text(551,185,'Court and guard'),
            text(821,258,'Crew and ladder'),
            text(551,431,'Green = staff deck −800 · Blue = separate catch −1100'),
            text(551,455,'The dry-side steel stops at Y6430 before the pipe rolls.'),
            text(28,513,'One worker below. Isolate and drain E, keep N live, then clear all people before releasing the supported water assembly.'),
            '</g></svg>'])
for suffix,content in [('json',json.dumps(data,indent=2)+'\n'),('svg','\n'.join(out)+'\n')]:
    target=here/('east-service-platform.'+suffix)
    if '--check' in sys.argv: assert target.read_text()==content,'Regenerate '+str(target)
    else: target.write_text(content)
