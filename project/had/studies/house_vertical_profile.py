import ast
import copy
import hashlib
import json
from pathlib import Path
import sys
from xml.sax.saxutils import escape


METHOD='project/had/studies/house_vertical_profile.py'
GROUND_METHOD='project/str/studies/dry_side_ground_section.py'
GROUND_CASE='project/str/studies/dry-side-ground-section.json'
EXTRA=('project/str/studies/current-house-lateral.json','project/str/studies/current-house-roof-bracing.py','project/mat/studies/ring-roof-family.json')


def digest(value):
    return hashlib.sha256(json.dumps(value,sort_keys=True,separators=(',',':'),allow_nan=False).encode()).hexdigest()


def ground_method(raw):
    module=type(sys)('bound_ground_section')
    exec(compile(raw,GROUND_METHOD,'exec'),module.__dict__)
    return module


def load_profile_source(root):
    root=Path(root);document=json.loads((root/GROUND_CASE).read_bytes())
    paths=tuple(dict.fromkeys((METHOD,GROUND_METHOD,GROUND_CASE,*document['sources'],*EXTRA)))
    raw={p:(root/p).read_bytes() for p in paths}
    return {'raw':raw,'identities':{p:hashlib.sha256(v).hexdigest() for p,v in raw.items()},'ground':ground_method(raw[GROUND_METHOD]),'groundDocument':document}


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
    if structural!={'base':-180.,'ff':3370.,'rr':6600.} or h['sections']['groundFFL']!=0:
        raise ValueError('Unsupported source structural/occupied reference domain')
    if h['sections']['firstFloorRC']!={'top':3370,'bottom':3170} or h['sections']['firstFFL']!=3450:
        raise ValueError('Source first occupied datum is not the structural floor top')
    if lateral['capillarySplice']['plateZ']!=[-50,-30]:raise ValueError('Unsupported source20mm waterstop reference')
    z=g['ffl']-h['sections']['groundFFL'];grade=g['authoredExteriorGrade']
    floor=h['sections']['firstFloorRC'];first=h['sections']['firstFFL']+z;attic=h['sections']['atticDatum']+z
    core_height=floor['bottom']+z-g['coldGridTop']
    roof_rows=[{'id':'STR-ring-centre','sourceMm':structural['rr'],'translatedComparisonMm':structural['rr']+z,'role':'Structural ring/pressure datum; not weather eave or attic floor'},
               {'id':'HAD-weather-eave','sourceMm':h['exterior']['eaves'],'translatedComparisonMm':h['exterior']['eaves']+z,'role':'HAD explicitly rewound7100eave; not native structural ring'}]
    weather=next(r for r in roof['families'] if r['family']=='slate and combined Sarket below two-direction airspace')
    roof_rows.extend([{'id':'MAT-required-wall-line','sourceMm':weather['requiredWallLine'],'translatedComparisonMm':weather['requiredWallLine']+z,'role':weather['family']},
                      {'id':'MAT-weather-cap-apex','sourceMm':weather['newWeatherCapApex'],'translatedComparisonMm':weather['newWeatherCapApex']+z,'role':'Separate assembly comparison, not a selected whole-house height'}])
    arches=[]
    for level,rows in h['archOpeningRegister'].items():
        for row in rows:
            datums={key:row[key]+z for key in ('sill','spring','head') if key in row}
            arches.append({'id':level+'/'+row['id'],'wall':row['wall'],'datumsMm':datums,'role':'Source assembly datum translated arithmetically; ring/support/weather applicability reopened'})
    portal=h['insulatedPortal']
    exposed_top=min(g['ffl'],floor['bottom']+z)
    exposed=max(0,exposed_top-grade)
    diagnostics=[{'code':'PROFILE_FORCE_REPLAY_REQUIRED','objects':['source52-heads','ground-posts','first-floor','north-portals'],
                  'message':f'Fixed coldgrid/caps{g["coldGridTop"]:g}; occupied shift{z:g}. Ordinary cap-to-soffit height{core_height:g}, not3350. Rebuild actual member endpoints/sections/mass, floor/portal offsets and six-wrench transfers. No old reaction, stiffness, preload or load budget transfers.'},
                 {'code':'PROFILE_ROOF_ASSEMBLY_UNRESOLVED','objects':[r['id'] for r in roof_rows],
                  'message':'Native6600ring, historical6800nominal eave, HAD7100eave and MAT7418.423wall line are distinct assembly datums. Arithmetic translation does not join roof structure, attic, weather skin, pitch, support, access or water receivers; complete weather height is withheld.'},
                 {'code':'PROFILE_PLINTH_ENCLOSURE_UNQUALIFIED','objects':['wetRCPlinth','mineralCourse','lower-wall','court-boundaries','new-waterstop-concept'],
                  'message':'Exact ground slab construction is inherited only as an unselected ground case. Enclosure/air/gas/thermal/water returns, cold wet-leaf separation, anchors/bar continuity and site grade need actual joined construction.'},
                 {'code':'PROFILE_WIND_OCCLUSION_UNPROVEN','objects':['exposed-plinth','lower-posts','exterior-grade'],
                  'message':f'WalkingFFL does not occlude piers. Exposed grade-to-FFL envelope{exposed:g}mm under no-occlusion comparison; actual facade/plinth closures, openings, pressure law and member tributaries must define raised wind.'}]
    return {'schema':'house-vertical-profile-result/1','sourceIdentities':case['sources'],'groundAuthority':{'caseId':native['caseId'],'caseDigest':digest(case['groundCase']),'resultDigest':digest(native)},
            'status':'unselected-source-derived-vertical-proposal','selectedHouseAdmitted':False,'installedAcceptance':False,'groundLevelsMm':g,'floorAssembly':native['floorAssembly'],
            'transforms':{'occupiedTranslationMm':z,'coldGridTranslationMm':0,'wetPlinthReceivingTopIsNotGridTop':True},
            'occupied':{'groundFFLMm':g['ffl'],'firstRCMm':[floor['bottom']+z,floor['top']+z],'firstFFLMm':first,'firstFinishAboveRCMm':first-(floor['top']+z),
                        'storeyIntervalMm':first-g['ffl'],'atticDatumMm':attic,'atticDatumIsNotVerifiedFloor':True,'atticMinusFirstDatumMm':attic-first},
            'walls':{'ordinaryGroundFromColdGridToFirstSoffitMm':[g['coldGridTop'],floor['bottom']+z],'ordinaryGroundStructuralHeightMm':core_height,
                     'dryMasonryAboveDryRCToFirstSoffitMm':[g['dryRC'][1],floor['bottom']+z],
                     'groundCoreHeightIncreaseMm':core_height-(floor['bottom']-structural['base']),
                     'sourcePostSegmentsAroundDPCMm':[[structural['base'],-50],[-30,floor['bottom']]],
                     'candidatePostSegmentsAroundConceptMm':[[g['coldGridTop'],g['mineralCourse'][1]-20],[g['mineralCourse'][1],floor['bottom']+z]],
                     'candidateLowerSegmentEnvelopeLengthMm':g['mineralCourse'][1]-20-g['coldGridTop'],
                     'candidatePostSegmentationIsAdopted':False,
                     'upperOccupiedDatumIntervalMm':[first,attic],'groundWallIds':[r['id'] for r in h['groundWalls']], 'upperWallIds':[r['id'] for r in h['upperWalls']],
                     'northPortal':{'fixedBaseMm':g['coldGridTop'],'rawSpringMm':portal['rawSpring']+z,'rawCrownMm':portal['rawCrown']+z,'meanSkewbackMm':sum(p[1] for p in portal['midRingHinges'])/len(portal['midRingHinges'])+z,'tieCentreMm':portal['tie']['centre']+z,'finishedCrownMm':portal['finishedCrown']+z,'upperRCFloorSoffitMm':floor['bottom']+z}},
            'waterstop':{'sourceReferenceIntervalMm':lateral['capillarySplice']['plateZ'],'candidateConceptIntervalMm':[g['mineralCourse'][1]-20,g['mineralCourse'][1]],'candidateConceptIsNativeDPCRelocation':False,
                         'status':'Unproved top20 mineral-interface concept only; no continuous-bar/anchor/material/water/thermal/air acceptance'},
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
        x=55+875*index;g=r['groundLevelsMm'];p=r['occupied'];z=lambda v:1000-v*.09
        text(x,115,f'Ground FFL{g["ffl"]:g} · service zone{g["accessibleDistribution"][1]-g["accessibleDistribution"][0]:g}',21)
        grade=g['authoredExteriorGrade'];line(x,z(grade),x+760,z(grade),'#8d704b');text(x+430,z(grade)+22,f'Authored grade{grade:g}; actual site unknown',14)
        box(x+110,z(p['firstRCMm'][0]),24,(p['firstRCMm'][0]-g['dryRC'][1])*.09,'#c6c6b1')
        for key,color in [('wetRCPlinth','#8eaaa6'),('mineralCourse','#d3b77f'),('dryRC','#a4b7b4'),('glass','#e5d79c'),('accessibleDistribution','#e9ebdb'),('finish','#8b7f6e')]:
            lo,hi=g[key];box(x+110,z(hi),320,(hi-lo)*.09,color)
        lo,hi=p['firstRCMm'];box(x+110,z(hi),320,(hi-lo)*.09,'#a4b7b4')
        line(x+122,z(p['firstFFLMm']),x+122,z(p['atticDatumMm']),'#9a9c8a',True)
        text(x+150,z((p['firstFFLMm']+p['atticDatumMm'])/2),'Upper wall/roof termination not assigned',13)
        for value,label in [(g['coldGridTop'],'Coldgrid/captop fixed'),(g['ffl'],'Ground occupied'),(lo,'First RC soffit'),(p['firstFFLMm'],'First FFL'),(p['atticDatumMm'],'Attic DATUM: floor unproved')]:
            line(x+135,z(value),x+450,z(value));text(x+455,z(value)-4,f'{label} {value:g}',14)
        for row in r['roof']['assemblyDatums']:
            line(x+100,z(row['translatedComparisonMm']),x+400,z(row['translatedComparisonMm']),'#a6624f',True)
            text(x+405,z(row['translatedComparisonMm'])-3,f'{row["id"]} {row["translatedComparisonMm"]:.1f}',13)
        text(x,1050,f'First height above authored grade {r["heights"]["firstAboveAuthoredGradeMm"]:g}; storey interval{p["storeyIntervalMm"]:g}.',16)
        text(x,1078,f'Cap-to-first-soffit core height{r["walls"]["ordinaryGroundStructuralHeightMm"]:g}; no source3350 reuse.',16)
        a=r['approaches']['front'];text(x,1106,f'Front 1:{a["slopeRatio"]:g}: rise{a["riseMm"]:g}, sloping run{a["slopingRunMm"]:g}, reservation{a["totalStraightReservationMm"]:g}.',15)
        text(x,1134,f'Wet plinth{g["wetRCPlinth"]}; mineral{g["mineralCourse"]}; RC{g["dryRC"]}; glass{g["glass"]}.',14)
        text(x,1162,f'Service{g["accessibleDistribution"]}; finish{g["finish"]}; waterstop CONCEPT{r["waterstop"]["candidateConceptIntervalMm"]}.',14)
        text(x,1190,f'North arch spring{r["walls"]["northPortal"]["rawSpringMm"]:g}; crown{r["walls"]["northPortal"]["rawCrownMm"]:g}.',15)
        text(x,1218,f'Exposed grade-to-FFL envelope{r["wind"]["exposedGradeToFFLEnvelopeMm"]:g}; no walking-plane occlusion credit.',15)
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
        text(x,2140,'Dashed red: new top20 waterstop concept. No hidden continuous bars or accepted air/water joint.',13)
    text(45,1278,'Roof lines are separate arithmetic assembly references. Weather roof shape and complete house height are withheld.',19)
    text(45,1314,'Ground floor/wall closure, outside wet leaf, DPC/air/gas/thermal returns and new receiving load path remain unresolved.',18)
    text(45,1350,'Source firstFFL3450 = RC3370 +80. Ground/first occupied interval3450 is preserved, not compressed to source RCtop.',18)
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
