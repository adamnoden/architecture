# Patterns

<script setup>
import { data as patterns } from './patterns.data'

const activePatterns = patterns.filter((pattern) => pattern.state === 'active')
const retiredPatterns = patterns.filter((pattern) => pattern.state === 'retired')
</script>

This area holds reusable architectural responses developed from the doctrine.

The project is migrating from a **pattern catalogue** to an evidence-qualified **pattern language**: stable identities, sparse typed relationships and separate generative sequences. Phase 6 has completed the corpus audit; Phase 7 is now building the canonical individual pattern pages under the controls in the [Phase 7 Migration Plan](../development/pattern-language-phase7-plan.md).

Pattern identity is independent from evidence maturity. A pattern can have a stable place in the language while still requiring calculation, prototype work or professional review.

## Active canonical patterns

<div v-if="activePatterns.length">
  <ul>
    <li v-for="pattern in activePatterns" :key="pattern.id">
      <a :href="pattern.url"><code>{{ pattern.id }}</code> — {{ pattern.title }}</a>
      <span> · {{ pattern.evidence }}</span>
    </li>
  </ul>
</div>

<div v-else>
  Canonical individual pages are being created during Phase 7. Until the first migration set lands, use the audited migration material below rather than treating the old aggregate catalogue as the final language.
</div>

## Retired identities

<div v-if="retiredPatterns.length">
  <ul>
    <li v-for="pattern in retiredPatterns" :key="pattern.id">
      <a :href="pattern.url"><code>{{ pattern.id }}</code> — {{ pattern.title }}</a>
    </li>
  </ul>
</div>

Retired IDs remain visible for provenance and are never reused.

## Language and migration controls

- [Pattern Language — Model and Authoring Contract](language-model.md)
- [Service Topology — Generative Sequence](service-topology-sequence.md)
- [Phase 7 Migration Plan](../development/pattern-language-phase7-plan.md)
- [Phase 6 Gate Review](../development/pattern-language-phase6-review.md)
- [Phase 6 Corpus Audit](../development/pattern-language-corpus-audit.md)
- [Targeted Evidence Review](../research/pattern-language-phase6-targeted-evidence.md)

## Transitional source material

These remain useful while their content is migrated, but they are not the target information architecture:

- [Core Pattern Catalogue](core-12.md) — legacy aggregate prose for `HSA-P-001..012`;
- [Service-Topology Pilot](pilot/README.md) — migration provenance for the first linked pattern records;
- [Ground-Supported Façade Access](ground-supported-facade-access.md) — developed page being promoted to `HSA-P-013`;
- [Reversible Assembly Candidates](reversible-assembly-candidates.md) — mixed candidate/strategy/implementation material being normalised in Phase 7;
- [Accessible Vertical Service Zone](candidates/accessible-vertical-service-zone.md) — developed candidate admitted as `HSA-P-014`.

The generated lists above derive from canonical pattern frontmatter. Do not maintain a second manual ID registry here.
