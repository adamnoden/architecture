import { readdirSync } from 'node:fs'
import { join, relative, sep } from 'node:path'

const ignoredReadmeTrees = [
  '.git',
  'node_modules',
  '.vitepress/cache',
  '.vitepress/dist',
  'publication/build',
  'publication/.work',
  'publication/dist'
]

function ignoredReadmeTree(repoRoot: string, path: string): boolean {
  const repoPath = relative(repoRoot, path).split(sep).join('/')
  return ignoredReadmeTrees.some((ignored) => repoPath === ignored || repoPath.startsWith(`${ignored}/`))
    || /^publication\/specimens\/[^/]+\/(?:\.work|dist)(?:\/|$)/.test(repoPath)
}

export function collectReadmes(repoRoot: string, dir = repoRoot): string[] {
  const files: string[] = []

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) {
      if (!ignoredReadmeTree(repoRoot, path)) files.push(...collectReadmes(repoRoot, path))
    } else if (entry.isFile() && entry.name.toLowerCase() === 'readme.md') {
      files.push(path)
    }
  }

  return files
}
