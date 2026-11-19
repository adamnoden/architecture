"""Unselected 66-piece outer wet-body hypothesis on the original64 roots.

Head gaps split four original straddling pans, not their native root identities.
Known removable material atoms are mapped explicitly. Existing fixed stock and
seam load sharing remain separate qualifications; no native-force pass is inferred.
"""
from pathlib import Path
import argparse
import hashlib
import json
import math
import sys

HERE=Path(__file__).resolve().parent
parser=argparse.ArgumentParser()
parser.add_argument('--repo',type=Path,required=True)
parser.add_argument('--primary-spreader-depth',type=int,choices=[40,60,80],default=80)
parser.add_argument('--check',action='store_true')
parser.add_argument('--full-control-receipt',action='store_true',
    help='Write the full40/60 comparison receipt for hash reproduction; not needed in the repository.')
args=parser.parse_args()
ROOT=args.repo.resolve()
sys.dont_write_bytecode=True
sys.path.insert(0,str(ROOT/'project/rof/studies'))
import roof_water_edges as e
import roof_water_heads as h

source_path=ROOT/'project/rof/studies/outer_physical_checkpoint/outer-module-inventory.json'
old=json.loads(source_path.read_text())
native_queries=json.loads((ROOT/'project/rof/studies/roof_water_movement.json').read_text())['queries']
native_root_cache={}


def properties(p):
    c=[a[0]*b[1]-b[0]*a[1] for a,b in zip(p,p[1:]+p[:1])]
    area=sum(c)/2
    return abs(area),[sum((a[j]+b[j])*q for a,b,q in zip(p,p[1:]+p[:1],c))/(6*area) for j in (0,1)]


def clip(p,limit,keep_greater):
    out=[]
    for a,b in zip(p,p[1:]+p[:1]):
        ain=(a[1]>=limit if keep_greater else a[1]<=limit)
        bin=(b[1]>=limit if keep_greater else b[1]<=limit)
        if ain:out.append(a)
        if ain!=bin:
            t=(limit-a[1])/(b[1]-a[1]);out.append([a[0]+t*(b[0]-a[0]),limit])
    assert len(out)>=3
    return out


def cut_range(p,r):
    values=[]
    for a,b in zip(p,p[1:]+p[:1]):
        if abs(a[0]-r)<1e-7:values.append(a[1])
        if min(a[0],b[0])-1e-7<=r<=max(a[0],b[0])+1e-7 and abs(a[0]-b[0])>1e-8:
            t=(r-a[0])/(b[0]-a[0]);values.append(a[1]+t*(b[1]-a[1]))
    assert values
    return min(values),max(values)


def radial_range(p,u):
    values=[]
    for a,b in zip(p,p[1:]+p[:1]):
        if abs(a[1]-u)<1e-7:values.append(a[0])
        if min(a[1],b[1])-1e-7<=u<=max(a[1],b[1])+1e-7 and abs(a[1]-b[1])>1e-8:
            t=(u-a[1])/(b[1]-a[1]);values.append(a[0]+t*(b[0]-a[0]))
    return (min(values),max(values)) if values else None


def world(face,r,u):
    if face=='north':return [u,12000+r]
    if face=='south':return [u,-r]
    if face=='east':return [12000+r,u]
    return [-r,u]


def local_bed(parent,u):
    if parent['face'] in ('north','south'):
        return e.p_bed(parent['face'],u) if parent['circuit']=='primary' else e.f_rim(parent['face'],u)-125
    return (e.primary['bed'] if parent['circuit']=='primary' else e.fault['bed'])-abs(u-6000)/200


def native_root(parent):
    # Use the exact owning reference, including the corner station clamp.
    if parent['id'] in native_root_cache:return native_root_cache[parent['id']]
    radial=170 if parent['circuit']=='primary' else 125
    point=world(parent['face'],radial,parent['rootAlongMM'])
    rows=[r for r in native_queries if r['label'].startswith('outer') and 'absolute' in r['label']
        and r['references'][1] is None and
        all(abs(a-b)<1e-6 for a,b in zip(r['references'][0][1],point))]
    assert len(rows)==1,(parent['id'],point,len(rows))
    native_root_cache[parent['id']]=rows[0]['references'][0][0]
    return native_root_cache[parent['id']]


