"""Private physical one-root module hypothesis. No route/assembly is accepted.

Unlike a root-pitch list, this enumerates mitered corner polygons, real open
ends, joint closure stock, supports, head-straddling bodies and full part size.
"""
from pathlib import Path
import argparse
import hashlib
import json
import math
import sys

HERE=Path(__file__).resolve().parent
sys.dont_write_bytecode=True
parser=argparse.ArgumentParser()
parser.add_argument('--repo',type=Path,required=True)
parser.add_argument('--check',action='store_true')
args=parser.parse_args()
ROOT=args.repo.resolve()
sys.path.insert(0,str(ROOT/'project/rof/studies'))
import roof_water_edges as e
import roof_water_heads as h


def polygon_properties(p):
    cross=[a[0]*b[1]-b[0]*a[1] for a,b in zip(p,p[1:]+p[:1])]
    area=sum(cross)/2
    cx=sum((a[0]+b[0])*c for a,b,c in zip(p,p[1:]+p[:1],cross))/(6*area)
    cy=sum((a[1]+b[1])*c for a,b,c in zip(p,p[1:]+p[:1],cross))/(6*area)
    return abs(area),[cx,cy]


def world(face,r,u):
    if face=='north':return [u,12000+r]
    if face=='south':return [u,-r]
    if face=='east':return [12000+r,u]
    return [-r,u]


def bed(face,u,primary):
    if face in ('north','south'):
        return e.p_bed(face,u) if primary else e.f_rim(face,u)-125
    return (e.primary['bed'] if primary else e.fault['bed'])-abs(u-6000)/200


