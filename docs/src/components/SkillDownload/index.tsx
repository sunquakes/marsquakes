import Translate, { translate } from '@docusaurus/Translate';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { LuDownload } from 'react-icons/lu';
import type { ReactNode } from 'react';

import { archive } from './archive';
import styles from './styles.module.css';

// A click-to-download button for the packaged skill, used from both locales of
// `ai-setup.md`. It replaces a bare `<a href="/skills/..." download>` link,
// which had three problems this component fixes:
//
//   1. The href was absolute and hand-written, so it would silently 404 if
//      `baseUrl` ever stopped being `/`. `onBrokenLinks: 'throw'` does not
//      inspect raw HTML hrefs, so nothing would catch it. `useBaseUrl` resolves
//      the path against the configured `baseUrl` instead.
//   2. The size was a hand-typed literal, duplicated per locale, and had gone
//      stale (it read "17 KiB" for an 18.1 KiB archive). It now comes from
//      `archive.ts`, which `scripts/pack-skill.js` regenerates on every build.
//   3. A text link gave no affordance that this is the primary action of the
//      page.
//
// Every string goes through `<Translate>` / `translate()` so it is extracted
// into `i18n/<locale>/code.json` — the file that owns component strings. Do not
// hard-code prose here, and do not pass it in as props from MDX: keeping the
// copy in one place is what stops the two locales from drifting apart.

// `download` is intentionally left as a bare attribute rather than
// `download={archive.name}`. The archive is served from `static/`, so it is
// same-origin and the browser already takes the filename from the URL; naming
// it again would be a second place to keep in sync.
export default function SkillDownload(): ReactNode {
  return (
    <div className={styles.card}>
      <a
        className={styles.button}
        href={useBaseUrl(archive.path)}
        download
        aria-label={translate(
          {
            id: 'skillDownload.button.ariaLabel',
            message: 'Download {name} ({size})',
            description:
              'Accessible label for the skill download button; includes the file name and size',
          },
          { name: archive.name, size: archive.size },
        )}
      >
        <LuDownload className={styles.icon} aria-hidden="true" />
        <span className={styles.label}>
          <Translate
            id="skillDownload.button.label"
            description="Main label on the skill download button"
          >
            Download the skill
          </Translate>
        </span>
      </a>

      <div className={styles.meta}>
        <code className={styles.filename}>{archive.name}</code>
        <span className={styles.size}>{archive.size}</span>
      </div>
    </div>
  );
}
