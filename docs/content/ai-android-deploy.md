---
id: ai-android-deploy
title: Package It
---

# Building an Android App: Package It

Once the feature from [Create a Feature](./ai-android-module.md) works on your
device, say one thing. At the end you have an APK file you can install and send
to someone.

## Step 1 — Build the release APK

> **Say this**
>
> Build the finished, release version of the Android app, and tell me exactly
> where the APK file ended up.

**What you should see:** one real file path ending in `.apk`. Ask for the path:
"the build succeeded" is not checkable, a file you can look at is.

That file is what you send to someone. They need none of the programs you
installed.

:::note The APK will work but it is not signed for the Play Store
The release APK built here uses the debug signing key, which is fine for testing
and side-loading but cannot be uploaded to the Google Play Store. When you are
ready to publish, say: "set up a proper signing key for the release build, then
sign the APK."
:::

## When it goes wrong

You do not need to diagnose anything. Find your symptom, say the sentence:

| What you see | Say this |
| ------------ | -------- |
| The build fails with a compile error | "Read `apps/android/AGENTS.md`, fix the error it names, then build again" |
| Gradle cannot find the JDK or the Android SDK | "Run `mars init` for this project again, then open a new terminal and retry" |
| The release APK cannot go to the Play Store | "Set up a proper release signing key and sign the APK with it" |
| The agent has been silent for a long time | "Are you waiting on something that never finishes? Start it the way that lets you keep talking to me, and tell me when it is up" |