modules=[];joints=[];summary=[]
for primary,inside,outside,rear,front,crossarm_wall,arm_length,fold_stock in [
    (True,170.,520.,230.,130.,3,.4,60),
    (False,125.,670.,125.,125.,4,.6,20),
]:
    name='primary' if primary else 'lower'
    mean=(inside+outside)/2;width=outside-inside;pitch=(12000+2*mean)/16
    count_start=len(modules)
    for face in ('north','east','south','west'):
        for j in range(16):
            a=-mean+j*pitch;b=a+pitch;root=(a+b)/2
            def lo(r,gap=10):return -r+gap/math.sqrt(2) if j==0 else a+gap/2
            def hi(r,gap=10):return 12000+r-gap/math.sqrt(2) if j==15 else b-gap/2
            p=[[inside,lo(inside)],[outside,lo(outside)],[outside,hi(outside)],[inside,hi(inside)]]
            raw=[[inside,lo(inside,0)],[outside,lo(outside,0)],[outside,hi(outside,0)],[inside,hi(inside,0)]]
            area,centroid=polygon_properties(p);raw_area,_=polygon_properties(raw)
            inner_length=hi(inside)-lo(inside);outer_length=hi(outside)-lo(outside)
            average_length=(inner_length+outer_length)/2
            rail_axes=[inside+40,outside-40]
            rail_lengths=[hi(r)-lo(r) for r in rail_axes]
            ribs=[]
            for k in range(-4,4):
                u=root+(k+.5)*200
                if j not in (0,15) and not (a+5<=u<=b-5):continue
                rmin=max(inside,10/math.sqrt(2)-u if j==0 else inside,
                    u-12000+10/math.sqrt(2) if j==15 else inside)
                if rmin<outside and min(lo(inside),lo(outside))<=u<=max(hi(inside),hi(outside)):
                    ribs.append({'kind':'transverse','alongMM':u,'radialMM':[rmin,outside],'lengthMM':outside-rmin})
            if j in (0,15):
                ribs.append({'kind':'miter end support','lengthMM':width*math.sqrt(2)})
            copper=(area+(rear*inner_length+front*outer_length)+fold_stock*average_length)*8940/1e9
            backing=area*2*8000/1e9
            rail_mass=sum(rail_lengths)/1000*e.rail_kg
            rib_mass=sum(r['lengthMM'] for r in ribs)/1000*e.rib_kg
            arm_mass=h.section(160,25,crossarm_wall)['area']*.008*arm_length
            seam_profile_straight=width+rear+front+fold_stock
            seam_profile_miter=width*math.sqrt(2)+rear+front+fold_stock
            straight_joint=seam_profile_straight/1000*.090*.001*8940+.2512
            miter_joint=seam_profile_miter/1000*.090*.001*8940+.2512
            # Each body carries half of each adjacent complete closure.
            assigned_joint=straight_joint if j not in (0,15) else (straight_joint+miter_joint)/2
            wet_body_mass=copper+backing+rail_mass+rib_mass+arm_mass+assigned_joint
            station=(e.pstations[face] if primary else e.fstation) if face in e.pstations else None
            straddles=station is not None and min(u for r,u in p)<station<max(u for r,u in p)
            probe=[min(u for r,u in p),max(u for r,u in p),root]
            if straddles:probe += [station-.00001,station+.00001]
            heights=[bed(face,u,primary) for u in probe]
            jump=abs(bed(face,station-.00001,primary)-bed(face,station+.00001,primary)) if straddles else 0
            along_size=max(u for r,u in p)-min(u for r,u in p)
            modules.append({'id':f'{name}-{face}-{j+1:02d}','circuit':name,'face':face,
                'rootAlongMM':root,'rootMeanRadialMM':mean,'sourceTributaryMM':pitch,
                'corner':j in (0,15),'headStationWithinPlanMM':station if straddles else None,
                'bodyPolygonRadialAlongMM':p,'bodyPolygonWorldXYMM':[world(face,r,u) for r,u in p],
                'untrimmedTributaryAreaMM2':raw_area,'bodyFloorAreaMM2':area,
                'floorCentroidRadialAlongMM':centroid,
                'floorCentroidOffsetFromSourcePointMM':[centroid[0]-mean,centroid[1]-root],
                'innerOuterWallLengthsMM':[inner_length,outer_length],
                'railAxesRadialMM':rail_axes,'railLengthsMM':rail_lengths,'ribs':ribs,
                'grossPlanRadialAlongMM':[width,along_size],
                'meanBedReferenceEnvelopeMM':[min(heights),max(heights)],
                'bodyPlus27CarrierVerticalEnvelopeMM':max(heights)+rear-(min(heights)-27),
                'meanBedStepAtHeadMM':jump,
                'movingDryMaterialKG':{'1MMCopperWithSourceFolds':copper,'2MMBacking':backing,
                    'two80x25x2Rails':rail_mass,'20x25x2Ribs':rib_mass,'movingCrossarm':arm_mass,
                    'halfEachAdjacentWetClosure':assigned_joint,'total':wet_body_mass},
                'source50KGPerMRemovalMassKG':50*pitch/1000,
                'massReserveBeforeUnpricedToolsClipsAndHeadStepKG':50*pitch/1000-wet_body_mass,
                'existing600AlongBayReserveAfter10EachMM':(600-along_size)/2-10,
                'trial1200AlongBayReserveAfter10EachMM':(1200-along_size)/2-10,
                'openInterfaces':(['Miter floor heights and corner rail/end-rib support must be joined; source centreline grade alone does not define the corner surface.'] if j in (0,15) else [])
                    +(['The source mean-bed jump needs a real head-side channel/expansion closure; it is not one planar trough.'] if straddles else [])
                    +['This wet-body mass excludes the fixed roots and both fixed aprons. It is not the total installed50 kg/m schedule.',
                        'Actual resultant and root couple must fit the native signed load family; a positive scalar mass reserve does not establish that.',
                        'Open ends have no invented crosswalls. Cut-neighbour flow needs contained reception before releasing either closure.']})
        for seam in range(1,16):
            joints.append({'circuit':name,'face':face,'kind':'straight','alongMM':-mean+seam*pitch,
                'nominalClearGapMM':10,'projectedSleeveWidthMM':70,'developedSleeveWidthMM':90,
                'developedCrossProfileMM':width+rear+front+fold_stock,
                'completePricedMetalKG':straight_joint})
    for corner,pair in [('NW',['north-01','west-16']),('NE',['north-16','east-16']),
                        ('SE',['south-16','east-01']),('SW',['south-01','west-01'])]:
        joints.append({'circuit':name,'corner':corner,'kind':'miter','modulePair':pair,
            'normalClearGapMM':10,'projectedSleeveWidthNormalToJointMM':70,'developedSleeveWidthMM':90,
            'developedCrossProfileMM':width*math.sqrt(2)+rear+front+fold_stock,
            'completePricedMetalKG':miter_joint})
    local=modules[count_start:]
    assert len(local)==64
    assert abs(sum(m['untrimmedTributaryAreaMM2'] for m in local)-4*width*(12000+2*mean))<1e-6
    summary.append({'circuit':name,'bodies':64,'straightBodies':56,'miterEndedBodies':8,
        'straightJoints':60,'miterJoints':4,
        'maximumBodyAlongMM':max(m['grossPlanRadialAlongMM'][1] for m in local),
        'maximumMovingDryMaterialKG':max(m['movingDryMaterialKG']['total'] for m in local),
        'leastScalarRemovalMassReserveKG':min(m['massReserveBeforeUnpricedToolsClipsAndHeadStepKG'] for m in local),
        'headStraddlingModules':[{'id':m['id'],'headStationMM':m['headStationWithinPlanMM'],
            'meanBedStepMM':m['meanBedStepAtHeadMM']} for m in local if m['headStationWithinPlanMM'] is not None],
        'least1200AlongBayReserveMM':min(m['trial1200AlongBayReserveAfter10EachMM'] for m in local)})

