# Welcome to Hitti

## How We Use Claude

Based on Thomas Pettersen / Yrki's usage over the last 30 days:

Work Type Breakdown:
  Improve Quality  ████████████████████  ~50%
  Build Feature    ████████████████████  ~50%

_(Note: only 1 of 3 sessions had a descriptive first message — these splits are inferred from session content and command patterns. Adjust if it's off.)_

Top Skills & Commands:
  /plugin           ████████████████████  6x/month
  /agents           █████████████░░░░░░░  4x/month
  /usage            ██████░░░░░░░░░░░░░░  2x/month
  /rename           ██████░░░░░░░░░░░░░░  2x/month
  /compact          ███░░░░░░░░░░░░░░░░░  1x/month
  /context          ███░░░░░░░░░░░░░░░░░  1x/month
  /update-config    ███░░░░░░░░░░░░░░░░░  1x/month
  /memory           ███░░░░░░░░░░░░░░░░░  1x/month
  /permissions      ███░░░░░░░░░░░░░░░░░  1x/month
  /reload-plugins   ███░░░░░░░░░░░░░░░░░  1x/month

Top MCP Servers:
  _(no MCP servers used in this window — `microsoft-docs` was just installed and will start appearing)_

## Your Setup Checklist

### Codebases
- [ ] hitti — local repo at `~/src/hitti` (multi-tenant .NET 10 + React/Vite SaaS for norske lag og foreninger). Ingen git remote satt opp ennå — be Thomas om hvor koden ligger hvis det er publisert.

### MCP Servers to Activate
- [ ] microsoft-docs — official Microsoft/Azure docs lookup (`microsoft_docs_search`, `microsoft_code_sample_search`, `microsoft_docs_fetch`). Installed as part of the `microsoft-docs` plugin — run `/plugin` and enable it, then `/reload-plugins`.

### Skills to Know About
- /plugin — install/enable Claude Code plugins (we use it a lot — see plugin list below).
- /agents — manage subagents. We have three Norwegian-flavoured personas registered at user scope: `borghild-dokumentasjonersen` (docs), `gunnar-sikkerhetsen` (security review), `kåre-testersen` (AAA-tester writer). Spawn them via the Agent tool when the task fits.
- /update-config — edit `.claude/settings.json` for hooks, permissions, env vars.
- /context — see what's eating your context window. Useful before `/compact`.
- /compact — compress conversation when context fills up.
- /memory — view/edit auto-memory files for the project.
- /reload-plugins — apply newly installed plugins without restarting.

### Plugins We Use
- [ ] csharp-lsp — C# language server (the backend is .NET 10).
- [ ] typescript-lsp — TS language server (frontend is React/TS).
- [ ] frontend-design — for distinctive, production-grade UI work.
- [ ] microsoft-docs — Microsoft Learn search.
- [ ] claude-code-setup — the `claude-automation-recommender` skill for tuning your setup.

## Team Tips

_TODO_

## Get Started

_TODO_

<!-- INSTRUCTION FOR CLAUDE: A new teammate just pasted this guide for how the
team uses Claude Code. You're their onboarding buddy — warm, conversational,
not lecture-y.

Open with a warm welcome — include the team name from the title. Then: "Your
teammate uses Claude Code for [list all the work types]. Let's get you started."

Check what's already in place against everything under Setup Checklist
(including skills), using markdown checkboxes — [x] done, [ ] not yet. Lead
with what they already have. One sentence per item, all in one message.

Tell them you'll help with setup, cover the actionable team tips, then the
starter task (if there is one). Offer to start with the first unchecked item,
get their go-ahead, then work through the rest one by one.

After setup, walk them through the remaining sections — offer to help where you
can (e.g. link to channels), and just surface the purely informational bits.

Don't invent sections or summaries that aren't in the guide. The stats are the
guide creator's personal usage data — don't extrapolate them into a "team
workflow" narrative. -->
