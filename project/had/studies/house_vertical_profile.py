import ast
import copy
import hashlib
import json
import math
from pathlib import Path
import sys
from xml.sax.saxutils import escape


METHOD='project/had/studies/house_vertical_profile.py'
GROUND_METHOD='project/str/studies/dry_side_ground_section.py'
GROUND_CASE='project/str/studies/dry-side-ground-section.json'
WET_SUPPORT_RECEIPT='project/str/studies/floor-section-proof.json'
EXTRA=('project/str/studies/current-house-lateral.json','project/str/studies/current-house-roof-bracing.py','project/mat/studies/ring-roof-family.json')


def digest(value):
    return hashlib.sha256(json.dumps(value,sort_keys=True,separators=(',',':'),allow_nan=False).encode()).hexdigest()


def ground_method(raw):
    module=type(sys)('bound_ground_section')
    exec(compile(raw,GROUND_METHOD,'exec'),module.__dict__)
    return module


def load_profile_source(root):
    root=Path(root);document=json.loads((root/GROUND_CASE).read_bytes())
    receipt=json.loads((root/WET_SUPPORT_RECEIPT).read_bytes());native_sources=receipt.get('sourceSHA256',{})
    if not isinstance(native_sources,dict) or len(native_sources)!=58:raise ValueError('Current58-source wet-support receipt required')
    paths=tuple(dict.fromkeys((METHOD,GROUND_METHOD,GROUND_CASE,*document['sources'],*EXTRA,WET_SUPPORT_RECEIPT,*native_sources)))
    raw={p:(root/p).read_bytes() for p in paths}
    identities={p:hashlib.sha256(v).hexdigest() for p,v in raw.items()}
    for path,value in native_sources.items():
        if identities[path]!=value:raise ValueError('Stale wet-support geometry receipt at '+path)
    return {'raw':raw,'identities':identities,'ground':ground_method(raw[GROUND_METHOD]),'groundDocument':document}


def reference_profile_case(source):
    return {'schema':'house-vertical-profile/1','sources':source['identities'],
            'groundCase':source['ground'].read_section_case(source['groundDocument'])}


def numeric_declarations(raw,names):
    found={}
    for node in ast.walk(ast.parse(raw)):
        if isinstance(node,ast.Assign):
            for target in node.targets:
                if isinstance(target,ast.Name) and target.id in names:
                    try:value=ast.literal_eval(node.value)
                    except (ValueError,TypeError):raise ValueError('Unsupported native numeric datum: '+target.id)
                    if type(value) not in (int,float):raise ValueError('Nonnumeric native datum: '+target.id)
                    if target.id in found and found[target.id]!=value:raise ValueError('Ambiguous bound native datum: '+target.id)
                    found[target.id]=value
    if set(found)!=set(names):raise ValueError('Unsupported native structural datum declarations')
    return found