def native_along(parent):
    root=native_root(parent)
    return root[0] if parent['face'] in ('north','south') else root[1]


def vector(parent,mass,ru):
    xy=world(parent['face'],*ru);root=native_root(parent)
    down=mass*9.81;dx,dy=xy[0]-root[0],xy[1]-root[1]
    return {'forceXYZ_N':[0.,0.,-down],'momentXYZ_NMM':[-dy*down,dx*down,0.],
        'nativeDownMxGradientMyGradient_N_NMM_NMM':[down,down*dx,down*dy]}


def atom(parent,name,kg,ru,kind='removable wet body'):
    return {'component':name,'kind':kind,'massKG':kg,'centroidRadialAlongMM':ru,
        'centroidWorldXYMM':world(parent['face'],*ru),'sourceRootId':parent['id'],
        'nominalRootPacketStationAlongMM':parent['rootAlongMM'],
        'actualNativeAttachmentRadialAlongMM':[-332.5,native_along(parent)],
        'actualNativeAttachmentWorldXYMM':native_root(parent),
        'characteristicGravityAtSourceRoot':vector(parent,kg,ru)}


def total(atoms):
    mass=sum(a['massKG'] for a in atoms)
    ru=[sum(a['massKG']*a['centroidRadialAlongMM'][j] for a in atoms)/mass for j in (0,1)]
    return mass,ru


