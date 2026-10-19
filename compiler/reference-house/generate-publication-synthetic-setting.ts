import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'

import { renderDrawingSceneSvg } from '../publication-drawing/svg.js'
import { assertCanonicalArtefactGenerationAllowed } from './artifact-generation.js'
import { compileReferenceHouse } from './compile.js'
import { createReferenceHouseSource } from './fixture.js'
import { createSyntheticSettingPublicationScene } from './publication-synthetic-setting.js'
import { createSyntheticSettingPublicationSource } from './publication-synthetic-setting-source.js'

export const PUBLICATION_SYNTHETIC_SETTING_PATH = 'docs/reference-house/publication-synthetic-setting.svg'

export const renderCanonicalPublicationSyntheticSetting = (): string => {
  const result = compileReferenceHouse(createReferenceHouseSource())
  assertCanonicalArtefactGenerationAllowed('DRW-08E', result.status)
  return renderDrawingSceneSvg(createSyntheticSettingPublicationScene(createSyntheticSettingPublicationSource()))
}

export const generatePublicationSyntheticSetting = (): void => {
  const svg = renderCanonicalPublicationSyntheticSetting()
  mkdirSync(dirname(PUBLICATION_SYNTHETIC_SETTING_PATH), { recursive: true })
  writeFileSync(PUBLICATION_SYNTHETIC_SETTING_PATH, svg, 'utf8')
}

if (process.argv[1]?.endsWith('generate-publication-synthetic-setting.ts')) generatePublicationSyntheticSetting()
