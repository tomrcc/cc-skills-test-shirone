# shirone: round 1 feedback

Skills: `agent-skills` as checked out on 2026-11-26 (branch `svelte`, uncommitted drafts on `b58db29`).

## Decisions given to the agent

- No Astro or Svelte upgrades. CloudCannon hosts the site. Forms post to an Inbox. pnpm 11.28.2 through Corepack. Code style follows `AGENTS.md`. The existing locales stay as they are.
- Mid-run answers: the 7-chunk plan was approved and runs to the end. `build.node_version` is `"26"`, falling back to `"24"`, and `engines` is unchanged. Audit defaults kept. The orchestrator runs the hydration checks.

## Skill gaps the agent reported (audit)

- The census and sizing assume pages hold hardcoded copy. Every page here is driven by TypeScript config modules and data arrays, so the "hardcoded → YAML" count is 0. That hides about 9 data files and about 30 settings areas that need converting.
- Nothing covers a site that is also published as an npm theme package, with two modes and integrations wired outside `astro.config.mjs`. Nothing covers a site with its own YAML config overlay either, or says whether to use that overlay or move settings into data files.
- `scripts/audit-astro.sh` leaves `.ts` endpoint routes (`rss.xml.ts`, `llms.txt.ts`, `robots.txt.ts`) out of its route list. Its Data Files section is empty when `src/config` and `src/data` hold only `.ts` files.
- The hydration-check guidance doesn't say that Svelte 5 production builds don't log hydration mismatches, so a clean `astro preview` console proves little. It also doesn't say that Astro 7's `astro preview` keeps running until `astro preview stop`.
- The build guidance has no fallback for a site whose `engines` needs a newer Node (26) than CloudCannon may offer.

## Result

All 7 chunks ran. The production build, `cloudcannon validate`, `astro check`, Biome and the manifest checks pass. 778 of 780 unit tests pass; the 2 failures (`load-config`, `overlay`) also fail on the untouched original, probably because Node 24 runs where Node 26 is wanted.

- Site settings use the theme's own YAML overlay (`shirone.content.json` and 21 files in `site-settings/config/`). The 9 `src/data/*.ts` arrays moved to JSON that the `.ts` modules import.
- Visual editing: editable-regions 0.0.22, set up through `src/integration/`. The 8 feature pages are registered Svelte section components (`editable-component` with `@data[...]` props). Posts, series and About have `@content` regions. Moments and albums aren't wired.
- `src/user/user-config.ts` is rewritten by every local `dev` or `build`. Run `git restore src/user/user-config.ts` before committing.
- The migration agent's own review sent back two fixes to its phase subagents: post fields without inputs, and a dev-server step that told the user to `git stash` the whole uncommitted migration.
- The agent's handoff has 21 CloudCannon checks. The orchestrator cut them to the few that bear on a skill rule.

Orchestrator checks:
- Hydration on the Astro dev server (Svelte 5 dev logs mismatches): no warnings, errors or failed requests on `/`, the guide and markdown posts, About, a series page, the 8 feature pages, moments, albums and one album.
- Astro 7's `astro dev` detaches and keeps running until `astro dev stop`, the same as `astro preview`.

## Skill gaps the agent reported (phases 2–5)

- Configuration:
  - The `_snippets_templates` examples with `literal: { ref: … }` and `models: { ref: … }` (`raw.md`, the Astro snippets overview) fail `cloudcannon validate`.
  - No guidance on remark-directive syntax, or on line-based syntax (abbreviations, footnotes, `$` math).
  - No guidance for a build that rejects nulls, which forces `empty_type` on every input.
  - No recipe for image paths relative to `src/` without a leading slash.
  - `astro/configuration.md` lacks Astro's minimum Node version (7.4.5 needs ≥22.23.4).
  - No fallback when `engines` asks for a newer Node than CloudCannon may offer.
  - `build-commands.md` never mentions Corepack, or that Node 25+ doesn't ship it.
- Content:
  - Importing JSON from `.ts` needs `with { type: "json" }` for Node-run tests and scripts; Vite builds without it.
  - Moving data out of `.ts` hides it from build-time scanners that filter by extension (icons, font subsetting).
  - No step checks that the repo's formatter or linter accepts JSON as CloudCannon saves it.
  - The parity baseline misses non-HTML outputs (`llms.txt`, feeds, sitemap) and counters that change when syntax is normalised.
  - No recipe for checking at scale that every value round-trips.
- Visual editing:
  - `setup-editable-regions-astro.sh` edits `astro.config.mjs` and runs plain `pnpm add`, which doesn't fit a site configured through its own integration.
  - Anything imported from `registerComponents.ts` gets its CSS linked as duplicate files on every page, and editor-only imports can change how the build splits CSS. Here each feature page ships a ~1 KB script plus a duplicate copy of its section CSS.
  - Nothing explains how an editor opens a page built only from data or settings files. `disable_url` on data collections leaves those pages unreachable.
  - Index binding is described only as a last resort, but it was the common case here, because components filter, sort and paginate lists.
  - `@content` replaces the site's rendered body as soon as the editor loads, which matters for custom markdown. `data-defer-mount` appears only in the attribute table.
  - Nothing covers client routers (Swup's `data-no-swup`), text under `pointer-events: none`, masonry spacing breaking on re-render, or `srcset` on an `<img>` inside a component you don't control.
  - The readiness row asks for `componentMap.ts`, which the skill prescribes only for page builders.
- Dev server: `cloudcannon-dev-server` says to take the first `detect-build-commands` suggestion, but CLI 0.0.20 suggests Hugo with output `public` here, because any path containing `/config/` counts as Hugo.
- Orchestration: nothing covers a site folder that moves mid-migration.

## Tom's testing
