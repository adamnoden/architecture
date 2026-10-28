import {
  directBlockers,
  nodesByDerivedState,
  structuralCriticalPath,
  unlocksOnCompletion,
  weightedCriticalPath
} from '../project/control/derive.js'
import { controlNodes } from '../project/control/nodes/index.js'

const groups = nodesByDerivedState(controlNodes)
const critical = structuralCriticalPath(controlNodes)
const weighted = weightedCriticalPath(controlNodes)

console.log('# Project control')
console.log('')
console.log(
  `Ready: ${groups.ready.length} | Active: ${groups.active.length} | Blocked: ${groups.blocked.length} | Held: ${groups.held.length} | Done: ${groups.done.length} | Cancelled: ${groups.cancelled.length}`
)

console.log('\n## Ready frontier')
for (const node of groups.ready) {
  const unlocks = unlocksOnCompletion(node.id, controlNodes).map((candidate) => candidate.id)
  console.log(`- ${node.id} — ${node.title}${unlocks.length ? `; unlocks: ${unlocks.join(', ')}` : ''}`)
}

console.log('\n## Active')
for (const node of groups.active) console.log(`- ${node.id} — ${node.title}`)

console.log('\n## Blocked')
for (const node of groups.blocked) {
  console.log(`- ${node.id} — blocked by: ${directBlockers(node, controlNodes).join(', ')}`)
}

console.log('\n## Structural critical path')
console.log(critical.length ? critical.join(' -> ') : 'none')

console.log('\n## Weighted critical path')
if (weighted) {
  console.log(`${weighted.path.join(' -> ')} (${weighted.estimatedEffortHours} estimated agent-hours)`)
} else {
  console.log('not reported: one or more remaining nodes have no explicit effort estimate')
}