pieces=[];spreaders=[];roots=[];head_gaps=[]
for parent in old['modules']:
    primary=parent['circuit']=='primary'
    inside,outside=(170.,520.) if primary else (125.,670.)
    rear,front=(230.,130.) if primary else (125.,125.)
    full_wall=3 if primary else 4
    arm_length=.4 if primary else .6
    polygon=parent['bodyPolygonRadialAlongMM']
    station=parent['headStationWithinPlanMM']
    if station is not None:
        plans=[('a',clip(polygon,station-30,False)),('b',clip(polygon,station+30,True))]
        areas=[properties(p)[0] for _,p in plans]
        if primary and max(areas)/sum(areas)<.7:arm_widths=[80,80]
        else:arm_widths=[40 if a==min(areas) else 120 for a in areas]
        arm_walls=[3,3] if primary else [3 if b==40 else 4 for b in arm_widths]
        head_gaps.append({'sourceRootId':parent['id'],'face':parent['face'],'circuit':parent['circuit'],
            'headStationMM':station,'opposedWetEndStationsMM':[station-30,station+30],
            'gapMM':60,'originalMeanBedJumpMM':parent['meanBedStepAtHeadMM'],
            'status':'REAL SOURCE HEAD-END GAP; two-entry head turn-box and thermal/sliding connection remain unqualified.'})
    else:
        plans=[('',polygon)];arm_widths=[160];arm_walls=[full_wall]
    local=[]
    for (suffix,plan),arm_width,wall in zip(plans,arm_widths,arm_walls):
        name=parent['id']+('-'+suffix if suffix else '')
        area,centroid=properties(plan)
        back_range=cut_range(plan,inside);front_range=cut_range(plan,outside)
        common=[max(back_range[0],front_range[0]),min(back_range[1],front_range[1])]
        if suffix:
            pickup=max(common[0]+arm_width/2+10,min(common[1]-arm_width/2-10,centroid[1]))
            assert common[0]+arm_width/2+10<=pickup<=common[1]-arm_width/2-10
        else:pickup=parent['rootAlongMM']
        atoms=[atom(parent,'1 mm copper floor',area*8940/1e9,centroid),
            atom(parent,'2 mm 316L backing',area*2*8000/1e9,centroid)]
        for wall_name,r,height,span in [('back',inside,rear,back_range),('front',outside,front,front_range)]:
            atoms.append(atom(parent,'1 mm copper '+wall_name+' wall',(span[1]-span[0])*height*8940/1e9,[r,sum(span)/2]))
        # Explicit new fold allocation. The original source supplies only total
        # developed stock, so this physical assignment remains trial geometry.
        folds=[('rear top down-hem',inside,15,back_range),('front top down-hem',outside,25,front_range),
               ('front bottom down-return',outside,20,front_range)] if primary else [
               ('rear top down-hem',inside,10,back_range),('front top down-hem',outside,10,front_range)]
        for title,r,width,span in folds:
            atoms.append(atom(parent,'1 mm copper '+title,(span[1]-span[0])*width*8940/1e9,[r,sum(span)/2]))
        rails=[]
        for r in [inside+40,outside-40]:
            low,high=cut_range(plan,r)
            for a,b in [(low,min(high,pickup-arm_width/2)),(max(low,pickup+arm_width/2),high)]:
                if b>a:
                    rails.append({'radialMM':r,'alongMM':[a,b],'sectionMM':[80,25,2]})
                    atoms.append(atom(parent,'80x25x2 rail segment',(b-a)/1000*e.rail_kg,[r,(a+b)/2]))
        # Coplanar rail segments butt into the moving crossarm; no stacked25 mm
        # layer and no duplicated steel through the crossarm volume is claimed.
        ribs=[]
        for sign in [-1,1]:
            for k in range(6):
                u=pickup+sign*(arm_width/2+100+200*k)
                span=radial_range(plan,u)
                if span:
                    # Same25 mm layer: rib segments butt to the two80 mm
                    # rail faces instead of intersecting their closed boxes.
                    span=(max(span[0],inside+80),min(span[1],outside-80))
                    if span[1]>span[0]:
                        length=span[1]-span[0]
                        ribs.append({'alongMM':u,'radialMM':list(span),'kind':'transverse'})
                        atoms.append(atom(parent,'20x25x2 transverse rib',length/1000*e.rib_kg,[(span[0]+span[1])/2,u]))
        for a,b in zip(plan,plan[1:]+plan[:1]):
            if abs(a[0]-b[0])>1 and abs(a[1]-b[1])>1:
                lo=max(min(a[0],b[0]),inside+80);hi=min(max(a[0],b[0]),outside-80)
                if hi>lo:
                    endpoints=[[r,a[1]+(r-a[0])/(b[0]-a[0])*(b[1]-a[1])] for r in [lo,hi]]
                    length=math.dist(*endpoints)
                    ribs.append({'endsRadialAlongMM':endpoints,'kind':'miter end'})
                    atoms.append(atom(parent,'20x25x2 miter end rib',length/1000*e.rib_kg,
                        [(lo+hi)/2,sum(p[1] for p in endpoints)/2]))
        arm_area=h.section(arm_width,25,wall)['area']
        root_end=160 if primary else 105
        # Keep the complete source400/600 mm stock. Its free tail beyond the
        # wet front is physically present and enters the capture envelope.
        atoms.append(atom(parent,f'{arm_width}x25x{wall} moving crossarm',arm_area*.008*arm_length,
            [root_end+arm_length*500,pickup]))
        if suffix:
            end=station-30 if suffix=='a' else station+30
            profile=outside-inside+rear+front+(60 if primary else 20)
            # No end wall: these are an open discharge termination, supporting
            # end rib and captive metal fasteners, each separately located.
            atoms.append(atom(parent,'1 mm copper20 mm head-end termination',profile/1000*.020*.001*8940,
                [(inside+outside)/2,end]))
            rib_u=end-10 if suffix=='a' else end+10
            atoms.append(atom(parent,'20x25x2 head-end rib',(outside-inside-160)/1000*e.rib_kg,
                [(inside+outside)/2,rib_u]))
            atoms.append(atom(parent,'head-end captured fasteners',.05,[(inside+outside)/2,end]))
        kg,ru=total(atoms)
        water_depth=180 if primary else 175
        water_kg=area*water_depth/1e6
        native_dry_cap=parent['source50KGPerMRemovalMassKG']
        record={'id':name,'sourceRootId':parent['id'],'face':parent['face'],'circuit':parent['circuit'],
            'polygonRadialAlongMM':plan,'floorAreaMM2':area,'floorCentroidRadialAlongMM':centroid,
            'sourceRootAlongMM':parent['rootAlongMM'],'pickupAlongMM':pickup,
            'actualNativeAttachmentAlongMM':native_along(parent),
            'actualNativeAttachmentWorldXYMM':native_root(parent),
            'pickupOffsetFromNativeRootMM':pickup-parent['rootAlongMM'],
            'pickupBedZMM':local_bed(parent,pickup),'commonPlanAlongIntervalMM':common,
            'movingCrossarmSectionMM':[arm_width,25,wall],'rails':rails,'ribs':ribs,
            'atoms':atoms,'knownRemovableDryKG':kg,'knownDryCentroidRadialAlongMM':ru,
            'knownDryRootGravity':vector(parent,kg,ru),
            'uniformNativeDepthWaterComparison':{'depthMM':water_depth,'massKG':water_kg,
                'centroidRadialAlongMM':centroid,'rootGravity':vector(parent,water_kg,centroid),
                'qualification':'Geometric source-depth comparison only; not a new installed water-volume qualification.'},
            'factored2_25kPaFloorPressure':{'areaM2':area/1e6,'downwardForceN':2.25*area/1000,
                'upwardForceN':-2.25*area/1000,'rootDownwardVector':vector(parent,(2.25*area/1000)/9.81,centroid)},
            'nativeWholeRootDryCapKG':native_dry_cap,
            'movingCrossarmPlanRadialAlongMM':{'radial':[root_end,root_end+arm_length*1000],
                'along':[pickup-arm_width/2,pickup+arm_width/2]},
            'captureEnvelopePlanMM':{'radial':[min(root_end,min(x[0] for x in plan)),max(root_end+arm_length*1000,max(x[0] for x in plan))],
                'along':[min(x[1] for x in plan),max(x[1] for x in plan)]},
            'qualifications':['The fold allocation and coplanar rail-to-crossarm butt joints are new physical hypotheses. '
                'Actual fork, weld, end-rib, skin and grip projections remain outside this nominal pan polygon.',
                'Each removable piece is carried through its own pickup to its exact original native root. '
                'A head half does not rely on the other removable half for support.',
                'Longitudinal thermal sliding and sacrificial seam stiffness remain unqualified; no zero-moment joint is assumed.']}
        pieces.append(record);local.append(record)
    fixed_atoms=[]
    if station is not None:
        # Retained two-pickup spreader behind the secondary skin. Primary
        # radial stubs still pierce that skin and require explicit wet collars.
        axis=110 if primary else 75
        a=min(r['pickupAlongMM'] for r in local)-12.5
        b=max(r['pickupAlongMM'] for r in local)+12.5
        spreader_depth=args.primary_spreader_depth if primary else 80
        spreader_section=h.section(25,spreader_depth,2)
        kg_per_m=spreader_section['area']*.008
        fixed_atoms.append(atom(parent,f'25x{spreader_depth}x2 retained along spreader',(b-a)/1000*kg_per_m,[axis,(a+b)/2],
            'retained head-root support'))
        min_bed=min(r['pickupBedZMM'] for r in local)
        for row in local:
            u=row['pickupAlongMM'];stub_end=160 if primary else 105
            fixed_atoms.append(atom(parent,f'25x{spreader_depth}x2 retained radial pickup stub',(stub_end-axis)/1000*kg_per_m,
                [(axis+stub_end)/2,u],'retained head-root support'))
            rise=row['pickupBedZMM']-min_bed+40
            fixed_atoms.append(atom(parent,'25x50x2 retained height step',rise/1000*h.section(25,50,2)['area']*.008,
                [axis,u],'retained head-root support'))
            fixed_atoms.append(atom(parent,'new captive fork and pins allowance',.15,[stub_end,u],'retained head-root support'))
            if primary:
                fixed_atoms.append(atom(parent,'priced two-part80 mm apron crossing collar',.2436,[146,u],
                    'retained head-root support; wet geometry unresolved'))
        fixed_atoms.append(atom(parent,'spreader and stub weld metal allowance',.08,[axis,parent['rootAlongMM']],
            'retained head-root support'))
        fk,fc=total(fixed_atoms)
        water_depth=180 if primary else 175
        width=outside-inside
        whole_root_force=((1.35*50+1.5*width*water_depth/1000)*9.81/1000+2.25*width/1000)*parent['sourceTributaryMM']
        cantilever=max(abs(row['pickupAlongMM']-parent['rootAlongMM']) for row in local)
        branch_stress=whole_root_force*cantilever/spreader_section['Z']
        branch_deflection=whole_root_force*cantilever**3/(3*180000*spreader_section['I'])
        primary_gap=None
        if primary:
            lower_rim=max(e.f_rim(parent['face'],u) for u in [a,b,*[r['pickupAlongMM'] for r in local]])
            primary_gap={'spreaderStockTopZMM':min_bed-27,'spreaderStockBottomZMM':min_bed-27-spreader_depth,
                'largestIntactLowerRimAcrossPlanZMM':lower_rim,
                'nominalStockToIntactLowerRimMM':min_bed-27-spreader_depth-lower_rim,
                'afterHypothesised50Native8Lower1Spreader10SettingMM':min_bed-27-spreader_depth-lower_rim-69,
                'afterSameAnd100LowerLiftIfRadialOverlapPersistsMM':min_bed-27-spreader_depth-lower_rim-169,
                'scope':'Beam stock only. Forks/collars need their actual envelope. The100 mm lower lift requires radial release first.'}
        spreaders.append({'sourceRootId':parent['id'],'face':parent['face'],'circuit':parent['circuit'],
            'originalRootAlongMM':parent['rootAlongMM'],'beamPlanRadialAlongMM':{'radial':[axis-12.5,axis+12.5],'along':[a,b]},
            'actualNativeAttachmentWorldXYMM':native_root(parent),
            'newPickupStationsMM':[r['pickupAlongMM'] for r in local],
            'lowestBeamTopDatumZMM':min_bed-27,'atoms':fixed_atoms,'knownAddedRetainedMassKG':fk,
            'knownAddedRetainedCentroidRadialAlongMM':fc,'knownAddedRootGravity':vector(parent,fk,fc),
            'localSpreaderScreen':{'sectionRadialDepthWallMM':[25,spreader_depth,2],
                'fullOriginalRootGravityWaterWindForceAtOnePickupN':whole_root_force,
                'longestPickupCantileverMM':cantilever,'stressMPa':branch_stress,
                'allowableMPa':h.allowable,'tipDeflectionMM':branch_deflection,
                'stressScreenPass':branch_stress<h.allowable,
                'scope':'One full original root demand at either pickup; deliberately no favourable fractional-load credit. '
                    'This screens the branch beam alone, not its joints, stub, root torsion or complete pan frame.'},
            'primarySecondarySkinPenetrations':2 if primary else 0,
            'primaryStockVerticalComparison':primary_gap,
            'qualification':'This is priced retained geometry, not a checked bracket. Local bending/torsion, root contact, '
                'source carrier height, facade clearances and each primary stub/secondary-skin collar remain open.'})
    perimeter=e.p_perimeter if primary else e.f_perimeter
    fixed_per_m=(e.p_brackets-64*e.moving_crossarm_kg*.4/e.p_perimeter+e.p_apron+e.f_apron+e.secondary_apron_ribs
                 if primary else e.f_brackets-64*e.moving_crossarm_kg*.6/e.f_perimeter)
    existing_fixed=fixed_per_m*parent['sourceTributaryMM']/1000
    seam_share=parent['movingDryMaterialKG']['halfEachAdjacentWetClosure']
    dry=sum(r['knownRemovableDryKG'] for r in local)
    added=sum(a['massKG'] for a in fixed_atoms)
    total_mass=dry+added+existing_fixed+seam_share
    roots.append({'sourceRootId':parent['id'],'circuit':parent['circuit'],'face':parent['face'],
        'nominalRootPacketStationAlongMM':parent['rootAlongMM'],
        'actualNativeAttachmentAlongMM':native_along(parent),
        'nativeRootWorldXYMM':native_root(parent),
        'nativeDryPointRadialAlongMM':[345 if primary else 397.5,parent['rootAlongMM']],
        'nativeWholeRootDryCapKG':parent['source50KGPerMRemovalMassKG'],
        'removablePieceIds':[r['id'] for r in local],'knownRemovableDryKG':dry,
        'knownNewRetainedSupportKG':added,'existingFixedScheduleUnlocatedKG':existing_fixed,
        'twoAdjacentSeamHalfShareHypothesisKG':seam_share,'trialInstalledMassKG':total_mass,
        'massReserveToNativeWholeRootCapKG':parent['source50KGPerMRemovalMassKG']-total_mass,
        'unlocatedFixedSchedule':{'rootSteelPlatesGussetsAndOriginalClips':True,
            'primaryAndSecondaryApronsAndTheirRailStock':primary,
            'reason':'The original schedule gives lengths/mass but does not define every fixed centroid and receiving route. '
                'It is not placed at a convenient native point or credited as negative moment.'},
        'seamReactionQualification':'The half-share records stock, not proven reactions. A soldered/clipped seam connects adjacent roots; '
            'its retained/removed stiffness and real vertical/moment sharing need the physical joint detail.',
        'nativeForceMomentClosure':False})

