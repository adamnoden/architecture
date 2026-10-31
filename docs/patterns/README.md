# Patterns and generative sequences

<script setup>
import { data as patterns } from './patterns.data'

const activePatterns = patterns.filter((pattern) => pattern.state === 'active')
</script>

The pattern set records reusable architectural responses developed from the governing principles. Patterns sit between doctrine and project-specific construction: specific enough to shape design, general enough to admit materially different implementations.

The current system contains **21 active patterns**, three strategies and four held candidates. It is not presented as a uniformly mature Alexander-style pattern language. Its strongest demonstrated generative structure is the service-topology sequence; other pattern families have useful relationships but remain less completely connected and sequenced.

Christopher Alexander's pattern-language work and his later return to generative sequences are major antecedents to both the pattern form and the proposition that design order matters. Ovid's House does not claim those concepts. Its project-specific machinery is the typed separation of evidence maturity, language maturity, pattern identity, implementation, project occurrence, semantic representation and compiler authority: one layer is not allowed to silently promote another.

Alexander's work was also used explicitly in a later red-team of this corpus, which helped narrow the project's pattern-language claim. The surviving record does not establish Alexander as the origin of the project's initial pattern system, so that later documented use should not be rewritten as an origin story.

That asymmetry is deliberate evidence about maturity, not a graph-completion task. New edges or sequences should appear only when repeated design work demonstrates that they carry real generative knowledge.

Pattern identity is independent from evidence maturity. A pattern can have a stable place in the set while still requiring calculation, prototype work or professional review.

## Active patterns

<div v-if="activePatterns.length">
  <ul>
    <li v-for="pattern in activePatterns" :key="pattern.id">
      <a :href="pattern.url">{{ pattern.title }}</a>
      <span> · {{ pattern.evidence }}</span>
    </li>
  </ul>
</div>

Patterns are referred to by architectural name throughout the publication.

## Other layers

Not every useful recurring proposition belongs in the pattern graph.

- [Strategies](strategies/) hold broad approaches whose valid physical responses differ too much to form one pattern.
- [Held candidates](candidates/) contain plausible future patterns whose evidence, scope, domestic proportionality or physical quality has not earned canonical pattern status.
- rules and obligations hold propositions that are important but too procedural or deterministic to constitute an architectural pattern.
- implementation families and prototypes remain separate from patterns unless a genuinely reusable architectural relationship has been established.

These distinctions keep the set selective and preserve the difference between a reusable architectural relationship and a particular way of building it.

## How the system works

The [Pattern Model and Authoring Contract](language-model.md) defines pattern identity, evidence, relationships and admission. The [Service Topology — Generative Sequence](service-topology-sequence.md) shows the most mature current example of patterns being invoked in a consequential design order without turning the graph into a universal procedure.

The [historical Pattern Occurrence Register](../reference-house/pattern-occurrence-register.md) records predecessor selections. Current-house occurrences require rechecking against [Current House Basis](../reference-house/current-house-basis.md); earlier selections do not transfer automatically. Use in the house does not increase a pattern's general evidence or maturity.

The active list above reflects the current canonical set and evidence status.