def common_wet_support_geometry(raw):
    """Only geometry common to all seven actual controls, never a selected solve."""
    proof=json.loads(raw)
    if (not isinstance(proof,dict) or proof.get('schema')!='str-coupled-floor-section-proof/1'
            or not isinstance(proof.get('sourceSHA256'),dict) or len(proof['sourceSHA256'])!=58
            or not isinstance(proof.get('controls'),list)):
        raise ValueError('Current58-source floor receipt required for wet-support profile geometry')
    controls=[r for r in proof['controls'] if r['executedRequest'].get('wetSupport') is not None]
    if len(controls)!=7 or len({r['nativeCaseId'] for r in controls})!=7:
        raise ValueError('All seven distinct actual wet-support geometry controls are required')
    common=None;densities=set()
    for row in controls:
        request=row['executedRequest'];wet=row.get('seatedWetSupport');section=row['floorSection']
        if (row.get('sourceSHA256')!=proof['sourceSHA256'] or request.get('sourceSHA256')!=proof['sourceSHA256']
                or not isinstance(wet,dict) or wet.get('settings')!=request['wetSupport']
                or row.get('candidateAccepted') is not False or row.get('completeHouseProof') is not False
                or wet.get('physicalAcceptance') is not False):
            raise ValueError('Wet-support geometry must retain its actual request/source and unadopted status')
        setting=wet['settings'];posts=wet['posts']
        keys=('beamAxisXMm','beamWidthMm','beamDepthMm','beamTopZMm','beamSouthEndYMm','beamNorthEndYMm','padThicknessMm')
        if any(type(setting.get(k)) not in (int,float) or not math.isfinite(setting[k]) for k in keys):
            raise ValueError('Finite actual wet-beam/post geometry required')
        if (min(setting['beamWidthMm'],setting['beamDepthMm'],setting['padThicknessMm'])<=0
                or setting['beamNorthEndYMm']<=setting['beamSouthEndYMm']
                or setting['beamTopZMm']!=section['topZMm'] or section['topZMm']-section['soffitZMm']!=section['thicknessMm']
                or len(posts)!=2 or len({p['id'] for p in posts})!=2):
            raise ValueError('Contradictory actual wet-beam/floor/post geometry')
        geometry={'beam':{k:setting[k] for k in keys},'sourceRCIntervalMm':[section['soffitZMm'],section['topZMm']], 'posts':[]}
        for index,post in enumerate(posts):
            r=post['rectangleXYMm'];bottom=post['physicalBottomZMm'];top=post['physicalTopZMm']
            if (not isinstance(r,list) or len(r)!=4 or any(type(v) not in (int,float) or not math.isfinite(v) for v in [*r,bottom,top])
                    or r[2]<=r[0] or r[3]<=r[1] or top<=bottom or r!=setting['receiverRectanglesXYMm'][index]
                    or top!=setting['beamTopZMm']-setting['beamDepthMm']-setting['padThicknessMm']):
                raise ValueError('Contradictory actual wet-beam/pad/post geometry')
            geometry['posts'].append({'id':post['id'],'rectangleXYMm':r,'physicalBottomZMm':bottom,'physicalTopZMm':top})
        if common is not None and geometry!=common:raise ValueError('Contradictory wet-support geometry across actual controls')
        common=geometry;density=setting['concreteUnitWeightKNPerM3']
        if type(density) not in (int,float) or not math.isfinite(density) or density<=0:raise ValueError('Finite authored wet-concrete comparison density required')
        densities.add(density)
    return {'geometry':common,'controlIds':[r['nativeCaseId'] for r in controls],
            'authoredBulkUnitWeightsKNPerM3':sorted(densities),'nativeSourceIdentityDigest':digest(proof['sourceSHA256'])}


def dry_support_transfer(levels,source_base,source_ground_ffl,occupied_shift,source_soffit):
    """Separate the actual dry receiving plane from the retained cold grid.

    These are geometry reservations, not a mineral/contact constitutive law.
    An occupied-floor edit need not move the dry slab or the cold grid.
    """
    if not isinstance(levels,dict) or not {'coldGridTop','wetRCPlinth','mineralCourse','dryRC','ffl'}<=set(levels):
        raise ValueError('Complete actual cold/mineral/dry support stack required')
    if any(type(v) not in (int,float) or not math.isfinite(v)
           for v in (source_base,source_ground_ffl,occupied_shift,source_soffit,levels['coldGridTop'],levels['ffl'])):
        raise ValueError('Finite actual source and raised support planes required')
    keys=('wetRCPlinth','mineralCourse','dryRC')
    for key in keys:
        row=levels[key]
        if (not isinstance(row,list) or len(row)!=2
                or any(type(v) not in (int,float) or not math.isfinite(v) for v in row)
                or row[1]<row[0] or (key!='wetRCPlinth' and row[1]==row[0])):
            raise ValueError('Actual positive continuous cold/mineral/dry support stack required')
    if (levels['wetRCPlinth'][0]!=levels['coldGridTop']
            or levels['wetRCPlinth'][1]!=levels['mineralCourse'][0]
            or levels['mineralCourse'][1]!=levels['dryRC'][0]):
        raise ValueError('Cold/mineral/dry receiving stack has a gap or bypass')
    base=levels['dryRC'][1];top=source_soffit+occupied_shift
    if top<=base or levels['ffl']!=source_ground_ffl+occupied_shift:
        raise ValueError('Actual dry member and occupied planes required')
    return {'schema':'house-dry-support-transfer/1',
        'status':'unselected-geometry-reservation-not-native-insertion',
        'coldGridTopMm':levels['coldGridTop'],'sourceDryBaseMm':source_base,
        'dryMemberBaseMm':base,'drySupportTranslationMm':base-source_base,
        'occupiedTranslationMm':occupied_shift,
        'relativeLowerMemberHeightChangeMm':occupied_shift-(base-source_base),
        'verticalStackMm':{key:list(levels[key]) for key in keys},
        'ordinaryDryMemberIntervalMm':[base,top],
        'ordinaryDryMemberHeightMm':top-base,
        'nativeInsertionImplemented':False,'mineralBearingLawQualified':False,
        'mineralShearOrUpliftResistanceProvided':False,
        'currentNativeFootprintsQualified':False,'oldForcesReusable':False,
        'scope':'Dry walls, columns, portal abutments and stair toe restart on the dry slab. No column or bar extends through the full mineral course to the cold grid. Its actual full-width bearing, lateral/uplift path, slab/base anchorage and fresh whole-house response remain to design.'}