summary=[]
for circuit,perimeter in [('primary',e.p_perimeter),('lower',e.f_perimeter)]:
    p=[r for r in pieces if r['circuit']==circuit];r=[r for r in roots if r['circuit']==circuit]
    assert len(p)==66 and len(r)==64
    known=sum(x['knownRemovableDryKG'] for x in p)
    total_mass=sum(x['trialInstalledMassKG'] for x in r)
    summary.append({'circuit':circuit,'physicalPieces':len(p),'originalNativeRoots':len(r),
        'uniqueNativeAttachmentCoordinates':len({tuple(x['nativeRootWorldXYMM']) for x in r}),
        'splitRoots':[x for x in r if len(x['removablePieceIds'])>1],
        'knownRemovableMetalKG':known,'trialInstalledMassKGPerM':total_mass/perimeter,
        'maximumKnownRemovablePieceKG':max(x['knownRemovableDryKG'] for x in p),
        'minimumRootDryMassReserveKG':min(x['massReserveToNativeWholeRootCapKG'] for x in r),
        'rootDryMassCapFailures':[x['sourceRootId'] for x in r if x['massReserveToNativeWholeRootCapKG']<0],
        'maximumNominalPieceAlongMM':max(x['captureEnvelopePlanMM']['along'][1]-x['captureEnvelopePlanMM']['along'][0] for x in p)})

