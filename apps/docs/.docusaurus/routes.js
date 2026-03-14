import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/',
    component: ComponentCreator('/', '4d0'),
    routes: [
      {
        path: '/',
        component: ComponentCreator('/', '053'),
        routes: [
          {
            path: '/',
            component: ComponentCreator('/', '904'),
            routes: [
              {
                path: '/api/',
                component: ComponentCreator('/api/', '1de'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/api/authentication',
                component: ComponentCreator('/api/authentication', '480'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/api/libraries',
                component: ComponentCreator('/api/libraries', 'fa0'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/api/memory',
                component: ComponentCreator('/api/memory', 'e60'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/api/rate-limits',
                component: ComponentCreator('/api/rate-limits', 'cb9'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/api/servers',
                component: ComponentCreator('/api/servers', 'edf'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/api/skills',
                component: ComponentCreator('/api/skills', 'f78'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/category/getting-started',
                component: ComponentCreator('/category/getting-started', '9fd'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/category/guides',
                component: ComponentCreator('/category/guides', 'ade'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/cli/',
                component: ComponentCreator('/cli/', '18d'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/cli/auth',
                component: ComponentCreator('/cli/auth', 'e62'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/cli/configuration',
                component: ComponentCreator('/cli/configuration', 'a8f'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/cli/docs',
                component: ComponentCreator('/cli/docs', '88e'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/cli/init',
                component: ComponentCreator('/cli/init', '072'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/cli/serve',
                component: ComponentCreator('/cli/serve', 'ca4'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/cli/servers',
                component: ComponentCreator('/cli/servers', '716'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/cli/skills',
                component: ComponentCreator('/cli/skills', 'eda'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/common-tasks/',
                component: ComponentCreator('/common-tasks/', 'a0f'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/common-tasks/add-to-claude',
                component: ComponentCreator('/common-tasks/add-to-claude', 'a18'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/common-tasks/add-to-cursor',
                component: ComponentCreator('/common-tasks/add-to-cursor', 'b03'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/common-tasks/add-to-vscode',
                component: ComponentCreator('/common-tasks/add-to-vscode', '336'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/common-tasks/find-servers',
                component: ComponentCreator('/common-tasks/find-servers', 'd0b'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/common-tasks/query-docs',
                component: ComponentCreator('/common-tasks/query-docs', 'edb'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/common-tasks/save-context',
                component: ComponentCreator('/common-tasks/save-context', '331'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/getting-started/cli-quickstart',
                component: ComponentCreator('/getting-started/cli-quickstart', '9ea'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/getting-started/installation',
                component: ComponentCreator('/getting-started/installation', '5d1'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/guides/ai-clients',
                component: ComponentCreator('/guides/ai-clients', '5bd'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/guides/mcp-setup',
                component: ComponentCreator('/guides/mcp-setup', '555'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/guides/memory-best-practices',
                component: ComponentCreator('/guides/memory-best-practices', 'f19'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/guides/project-memory',
                component: ComponentCreator('/guides/project-memory', 'a7a'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/guides/submitting',
                component: ComponentCreator('/guides/submitting', 'cfb'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/guides/token-savings',
                component: ComponentCreator('/guides/token-savings', 'e2f'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/intro',
                component: ComponentCreator('/intro', '902'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/mcp-tools/',
                component: ComponentCreator('/mcp-tools/', '03f'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/mcp-tools/delete-memory',
                component: ComponentCreator('/mcp-tools/delete-memory', 'be3'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/mcp-tools/discover-servers',
                component: ComponentCreator('/mcp-tools/discover-servers', '1a6'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/mcp-tools/get-library-info',
                component: ComponentCreator('/mcp-tools/get-library-info', 'ab1'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/mcp-tools/get-project-context',
                component: ComponentCreator('/mcp-tools/get-project-context', '73d'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/mcp-tools/get-server-config',
                component: ComponentCreator('/mcp-tools/get-server-config', '01d'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/mcp-tools/get-server-info',
                component: ComponentCreator('/mcp-tools/get-server-info', '80b'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/mcp-tools/list-libraries',
                component: ComponentCreator('/mcp-tools/list-libraries', 'bde'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/mcp-tools/list-memories',
                component: ComponentCreator('/mcp-tools/list-memories', '2c0'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/mcp-tools/query-docs',
                component: ComponentCreator('/mcp-tools/query-docs', '417'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/mcp-tools/recall-memories',
                component: ComponentCreator('/mcp-tools/recall-memories', '971'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/mcp-tools/resolve-library',
                component: ComponentCreator('/mcp-tools/resolve-library', 'a9b'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/mcp-tools/save-memory',
                component: ComponentCreator('/mcp-tools/save-memory', '46d'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/mcp-tools/update-memory',
                component: ComponentCreator('/mcp-tools/update-memory', 'f3e'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/quick-start',
                component: ComponentCreator('/quick-start', 'd05'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/sdk/',
                component: ComponentCreator('/sdk/', 'e8a'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/sdk/examples',
                component: ComponentCreator('/sdk/examples', '3b8'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/sdk/installation',
                component: ComponentCreator('/sdk/installation', '86f'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/troubleshooting',
                component: ComponentCreator('/troubleshooting', 'ab5'),
                exact: true,
                sidebar: "docs"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
