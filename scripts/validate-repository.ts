import { existsSync, lstatSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { assertNavigationCoverage } from '../.vitepress/navigation.js'
import { projectIdentity } from '../project/identity.js'
import { programmeControls } from '../project/programme-controls.js'
import { publicationEntries } from '../publication/publication.js'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')

function collectMarkdown(dir: string): string[] {
  const files: string[] = []

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) files.push(...collectMarkdown(path))
    else if (entry.isFile() && entry.name.endsWith('.md')) files.push(path)
  }

  return files
}

function repositoryMarkdown(): string[] {
  return [
    join(repoRoot, 'README.md'),
    join(repoRoot, 'STATUS.md'),
    ...collectMarkdown(join(repoRoot, 'docs'))
  ]
}

function localTarget(source: string, href: string): string | null {
  if (/^(?:[a-z]+:|#|\/)/i.test(href)) return null

  const withoutSuffix = href.split(/[?#]/, 1)[0]
  if (!withoutSuffix) return null

  let decoded = withoutSuffix
  try {
    decoded = decodeURIComponent(withoutSuffix)
  } catch {
    throw new Error(`${relative(repoRoot, source)} contains an invalid encoded link: ${href}`)
  }

  return resolve(dirname(source), decoded.replace(/^<|>$/g, ''))
}

function validateLocalMarkdownLinks(): void {
  const linkPattern = /(?<!!)\[[^\]]+\]\(([^\s)]+)(?:\s+[^)]*)?\)/g
  const failures: string[] = []

  for (const source of repositoryMarkdown()) {
    const markdown = readFileSync(source, 'utf8')

    for (const match of markdown.matchAll(linkPattern)) {
      const href = match[1]
      const target = localTarget(source, href)
      if (!target) continue

      if (!target.startsWith(`${repoRoot}${sep}`) && target !== repoRoot) {
        failures.push(`${relative(repoRoot, source)} -> ${href} escapes the repository`)
        continue
      }

      if (!existsSync(target)) {
        failures.push(`${relative(repoRoot, source)} -> ${href} does not resolve`)
        continue
      }

      if (!lstatSync(target).isFile() && !lstatSync(target).isDirectory()) {
        failures.push(`${relative(repoRoot, source)} -> ${href} is not a file or directory`)
      }
    }
  }

  if (failures.length) {
    throw new Error(`Broken local Markdown links:\n${failures.map((failure) => `  - ${failure}`).join('\n')}`)
  }
}

function markdownSection(markdown: string, heading: string): string {
  const marker = `## ${heading}`
  const start = markdown.indexOf(marker)
  if (start < 0) throw new Error(`docs/development/README.md is missing section: ${heading}`)

  const bodyStart = markdown.indexOf('\n', start + marker.length)
  if (bodyStart < 0) return ''
  const tail = markdown.slice(bodyStart + 1)
  const nextHeading = tail.search(/^## /m)
  return (nextHeading < 0 ? tail : tail.slice(0, nextHeading)).trim()
}

function developmentLinks(section: string): Set<string> {
  const source = join(repoRoot, 'docs/development/README.md')
  const paths = new Set<string>()
  const linkPattern = /(?<!!)\[[^\]]+\]\(([^\s)]+)(?:\s+[^)]*)?\)/g

  for (const match of section.matchAll(linkPattern)) {
    const target = localTarget(source, match[1])
    if (!target) continue
    const path = relative(repoRoot, target).split(sep).join('/')
    if (path.startsWith('docs/development/') && path.endsWith('.md')) paths.add(path)
  }

  return paths
}

function sameSet(actual: Set<string>, expected: Set<string>, label: string): string[] {
  const failures: string[] = []
  for (const path of expected) {
    if (!actual.has(path)) failures.push(`${label} is missing registered control: ${path}`)
  }
  for (const path of actual) {
    if (!expected.has(path)) failures.push(`${label} contains unregistered control: ${path}`)
  }
  return failures
}

function validateProgrammeControlLifecycle(): void {
  const failures: string[] = []
  const registry = new Map<string, (typeof programmeControls)[number]['lifecycle']>()

  for (const control of programmeControls) {
    if (registry.has(control.path)) failures.push(`duplicate programme-control registry entry: ${control.path}`)
    registry.set(control.path, control.lifecycle)

    const path = join(repoRoot, control.path)
    if (!existsSync(path) || !lstatSync(path).isFile()) {
      failures.push(`registered programme control does not exist: ${control.path}`)
    }
  }

  const developmentIndex = readFileSync(join(repoRoot, 'docs/development/README.md'), 'utf8')
  const live = developmentLinks(markdownSection(developmentIndex, 'Live controls'))
  const closed = developmentLinks(
    markdownSection(developmentIndex, 'Completed controls retained for provenance')
  )
  const expectedLive = new Set(
    programmeControls.filter((control) => control.lifecycle === 'active').map((control) => control.path)
  )
  const expectedClosed = new Set(
    programmeControls.filter((control) => control.lifecycle !== 'active').map((control) => control.path)
  )

  failures.push(...sameSet(live, expectedLive, 'Development / Live controls'))
  failures.push(...sameSet(closed, expectedClosed, 'Development / Completed controls'))

  if (failures.length) {
    throw new Error(`Programme-control lifecycle drift:\n${failures.map((failure) => `  - ${failure}`).join('\n')}`)
  }
}

function validateProjectIdentity(): void {
  const failures: string[] = []
  const guardedSources = new Set([
    'README.md',
    'STATUS.md',
    'docs/reading-guide.md',
    'publication/primer/proposition.md',
    'publication/primer/outlook.md',
    ...publicationEntries.map((entry) => entry.source)
  ])
  const provenanceSources = new Set<string>(projectIdentity.legacyNameProvenanceSources)

  for (const source of guardedSources) {
    const path = join(repoRoot, source)
    const content = readFileSync(path, 'utf8')
    for (const legacyName of projectIdentity.legacyNames) {
      if (content.includes(legacyName) && !provenanceSources.has(source)) {
        failures.push(`${source} contains legacy project name outside explicit provenance: ${legacyName}`)
      }
    }
  }

  for (const source of ['.vitepress/config.ts', 'publication/scripts/prepare.ts']) {
    const content = readFileSync(join(repoRoot, source), 'utf8')
    if (content.includes(`'${projectIdentity.name}'`) || content.includes(`\"${projectIdentity.name}\"`)) {
      failures.push(`${source} hard-codes the current project name instead of using project/identity.ts`)
    }
  }

  if (failures.length) {
    throw new Error(`Project identity drift:\n${failures.map((failure) => `  - ${failure}`).join('\n')}`)
  }
}

assertNavigationCoverage()
validateLocalMarkdownLinks()
validateProgrammeControlLifecycle()
validateProjectIdentity()

console.log(
  `Repository integrity valid: navigation, local links, ${programmeControls.length} programme-control records and project identity.`
)
