/** Check the shell command forms used by this repository, not arbitrary shell.
 * Unknown compiler-test invocations fail explicitly rather than claiming coverage. */
export function missingCompilerTests(
  scripts: Readonly<Record<string, string>>,
  files: readonly string[]
): string[] {
  const patterns: RegExp[] = []
  const visiting = new Set<string>()
  const visited = new Set<string>()
  const visit = (name: string): void => {
    if (visiting.has(name)) throw new Error(`Cyclic npm test script: ${name}`)
    if (visited.has(name)) return
    if (!Object.hasOwn(scripts, name)) throw new Error(`Missing npm test script: ${name}`)
    visiting.add(name)
    for (const command of scripts[name].split(/\s*&&\s*/)) {
      const alias = /^npm run ([A-Za-z0-9:_-]+)$/.exec(command.trim())
      if (alias) { visit(alias[1]); continue }
      if (!command.includes('compiler/') || !command.includes('.test.ts')) continue
      const runner = /^node --import tsx --test (.+)$/.exec(command.trim())
      if (!runner) throw new Error(`Unsupported compiler test command in ${name}: ${command}`)
      for (const pattern of runner[1].trim().split(/\s+/)) {
        // '*' and '?' have shell path-segment semantics. Do not confuse a
        // future globstar with recursive coverage under the default npm shell.
        if (!/^[A-Za-z0-9_./*?-]+$/.test(pattern) || pattern.startsWith('-') || pattern.includes('**')) {
          throw new Error(`Unsupported compiler test pattern in ${name}: ${pattern}`)
        }
        if (!pattern.startsWith('compiler/')) continue
        const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&')
        patterns.push(new RegExp(`^${escaped.replaceAll('*', '[^/]*').replaceAll('?', '[^/]')}$`))
      }
    }
    visiting.delete(name)
    visited.add(name)
  }
  visit('test')
  return files.filter((file) => file.startsWith('compiler/') && file.endsWith('.test.ts') && !patterns.some((pattern) => pattern.test(file))).sort()
}
