import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'
import { assertNavigationCoverage, sidebar } from './navigation'

const computational = sidebar.find((item) => item.text === 'Computational track')
const currentProgramme = computational?.items?.find((item) => item.text === 'Current programme & review')
const programmeHistory = computational?.items?.find((item) => item.text === 'Programme history')

if (currentProgramme?.items) {
  currentProgramme.text = 'Executable result & external review'

  const v06Index = currentProgramme.items.findIndex(
    (item) => item.link === '/docs/computational/research-programme-v06'
  )

  if (v06Index >= 0 && programmeHistory?.items) {
    const [v06] = currentProgramme.items.splice(v06Index, 1)
    v06.text = 'Research programme v0.6 — frozen'
    if (!programmeHistory.items.some((item) => item.link === v06.link)) {
      programmeHistory.items.push(v06)
    }
  }

  const result = {
    text: 'P0 + PAT-XW-01 executable result — PASS',
    link: '/docs/computational/p0-pat-xw-01-result'
  }

  if (!currentProgramme.items.some((item) => item.link === result.link)) {
    currentProgramme.items.unshift(result)
  }

  const currentLabels = new Map([
    ['/docs/computational/h1-capability-matrix-v05', 'H1 capability matrix v0.5 — frozen paper baseline'],
    ['/docs/computational/doctrine-delta-external-maintenance-v01', 'External-maintenance doctrine delta — open fixture candidate'],
    ['/docs/computational/external-review-pack-h1-paper-v02', 'External review pack — H1 paper — open'],
    ['/docs/computational/external-evidence-trial-mapeguard-wp-v01', 'External evidence trial — Mapeguard WP — completed']
  ])

  for (const item of currentProgramme.items) {
    if (item.link && currentLabels.has(item.link)) item.text = currentLabels.get(item.link)
  }
}

if (programmeHistory?.items) {
  const p0Plan = {
    text: 'P0 implementation plan — completed',
    link: '/docs/computational/p0-implementation-plan'
  }

  if (!programmeHistory.items.some((item) => item.link === p0Plan.link)) {
    programmeHistory.items.push(p0Plan)
  }
}

const grammarStudy = computational?.items?.find((item) => item.text === 'Architectural grammar study')
if (grammarStudy?.items) {
  const researchBrief = grammarStudy.items.find((item) => item.link === '/docs/computational/g01-research-brief')
  if (researchBrief) researchBrief.text = 'G-01 research brief — baseline'

  const grammarPages = [
    {
      text: 'G-01 grammar charter',
      link: '/docs/computational/g01-grammar-charter'
    },
    {
      text: 'G-01 modelling corrections',
      link: '/docs/computational/architectural-grammar-modelling-corrections-v01'
    },
    {
      text: 'G-01 D5/D6 web pass v0.2 — superseded',
      link: '/docs/computational/g01-d5-d6-web-pass-v02'
    },
    {
      text: 'G-01 D5/D6 evidence gate v0.3 — current',
      link: '/docs/computational/g01-d5-d6-web-pass-v03'
    },
    {
      text: 'G-01 D6 mutation run — Danson sequence',
      link: '/docs/computational/g01-d6-mutation-run-01-danson-sequence'
    }
  ]

  const researchBriefIndex = grammarStudy.items.findIndex((item) => item.link === '/docs/computational/g01-research-brief')
  const insertionIndex = researchBriefIndex >= 0 ? researchBriefIndex : 1
  for (const addition of grammarPages.reverse()) {
    if (!grammarStudy.items.some((item) => item.link === addition.link)) {
      grammarStudy.items.splice(insertionIndex, 0, addition)
    }
  }

  const precedentCases = grammarStudy.items.find((item) => item.text === 'G-01 precedent cases')
  if (precedentCases?.items) {
    const casePages = [
      {
        text: 'Bedford Square',
        link: '/docs/computational/g01-cases/bedford-square'
      },
      {
        text: 'Danson House — D5/D6 web evidence',
        link: '/docs/computational/g01-cases/danson-d5-d6-web-evidence-v02'
      },
      {
        text: 'Marble Hill House — D5/D6 web evidence',
        link: '/docs/computational/g01-cases/marble-hill-d5-d6-web-evidence-v02'
      }
    ]

    for (const addition of casePages) {
      if (!precedentCases.items.some((item) => item.link === addition.link)) {
        precedentCases.items.push(addition)
      }
    }
  }
}

const deliveryAndTesting = sidebar.find((item) => item.text === 'Delivery & testing')
const prototypes = deliveryAndTesting?.items?.find((item) => item.text === 'Prototypes')
if (prototypes?.items && !prototypes.items.some((item) => item.link === '/docs/prototypes/w2-wall-bay-test-protocol')) {
  prototypes.items.push({
    text: 'W2 wall-bay evidence protocol',
    link: '/docs/prototypes/w2-wall-bay-test-protocol'
  })
}

const development = deliveryAndTesting?.items?.find((item) => item.text === 'Development')
if (development?.items) {
  const specificityPages = [
    {
      text: 'Architectural specificity boundary',
      link: '/docs/development/architectural-specificity-boundary'
    },
    {
      text: 'Architectural specificity audit',
      link: '/docs/development/architectural-specificity-audit'
    },
    {
      text: 'Architectural specificity claim ledger',
      link: '/docs/development/architectural-specificity-ledger'
    },
    {
      text: 'Architectural specificity adversarial test',
      link: '/docs/development/architectural-specificity-adversarial-test'
    }
  ]

  const insertionIndex = Math.min(1, development.items.length)
  for (const addition of specificityPages.reverse()) {
    if (!development.items.some((item) => item.link === addition.link)) {
      development.items.splice(insertionIndex, 0, addition)
    }
  }
}

assertNavigationCoverage()

// Mermaid stays authored as fenced Markdown; the wrapper only supplies VitePress rendering.
export default withMermaid(
  defineConfig({
    title: 'House Systems Architecture',
    description: 'Architectural systems research for houses designed to be maintained, repaired, renewed and adapted across time.',
    lang: 'en-GB',
    base: '/architecture/',
    cleanUrls: true,

    rewrites(id) {
      if (id === 'README.md') return 'index.md'
      return id.replace(/\/README\.md$/, '/index.md')
    },

    themeConfig: {
      siteTitle: 'House Systems Architecture',
      search: {
        provider: 'local'
      },
      outline: {
        level: [2, 3],
        label: 'On this page'
      },
      sidebarMenuLabel: 'Contents',
      nav: [
        { text: 'Start reading', link: '/docs/reading-guide' }
      ],
      socialLinks: [
        { icon: 'github', link: 'https://github.com/adamnoden/architecture' }
      ],
      sidebar
    }
  })
)
