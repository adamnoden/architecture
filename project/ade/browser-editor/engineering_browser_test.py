"""Real HTTP/compiler acceptance for the engineering document editor."""
import argparse
import json
import subprocess
import tarfile
from pathlib import Path


def ready(page, revision, timeout=120000):
    from playwright.sync_api import expect
    expect(page.locator('#analysis')).to_have_text(f'Engineering ready for revision {revision}.', timeout=timeout)


def roof_svg(page):
    return page.locator('#current-roof').evaluate("img => decodeURIComponent(img.src.split(',')[1])")


def lighting_svg(page):
    return page.locator('#current-lighting').evaluate("img => decodeURIComponent(img.src.split(',')[1])")


def current_wet_stages(request=None):
    """Project authored choices from the actual current request, not a second model."""
    studies=Path('project/str/studies')
    if request is None:
        proof=json.loads((studies/'floor-section-proof.json').read_text())
        request=next(c['executedRequest'] for c in proof['controls'] if c['nativeCaseId']=='wet-aligned-quadrature8')
    bearing=request['bearingCase'];masonry=bearing['masonryCase'];vertical=masonry['verticalCase']
    house=vertical['monolithicCase']['houseCase'];joined=house['joinedCase'];floor=joined['floor']
    pick=lambda value,keys:{key:value[key] for key in keys.split()}
    return {
        'distributedFloor':{**pick(floor,'cornerWidthsMm memberLaw jointLaw membraneLaw edgeBand maxPitchMm boundaryCase receivingLaws use'),
            'edits':floor['componentCase']['edits']},
        'masonryFrame':{**pick(joined,'geometry portalDPCNormalMode portalDPCNormalIntegration portalDPCQuadratureOrder portalDPCNormalSubdivisions portalDPCInsetMm'),
            'portal':pick(joined['portal'],'frameLaw dpcLaw dpcIntervalZMm coverMm archSegments infillHeadGapMm'),
            'caseId':'BROWSER-WET-CAGE','coreAxialWidthMm':house['coreAxialWidthMm'],'northUpstandWidthMm':house['northUpstandWidthMm'],
            'physicalGFactor':house['boundary']['physicalGFactor'],'includeExternalGMAXQ':house['boundary']['includeExternalGMAXQ'],
            **pick(vertical,'plateLaw bearingLaw maxPitchMm bearingQuadratureOrder freshUniformLiveKPa'),
            **pick(masonry,'masonrySeatProjectionMm masonryUnitWeightKNM3 abutmentSlices foundationWeight courtCornerClosure floorReinforcement lowerCoreBodies lowerLWeight straightFrameCage'),
            # Upper bearing has already removed the obsolete bilateral roof
            # laws. The saved-stage compiler needs the retained explicit roof
            # controls here before it performs that same transition again.
            'roofCoupling':bearing['roofControls']},
        'upperRoofBearing':pick(bearing,'seats masonryUnitWeightKNPerM3 masonryModulusMPa jointNormalComplianceMmPerMPa padThicknessMm padUnitWeightKNPerM3'),
        'roofPitch':{'pitchDeg':25},
        'floorSection':{'thicknessMm':request['thicknessMm'],'wetSupport':request['wetSupport'],
            'cageComparison':json.loads((studies/'wet-support-cage-comparison-settings.json').read_text())}}


