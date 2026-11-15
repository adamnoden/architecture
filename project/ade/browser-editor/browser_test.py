"""Playwright acceptance for the built ADE editor."""
import argparse
from pathlib import Path
from urllib.parse import urlparse

from playwright.sync_api import expect, sync_playwright


def current_svg(page):
    return page.locator("#current-plan").evaluate("(img) => decodeURIComponent(img.src.split(',')[1])")


def ready(page, revision):
    expect(page.locator("#analysis")).to_have_text(f"Plans ready for revision {revision}.")


def opening_line_width(page):
    return page.locator("#current-plan").evaluate("""img => {
      const svg = new DOMParser().parseFromString(decodeURIComponent(img.src.split(',')[1]), 'image/svg+xml');
      const line = svg.querySelector('[data-entity="south-window-0-glazing-a"]');
      return Math.round(100 * Math.hypot(line.getAttribute('x2') - line.getAttribute('x1'),
                                     line.getAttribute('y2') - line.getAttribute('y1')));
    }""")


def current_house(page, url):
    page.goto(url)
    ready(page, 0)
    page.locator("#object").select_option("GROUND/south-window-0")
    before = current_svg(page)
    assert opening_line_width(page) == 1000

    width = page.get_by_label("Width (mm)")
    width.fill("1110")
    width.press("Enter")
    ready(page, 1)
    assert opening_line_width(page) == 1110
    expect(page.locator("#affected")).to_have_text("Changed plans: Ground")
    page.get_by_role("button", name="Use current as comparison").click()
    expect(page.locator("#affected")).to_have_text("Both plans match the comparison.")

    page.get_by_role("button", name="Undo", exact=True).click()
    ready(page, 2)
    assert current_svg(page) == before
    page.get_by_role("button", name="Redo", exact=True).click()
    ready(page, 3)
    assert opening_line_width(page) == 1110

    page.locator("#kind").select_option("assembly")
    page.locator("#object").select_option("assembly/RH-ADE-ENVELOPE")
    page.get_by_label("Depth (mm)").fill("437.5")
    page.get_by_role("button", name="Apply value").click()
    ready(page, 4)
    expect(page.locator("#affected")).to_have_text("Changed plans: Ground, First")

    page.locator("#object").select_option("assembly/RH-SECTION-FIRST-FLOOR-RESERVATION")
    page.get_by_label("Depth (mm)").fill("5000")
    page.get_by_label("Depth (mm)").press("Enter")
    ready(page, 5)
    expect(page.get_by_role("alert")).to_contain_text("zero or negative")
    expect(page.get_by_role("alert")).to_contain_text("assembly/RH-SECTION-FIRST-FLOOR-RESERVATION")
    page.get_by_role("button", name="Select object").click()
    expect(page.locator("#object")).to_be_focused()

    page.locator("#kind").select_option("partition")
    page.locator("#object").select_option("GROUND/study-north")
    page.get_by_role("button", name="Increase 10 mm").click()
    expect(page.get_by_role("alert")).to_contain_text("free-standing translations")
    ready(page, 5)

    page.get_by_role("button", name="Save draft").click()
    saved_svg = current_svg(page)
    page.reload()
    ready(page, 0)
    page.get_by_role("button", name="Load saved draft").click()
    ready(page, 0)
    expect(page.locator("#storage")).to_contain_text("Loaded saved draft")
    assert current_svg(page) == saved_svg
    expect(page.get_by_role("alert")).to_contain_text("assembly/RH-SECTION-FIRST-FLOOR-RESERVATION")
    expect(page.get_by_role("button", name="Undo", exact=True)).to_be_disabled()
    with page.expect_download() as event:
        page.get_by_role("button", name="Export JSON").click()
    exported = event.value
    page.locator("#kind").select_option("opening")
    page.locator("#object").select_option("GROUND/south-window-0")
    page.get_by_role("button", name="Increase 10 mm").click()
    ready(page, 1)
    assert opening_line_width(page) == 1120
    with page.expect_file_chooser() as chooser:
        page.get_by_role("button", name="Import JSON").click()
    chooser.value.set_files(exported.path())
    ready(page, 0)
    assert current_svg(page) == saved_svg
    expect(page.get_by_role("alert")).to_contain_text("assembly/RH-SECTION-FIRST-FLOOR-RESERVATION")


