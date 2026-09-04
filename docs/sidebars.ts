import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

// Sidebars are declared explicitly rather than auto-generated, so that adding a
// page to `docs/content/` is always a deliberate publishing decision.
//
// There are two of them, and they are split by *who reads the page*, not by
// topic. `guideSidebar` is written for a person typing commands; `aiSidebar` is
// written for someone driving the repository through an AI coding agent. Each
// one gets its own navbar entry, so the two audiences never have to scroll past
// each other's pages.
//
// A page must belong to exactly one sidebar. Listing it twice makes Docusaurus
// pick an arbitrary one for the "next/previous" footer links, which then
// contradicts the sidebar the reader actually came from.
//
// `aiSidebar` is grouped by *scenario*, and every scenario group carries its own
// environment page next to its prompts page. That duplication of shape is
// deliberate: an admin system needs Docker and a database, a desktop app needs
// Rust and no database at all, and centralising both into one setup page made
// readers install things they did not need. Only what *every* scenario requires
// — Node.js, the agent, the CLI — lives in the first group.
//
// Category labels are user-facing strings, so each one generates an i18n key
// (`sidebar.aiSidebar.category.<Label>`) in
// `i18n/zh-Hans/docusaurus-plugin-content-docs/current.json`. Renaming a label
// orphans its translation, which then silently falls back to English.
//
// `sidebar_position` in a page's frontmatter is ignored here — an explicit
// sidebar takes its order from these arrays.
const sidebars: SidebarsConfig = {
  guideSidebar: [
    'intro',
    'getting-started',
    'cli',
    'platforms',
    'docker',
    'conventions',
  ],

  aiSidebar: [
    {
      type: 'category',
      label: 'Environment Setup',
      collapsed: false,
      items: [
        'ai-setup-agent',
        'ai-setup',
        'ai-agents',
      ],
    },
    {
      type: 'category',
      label: 'Admin System',
      collapsed: false,
      items: [
        'ai-admin-env',
        'ai-admin-prompts',
      ],
    },
    {
      type: 'category',
      label: 'Desktop App',
      collapsed: false,
      items: [
        'ai-desktop-env',
        'ai-desktop-prompts',
      ],
    },
  ],
};

export default sidebars;
