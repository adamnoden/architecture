import argparse
import copy
import hashlib
import json
from pathlib import Path
import subprocess

from continuous_rc_cage import barrier_bar_crossings, cage_geometry, frame_bar_paths, geometric_report, proposed_cap_cages, reference_cage_case, render_cage, review_native_actions, screen_cap_cuts


D=Path(__file__).resolve().parent
FIXTURE=D/'continuous-rc-cage-actions.json'
RESULT=D/'continuous-rc-cage-proof.json'
DRAWING=D/'continuous-rc-cage.svg'
DOCUMENT=D.parent/'continuous-rc-portal-cage.md'


def sha(path):return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def compact_saved_proof(result):
    result=copy.deepcopy(result)
    def paths(rows,key):
        for row in rows:
            points=row.pop(key)
            row['sampledPathReceipt']={'pointCount':len(points),'SHA256':hashlib.sha256(json.dumps(points,separators=(',',':'),allow_nan=False).encode()).hexdigest()}
    paths(result['geometry']['archBars'],'pointsMm')
    paths(result['geometry']['outerFrameHalfBars'],'pointsMm')
    paths(result['courtFrameHalfBars'],'pointsMm')
    for cap in result['proposedCapCages']:paths(cap['matBarPaths'],'pointsLocalXYWorldZMm')
    for review in result['nativeCaseReviews']:
        screens=review.pop('screens')
        review['allMemberScreenReceipt']={'rowCount':len(screens),'SHA256':hashlib.sha256(json.dumps(screens,sort_keys=True,separators=(',',':'),allow_nan=False).encode()).hexdigest()}
    result['savedProofScope']='Actualsourcecutsremaincompleteininputreceipt. Fullsampledpaths/memberchecksregeneratefromnativehelper; thissavedproofretainscriticalrows,analyticgeometry,pathdigestsandfullrenderdigest.'
    return result


def native_receipt(path,mode,commit):
    native=json.loads(Path(path).read_text())
    if 'result' in native and 'memberCuts' in native['result']:native=native['result']
    if 'native' in native and 'memberCuts' in native['native']:native=native['native']
    names=('name','caseId','sourceSHA256','request','memberCuts','capCuts','portalNormalContactResults','schedule','pressureBoundary','heads','equilibriumResidualKN_KNm','maximumFrameTranslationMm','portalSupportMode','supportMode')
    receipt={key:copy.deepcopy(native[key]) for key in names if key in native}
    if not commit:raise ValueError('Immutable native producer commit required for a published cage receipt')
    commit=subprocess.check_output(['git','rev-parse',commit],cwd=D.parents[2],text=True).strip()
    for name,want in receipt['sourceSHA256'].items():
        data=subprocess.check_output(['git','show',commit+':'+name],cwd=D.parents[2])
        if hashlib.sha256(data).hexdigest()!=want:raise ValueError('Native source tuple differs from immutable producer: '+name)
    for row in receipt.get('portalNormalContactResults',[]):row.pop('normalSamples',None)
    receipt['nativeFullResultSHA256']=sha(path)
    receipt['authoredCageSupportMode']=mode
    receipt['immutableProducerCommit']=commit
    receipt['verifiedImmutableSourceCount']=len(receipt['sourceSHA256'])
    artifact=Path(path).resolve()
    try:
        repo=Path(subprocess.check_output(['git','rev-parse','--show-toplevel'],cwd=artifact.parent,text=True,stderr=subprocess.DEVNULL).strip())
        relative=str(artifact.relative_to(repo))
        artifact_commit=subprocess.check_output(['git','log','-1','--format=%H','--',relative],cwd=repo,text=True).strip()
        data=subprocess.check_output(['git','show',artifact_commit+':'+relative],cwd=repo,stderr=subprocess.DEVNULL)
        if hashlib.sha256(data).hexdigest()!=sha(artifact):raise ValueError('Native artifact differs from its immutable publication')
        receipt['immutableNativeArtifact']={'commit':artifact_commit,'path':relative,'SHA256':sha(artifact)}
    except subprocess.CalledProcessError:
        receipt['immutableNativeArtifact']=None
    return receipt