def translate_wet_support(source,shift,ground_ffl,cold_grid_top,source_floor,source_ground_ffl,dry_base):
    joined=common_wet_support_geometry(source['raw'][WET_SUPPORT_RECEIPT]);geometry=joined['geometry'];beam=geometry['beam']
    if geometry['sourceRCIntervalMm']!=[source_floor['bottom'],source_floor['top']]:
        raise ValueError('Actual wet-support receipt and occupied source floor use different datums')
    soffit=beam['beamTopZMm']-beam['beamDepthMm'];posts=[];additional=0.;source_volume=0.
    for post in geometry['posts']:
        if post['physicalBottomZMm']!=cold_grid_top:raise ValueError('Actual wet post base disagrees with the fixed cold-grid source')
        a,b,c,d=post['rectangleXYMm'];area=(c-a)*(d-b);top=post['physicalTopZMm']+shift
        old_height=post['physicalTopZMm']-post['physicalBottomZMm'];height=top-dry_base
        if height<=0:raise ValueError('Raised dry post has no positive physical height')
        extra_volume=area*(height-old_height)/1e9;additional+=extra_volume;source_volume+=area*old_height/1e9
        posts.append({'id':post['id'],'rectangleXYMm':post['rectangleXYMm'],
            'sourcePhysicalBottomMm':post['physicalBottomZMm'],'sourcePhysicalTopMm':post['physicalTopZMm'],
            'dryBottomMm':dry_base,'translatedTopMm':top,'sourceHeightMm':old_height,
            'translatedHeightMm':height,'heightIncreaseMm':height-old_height,'knownSectionMm':[c-a,d-b],
            'additionalGrossConcreteEnvelopeM3':extra_volume})
    beam_volume=beam['beamWidthMm']*beam['beamDepthMm']*(beam['beamNorthEndYMm']-beam['beamSouthEndYMm'])/1e9
    return {'status':'unselected-common-geometry-translation-only','geometrySource':{'receiptPath':WET_SUPPORT_RECEIPT,
            'receiptSHA256':source['identities'][WET_SUPPORT_RECEIPT],'nativeSourceIdentityDigest':joined['nativeSourceIdentityDigest'],
            'consistentControlIds':joined['controlIds'],'numericalCaseSelected':False},
        'beam':{'id':'STR/wet-wall-support/beam','axisXMm':beam['beamAxisXMm'],'spanYMm':[beam['beamSouthEndYMm'],beam['beamNorthEndYMm']],
            'widthMm':beam['beamWidthMm'],'depthMm':beam['beamDepthMm'],'sourceTopMm':beam['beamTopZMm'],'sourceSoffitMm':soffit,
            'translatedTopMm':beam['beamTopZMm']+shift,'translatedSoffitMm':soffit+shift,
            'undersideBelowOrdinarySlabMm':source_floor['bottom']-soffit,
            'localGroundStructuralClearHeightMm':soffit+shift-ground_ffl,
            'sourceLocalGroundStructuralClearHeightMm':soffit-source_ground_ffl,'finishedCeilingClearanceQualified':False},
        'posts':posts,'quantities':{'unadoptedPrismaticHeightChangeComparison':True,
            'additionalGrossPostConcreteEnvelopeM3':additional,'sourceBeamAndPostGrossEnvelopeM3':beam_volume+source_volume,
            'translatedBeamAndPostGrossEnvelopeM3':beam_volume+source_volume+additional,
            'additionalCharacteristicWeightComparisons':[{'authoredBulkUnitWeightKNPerM3':rho,'additionalGrossWeightKN':rho*additional} for rho in joined['authoredBulkUnitWeightsKNPerM3']],
            'reinforcementAndDeliveredDensityQualified':False,'wholeHouseQuantityReconciliationComplete':False},
        'raisedGeometryAdopted':False,'raisedForcesReplayed':False,
        'scope':'Actual common beam/post section geometry only. Posts restart on the dry slab; heads follow the occupied translation independently. Prismatic height-change and authored-density arithmetic are conditional; no mineral bearing/lateral/uplift law, base anchorage, raised stiffness or force replay is supplied.'}


