import Link from '@docusaurus/Link';
import Translate, { translate } from '@docusaurus/Translate';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import CodeBlock from '@theme/CodeBlock';
import Layout from '@theme/Layout';
import clsx from 'clsx';
import type { ReactNode } from 'react';

import styles from './index.module.css';

// Every user-facing string goes through `<Translate>` / `translate()` so that
// `pnpm -C docs write-translations` can extract it into
// `i18n/<locale>/code.json`. Never hard-code prose here.

// The platform matrix mirrors the table in `content/platforms.md`. When the
// docs page adds, removes or reclassifies a target, update this list too —
// the landing page is a summary of that single source of truth, not a second
// opinion on what is ready.
type PlatformTarget = {
  icon: string;
  nameKey: string;
  name: string;
  stackKey?: string;
  stack?: string;
  ready: boolean;
};

const platformTargets: PlatformTarget[] = [
  {
    icon: '🔌',
    nameKey: 'home.platform.api.name',
    name: 'API',
    stackKey: 'home.platform.api.stack',
    stack: 'JeecgBoot / Spring Boot',
    ready: true,
  },
  {
    icon: '🖥️',
    nameKey: 'home.platform.admin.name',
    name: 'Web Admin',
    stackKey: 'home.platform.admin.stack',
    stack: 'Vue 3 + Vite',
    ready: true,
  },
  {
    icon: '🧩',
    nameKey: 'home.platform.desktop.name',
    name: 'Desktop',
    stackKey: 'home.platform.desktop.stack',
    stack: 'Tauri + React + Rust',
    ready: true,
  },
  {
    icon: '🤖',
    nameKey: 'home.platform.android.name',
    name: 'Android',
    stackKey: 'home.platform.android.stack',
    stack: 'Kotlin + Jetpack Compose',
    ready: false,
  },
  {
    icon: '📱',
    nameKey: 'home.platform.ios.name',
    name: 'iOS',
    stackKey: 'home.platform.ios.stack',
    stack: 'Swift + SwiftUI',
    ready: false,
  },
  {
    icon: '🌐',
    nameKey: 'home.platform.web.name',
    name: 'Web',
    ready: false,
  },
  {
    icon: '🪟',
    nameKey: 'home.platform.windows.name',
    name: 'Windows',
    ready: false,
  },
  {
    icon: '🐧',
    nameKey: 'home.platform.linux.name',
    name: 'Linux',
    ready: false,
  },
  {
    icon: '🍎',
    nameKey: 'home.platform.macos.name',
    name: 'macOS',
    ready: false,
  },
];

const quickStart = `pnpm add -g @marsquakes/cli
mars create my-app
cd my-app
pnpm install
mars dev`;

// The seismograph trace, shared by the static stroke and the travelling pulse
// drawn on top of it. Kept in one constant so the two can never drift apart.
const TRACE = 'M2 62 H30 l7 -19 l10 36 l8 -27 l6 10 h51';

// Banner artwork: the same Mars-plus-seismograph mark as the logo, redrawn at
// banner scale so it can carry the animation. Purely decorative, hence
// `aria-hidden` — the heading next to it already names the project.
function HeroArt(): ReactNode {
  return (
    <svg
      className={styles.heroArt}
      viewBox="0 0 114 124"
      role="presentation"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="mq-hero-surface" cx="34%" cy="28%" r="80%">
          <stop offset="0%" stopColor="#e4705a" />
          <stop offset="58%" stopColor="#b3312c" />
          <stop offset="100%" stopColor="#71201b" />
        </radialGradient>
        <clipPath id="mq-hero-disc">
          <circle cx="57" cy="62" r="46" />
        </clipPath>
      </defs>

      <g className={styles.heroPlanet}>
        <circle cx="57" cy="62" r="46" fill="url(#mq-hero-surface)" />
        <g clipPath="url(#mq-hero-disc)" fill="#8a2621" opacity="0.5">
          <ellipse cx="80" cy="82" rx="11" ry="9" />
          <ellipse cx="30" cy="80" rx="6.5" ry="5.5" />
          <circle cx="74" cy="34" r="5.4" />
          <circle cx="32" cy="35" r="4.4" />
        </g>
      </g>

      {/* Shockwaves radiating from the epicentre, fired one beat apart. */}
      <g fill="none" stroke="#fff1ef" strokeWidth="1.6">
        <circle className={styles.heroRing} cx="37" cy="43" r="16" />
        <circle
          className={clsx(styles.heroRing, styles.heroRingLate)}
          cx="37"
          cy="43"
          r="16"
        />
      </g>

      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d={TRACE} stroke="#fff1ef" strokeWidth="3" opacity="0.32" />
        <path
          className={styles.heroPulse}
          d={TRACE}
          pathLength="100"
          stroke="#fff1ef"
          strokeWidth="3.4"
        />
      </g>

      <circle className={styles.heroCore} cx="37" cy="43" r="6" fill="#fff1ef" />
      <circle cx="37" cy="43" r="2.4" fill="#b3312c" />
    </svg>
  );
}

