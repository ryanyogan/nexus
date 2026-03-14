import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebars: SidebarsConfig = {
  docs: [
    "intro",
    "quick-start",
    {
      type: "category",
      label: "Getting Started",
      collapsed: false,
      link: {
        type: "generated-index",
        title: "Getting Started",
        description: "Get up and running with Nexus in minutes",
      },
      items: [
        "getting-started/installation",
        "getting-started/cli-quickstart",
      ],
    },
    {
      type: "category",
      label: "Common Tasks",
      link: {
        type: "doc",
        id: "common-tasks/index",
      },
      items: [
        "common-tasks/add-to-claude",
        "common-tasks/add-to-cursor",
        "common-tasks/add-to-vscode",
        "common-tasks/query-docs",
        "common-tasks/save-context",
        "common-tasks/find-servers",
      ],
    },
    {
      type: "category",
      label: "Guides",
      link: {
        type: "generated-index",
        title: "Guides",
        description: "Learn how to get the most out of Nexus",
      },
      items: [
        "guides/ai-clients",
        "guides/memory-best-practices",
        "guides/token-savings",
        "guides/project-memory",
        "guides/mcp-setup",
        "guides/submitting",
      ],
    },
    {
      type: "category",
      label: "CLI Reference",
      link: {
        type: "doc",
        id: "cli/index",
      },
      items: [
        "cli/init",
        "cli/auth",
        "cli/docs",
        "cli/skills",
        "cli/servers",
        "cli/serve",
        "cli/configuration",
      ],
    },
    {
      type: "category",
      label: "MCP Tools",
      link: {
        type: "doc",
        id: "mcp-tools/index",
      },
      items: [
        {
          type: "category",
          label: "Documentation",
          items: [
            "mcp-tools/resolve-library",
            "mcp-tools/query-docs",
            "mcp-tools/get-library-info",
            "mcp-tools/list-libraries",
          ],
        },
        {
          type: "category",
          label: "Memory",
          items: [
            "mcp-tools/save-memory",
            "mcp-tools/recall-memories",
            "mcp-tools/get-project-context",
            "mcp-tools/list-memories",
            "mcp-tools/update-memory",
            "mcp-tools/delete-memory",
          ],
        },
        {
          type: "category",
          label: "Server Registry",
          items: [
            "mcp-tools/discover-servers",
            "mcp-tools/get-server-info",
            "mcp-tools/get-server-config",
          ],
        },
      ],
    },
    {
      type: "category",
      label: "REST API",
      link: {
        type: "doc",
        id: "api/index",
      },
      items: [
        "api/authentication",
        "api/rate-limits",
        "api/libraries",
        "api/servers",
        "api/skills",
        "api/memory",
      ],
    },
    {
      type: "category",
      label: "SDK",
      link: {
        type: "doc",
        id: "sdk/index",
      },
      items: ["sdk/installation", "sdk/examples"],
    },
    "troubleshooting",
  ],
};

export default sidebars;
