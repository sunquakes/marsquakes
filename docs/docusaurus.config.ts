import type * as Preset from '@docusaurus/preset-classic';
import type { Config } from '@docusaurus/types';
import { themes as prismThemes } from 'prism-react-renderer';

// Published Markdown lives in `docs/content/`, kept in its own subdirectory so
// that the site configuration (config, sidebars, src, static, i18n) never mixes
// with the pages. Internal design documents are NOT here — they live in the
// repository-level `.docs/` folder and are never published.
const CONTENT_DIR = './content';

const config: Config = {
  title: 'Marsquakes',
  tagline: 'A multi-platform monorepo driven by a single platforms.json',
  favicon: 'img/favicon.svg',

  // Served from the custom domain `marsquakes.cc` on GitHub Pages.
  //
  // `baseUrl` is `/` because a custom domain serves the site from the domain
  // root (`/docs/cli`, not `/marsquakes/docs/cli`). The same is true of a
  // `<org>.github.io` user site. If this is ever published as a GitHub Pages
  // *project* site instead, the pages live under the repository name and
  // `baseUrl` must become `/marsquakes/` again — otherwise every asset and
  // link resolves one level too high and the site renders unstyled.
  //
  // The domain is also declared in `static/CNAME`, which GitHub Pages reads on
  // every deploy. Changing `url` here without changing that file only fixes the
  // absolute URLs in sitemap and metadata, while the deploy itself drops the
  // custom domain.
  url: 'https://marsquakes.cc',
  baseUrl: '/',

  // The repository stays under the `sunquakes` organisation; only the public
  // domain differs. `editUrl` and the GitHub links therefore keep pointing
  // there.
  organizationName: 'sunquakes',
  projectName: 'marsquakes',

  onBrokenLinks: 'throw',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'zh-Hans'],
    localeConfigs: {
      en: { label: 'English' },
      'zh-Hans': { label: '简体中文' },
    },
  },

  presets: [
    [
      'classic',
      {
        docs: {
          path: CONTENT_DIR,
          // `/` is taken by the standalone landing page in `src/pages/index.tsx`,
          // so every published page is served under the `/docs` prefix.
          routeBasePath: '/docs',
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/sunquakes/marsquakes/tree/main/docs/content/',
          showLastUpdateTime: true,
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/social-card.svg',
    navbar: {
      title: 'Marsquakes',
      logo: {
        alt: 'Marsquakes logo',
        src: 'img/logo.svg',
      },
      items: [
        // Two entries, one per sidebar in `sidebars.ts`. They are split by
        // audience: "AI Guide" is for someone driving the repository through a
        // coding agent, "Guide" for a person running the commands by hand.
        //
        // AI Guide comes first because it is the intended default path: the
        // agent installs the toolchain, so a reader who starts there types far
        // fewer commands than one who starts in the manual guide.
        {
          type: 'docSidebar',
          sidebarId: 'aiSidebar',
          position: 'left',
          label: 'AI Guide',
        },
        {
          type: 'docSidebar',
          sidebarId: 'guideSidebar',
          position: 'left',
          label: 'Guide',
        },
        { type: 'localeDropdown', position: 'right' },
        {
          href: 'https://github.com/sunquakes/marsquakes',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'AI',
          items: [
            { label: 'Environment Setup', to: '/docs/ai-setup-agent' },
            { label: 'Admin System', to: '/docs/ai-admin-env' },
            { label: 'Desktop App', to: '/docs/ai-desktop-env' },
          ],
        },
        {
          title: 'Docs',
          items: [
            { label: 'Introduction', to: '/docs' },
            { label: 'Getting Started', to: '/docs/getting-started' },
            { label: 'Docker', to: '/docs/docker' },
          ],
        },
        {
          title: 'Reference',
          items: [
            { label: 'Platforms', to: '/docs/platforms' },
            { label: 'CLI', to: '/docs/cli' },
            { label: 'Conventions', to: '/docs/conventions' },
          ],
        },
        {
          title: 'More',
          items: [
            { label: 'GitHub', href: 'https://github.com/sunquakes/marsquakes' },
            { label: 'License', href: 'https://www.apache.org/licenses/LICENSE-2.0' },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Shing Rui. Licensed under Apache-2.0.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json', 'yaml', 'docker', 'java', 'kotlin', 'swift', 'rust'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
