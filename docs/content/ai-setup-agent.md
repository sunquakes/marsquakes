---
id: ai-setup-agent
title: Install the Agent
sidebar_position: 1
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Install the Agent

The agent is the program you talk to. It does the typing for you — including
installing everything on the pages that follow. So this is the one page where you
paste a couple of commands yourself. After it, you only paste prompts.

The English pages use **OpenAI Codex CLI**; the Chinese pages use DeepSeek
Harness — different tools, the same way of working.

:::info You need a terminal for this page
On Windows that is **PowerShell**, on macOS **Terminal**, on Linux whatever your
system calls its terminal. Paste the line, press Enter. That is the whole skill.
:::

## 1. Install it

Pick the tab for your computer. Each line downloads a ready-made program and
needs nothing installed beforehand — by design: the things it would otherwise
need are the things it is about to install for you.

<Tabs groupId="os">
<TabItem value="unix" label="macOS / Linux">

```bash
curl -fsSL https://chatgpt.com/codex/install.sh | sh
```

Homebrew users get the same result with:

```bash
brew install --cask codex
```

</TabItem>
<TabItem value="windows" label="Windows (PowerShell)">

```powershell
irm https://chatgpt.com/codex/install.ps1 | iex
```

</TabItem>
</Tabs>

Check it arrived:

```bash
codex --version
```

**What you should see:** a version number.

:::note "command not found" right after a successful install
The terminal was opened before the install finished, so it has stale information.
Close it, open a new one, and run the check again. This is not a failed install.
:::

## 2. Log in

```bash
codex login
codex doctor
```

**What you should see:** `codex doctor` prints a short report — where its settings
file is, what it is allowed to do, and whether it can reach the internet. All
three have to look right. If something later goes wrong, run `codex doctor`
again before blaming anything you said.

## 3. Work in the right folder

The folder you start the agent in is the only folder it can change, and where it
looks for a project's instruction files. **You do not have a project yet**, so
start in the folder your project is about to be created *inside* — not the
project itself.

<Tabs groupId="os">
<TabItem value="unix" label="macOS / Linux">

```bash
mkdir ~/projects
codex -C ~/projects
```

Joining an existing project? Start inside it instead:

```bash
codex -C ~/projects/admin-platform
```

</TabItem>
<TabItem value="windows" label="Windows (PowerShell)">

```powershell
mkdir $HOME\projects
codex -C $HOME\projects
```

Joining an existing project? Start inside it instead:

```powershell
codex -C $HOME\projects\admin-platform
```

</TabItem>
</Tabs>

**What you should see:** ask the agent to run `pwd`. The folder it prints must be
the one you meant. Getting this wrong surfaces much later as an agent that
reports success while nothing appears where you expected — it built it somewhere
else.

Two settings keep the agent inside that folder instead of asking about every
click or quietly changing files elsewhere. Create a file called
`.codex/config.toml` inside that folder, containing exactly this — or simply ask
the agent to create it (the folder is one it may write to):

```toml
approval_policy = "on-request"
sandbox_mode    = "workspace-write"

[sandbox_workspace_write]
network_access = true
```

| Line                               | What goes wrong without it                                                           |
| ---------------------------------- | ------------------------------------------------------------------------------------ |
| `approval_policy = "on-request"`   | it can create a project in the wrong folder and you will not notice                  |
| `sandbox_mode = "workspace-write"` | it can change files outside your project                                             |
| `network_access = true`            | installs fail, and the error looks like the internet is broken rather than a setting |

Check it took effect:

```bash
codex doctor
```

**What you should see:** the settings file it names is the one you just created
in that folder — not one in your home folder.

:::danger Never use `--yolo`
You will find this option suggested online. It switches off both safety rules at
once. If the agent asks too many questions, ask it for something smaller — do
not remove the guard rails.
:::

## Next

[Install the skill](./ai-setup.md) — after that, setting up the rest of your
computer becomes a sentence instead of a command list.
