import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  integrations: [
    starlight({
      title: 'Nexus',
      description: 'Documentation Search + Persistent Memory for AI Assistants',
      logo: {
        light: './src/assets/logo-light.svg',
        dark: './src/assets/logo-dark.svg',
        replacesTitle: false,
      },
      social: {
        github: 'https://github.com/ryanyogan/nexus',
      },
      editLink: {
        baseUrl: 'https://github.com/ryanyogan/nexus/edit/main/apps/docs/',
      },
      customCss: ['./src/styles/custom.css'],
      head: [
        {
          tag: 'link',
          attrs: {
            rel: 'icon',
            href: '/favicon.ico',
          },
        },
      ],
      sidebar: [
        {
          label: 'Getting Started',
          items: [
            { label: 'Overview', link: '/' },
            { label: 'Quick Start', link: '/getting-started/' },
            { label: 'SDK', link: '/sdk/', badge: { text: 'New', variant: 'tip' } },
          ],
        },
        {
          label: 'Features',
          items: [
            { label: 'Architecture & Token Savings', link: '/features/architecture/', badge: { text: 'New', variant: 'tip' } },
            { label: 'AI Skills', link: '/features/skills/', badge: { text: 'New', variant: 'tip' } },
            { label: 'Secrets Vault', link: '/features/secrets/', badge: { text: 'New', variant: 'tip' } },
            { label: 'Mobile Terminal', link: '/mobile-terminal/' },
            { label: 'User Dashboard', link: '/features/dashboard/', badge: { text: 'New', variant: 'tip' } },
          ],
        },
        {
          label: 'MCP Tools',
          items: [
            { label: 'Overview', link: '/mcp-tools/' },
            { label: 'resolve-library', link: '/mcp-tools/resolve-library/' },
            { label: 'query-docs', link: '/mcp-tools/query-docs/' },
            { label: 'get-library-info', link: '/mcp-tools/get-library-info/' },
            { label: 'list-libraries', link: '/mcp-tools/list-libraries/' },
            { label: 'Memory Tools', link: '/mcp-tools/memory/' },
            { label: 'Server Registry', link: '/mcp-tools/servers/' },
          ],
        },
        {
          label: 'REST API',
          items: [
            { label: 'Overview', link: '/api/' },
            { label: 'Libraries', link: '/api/libraries/' },
            { label: 'Servers', link: '/api/servers/', badge: { text: 'New', variant: 'tip' } },
            { label: 'Skills', link: '/api/skills/', badge: { text: 'New', variant: 'tip' } },
            { label: 'User & Auth', link: '/api/user/', badge: { text: 'New', variant: 'tip' } },
            { label: 'Submissions', link: '/api/submissions/' },
            { label: 'Stats', link: '/api/stats/' },
          ],
        },
        {
          label: 'Tutorials',
          items: [
            { label: 'Vibe with Nexus', link: '/tutorials/vibe-with-nexus/' },
            { label: 'Build with Nexus', link: '/tutorials/build-with-nexus/' },
            { label: 'Project Memory', link: '/tutorials/project-memory/' },
            { label: 'MCP Server Setup', link: '/tutorials/mcp-server-setup/' },
          ],
        },
        {
          label: 'Guides',
          items: [
            { label: 'Using the Web UI', link: '/web-ui/' },
            { label: 'Submit a Library', link: '/submit/' },
            { label: 'Troubleshooting', link: '/troubleshooting/' },
          ],
        },
      ],
    }),
  ],
});
