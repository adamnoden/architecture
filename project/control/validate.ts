import { existsSync, lstatSync } from 'node:fs'
import { join } from 'node:path'
import { controlNodes } from './nodes/index.js'
import type { ControlNode } from './types.js'
import { workstreams } from './workstreams.js'

export function validateGraphStructure(
  nodes: readonly ControlNode[],
  registeredCodes: ReadonlySet<string> = new Set(workstreams.map((workstream) => workstream.code))
): string[] {
  const failures: string[] = []
  const byId = new Map<string, ControlNode>()
  const aliases = new Map<string, string>()

  for (const node of nodes) {
    if (!/^[A-Z0-9][A-Z0-9-]*$/.test(node.id)) failures.push(`invalid node id: ${node.id}`)
    if (byId.has(node.id)) failures.push(`duplicate node id: ${node.id}`)
    byId.set(node.id, node)

    if (node.owners.length === 0) failures.push(`${node.id} has no owning workstream`)
    for (const owner of node.owners) {
      if (!registeredCodes.has(owner)) failures.push(`${node.id} references unknown workstream: ${owner}`)
    }

    const dependencySet = new Set(node.dependencies)
    if (dependencySet.size !== node.dependencies.length) failures.push(`${node.id} repeats a dependency`)
    if (dependencySet.has(node.id)) failures.push(`${node.id} depends on itself`)

    for (const alias of node.aliases ?? []) {
      const previous = aliases.get(alias)
      if (previous && previous !== node.id) {
        failures.push(`node alias ${alias} is claimed by both ${previous} and ${node.id}`)
      }
      if (byId.has(alias) && alias !== node.id) {
        failures.push(`node alias ${alias} collides with a canonical node id`)
      }
      aliases.set(alias, node.id)
    }
  }

  for (const node of nodes) {
    for (const dependency of node.dependencies) {
      if (!byId.has(dependency)) failures.push(`${node.id} has missing dependency: ${dependency}`)
    }

    if (node.lifecycle === 'started' || node.lifecycle === 'complete') {
      for (const dependency of node.dependencies) {
        const upstream = byId.get(dependency)
        if (upstream && upstream.lifecycle !== 'complete') {
          failures.push(`${node.id} is ${node.lifecycle} with incomplete dependency ${dependency}`)
        }
      }
    }

    if (node.lifecycle === 'complete' && node.closeoutEvidence.length === 0) {
      failures.push(`${node.id} is complete without declared closeout evidence`)
    }
  }

  for (const [alias, ownerId] of aliases) {
    if (byId.has(alias) && alias !== ownerId) {
      failures.push(`node alias ${alias} collides with canonical node ${alias}`)
    }
  }

  const visited = new Set<string>()
  const visiting = new Set<string>()
  const stack: string[] = []
  const cycleKeys = new Set<string>()

  function visit(id: string): void {
    if (visited.has(id)) return
    if (visiting.has(id)) {
      const start = stack.indexOf(id)
      const cycle = [...stack.slice(start), id]
      const key = cycle.join(' -> ')
      if (!cycleKeys.has(key)) {
        failures.push(`dependency cycle: ${key}`)
        cycleKeys.add(key)
      }
      return
    }

    const node = byId.get(id)
    if (!node) return
    visiting.add(id)
    stack.push(id)
    for (const dependency of node.dependencies) visit(dependency)
    stack.pop()
    visiting.delete(id)
    visited.add(id)
  }

  for (const node of nodes) visit(node.id)

  return failures
}

export function validateWorkstreamRegistry(repoRoot?: string): string[] {
  const failures: string[] = []
  const codes = new Set<string>()
  const aliases = new Map<string, string>()

  for (const workstream of workstreams) {
    if (!/^[A-Z]{3}$/.test(workstream.code)) {
      failures.push(`new/live workstream code is not exactly three uppercase letters: ${workstream.code}`)
    }
    if (codes.has(workstream.code)) failures.push(`duplicate workstream code: ${workstream.code}`)
    codes.add(workstream.code)

    for (const alias of workstream.aliases ?? []) {
      const previous = aliases.get(alias)
      if (previous && previous !== workstream.code) {
        failures.push(`workstream alias ${alias} is claimed by both ${previous} and ${workstream.code}`)
      }
      aliases.set(alias, workstream.code)
    }

    if (workstream.issue !== undefined && (!Number.isInteger(workstream.issue) || workstream.issue <= 0)) {
      failures.push(`${workstream.code} has invalid issue number: ${workstream.issue}`)
    }

    if (repoRoot && workstream.programme) {
      const path = join(repoRoot, workstream.programme)
      if (!existsSync(path) || !lstatSync(path).isFile()) {
        failures.push(`${workstream.code} programme path does not exist: ${workstream.programme}`)
      }
    }
  }

  return failures
}

export function validateControlPlane(repoRoot?: string): string[] {
  const failures = [
    ...validateWorkstreamRegistry(repoRoot),
    ...validateGraphStructure(controlNodes)
  ]

  if (repoRoot) {
    const runtimeClaims = join(repoRoot, '.pco', 'claims')
    if (existsSync(runtimeClaims)) {
      failures.push('runtime ACO claim files must never be committed to source branches: .pco/claims')
    }

    for (const node of controlNodes) {
      if (node.lifecycle !== 'complete') continue
      for (const evidence of node.closeoutEvidence) {
        const path = join(repoRoot, evidence)
        if (!existsSync(path) || !lstatSync(path).isFile()) {
          failures.push(`${node.id} closeout evidence does not exist: ${evidence}`)
        }
      }
    }
  }

  return failures
}
