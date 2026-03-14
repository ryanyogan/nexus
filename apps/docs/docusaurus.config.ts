import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

const config: Config = {
  title: "Nexus",
  tagline: "The missing brain in your AI workflow",
  favicon: "img/favicon.ico",

  url: "https://docs.nexus.yogan.dev",
  baseUrl: "/",

  organizationName: "ryanyogan",
  projectName: "nexus",

  onBrokenLinks: "warn",
  onBrokenMarkdownLinks: "warn",

  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  // Enable Rspack for faster builds
  future: {
    experimental_faster: {
      swcJsLoader: true,
      swcJsMinimizer: true,
      swcHtmlMinimizer: true,
      lightningCssMinimizer: true,
      rspackBundler: true,
      mdxCrossCompilerCache: true,
    },
  },

  presets: [
    [
      "classic",
      {
        docs: {
          routeBasePath: "/", // Docs at root
          sidebarPath: "./sidebars.ts",
          editUrl: "https://github.com/ryanyogan/nexus/tree/main/apps/docs/",
        },
        blog: false, // Disable blog
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: "img/social-card.png",
    colorMode: {
      defaultMode: "light",
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: "Nexus",
      logo: {
        alt: "Nexus Logo",
        src: "img/logo.svg",
        srcDark: "img/logo-dark.svg",
        href: "/intro",
      },
      items: [
        {
          type: "docSidebar",
          sidebarId: "docs",
          position: "left",
          label: "Docs",
        },
        {
          href: "https://nexus.yogan.dev",
          label: "App",
          position: "right",
        },
        {
          href: "https://github.com/ryanyogan/nexus",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "light",
      links: [
        {
          title: "Documentation",
          items: [
            { label: "Getting Started", to: "/getting-started/installation" },
            { label: "CLI Reference", to: "/cli/" },
            { label: "MCP Tools", to: "/mcp-tools/" },
          ],
        },
        {
          title: "Resources",
          items: [
            { label: "REST API", to: "/api/" },
            { label: "SDK", to: "/sdk/" },
            { label: "Guides", to: "/guides/ai-clients" },
          ],
        },
        {
          title: "Links",
          items: [
            { label: "Web App", href: "https://nexus.yogan.dev" },
            { label: "GitHub", href: "https://github.com/ryanyogan/nexus" },
          ],
        },
      ],
      copyright: `© ${new Date().getFullYear()} Nexus`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.nightOwl,
      additionalLanguages: ["bash", "json", "typescript", "jsx", "tsx"],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
