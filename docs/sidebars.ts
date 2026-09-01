import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

// Sidebars are declared explicitly rather than auto-generated, so that adding a
// page to `docs/content/` is always a deliberate publishing decision.
const sidebars: SidebarsConfig = {
  guideSidebar: [
    'intro',
    'getting-started',
    'cli',
    'platforms',
    'docker',
    'conventions',
  ],
};

export default sidebars;
