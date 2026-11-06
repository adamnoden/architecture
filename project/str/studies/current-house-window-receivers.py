"""Locate jamb feet in occupied rooms, price insulation and the external guard receiver."""
from pathlib import Path
from itertools import product
import json
import math
import sys

D=Path(__file__).resolve().parent
ROOT=D.parents[2]
H=json.loads((ROOT/'project/had/studies/water-replan.json').read_text())['model']
O=json.loads((ROOT/'project/oas/studies/north-export-occurrence.json').read_text())
exterior=(ROOT/'project/oas/studies/north-export-exterior.mjs').read_text()
assert '[1230,1270]:[2330,2370]' in exterior and '12,40,12' in exterior
cage=json.loads((D/'current-house-arch-detail.json').read_text())
placing=json.loads((D/'current-house-jamb-placement.json').read_text())
thermal_source=(ROOT/'project/mat/studies/loggia-roof-wall-thermal.py').read_text()
import ast
for statement in ast.parse(thermal_source).body:
    if isinstance(statement,ast.Assign) and isinstance(statement.targets[0],ast.Name) and statement.targets[0].id=='LAMBDA':
        k={key.value: value.value for key,value in zip(statement.value.keys,statement.value.values) if isinstance(value,ast.Constant)}
assert k['glass']==.041 and k['RC']==1.75

# House-local s increases from corner toward the middle, and q toward the room.
# Keep the original 27 mm finish beyond the nominal structural face at q402.5.
def rectangle(side,position,qmin,qmax):
    along=(2300,2505) if position==1800 else (9495,9700)
    return ((along[0],qmin,along[1],qmax) if side=='south' else
            (along[0],12000-qmax,along[1],12000-qmin) if side=='north' else
            (qmin,along[0],qmax,along[1]) if side=='west' else
            (12000-qmax,along[0],12000-qmin,along[1]))

def overlap(a,b):
    return max(0,min(a[2],b[2])-max(a[0],b[0]))*max(0,min(a[3],b[3])-max(a[1],b[1]))

hits=[]
for width in [200,210,225,240]:
    clashes=[]
    for face,centre in product(['south','east','north','west'],[1800,10200]):
        pad=rectangle(face,centre,429.5,429.5+(width-140)/2)
        for name,(x,y,w,h) in H['upperFurniture'].items():
            area=overlap(pad,[x,y,x+w,y+h]);
            if area:clashes.append([face,centre,name,round(area,3)])
    hits.append({'symmetricWidth':width,'planOverlaps':clashes})
assert any('service-emitter-rear-N' in row for row in hits[0]['planOverlaps'])
# Dry one-dimensional sensitivity only: the 50 mm ventilated cavity stays
# open. For each face cell compare to the 140 RC jamb with the full 110 glass.
# Include the local full-depth portion and linear taper, with no glass declared
# in the cavity. The brick outside the open cavity contributes no series R.
def u_value(extra):
    return 1/(.13+.027/k['plaster']+(.140+extra)/k['RC']+(.110-extra)/k['glass']+.04)

heat=[]
for width in [200,210,225,240]:
    extra=(width-140)/1000
    dH=8*.205*(.98*(u_value(extra)-u_value(0))+.55*sum(u_value(extra*(i+.5)/100)-u_value(0) for i in range(100))/100)
    heat.append({'width':width,'remainingGlass':110-(width-140),'ventilatedGap':50,'grossLocalU':u_value(extra),'addedEightJambsWPerK':dH,'insideSurfaceAt20AndMinus5DegC':20-25*u_value(extra)*.13})

# OAS exposes four permanent studs at each guard jamb. The bracket slides off
# the source 40 mm projections using its existing 100 mm withdrawal. An M12x190
# guard screw in the removable tube is not an anchor reaching the inner core.
# Compare one pair of through-bolted square steel compression tubes at each jamb.
# Their fixed hollow bodies run only across the weather skin and cavity. A common
# inner plate and M16 through-bolts develop compression/tension directly into RC.
wall_out,wall_in=262.5,402.5
jamb_x={'near':1195.,'opposite':2410.};z=[5430.,5570.]
root_holes=[[1230,1270],[2330,2370]]
# Source guard gross perimeter less corner overlaps and seven vertical infill bars.
guard=O['guard'];width=guard['outsideX'][1]-guard['outsideX'][0];height=guard['top']-guard['bottom'];bar=guard['face']
area=((2*bar*width+2*bar*(height-2*bar))+len(guard['barXs'])*guard['barD']*(height-2*bar))/1e6
wind=2.25*area;weight=1.35*guard['massMaximumKg']*9.81/1000
# Entire guarded panel is conservatively introduced into either jamb. The 1.5
# kN point at the top outside edge is a project comparison pending usage class.
point=1.5
forces=[]
for side,xref in jamb_x.items():
    cx=1800
    extreme_x=guard['outsideX'][1] if side=='near' else guard['outsideX'][0]
    horizontal=point+wind
    ht=3450+guard['top'];mid=3450+(guard['bottom']+guard['top'])/2
    # A single-jamb all-panel challenge retains the actual horizontal torque
    # as well as the vertical force couple. One vertical line of M16s has no
    # spacing to resolve this torque by an axial couple: positive weld/tube
    # bending into the cast face is mandatory, or the support must be changed.
    mx=point*(ht-sum(z)/2)/1000+wind*(mid-sum(z)/2)/1000
    mz=abs(point*(extreme_x-xref)+wind*(cx-xref))/1000
    top=horizontal/2+mx/((z[1]-z[0])/1000)
    forces.append({'side':side,'netNormalKN':horizontal,'horizontalAxisMomentKNm':mx,'verticalAxisMomentKNm':mz,'maxTubeAxialKN':max(abs(top),abs(horizontal-top)),'verticalGravityKN':weight})