report={'status':'UNSELECTED PHYSICAL INVENTORY HYPOTHESIS; NO ORDINARY RENEWAL ROUTE ACCEPTED',
    'basis':'Reviewed a9f7fddc/f49968e source dimensions, with explicit new10 mm joints and miter-ended one-root bodies. Exact input hashes below govern reproduction.',
    'jointAuthority':'The10 mm seams are trial geometry. The source60 mm long-arm thermal gap is not inherited as an every-bay seam.',
    'summary':summary,'modules':modules,'joints':joints,
    'newBodyRestHypothesis':{'alongMM':[-600,600],'radialMM':[1600,2350],
        'bodyRestRadialCentreMM':2000,'workerRadialAlongMM':[2000,-1050],
        'workerRadiusMM':300,'sideGuardAlongMM':-650,'deckZMM':6400,'restZMM':6800,
        'secondTranslationMM':900,'groundNestRadialMM':[2500,3250],'groundNestAlongMM':[-600,600],
        'status':'Plan-size hypothesis only. Complete grips, rain tray, ground/site fields, capacity and corner transfer remain unjoined.'},
    'rainDecision':'Do not fit100 mm drains in a fictional60 mm seam. Test a retained upper turn-down, removable lower apron, draining/capping while over the intact lower collector, and a forward-draining lid over a continuous local catch. No contained first-release interception is yet selected.',
    'validation':{'128PhysicalPlanPolygonsEnumerated':True,'untrimmedRingAreaExactlyReconciled':True,
        'actualCornerAndHeadSpecialsExposed':True,'source600BayControlRetained':True,'wholeAssemblyAccepted':False}}
source_paths=['project/rof/studies/roof_water_edges.py','project/rof/studies/roof_water_heads.py',
    'project/rof/studies/roof_water_movement.json','project/mat/studies/ring-roof-family.json',
    'project/had/studies/water-replan.json','project/had/studies/current-house-services.json',
    'project/rwt/studies/selected-water-event.json','project/rwt/studies/court-service-selection.json',
    'project/rwt/studies/over-roof-site-envelope.json','project/mat/studies/plant-threshold.json',
    'project/str/studies/reconciled-house-interface.json']
report['sourceHashes']={q:hashlib.sha256((ROOT/q).read_bytes()).hexdigest() for q in source_paths}
report['scriptSHA256']=hashlib.sha256(Path(__file__).read_bytes()).hexdigest()
contents=json.dumps(report,indent=2)+'\n'
target=HERE/'outer-module-inventory.json'
if args.check:assert target.read_text()==contents,'Rebuild the private physical-module inventory'
else:target.write_text(contents)
print(json.dumps({'status':report['status'],'summary':summary,'report':str(HERE/'outer-module-inventory.json')},indent=2))
