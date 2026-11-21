"""Real HTTP/compiler acceptance for the engineering document editor."""
import argparse
import json
import subprocess
from pathlib import Path
from playwright.sync_api import expect, sync_playwright


def ready(page, revision):
    expect(page.locator('#analysis')).to_have_text(f'Engineering ready for revision {revision}.', timeout=120000)


def roof_svg(page):
    return page.locator('#current-roof').evaluate("img => decodeURIComponent(img.src.split(',')[1])")


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
        if args.screenshot:
            page.screenshot(path=args.screenshot, full_page=True)
        assert not errors, errors
        browser.close()
        print('PASS engineering document authoring, CLI export, retained stages and late HTTP reply')


if __name__ == '__main__':
    main()