function Hero(): ReactNode {
  const { siteConfig } = useDocusaurusContext();

  return (
    <header className={styles.hero}>
      <div className={clsx('container', styles.heroInner)}>
        <div>
          <h1 className={styles.heroTitle}>{siteConfig.title}</h1>
          <p className={styles.heroTagline}>
            <Translate id="home.hero.tagline">
              An npm package that scaffolds multi-platform monorepos. Install
              it once, run mars create, pick the platforms you need — and get a
              backend API, an admin frontend, desktop and mobile clients
              already wired together.
            </Translate>
          </p>
          <div className={styles.heroActions}>
            <Link className="button button--primary button--lg" to="/docs/">
              <Translate id="home.hero.primaryCta">Read the Introduction</Translate>
            </Link>
            <Link
              className="button button--secondary button--lg"
              to="https://github.com/sunquakes/marsquakes"
            >
              <Translate id="home.hero.secondaryCta">View on GitHub</Translate>
            </Link>
          </div>
        </div>
        <HeroArt />
      </div>
    </header>
  );
}

// The two navbar entries are split by *how you work* rather than by topic:
// the AI Guide versus the manual Guide.
function Paths(): ReactNode {
  return (
    <section className={styles.section}>
      <div className="container">
        <h2 className={styles.sectionTitle}>
          <Translate id="home.paths.title">Two ways to use it</Translate>
        </h2>
        <div className={styles.pathGrid}>
          <div
            className={clsx(styles.pathCard, styles.pathCardRecommended)}
            data-badge={translate({
              id: 'home.paths.ai.badge',
              message: 'No coding needed',
            })}
          >
            <div className={styles.pathCardIcon} aria-hidden="true">
              🤖
            </div>
            <h3 className={styles.pathCardTitle}>
              <Translate id="home.paths.ai.title">AI Guide</Translate>
            </h3>
            <p className={styles.pathCardBody}>
              <Translate id="home.paths.ai.description">
                You do not write code. Say what you want in plain language; the
                agent installs the tools, creates the project and runs every
                command. Each page is a prompt to paste and a result to check.
              </Translate>
            </p>
            <Link
              className="button button--primary button--lg"
              to="/docs/ai-setup-agent"
            >
              <Translate id="home.paths.ai.cta">
                Start with the AI Guide →
              </Translate>
            </Link>
          </div>

          <div className={styles.pathCard}>
            <div className={styles.pathCardIcon} aria-hidden="true">
              ⌨️
            </div>
            <h3 className={styles.pathCardTitle}>
              <Translate id="home.paths.manual.title">Guide</Translate>
            </h3>
            <p className={styles.pathCardBody}>
              <Translate id="home.paths.manual.description">
                You run the commands yourself. Clear numbered steps take you
                from installing the CLI to developing and deploying each
                platform, with the full command reference at the end.
              </Translate>
            </p>
            <Link
              className="button button--secondary button--lg"
              to="/docs/install"
            >
              <Translate id="home.paths.manual.cta">
                Start with the Guide →
              </Translate>
            </Link>
          </div>
        </div>
        <div className={styles.beginnerNote}>
          <span className={styles.beginnerIcon} aria-hidden="true">
            💡
          </span>
          <p>
            <Translate id="home.paths.beginner">
              New to development? Take the AI Guide — no Java, Vue, Docker or
              Rust experience needed. You follow prompts, not code.
            </Translate>
          </p>
        </div>
      </div>
    </section>
  );
}

type QuickStartStep = {
  title: ReactNode;
  description: ReactNode;
};

