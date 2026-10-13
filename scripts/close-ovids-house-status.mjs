import { readFileSync, writeFileSync } from 'node:fs'

function replaceExact(path, from, to) {
  const before = readFileSync(path, 'utf8')
  const first = before.indexOf(from)
  if (first < 0) throw new Error(`${path}: expected text not found: ${from}`)
  if (before.indexOf(from, first + from.length) >= 0) {
    throw new Error(`${path}: expected text occurs more than once: ${from}`)
  }
  writeFileSync(path, before.replace(from, to))
}

replaceExact(
  'docs/manuscript/publication-architecture.md',
  '# House Kernel — Publication Architecture v0.12',
  '# Ovid’s House — Publication Architecture v0.13'
)
replaceExact(
  'docs/manuscript/publication-architecture.md',
  '**Status:** v0.12 — canonical pattern language and computational authority reconciled; publication structure remains active.',
  '**Status:** v0.13 — Ovid’s House identity and temporal frame reconciled with the canonical pattern language and computational authority; publication structure remains active.'
)
replaceExact(
  'docs/manuscript/publication-architecture.md',
  '   Long life without generic flexibility; introduce proportional serviceability. Establish **repose** as a domestic requirement: the house should minimise unnecessary vigilance through coherence, controllability, privacy/retreat, physical comfort and perceptual settlement without collapsing into sensory poverty.',
  '   Long life without generic flexibility; introduce proportional serviceability and the bounded **permanence without stasis** / Ovidian frame. Establish **repose** as a domestic requirement: the house should minimise unnecessary vigilance through coherence, controllability, privacy/retreat, physical comfort and perceptual settlement without collapsing into sensory poverty.'
)
replaceExact(
  'docs/manuscript/publication-architecture.md',
  '[House Kernel Pattern Language — Model and Authoring Contract](../patterns/language-model.md)',
  '[Ovid’s House Pattern Language — Model and Authoring Contract](../patterns/language-model.md)'
)
replaceExact(
  'docs/manuscript/publication-architecture.md',
  'The canonical concept is [Executable Architecture — Computational Expression of House Kernel](../computational/executable-architecture.md); current authority and provenance are indexed in the [Computational Track](../computational/README.md).',
  '**House Kernel** is the formal architectural/computational system within Ovid’s House; its executable proposition is described in [Executable Architecture](../computational/executable-architecture.md), with current authority and provenance indexed in the [Computational Track](../computational/README.md). **Metamorph Compiler** is the human-facing name of the software that compiles and checks those bounded representations.'
)
replaceExact(
  'docs/manuscript/publication-architecture.md',
  '- executable architecture is **not a governing principle** and does not replace House Kernel;',
  '- executable architecture is **not a governing principle** and does not replace Ovid’s House or its architectural doctrine;'
)

replaceExact(
  'publication/adapters.ts',
  'const opening = `# House Kernel\\n## ${partHeading}`',
  'const opening = `# Ovid’s House\\n## ${partHeading}`'
)
replaceExact(
  'publication/adapters.ts',
  "'[House Kernel — Governing Principles](governing-principles.md)'",
  "'[Ovid’s House — Governing Principles](governing-principles.md)'"
)
replaceExact(
  'publication/adapters.ts',
  "'**House Kernel — Governing Principles**'",
  "'**Ovid’s House — Governing Principles**'"
)
replaceExact(
  'publication/adapters.ts',
  'The governing principles are intentionally too general to specify a building. House Kernel therefore keeps four levels of authority distinct:',
  'The governing principles are intentionally too general to specify a building. Ovid’s House therefore keeps four levels of authority distinct:'
)
replaceExact(
  'publication/adapters.ts',
  'A project-specific choice can satisfy a House Kernel principle without being promoted into House Kernel doctrine, and use of a pattern in the Reference House does not increase that pattern\'s general evidence.',
  'A project-specific choice can satisfy an Ovid’s House principle without being promoted into Ovid’s House doctrine, and use of a pattern in the Reference House does not increase that pattern\'s general evidence.'
)

replaceExact(
  'project/maturity.ts',
  "'Grammar is a first-class layer separate from House Kernel doctrine and is coordinated at framework level.'",
  "'Grammar is a first-class layer separate from Ovid’s House doctrine and is coordinated at framework level.'"
)
replaceExact(
  'project/maturity.ts',
  "'House Kernel uses a **project-specific maturity model**. It is not a RIBA Plan of Work stage, BIM level-of-detail convention, Technology Readiness Level or other external industry standard. The codes use **M** for maturity so they are less likely to be mistaken for those systems.'",
  "'Ovid’s House uses a **project-specific maturity model**. It is not a RIBA Plan of Work stage, BIM level-of-detail convention, Technology Readiness Level or other external industry standard. The codes use **M** for maturity so they are less likely to be mistaken for those systems.'"
)
replaceExact(
  'project/maturity.ts',
  "'Publication Architecture v0.12 is established; Parts III/IV and figure language remain less mature than the main argument.'",
  "'Publication Architecture v0.13 is established; Parts III/IV and figure language remain less mature than the main argument.'"
)

replaceExact(
  'STATUS.md',
  'This page answers one question: **where is House Kernel now?**',
  'This page answers one question: **where is Ovid’s House now?**'
)
replaceExact(
  'STATUS.md',
  'A successful mock-up does not promote a general House Kernel proposition automatically, and a failed challenger does not invalidate the house where a conventional baseline already exists.',
  'A successful mock-up does not promote a general Ovid’s House proposition automatically, and a failed challenger does not invalidate the house where a conventional baseline already exists.'
)
replaceExact(
  'STATUS.md',
  '- **Naming history — recorded.** The project began as **House Design Doctrine**, became **Long-Life House**, then **House Systems Architecture**, and is now **House Kernel**. The active project identity has been migrated across the website, manuscript, publication pipeline, current research/control documents and build tooling; older names remain only where they describe historical state or a stable legacy identifier.',
  '- **Naming history — recorded.** The project began as **House Design Doctrine**, became **Long-Life House**, then **House Systems Architecture**, then **House Kernel**, and is now **Ovid’s House**. **House Kernel** is retained as the formal architectural/computational system within Ovid’s House rather than treated as a retired name; **Metamorph Compiler** is the human-facing name of its executable machinery. Earlier names remain only where they describe historical state or a stable legacy identifier.'
)

replaceExact(
  'docs/development/README.md',
  'continuing scope firewall between general House Kernel propositions, technical-domain restrictions, architectural grammars and Reference House choices.',
  'continuing scope firewall between general Ovid’s House propositions, technical-domain restrictions, architectural grammars and Reference House choices.'
)
replaceExact(
  'docs/development/README.md',
  'physical/engineering validation programme, including the separation between general House Kernel evidence and Reference House/G-01 fit.',
  'physical/engineering validation programme, including the separation between general Ovid’s House evidence and Reference House/G-01 fit.'
)

console.log('Applied selective Ovid’s House status/publication closeout edits.')
