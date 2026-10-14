interface PublicationIntegrityEdit {
  readonly entryId: string
  readonly from: string
  readonly to: string
}

const edits: readonly PublicationIntegrityEdit[] = [
  {
    entryId: 'preface',
    from: ' The research boundary for this use is recorded in `docs/research/preface-precedents.md`.',
    to: ''
  },
  {
    entryId: 'doctrine-register-crosswalk',
    from:
      'The historical source was deleted from the live repository after the migration but remains recoverable in git history at parent commit `8ea91d8ea3dff5ca04ee2cb263a8ee003a348547`, file `docs/source/house-design-doctrine-v7.md`. The wording in the first column is retained from that source.',
    to:
      'The wording in the first column is retained from the archived **House Design Doctrine v7** source.'
  }
]

export function applyPublicationIntegrityEdits(entryId: string, markdown: string): string {
  for (const edit of edits.filter((candidate) => candidate.entryId === entryId)) {
    const first = markdown.indexOf(edit.from)
    if (first < 0) {
      throw new Error(`PR-00F integrity edit anchor changed in ${entryId}; review the publication edit deliberately.`)
    }
    if (markdown.indexOf(edit.from, first + edit.from.length) >= 0) {
      throw new Error(`PR-00F integrity edit anchor is ambiguous in ${entryId}.`)
    }
    markdown = `${markdown.slice(0, first)}${edit.to}${markdown.slice(first + edit.from.length)}`
  }
  return markdown
}

export function publicationIntegrityEdits(): readonly PublicationIntegrityEdit[] {
  return edits
}
