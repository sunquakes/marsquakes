---
id: ai-setup-agent
title: Install the Agent
sidebar_position: 1
---

# Install the Agent

The agent is the program you talk to. It does the typing for you — including
installing everything else on the pages that follow. So this is the one page where
you copy and paste a couple of commands yourself.

After this page you will barely type another command.

This documentation track uses **OpenAI Codex CLI** throughout. The Chinese version
documents DeepSeek Harness instead; the two tracks are different tools, not
translations of each other.

:::info You need a terminal for this page
On Windows that is **PowerShell**, on macOS it is **Terminal**, on Linux whatever
your system calls its terminal. Copy the line below, paste it in, press Enter.
That is the whole skill.
:::

## 1. Install it

Pick the line for your computer. Each one downloads a ready-made program and needs
nothing installed beforehand — which is deliberate, because the things it *would*
otherwise need are the very things it is about to install for you.

macOS or Linux:

```bash
curl -fsSL https://chatgpt.com/codex/install.sh | sh
```

Windows, in PowerShell:

```powershell
irm https://chatgpt.com/codex/install.ps1 | iex
```

macOS, if you already use Homebrew:

```bash
brew install --cask codex
```

Now check it arrived:

```bash
codex --version
```

**What you should see:** a version number.

:::note "command not found" right after a successful install
The terminal window was opened before the install finished, so it has stale
information. Close it, open a new one, and run the check again. This is not a
failed install.
:::

## 2. Log in

```bash
codex login
codex doctor
```

**What you should see:** `codex doctor` prints a short report — where its settings
file is, what it is allowed to do, and whether it can reach the internet. All three
have to look right. If something later goes wrong, run `codex doctor` again before
blaming anything you said.

## 3. Choose the folder to work in

This matters more than it sounds, and it has to come before any settings, because
the settings file lives inside this folder.

Whichever folder you start the agent in becomes the only folder it is allowed to
change. It is also where it looks for a project's own instruction files.

**You do not have a project yet.** So the folder you want is the one your project is
about to be created *inside* — not the project itself. If you have nowhere to keep
projects yet, make somewhere:

```bash
mkdir ~/projects
codex -C ~/projects
```

If you are joining a project that already exists, start inside it instead:

```bash
codex -C ~/projects/admin-platform
```

**What you should see:** ask the agent to run `pwd`. The folder it prints has to be
the one you meant. Getting this wrong shows up much later as an agent that reports
success while nothing appears where you expected — it built it somewhere else.

## 4. Set two safety rules

Left alone, an agent will either ask you about every single thing or quietly change
files you did not mean it to. These settings put it in the middle: it can work
freely inside the folder you chose above, and it asks before stepping outside.

Create a file called `.codex/config.toml` inside that folder, containing exactly
this:

```toml
approval_policy = "on-request"
sandbox_mode    = "workspace-write"

[sandbox_workspace_write]
network_access = true
```

You can ask the agent to create that file for you. It is inside the folder the
agent is allowed to write to, so it will not need to ask permission.

| Line                               | What goes wrong without it                                                           |
| ---------------------------------- | ------------------------------------------------------------------------------------ |
| `approval_policy = "on-request"`   | it can create a project in the wrong folder and you will not notice                  |
| `sandbox_mode = "workspace-write"` | it can change files outside your project                                             |
| `network_access = true`            | installs fail, and the error looks like the internet is broken rather than a setting |

Check it took effect:

```bash
codex doctor
```

**What you should see:** the settings file it names should be the one you just
created in the folder you started in — not one in your home folder.

:::danger Never use `--yolo`
You will find this option suggested online. It switches off both safety rules at
once. If the agent is asking you too many questions, the fix is to ask it for
something smaller, not to remove the guard rails.
:::

## Next

[Install the skill](./ai-setup.md) — after that, setting up the rest of your
computer becomes a sentence instead of a command list.
