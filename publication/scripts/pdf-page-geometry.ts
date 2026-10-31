export interface PdfPageSize {
  widthPt: number
  heightPt: number
}

/** Parse a complete `pdfinfo -f 1 -l <pages>` result, failing closed on gaps. */
export function parsePdfPageSizes(info: string, pages: number): PdfPageSize[] {
  if (!Number.isSafeInteger(pages) || pages < 1) throw new Error('Invalid production PDF page count.')
  const lines = info.split('\n').filter((line) => /^Page(?:\s+\d+)?\s+size:/.test(line))
  if (lines.length !== pages) {
    throw new Error(`Production PDF page geometry is incomplete: expected ${pages} pages, found ${lines.length}.`)
  }
  return lines.map((line, index) => {
    const match = line.match(/^Page(?:\s+(\d+))?\s+size:\s+([\d.]+)\s+x\s+([\d.]+)\s+pts(?:\s|$)/)
    const page = match?.[1] === undefined && pages === 1 ? 1 : Number(match?.[1])
    const widthPt = Number(match?.[2])
    const heightPt = Number(match?.[3])
    if (!match || page !== index + 1 || !Number.isFinite(widthPt) || !Number.isFinite(heightPt) || widthPt <= 0 || heightPt <= 0) {
      throw new Error(`Could not parse production PDF page ${index + 1} geometry: ${line}`)
    }
    return { widthPt, heightPt }
  })
}
