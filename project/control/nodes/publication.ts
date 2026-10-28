import { defineNodes } from '../types.js'

export const publicationNodes = defineNodes([
  {
    id: 'PLT-CURRENT-REVIEW',
    owners: ['PLT'],
    title: 'Current-source plate capability and physical review work',
    dependencies: ['BSR-ROOT'],
    lifecycle: 'started',
    closeoutEvidence: []
  },
  {
    id: 'PLT-FINAL-FREEZE',
    owners: ['PLT'],
    title: 'Final resolved-house plate integration and freeze',
    dependencies: ['HRS-SYNTHESIS', 'PLT-CURRENT-REVIEW'],
    lifecycle: 'planned',
    closeoutEvidence: []
  },
  {
    id: 'EDA-RENEWED',
    owners: ['EDA'],
    title: 'Renewed editorial-doctrine assurance over enlarged final source',
    dependencies: ['PLT-FINAL-FREEZE'],
    lifecycle: 'planned',
    closeoutEvidence: []
  },
  {
    id: 'PUB-02-PREP',
    owners: ['PUB'],
    title: 'Content-independent private-object preparation',
    dependencies: ['BSR-ROOT'],
    lifecycle: 'started',
    closeoutEvidence: []
  },
  {
    id: 'PUB-02-FINAL',
    owners: ['PUB'],
    title: 'Final private-object content, drawing and manufacture gate',
    dependencies: ['PUB-02-PREP', 'EDA-RENEWED'],
    lifecycle: 'planned',
    closeoutEvidence: []
  }
])
