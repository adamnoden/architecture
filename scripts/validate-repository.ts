import { existsSync, lstatSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { assertNavigationCoverage } from '../.vitepress/navigation.js'

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

assertNavigationCoverage()
validateLocalMarkdownLinks()

console.log('Repository integrity valid: navigation coverage and local Markdown links.')
