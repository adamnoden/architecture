import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Long-Life House',
  description: 'Architectural design research on selective permanence, maintainability and long-lived domestic construction.',
  lang: 'en-GB',
  base: '/architecture/',
  cleanUrls: true,

  rewrites(id) {
    if (id === 'README.md') return 'index.md'
    return id.replace(/\/README\.md$/, '/index.md')
  },

  themeConfig: {
    siteTitle: 'Long-Life House',
    search: {
      provider: 'local'
    },
    outline: {
      level: [2, 3],
      label: 'On this page'
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/adamnoden/architecture' }
    ],
    nav: [
      { text: 'Read', link: '/docs/manuscript/' },
      { text: 'Patterns', link: '/docs/patterns/' },
      { text: 'Reference House', link: '/docs/reference-house/' },
      { text: 'Research', link: '/docs/research/' },
      {
        text: 'Project',
        items: [
          { text: 'Status', link: '/STATUS' },
          { text: 'Computational', link: '/docs/computational/' },
          { text: 'Delivery', link: '/docs/delivery/' },
          { text: 'Development', link: '/docs/development/' },
          { text: 'Prototypes', link: '/docs/prototypes/' },
          { text: 'Repository map', link: '/docs/' }
        ]
      }
    ],
    sidebar: {
      '/docs/manuscript/': [
        {
          text: 'Read',
          items: [
            { text: 'Manuscript index', link: '/docs/manuscript/' },
            { text: 'Preface', link: '/docs/manuscript/preface' },
            { text: 'Governing principles', link: '/docs/manuscript/governing-principles' },
            { text: 'Part I', link: '/docs/manuscript/part-i' },
            { text: 'Part II', link: '/docs/manuscript/part-ii' },
            { text: 'Repose', link: '/docs/manuscript/principle-08-repose' },
            { text: 'External maintenance geography', link: '/docs/manuscript/maintenance-geography-external' },
            { text: 'Part V', link: '/docs/manuscript/part-v' }
          ]
        },
        {
          text: 'Publication structure',
          collapsed: true,
          items: [
            { text: 'Publication architecture', link: '/docs/manuscript/publication-architecture' }
          ]
        }
      ],

      '/docs/patterns/': [
        {
          text: 'Patterns',
          items: [
            { text: 'Pattern index', link: '/docs/patterns/' },
            { text: 'Core catalogue', link: '/docs/patterns/core-12' },
            { text: 'Ground-supported facade access', link: '/docs/patterns/ground-supported-facade-access' },
            { text: 'Reversible assembly candidates', link: '/docs/patterns/reversible-assembly-candidates' }
          ]
        }
      ],

      '/docs/reference-house/': [
        {
          text: 'Reference House',
          items: [
            { text: 'Reference House index', link: '/docs/reference-house/' },
            { text: 'Tectonic architectural language', link: '/docs/reference-house/tectonic-architectural-language' },
            { text: 'Vertical bay options', link: '/docs/reference-house/vertical-bay-options' },
            { text: 'Vertical bay coordination', link: '/docs/reference-house/vertical-bay-coordination' },
            { text: 'External access & maintenance', link: '/docs/reference-house/external-access-maintenance-plan' }
          ]
        }
      ],

      '/docs/research/': [
        {
          text: 'Research',
          items: [
            { text: 'Research index', link: '/docs/research/' },
            { text: 'Repose & low vigilance', link: '/docs/research/repose-and-low-vigilance' },
            { text: 'Repose evidence audit', link: '/docs/research/repose-evidence-audit' },
            { text: 'Workmanship robustness', link: '/docs/research/workmanship-robustness' },
            { text: 'External maintenance access', link: '/docs/research/external-maintenance-access' },
            { text: 'Primary floor structure baseline', link: '/docs/research/primary-floor-structure-baseline' },
            { text: 'Seated floor structure options', link: '/docs/research/seated-floor-structure-options' },
            { text: 'Finish-agnostic floor options', link: '/docs/research/finish-agnostic-floor-platform-options' },
            { text: 'Replaceable wall systems', link: '/docs/research/replaceable-wall-system-options' },
            { text: 'Candidate pattern hardening', link: '/docs/research/candidate-pattern-hardening-summary' },
            { text: 'Preface precedents', link: '/docs/research/preface-precedents' }
          ]
        }
      ],

      '/docs/development/': [
        {
          text: 'Development',
          items: [
            { text: 'Development index', link: '/docs/development/' },
            { text: 'Manufacturing strategy', link: '/docs/development/manufacturing-strategy' },
            { text: 'Prototype programme', link: '/docs/development/tectonic-prototype-programme' },
            { text: 'Tectonic honesty', link: '/docs/development/tectonic-honesty' },
            { text: 'Tectonic integration register', link: '/docs/development/tectonic-integration-register' },
            { text: 'Tectonic migration plan', link: '/docs/development/tectonic-migration-plan' },
            { text: 'Repose integration register', link: '/docs/development/repose-integration-register' },
            { text: 'Preface architecture', link: '/docs/development/preface-architecture' }
          ]
        }
      ],

      '/docs/prototypes/': [
        {
          text: 'Prototypes',
          items: [
            { text: 'Prototype index', link: '/docs/prototypes/' },
            { text: 'W2 wall-bay build pack', link: '/docs/prototypes/w2-wall-bay-build-pack' }
          ]
        }
      ],

      '/docs/delivery/': [
        {
          text: 'Delivery',
          items: [
            { text: 'Delivery index', link: '/docs/delivery/' },
            { text: 'RIBA implementation brief', link: '/docs/delivery/riba-implementation-brief-template' },
            { text: 'External maintenance access requirements', link: '/docs/delivery/external-maintenance-access-requirements' }
          ]
        }
      ],

      '/docs/computational/': [
        {
          text: 'Computational Track',
          items: [
            { text: 'Track index', link: '/docs/computational/' },
            { text: 'Executable architecture', link: '/docs/computational/executable-architecture' },
            { text: 'Research programme v0.5', link: '/docs/computational/research-programme-v05' },
            { text: 'Formal architectural model', link: '/docs/computational/formal-architectural-model' },
            { text: 'Architectural grammar & proportion', link: '/docs/computational/architectural-grammar-and-proportion' },
            { text: 'Validity & obligations', link: '/docs/computational/validity-and-obligations' },
            { text: 'Evidence & provenance', link: '/docs/computational/evidence-and-provenance' },
            { text: 'Compiler targets', link: '/docs/computational/compiler-targets' },
            { text: 'Structural semantics', link: '/docs/computational/structural-semantics' },
            { text: 'Boundary semantics', link: '/docs/computational/boundary-semantics' },
            { text: 'Supported domain', link: '/docs/computational/supported-domain' }
          ]
        }
      ],

      '/docs/editorial/': [
        {
          text: 'Editorial',
          items: [
            { text: 'Editorial index', link: '/docs/editorial/' },
            { text: 'Editorial doctrine', link: '/docs/editorial/editorial-doctrine' },
            { text: 'Editorial overhaul plan', link: '/docs/editorial/editorial-overhaul-plan' }
          ]
        }
      ],

      '/docs/source/': [
        {
          text: 'Source',
          items: [
            { text: 'Source index', link: '/docs/source/' },
            { text: 'House Design Doctrine v7', link: '/docs/source/house-design-doctrine-v7' }
          ]
        }
      ],

      '/': [
        {
          text: 'Project',
          items: [
            { text: 'Overview', link: '/' },
            { text: 'Status', link: '/STATUS' },
            { text: 'Documentation structure', link: '/docs/' }
          ]
        }
      ]
    }
  }
})
