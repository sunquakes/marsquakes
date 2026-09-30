---
id: ai-admin-deploy
title: Deploy It
---

# Building an Admin System: Deploy It

Once the system from [Create a Feature](./ai-admin-module.md) works on your
computer, three prompts finish the job — package it, check it, and put it on a
real server people can reach over the internet.

Until now most of the system ran directly on your computer and only the data
store ran in its box. Deployment packages the **whole system** — data store,
cache, the behind-the-scenes service and the website — so another computer can
run all of it with nothing else installed. You do not need to know how; the
agent follows the project's standard way.

:::note Packaging takes a few minutes on purpose
The package compiles your code inside it, so it can land on a machine with no
programming tools. Do not take this path while you are still changing code;
[getting it running on your own
computer](./ai-admin-project.md#step-3--start-it-and-open-it) stays
seconds-fast and is for daily work.
:::

## Step 1 — Package the whole system so another computer could run it

> **Say this**
>
> Package the whole admin system so it can run on a computer that has nothing
> installed, and start the packaged version. Apply every setting the project's
> standard way of doing this normally needs, including the ones needed on a
> mainland-China network. If anything I already have running gets in the way,
> deal with that sensibly. Keep it running and tell me when everything is ready.

The agent handles it all — building the two applications from your source, the
data store and cache, the regional download settings, and a small file that
makes the pieces find each other. You never type any of it.

**What you should see:** the agent saying the packaged system is up. Four pieces
run underneath; if you are curious or something goes wrong, ask for the list and
check there are exactly four:

| Piece | Address on the machine (you do not open these) |
| ----- | ----------------------------------------------- |
| Data store | 3306 |
| Cache | 6379 |
| Behind-the-scenes service (`marsquakes-api`) | 8817 |
| Admin website (`marsquakes-web-admin`) | internal only |

The first packaging takes several minutes — programming tools download inside
the package as it builds. A long silent stretch is normal; an error is not.

:::caution One setting that is easy to miss
When the data store runs inside the packaged system, the settings must point the
service at `mysql` and `redis`, not the host machine. Set wrong, the service
quietly ignores the freshly started data store — the failure looks like a
network problem when it is really a setting. Standard packaging handles this;
the note is here so you recognise the symptom if it ever does not.
:::

:::note Restarting on the very first start is normal
The data store loads its whole structure on first launch, slower than the
service expects. The service starts too early, gives up, and is brought back
automatically until the data store answers. A few restarts at first are
expected; endless restarts are not.
:::

:::caution Stop your development copies first
If the system from [Create the Project](./ai-admin-project.md) is still running
directly on your computer, the two copies fight over the same address. Stop
those copies before packaging; the data store already in its box can keep
running — the packaged system simply adopts it.
:::

## Step 2 — Open it and check it works

The finished website is at `http://localhost:8807`. The address ending in 8817
belongs to the behind-the-scenes service and is not meant for browsers — the
website is the only page you ever use.

> **Say this**
>
> Open the finished admin website and log in with the account I have been using
> during development. Check that the published switch we added in
> [Create a Feature](./ai-admin-module.md) is there and works.

**What you should see:** the login page, then the same tables you saw during
development, including your new column. The packaged pieces talk to each other
on their own internal network, so there is nothing to configure.

## Step 3 — Put it on a real server people can open from anywhere

"On your computer" only you can open it. A cloud server is simply another
computer that is always on and has a public address.

Need a server or a domain? See the [Server and Domain Setup](./appendix.md)
appendix first — it also gives the order: open over the IP, then add the domain,
then the padlock.

Once you have the public address and login details, tell the agent and paste:

> **Say this**
>
> I rented an AWS Lightsail instance for this project, created from the Docker
> blueprint, so Docker and Docker Compose are already installed. Its public
> address and login details are: [fill them in]. Deploy the packaged admin
> system there, make it start itself whenever the server restarts, open only the
> port the website needs, and give me the address to open. Keep any password
> different from the ones I use locally.

**What you should see:** the agent reporting the system is live on the server,
with a single address you can open from any computer or phone. Behind it the same
four pieces run; the data store and cache stay unreachable from outside — only
the website's door is open.

:::note A domain and the padlock come after it works
First confirm the IP address opens from another device — say your phone on
mobile data, not your home Wi-Fi. Only then follow the same
[appendix](./appendix.md) for the domain, and ask the agent to put HTTPS (the
padlock) on it. Doing both at once mixes two problems into one error.
:::

## When it goes wrong

You do not need to diagnose anything. Find your symptom, say the sentence:

| What you see | Say this |
| ------------ | -------- |
| Packaging crawls or looks frozen | "Switch the download sources to the mirrors for my region and start over" |
| The service keeps restarting with a data-store connection error | "Check the host-name setting for the data store and cache — inside one packaged system they must be `mysql` and `redis` — and start again" |
| It restarts a few times on first launch, then settles | Nothing — wait for the structure to finish loading; only endless restarts are a fault |
| An "address already in use" error | "Stop the development copies still running directly on my computer, or move the address in the settings file — do not improvise another way to change it" |
| The website build fails on a different style file each time | "Check the required build setting in the top-level AGENTS.md — do not change the version pins" |
| A memory error you know is not memory, or the data store dies during its first start | "This is the version-pin issue in the top-level AGENTS.md. Read it and leave the pinned image versions alone" |
| Pulling the standard packaged images fails or times out | "Configure the proxy for the box-running software — keep the standard images, do not swap in third-party ones" |
| A database "access denied" after changing the password | "The password is only read when the storage is empty — reset the stored data and start fresh. That wipes what was in it" |
| It has been silent for a long time | "Check which step you are on and tell me what is happening right now" |
| The IP address times out from my phone | "Check the server's firewall — in the cloud console and on the machine itself — and make sure the restart policy is set" |
| The site dies after the server reboots | "Set everything to start itself when the server restarts, then reboot it once to prove it" |
| A browser warns the site is "not secure" | "It is working on plain HTTP — leave it until the IP address is confirmed, then set up HTTPS and the padlock" |
