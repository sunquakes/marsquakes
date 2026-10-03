<p align="center">
  <img src="https://marsquakes.cc/img/logo.svg" alt="Marsquakes logo" width="120" />
</p>

<h1 align="center">Marsquakes</h1>

**English** | [简体中文](./README.zh-CN.md)

[![npm](https://img.shields.io/npm/v/@marsquakes/cli.svg)](https://www.npmjs.com/package/@marsquakes/cli)
[![license](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](./LICENSE)

**Everyone can become a full-stack engineer.**

Marsquakes is a free tool that helps one person build a complete app and ship
it everywhere — phone, computer and web — without hiring a backend team or a
DevOps engineer. The difficult wiring is already done for you, so you can spend
your time on the product itself.

---

## What is this, in plain words?

Imagine you want to launch an online product. A "real" product usually needs
several separate pieces that specialists build by hand:

- a **server** that stores data and handles accounts,
- an **admin page** where you manage that data,
- an **Android app**, an **iPhone app**, and maybe a **desktop program**.

Getting these pieces to talk to each other normally takes a whole team.
Marsquakes hands you all of them **already connected and working together**.
You answer a few simple questions ("Do you need Android? Desktop?") and it puts
together a ready-to-run project containing only what you asked for.

You do not need to understand servers, databases or build systems to start.

## Who is it for?

- **Founders and solo makers** who want to validate an idea fast.
- **Designers and product people** who can describe what they want and let an AI
  coding assistant build it.
- **Students and beginners** learning how a full product fits together.
- **Developers** who simply want to skip the boring setup.

## What you can ship

| Piece              | What it does for you                                   | Status |
| ------------------ | ------------------------------------------------------ | ------ |
| Backend API        | Stores data, handles accounts and login, out of the box | Ready |
| Admin page         | A web screen to view and manage your data              | Ready |
| Desktop app        | One program that runs on Windows, macOS and Linux      | Ready |
| Android app        | Installable phone app with home, search and settings   | Ready |
| iPhone / other     | Planned — the structure exists, screens are in progress | Coming soon |

"Ready" means it builds and runs the moment you generate it. You can still
change every screen and feature; these are real apps, not locked demos.

The Android app even works in two styles: a **standalone** mode you can run with
no server at all, and a **connected** mode that logs in against your real
backend.

## Get started in four lines

```bash
pnpm add -g @marsquakes/cli
mars create my-app
cd my-app
mars init
```

Then open the project and tell an AI coding assistant what you want to build —
or run `mars dev` to see every piece start at once.

The package is called `@marsquakes/cli`, but the command you type is `mars`.
Rather not install it? `pnpm dlx @marsquakes/cli create my-app` works too.

📖 **Read the full guide: [marsquakes.cc](https://marsquakes.cc)**

The guide has two tracks: a **Guide** written for people, and an **AI Guide**
written for AI agents — if you are working with an AI assistant, point it at the
AI Guide and it will know exactly what to do.

## Frequently asked questions

**Do I need to know how to code?**
Not much. Marsquakes removes the setup, and an AI coding assistant can write
the features for you. You mainly need to describe what you want.

**Do I have to install a lot of complicated software?**
Only two free basics: Node and pnpm. Everything else a chosen platform needs is
installed automatically by `mars init` — and you can build inside Docker to skip
even that.

**Will I be forced to include platforms I don't want?**
No. You pick at creation time, unselected platforms are never copied, and their
software is never installed. You can turn a platform on later and re-run
`mars init`.

**Can I update later without losing my code?**
Yes. `mars update` pulls in improvements to the build setup while leaving your
application code untouched.

**What does it cost?**
Marsquakes itself is free and open source under the Apache 2.0 license. You only
pay for whatever hosting or app-store fees your product itself chooses to use.

---

## For developers

Everything above describes the project Marsquakes generates. This short section
is for people working on Marsquakes itself.

**Commands**

```bash
mars create <name>   # scaffold a project (flags: --template, --from, -n)
mars init            # install dependencies + toolchains for enabled platforms
mars dev             # start all enabled platforms (or --platform <name>)
mars build           # build all enabled platforms
mars update          # refresh build wiring, keep apps/ and your code
mars clean           # remove build artifacts
```

A single file, `platforms.json`, records every platform, its directory and
whether it is enabled; all commands derive their behavior from it. Add
`--docker` to build or run inside containers, and `--lang en|zh` to switch the
output language.

**Hacking on this repository**

`apps/desktop` is a git submodule, so clone recursively:

```bash
git clone --recursive https://github.com/sunquakes/marsquakes.git
pnpm install
pnpm run init
```

Test the CLI without publishing:

```bash
node packages/mars-cli/bin/mars.js create my-project --from .
```

Full Docker, toolchain and CI details live in [AGENTS.md](./AGENTS.md), and each
platform directory carries its own `AGENTS.md`. Read the one for the platform
you are touching.

## License

[Apache-2.0](./LICENSE) — the CLI and build wiring. Third-party code under
`apps/` keeps its own upstream license; check the license file inside a platform
directory before redistributing it.

## Author

**Shing Rui** — <sunquakes@outlook.com>
