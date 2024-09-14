// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const math = require("remark-math");
const katex = require("rehype-katex");
const lightCodeTheme = require("prism-react-renderer/themes/github");
const darkCodeTheme = require("prism-react-renderer/themes/dracula");

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Welcome to Automerge",
  tagline:
    "A cross-platform sync engine for building local-first collaborative apps.",
  url: "https://automerge.github.io",
  baseUrl: "/",
  trailingSlash: true,
  onBrokenLinks: "warn",
  onBrokenMarkdownLinks: "warn",
  favicon: "img/favicon.ico",
  organizationName: "automerge", // Usually your GitHub org/user name.
  projectName: "automerge", // Usually your repo name.

  markdown: {
    mermaid: true,
  },
  themes: ["@docusaurus/theme-mermaid", "@docusaurus/theme-live-codeblock"],

  presets: [
    [
      "@docusaurus/preset-classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
          editUrl:
            "https://github.com/automerge/automerge.github.io/edit/main/",
          remarkPlugins: [math],
          rehypePlugins: [katex],
        },
        blog: {
          showReadingTime: true,
          editUrl:
            "https://github.com/automerge/automerge.github.io/edit/main/",
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      }),
    ],
  ],

  stylesheets: [
    {
      href: "https://cdn.jsdelivr.net/npm/katex@0.13.24/dist/katex.min.css",
      type: "text/css",
      integrity:
        "sha384-odtC+0UGzzFL/6PNoE8rX/SPcQDXBJ+uRepguP4QkPCm2LBxH3FA3y+fKSiJ+AmM",
      crossorigin: "anonymous",
    },
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: "Automerge",
        logo: {
          alt: "Automerge logo",
          src: "img/automerge.png",
        },
        items: [
          {
            type: "doc",
            docId: "hello",
            position: "left",
            label: "Docs",
          },
          {
            type: "dropdown",
            label: "API Reference",
            position: "left",
            items: [
              {
                label: "JavaScript",
                href: "https://automerge.org/automerge/api-docs/js/",
              },
              {
                label: "Rust",
                href: "https://docs.rs/automerge/latest/automerge/",
              },
              {
                label: "Swift",
                href: "https://automerge.org/automerge-swift/documentation/automerge/",
              },
            ],
          },
          {
            href: "https://github.com/automerge",
            label: "GitHub",
            position: "right",
          },
        ],
      },
      footer: {
        style: "dark",
        links: [
          {
            title: "Docs",
            items: [
              {
                label: "Quick Start",
                to: "docs/quickstart",
              },
            ],
          },
          {
            title: "Community",
            items: [
              {
                label: "Discord community",
                href: "https://discord.gg/zKGe4DCfgR",
              },
              {
                label: "Ink & Switch",
                href: "https://inkandswitch.com",
              },
            ],
          },
          {
            title: "More",
            items: [
              {
                label: "Blog",
                to: "blog",
              },
              {
                label: "GitHub",
                href: "https://github.com/automerge/automerge",
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Automerge contributors. Built with Docusaurus.`,
      },
      metadata: [
        { name: "title", content: "Automerge" },
        {
          name: "keywords",
          content: "documentation, local-first, crdt, offline-first, automerge",
        },
        {
          name: "description",
          content:
            "Automerge is a toolkit for building collaborative, local-first applications.",
        },
      ],
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
