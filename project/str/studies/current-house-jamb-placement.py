"""Locate continuous vertical placing lanes through the opposite jamb foot."""
import itertools
import json
import math
from pathlib import Path
import sys

D=Path(__file__).resolve().parent
base=json.loads((D/'current-house-arch-detail.json').read_text())['oppositeJambBase']
vertical=base['verticalX']; lanes=base['verticalNormalAtFloor'];phase=base['localH8HoopStationPhaseIn100']
# Coordinates X, inward-normal and Z. The bar endpoints include the true
# closed links, not just four dots where the section happens to be cut.
bars=[]
def bar(name,a,b,diameter):bars.append((name,a,b,diameter/2))
for x,y in itertools.product(vertical,lanes):bar('H16 jamb leg',(x,y,3020),(x,y,4000),16)
for z in range(3035,4001,75):
    l,r=vertical[0]-11,vertical[1]+11; f,b=lanes[0]-11,lanes[1]+11
    points=[(l,f,z),(r,f,z),(r,b,z),(l,b,z),(l,f,z)]
    for a,v in itertools.pairwise(points):bar('H6 jamb confinement',a,v,6)
for y in [49,91]:
    for z in [3219,3256,3293,3330,3455,3515,3575,3635,3760,3797,3834,3871]:
        bar('H12 floor longitudinal',(2200,y,z),(2600,y,z),12)
for x in range(2200+phase,2600+phase,100):
    points=[(x,-46,3209),(x,101,3209),(x,101,3881),(x,-46,3881),(x,-46,3209)]
    for a,v in itertools.pairwise(points):bar('H8 widened floor link',a,v,8)
# Orient the four H12/150 slab mesh layers across the 200-deep first floor.
# Interior slab extends from this edge into increasing normal. Its first
# parallel wire sits 75 beyond the Y70 axis. Terminal mesh anchorage beyond
# this local contact box remains the floor diaphragm designer's duty.
for z in [3213,3327]:bar('H12 floor mesh parallel',(2200,145,z),(2600,145,z),12)
for x in [2300,2450,2600]:
    for z in [3225,3315]:bar('H12 floor mesh normal',(x,0,z),(x,300,z),12)

def line_gap(a,b,c,d):
    # All paths and bars in this lower foot are straight and axis-aligned.
    return math.sqrt(sum(max(0,min(a[i],b[i])-max(c[i],d[i]),min(c[i],d[i])-max(a[i],b[i]))**2 for i in range(3)))

def check_path(points,radius,normal_faces):
    least=(float('inf'),'')
    for a,b in itertools.pairwise(points):
        for name,c,d,steel_radius in bars:
            clearance=line_gap(a,b,c,d)-steel_radius-5-radius
            least=min(least,(clearance,name))
        for i,l,h in [(0,2300,2505),(1,*normal_faces)]:
            least=min(least,(min(a[i],b[i])-l-5-radius,'formed edge'),(h-max(a[i],b[i])-5-radius,'formed edge'))
    return {'residual':least[0],'governs':least[1]}

# Price four versions with the whole new width facing outward. Grow the
# projected four-bar pattern only as far as the reinforcement really fits.
# The two vertical insertion corridors fall inside different cage bays.
comparisons=[]
for width in [200,210,225,240]:
    normal_faces=[140-width,140];outer_lane=140-width+47;inner_lane=14
    cage=[]
    for name,a,b,r in bars:
        def adjust(v):
            x,y,z=v
            if name=='H16 jamb leg' and y==lanes[0]:y=outer_lane
            if name=='H6 jamb confinement' and y==lanes[0]-11:y=outer_lane-11
            if name=='H8 widened floor link' and y==-46:y=normal_faces[0]+39
            return x,y,z
        cage.append((name,adjust(a),adjust(b),r))
    old=bars;bars=cage
    best=[]
    for low,high in [(normal_faces[0]+18,inner_lane-8),(95,123)]:
        lanes_by_x=[]
        for x in range(2319,2489,2):
            for y in range(low,high+1,2):
                v=check_path([(x,y,4000),(x,y,3035)],12.5,normal_faces)
                lanes_by_x.append((v['residual'],x,y,v['governs']))
        best.append(max(lanes_by_x))
    comparisons.append({'width':width,'normalFaces':normal_faces,'H16Normal':[outer_lane,inner_lane],
          'minimumParallelH16AfterTwoFiveOffsets':inner_lane-outer_lane-16-10,
          'remainingCavity':160-(width-140),'placingLanes':best,
          'bottleneckAvailableODAfterFormAndSteelTolerances':25+2*min(row[0] for row in best),
          'eightFeetAdditionalGrossConcreteM3':8*.205*((width-140)/1000*(.98+.55/2)+.14*.15)})
    bars=old
selected=next(q for q in comparisons if q['width']==225)
assert selected['minimumParallelH16AfterTwoFiveOffsets']>=25
assert max(q['minimumParallelH16AfterTwoFiveOffsets'] for q in comparisons if q['width']<225)<25
# The aggregate route crosses at Z3358 between the main longitudinal layers.
probe=check_path([(2379,70,4000),(2379,70,3358),(2379,-15,3358)],8,[-85,140])
probe2=check_path([(2379,70,3358),(2379,117,3358)],8,[-85,140])
assert min(probe['residual'],probe2['residual'])>=0
result={'footNormalWidth':225,'barsAndFormAdverseSetout':5,'orthogonalH12H16MinimumSurfaceGapNominal':base['minimumOrthogonalH12Clear'],'orthogonalSurfaceGapAfterTwoFiveOffsets':base['clearAfterTwoFiveMMPlacementOffsets'],
        'widthComparison':comparisons,'aggregateCentreConnectingRoute':{'maxStone':16,'x':2379,'normal':[-15,70,117],'transferLevel':3358,'leastResidual':min(probe['residual'],probe2['residual'])},
        'nativePokerComparator':{'manufacturer':'Altrad Belle','reference':'BGA 25 165.9.000','source':'https://www.altrad-belle.com/index_old.php?id=17&p=products','diameter':25,'headLength':295,'shaftLengthM':5,'motionAmplitude':.8,'maxHeadSweepDiameter':26.6,'headResidualAfterFullRadialAmplitude':min(q[0] for q in selected['placingLanes'])-.8,'remaining':'Source gives no complete coupler/shaft OD. The maximum total OD and setout are explicit specification requirements. Check the actual flexible section for the full 965 mm insertion before a pour.'},
        'sequence':'Cast the locally deepened lower wall head, slab/edge beam and foot to Z4000 under open top form. Lower the 25 mm probe in both listed corridors. Seat the next ordinary jamb pour on the prepared joint. Prove the actual material flows under the crossing bars and compacts by a physical pour. The geometric corridors are independent of the 11 mm remnant at a single orthogonal joint.',
        'admitted':False}
output=Path(__file__).with_suffix('.json');s=json.dumps(result,sort_keys=True,indent=2)+'\n'
if '--check' in sys.argv:assert output.read_text()==s
else:output.write_text(s)
print('Placing comparison',[(q['width'],q['bottleneckAvailableODAfterFormAndSteelTolerances']) for q in comparisons])