def derive_profile(case,source):
    if not isinstance(case,dict) or set(case)!={'schema','sources','groundCase'} or case['schema']!='house-vertical-profile/1' or case['sources']!=source['identities']:
        raise ValueError('Exact current source-bound profile and authored ground case required; no injected levels')
    for path,raw in source['raw'].items():
        if hashlib.sha256(raw).hexdigest()!=case['sources'][path]:raise ValueError('Stale profile source: '+path)
    expected_ground=source['ground'].read_section_case(source['groundDocument'])
    if not isinstance(case['groundCase'],dict) or any(case['groundCase'].get(k)!=expected_ground[k] for k in ('schema','status','sources')):
        raise ValueError('Missing or stale native ground source authority')
    native=source['ground'].derive_section(case['groundCase'],source['raw']);g=native['levelsMm']
    h=json.loads(source['raw']['project/had/studies/water-replan.json'])['model']
    lateral=json.loads(source['raw']['project/str/studies/current-house-lateral.json'])
    roof=json.loads(source['raw']['project/mat/studies/ring-roof-family.json'])
    structural=numeric_declarations(source['raw']['project/str/studies/current-house-roof-bracing.py'],{'base','ff','rr'})
    floor=h['sections']['firstFloorRC']
    if structural['base']!=g['coldGridTop'] or structural['ff']!=floor['top'] or structural['rr']!=6600. or h['sections']['groundFFL']!=0:
        raise ValueError('Unsupported source structural/occupied reference domain')
    if set(floor)!={'top','bottom'} or floor['top']-floor['bottom']!=200 or h['sections']['firstFFL']-floor['top']!=80:
        raise ValueError('Source first occupied datum is not the structural floor top')
    if lateral['capillarySplice']['plateZ']!=[-50,-30]:raise ValueError('Unsupported source20mm waterstop reference')
    z=g['ffl']-h['sections']['groundFFL'];grade=g['authoredExteriorGrade']
    floor=h['sections']['firstFloorRC'];first=h['sections']['firstFFL']+z;attic=h['sections']['atticDatum']+z
    dry_support=dry_support_transfer(g,h['sections']['groundFloorRC']['top'],h['sections']['groundFFL'],z,floor['bottom'])
    core_height=dry_support['ordinaryDryMemberHeightMm']
    wet_profile=translate_wet_support(source,z,g['ffl'],g['coldGridTop'],floor,h['sections']['groundFFL'],dry_support['dryMemberBaseMm'])
    roof_rows=[{'id':'STR-ring-centre','sourceMm':structural['rr'],'translatedComparisonMm':structural['rr']+z,'role':'Structural ring/pressure datum; not weather eave or attic floor'},
               {'id':'HAD-weather-eave','sourceMm':h['exterior']['eaves'],'translatedComparisonMm':h['exterior']['eaves']+z,'role':'HAD explicitly rewound7100eave; not native structural ring'}]
    weather=next(r for r in roof['families'] if r['family']=='slate and combined Sarket below two-direction airspace')
    roof_rows.extend([{'id':'MAT-required-wall-line','sourceMm':weather['requiredWallLine'],'translatedComparisonMm':weather['requiredWallLine']+z,'role':weather['family']},
                      {'id':'MAT-weather-cap-apex','sourceMm':weather['newWeatherCapApex'],'translatedComparisonMm':weather['newWeatherCapApex']+z,'role':'Separate assembly comparison, not a selected whole-house height'}])
    storey_ffl={'GROUND':h['sections']['groundFFL'],'FIRST':h['sections']['firstFFL']}
    arches=[]
    for level,rows in h['archOpeningRegister'].items():
        if level not in storey_ffl:raise ValueError('Unsupported source arch storey')
        for row in rows:
            datums={key:row[key]+storey_ffl[level]+z for key in ('sill','spring','head') if key in row}
            arches.append({'id':level+'/'+row['id'],'wall':row['wall'],'sourceDatum':'storey-local','outputDatum':'source-ground',
                           'sourceStoreyFFLMm':storey_ffl[level],'raisedStoreyFFLMm':storey_ffl[level]+z,
                           'datumsMm':datums,'role':'Absolute source-ground Z from storey-local opening datums and raised storey FFL; ring/support/weather applicability remains open'})
    portal=h['insulatedPortal']
    exposed_top=min(g['ffl'],floor['bottom']+z)
    exposed=max(0,exposed_top-grade)
    diagnostics=[{'code':'PROFILE_FORCE_REPLAY_REQUIRED','objects':['source52-heads','ground-posts','first-floor','north-portals'],
                  'message':f'Coldgrid/caps stay{g["coldGridTop"]:g}; dry members restart at{dry_support["dryMemberBaseMm"]:g}, support shift{dry_support["drySupportTranslationMm"]:g} and occupied shift{z:g}. Ordinary dry member height{core_height:g}. Rebuild actual separated support/contact, anchorage, member endpoints/sections/mass and six-wrench transfers. No old reaction, stiffness, preload or load budget transfers.'},
                 {'code':'PROFILE_ROOF_ASSEMBLY_UNRESOLVED','objects':[r['id'] for r in roof_rows],
                  'message':'Native6600ring, historical6800nominal eave, HAD7100eave and MAT7418.423wall line are distinct assembly datums. Arithmetic translation does not join roof structure, attic, weather skin, pitch, support, access or water receivers; complete weather height is withheld.'},
                 {'code':'PROFILE_PLINTH_ENCLOSURE_UNQUALIFIED','objects':['wetRCPlinth','mineralCourse','lower-wall','court-boundaries','new-waterstop-concept'],
                  'message':'Exact ground slab construction is inherited only as an unselected ground case. Enclosure/air/gas/thermal/water returns, cold wet-leaf separation, anchors/bar continuity and site grade need actual joined construction.'},
                 {'code':'PROFILE_WIND_OCCLUSION_UNPROVEN','objects':['exposed-plinth','lower-posts','exterior-grade'],
                  'message':f'WalkingFFL does not occlude piers. Exposed grade-to-FFL envelope{exposed:g}mm under no-occlusion comparison; actual facade/plinth closures, openings, pressure law and member tributaries must define raised wind.'}]
    diagnostics.append({'code':'PROFILE_WET_SUPPORT_REPLAY_REQUIRED','objects':[wet_profile['beam']['id'],*[p['id'] for p in wet_profile['posts']]],
        'message':f'Common actual wet beam soffit{wet_profile["beam"]["sourceSoffitMm"]:g} translates to{wet_profile["beam"]["translatedSoffitMm"]:g}; local unfinished structural clearance{wet_profile["beam"]["localGroundStructuralClearHeightMm"]:g}. Posts restart at dry slab{dry_support["dryMemberBaseMm"]:g}; height changes by{dry_support["relativeLowerMemberHeightChangeMm"]:g}. Actual mineral transfer, base anchorage, cage/joints, mass, stiffness, loads and52-head response must rebuild.'})
    return {'schema':'house-vertical-profile-result/1','sourceIdentities':case['sources'],'groundAuthority':{'caseId':native['caseId'],'caseDigest':digest(case['groundCase']),'resultDigest':digest(native)},
            'status':'unselected-source-derived-vertical-proposal','selectedHouseAdmitted':False,'installedAcceptance':False,'groundLevelsMm':g,'floorAssembly':native['floorAssembly'],'wetSupportProfile':wet_profile,
            'drySupportTransfer':dry_support,
            'transforms':{'occupiedTranslationMm':z,'drySupportTranslationMm':dry_support['drySupportTranslationMm'],'coldGridTranslationMm':0,'wetPlinthReceivingTopIsNotGridTop':True},
            'occupied':{'groundFFLMm':g['ffl'],'firstRCMm':[floor['bottom']+z,floor['top']+z],'firstFFLMm':first,'firstFinishAboveRCMm':first-(floor['top']+z),
                        'storeyIntervalMm':first-g['ffl'],'atticDatumMm':attic,'atticDatumIsNotVerifiedFloor':True,'atticMinusFirstDatumMm':attic-first},
            'walls':{'ordinaryGroundFromColdGridToFirstSoffitMm':[g['coldGridTop'],floor['bottom']+z],'ordinaryGroundStructuralHeightMm':core_height,
                     'dryMasonryAboveDryRCToFirstSoffitMm':[g['dryRC'][1],floor['bottom']+z],
                     'groundCoreHeightIncreaseMm':core_height-(floor['bottom']-structural['base']),
                     'sourcePostSegmentsAroundDPCMm':[[structural['base'],-50],[-30,floor['bottom']]],
                     'candidateDryPostIntervalMm':[dry_support['dryMemberBaseMm'],floor['bottom']+z],
                     'coldGridToFirstSoffitSeparationMm':floor['bottom']+z-g['coldGridTop'],
                     'candidatePostSegmentationIsAdopted':False,
                     'upperOccupiedDatumIntervalMm':[first,attic],'groundWallIds':[r['id'] for r in h['groundWalls']], 'upperWallIds':[r['id'] for r in h['upperWalls']],
                     'northPortal':{'dryBaseMm':dry_support['dryMemberBaseMm'],'rawSpringMm':portal['rawSpring']+z,'rawCrownMm':portal['rawCrown']+z,'meanSkewbackMm':sum(p[1] for p in portal['midRingHinges'])/len(portal['midRingHinges'])+z,'tieCentreMm':portal['tie']['centre']+z,'finishedCrownMm':portal['finishedCrown']+z,'upperRCFloorSoffitMm':floor['bottom']+z}},
            'waterstop':{'sourceReferenceIntervalMm':lateral['capillarySplice']['plateZ'],'candidateConceptIntervalMm':g['mineralCourse'],'candidateConceptIsNativeDPCRelocation':False,
                         'oldColumnCutRetained':False,
                         'status':'Full mineral-course separation below the dry slab; no inherited20mm column joint, through-bar, mineral bearing/shear/uplift, thermal or air/water acceptance'},
            'arches':arches,'roof':{'coherentWeatherProfile':None,'wholeHouseWeatherHeightAboveAuthoredGradeMm':None,'historicalNominalEaveMm':int(h['exterior']['source'].split('from')[1].split(';')[0]),'assemblyDatums':roof_rows,'owner':'Joined ROF/MAT/HAD/STR assembly gate'},
            'heights':{'firstAboveAuthoredGradeMm':first-grade,'atticDatumAboveAuthoredGradeMm':attic-grade,'actualLowestAdjacentGroundMm':None,'regulatoryHeightOrSiteAccepted':False},
            'approaches':native['approaches'],'groundQuantityReceipt':native['quantities'],'spineSection':{'coreWidthMm':next(w for w in h['groundWalls'] if w['id']=='service-spine')['structuralCore'][1]-next(w for w in h['groundWalls'] if w['id']=='service-spine')['structuralCore'][0],'coldGirderWidthMm':json.loads(source['raw']['project/str/studies/current-house-grid.json'])['girders']['spine']['width'],'coldGirderZMm':json.loads(source['raw']['project/str/studies/current-house-grid.json'])['girders']['spine']['z'],'wallBaseAboveDryRCMm':g['dryRC'][1]},'wind':{'appliedRaisedPressure':None,'occlusionAccepted':False,'exposedGradeToFFLEnvelopeMm':exposed,'occlusionEnvelopeMm':[grade,exposed_top]},
            'diagnostics':diagnostics,'groundDiagnostics':native['diagnostics'],'groundHolds':native['holds'],'groundInvalidatedEvidence':native['invalidatedEvidence'],'forceReplay':{'raisedCaseSolved':False,'old52HeadActionsReusable':False,'oldMemberStiffnessReusable':False,'oldRoofPressureReusable':False,'groundVerticalConsumer':'vertical_rc_floor.py baseline0 only; rebuild actual endpoints/offsets/loads before raised use'},
            'sourceApplicability':'Arch/window/door/court/upper-room/stair datums translate from their source. Floor support, source claims, new openings, weather enclosure and structural forces do not follow by translation.'}


