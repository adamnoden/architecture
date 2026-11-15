import { sha256SemanticFingerprint } from '../../core/identity.js'
import { auditSourceCoverage } from '../../../project/ccr/studies/source-coverage.js'
import { readGeorgianDesignSnapshot, requireGeorgianDesignBasis } from './georgian-source.js'
import { admitDesignSnapshot } from './snapshot.js'

/** Resolve the supplied design and bind the exact pre-site sources it can cite. */
export function resolveCurrentDesign(input: unknown) {
  const design = admitDesignSnapshot(input)
  if (design.source.kind === 'contrast-specimen') {
    return { schema: 'current-design-resolution/1', design, disciplineBindings: [] } as const
  }

  const acceptedBasis = requireGeorgianDesignBasis(design)
  const audit = auditSourceCoverage()
  if (audit.findings.length) {
    throw new Error(`Current discipline source binding failed: ${JSON.stringify(audit.findings)}`)
  }

  const applicability = {
    sourceId: acceptedBasis.source.id,
    planDigest: sha256SemanticFingerprint(acceptedBasis),
    shellMm: [acceptedBasis.envelope.widthMm, acceptedBasis.envelope.depthMm],
    scope: 'exact accepted Georgian plan basis only',
  } as const
  return {
    schema: 'current-design-resolution/1',
    design: acceptedBasis,
    disciplineBindings: audit.bindings.map(binding => ({ ...binding, applicability })),
  } as const
}

export function readCurrentDesignResolution() {
  return resolveCurrentDesign(readGeorgianDesignSnapshot())
}