def proof(fixture):
    root=D.parents[2];had=root/'project/had/studies/water-replan.json';grid_path=D/'current-house-grid.json'
    portal=json.loads(had.read_text())['model']['insulatedPortal'];grid=json.loads(grid_path.read_text())
    case=reference_cage_case();report=geometric_report(case,portal)
    cap_cages=proposed_cap_cages(case,portal,grid);reviews=[]
    for native in fixture['cases']:
        candidate=copy.deepcopy(case);candidate['supportMode']=native['authoredCageSupportMode']
        if candidate['supportMode']=='historical-rocking-DPC-upper-loops':candidate['barMandrelMm']=120.
        result=review_native_actions(native,candidate,portal)
        result['capCutReviews']=screen_cap_cuts(candidate,proposed_cap_cages(candidate,portal,grid),native.get('capCuts',[]))
        result['nativeFullResultSHA256']=native['nativeFullResultSHA256']
        result['nativeSupportMode']=native['authoredCageSupportMode']
        result['immutableProducerCommit']=native['immutableProducerCommit']
        result['verifiedImmutableSourceCount']=native['verifiedImmutableSourceCount']
        result['immutableNativeArtifact']=native.get('immutableNativeArtifact')
        result['nativeEquilibriumResidualKN_KNm']=native.get('equilibriumResidualKN_KNm')
        result['nativeHeadReactions']=native.get('heads')
        result['physicalNativeSchedule']=native.get('schedule')
        reviews.append(result)
    edited=copy.deepcopy(case);edited['relativeBarBoxToleranceMm']=8
    h16=copy.deepcopy(case);h16.update(barDiameterMm=16,barMandrelMm=160)
    narrow=copy.deepcopy(case);narrow['upstandWidthMm']=180
    active=next((native for native in reversed(fixture['cases']) if native['authoredCageSupportMode']==case['supportMode']),None)
    geometry=cage_geometry(case,portal);frames_court=frame_bar_paths(case,portal,3820.)
    frame_length=sum(row['centrelineLengthMm'] for row in report['outerFrameHalfBars']+frames_court)
    arch_length=2*sum(row['centrelineLengthMm'] for row in report['archBars'])
    cap_extra=sum(row['bareMainAndMeshSteelKg']-4*.5*math_pi_bar_mass(case) for row in cap_cages)
    source_tuple={'project/had/studies/water-replan.json':sha(had),'project/str/studies/current-house-grid.json':sha(grid_path),
        'project/str/studies/continuous_rc_cage.py':sha(D/'continuous_rc_cage.py'),
        'project/str/studies/continuous_rc_cage_proof.py':sha(Path(__file__))}
    result={'schema':'str-continuous-rc-cage-proof/1','status':'authored-cage-with-source-bound-necessary-checks-and-explicit-interface-holds',
        'sourceSHA256':source_tuple,'actionReceiptSHA256':sha(FIXTURE),'case':case,'geometry':report,
        'courtFrameHalfBars':frames_court,'proposedCapCages':cap_cages,'barrierBarCrossings':barrier_bar_crossings(case,portal),
        'nativeCaseReviews':reviews,'activeContinuousNativeCasePresent':active is not None,
        'editedChecks':{'barBox8mm':cage_geometry(edited,portal),'H16Mandrel160FootControl':cage_geometry(h16,portal),
            'upstand180mm':cage_geometry(narrow,portal),
            'sourceActionReceiptUnchanged':sha(FIXTURE)},
        'bareSteelQuantities':{'frameMainBarLengthMmIncludingCapStarters':frame_length,'archBarLengthMm':arch_length,
            'mainBarKgBeforeLinkClosures':(frame_length+arch_length)/1000*math_pi_bar_mass(case)+cap_extra,
            'capMainAndMeshKgExcludingAlreadyCountedFrameStarters':cap_extra,
            'capHoopKgBeforeClosureTails':sum(row['bareHoopSteelKgExcludingClosureTails'] for row in cap_cages),
            'postHoopKgBeforeClosureTails':report['postHoopLayout']['barePostHoopKgAllFourPostsExcludingClosures'],
            'scope':'H12barspineandNEWcapmats/cornerbars; notacompletefabricationcutlist. Arch/post/upstandclosedlinks,closuretails,tie wire,wasteandwaterstopmetalnotincluded. RC25kN/m3nativeweightisnotadditivelyincreasedbythisbaresteelquantity.'},
        'remainingInternalDuties':[
            'Actual closing-link hooks and ring/post/upstand cage intersections in the3Dtransition remain unqualified; planarroundedhoops are not hookclash proof.',
            'Finite arch/post/upstand node forces are retained; actual 3Dconcretecompressionstruts,jointpanels,bond splitting and force introduction require the shown bodies/reinforcement, not grossstress approval.',
            'Newcapmats andcornerbars haveactualaxes/clearance. Cap-to-grid beam cage and3Dnodal path remain distinct from capnecessarysection screens; no existing beam schedule was fabricated.',
            'All 16barcrossingsatdiagnostic −40plane require rib/collar/metaljunctiongeometry,compatibleweldabilityorothersealroute,retainedbarstrengthandwater/airperformance. NominalH12strengthawayfromheatedseal isnotasealzoneapproval.',
            'Actualunloadedfloor/perimeterbarrier,sourcewarm140clipandwallDPCreturns remain coordinated withMAT; continuousRCisacapillarybypassuntilthosephysicaljoinsareearned.',
            'Authored.25EI/GJ factors are not verifiedH12crackedstiffness; biaxialsection,joint,second-order andfull52-head/roof/site proof remain open.'
        ],'cageFabricationReleased':False,'wholeStructureSelected':False,'ownerAppearanceApproval':False,'materialAdoption':False}
    drawing=render_cage(report);result['sectionSvgSHA256']=hashlib.sha256(drawing.encode()).hexdigest()
    return compact_saved_proof(result),drawing


