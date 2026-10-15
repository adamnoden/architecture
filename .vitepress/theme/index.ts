import { h } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import './custom.css'
import './build-stamp.css'

declare const __HOUSE_KERNEL_BUILD_COMMIT__: string
declare const __HOUSE_KERNEL_BUILD_TIMESTAMP__: string

const buildCommit = __HOUSE_KERNEL_BUILD_COMMIT__
const buildTimestamp = __HOUSE_KERNEL_BUILD_TIMESTAMP__
const shortCommit = buildCommit === 'unknown' ? buildCommit : buildCommit.slice(0, 7)
const shortTimestamp = buildTimestamp === 'unknown'
  ? buildTimestamp
  : buildTimestamp.replace('T', ' ').replace(/:\d{2}\.\d{3}Z$/, ' UTC')
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
            class: 'house-kernel-build-stamp',
            href: commitUrl,
            target: '_blank',
            rel: 'noreferrer',
            title: `Build ${buildCommit} · ${buildTimestamp}`,
            'aria-label': `Build commit ${buildCommit}, built ${buildTimestamp}`
          },
          `build ${shortCommit} · ${shortTimestamp}`
        )
    })
} satisfies Theme
