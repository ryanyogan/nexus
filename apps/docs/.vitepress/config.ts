import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Nexus',
  description: 'The Documentation Oracle for AI - Persistent memory, documentation search, and MCP server discovery',
  
  // Exclude old Docusaurus content (root-level docs/ folder only)
  srcExclude: ['docs/**', 'src/**', '.docusaurus/**', '.astro/**', 'build/**', 'node_modules/**'],
  
  // Only ignore dead links in specific patterns (old Docusaurus references and app links)
  ignoreDeadLinks: [
    /^\/mcp-tools\//,
    /^\/common-tasks\//,
    /^\/sdk\//,
    /^\/changelog$/,
    /^\/dashboard\//,  // Dashboard links go to main app
    /^\/admin\//,      // Admin links go to main app
  ],
  
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    ['meta', { name: 'theme-color', content: '#06b6d4' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: 'Nexus - The Documentation Oracle for AI' }],
    ['meta', { property: 'og:description', content: 'Persistent memory, documentation search, and MCP server discovery for AI coding assistants' }],
    ['meta', { property: 'og:url', content: 'https://docs.nexus.yogan.dev' }],
  ],

  // Clean URLs without .html
  cleanUrls: true,

  // Last updated timestamp
  lastUpdated: true,

  // Markdown configuration
  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark',
    },
    lineNumbers: true,
  },

  themeConfig: {
    logo: {
      light: '/logo.svg',
      dark: '/logo-dark.svg',
    },
    siteTitle: 'NEXUS',

    // Navigation bar
    nav: [
      { text: 'Guide', link: '/getting-started/introduction' },
      { text: 'Stacks', link: '/stacks/overview' },
      { text: 'Flows', link: '/flows/overview' },
      { text: 'MCP Tools', link: '/tools/overview' },
      { text: 'CLI', link: '/cli/overview' },
      { text: 'API', link: '/api/overview' },
      {
        text: 'Resources',
        items: [
          { text: 'Guides', link: '/guides/ai-clients' },
          { text: 'Troubleshooting', link: '/troubleshooting' },
          { text: 'Changelog', link: '/changelog' },
        ],
      },
    ],

    // Sidebar navigation
    sidebar: {
      '/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Introduction', link: '/getting-started/introduction' },
            { text: 'Installation', link: '/getting-started/installation' },
            { text: 'Quick Start', link: '/getting-started/quickstart' },
          ],
        },
        {
          text: 'Configuration',
          items: [
            { text: 'Claude Desktop', link: '/configuration/claude-desktop' },
            { text: 'Cursor', link: '/configuration/cursor' },
            { text: 'VS Code', link: '/configuration/vscode' },
            { text: 'OpenCode', link: '/configuration/opencode' },
            { text: 'Environment Variables', link: '/configuration/environment' },
          ],
        },
        {
          text: 'Stacks',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/stacks/overview' },
            { text: 'Quickstart', link: '/stacks/quickstart' },
            { text: 'Visual Canvas', link: '/stacks/visual-canvas' },
            { text: 'Composing Stacks', link: '/stacks/composing' },
            { text: 'MCP Tools', link: '/stacks/mcp-tools' },
            { text: 'Marketplace', link: '/stacks/marketplace' },
            { text: 'Starter Stacks', link: '/stacks/starter-stacks' },
          ],
        },
        {
          text: 'Flows',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/flows/overview' },
            { text: 'CLI Commands', link: '/flows/cli-commands' },
            { text: 'MCP Tools', link: '/flows/mcp-tools' },
            { text: 'Creating Flows', link: '/flows/creating-flows' },
            { text: 'Best Practices', link: '/flows/best-practices' },
          ],
        },
        {
          text: 'MCP Tools',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/tools/overview' },
            {
              text: 'Documentation',
              collapsed: true,
              items: [
                { text: 'resolve-library', link: '/tools/docs/resolve-library' },
                { text: 'query-docs', link: '/tools/docs/query-docs' },
                { text: 'get-library-info', link: '/tools/docs/get-library-info' },
                { text: 'list-libraries', link: '/tools/docs/list-libraries' },
              ],
            },
            {
              text: 'Memory',
              collapsed: true,
              items: [
                { text: 'save-memory', link: '/tools/memory/save-memory' },
                { text: 'recall-memories', link: '/tools/memory/recall-memories' },
                { text: 'get-project-context', link: '/tools/memory/get-project-context' },
                { text: 'list-memories', link: '/tools/memory/list-memories' },
                { text: 'update-memory', link: '/tools/memory/update-memory' },
                { text: 'delete-memory', link: '/tools/memory/delete-memory' },
              ],
            },
            {
              text: 'Servers',
              collapsed: true,
              items: [
                { text: 'discover-servers', link: '/tools/servers/discover-servers' },
                { text: 'get-server-info', link: '/tools/servers/get-server-info' },
                { text: 'get-server-config', link: '/tools/servers/get-server-config' },
              ],
            },
          ],
        },
        {
          text: 'CLI Reference',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/cli/overview' },
            { text: 'nexus init', link: '/cli/init' },
            { text: 'nexus auth', link: '/cli/auth' },
            { text: 'nexus docs', link: '/cli/docs' },
            { text: 'nexus servers', link: '/cli/servers' },
            { text: 'nexus skills', link: '/cli/skills' },
            { text: 'nexus flow', link: '/cli/flow' },
            { text: 'nexus serve', link: '/cli/serve' },
          ],
        },
        {
          text: 'API Reference',
          collapsed: true,
          items: [
            { text: 'Overview', link: '/api/overview' },
            { text: 'Authentication', link: '/api/authentication' },
            { text: 'Rate Limits', link: '/api/rate-limits' },
            { text: 'Libraries', link: '/api/libraries' },
            { text: 'Servers', link: '/api/servers' },
            { text: 'Skills', link: '/api/skills' },
            { text: 'Memory', link: '/api/memory' },
          ],
        },
        {
          text: 'Guides',
          collapsed: true,
          items: [
            { text: 'AI Client Setup', link: '/guides/ai-clients' },
            { text: 'Project Memory', link: '/guides/project-memory' },
            { text: 'Token Savings', link: '/guides/token-savings' },
            { text: 'MCP Setup', link: '/guides/mcp-setup' },
            { text: 'Submitting Libraries', link: '/guides/submitting' },
          ],
        },
        {
          text: 'Troubleshooting',
          link: '/troubleshooting',
        },
      ],
    },

    // Social links
    socialLinks: [
      { icon: 'github', link: 'https://github.com/ryanyogan/nexus' },
      { icon: 'twitter', link: 'https://twitter.com/nexus' },
    ],

    // Search
    search: {
      provider: 'local',
      options: {
        detailedView: true,
      },
    },

    // Edit link
    editLink: {
      pattern: 'https://github.com/ryanyogan/nexus/edit/main/apps/docs/:path',
      text: 'Edit this page on GitHub',
    },

    // Footer
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright 2024-present Nexus',
    },

    // Outline (table of contents)
    outline: {
      level: [2, 3],
      label: 'On this page',
    },
  },
})