def math_pi_bar_mass(case):
    import math
    return math.pi*case['barDiameterMm']**2/4*.00785


def summary_markdown(result):
    g=result['geometry']['geometry'];case=result['case'];rows=[]
    for review in result['nativeCaseReviews']:
        cap=max((row['linearUniaxialRatio'] for row in review['capCutReviews']),default=0)
        bend=review['worstBendMandrelComparison']
        rows.append(f"| {review['caseId']} | {review['worstUniaxialComparison']['linearUniaxialRatio']:.4f} | {review['worstClosedLinkFlowComparison']['linkFlowRatio']:.4f} | {cap:.4f} | {bend['mandrelRequiredForWitnessMm']:.2f} / {bend['authoredMandrelMm']:g} |")
    pressure=[]
    for review in result['nativeCaseReviews']:
        for row in review['boundedCompressionContact']:
            pressure.append(f"| {row['pierId'].replace('NORTH/LOWER-RC/','')} | {row['minimumPossiblePeakPressureMPaAtTheseResultants']:.4f} | {'fails' if row['boundedPressureEquilibriumImpossibleForCurrentResultants'] else 'not rejected'} |")
    text=f'''# Continuous RC portal: actual H12 cage and cap comparison

**Recommendation:** develop the one {case['normalCoreMm']:g} mm normal-core / {case['upstandWidthMm']:g} mm upstand candidate with this NEW H12 spine. The source-bound member checks are necessary comparisons, not fabrication release. The historical rocking-plane result below is rejected against unenhanced 17 MPa compression. Continuous RC removes that mechanical gap but needs the actual metal waterstop/bar interfaces; it is not itself a capillary break.

The [native helper](studies/continuous_rc_cage.py), [actual action receipts](studies/continuous-rc-cage-actions.json), [recomputed proof](studies/continuous-rc-cage-proof.json), [drawing](studies/continuous-rc-cage.svg) and tests are new isolated files. Every native source tuple was checked against its recorded immutable producer commit before receipt creation. Historical pre-exposure-audit actions remain explicitly historical. Only source-loaded cases actually shown below are claimed; no 96-state structural sweep or full-house proof is invented.

## One physical reinforcement concept

Four H12 post bars continue from Z−680 through the former −50..−30 plane, then bend into the 200 mm upstands. They have no structural gap, inferred cap anchor or hidden rocking release. Actual cap embedment is 500 mm; the conservative 480 mm credit exceeds 434.783 mm full-yield good-bond development. The separate four arch bars have {case['barMandrelMm']:g} mm inner mandrels, {g['mainBendCentrelineRadiusMm']:g} mm centreline bends and 500 mm straight tails. Intrados tails turn into the inner along-X row; extrados tails occupy the outer row. Reversing that nesting creates a real bar-path crossing.

H8 links are NEW authored reinforcement. Nominal 45 mm cover preserves 40 mm under 5 mm whole-cage setting. The rounded 32 mm link mandrel gives 20 mm centreline radius and H12 face 69 mm. Post bars sit at normal ±76 mm; arch tails jog to ±25.333 mm. The actual 3D paths have minimum nominal clear {result['geometry']['minimumNominal3DJointMainBarClearanceMm']:.3f} mm and adverse box lower bound {result['geometry']['minimumAdverse3DJointMainBarClearanceLowerBoundMm']:.3f} mm. Independent relative bar placement is ±5 mm; the rounded-hoop surface margin is {g['minimumRoundedHoopToMainBarSurfaceMm']:.3f} mm.

Post hoop stations are explicit. A rigid 50 mm grid hits the arch bars; the target 50 mm joint pitch is adjusted to an actual maximum {result['geometry']['postHoopLayout']['maximumJointActualPitchMm']:g} mm at the passages. All post gaps remain at most 100 mm, as used in the conservative flow screen. The actual adverse arch-to-hoop envelope clearance is {result['geometry']['postHoopLayout']['minimumAdverseArchToHoopSurfaceClearMm']:.3f} mm. No hoop occupies the reserved −80..0 metal-barrier working band. Formed closure hooks, ring-transition links and intersections remain explicit fabrication duties; a closed-loop envelope is not a qualified closure.

At the upper post, bars jog to the actual200 mm upstand cage. Staggered 1000 mm contact laps at X4550..5550 and 6450..7450 use tied pairs, with vertical inward jogs. Poor-bond full-yield development 621.118 mm and the conservative 1.5 lap multiplier require 931.677 mm. Full H16 capacity and outer-face ring steel positions are not carried forward: each member screen uses the actual H12 positions, reduced weak lever and smaller closed-link cell. Straight-link flow supply also uses the .92 steel comparison factor.

## Actual simultaneous actions

| Native source-loaded case | Uniaxial linear comparison | Link-flow comparison | Cap comparison | Worst bend witness, mm |
| --- | ---: | ---: | ---: | ---: |
{chr(10).join(rows)}

These are individual uniaxial/flow necessary screens, not a biaxial or joint-panel approval. The bend force is an explicit four-corner strut/tie equilibrium witness for the actual N/My/Mz, not invented full-yield demand or compatible bar stresses. The .25 source EI/GJ factors remain authored comparisons; H12 cracking and second-order stiffness are not proved by a section strength ratio.

## New cap reinforcement, not an existing schedule

P25/P26/P28/P30 retain their actual 600×600×570 bodies and eccentric pier positions. Each gets new H12 top/bottom mats with explicit axes avoiding the starters, four additional vertical corner construction bars at local (±195,±195), and 430 mm centreline H8 hoops at Z−630/−530/−430/−330/−300. Full axis/level/cut quantities are in the proof. Minimum adverse mesh-to-vertical bar clearance is 27 mm; mesh cover remains 40 mm after setting and relative placement.

EW mat end bends terminate at ±244, NS ends at ±185, preventing doubled orthogonal corner hooks. The {case['barMandrelMm']:g} mm mandrels have 100 mm straight vertical tails; actual cap-cut chord forces are checked against poor-bond tail development and bend bearing. Construction corner bars receive **no structural section credit**. At the −405 cap cut, only 263 mm adverse starter bond length is available, limiting credited steel stress to 263 MPa; the upper cut has 488 mm and 400 MPa credit. The cap-to-grid nodal/cage path and lower cap/pile connection remain separate from these necessary upper-cap screens.

## Exact historical compression-plane rejection

For the recorded rocking-foot N/M, let dx/dy be the resultant centroid distances from its nearest corner. The least possible pressure peak is N/(4.5dxdy), attained by uniform pressure on the triangle with intercepts 3dx/3dy. These triangles fit the real faces. Integrating 1−x/(3dx)−y/(3dy) supplies the matching dual lower bound. Thus local pressure reshaping alone cannot evade a failing 17 MPa comparison for these **current recorded resultants**; a changed compatible material law can change the resultants and must be solved again.

| Historical pier | Minimum possible peak, MPa | Against17 MPa |
| --- | ---: | --- |
{chr(10).join(pressure)}

## Material, installation and actual remaining proof

The 290 mm core consumes 37.5 mm of each source 240 mm cellular-glass face: 202.5 mm glass plus 40 mm lining retains 775 mm finished width. RC/infill additions and actual head reactions remain those of each native source case; bare steel quantities are not added again to its 25 kN/m³ RC assumption. Removing the old visible transom still needs owner appearance acceptance.

All 16 H12 crossings at the diagnostic −40 plane are located. Their nominal bare projections intersect the source 140 mm warm-core clip; eight straddle its edge. Rib envelope, collar/metal thickness, compatible bar-to-waterstop process, retained heat-affected bar strength, impermeability and perimeter/masonry-DPC returns are unproved. The 20 mm finite RC continuity is a mechanical diagnostic, not the actual sheet/steel/concrete joint.

Place the new cap cage and continuous starters, assemble the post/arch/upstand bars with the stated nesting/laps, complete actual link closures and joint reinforcement, coordinate and inspect the waterstop/bar interfaces, then cast the supported body and install the separate unloaded perimeter/field returns. Before fabrication release, the missing internal mechanics are: three-dimensional joint/strut and bond-splitting resistance; closure-hook/intersection clash geometry; cap/grid bar continuity; actual waterstop section/process strength; and source-complete wind/gravity/roof/foundation applicability. No soil or pile capacity, selected structure, water barrier, installed test or owner approval is claimed.

The source rectangular steel law is reused as a four-bar control and extended to actual cap bar coordinates. Detailing comparisons also use [The Concrete Centre, Concise Eurocode 2, sections 11.2–11.5](https://www.concretecentre.com/TCC/media/TCCMediaLibrary/Events/Online%20course/CCIP_Concise_EC2.pdf): bar spacing, bend bearing, anchorage and poor-bond conditions. Actual materials and execution quality remain explicit assumptions, not certified identities.
'''
    return text