const quickStartSteps: QuickStartStep[] = [
  {
    title: (
      <Translate id="home.quickstart.step1.title">Install the tool</Translate>
    ),
    description: (
      <Translate id="home.quickstart.step1.description">
        Get pnpm, then install the mars CLI once, globally.
      </Translate>
    ),
  },
  {
    title: (
      <Translate id="home.quickstart.step2.title">Create your project</Translate>
    ),
    description: (
      <Translate id="home.quickstart.step2.description">
        mars create asks which platforms you need and copies only those.
      </Translate>
    ),
  },
  {
    title: (
      <Translate id="home.quickstart.step3.title">Move into it</Translate>
    ),
    description: (
      <Translate id="home.quickstart.step3.description">
        Every later command runs from inside the new project folder.
      </Translate>
    ),
  },
  {
    title: (
      <Translate id="home.quickstart.step4.title">
        Install what it needs
      </Translate>
    ),
    description: (
      <Translate id="home.quickstart.step4.description">
        One pnpm install sets up the whole workspace at once.
      </Translate>
    ),
  },
  {
    title: (
      <Translate id="home.quickstart.step5.title">Start developing</Translate>
    ),
    description: (
      <Translate id="home.quickstart.step5.description">
        mars dev starts every enabled platform; native targets bring their own
        toolchains when enabled.
      </Translate>
    ),
  },
];

function QuickStart(): ReactNode {
  return (
    <section className={clsx(styles.section, styles.sectionAlt)}>
      <div className="container">
        <h2 className={styles.sectionTitle}>
          <Translate id="home.quickstart.title">Quick start</Translate>
        </h2>
        <div className={styles.quickGrid}>
          <div>
            <p className={styles.quickLead}>
              <Translate id="home.quickstart.lead">
                Node 22.12.0 or newer and pnpm are the only prerequisites. Five
                commands take you from nothing to a running project.
              </Translate>
            </p>
            <ol className={styles.stepList}>
              {quickStartSteps.map((step, index) => (
                <li className={styles.stepItem} key={index}>
                  <span className={styles.stepNumber} aria-hidden="true">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className={styles.stepTitle}>{step.title}</h3>
                    <p className={styles.stepDescription}>
                      {step.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
            <p className={styles.quickFootnote}>
              <Translate id="home.quickstart.next">
                Need the full matrix of platforms, Docker variants and CLI
                flags?
              </Translate>{' '}
              <Link to="/docs/install">
                <Translate id="home.quickstart.nextLink">
                  Continue with Environment Setup
                </Translate>
              </Link>
              .
            </p>
          </div>
          <div className={styles.terminal}>
            <div className={styles.terminalBar}>
              <span className={styles.terminalDots} aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <span className={styles.terminalLabel}>bash</span>
            </div>
            <CodeBlock language="bash">{quickStart}</CodeBlock>
          </div>
        </div>
      </div>
    </section>
  );
}

function Platforms(): ReactNode {
  return (
    <section className={styles.section}>
      <div className="container">
        <h2 className={styles.sectionTitle}>
          <Translate id="home.platforms.title">One scaffold, every target</Translate>
        </h2>
        <p className={styles.sectionLead}>
          <Translate id="home.platforms.lead">
            Every platform mars can generate, in the one monorepo. Tick the
            targets you need; mars create copies only those and mars init
            derives the toolchain each one needs.
          </Translate>
        </p>
        <ul className={styles.platformGrid}>
          {platformTargets.map((target) => (
            <li
              className={clsx(
                'card',
                styles.platformCard,
                target.ready && styles.platformCardReady,
              )}
              key={target.nameKey}
            >
              <span className={styles.platformIcon} aria-hidden="true">
                {target.icon}
              </span>
              <span className={styles.platformMeta}>
                <h3 className={styles.platformName}>
                  <Translate id={target.nameKey}>{target.name}</Translate>
                </h3>
                {target.stackKey ? (
                  <span className={styles.platformStack}>
                    <Translate id={target.stackKey}>{target.stack}</Translate>
                  </span>
                ) : null}
              </span>
              <span
                className={clsx(
                  styles.platformBadge,
                  target.ready
                    ? styles.platformBadgeReady
                    : styles.platformBadgeSoon,
                )}
              >
                {target.ready ? (
                  <Translate id="home.platforms.ready">Ready</Translate>
                ) : (
                  <Translate id="home.platforms.scaffold">Scaffold only</Translate>
                )}
              </span>
            </li>
          ))}
        </ul>
        <p className={styles.platformFootnote}>
          <Translate id="home.platforms.footnote">
            "Ready" builds and runs out of the box today; "Scaffold only"
            reserves the structure for you.
          </Translate>{' '}
          <Link to="/docs/platforms">
            <Translate id="home.platforms.footnoteLink">
              See the full platform matrix
            </Translate>
          </Link>
          .
        </p>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();

  return (
    <Layout
      title={translate({
        id: 'home.meta.title',
        message: 'Home',
      })}
      description={siteConfig.tagline}
    >
      <Hero />
      <main>
        <Paths />
        <QuickStart />
        <Platforms />
      </main>
    </Layout>
  );
}
