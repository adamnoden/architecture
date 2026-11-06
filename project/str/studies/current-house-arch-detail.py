"""Check the actual cage at the corner arch and the independently bearing outer leaf."""
from itertools import pairwise, product
from pathlib import Path
import json
import math
import runpy
import sys

D = Path(__file__).resolve().parent
args = sys.argv[:]
sys.argv = [args[0], '--check']
corner = runpy.run_path(str(D/'current-house-ground-ties.py'))
sys.argv = args
H = json.loads((D.parents[1] / 'had/studies/water-replan.json').read_bytes())['model']
frames = json.loads((D/'current-house-coupled-arches.json').read_text())
R = 1000**2/(8*300)+150
ang = math.asin(500/R)
centre_z = 3450+2850-R
# A local 28 degree turn to a vertical leg. Full yield, straight development
# beyond this turn. The bend is not claimed as anchorage length.
bend_radius = 80
bar_d = 16
need = bar_d*(500/1.15)/(4*2.1)
length = 900
assert length > need
upper_stations = [745,815]
trial = corner['screen'](upper_stations, 20)
assert trial['interaction'] < 1
original = corner['bars']([850,950])
repositioned = corner['bars'](upper_stations)

def minimum_to_vertical_bars(x, lane, cage):
    return min(math.hypot(x-(262.5+bx), lane-by) - (16+20)/2 for bx, by in cage)

legs = []
for radial in [R+49, R+215-49]:
    start = (1800-radial*math.sin(ang), centre_z+radial*math.cos(ang))
    angle_to_vertical = math.pi/2-ang
    def bend(phi):
        # At the start the tangent runs down/left. Its X component tends to zero.
        return (start[0] - bend_radius*(math.cos(angle_to_vertical-phi)-math.cos(angle_to_vertical)),
                start[1] - bend_radius*(math.sin(angle_to_vertical)-math.sin(angle_to_vertical-phi)))
    end = bend(angle_to_vertical)
    
    # Analytical minimum X distance: the projection is monotone on the bend.
    def minimum(cage):
        return min(math.hypot(max(end[0]-262.5-bx, 262.5+bx-start[0], 0), by-lane)-18
                   for bx, by in cage for lane in [49,91])
    legs.append({'start':start, 'startVertical':end,'endVertical':[end[0],end[1]-length],
                 'originalBarSurfaceClearance':minimum(original),
                 'nominal820_935LeastClear':minimum(corner['bars']([820,935])),
                 'clearAfterTwoFiveMMPlacementOffsets':minimum(repositioned)-10,
                 'shiftedBarSurfaceClearance':minimum(repositioned),
                 'verticalBarSurfaceClearance':min(minimum_to_vertical_bars(end[0],y,repositioned) for y in [49,91]),
                 'verticalTailEndCoverToRawJamb':1300-end[0]-8,
                 'minimumBendCoverToRawJamb':1300-start[0]-8})
assert min(z['clearAfterTwoFiveMMPlacementOffsets'] for z in legs)>25
# 37.5 mm of existing masonry between the former structural toe and raw jamb
# becomes integral concrete. A matching narrow extension below the 900 mm
# tail preserves concrete around the full curve, with the opening at X1300.
local_z = frames['recomputedMembers']['localLToeGlobalZ']
assert local_z[0]+50 < min(z['endVertical'][1] for z in legs) and local_z[1]-100 > max(z['start'][1] for z in legs)
material = (1300-1262.5)*140*(local_z[1]-local_z[0])/1e9
ring_length=(R+107.5)*2*ang/1000
wide_added=8*(.100*.215*ring_length+.100*.205*(frames['geometry']['springZ']-3920)/1000)
# In-plane relocation over 1000 mm before the anchored bar reaches the
# L. Four bars per leg keep the lower registered DPC hole and lower cage.
profile=[{'station':old,'upper':new,'offset':new-old,'rise':1000,'maximumLinearSlope':abs(new-old)/1000}
         for old,new in zip([850,950],upper_stations)]

