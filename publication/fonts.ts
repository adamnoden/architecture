import { createHash } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

export type PublicationFontSlot =
  | 'PUBLICATION_SERIF_REGULAR'
  | 'PUBLICATION_SERIF_ITALIC'
  | 'PUBLICATION_SERIF_SEMIBOLD'
  | 'PUBLICATION_SANS_REGULAR'
  | 'PUBLICATION_SANS_BOLD'

type Pin = {
  repo: string
  commit: string
  path: string
  gitBlobSha: string
  outputName: string
  slot?: PublicationFontSlot
}

const sourceSerifCommit = '80d3f8894c09c937bebfa9011247d2e1c79fd6f4'
const sourceSansCommit = '87b37a2daaed80fcb8e8ccb0085c4d72ddade12e'

const pins: Pin[] = [
  {
    repo: 'adobe-fonts/source-serif',
    commit: sourceSerifCommit,
    path: 'TTF/SourceSerif4-Regular.ttf',
    gitBlobSha: '964a2bf8934182485cf4e2348c8443091739334f',
    outputName: 'SourceSerif4-Regular.ttf',
    slot: 'PUBLICATION_SERIF_REGULAR'
  },
  {
    repo: 'adobe-fonts/source-serif',
    commit: sourceSerifCommit,
    path: 'TTF/SourceSerif4-It.ttf',
    gitBlobSha: 'e818087d0c75997a38189f6cf578c468df175062',
    outputName: 'SourceSerif4-It.ttf',
    slot: 'PUBLICATION_SERIF_ITALIC'
  },
  {
    repo: 'adobe-fonts/source-serif',
    commit: sourceSerifCommit,
    path: 'TTF/SourceSerif4-Semibold.ttf',
    gitBlobSha: '151e9a9d5c08dfd4751650ab4bff92771a132888',
    outputName: 'SourceSerif4-Semibold.ttf',
    slot: 'PUBLICATION_SERIF_SEMIBOLD'
  },
  {
    repo: 'adobe-fonts/source-serif',
    commit: sourceSerifCommit,
    path: 'LICENSE.md',
    gitBlobSha: '5871e1f3d1b3362453b3a1f6c493fbefdbd3dcf3',
    outputName: 'SOURCE-SERIF-LICENSE.md'
  },
  {
    repo: 'adobe-fonts/source-sans',
    commit: sourceSansCommit,
    path: 'TTF/SourceSans3-Regular.ttf',
    gitBlobSha: 'c5dd0b88cc8ff4edd7ebdcefee0290df15529657',
    outputName: 'SourceSans3-Regular.ttf',
    slot: 'PUBLICATION_SANS_REGULAR'
  },
  {
    repo: 'adobe-fonts/source-sans',
    commit: sourceSansCommit,
    path: 'TTF/SourceSans3-Bold.ttf',
    gitBlobSha: '85693ccc852fbd7fa4ae9d89d6ccbf6d38f8e0f0',
    outputName: 'SourceSans3-Bold.ttf',
    slot: 'PUBLICATION_SANS_BOLD'
  },
  {
    repo: 'adobe-fonts/source-sans',
    commit: sourceSansCommit,
    path: 'LICENSE.md',
    gitBlobSha: '22c601b82f29fc6bb801445098c9f23ffdca4f94',
    outputName: 'SOURCE-SANS-LICENSE.md'
  }
]

const gitBlobSha = (bytes: Buffer): string => {
  const header = Buffer.from(`blob ${bytes.length}\0`, 'utf8')
  return createHash('sha1').update(header).update(bytes).digest('hex')
}

const rawUrl = (pin: Pin): string => {
  const encodedPath = pin.path.split('/').map(encodeURIComponent).join('/')
  return `https://raw.githubusercontent.com/${pin.repo}/${pin.commit}/${encodedPath}`
}

export async function fetchPublicationFonts(cacheRoot: string): Promise<Record<PublicationFontSlot, string>> {
  await mkdir(cacheRoot, { recursive: true })
  const slots = {} as Record<PublicationFontSlot, string>
  const evidence: Array<Pin & { sha256: string }> = []

  for (const pin of pins) {
    const response = await fetch(rawUrl(pin), { redirect: 'follow' })
    if (!response.ok) {
      throw new Error(`Failed to fetch ${pin.repo}@${pin.commit}:${pin.path}: HTTP ${response.status}`)
    }

    const bytes = Buffer.from(await response.arrayBuffer())
    const actualBlobSha = gitBlobSha(bytes)
    if (actualBlobSha !== pin.gitBlobSha) {
      throw new Error(
        `Publication font integrity failure for ${pin.repo}@${pin.commit}:${pin.path}: expected Git blob ${pin.gitBlobSha}, got ${actualBlobSha}`
      )
    }

    const outputPath = resolve(cacheRoot, pin.outputName)
    await writeFile(outputPath, bytes)
    evidence.push({ ...pin, sha256: createHash('sha256').update(bytes).digest('hex') })
    if (pin.slot) slots[pin.slot] = outputPath
  }

  const required: PublicationFontSlot[] = [
    'PUBLICATION_SERIF_REGULAR',
    'PUBLICATION_SERIF_ITALIC',
    'PUBLICATION_SERIF_SEMIBOLD',
    'PUBLICATION_SANS_REGULAR',
    'PUBLICATION_SANS_BOLD'
  ]
  for (const slot of required) {
    if (!slots[slot]) throw new Error(`Pinned publication fonts did not resolve ${slot}.`)
  }

  await writeFile(
    resolve(cacheRoot, 'upstream-evidence.json'),
    `${JSON.stringify({
      schemaVersion: 1,
      contract: 'publication-typography-v1-candidate',
      sourceSerifCommit,
      sourceSansCommit,
      pins: evidence
    }, null, 2)}\n`,
    'utf8'
  )

  return slots
}