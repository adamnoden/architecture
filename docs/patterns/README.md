# Patterns and generative sequences

<script setup>
import { data as patterns } from './patterns.data'

const activePatterns = patterns.filter((pattern) => pattern.state === 'active')
</script>

The pattern set records reusable architectural responses developed from the governing principles. Patterns sit between doctrine and project-specific construction: specific enough to shape design, general enough to admit materially different implementations.

The current system contains **21 active patterns**, three strategies and four held candidates. It is not presented as a uniformly mature Alexander-style pattern language. Its strongest demonstrated generative structure is the service-topology sequence; other pattern families have useful relationships but remain less completely connected and sequenced.

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

The architectural name is the reader-facing identity. Stable machine IDs remain available to the computational and reference systems, but are not part of the ordinary pattern list.

## Other layers

Not every useful recurring proposition belongs in the pattern graph.

- [Strategies](strategies/) hold broad approaches whose valid physical responses differ too much to form one pattern.
- [Held candidates](candidates/) contain plausible future patterns whose evidence, scope, domestic proportionality or physical quality has not earned canonical pattern status.
- rules and obligations hold propositions that are important but too procedural or deterministic to constitute an architectural pattern.
- implementation families and prototypes remain separate from patterns unless a genuinely reusable architectural relationship has been established.

These distinctions keep the set selective and preserve the difference between a reusable architectural relationship and a particular way of building it.

## How the system works

The [Pattern Model and Authoring Contract](language-model.md) defines pattern identity, evidence, relationships and admission. The [Service Topology — Generative Sequence](service-topology-sequence.md) shows the most mature current example of patterns being invoked in a consequential design order without turning the graph into a universal procedure.

The Reference House records the patterns that materially shape it in [Pattern Selection](../reference-house/pattern-occurrence-register.md). Use in that house does not increase a pattern's general evidence or maturity.

The active list above is generated from pattern metadata; individual pattern records remain the source of pattern identity and evidence status.