# A genuine 102.5 weather-leaf arch bears on the outer jambs and carries its
# own ring and spandrel to the proposed high eave. Give no floor/cover/inner
# RC action to the external brick and no useful weight from the adjacent arch.
midR=R+107.5
x0,x1=1800-midR*math.sin(ang),1800+midR*math.sin(ang)
z0=centre_z+midR*math.cos(ang)
peak=centre_z+midR
roof=json.loads((D/'current-house-welded-heel.json').read_text())['height']['eave']

def weather_arch(spandrel, width=1000):
    R=width**2/(8*300)+150
    ang=math.asin(width/(2*R));midR=R+107.5;centre_z=3450+2850-R
    x0,x1=1800-midR*math.sin(ang),1800+midR*math.sin(ang)
    z0=centre_z+midR*math.cos(ang);peak=centre_z+midR
    points=[]
    for i in range(360):
        th=-ang+2*ang*(i+.5)/360
        x=1800+midR*math.sin(th)
        delta=2*ang/360
        width=midR*math.cos(th)*delta
        top=centre_z+math.sqrt((R+215)**2-(x-1800)**2)
        weight=((R+215)**2-R**2)*delta/2*102.5*20/1e9
        weight+=max(roof-top,0)*width*102.5*20/1e9*spandrel[int(x>=1800)]
        points.append((x,1.35*weight))
    vright=sum(f*(x-x0)/(x1-x0) for x,f in points)
    vleft=sum(f for x,f in points)-vright
    def moment(x):
        return (vleft*(x-x0)-sum(f*(x-t) for t,f in points if t<x))/1000
    h=moment(1800)/((peak-z0)/1000)
    eccentric=pressure=0
    for i in range(241):
        x=x0+(x1-x0)*i/240
        th=math.asin((x-1800)/midR)
        z=centre_z+midR*math.cos(th)
        shear=vleft-sum(f for t,f in points if t<x)
        normal=h*math.cos(th)-shear*math.sin(th)
        assert normal>0
        e=abs(moment(x)-h*(z-z0)/1000)*1000/normal
        assert e<215/2
        eccentric=max(eccentric,e)
        stress=(normal*1000/(102.5*215)*(1+6*e/215) if e<=215/6 else
                2*normal*1000/(102.5*3*(215/2-e)))
        pressure=max(pressure,stress)
    return {'spandrelPresentLeftRight':spandrel,'horizontalThrust':h,'springXOffset':midR*math.sin(ang)-width/2,'springZ':z0,'leftV':vleft,'rightV':vright,
            'maxEccentricity':eccentric,'peakCompressionMPa':pressure}

# The opposite jamb stands directly above the solid side of each real ground
# opening. Continue the H16 legs straight 900 below the first-floor beam top.
# A local 200-wide plinth allows the vertical bars to cross the edge-beam H12
# without collision and extends just 150 down into the lower wall head.
for opening in H['openings']['FIRST']:
    if opening['wall'].startswith('outer-') and opening['centre'] in [1800,10200]:
        lower=next(q for q in H['openings']['GROUND'] if q['wall']==opening['wall'] and q['centre']==opening['centre'])
        assert lower['width']==1000
