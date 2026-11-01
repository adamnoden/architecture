import { h } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import './custom.css'
import './build-provenance.css'

declare const __SITE_BUILD_COMMIT__: string
declare const __SITE_BUILD_TIMESTAMP__: string

const buildCommit = __SITE_BUILD_COMMIT__
const buildTimestamp = __SITE_BUILD_TIMESTAMP__
const shortCommit = buildCommit === 'unknown' ? buildCommit : buildCommit.slice(0, 7)
const commitUrl = buildCommit === 'unknown'
  ? 'https://github.com/adamnoden/architecture'
  : `https://github.com/adamnoden/architecture/commit/${buildCommit}`

function formatTimestamp(timestamp: string): string {
  if (timestamp === 'unknown') return timestamp

  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) return timestamp

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const day = String(date.getUTCDate()).padStart(2, '0')
  const month = months[date.getUTCMonth()]
  const year = date.getUTCFullYear()
  const hours = String(date.getUTCHours()).padStart(2, '0')
  const minutes = String(date.getUTCMinutes()).padStart(2, '0')

  return `${day} ${month} ${year} ${hours}:${minutes} UTC`
}

const shortTimestamp = formatTimestamp(buildTimestamp)

export default {
  extends: DefaultTheme,
  Layout: () =>
    h(DefaultTheme.Layout, null, {
      'layout-bottom': () =>
        h(
          'a',
          {
            class: 'site-build-provenance',
            href: commitUrl,
            target: '_blank',
            rel: 'noreferrer',
            title: `Build ${buildCommit} · ${buildTimestamp}`,
            'aria-label': `Build commit ${buildCommit}, built ${buildTimestamp}`
          },
          `${shortCommit} · built ${shortTimestamp}`
        )
    })
} satisfies Theme
