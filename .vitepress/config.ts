import { defineConfig } from 'vitepress'
import { assertNavigationCoverage, sidebar } from './navigation'

assertNavigationCoverage()

export default defineConfig({
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