axis_ends=[3600-z['startVertical'][0] for z in legs]
base_y=[17,123]
crossing_clear=min(abs(y-b)-8-6 for y in base_y for b in [49,91])
# The existing 140 wide cage opens to 200 here. Replacement closed H8 rings
# at 100 centres must enclose the new width and the original longitudinal bars.
# Reserve X and check nearest ring centre for each vertical H16 leg.
phase=max(range(100),key=lambda q:min(abs((x-q+50)%100-50) for x in axis_ends))
ring_clear=min(abs((x-phase+50)%100-50) for x in axis_ends)-8-4
assert min(crossing_clear,ring_clear)>10
jamb_w=frames['geometry']['oppositeJamb'][1]
ground_ext=2850-R+math.sqrt((R+215)**2-500**2)
base_low=3920-length
extra_volume=(jamb_w*.060/1000*(.98+.55/2)+jamb_w*.140/1000*.150)*8
right_base={'verticalX':axis_ends,'jambWidth':jamb_w,'verticalNormalAtHead':[49,91],
            'verticalNormalAtFloor':base_y,'transitionZ':[4000,4550],
            'localConcreteNormal':[-30,170],'plinthZ':[base_low,4000],
            'firstFloorBeamZ':[3170,3920],'lowerArchMaxExtradosInsidePlinthX':ground_ext,
            'verticalReserveAboveLowerExtrados':base_low-ground_ext,
            'straightDevelopmentPastBeamTop':length,'lowerGroundHeadDepthReplaced':3170-base_low,
            'minimumOrthogonalH12Clear':crossing_clear,'clearAfterTwoFiveMMPlacementOffsets':crossing_clear-10,
            'localH8HoopStationPhaseIn100':phase,'minimumVerticalBarToHoopSurface':ring_clear,
            'jambNormalCoverAtWideBase':17+30-8-6,
            'additionalGrossConcreteM3AcrossEightApprox':extra_volume,
            'physicalPrice':'30 mm into room and 30 mm into the 160 mm cavity at eight 205 mm-wide jamb feet, tapering back above. The existing protected frame edge stays 35 mm away in X. Check the local return, floor finish, continuous insulation and guard bracket. Widen and close the local H8 beam hoops around both new H16 lanes and original H12 steel. Hoop transitions, cast access and laps remain to be scheduled.'}
outer=[weather_arch(pair) for pair in product([0,1],repeat=2)]
# At the floor line, use only the continuous rectangular outer jamb above
# FFL and below spring as stabilising weight. Adjacent arches and returns
# provide zero helpful thrust in this comparison. Keep both footing and bed
# shear residuals for the owning wall-base detail.
abutments=[]
for op in H['openings']['FIRST']:
    if not op['wall'].startswith('outer-') or op['centre'] not in [1800,10200]:continue
    neighbours=sorted((z['centre']-z['width']/2,z['centre']+z['width']/2) for z in H['openings']['FIRST'] if z['wall']==op['wall'])
    l,r=op['centre']-500,op['centre']+500
    for side,breadth in [('left',l-max([0]+[bb for aa,bb in neighbours if bb<l])),('right',min([12000]+[aa for aa,bb in neighbours if aa>r])-r)]:
        vals=[]
        for load in outer:
            V=load['leftV' if side=='left' else 'rightV']*.9/1.35
            W=.9*17*.1025*(breadth/1000)*2.550
            H0=load['horizontalThrust'];xj=(x1-2300)/1000
            from_edge=(W*breadth/2000+V*xj+H0*(z0-3450)/1000)/(W+V)*1000
            contact=3*(breadth-from_edge) if from_edge>breadth*2/3 else breadth
            peak_stress=None if contact<=0 else 2*(W+V)*1000/(102.5*contact) if contact<breadth else (W+V)*1000/(102.5*breadth)*(1+6*abs(from_edge-breadth/2)/breadth)
            vals.append({'resultantFromOpeningEdge':from_edge,'edgeReserve':breadth-from_edge,'contact':contact,'peakMPa':peak_stress,'shearOverNormal':H0/(W+V)})
        abutments.append({'wall':op['wall'],'centre':op['centre'],'side':side,'grossContinuousWidth':breadth,'minEdgeReserve':min(v['edgeReserve'] for v in vals),'maxHorizontalOverVertical':max(v['shearOverNormal'] for v in vals),'allIsolatedCasesStand':all(v['contact']>0 for v in vals),'largestStressInStableCasesMPa':max(v['peakMPa'] for v in vals if v['peakMPa'] is not None)})
