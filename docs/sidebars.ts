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
// Both sidebars open with an Introduction and then present the same
// three-stage journey — environment setup, start a project, then run/build
// the application — but in the vocabulary each audience needs.
//
// `guideSidebar` mirrors `aiSidebar` exactly: `intro` and the start step stay
// bare top-level entries, after which the Applications category splits by
// platform, and every platform opens into the same three sub-pages —
// Environment, Develop and Deploy. The platform is the one thing that decides
// the commands, and inside a platform those three are the lifecycle stages.
// The deep material the journey references (CLI, platforms.json) is parked in
// Reference at the bottom, out of the way of someone doing the journey once.
// docker.md and conventions.md stay published — the footer and the guide pages
// link to them — but they are deliberately absent from the sidebar.
//
// `aiSidebar` is the same journey without shell commands: install the agent,
// install the skill, read how the working style differs, then start a project.
// The agent must come before the skill — the skill is a bundle of instructions
// handed to an agent that does not exist yet. `ai-start` is a bare top-level
// entry rather than a one-item category, because a category of one renders as a
// folder the reader has to open to find its only child. After that the
// Applications category splits by platform.
//
// Category labels are user-facing strings, so each one generates an i18n key
// (`sidebar.<sidebarId>.category.<Label>`) in
// `i18n/zh-Hans/docusaurus-plugin-content-docs/current.json`. Renaming a label
// orphans its translation, which then silently falls back to English.
//
// `sidebar_position` in a page's frontmatter is ignored here — an explicit
// sidebar takes its order from these arrays.
const sidebars: SidebarsConfig = {
  guideSidebar: [
    'intro',
    'install',
    'create-project',
    {
      type: 'category',
      label: 'Applications',
      collapsed: false,
      items: [
        {
          type: 'category',
          label: 'Admin System',
          collapsed: false,
          items: [
            'guide-admin-env',
            'guide-admin-develop',
            'guide-admin-deploy',
          ],
        },
        {
          type: 'category',
          label: 'Desktop',
          collapsed: false,
          items: [
            'guide-desktop-env',
            'guide-desktop-develop',
            'guide-desktop-deploy',
          ],
        },
        {
          type: 'category',
          label: 'Android',
          collapsed: false,
          items: [
            'guide-android-env',
            'guide-android-develop',
            'guide-android-deploy',
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'Reference',
      collapsed: false,
      items: ['cli', 'platforms'],
    },
  ],

  aiSidebar: [
    'ai-intro',
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
    'ai-start',
    {
      type: 'category',
      label: 'Applications',
      collapsed: false,
      items: [
        {
          type: 'category',
          label: 'Admin System',
          collapsed: false,
          items: [
            'ai-admin-project',
            'ai-admin-module',
            'ai-admin-deploy',
          ],
        },
        {
          type: 'category',
          label: 'Desktop App',
          collapsed: false,
          items: [
            'ai-desktop-project',
            'ai-desktop-module',
            'ai-desktop-deploy',
          ],
        },
        {
          type: 'category',
          label: 'Android App',
          collapsed: false,
          items: [
            'ai-android-project',
            'ai-android-module',
            'ai-android-deploy',
          ],
        },
      ],
    },
  ],
};

export default sidebars;
