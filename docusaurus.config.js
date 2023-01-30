// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
    title: 'Automerge CRDT',
    tagline: 'Automerge is a library of data structures for building collaborative applications.',
    url: 'https://automerge.github.io',
    baseUrl: '/',
    trailingSlash: true,
    onBrokenLinks: 'warn',
    onBrokenMarkdownLinks: 'warn',
    favicon: 'img/favicon.ico',
    organizationName: 'automerge', // Usually your GitHub org/user name.
    projectName: 'automerge', // Usually your repo name.

    presets: [
        [
            '@docusaurus/preset-classic',
            /** @type {import('@docusaurus/preset-classic').Options} */
            ({
                docs: {
                    sidebarPath: require.resolve('./sidebars.js'),
                    editUrl: 'https://github.com/automerge/automerge.github.io/edit/main/',
                },
                blog: {
                    showReadingTime: true,
                    editUrl: 'https://github.com/automerge/automerge.github.io/edit/main/',
                },
                theme: {
                    customCss: require.resolve('./src/css/custom.css'),
                },
            }),
        ],
    ],

    themeConfig:
        /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
        ({
            navbar: {
                title: 'Automerge',
                logo: {
                    alt: 'Automerge logo',
                    src: 'img/automerge.png',
                },
                items: [
                    {
                        type: 'doc',
                        docId: 'hello',
                        position: 'left',
                        label: 'Docs',
                    },
                    {
                        href: 'https://github.com/automerge',
                        label: 'GitHub',
                        position: 'right',
                    },
                ],
            },
            footer: {
                style: 'dark',
                links: [
                    {
                        title: 'Docs',
                        items: [
                            {
                                label: 'Tutorial',
                                to: 'docs/tutorial/introduction',
                            },
                        ],
                    },
                    {
                        title: 'Community',
                        items: [
                            {
                                label: 'Slack community',
                                href: 'https://join.slack.com/t/automerge/shared_invite/zt-e4p3760n-kKh7r3KRH1YwwNfiZM8ktw',
                            },
                            {
                                label: 'Ink & Switch',
                                href: 'https://inkandswitch.com'
                            },
                        ],
                    },
                    {
                        title: 'More',
                        items: [
                            {
                                label: 'Blog',
                                to: 'blog',
                            },
                            {
                                label: 'GitHub',
                                href: 'https://github.com/automerge/automerge',
                            },
                        ],
                    },
                ],
                copyright: `Copyright © ${new Date().getFullYear()} Automerge contributors. Built with Docusaurus.`
            },
            metadata: [
                { name: 'title', content: 'Automerge'}, 
                { name: 'keywords', content: 'documentation, local-first, crdt, offline-first, automerge' },
                { name: 'description', content: 'Automerge is a library for building collaborative, local-first applications.' }
            ],
            prism: {
                theme: lightCodeTheme,
                darkTheme: darkCodeTheme,
            },
        }),
    plugins: [
        [
            "docusaurus-plugin-typedoc",
            {
                entryPoints: ["./automerge/javascript/src/index.ts"],
                tsconfig: "./automerge/javascript/config/declonly.json",
                readme: "none",
                out: "tsapi",
                sidebar: {
                    categoryLabel: "API Docs",
                    position: 6,
                    indexLabel: "Overview"
                }
            }
        ]
    ]
};

module.exports = config;
