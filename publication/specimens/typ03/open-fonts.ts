import { createHash } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

type OpenCandidate = 'source' | 'newsreader-source'
type FontEnvName =
  | 'TYP03_SERIF_REGULAR'
  | 'TYP03_SERIF_ITALIC'
  | 'TYP03_SERIF_BOLD'
  | 'TYP03_SANS_REGULAR'
  | 'TYP03_SANS_BOLD'

type Pin = {
  repo: string
  commit: string
  path: string
  gitBlobSha: string
  outputName: string
  envNames?: FontEnvName[]
}

const specimenRoot = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(specimenRoot, '../../..')
const cacheRoot = resolve(repoRoot, 'publication/.work/typ03-open-fonts')

const sourceSerifCommit = '80d3f8894c09c937bebfa9011247d2e1c79fd6f4'
const sourceSansCommit = '87b37a2daaed80fcb8e8ccb0085c4d72ddade12e'
const newsreaderCommit = 'cfcb4f7af0e52c25e8df2a2431814c8e5fe2e155'

const sourceSansPins: Pin[] = [
  {
    repo: 'adobe-fonts/source-sans',
    commit: sourceSansCommit,
    path: 'TTF/SourceSans3-Regular.ttf',
    gitBlobSha: 'c5dd0b88cc8ff4edd7ebdcefee0290df15529657',
    outputName: 'SourceSans3-Regular.ttf',
    envNames: ['TYP03_SANS_REGULAR']
  },
  {
    repo: 'adobe-fonts/source-sans',
    commit: sourceSansCommit,
    path: 'TTF/SourceSans3-Bold.ttf',
    gitBlobSha: '85693ccc852fbd7fa4ae9d89d6ccbf6d38f8e0f0',
    outputName: 'SourceSans3-Bold.ttf',
    envNames: ['TYP03_SANS_BOLD']
  },
  {
    repo: 'adobe-fonts/source-sans',
    commit: sourceSansCommit,
    path: 'LICENSE.md',
    gitBlobSha: '22c601b82f29fc6bb801445098c9f23ffdca4f94',
    outputName: 'SOURCE-SANS-LICENSE.md'
  }
]

const pins: Record<OpenCandidate, Pin[]> = {
  source: [
    {
      repo: 'adobe-fonts/source-serif',
      commit: sourceSerifCommit,
      path: 'TTF/SourceSerif4-Regular.ttf',
      gitBlobSha: '964a2bf8934182485cf4e2348c8443091739334f',
      outputName: 'SourceSerif4-Regular.ttf',
      envNames: ['TYP03_SERIF_REGULAR']
    },
    {
      repo: 'adobe-fonts/source-serif',
      commit: sourceSerifCommit,
      path: 'TTF/SourceSerif4-It.ttf',
      gitBlobSha: 'e818087d0c75997a38189f6cf578c468df175062',
      outputName: 'SourceSerif4-It.ttf',
      envNames: ['TYP03_SERIF_ITALIC']
    },
    {
      repo: 'adobe-fonts/source-serif',
      commit: sourceSerifCommit,
      path: 'TTF/SourceSerif4-Bold.ttf',
      gitBlobSha: 'c4159ff2a409d9224dfa97af4e5167817e91e833',
      outputName: 'SourceSerif4-Bold.ttf',
      envNames: ['TYP03_SERIF_BOLD']
    },
    {
      repo: 'adobe-fonts/source-serif',
      commit: sourceSerifCommit,
      path: 'LICENSE.md',
      gitBlobSha: '5871e1f3d1b3362453b3a1f6c493fbefdbd3dcf3',
      outputName: 'SOURCE-SERIF-LICENSE.md'
    },
    ...sourceSansPins
  ],
  'newsreader-source': [
    {
      repo: 'productiontype/Newsreader',
      commit: newsreaderCommit,
      path: 'fonts/variable/ttf/Newsreader[opsz,wght].ttf',
      gitBlobSha: 'ad4a9a8c44ec328c80b61c773f1ba02f6b5ed292',
      outputName: 'Newsreader-opsz-wght.ttf',
      envNames: ['TYP03_SERIF_REGULAR', 'TYP03_SERIF_BOLD']
    },
    {
      repo: 'productiontype/Newsreader',
      commit: newsreaderCommit,
      path: 'fonts/variable/ttf/Newsreader-Italic[opsz,wght].ttf',
      gitBlobSha: 'd25879656a601d44c49836f9e773d100190c62e1',
      outputName: 'Newsreader-Italic-opsz-wght.ttf',
      envNames: ['TYP03_SERIF_ITALIC']
    },
    {
      repo: 'productiontype/Newsreader',
      commit: newsreaderCommit,
      path: 'OFL.txt',
      gitBlobSha: 'd2d4f407109e9c74b8ab502fc79b912408ab8e41',
      outputName: 'NEWSREADER-OFL.txt'
    },
    ...sourceSansPins
  ]
}

