---
id: ai-intro
title: Introduction
---

# Build Marsquakes with an AI Agent

You do not write code. You describe what you want in ordinary sentences, and an
**AI coding agent** — a program you chat with that can also read and change files
on your computer — writes the code, runs the commands and shows you the result.

This track tells you exactly what to say, from an empty computer to a finished
app you can show to someone.

## Two words you will see constantly

| Word | What it means here |
| ---- | ------------------ |
| **Agent** | the program you talk to. It writes the code and runs the tools, then reports back. The English pages use OpenAI Codex CLI; the Chinese pages use DeepSeek Harness — the words differ slightly, the way of working does not |
| **Skill** | a small bundle of instructions you hand to the agent once, so it installs the right programs in the right order instead of guessing |

The first stage installs both.

## How every page works

- **Say this** — a block of ordinary sentences you can copy and paste. It always
  asks for a *result you can see*, never for a technical action.
- **What you should see** — a web address to open, a window appearing, a list of
  changed files. You check the work by looking, not by reading code.
- If what you see does not match, the page gives you the next sentence to say.

You never need to understand the text the agent prints. Two habits matter: ask
for the plan before it acts, and build one feature at a time.

## The journey

| Stage | Pages | What you have afterwards |
| ----- | ----- | ------------------------ |
| 1 — Environment Setup | [Install the Agent](./ai-setup-agent.md), [Install the Skill](./ai-setup.md), [How Vibe Coding Works Here](./ai-agents.md) | an agent you can talk to, that knows this project's setup |
| 2 — Start a Project | [Start a Project](./ai-start.md) | a created project, with exactly the toolchain it needs |
| 3 — Applications | one folder below per platform | a running app, new features inside it, and a package you can hand to someone |

Stage 2 installs only what your chosen platforms imply — a desktop-only machine
never gets a Java toolchain.

Under **Applications**, each platform opens into the same three pages:

| Page | What it produces |
| ---- | ---------------- |
| Create the Project | the empty, running starting point — a login page, an app window, or an app on your phone |
| Create a Feature | one real function inside it, such as managing articles or products |
| Deploy / Package | a finished file you can give someone — an installer, a release APK, or the whole system running in Docker |

| Platform | Pick it if you want |
| -------- | ------------------- |
| [Admin System](./ai-admin-project.md) | a website you log into to manage things — products, orders, users, articles |
| [Desktop App](./ai-desktop-project.md) | a real program with its own window, installed on a computer |
| [Android App](./ai-android-project.md) | an app installed on an Android phone |

Not sure which one? [Start a Project](./ai-start.md) opens with that exact
question.

## If you would rather type commands yourself

The **Guide** track is for people running every command in their own terminal.
Start at its [Introduction](./intro.md). Both tracks build the same projects —
only who types changes.

## Next

[Install the Agent](./ai-setup-agent.md) — the one page where you paste a couple
of commands yourself. After that, the agent does the typing.