def partition_study(page, url):
    page.goto(url)
    ready(page, 0)
    page.locator("#basis").select_option("partitionStudy")
    page.get_by_role("button", name="New draft").click()
    ready(page, 0)
    page.locator("#kind").select_option("partition")
    page.locator("#object").select_option("GROUND/movable-wall")
    before = current_svg(page)
    page.get_by_role("button", name="Increase 10 mm").click()
    ready(page, 1)
    expect(page.get_by_label("Position (mm)")).to_have_value("2610")
    assert current_svg(page) != before
    expect(page.locator("#affected")).to_have_text("Changed plans: Ground")
    page.get_by_role("button", name="Undo", exact=True).click()
    ready(page, 2)
    assert current_svg(page) == before
    page.get_by_role("button", name="Redo", exact=True).click()
    ready(page, 3)
    page.get_by_role("button", name="Save draft").click()
    after = current_svg(page)
    page.reload()
    ready(page, 0)
    page.get_by_role("button", name="Load saved draft").click()
    ready(page, 0)
    expect(page.locator("#storage")).to_contain_text("Loaded saved draft")
    assert current_svg(page) == after


def late_worker(page, url):
    page.add_init_script("""(() => {
      const add = Worker.prototype.addEventListener;
      Worker.prototype.addEventListener = function (type, listener, options) {
        if (type !== 'message') return add.call(this, type, listener, options);
        return add.call(this, type, (event) => {
          if (!window.holdNextCompilerReply) return listener(event);
          window.holdNextCompilerReply = false;
          window.releaseHeldCompilerReply = () => listener(event);
        }, options);
      };
    })();""")
    page.goto(url)
    ready(page, 0)
    page.locator("#object").select_option("GROUND/south-window-0")
    page.evaluate("window.holdNextCompilerReply = true")
    field = page.get_by_label("Width (mm)")
    field.fill("1080")
    field.press("Enter")
    page.wait_for_function("typeof window.releaseHeldCompilerReply === 'function'")
    field.fill("1180")
    field.press("Enter")
    ready(page, 2)
    assert opening_line_width(page) == 1180
    svg = current_svg(page)
    page.evaluate("window.releaseHeldCompilerReply()")
    expect(page.locator("#stale")).to_have_text("Ignored analysis from earlier revision 1.")
    ready(page, 2)
    assert current_svg(page) == svg


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("url", nargs="?", default="http://localhost:4187/")
    parser.add_argument("--dist", type=Path, help="Serve the built files through Playwright interception")
    parser.add_argument("--chromium", help="Existing Chromium or headless-shell executable")
    parser.add_argument("--screenshot")
    args = parser.parse_args()
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(executable_path=args.chromium)
        for test in (current_house, partition_study, late_worker):
            page = browser.new_page(viewport={"width": 1280, "height": 820})
            if args.dist:
                def bundled_file(route):
                    name = urlparse(route.request.url).path.lstrip("/") or "index.html"
                    file = (args.dist / name).resolve()
                    if file.is_relative_to(args.dist.resolve()) and file.is_file():
                        route.fulfill(path=file)
                    else:
                        route.abort()
                page.context.route(f"{args.url.rstrip('/')}/**", bundled_file)
            errors = []
            page.on("pageerror", lambda error: errors.append(str(error)))
            test(page, args.url)
            assert not errors, errors
            if test is late_worker and args.screenshot:
                page.screenshot(path=args.screenshot, full_page=True)
            page.close()
            print(f"PASS {test.__name__}")
        browser.close()


if __name__ == "__main__":
    main()
