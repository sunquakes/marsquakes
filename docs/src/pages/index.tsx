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

type Feature = {
  title: ReactNode;
  description: ReactNode;
};

const features: Feature[] = [
  {
    title: (
      <Translate id="home.feature.selective.title">Pick your platforms</Translate>
    ),
    description: (
      <Translate id="home.feature.selective.description">
        mars create asks which targets you need and copies only those. Skipped
        platforms never land in the generated repository.
      </Translate>
    ),
  },
  {
    title: (
      <Translate id="home.feature.running.title">Running, not a skeleton</Translate>
    ),
    description: (
      <Translate id="home.feature.running.description">
        A Spring Boot API and a Vue 3 admin frontend that build and start out of
        the box, already wired together — not folders you still have to fill in.
      </Translate>
    ),
  },
  {
    title: (
      <Translate id="home.feature.registry.title">Single source of truth</Translate>
    ),
    description: (
      <Translate id="home.feature.registry.description">
        platforms.json declares every platform, its directory, tech stack and
        whether it is enabled. Every mars command reads it instead of
        hard-coding paths.
      </Translate>
    ),
  },
  {
    title: (
      <Translate id="home.feature.docker.title">
        Docker without a local toolchain
      </Translate>
    ),
    description: (
      <Translate id="home.feature.docker.description">
        The .build image variants compile from source inside the image, so a
        clean checkout needs neither JDK, Maven nor Node on the host.
      </Translate>
    ),
  },
  {
    title: (
      <Translate id="home.feature.update.title">Upgradeable after creation</Translate>
    ),
    description: (
      <Translate id="home.feature.update.description">
        mars update pulls later improvements to the build wiring into an
        existing project and never touches your application code.
      </Translate>
    ),
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
            <Link className="button button--primary button--lg" to="/docs/getting-started">
              <Translate id="home.hero.primaryCta">Get started</Translate>
            </Link>
            <Link className="button button--secondary button--lg" to="/docs">
              <Translate id="home.hero.secondaryCta">Read the docs</Translate>
            </Link>
          </div>
        </div>
        <HeroArt />
      </div>
    </header>
  );
}

// Explains the two navbar entries, which are split by *how you work* rather
// than by topic. Placed directly under the banner because "which of the two
// menus is mine?" is the first question the navbar raises, and the answer
// decides how much of the toolchain a reader has to install by hand.
function Paths(): ReactNode {
  return (
    <section className={styles.section}>
      <div className="container">
        <h2 className={styles.sectionTitle}>
          <Translate id="home.paths.title">Two ways to use it</Translate>
        </h2>
        <p className={styles.sectionLead}>
          <Translate id="home.paths.lead">
            The two entries in the top navigation bar are not two topics — they
            are two ways of working. Pick the one that matches how you want to
            drive the project.
          </Translate>
        </p>
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
                You describe what you want in plain language and an AI coding
                agent runs every command for you. It installs the toolchain,
                creates the project, starts the services and fixes what breaks.
                You never open a terminal to type a build command yourself —
                each page is a prompt you copy, paste, and then check against
                the expected result.
              </Translate>
            </p>
            <Link className={styles.pathCardLink} to="/docs/ai-setup-agent">
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
                You run the commands yourself. This track is the reference: the
                full mars command surface, what each platform contains, how
                platforms.json is structured, and the Docker variants. Useful
                when you already know the stack, or when you want to understand
                what the agent did on your behalf.
              </Translate>
            </p>
            <Link className={styles.pathCardLink} to="/docs/getting-started">
              <Translate id="home.paths.manual.cta">
                Start with the Guide →
              </Translate>
            </Link>
          </div>
        </div>
        <p className={styles.sectionLead}>
          <Translate id="home.paths.beginner">
            New to development? Take the AI Guide. It assumes no prior
            experience with Java, Vue, Docker or Rust — the agent installs
            what is missing, and a full admin system with a login page, user
            management and permissions is something you can reach by following
            prompts rather than by writing code.
          </Translate>
        </p>
      </div>
    </section>
  );
}

function QuickStart(): ReactNode {
  return (
    <section className={clsx(styles.section, styles.sectionAlt)}>
      <div className="container">
        <h2 className={styles.sectionTitle}>
          <Translate id="home.quickstart.title">Quick start</Translate>
        </h2>
        <p className={styles.sectionLead}>
          <Translate id="home.quickstart.lead">
            Node 18 or newer and pnpm are the only prerequisites. mars create
            prompts you for the platforms; native targets bring their own
            toolchains when you enable them.
          </Translate>
        </p>
        <div className={styles.codeBlock}>
          <CodeBlock language="bash">{quickStart}</CodeBlock>
        </div>
        <p className={styles.sectionLead}>
          <Translate id="home.quickstart.next">
            Need the full matrix of platforms, Docker variants and CLI flags?
          </Translate>{' '}
          <Link to="/docs/getting-started">
            <Translate id="home.quickstart.nextLink">
              Continue in Getting Started
            </Translate>
          </Link>
          .
        </p>
      </div>
    </section>
  );
}

function Features(): ReactNode {
  return (
    <section className={clsx(styles.section, styles.sectionAlt)}>
      <div className="container">
        <h2 className={styles.sectionTitle}>
          <Translate id="home.features.title">Why a generator</Translate>
        </h2>
        <div className={styles.featureGrid}>
          {features.map((feature, index) => (
            <div className={clsx('card', styles.featureCard)} key={index}>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureDescription}>{feature.description}</p>
            </div>
          ))}
        </div>
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
        <Features />
      </main>
    </Layout>
  );
}