def check_wet_beam_end(page,saved,args):
    """Exercise the actual authored120/south40/q64 alternative in the same editor."""
    from playwright.sync_api import expect
    studies=Path('project/str/studies')
    with tarfile.open(studies/'wet-beam-end-native-captures.tar.xz') as archive:
        request=json.load(archive.extractfile('south40-q64.request.json'))
        native_control=json.load(archive.extractfile('south40-q64.full.json'))
    stages=current_wet_stages(request)
    stages['masonryFrame']['caseId']='WET120-SOUTH40-q64'
    stages['floorSection']['cageComparison']['postTopLevelRaiseMm']=10
    stages['floorSection']['beamEndDevelopment']={'endReturnMandrelMm':80,'strutCotangentComparisons':[1,2.5]}
    source={**saved,'stages':stages}
    with page.expect_file_chooser() as chooser:
        page.get_by_role('button',name='Import JSON').click()
    chooser.value.set_files({'name':'wet-beam-end.json','mimeType':'application/json','buffer':json.dumps(source).encode()})
    expect(page.locator('#wet-beam-end-controls')).to_be_visible(timeout=300000)
    ready(page,0,300000)
    control=page.get_by_label('End-return mandrel (mm)')
    expect(control).to_have_value('80')
    expect(page.locator('#beam-end-result')).to_contain_text('0 path-pair, 0 closure and 0 cover failures')
    expect(page.locator('#beam-end-result')).to_contain_text('curved-bar force, finite end transfer, anchorage and placement remain unresolved')
    initial=page.locator('#current-beam-end').get_attribute('src')
    assert initial and page.locator('#comparison-beam-end').get_attribute('src')==initial
    native_cage=page.locator('#cage-result').inner_text()
    roof=roof_svg(page)
    control.fill('100');control.press('Enter')
    ready(page,1,300000)
    expect(page.locator('#beam-end-result')).to_contain_text('mandrel 100 mm')
    assert page.locator('#current-beam-end').get_attribute('src')!=initial
    assert page.locator('#comparison-beam-end').get_attribute('src')==initial
    assert page.locator('#cage-result').inner_text()==native_cage
    assert roof_svg(page)==roof
    with page.expect_download() as download:
        page.get_by_role('button',name='Export JSON').click()
    exported=json.loads(Path(download.value.path()).read_text())
    expected={**source['stages']['floorSection'],'beamEndDevelopment':{'endReturnMandrelMm':100,'strutCotangentComparisons':[1,2.5]}}
    assert exported['stages']=={**source['stages'],'floorSection':expected}
    compiled=json.loads(subprocess.run(['node','--import','tsx','scripts/compile-current-design.ts','--bundle','-'],
        input=json.dumps(exported),text=True,capture_output=True,check=True).stdout)['engineering']['floorSection']
    end=compiled['wetBeamEndDevelopment']
    assert end['nativeRequest']==request
    assert end['status']=='computed-development-comparison' and end['controls']['endReturnMandrelMm']==100
    for key in ('candidateAccepted','nativeSolveExecuted','nativeCageMassFeedbackApplied','beamEndDRegionAccepted','bendPressureAccepted','bondAndAnchorageAccepted'):
        assert end[key] is False
    assert end['drawings']['wet-beam-end.svg'] in page.locator('#current-beam-end').evaluate("img=>decodeURIComponent(img.src.split(',')[1])")
    expected_heads=native_control['nativeVertical']['native']['heads']
    actual_heads=compiled['native']['heads']
    assert [row['id'] for row in actual_heads]==[row['id'] for row in expected_heads]
    assert max(abs(a-b) for left,right in zip(actual_heads,expected_heads) for a,b in zip(left['reactionKN_KNm'],right['reactionKN_KNm']))<1e-8
    page.get_by_role('button',name='Undo',exact=True).click()
    ready(page,2,300000)
    expect(control).to_have_value('80')
    assert page.locator('#current-beam-end').get_attribute('src')==initial
    assert page.locator('#cage-result').inner_text()==native_cage
    print('PASS actual wet-beam-end browser80/100/undo, unchanged native heads/reference cage/roof and exported CLI',flush=True)
    if args.screenshot:
        page.screenshot(path=str(Path(args.screenshot).with_name('wet-beam-end-comparison.png')),full_page=True)