source_files=['project/rof/studies/roof_water_edges.py','project/rof/studies/roof_water_heads.py',
    'project/rof/studies/roof_water_movement.json','project/mat/studies/ring-roof-family.json',
    'project/had/studies/water-replan.json','project/had/studies/current-house-services.json',
    'project/rwt/studies/selected-water-event.json','project/rwt/studies/court-service-selection.json',
    'project/rwt/studies/over-roof-site-envelope.json','project/mat/studies/plant-threshold.json',
    'project/str/studies/reconciled-house-interface.json']
report={'status':'UNSELECTED66-PIECE PHYSICAL CANDIDATE; NO ORDINARY RENEWAL OR NATIVE FORCE/MOMENT CLOSURE',
    'primarySpreaderDepthMM':args.primary_spreader_depth,
    'summary':summary,'headGaps':head_gaps,'pieces':pieces,'retainedSpreaderCandidates':spreaders,'rootLedger':roots,
    'comparisonControl':{'original64PieceInventorySHA256':hashlib.sha256(source_path.read_bytes()).hexdigest(),
        'originalHeadStepFailuresRetained':True},
    'stockRules':['All known pan/carrier atoms are individually located and mapped to the exact original64 roots.',
        'The64 roots per circuit are nominal root packets; their corner attachments are clamped to the actual collector. '
        'Both nominal tributary station and actual native attachment coordinate are recorded. Every r-cross-F uses the actual attachment.',
        'Primary head halves split the160 mm crossarm width into80+80 or120+40, all3 mm wall. '
        'Lower halves use40x25x3 and120x25x4. These are new stock comparisons requiring their own local checks.',
        'Rails butt to crossarm faces and ribs butt between rail faces in a coplanar25 mm grillage. '
        'This avoids the impossible assumption of stacked25 mm members within a27 mm carrier. '
        'The butt joints, end ribs and crossarm wall stresses still need a complete check.',
        'No credit is taken for removing existing fixed-root/fork stock when the new spreader is added.',
        'Each head end is open, with a20 mm copper termination, supporting end rib and fasteners. No transverse dam is invented.',
        'The original60 mm opposed thermal head gap is distinct from the new10 mm per-bay fabrication seams.'],
    'unresolved':['Actual fixed-root/apron centroid and receiving ownership is a separate ledger, not hidden inside50 kg/m.',
        'The same64-root dry cap is only a scalar comparison. Retained-body and removed-half native moments remain open.',
        'The two-entry normal and relief head turn boxes must receive the unequal bed elevations and thermal travel.',
        'Corner floor continuity, cantilever rails, miter end ribs and root torsion remain local checks.',
        'Primary stubs cross the secondary skin atR146: wet collars, removal around retained roots and baffle wind need actual geometry.',
        'All new retained support wind area must be mapped to the pressure family; no automatic shielding or existing allowance is credited.',
        'Rain interception before first wet opening, complete part departure/first rest and reverse installation remain unselected.'],
    'sourceHashes':{q:hashlib.sha256((ROOT/q).read_bytes()).hexdigest() for q in source_files},
    'scriptSHA256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest()}

def rounded(x):
    if isinstance(x,dict):return {k:rounded(v) for k,v in x.items()}
    if isinstance(x,(list,tuple)):return [rounded(v) for v in x]
    return round(x,9) if isinstance(x,float) else x

full_contents=json.dumps(rounded(report),indent=2)+'\n'
if args.primary_spreader_depth==80:
    assert not args.full_control_receipt, '80 mm already retains the full receipt'
    target=HERE/'outer-66-pieces.json';contents=full_contents
elif args.full_control_receipt:
    target=HERE/f'outer-66-pieces_{args.primary_spreader_depth}-full.json';contents=full_contents
else:
    # The alternate support depths change only the retained head-root support.
    # Keep the controlling comparisons and the exact full-receipt identity;
    # do not repeat the same132 removable pieces and2072 atoms three times.
    support_keys=['sourceRootId','face','circuit','beamPlanRadialAlongMM',
        'actualNativeAttachmentWorldXYMM','newPickupStationsMM','lowestBeamTopDatumZMM',
        'knownAddedRetainedMassKG','knownAddedRetainedCentroidRadialAlongMM',
        'knownAddedRootGravity','localSpreaderScreen','primarySecondarySkinPenetrations',
        'primaryStockVerticalComparison','qualification']
    compact={k:report[k] for k in ['status','primarySpreaderDepthMM','summary','headGaps',
        'comparisonControl','stockRules','unresolved','sourceHashes','scriptSHA256']}
    compact['retainedSupportSummaries']=[{k:s[k] for k in support_keys} for s in spreaders]
    compact['fullReceiptSHA256']=hashlib.sha256(full_contents.encode()).hexdigest()
    compact['fullReceiptBytes']=len(full_contents.encode())
    compact['fullReceiptReproductionCommand']=(
        f'python -B project/rof/studies/outer_66_checkpoint/outer-66-pieces.py '
        f'--repo . --primary-spreader-depth {args.primary_spreader_depth} --full-control-receipt')
    compact['fullReceiptPurpose']='Exact reproduction only. Retain the80 mm full inventory plus these compact controls in the repository.'
    target=HERE/f'outer-66-pieces_{args.primary_spreader_depth}-summary.json'
    contents=json.dumps(rounded(compact),indent=2)+'\n'
if args.check:assert target.read_text()==contents,'Rebuild66-piece physical inventory'
else:target.write_text(contents)
print(json.dumps({'status':report['status'],'primarySpreaderDepthMM':args.primary_spreader_depth,
    'summary':[{k:s[k] for k in ['circuit','physicalPieces','originalNativeRoots',
        'uniqueNativeAttachmentCoordinates','trialInstalledMassKGPerM',
        'maximumKnownRemovablePieceKG','minimumRootDryMassReserveKG','rootDryMassCapFailures']} for s in summary],
    'receipt':str(target)},indent=2))