# A realistic two-jamb load return for an undamaged planar steel guard is a
# separate state: the normal point load splits by the two ACTUAL root axes.
# For the outside point the opposite jamb must not be artificially assigned
# the full transverse torque and then treated as an ordinary two-point beam.
left,right=guard['boltXs']; states=[]
for x in guard['outsideX']:
    point_right=point*(x-left)/(right-left)
    wind_right=wind*(1800-left)/(right-left)
    member=[]
    for name,xbolt,P0,W0 in [('near',left,point-point_right,wind-wind_right),('opposite',right,point_right,wind_right)]:
        normal=P0+W0
        mx=P0*(ht-sum(z)/2)/1000+W0*(mid-sum(z)/2)/1000
        mz=normal*abs(xbolt-jamb_x[name])/1000
        top=normal/2+mx/((z[1]-z[0])/1000)
        member.append({'side':name,'normal':normal,'topBottom':[top,normal-top],'localRootTorque':mz,'supportAxisX':xbolt})
    assert abs(sum(q['normal'] for q in member)-point-wind)<1e-9
    assert abs(sum(q['normal']*q['supportAxisX'] for q in member)-point*x-wind*1800)<1e-6
    states.append({'pointX':x,'members':member})
section=40;thickness=3;area_steel=section**2-(section-2*thickness)**2
I=(section**4-(section-2*thickness)**4)/12;W=I/(section/2)
steel_limit=200/1.1
critical=max(q['verticalAxisMomentKNm'] for q in forces)
# Even with two equal tubes, the one-jamb control spends real flexural capacity
# under this lost-support case. Pair it with the axial top-row force and weight.
sigma=critical/2*1e6/W+weight*wall_out/2*1000/W+max(q['maxTubeAxialKN'] for q in forces)*1000/area_steel
assert sigma>steel_limit
installed=max(abs(q['localRootTorque'])/2*1e6/W+weight*wall_out/2*1000/W+max(map(abs,q['topBottom']))*1000/area_steel for st in states for q in st['members'])
max_anchor=max(abs(force) for st in states for q in st['members'] for force in q['topBottom'])
assert installed<steel_limit
# Installed receiver protrudes only as the existing external studs when the
# standoffs are removed. Four 50-wide cored pockets per corner pair must be
# formed in the genuine masonry; no drilling of voussoirs or invisible support.
# Roof-stage temporary guard must be independent during any receiver removal.
fixed_steel=8*2*2*area_steel*wall_out/1e9*8000
conductance=8*2*2*area_steel/1e6*16/(wall_out/1000)
model={'role':'Unadopted architectural and guard-receiver comparison. Full height opening preserved in geometry. Hardware, finishes and removal procedure await a joined OAS/STR/MAT proof.',
       'actualRoomOverlapsForSymmetricFeet':hits,'outwardFootThermal':heat,'thermalBasis':'Existing 50 drained cavity, 110 glass, RC1.75/glass0.041. Local 1D heat-path sensitivity, unaffected finish and no brick resistance outside ventilated cavity. Edge spreading and the 3D junction/condensation remain open.',
       'guard':{'scope':'Native OAS north export body is the trial geometry for comparison elsewhere; six other upper corner sills are lower. No transferred individual product or guard rating.',
       'body':{'steelProjectedAreaM2':area,'windULSKN':wind,'guardMassULSKN':weight,'pointLoadComparisonKN':point},'rootStudXs':root_holes,'rootStudExtentNormalFromWeatherFace':[-40,0],'alreadyRequiredProjections':40,'bracketWithdrawal':100,'guardScrewRole':'The M12x190 screw releases the guard from its exterior stand-off. Its axis never establishes an anchor in the structural inner leaf.',
       'proposedContact':{'tubeCentreXs':jamb_x,'centreGlobalZ':z,'outsideInnerCoreFaces':[wall_out,wall_in],'tubeSection':[40,40,3],'comparisonBolt':'two M16 through the 140 core per jamb. Compression sleeve and rear bearing plate must remain accessible on the room side. Each exterior bracket still disengages from the OAS studs.'},
       'existingTwoSupportReactions':states,'installedTwoJambTubeStressMPa':installed,'maximumOneThroughboltAxialKN':max_anchor,'oneM16A4_80TensionArea157SimpleTrialKN':157*600/1.25/1000,'oneJambLoss':forces,'oneJambWorstTubeNormalStressMPa':sigma,'normalStressLimit':steel_limit,'oneJambLossPass':False,
       'twoJambExecution':'Keep both structural jamb receivers active whenever the full guard is loaded. Independently capture the complete guard and establish a separate temporary barrier before either jamb release. The single-jamb calculation is a rejected removal sequence and does not size the installed pair.', 'tubesOnlyKgAcrossEight':fixed_steel,'tubesOnlyMetalConductionWPerK':conductance,'additionalM16IdealStraightMetalWPerK':8*2*2*math.pi*.016**2/4*16/.4025,'limits':'The 40x40x3 trial fails the one-jamb lost-support comparison. A complete stable two-jamb frame could instead require a positively supported, wind-restricted replacement sequence with independent temporary guard. Confirm real guard frame/bolt reactions, front and rear plate bearing/pullout/prying, formed pocket/water collar, anchor/steel clashes, normal wall pressure and coupled weak-axis jamb, receiver withdrawal and roof access. M16 bolts, plates, welds and collars add weight/heat to the partial tube quantity.'},'admitted':False}
output=Path(__file__).with_suffix('.json');contents=json.dumps(model,sort_keys=True,indent=2)+'\n'
if '--check' in sys.argv:assert output.read_text()==contents
else:output.write_text(contents)
print('Outer jamb foot, guard stress',heat[2],sigma)
