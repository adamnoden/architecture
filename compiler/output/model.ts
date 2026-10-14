export type OutputClass =
  | 'MACHINE_PROOF'
  | 'SEMANTIC_REPORT'
  | 'SPATIAL_INSPECTION'
  | 'HISTORICAL_EVIDENCE'
  | 'PUBLICATION_SOURCE_CANDIDATE'

export type OutputFormat = 'json' | 'markdown' | 'svg'

export type OutputCompileStatus = 'PASS' | 'REVIEW' | 'FAIL'

export interface OutputDescriptor {
  readonly id: string
  readonly classes: readonly OutputClass[]
  readonly format: OutputFormat
  readonly path: string
  readonly rendererVersion: string
  readonly authorityNote: string
}

export interface GeneratedOutputIdentity {
  readonly artefactId: string
  readonly path: string
  readonly format: OutputFormat
  readonly rendererVersion: string
  readonly sourceCompileFingerprint: string
  readonly content: {
    readonly algorithm: 'sha256'
    readonly fingerprint: string
  }
}

export interface OutputManifest {
  readonly schemaVersion: string
  readonly sourceCompile: {
    readonly schemaVersion: string
    readonly fingerprint: string
  }
  readonly status: Exclude<OutputCompileStatus, 'FAIL'>
  readonly artefacts: readonly GeneratedOutputIdentity[]
}