if __name__=='__main__':
    parser=argparse.ArgumentParser();group=parser.add_mutually_exclusive_group(required=True)
    group.add_argument('--write',action='store_true');group.add_argument('--check',action='store_true')
    parser.add_argument('--historical-native');parser.add_argument('--continuous-native')
    parser.add_argument('--historical-commit');parser.add_argument('--continuous-commit');args=parser.parse_args()
    if args.write and (args.historical_native or args.continuous_native):
        cases=[]
        if args.historical_native:cases.append(native_receipt(args.historical_native,'historical-rocking-DPC-upper-loops',args.historical_commit))
        if args.continuous_native:cases.append(native_receipt(args.continuous_native,'continuous-rc-through-former-DPC',args.continuous_commit))
        FIXTURE.write_text(json.dumps({'schema':'str-continuous-rc-cage-source-cuts/1','cases':cases},indent=2,allow_nan=False)+'\n')
    if not FIXTURE.exists():raise SystemExit('A real native source-cut receipt is required before proof generation')
    result,drawing=proof(json.loads(FIXTURE.read_text()));text=json.dumps(result,indent=2,allow_nan=False)+'\n'
    document=summary_markdown(result)
    if args.write:RESULT.write_text(text);DRAWING.write_text(drawing);DOCUMENT.write_text(document)
    elif RESULT.read_text()!=text or DRAWING.read_text()!=drawing or DOCUMENT.read_text()!=document:raise SystemExit('Stale source-bound cage proof, drawing or review')
    print('Actual3Dbarpaths,caps,source membercuts and pressure bounds; no cage fabrication or house selection')