export const openFontCandidates = new Set<OpenCandidate>(['source', 'newsreader-source'])

const gitBlobSha = (bytes: Buffer): string => {
  const header = Buffer.from(`blob ${bytes.length}\0`, 'utf8')
  return createHash('sha1').update(header).update(bytes).digest('hex')
}

const rawUrl = (pin: Pin): string => {
  const encodedPath = pin.path.split('/').map(encodeURIComponent).join('/')
  return `https://raw.githubusercontent.com/${pin.repo}/${pin.commit}/${encodedPath}`
}

export async function fetchOpenFontCandidate(candidate: OpenCandidate): Promise<Record<FontEnvName, string>> {
  const candidateRoot = resolve(cacheRoot, candidate)
  await mkdir(candidateRoot, { recursive: true })

  const fontEnv = {} as Record<FontEnvName, string>
  const evidence: Array<Pin & { sha256: string }> = []

  for (const pin of pins[candidate]) {
    const response = await fetch(rawUrl(pin), { redirect: 'follow' })
    if (!response.ok) {
      throw new Error(`Failed to fetch ${pin.repo}@${pin.commit}:${pin.path}: HTTP ${response.status}`)
    }

    const bytes = Buffer.from(await response.arrayBuffer())
    const actualBlobSha = gitBlobSha(bytes)
    if (actualBlobSha !== pin.gitBlobSha) {
      throw new Error(
        `Integrity failure for ${pin.repo}@${pin.commit}:${pin.path}: expected Git blob ${pin.gitBlobSha}, got ${actualBlobSha}`
      )
    }

    const outputPath = resolve(candidateRoot, pin.outputName)
    await writeFile(outputPath, bytes)
    const sha256 = createHash('sha256').update(bytes).digest('hex')
    evidence.push({ ...pin, sha256 })

    for (const envName of pin.envNames ?? []) fontEnv[envName] = outputPath
  }

  const required: FontEnvName[] = [
    'TYP03_SERIF_REGULAR',
    'TYP03_SERIF_ITALIC',
    'TYP03_SERIF_BOLD',
    'TYP03_SANS_REGULAR',
    'TYP03_SANS_BOLD'
  ]
  for (const envName of required) {
    if (!fontEnv[envName]) throw new Error(`Pinned open candidate ${candidate} did not resolve ${envName}`)
  }

  await writeFile(
    resolve(candidateRoot, 'upstream-evidence.json'),
    `${JSON.stringify({ schemaVersion: 1, candidate, pins: evidence }, null, 2)}\n`,
    'utf8'
  )

  return fontEnv
}

const invokedDirectly = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (invokedDirectly) {
  const requested = process.argv[2]
  if (!openFontCandidates.has(requested as OpenCandidate)) {
    throw new Error('Usage: npx tsx publication/specimens/typ03/open-fonts.ts <source|newsreader-source>')
  }

  const candidate = requested as OpenCandidate
  const fontEnv = await fetchOpenFontCandidate(candidate)
  console.log(`Verified pinned open-font inputs for ${candidate}.`)
  for (const [name, value] of Object.entries(fontEnv)) console.log(`${name}=${value}`)
  console.log('TYP03_FONT_RIGHTS=pdf-embed-ok')
}
