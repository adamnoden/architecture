import { execFileSync } from 'node:child_process'

export const defaultGitTimeoutMs = 30000
export const maximumGitTimeoutMs = 120000

/** Individual Git command deadline; invalid explicit configuration fails closed. */
export function resolveGitTimeoutMs(value = process.env.ACO_GIT_TIMEOUT_MS): number {
  if (value === undefined) return defaultGitTimeoutMs
  if (!/^[1-9][0-9]*$/.test(value) || Number(value) > maximumGitTimeoutMs) {
    throw new Error(`ACO_GIT_TIMEOUT_MS must be an integer from 1 to ${maximumGitTimeoutMs}`)
  }
  return Number(value)
}

export function runGit(args: readonly string[], options: { cwd?: string; maxBuffer?: number } = {}): string {
  return execFileSync('git', [...args], {
    ...options, encoding: 'utf8', timeout: resolveGitTimeoutMs(), stdio: ['ignore', 'pipe', 'pipe']
  })
}
