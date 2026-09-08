---
id: ai-setup
title: Install the Skill
sidebar_position: 2
---

import SkillDownload from '@site/src/components/SkillDownload';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Install the Setup Skill

A **skill** is a set of instructions you hand to your agent once. After that, it
knows how to do a job properly instead of guessing.

This one teaches your agent to install and check every program this project needs —
and to know which version of each one actually works. Without it, an agent will
happily install a version that is too old and report success.

You do not need a project yet. This works on a brand-new computer.

## 1. Download it

<SkillDownload />

Or, if you prefer to paste a line:

<Tabs groupId="os">
<TabItem value="unix" label="macOS / Linux">

```bash
curl -LO https://marsquakes.cc/skills/marsquakes-setup.zip
```

</TabItem>
<TabItem value="windows" label="Windows (PowerShell)">

```powershell
Invoke-WebRequest -Uri https://marsquakes.cc/skills/marsquakes-setup.zip -OutFile marsquakes-setup.zip
```

</TabItem>
</Tabs>

**What you should see:** a file called `marsquakes-setup.zip`. Inside it is a single
folder with five small text files — the instructions the agent reads, plus notes on
which versions are required and which errors lie about their own cause.

The folder name is already inside the zip, so you unpack it *into* a location rather
than creating a folder for it first.

## 2. Unpack it where the agent looks

Copy the block for your computer.

<Tabs groupId="os">
<TabItem value="unix" label="macOS / Linux">

```bash
mkdir -p ~/.agents/skills
unzip -o ~/Downloads/marsquakes-setup.zip -d ~/.agents/skills
```

</TabItem>
<TabItem value="windows" label="Windows (PowerShell)">

```powershell
$dest = "$HOME\.agents\skills"
New-Item -ItemType Directory -Force -Path $dest | Out-Null
Expand-Archive -Path "$HOME\Downloads\marsquakes-setup.zip" -DestinationPath $dest -Force
```

</TabItem>
</Tabs>

That location is in your personal home folder, so installing it once covers every
project you ever make on this computer.

:::caution Do not put it inside a project folder
The agent also looks for skills inside individual projects, and putting it there
feels tidier. It is not: a project-level skill vanishes the moment you move to
another folder — including the project you are about to create, which does not exist
yet.
:::

## 3. Check the agent can see it

Start your agent and ask it:

```text
Do you have a skill for setting up a Marsquakes environment?
```

**What you should see:** it names `marsquakes-setup` and describes installing
programs on your computer.

If it says no, close the agent completely and start it again — it only looks for new
skills at startup. If it still says no, ask: "read
`~/.agents/skills/marsquakes-setup/SKILL.md` and tell me if the first line is
exactly `---`." A skill whose first lines are wrong is ignored **without any error
message**, which is why it can look like the download failed when it did not.

## 4. Use it

Now just say what you want in plain language. You do not need to name the skill —
the agent works out that it applies.

```text
Set up this machine for a Marsquakes admin system — the backend plus the admin
website. Tell me what is missing before you install anything.
```

**What you should see,** in this order:

| Step | What you should see |
| ---- | ------------------- |
| 1 | a list of every program, each marked working, too old, or missing |
| 2 | a question about which kind of project you are building |
| 3 | a plan, and a pause to let you say yes before anything is installed |
| 4 | the same list again afterwards, with the missing ones now marked working |

:::tip Step 4 is the only one that counts
An installer that finishes without complaining is not proof of anything — plenty of
them succeed at installing the wrong version. The only real proof is a program
moving from "missing" to "working" on that second list. If the agent skips
straight to "all done", say: "run the check again and show me the list."
:::

## What it checks, and why the numbers matter

These are not preferences. Each one is a version below which something actually
breaks, usually with an error that points somewhere else entirely.

| Program | Needs to be | Installed | Why that number |
| ------- | ----------- | --------- | --------------- |
| Node.js | 22.12.0 or newer | up front | anything from 22.0 to 22.11 is rejected outright, so "version 22" is not enough |
| pnpm | 9.0.0 or newer | up front | the project pins this itself |
| git | 2.20.0 or newer | up front | — |
| Docker | 20.10.0 or newer | up front, if you asked for it | — |
| Docker Compose | 2.0.0 or newer | with Docker | anything starting with `1.` cannot read this project's files at all |
| Java (JDK) | 17 | when a project has a backend or an Android app | 21 also works, 11 does not |
| Maven | 3.9.0 or newer | when a project has a backend | — |
| Rust | 1.77.0 or newer | when a project has a desktop app | required by the desktop app |

Read the "Installed" column as a *when*, not an *if*. The first three are the
agent's own tools, so they have to exist before anything else can happen. The last
three depend on what you are building, and nothing knows that until a project
exists — so they are installed while the project is being initialised. A
desktop-only machine never gets a JDK, and a backend-only machine never gets Rust.

:::tip If an agent wants to install all of them now
Say: "install only the basics — the rest can wait until the project exists." An
agent that installs the whole table up front has not done anything harmful, just
slow: it will have downloaded a JDK and a Rust toolchain you may never use.
:::

## Next

Pick what you are building — [Admin System](./ai-admin-env.md) or
[Desktop App](./ai-desktop-env.md).

If you would rather install everything by hand,
[Getting Started](./getting-started.md) covers the same ground as command lists.
