import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { once } from 'node:events'
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { extname, resolve, sep } from 'node:path'
import puppeteer from 'puppeteer'

// Exercise the actual built site, not a second approximation of its markup.
const root = resolve('.vitepress/dist')
const output = resolve('node_modules/.cache/ovids-house/homepage-proof')
assert.ok(existsSync(resolve(root, 'index.html')), 'Build the website before browser review')
mkdirSync(output, { recursive: true })
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json', '.woff2': 'font/woff2', '.png': 'image/png', '.ico': 'image/x-icon' }
const server = createServer((request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url ?? '/', 'http://localhost').pathname)
    if (!pathname.startsWith('/architecture/')) { response.writeHead(404).end(); return }
    let path = resolve(root, pathname.slice('/architecture/'.length))
    if (path !== root && !path.startsWith(root + sep)) { response.writeHead(404).end(); return }
    // Clean page URLs can coexist with an asset directory of the same name.
    if (!pathname.endsWith('/') && !extname(path) && existsSync(path + '.html')) path += '.html'
    else if (existsSync(path) && statSync(path).isDirectory()) path = resolve(path, 'index.html')
    if (!existsSync(path) || !statSync(path).isFile()) { response.writeHead(404).end(); return }
    response.writeHead(200, { 'Content-Type': types[extname(path)] ?? 'application/octet-stream' })
    response.end(readFileSync(path))
  } catch { response.writeHead(400).end() }
})
server.listen(0, '127.0.0.1')
await once(server, 'listening')
const base = `http://127.0.0.1:${server.address().port}/architecture/`
const report = { buildCommit: process.env.GITHUB_SHA ?? 'local', viewports: [], errors: [] }
let browser
let page
async function clickText(selector, text) {
  const elements = await page.$$(selector)
  try {
    for (const element of elements) {
      if (await element.evaluate((e, wanted) => e.textContent.trim() === wanted, text)) {
        await element.click()
        return
      }
    }
    assert.fail(`Missing control: ${text} (${selector})`)
  } finally { await Promise.all(elements.map((element) => element.dispose())) }
}
async function expectPath(path) {
  await page.waitForFunction((expected) => location.pathname === expected, {}, `/architecture/${path}`)
  await page.waitForSelector('.vp-doc')
}
try {
  browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] })
  page = await browser.newPage()
  page.on('pageerror', (error) => report.errors.push(String(error)))
  for (const [width, height, scheme] of [[1440, 1000, 'light'], [390, 844, 'light'], [320, 740, 'light'], [768, 1024, 'light'], [1440, 1000, 'dark'], [390, 844, 'dark']]) {
    await page.setViewport({ width, height })
    await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: scheme }])
    const response = await page.goto(base, { waitUntil: 'networkidle0' })
    assert.equal(response.status(), 200)
    await page.evaluate(() => document.fonts.ready)
    const result = await page.evaluate(() => {
      const heading = document.querySelector('h1')
      const range = document.createRange()
      range.selectNodeContents(heading.firstChild)
      const image = document.querySelector('.home-drawing img')
      return {
        headings: document.querySelectorAll('h1').length,
        wordLines: range.getClientRects().length,
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
        imageLoaded: image.complete && image.naturalWidth > 0,
        copy: document.querySelector('.vp-doc').innerText,
        actions: [...document.querySelectorAll('.home-actions a')].map((a) => ({ href: a.getAttribute('href'), height: a.getBoundingClientRect().height, bottom: a.getBoundingClientRect().bottom }))
      }
    })
    assert.equal(result.headings, 1)
    assert.equal(result.wordLines, 1, `Heading word wraps at ${width}px`)
    assert.ok(result.scrollWidth <= result.clientWidth, `Horizontal overflow at ${width}px`)
    assert.ok(result.imageLoaded)
    assert.deepEqual(result.actions.map((a) => a.href), ['/architecture/reference-house/', '/architecture/manuscript/preface'])
    assert.ok(result.actions.every((a) => a.height >= 44 && a.bottom <= height), `Primary links must remain usable above the fold at ${width}px`)
    assert.match(result.copy, /unbuilt design study/)
    assert.doesNotMatch(result.copy, /Project map|Build and verification|What is authoritative|current project brief excludes flat roofs/)
    await page.screenshot({ path: resolve(output, `home-${width}-${scheme}.png`), fullPage: true })
    report.viewports.push({ width, height, scheme, ...result })
  }
  await page.setViewport({ width: 1440, height: 1000 })
  await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'light' }])
  await page.goto(base, { waitUntil: 'networkidle0' })
  await page.keyboard.press('Tab')
  await page.focus('.home-actions a')
  assert.notEqual(await page.$eval('.home-actions a', (e) => getComputedStyle(e).outlineStyle), 'none')
  await clickText('.home-actions a', 'Explore the house')
  await expectPath('reference-house/')
  await page.goto(base, { waitUntil: 'networkidle0' })
  await clickText('.home-actions a', 'Read the book')
  await expectPath('manuscript/preface')
  await page.goto(base, { waitUntil: 'networkidle0' })
  await clickText('.home-utility a', 'Repository guide')
  await expectPath('project/repository')
  await page.reload({ waitUntil: 'networkidle0' })
  assert.match(await page.title(), /^Repository guide/)
  const guide = await page.$eval('.vp-doc', (e) => e.innerText)
  for (const text of ['Project map', 'What is authoritative for what?', 'Build and verification', 'npm run check']) assert.ok(guide.includes(text), text)
  await clickText('.vp-doc a', 'homepage')
  await expectPath('')
  await page.waitForSelector('.home-opening')
  await clickText('.VPNavBarMenu button', 'Explore')
  await page.waitForSelector('.VPNavBarMenu a[href="/architecture/project/repository"]', { visible: true })
  await page.screenshot({ path: resolve(output, 'desktop-navigation.png'), fullPage: true })
  await page.setViewport({ width: 390, height: 844 })
  await page.reload({ waitUntil: 'networkidle0' })
  await page.click('button.VPNavBarHamburger')
  await page.waitForSelector('.VPNavScreen', { visible: true })
  await clickText('.VPNavScreen button', 'Explore')
  await page.waitForSelector('.VPNavScreen a[href="/architecture/project/repository"]', { visible: true })
  await page.screenshot({ path: resolve(output, 'mobile-navigation.png'), fullPage: true })
  await page.goto(base + 'reading-guide', { waitUntil: 'networkidle0' })
  assert.equal(await page.$$eval('.vp-doc a', (links) => links.find((a) => a.textContent === 'Project overview')?.getAttribute('href')), '/architecture/')
  await page.setJavaScriptEnabled(false)
  await page.goto(base, { waitUntil: 'networkidle0' })
  assert.equal((await page.$$('.home-actions a')).length, 2)
  assert.match(await page.$eval('.vp-doc', (e) => e.innerText), /Ovid’s House explores/)
  assert.deepEqual(report.errors, [], 'Browser JavaScript errors')
  report.result = 'PASS'
  report.navigation = 'Both primary links, repository round-trip/reload, reading-guide return, desktop and mobile menus, keyboard focus and no-JavaScript entry verified.'
  console.log('Homepage browser review passed: six viewport/theme cases and reader navigation.')
} catch (error) {
  report.result = 'FAIL'
  report.failure = String(error)
  if (page) await page.screenshot({ path: resolve(output, 'failure.png'), fullPage: true }).catch(() => {})
  throw error
} finally {
  writeFileSync(resolve(output, 'review.json'), JSON.stringify(report, null, 2) + '\n')
  if (browser) await browser.close()
  await new Promise((done) => server.close(done))
}
