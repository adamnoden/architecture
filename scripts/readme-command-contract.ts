export interface ReadmeCommandSource {
  path: string
  markdown: string
}

export function referencedNpmRunScripts(markdown: string): string[] {
  const scripts = new Set<string>()
  const pattern = /\bnpm\s+run\s+([A-Za-z0-9][A-Za-z0-9:_-]*)/g

  for (const match of markdown.matchAll(pattern)) scripts.add(match[1])
  return [...scripts].sort()
}

export function missingReadmeNpmScripts(
  sources: ReadmeCommandSource[],
  packageScripts: Record<string, unknown>
): string[] {
  const failures: string[] = []

  for (const source of sources) {
    for (const script of referencedNpmRunScripts(source.markdown)) {
      if (!Object.hasOwn(packageScripts, script)) failures.push(`${source.path} -> npm run ${script}`)
    }
  }

  return failures.sort()
}