def main():
    from playwright.sync_api import expect, sync_playwright
    parser = argparse.ArgumentParser()
    parser.add_argument('url', nargs='?', default='http://127.0.0.1:4187/engineering.html')
    parser.add_argument('--chromium')
    parser.add_argument('--screenshot')
    parser.add_argument('--wet-beam-end-only',action='store_true',help='Run only the actual end-return extension after the initial roof control')
    args = parser.parse_args()
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(executable_path=args.chromium)
        page = browser.new_page(viewport={'width': 1440, 'height': 1000})
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.goto(args.url)
        ready(page, 0)
        if args.wet_beam_end_only:
            with page.expect_download() as download:
                page.get_by_role('button',name='Export JSON').click()
            saved=json.loads(Path(download.value.path()).read_text())
            check_wet_beam_end(page,saved,args)
            assert not errors,errors
            browser.close()
            return
        expect(page.locator('#wet-beam-end-controls')).to_be_hidden()
        expect(page.locator('#wet-beam-end-views')).to_be_hidden()
        expect(page.locator('#lighting-controls')).to_be_hidden()
        expect(page.locator('#lighting-views')).to_be_hidden()
        expect(page.locator('#inlet-bank-controls')).to_be_hidden()
        expect(page.locator('#inlet-bank-views')).to_be_hidden()
        original = roof_svg(page)
        expect(page.locator('#schedule')).to_contain_text('8409.33')
        pitch = page.get_by_label('Roof pitch (degrees)')
        pitch.fill('27')
        pitch.press('Enter')
        ready(page, 1)
        changed = roof_svg(page)
        assert changed != original
        expect(page.locator('#schedule')).to_contain_text('8501.16')
        expect(page.locator('#evidence')).to_contain_text('STR roof actions and stiffness')
        expect(page.locator('#evidence')).to_contain_text('water-event applicability is withheld')
        page.get_by_role('button', name='Undo', exact=True).click()
        ready(page, 2)
        assert roof_svg(page) == original
        page.get_by_role('button', name='Redo', exact=True).click()
        ready(page, 3)
        assert roof_svg(page) == changed
        page.get_by_role('button', name='Use current as comparison').click()
        expect(page.locator('#affected')).to_have_text('Document matches the comparison.')
        page.get_by_role('button', name='Save document', exact=True).click()
        with page.expect_download() as download:
            page.get_by_role('button', name='Export JSON').click()
        saved = json.loads(Path(download.value.path()).read_text())
        assert saved['schema'] == 'current-engineering-document/1'
        assert saved['stages']['roofPitch']['pitchDeg'] == 27
        # Public CLI consumes the exact browser-exported document.
        result = subprocess.run(['node', '--import', 'tsx', 'scripts/compile-current-design.ts', '--bundle', '-'],
                                input=json.dumps(saved), text=True, capture_output=True, check=True)
        compiled = json.loads(result.stdout)
        assert compiled['engineering']['roofPitch']['schedule']['fieldSectionQZMm'][2][1] > 8501
        page.reload()
        ready(page, 0)
        page.get_by_role('button', name='Load saved document').click()
        expect(page.locator('#storage')).to_contain_text('all stages and bindings retained', timeout=120000)
        ready(page, 0)
        assert roof_svg(page) == changed
        expect(page.get_by_role('button', name='Undo', exact=True)).to_be_disabled()

        # Import an additional supported stage and verify it survives editing and export.
        saved['stages']['studyRoomKit'] = {'pitchMm': 450, 'wearingFace': 'oak', 'firstRestBoardSizeMm': [300, 300]}
        with page.expect_file_chooser() as chooser:
            page.get_by_role('button', name='Import JSON').click()
        chooser.value.set_files({'name': 'with-study.json', 'mimeType': 'application/json', 'buffer': json.dumps(saved).encode()})
        expect(page.locator('#stage-scope')).to_contain_text('studyRoomKit', timeout=120000)
        page.get_by_role('button', name='Increase 1 degree').click()
        ready(page, 1)
        with page.expect_download() as download:
            page.get_by_role('button', name='Export JSON').click()
        retained = json.loads(Path(download.value.path()).read_text())
        assert retained['stages']['studyRoomKit'] == saved['stages']['studyRoomKit']
        assert retained['bindings'] == saved['bindings']
        assert retained['design'] == saved['design']

        # An older real HTTP reply arrives after a newer compiled revision.
        held = []
        def hold_first(route):
            payload = route.request.post_data_json
            if payload['ticket']['base']['revision'] == 2 and not held:
                held.append((route, route.fetch(timeout=120000)))
            else:
                route.continue_()
        page.route('**/api/engineering/compile', hold_first)
        pitch.fill('29'); pitch.press('Enter')
        expect(page.locator('#analysis')).to_have_text('Compiling revision 2…')
        pitch.fill('30'); pitch.press('Enter')
        ready(page, 3)
        assert held
        current = roof_svg(page)
        held[0][0].fulfill(response=held[0][1])
        expect(page.locator('#stale')).to_have_text('Ignored analysis from earlier revision 2.')
        ready(page, 3)
        assert roof_svg(page) == current
        pitch.fill('24'); pitch.press('Enter')
        expect(page.locator('#diagnostic')).to_contain_text('at least 25', timeout=120000)
        assert page.locator('#current-roof').get_attribute('src') is None
        page.get_by_role('button', name='Undo', exact=True).click()
        ready(page, 5)
        # The public CLI authors the explicit lighting/room-kit document. The
        # browser exposes the same comparison without adopting it by default.
        lighting_document = json.loads(subprocess.run(
            ['node', '--import', 'tsx', 'scripts/compile-current-design.ts', '--read-study-lighting', '-'],
            input=json.dumps(saved['design']), text=True, capture_output=True, check=True).stdout)
        with page.expect_file_chooser() as chooser:
            page.get_by_role('button', name='Import JSON').click()
        chooser.value.set_files({'name': 'study-lighting.json', 'mimeType': 'application/json',
                                'buffer': json.dumps(lighting_document).encode()})
        expect(page.locator('#lighting-controls')).to_be_visible(timeout=120000)
        ready(page, 0)
        depth = page.get_by_label('Study service depth (mm)')
        expect(depth).to_have_value('75')
        expect(page.locator('#lighting-result')).to_contain_text('common axis 37 mm')
        expect(page.locator('#lighting-result')).to_contain_text('owner acceptance remain unqualified')
        expect(page.locator('#lighting-diagnostics')).to_contain_text('without dimensioned axes')
        initial_lighting, lighting_roof = lighting_svg(page), roof_svg(page)
        depth.fill('85'); depth.press('Enter')
        ready(page, 1)
        expect(page.locator('#lighting-result')).to_contain_text('common axis 47 mm')
        changed_lighting = lighting_svg(page)
        assert changed_lighting != initial_lighting
        assert roof_svg(page) == lighting_roof
        with page.expect_download() as download:
            page.get_by_role('button', name='Export JSON').click()
        lighting_saved = json.loads(Path(download.value.path()).read_text())
        assert lighting_saved['stages']['studyLighting'] == {
            **lighting_document['stages']['studyLighting'], 'serviceTotalDepthMm': 85}
        assert lighting_saved['stages']['studyRoomKit'] == lighting_document['stages']['studyRoomKit']
        cli_lighting = json.loads(subprocess.run(
            ['node', '--import', 'tsx', 'scripts/compile-current-design.ts', '--bundle', '-'],
            input=json.dumps(lighting_saved), text=True, capture_output=True, check=True).stdout)
        assert cli_lighting['engineering']['studyLighting']['commonDepthCornerSvg'] == changed_lighting
        page.get_by_role('button', name='Undo', exact=True).click()
        ready(page, 2)
        assert lighting_svg(page) == initial_lighting
        page.get_by_role('button', name='Redo', exact=True).click()
        ready(page, 3)
        assert lighting_svg(page) == changed_lighting
        if args.screenshot:
            page.screenshot(path=str(Path(args.screenshot).with_name('study-lighting-comparison.png')), full_page=True)
        held_lighting = []
        def hold_lighting_reply(route):
            if route.request.post_data_json['ticket']['base']['revision'] == 4 and not held_lighting:
                held_lighting.append((route, route.fetch(timeout=120000)))
            else:
                route.continue_()
        page.route('**/api/engineering/compile', hold_lighting_reply)
        depth.fill('90'); depth.press('Enter')
        expect(page.locator('#analysis')).to_have_text('Compiling revision 4…')
        depth.fill('80'); depth.press('Enter')
        ready(page, 5)
        latest_lighting = lighting_svg(page)
        assert held_lighting
        held_lighting[0][0].fulfill(response=held_lighting[0][1])
        expect(page.locator('#stale')).to_have_text('Ignored analysis from earlier revision 4.')
        assert lighting_svg(page) == latest_lighting
        page.unroute('**/api/engineering/compile', hold_lighting_reply)
        depth.fill('27'); depth.press('Enter')
        ready(page, 6)
        expect(page.locator('#lighting-result')).to_contain_text('REJECTED')
        expect(page.locator('#lighting-diagnostics')).to_contain_text('purpose-enclosure-enters-retained-boundary')
        page.get_by_role('button', name='Undo', exact=True).click()
        ready(page, 7)
        assert lighting_svg(page) == latest_lighting
        # Explicit current inlet stage: real HTTP edits and CLI consume the same source8.
        inlet_request=json.loads(subprocess.run(['node','--import','tsx','scripts/compile-current-design.ts','--read-inlet-source-envelope','-'],input=json.dumps(saved['design']),text=True,capture_output=True,check=True).stdout)
        inlet_document={**saved,'stages':{'roofPitch':saved['stages']['roofPitch'],'inletSourceEnvelope':{**inlet_request['sourceEnvelope']['settings'],'splitPlantRoom':inlet_request['sourceEnvelope']['splitPlantRoom']}}}
        with page.expect_file_chooser() as chooser:
            page.get_by_role('button',name='Import JSON').click()
        chooser.value.set_files({'name':'inlet-bank.json','mimeType':'application/json','buffer':json.dumps(inlet_document).encode()})
        expect(page.locator('#inlet-bank-controls')).to_be_visible(timeout=120000)
        ready(page,0)
        expect(page.locator('#inlet-result')).to_contain_text('Finite route/operation/clamp envelope: REJECTED')
        initial_bank=page.locator('#current-inlet-bank').get_attribute('src')
        expect(page.locator('#inlet-candidate-result')).to_contain_text('Explicit unadopted route: REJECTED')
        initial_candidate=page.locator('#current-inlet-candidate').get_attribute('src')
        assert initial_candidate and 'complete' in page.locator('#current-inlet-candidate').get_attribute('alt')
        expect(page.locator('#inlet-result')).to_contain_text('remain unqualified')
        expect(page.locator('#inlet-plant-room-result')).to_contain_text('requires the actual saved ground profile')
        assert page.locator('#current-inlet-plant-room').get_attribute('src')
        assert page.locator('#comparison-inlet-plant-room').get_attribute('src')
        page.locator('#inlet-field').select_option('indoorTailOffsetMm')
        expect(page.locator('#inlet-value')).to_have_value('250')
        page.locator('#inlet-value').fill('200');page.locator('#inlet-value').press('Enter')
        ready(page,1)
        expect(page.locator('#inlet-result')).to_contain_text('REJECTED')
        assert page.locator('#current-inlet-bank').get_attribute('src')!=initial_bank
        expect(page.locator('#inlet-candidate-result')).to_contain_text('unavailable for the edited connections')
        assert page.locator('#current-inlet-candidate').get_attribute('src') is None
        with page.expect_download() as download:
            page.get_by_role('button',name='Export JSON').click()
        changed_bank=json.loads(Path(download.value.path()).read_text())
        assert changed_bank['stages']['inletSourceEnvelope']=={**inlet_document['stages']['inletSourceEnvelope'],'indoorTailOffsetMm':200}
        cli_bank=json.loads(subprocess.run(['node','--import','tsx','scripts/compile-current-design.ts','--bundle','-'],input=json.dumps(changed_bank),text=True,capture_output=True,check=True).stdout)['engineering']['inletSourceEnvelope']
        assert not cli_bank['joinedDirection']['room']['bankReceiver']['necessaryRouteOperationAndClampEnvelopeScreen']
        assert 'INLET_ROUTE_ORDINARY_ARM_COLLISION' in cli_bank['joinedDirection']['room']['bankReceiver']['diagnostics']
        assert not cli_bank['joinedDirection']['room']['indoorRoutes']['operation']['necessaryRouteOperationEnvelopeScreen']
        assert not cli_bank['joinedDirection']['room']['bankReceiver']['nativeStructuralActionsAdopted']
        assert not cli_bank['joinedDirection']['room']['bankReceiver']['wholeOccupiedArrangementComplete']
        page.get_by_role('button',name='Undo',exact=True).click();ready(page,2)
        expect(page.locator('#inlet-value')).to_have_value('250')
        assert page.locator('#current-inlet-bank').get_attribute('src')==initial_bank
        assert page.locator('#current-inlet-candidate').get_attribute('src')==initial_candidate
        page.locator('#inlet-field').select_option('pipeJacketDensityComparisonKgM3')
        page.locator('#inlet-value').fill('4000');page.locator('#inlet-value').press('Enter')
        ready(page,3)
        expect(page.locator('#inlet-result')).to_contain_text('Jacket reference 22.566 kg')
        assert page.locator('#current-inlet-bank').get_attribute('src')==initial_bank
        with page.expect_download() as download:
            page.get_by_role('button',name='Export JSON').click()
        density_bank=json.loads(Path(download.value.path()).read_text())
        cli_density=json.loads(subprocess.run(['node','--import','tsx','scripts/compile-current-design.ts','--bundle','-'],input=json.dumps(density_bank),text=True,capture_output=True,check=True).stdout)['engineering']['inletSourceEnvelope']
        assert cli_density['joinedDirection']['room']['indoorRoutes']['insulationAndJacketInventory']['jacketDensityReferenceKg']<23
        assert cli_density['bound']==cli_bank['bound']
        assert not cli_density['joinedDirection']['room']['bankReceiver']['actualMaterialProductToolAndCarrierSelected']
        page.get_by_role('button',name='Undo',exact=True).click();ready(page,4)
        expect(page.locator('#inlet-value')).to_have_value('8000')
        expect(page.locator('#inlet-result')).to_contain_text('Jacket reference 45.132 kg')
        expect(page.locator('#plant-room-controls')).to_be_visible()
        initial_plant_room=page.locator('#current-inlet-plant-room').get_attribute('src')
        expect(page.locator('#plant-room-value')).to_have_value('400')
        page.locator('#plant-room-value').fill('350');page.locator('#plant-room-value').press('Enter')
        ready(page,5)
        assert page.locator('#current-inlet-plant-room').get_attribute('src')!=initial_plant_room
        assert page.locator('#current-inlet-bank').get_attribute('src')==initial_bank
        with page.expect_download() as download:
            page.get_by_role('button',name='Export JSON').click()
        plant_choice=json.loads(Path(download.value.path()).read_text())
        assert plant_choice['stages']['inletSourceEnvelope']['splitPlantRoom']['clearWidthMm']==350
        page.get_by_role('button',name='Undo',exact=True).click();ready(page,6)
        expect(page.locator('#plant-room-value')).to_have_value('400')
        assert page.locator('#current-inlet-plant-room').get_attribute('src')==initial_plant_room

        # Import the actual current wet request. No default structural stage is
        # silently created, and edits use the same HTTP compiler as the CLI.
        print('Starting actual wet-cage and pad-width native replay',flush=True)
        cage_document={**saved,'stages':current_wet_stages()}
        with page.expect_file_chooser() as chooser:
            page.get_by_role('button', name='Import JSON').click()
        chooser.value.set_files({'name':'wet-cage.json','mimeType':'application/json','buffer':json.dumps(cage_document).encode()})
        expect(page.locator('#wet-cage-controls')).to_be_visible(timeout=240000)
        ready(page,0,240000)
        print('PASS actual wet-cage baseline compile',flush=True)
        expect(page.locator('#lighting-controls')).to_be_hidden()
        expect(page.locator('#lighting-views')).to_be_hidden()
        expect(page.locator('#inlet-bank-controls')).to_be_hidden()
        expect(page.locator('#inlet-bank-views')).to_be_hidden()
        raise_control=page.get_by_label('Graded post-link raise (mm)')
        expect(raise_control).to_have_value('0')
        expect(page.locator('#floor-result')).to_contain_text('52 foundation heads')
        expect(page.locator('#floor-result')).to_contain_text('authored slab laws cannot describe one common positive 3D modulus')
        runtime=json.loads(subprocess.run(['node','--import','tsx','--input-type=module','-e',
            'import {readFourLNumericalRuntime} from "./compiler/reference-house/current-design/structural-four-l-joint-adapter.ts";console.log(JSON.stringify(readFourLNumericalRuntime()));'],text=True,capture_output=True,check=True).stdout)
        joint_proof=json.loads(Path('project/str/studies/four-l-joint-proof.json').read_text())
        if runtime!=joint_proof['witness']['numericalRuntime']:
            expect(page.locator('#floor-result')).to_contain_text('Joint demand unavailable for this numerical runtime')
            expect(page.locator('#floor-result')).to_contain_text('ordinary floor and cage remain computed')
        else:
            expect(page.locator('#floor-result')).to_contain_text('Four rigid-joint demands computed')
        initial_cage=page.locator('#cage-result').inner_text()
        expect(page.locator('#cage-result')).to_contain_text('0 cover failures')
        raise_control.fill('10');raise_control.press('Enter')
        ready(page,1,240000)
        print('PASS actual graded cage raise compile',flush=True)
        expect(page.locator('#cage-result')).to_contain_text('Graded raise 10 mm')
        expect(page.locator('#cage-result')).to_contain_text('0 cover failures')
        expect(page.locator('#cage-result')).to_contain_text('post-head resistance and installed acceptance remain unqualified')
        with page.expect_download() as download:
            page.get_by_role('button',name='Export JSON').click()
        raised=json.loads(Path(download.value.path()).read_text())
        assert raised['stages']['floorSection']['cageComparison']=={**cage_document['stages']['floorSection']['cageComparison'],'postTopLevelRaiseMm':10}
        assert raised['stages']['floorSection']['wetSupport']==cage_document['stages']['floorSection']['wetSupport']
        width_control=page.get_by_label('Bearing pad width (mm)')
        expect(width_control).to_have_value('220')
        width_control.fill('140');width_control.press('Enter')
        ready(page,2,240000)
        print('PASS actual narrower-pad compile',flush=True)
        expect(page.locator('#floor-result')).to_contain_text('Nominal post-head fan computed')
        expect(page.locator('#floor-result')).to_contain_text('Finite nodes, anchorage and tolerance remain unqualified')
        with page.expect_download() as download:
            page.get_by_role('button',name='Export JSON').click()
        narrowed=json.loads(Path(download.value.path()).read_text())
        expected={**raised['stages']['floorSection'],'wetSupport':{**raised['stages']['floorSection']['wetSupport'],'padWidthMm':140}}
        assert narrowed['stages']=={**raised['stages'],'floorSection':expected}
        cli_narrowed=json.loads(subprocess.run(['node','--import','tsx','scripts/compile-current-design.ts','--bundle','-'],input=json.dumps(narrowed),text=True,capture_output=True,check=True).stdout)['engineering']['floorSection']
        assert cli_narrowed['wetPostHeadFan']['status']=='computed-nominal-demand'
        assert cli_narrowed['wetPostHeadFan']['resistanceAccepted'] is False
        assert cli_narrowed['wetPostHeadFan']['toleranceDomainAccepted'] is False
        compatibility=cli_narrowed['slabSolidCompatibility']
        assert compatibility['status']=='common-modulus-ruled-out'
        assert abs(compatibility['ratioToNecessaryBound']-2.333441840277778)<1e-12
        assert compatibility['commonSolidMaterialQualified'] is False
        assert len(cli_narrowed['native']['heads'])==52
        print('PASS browser-exported narrower-pad CLI replay',flush=True)
        page.get_by_role('button',name='Undo',exact=True).click()
        ready(page,3,240000)
        print('PASS actual pad-width undo compile',flush=True)
        expect(width_control).to_have_value('220')
        expect(page.locator('#floor-result')).to_contain_text('This nominal post-head fan does not support the current input')
        page.get_by_role('button',name='Undo',exact=True).click()
        ready(page,4,240000)
        print('PASS actual cage-raise undo compile',flush=True)
        expect(raise_control).to_have_value('0')
        assert page.locator('#cage-result').inner_text()==initial_cage
        if args.screenshot:
            page.screenshot(path=args.screenshot, full_page=True)
        assert not errors, errors
        browser.close()
        print('PASS engineering document authoring, CLI export, explicit Study/inlet changes and actual wet-cage level/pad-width changes and undo')


if __name__ == '__main__':
    main()
