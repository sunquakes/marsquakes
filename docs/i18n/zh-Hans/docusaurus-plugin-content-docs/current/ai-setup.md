---
id: ai-setup
title: 安装 Skill
sidebar_position: 2
---

import SkillDownload from '@site/src/components/SkillDownload';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 安装环境准备 Skill

**Skill** 就是一份说明书，你交给 Agent 一次之后，它就知道怎么做好一件事，而不是自己瞎猜。

这个 Skill 教会你的 Agent 安装并检查这个项目需要的所有程序——Node.js、pnpm、git、
`mars` CLI、Docker、JDK/Maven、Rust 以及 Tauri 的系统依赖库——Windows、macOS、Linux
三个平台都支持。

它不需要 Marsquakes 的代码仓库，所以可以装在一台全新的机器上。

## 1. 下载压缩包

<SkillDownload />

或者用命令行下载：

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

**你应该看到：** 下载完成后，文件 `marsquakes-setup.zip` 出现在你的下载目录里。

## 2. 解压到 Agent 能读到的地方

把它解压到当前用户目录下的 `.agents/skills/` 里。

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

:::caution 装到用户目录，不要装到项目目录里
Agent 也会扫描项目文件夹里的 `.agents/skills/`。别装那儿——项目级的 Skill 一换到别的
文件夹就消失了，包括你**接下来才要创建**的那个项目。
:::

**你应该看到：** 解压后 `~/.agents/skills/marsquakes-setup/` 目录下有五个小文件。

验证一下解压是否正确：

<Tabs groupId="os">
<TabItem value="unix" label="macOS / Linux">

```bash
head -4 ~/.agents/skills/marsquakes-setup/SKILL.md
```

</TabItem>
<TabItem value="windows" label="Windows (PowerShell)">

```powershell
Get-Content "$HOME\.agents\skills\marsquakes-setup\SKILL.md" -TotalCount 4
```

</TabItem>
</Tabs>

**你应该看到：** 第一行是 `---`，然后 `name:`，然后 `description:`。

如果第一行不是 `---`，这个 Skill 会被**静默忽略**——没有任何报错，就像它不存在一样。
所以如果你发现 Agent 不认这个 Skill，先检查第一行是不是 `---`。

## 3. 确认 Agent 看见了它

启动 Agent，直接问：

```text
你有没有用来准备 Marsquakes 环境的 skill？
```

**你应该看到：** Agent 报出 `marsquakes-setup` 这个名字，并说明它负责安装程序。

如果没出现，先重启 dsh——只有 `SKILL.md` 变化才会让缓存刷新。重启后还是看不到，
就让它检查一下扫描路径是不是指向了你解压的那个目录。

## 4. 使用它

用日常语言描述你要的环境。这个 Skill 靠**描述**触发，不需要点它的名字：

```text
把这台机器准备成能跑 Marsquakes 后台管理系统的环境，api 加 web-admin。
先告诉我缺什么，别急着装。
```

你应该看到这样的执行顺序：

| 步骤 | 你应该看到 |
| ---- | ---------- |
| 1 | 一份检测报告，每个工具标为 `OK`、`OLD` 或 `MISS` |
| 2 | 反问你要做哪个场景 |
| 3 | 给出方案，并在动手之前停下来等你确认 |
| 4 | 安装后重新检测，被修好的工具变成 `OK` |

第 4 步才是关键：安装程序退出码为 `0` 什么也证明不了——有些装完了就是不往系统路径里
放东西。只有某个工具从 `MISS` 变成 `OK` 才算数。

## 它检查什么，以及为什么是这些数字

| 工具 | 必须不低于 | 什么时候装 | 为什么是这个数字 |
| ---- | ---------- | ---------- | ---------------- |
| Node.js | 22.12.0 | 一开始就装 | 22.0 到 22.11 直接被拒绝，所以光说"22 版本"不够 |
| pnpm | 9.0.0 | 一开始就装 | 由项目根目录 `package.json` 固定 |
| git | 2.20.0 | 一开始就装 | — |
| Docker | 20.10.0 | 一开始就装，前提是你要用 | — |
| Docker Compose | 2.0.0 | 跟着 Docker 一起来 | 版本 1 读不了这个项目用的文件格式 |
| JDK | 17 | 项目里有后端或安卓端的时候 | 21 也可以，11 不行 |
| Maven | 3.9.0 | 项目里有后端的时候 | — |
| Rust | 1.77.0 | 项目里有桌面端的时候 | 桌面应用需要的最低版本 |

"什么时候装"这一列说的是*时间*，不是*要不要*。前三个是 Agent 自己要用的工具，别的事
情要能开始，它们就得先在。后三个取决于你在做什么，而在项目建出来之前谁也不知道——所以
它们是在项目初始化的时候才装。只做桌面端的机器永远不会有 JDK，只做后端的机器永远不会
有 Rust。

:::tip 如果 Agent 现在就想把它们全装上
你就说："只装基础的那几个，剩下的等项目建好再说。"把整张表一次性装完并没有什么危害，
就是慢：它会替你下载一个可能永远用不上的 JDK 和一整套 Rust 工具链。
:::

## 下一步

选一个场景——[后台管理系统](./ai-admin-env.md)或[桌面应用](./ai-desktop-env.md)
——然后用提示词驱动它。

想全部手动装，[快速开始](./getting-started.md)用命令清单覆盖了同样的内容。