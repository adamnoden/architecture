"""Real HTTP/compiler acceptance for the engineering document editor."""
import argparse
import json
import subprocess
from pathlib import Path
from playwright.sync_api import expect, sync_playwright


def ready(page, revision, timeout=120000):
    expect(page.locator('#analysis')).to_have_text(f'Engineering ready for revision {revision}.', timeout=timeout)


def roof_svg(page):
    return page.locator('#current-roof').evaluate("img => decodeURIComponent(img.src.split(',')[1])")


def current_wet_stages():
    """Project authored choices from the actual current request, not a second model."""
    studies=Path('project/str/studies')
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
            **pick(masonry,'masonrySeatProjectionMm masonryUnitWeightKNM3 abutmentSlices foundationWeight courtCornerClosure floorReinforcement lowerCoreBodies lowerLWeight roofCoupling straightFrameCage')},
        'upperRoofBearing':pick(bearing,'seats masonryUnitWeightKNPerM3 masonryModulusMPa jointNormalComplianceMmPerMPa padThicknessMm padUnitWeightKNPerM3'),
        'roofPitch':{'pitchDeg':25},
        'floorSection':{'thicknessMm':request['thicknessMm'],'wetSupport':request['wetSupport'],
            'cageComparison':json.loads((studies/'wet-support-cage-comparison-settings.json').read_text())}}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('url', nargs='?', default='http://127.0.0.1:4187/engineering.html')
    parser.add_argument('--chromium')
    parser.add_argument('--screenshot')
    args = parser.parse_args()
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(executable_path=args.chromium)
        page = browser.new_page(viewport={'width': 1440, 'height': 1000})
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.goto(args.url)
        ready(page, 0)
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
        # Import the actual current wet request. No default structural stage is
        # silently created, and edits use the same HTTP compiler as the CLI.
        cage_document={**saved,'stages':current_wet_stages()}
        with page.expect_file_chooser() as chooser:
            page.get_by_role('button', name='Import JSON').click()
        chooser.value.set_files({'name':'wet-cage.json','mimeType':'application/json','buffer':json.dumps(cage_document).encode()})
        expect(page.locator('#wet-cage-controls')).to_be_visible(timeout=240000)
        ready(page,0,240000)
        raise_control=page.get_by_label('Graded post-link raise (mm)')
        expect(raise_control).to_have_value('0')
        initial_cage=page.locator('#cage-result').inner_text()
        expect(page.locator('#cage-result')).to_contain_text('0 cover failures')
        raise_control.fill('10');raise_control.press('Enter')
        ready(page,1,240000)
        expect(page.locator('#cage-result')).to_contain_text('Graded raise 10 mm')
        expect(page.locator('#cage-result')).to_contain_text('0 cover failures')
        expect(page.locator('#cage-result')).to_contain_text('post-head resistance and installed acceptance remain unqualified')
        with page.expect_download() as download:
            page.get_by_role('button',name='Export JSON').click()
        raised=json.loads(Path(download.value.path()).read_text())
        assert raised['stages']['floorSection']['cageComparison']=={**cage_document['stages']['floorSection']['cageComparison'],'postTopLevelRaiseMm':10}
        assert raised['stages']['floorSection']['wetSupport']==cage_document['stages']['floorSection']['wetSupport']
        page.get_by_role('button',name='Undo',exact=True).click()
        ready(page,2,240000)
        expect(raise_control).to_have_value('0')
        assert page.locator('#cage-result').inner_text()==initial_cage
        if args.screenshot:
            page.screenshot(path=args.screenshot, full_page=True)
        assert not errors, errors
        browser.close()
        print('PASS engineering document authoring, CLI export, retained stages, late HTTP reply and actual wet-cage level change/undo')


if __name__ == '__main__':
    main()