def render_profile(results):
    out=['<svg xmlns="http://www.w3.org/2000/svg" width="1800" height="2160" viewBox="0 0 1800 2160">','<rect width="1800" height="2160" fill="#faf8f1"/><g font-family="sans-serif" fill="#263b42">']
    def text(x,y,value,size=16):out.append(f'<text x="{x}" y="{y}" font-size="{size}">{escape(str(value))}</text>')
    def line(x,y,xx,yy,color='#49636a',dashed=False):out.append(f'<path d="M{x},{y} L{xx},{yy}" fill="none" stroke="{color}" stroke-width="2"'+(' stroke-dasharray="6 5"' if dashed else '')+'/>')
    def box(x,y,w,height,color):out.append(f'<rect x="{x}" y="{y}" width="{w}" height="{height}" fill="{color}" stroke="#536b70"/>')
    text(45,40,'Whole-house vertical proposal · one authored ground case per section',26)
    text(45,72,'Fixed cold foundations; occupied levels move. No accepted roof profile, inherited structural forces or installed enclosure.',18)
    for index,r in enumerate(results):
        x=55+875*index;g=r['groundLevelsMm'];p=r['occupied'];wet=r['wetSupportProfile'];wb=wet['beam'];z=lambda v:1000-v*.09
        text(x,115,f'Ground FFL{g["ffl"]:g} · service zone{g["accessibleDistribution"][1]-g["accessibleDistribution"][0]:g}',21)
        grade=g['authoredExteriorGrade'];line(x,z(grade),x+760,z(grade),'#8d704b');text(x+430,z(grade)+22,f'Authored grade{grade:g}; actual site unknown',14)
        box(x+110,z(p['firstRCMm'][0]),24,(p['firstRCMm'][0]-g['dryRC'][1])*.09,'#c6c6b1')
        for key,color in [('wetRCPlinth','#8eaaa6'),('mineralCourse','#d3b77f'),('dryRC','#a4b7b4'),('glass','#e5d79c'),('accessibleDistribution','#e9ebdb'),('finish','#8b7f6e')]:
            lo,hi=g[key];box(x+110,z(hi),320,(hi-lo)*.09,color)
        lo,hi=p['firstRCMm'];box(x+110,z(hi),320,(hi-lo)*.09,'#a4b7b4')
        line(x+300,z(wet['posts'][0]['dryBottomMm']),x+300,z(wet['posts'][0]['translatedTopMm']),'#a6624f',True)
        box(x+280,z(wb['translatedTopMm']),130,wb['depthMm']*.09,'#d8b6a1')
        line(x+280,z(wb['translatedSoffitMm']),x+450,z(wb['translatedSoffitMm']),'#a6624f',True)
        text(x+455,z(wb['translatedSoffitMm'])+16,f'Wet beam soffit {wb["translatedSoffitMm"]:g} · unadopted',14)
        line(x+122,z(p['firstFFLMm']),x+122,z(p['atticDatumMm']),'#9a9c8a',True)
        text(x+150,z((p['firstFFLMm']+p['atticDatumMm'])/2),'Upper wall/roof termination not assigned',13)
        for value,label in [(g['coldGridTop'],'Coldgrid/captop fixed'),(g['ffl'],'Ground occupied'),(lo,'First RC soffit'),(p['firstFFLMm'],'First FFL'),(p['atticDatumMm'],'Attic DATUM: floor unproved')]:
            line(x+135,z(value),x+450,z(value));text(x+455,z(value)-4,f'{label} {value:g}',14)
        for row in r['roof']['assemblyDatums']:
            line(x+100,z(row['translatedComparisonMm']),x+400,z(row['translatedComparisonMm']),'#a6624f',True)
            text(x+405,z(row['translatedComparisonMm'])-3,f'{row["id"]} {row["translatedComparisonMm"]:.1f}',13)
        text(x,1050,f'First height above authored grade {r["heights"]["firstAboveAuthoredGradeMm"]:g}; storey interval{p["storeyIntervalMm"]:g}.',16)
        text(x,1078,f'Dry base{g["dryRC"][1]:g} to first soffit: member height{r["walls"]["ordinaryGroundStructuralHeightMm"]:g}; forces unproved.',16)
        a=r['approaches']['front'];text(x,1106,f'Front 1:{a["slopeRatio"]:g}: rise{a["riseMm"]:g}, sloping run{a["slopingRunMm"]:g}, reservation{a["totalStraightReservationMm"]:g}.',15)
        text(x,1134,f'Wet plinth{g["wetRCPlinth"]}; mineral{g["mineralCourse"]}; RC{g["dryRC"]}; glass{g["glass"]}.',14)
        text(x,1162,f'Service{g["accessibleDistribution"]}; finish{g["finish"]}; full mineral separation{r["waterstop"]["candidateConceptIntervalMm"]}.',14)
        text(x,1190,f'North arch spring{r["walls"]["northPortal"]["rawSpringMm"]:g}; crown{r["walls"]["northPortal"]["rawCrownMm"]:g}.',15)
        text(x,1218,f'Exposed grade-to-FFL envelope{r["wind"]["exposedGradeToFFLEnvelopeMm"]:g}; no walking-plane occlusion credit.',15)
        text(x,1246,f'Wet soffit{wb["translatedSoffitMm"]:g}; local clear{wb["localGroundStructuralClearHeightMm"]:g}; post top{wet["posts"][0]["translatedTopMm"]:g}; extension{wet["posts"][0]["heightIncreaseMm"]:g}.',14)
        inset=lambda value:1900-value*.35
        width=r['spineSection']['coldGirderWidthMm'];core=r['spineSection']['coreWidthMm'];middle=x+240
        text(x,1480,'Ground detail · source900-wide spine girder /140 core',19)
        lo,hi=r['spineSection']['coldGirderZMm'];box(middle-width*.25,inset(hi),width*.5,(hi-lo)*.35,'#8eaaa6')
        for key,color in [('wetRCPlinth','#8eaaa6'),('mineralCourse','#d3b77f'),('dryRC','#a4b7b4')]:
            lo,hi=g[key];box(middle-width*.25,inset(hi),width*.5,(hi-lo)*.35,color)
        for key,color in [('glass','#e5d79c'),('accessibleDistribution','#e9ebdb'),('finish','#8b7f6e')]:
            lo,hi=g[key];box(middle+core*.25,inset(hi),(width-core)*.25,(hi-lo)*.35,color)
        box(middle-core*.25,inset(g['ffl']+400),core*.5,(g['ffl']+400-g['dryRC'][1])*.35,'#c6c6b1')
        for value,label in [(g['ffl'],'FFL'),(g['dryRC'][1],'RCtop /wallbase'),(g['mineralCourse'][1],'DryRCbase /mineral top'),(g['mineralCourse'][0],'Mineralbase /wetplinthtop'),(g['coldGridTop'],'Retained coldgridtop')]:
            line(middle+width*.25,inset(value),x+500,inset(value));text(x+505,inset(value)+5,f'{label} {value:g}',13)
        lo,hi=r['waterstop']['candidateConceptIntervalMm'];line(middle-width*.25,inset((lo+hi)/2),middle+width*.25,inset((lo+hi)/2),'#a6624f',True)
        text(x,2140,'Dashed red: full mineral course below dry slab. No column/bar bypass or accepted bearing/lateral/uplift joint.',13)
    text(45,1278,'Roof lines are separate arithmetic assembly references. Weather roof shape and complete house height are withheld.',19)
    text(45,1314,'Ground floor/wall closure, outside wet leaf, DPC/air/gas/thermal returns and new receiving load path remain unresolved.',18)
    first=results[0];source_first=first['occupied']['firstFFLMm']-first['transforms']['occupiedTranslationMm']
    text(45,1350,f'Source firstFFL{source_first:g} = RC{first["wetSupportProfile"]["beam"]["sourceTopMm"]:g} +{first["occupied"]["firstFinishAboveRCMm"]:g}. Occupied interval{first["occupied"]["storeyIntervalMm"]:g}; wet overlay is unadopted.',18)
    text(45,1386,'No transplanted source52 forces, old lower-post stiffness, wind pressures, roof actions or capacity verdict.',18)
    text(45,1422,'Front step count/going is withheld: no actual step geometry is authored. Ramp reservations are source-derived comparisons.',18)
    out.append('</g></svg>');return '\n'.join(out)+'\n'


