interface PublicationIntegrityEdit {
  readonly entryId: string
  readonly from: string
  readonly to: string
}

const edits: readonly PublicationIntegrityEdit[] = []

export function applyPublicationIntegrityEdits(entryId: string, markdown: string): string {
  for (const edit of edits.filter((candidate) => candidate.entryId === entryId)) {
    const first = markdown.indexOf(edit.from)
    if (first < 0) {
      throw new Error(`Publication integrity edit anchor changed in ${entryId}; review the edit deliberately.`)
    }
    if (markdown.indexOf(edit.from, first + edit.from.length) >= 0) {
      throw new Error(`Publication integrity edit anchor is ambiguous in ${entryId}.`)
    }
    markdown = `${markdown.slice(0, first)}${edit.to}${markdown.slice(first + edit.from.length)}`
  }
  return markdown
}

export function publicationIntegrityEdits(): readonly PublicationIntegrityEdit[] {
  return edits
}