# For the permanent facade, calculate BOTH physical neighbouring masonry arches.
# Their unequal spans and worst density/force factors are explicit. The one-arch
# controls above describe construction/removal states that need shoring.
from functools import lru_cache
@lru_cache(None)
def fully_built(width):return weather_arch((1,1),width)
paired=[]
for face in ['outer-south','outer-north','outer-east','outer-west']:
    openings=sorted([q for q in H['openings']['FIRST'] if q['wall']==face],key=lambda q:q['centre'])
    for left,right in pairwise(openings):
        if left['centre'] not in [1800,10200] and right['centre'] not in [1800,10200]:continue
        start=left['centre']+left['width']/2;end=right['centre']-right['width']/2;bw=end-start
        l=fully_built(left['width']);r=fully_built(right['width']);cases=[]
        for fleft,fright in product([.9/1.35,1.],repeat=2):
            L=l['rightV']*fleft;R0=r['leftV']*fright;W=.9*17*.1025*(bw/1000)*2.550
            resultant=(W*bw/2+L*l['springXOffset']+R0*(bw-r['springXOffset'])+
                       fleft*l['horizontalThrust']*(l['springZ']-3450)-fright*r['horizontalThrust']*(r['springZ']-3450))/(W+L+R0)
            contact=min(bw,3*min(resultant,bw-resultant))
            cases.append({'edgeReserve':min(resultant,bw-resultant),'contact':contact,
                          'horizontalShear':abs(fleft*l['horizontalThrust']-fright*r['horizontalThrust']),
                          'bearingStress':(2*(W+L+R0)*1000/(102.5*contact) if contact<bw else (W+L+R0)*1000/(102.5*bw)*(1+6*abs(resultant-bw/2)/bw))})
        paired.append({'wall':face,'jamb':[start,end],'spans':[left['width'],right['width']],
                       'minimumEdgeReserve':min(c['edgeReserve'] for c in cases),'maximumHorizontalShear':max(c['horizontalShear'] for c in cases),'maximumBearingMPa':max(c['bearingStress'] for c in cases)})
assert all(c['minimumEdgeReserve']>0 for c in paired)
result={'role':'Curved RC inner arch and independent outer brick arch. The nominal bar placement is a candidate. Confirm the complete simultaneous cage, tolerances, fire, anchorage and temporary works before selection.',
        'archBars':{'diameter':16,'bendCentreRadius':bend_radius,'straightDevelopment':length,'requiredFullYieldAt2p1MPa':need,'legs':legs,
                    'upperLStations':profile,'transitionGlobalZ':[4000,5000], 'minimumTailEndZ':min(z['endVertical'][1] for z in legs),
                    'upperLComparedOnPreviousBiaxialDomain':trial,'priorBaseDomain':'The larger registered base demands screen this trial. New arch increments and normal wind still need a simultaneous pier/foundation recheck.',
                    'localToe':{'oldX':1262.5,'newX':1300,'z':local_z,'newConcreteM3AcrossEight':8*material,
                                'massPrice':'Within the existing 140 wall footprint. Replaces masonry up to the rough jamb. Actual stirrup outside surface, opening intrados and method of placing concrete around each bar still govern.'},
                    'wideControl':{'normalWidth':240,'outwardIntoCavity':50,'inwardIntoRoom':50,'additionalM3ForEightArchesAndJambs':wide_added,'additionalGrossKN':wide_added*25,'excludes':'Includes the curved ring and ordinary jamb only. The widened pier anchorage region and its new reveal, insulation and frame coordination add further cost.'}},
        'oppositeJambBase':right_base,
        'outerBrick':{'width':102.5,'ringRadial':215,'eave':roof,'centres':[x0,x1],'cases':outer,'jambFloorLine':abutments,'permanentPairedArchAtSharedJamb':paired,'abutmentBasis':'One corner opening loaded at a time. The full gross continuous side territory is conditional on effective bonding and direct support to the floor level. Only 17 kN/m³ and 0.90 of the solid jamb below spring count. The paired vertical arch reaction also receives 0.90/1.35 while the outgoing horizontal component retains 1.35. Half-built and full spandrels checked. No neighbouring beam, return, wall tie or floor friction credit.','remaining':'Verify effective jamb width, return bonding, bed shear, local thrust reactions at the jamb bases, mortar/unit orientation, wind restraint and setting/shoring. The inner RC and the external grille offer no assumed masonry tie.'},'admitted':False}
output=Path(__file__).with_suffix('.json')
contents=json.dumps(result,indent=2,sort_keys=True)+'\n'
if '--check' in sys.argv:
    assert output.read_text()==contents
else:
    output.write_text(contents)
print('Corner detail',need,[(z['shiftedBarSurfaceClearance'],z['minimumBendCoverToRawJamb']) for z in legs],trial['interaction'],outer[-1])