def main():
    root=Path(__file__).resolve().parents[3];source=load_profile_source(root)
    if '--read' in sys.argv:print(json.dumps(reference_profile_case(source)));return
    if any(flag in sys.argv for flag in ['--write','--check']):
        base=reference_profile_case(source);raised=copy.deepcopy(base);raised['groundCase']['settings'].update(caseId='raised-715-profile',serviceZoneMm=250)
        cases=[derive_profile(c,source) for c in [base,raised]]
        outputs={'house-vertical-profile.results.json':json.dumps({'schema':'house-vertical-profile-comparison/1','cases':cases},indent=2,allow_nan=False)+'\n','house-vertical-profile.svg':render_profile(cases)}
        for name,value in outputs.items():
            path=root/'project/had/studies'/name
            if '--write' in sys.argv:path.write_text(value)
            elif not path.exists() or path.read_text()!=value:raise ValueError('Stale generated profile: '+name)
        print(json.dumps({'status':'unselected-profile','fflMm':[r['occupied']['groundFFLMm'] for r in cases]}));return
    result=derive_profile(json.load(sys.stdin),source);print(json.dumps({'schema':'house-vertical-profile-replay/1','result':result,'sectionSvg':render_profile([result])},allow_nan=False))


if __name__=='__main__':main()
