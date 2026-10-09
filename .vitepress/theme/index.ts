import { h } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import './custom.css'
import './build-stamp.css'

declare const __HSA_BUILD_COMMIT__: string

const buildCommit = __HSA_BUILD_COMMIT__
const shortCommit = buildCommit === 'unknown' ? buildCommit : buildCommit.slice(0, 7)
const commitUrl = buildCommit === 'unknown'
  ? 'https://github.com/adamnoden/architecture'
  : `https://github.com/adamnoden/architecture/commit/${buildCommit}`

export default {
  extends: DefaultTheme,
  Layout: () =>
    h(DefaultTheme.Layout, null, {
      'layout-bottom': () =>
        h(
          'a',
          {
            class: 'hsa-build-stamp',
            href: commitUrl,
            target: '_blank',
            rel: 'noreferrer',
            title: `Build ${buildCommit}`,
            'aria-label': `Build commit ${buildCommit}`
          },
          `build ${shortCommit}`
        )
    })
} satisfies Theme
