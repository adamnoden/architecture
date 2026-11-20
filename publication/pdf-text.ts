export function normalizePublicationPdfText(value: string): string {
  return value
    .replace(/[\u00ad\u2010]\s*/gu, '')
    .replace(/(\p{L})-\s+(?=\p{L})/gu, '$1-')
    .replace(/\s+/g, ' ')
    .trim()
}
