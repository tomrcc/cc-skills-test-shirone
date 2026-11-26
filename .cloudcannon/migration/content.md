# Phase 3 — Content (Shirone)

## Settings layer (chunk 2)

Scope: the theme's YAML config overlay as the editors' settings, `shirone.content.json`, the editor-facing settings files, the package-mode checks, and the `src/user/user-config.ts` tracking question from `configuration.md`.

### Files written

- `shirone.content.json` — path source `site-settings`, all four mounts `false`
- `site-settings/config/*.yaml` — 21 files: `site`, `profile`, `announcement`, `nav-bar`, `sidebar`, `post-list`, `article`, `license`, `series`, `about`, `friends`, `moments`, `albums`, `compass`, `anime`, `projects`, `skills`, `timeline`, `devices`, `games`, `llms`
- `.gitignore` — added `.parity-baseline/` (Phase 3 scratch, see Decisions)

Nothing under `src/` changed. `src/user/user-config.ts` is unchanged in the working tree (`git restore` after the last build).

### Checklist

- [x] Parity baseline saved before the first edit: `.parity-baseline/` (HTML, `.txt`, `.xml` from a clean `corepack pnpm build`), with a field comparator `.parity-baseline/_compare.mjs` (visible text, hrefs, image names without hashes, alt, `<title>`, meta description, plus `llms.txt`, `llms-full.txt`, `rss.xml`, `atom.xml`, `robots.txt`, `sitemap-0.xml`)
- [x] Settings in code → data files: every domain `configuration.md` lists has a YAML file seeded with today's values; the consuming `src/config/*Config.ts` modules already read the overlay through `withUserConfig()` (`navBar` through `getUserConfig()`), so no component changed
- [x] `data_config` entry for every settings file (all 21 match the files)
- [x] Every `_inputs` key names a field in its file; every key in the files has an input. Only exception: the shared page-settings glob gives `pageSize` to all twelve page files, and only `friends` and `anime` have it (an unmatched key is ignored)
- [x] Field completeness: every array item carries every key of its structure value, in the structure's key order — `profile_links` (`name`, `icon`, `url`), `nav_links` presets (`preset`) and the dropdown (`name`, `icon`, `children`), `sidebar_widgets` (`type`, `enable`, `slot`, `column`, `collapseAfter` where the widget has it, `pages`), `page_categories` / `page_categories_described`, `llms_links`
- [x] No nulls, no bare keys: empty text is `""`, empty lists `[]` (the overlay rejects null; see `configuration.md` finding 7)
- [x] No comments in the YAML (CloudCannon drops them on save)
- [x] Visible values in the consuming components: the settings that show on the page are all in the files; the rest stay developer-only per `configuration.md`
- [x] `corepack pnpm build` exit 0; `npx astro check` 0 errors (with the compiled overlay and with the committed empty module); `npx @cloudcannon/cli validate` passes
- [x] Not applicable to this chunk: front matter, page-builder blocks, markdown bodies, data collections (chunk 3)

### Findings

**The overlay reproduces the current site exactly.** After `node scripts/content/sync.mjs` (`config overlays 21`, exit 0, type-checked by `tsc`), two builds both compare clean against the baseline: 47 HTML files, 0 field differences, 0 extra files, `llms.txt` / feeds / sitemap identical. Raw diffs show only per-build random ids (`uid`, tooltip ids, `pi-wavy-clip-*`), bundle hashes, and the CJK font subset hash: the font text collector reads `src/user/`, and the compiled file's header comment adds a few CJK glyphs (subset 371.3 KB → 372.4 KB).

**Every file round-trips.** With the YAML backed up, 53 values across all 21 files were changed, the site built (exit 0), and these changes were found in `dist/`:

- site: `<title>` and meta description, `<html lang="ja">`, hue `123` in the inline theme script, banner title and first subtitle, `typewriter-enabled="false"`, carousel interval `7777`, `zoom-in`, `object-position: top`, dim `0.55`, waves removed, desktop banner image swapped to the mobile image
- profile: name, bio, first link's name, URL and icon (`fa7-brands:mastodon` lands in `src/generated/local-icon-collections.ts` and renders)
- announcement: title, content, link text and URL
- nav-bar: custom link `/rt-nav/` in the menu, Anime gone
- sidebar: one column (85rem page width), calendar widget gone
- post-list: page size 5 builds `/4/`; article: share block gone; license: name and URL under posts
- page settings: titles and descriptions on about, friends, moments, albums, compass, anime, series; series box moved before the post body (`cardPosition: top`)
- projects / skills: category label, `disabledKeys` hides `folkpatch` / `TypeScript`; timeline: label, `order: asc` reorders entries; devices: category description; games: `enable: false` turns `/games/` into the 404 redirect and drops it from the menu
- llms: `siteSummary` and a core page description in `llms.txt`

The backup was restored (`diff -r` identical) and the rebuild compared clean against the baseline again. A second, smaller pass confirmed the values the first one couldn't isolate: friends `pageSize` 12 → 3 (island props), `layout.mode: grid` (`post-list--grid` on the list), `closable: false` ("Close Announcement" button gone), related count 3 → 1 (discovery items 5 → 3), tags `collapseAfter` 6 → 2 (two tags before the "all tags" link). Restored, rebuilt, compared clean.

**Values an editor can produce also build.** A second pass added what a new structure item or a cleared input writes: a custom nav link and a profile link with `icon: ""`, a dropdown with `children: []`, a category with empty `label` and `icon`, an `llms` custom section with `items: []`, `about.title: ""`, `announcement.content: ""`, `banner.src.desktop: []`. Sync and build pass. Behaviour: an empty icon renders nothing (`Icon.svelte`), an empty dropdown is hidden, an empty `llms` section is left out of `llms.txt`, an empty about title falls back to the translated "About", an empty announcement hides the widget, an empty desktop banner list falls back to the mobile image.

**The overlay compile is deterministic**: re-running sync with unchanged YAML leaves `src/user/user-config.ts` byte-identical.

**`src/user/user-config.ts` must stay committed as the theme's empty module.** Evidence:

- `tests/content/content-config.test.mjs` asserts the tracked file equals `EMPTY_MODULE` from `scripts/content/config-overlay.mjs` ("没有覆盖时与仓库里已提交的空模块完全一致"). It fails while the compiled overlay is in the working tree and passes once the file is restored: 183/183 in `tests/content/*.test.mjs`, `tests/new-post.test.mjs`, `tests/ci-path-filter.test.mjs`.
- The shirones package pipeline (`scripts/ci/test-shirones-pipeline.mjs`, CI job `shirones-pipeline-tests`) builds the package from a git ref of this repo, so it sees only committed files. `rules/project-rules.md` §12.8 records that a package without `src/user/user-config.ts` fails at `astro:config:setup`. Untracking the file breaks package mode.
- Committing the compiled overlay instead would ship this site's settings in the package: package-mode config modules (`shirones/config/*Config.ts`) call `withUserConfig()`, so the shipped overrides would win over every package user's own config values.

**Package mode is unaffected by the settings layer.** `shirone.content.json` and `site-settings/` sit at the repository root; the pipeline copies top-level `src/` directories and the template, and `sync.mjs` is a no-op without a manifest. Checks: `pnpm check:package-manifest` ✓ (453 files), `pnpm check:manifest` ✓. The full shirones pipeline (`pnpm all` against the pinned shirones commit) wasn't run here: it fetches an external repository and runs a tarball install. It runs in CI on every push to `main`.

**Unit suite**: `node --test "tests/**/*.test.mjs"` gives 778/780. The two failures (`tests/load-config.test.mjs` "falls back to the package copy…", `tests/overlay.test.mjs` "package overlays resolve consistently…") also fail with `shirone.content.json` moved aside, so the settings layer doesn't cause them. Both build package-mode fixtures in temp folders; likely local Node 24 versus the required 26.

**CI fixtures still work.** The comment and no-toc regression jobs set `CONTENT_DIR=tests/fixtures/content/<name>`. The environment variable takes precedence over the manifest's source, so those runs use the fixture's `config/` only, on top of the theme defaults, as before. Ordinary CI builds now apply `site-settings/`. Today that equals the defaults. Once editors change settings, theme regression specs that assume default settings (menu, sidebar) test the edited site.

**Banner and avatar paths stay in the `assets/images/...` form** (relative to `src/`) the resolvers read today. CloudCannon's image inputs on these fields (`static: ""`) write `/src/assets/...`, which `resolveImageAsset`/`resolveAsset` treat as a public path. Chunk 3 step 5 changes the resolvers, then normalises `site.yaml` `banner.src.*` and `profile.yaml` `avatar` to `/src/assets/...`. Until then, an image picked in the editor for these fields builds as a broken public path.

### Decisions and why

1. **Settings files hold every editor-facing key, seeded with today's defaults**, not only the keys that differ. Editors see every value they can change, and the overlay's deep merge makes a full file equal to the defaults (proven by the parity compare). Developer-only keys in the same domains (`site.site`, `timeZone`, `texture`, `favicon`, `banner.carousel.fadeDuration`, typewriter speeds, anime providers and snapshot) stay out of the YAML and keep coming from `src/config/*Config.ts`.
2. **`src/user/user-config.ts` stays tracked as the empty module and is never committed compiled.** `pnpm build` and `pnpm dev` regenerate it from `site-settings/` on every run, so CloudCannon builds and local builds always use the current settings. The cost is a modified tracked file after any local `dev`/`build`; developers run `git restore src/user/user-config.ts` before committing, or `git update-index --skip-worktree src/user/user-config.ts` once per clone. This replaces `configuration.md`'s default (untrack it), which breaks package mode and the theme's own test; see Findings. No script change is needed: a fresh clone's `astro check` / `type-check` resolve the committed empty module.
3. **Seeded keys follow the structure value's key order**, and top-level keys follow the `_inputs` order in `cloudcannon.config.yml`. CloudCannon keeps key order on save, so a first save produces no reorder diff.
4. **Sidebar widgets write `column: primary` and `pages: []` where the defaults leave them out.** The code treats both the same as absent (`widget.column ?? "primary"`, `isWidgetVisibleOnPage` treats an empty list as every page, and `pagesToAttribute([])` writes the same `""` as `undefined`), and the parity compare is clean.
5. **`disabledKeys: []` on projects, skills, timeline, devices and games**, the generic alias every `feature-data.ts` filter reads (`disabledNames` / `disabledTitles` / `disabledIds` take precedence and stay unset).

### Global decisions for Phase 3 (later chunks follow these)

- **Settings mechanism**: the overlay. Files in `site-settings/config/<domain>.yaml`, read through the committed `shirone.content.json`. To add an editor-facing settings key, add it to the YAML (current default value, structure key order) and its `_inputs`; the domain's TS type validates it at sync. Never edit or commit the compiled `src/user/user-config.ts`.
- **Settings values that are icons need nothing extra**: the overlay compiles into `src/user/`, which the icon scanner reads. The `.json` scanner change in chunk 3 is for `src/data/*.json` only.
- **Parity**: compare every change against `.parity-baseline/` with `node .parity-baseline/_compare.mjs .parity-baseline dist` (expects 0 field diffs apart from intended changes). The baseline is the untouched site, so it stays valid for chunk 3. The last Phase 3 chunk deletes `.parity-baseline/` and its `.gitignore` line.
- **Round-trip test for new data files**: back up the files, change values with `yaml`'s `parseDocument().setIn()` (keeps key order), build by hand, find each value in `dist/`, restore and `diff -r` against the backup, rebuild and re-compare.
- **Before handing over**, restore `src/user/user-config.ts` (`git restore`) so the working tree has the empty module.

### Open questions

1. **Committed `src/user/user-config.ts`** — default: keep it as the empty module and restore it before commits (Decision 2). Alternative, if this repository will never feed the `shirones` package: commit the compiled overlay. It is still regenerated on every build, but the package pipeline's override tests would then run against this site's settings.
2. **Theme regression specs against an edited site** — default: leave CI as it is. If editors' settings changes start failing theme specs, run those jobs with `SHIRONE_CONTENT_SYNC=0` (skips the overlay).

## Data files and collections (chunk 3)

Scope: `src/data/*.ts` → JSON, the CMS lists, the icon scan, `/src/...` image paths, albums `info.json`, post/series/moment front matter, admonition and math normalisation. Follows the Phase 3 global decisions above.

### Files written or changed

- `src/data/{projects,skills,timeline,devices,games,friends,compass,anime,music}.json` — new, top-level arrays; every item carries every key of its structure value, in the structure's key order
- `src/data/{projects,…,music}.ts` — each imports its JSON (`with { type: "json" }`) and re-exports it under the old name and type (`data as ProjectItem[]`); helpers, interfaces and exports unchanged
- `src/data/icons.json` (56 `{ name, id }`), `src/data/tags.json` (33), `src/data/categories.json` (2) — new
- `src/integration/vite/icon/collections.ts`, `regeneration.ts` — the icon scan and the dev watcher also read `.json`, `.yaml`, `.yml`
- `src/utils/asset-utils.ts` — `toSrcRelativePath()`; `resolveImageAsset`/`resolveAsset` resolve `/src/<path>` as the local `<path>`
- `src/utils/feature-data.ts` — game covers starting `/src/` are no longer passed through `url()` as public paths
- `src/components/molecules/{ProjectCard,DeviceCard,GameCard,TimelineCard}.svelte` — `icon ?? default` → `icon || default`; GameCard shows rating and hours only when set and non-zero (also guards `null`)
- `src/content.config.ts`, `src/integration/collections.ts` (same change in both) — post `updated`, `seriesOrder` and post/moment `password` treat `null` and `""` as absent (`z.preprocess`)
- `.cloudcannon/schemas/post.md` — `updated:` and `seriesOrder:` added (empty)
- `site-settings/config/site.yaml` (`banner.src.*`), `profile.yaml` (`avatar`) — `/src/assets/...`
- `public/images/albums/*/info.json` — `_schema: external` on the two photo-list albums; `password`/`passwordHint` (`""`) on every album
- 21 posts, 6 moments, `series/media-embeds.md` — missing schema keys inserted with their default values, in schema order; no existing line rewritten
- `admonitions.md`, `encrypted-demo.md`, `markdown-extended.md`, `markdown.md` — admonitions to the bracket form, GitHub alerts to `:::important` / `:::tip`, the single-line `$$…$$` on its own lines
- `.parity-baseline/` deleted (baseline HTML, comparator, scratch scripts) and its `.gitignore` lines removed; `src/user/user-config.ts` restored to the committed empty module
- `scripts/fonts/text-collector.mjs` (outside `src/`) — the manual `fonts:subset` collector reads `src/data/*.json` (skipping `anime-snapshots/`), `music.json` and `anime.json`; without it the manual subset drops the data text

### Checklist

- [x] Data JSON as top-level arrays matching every `data_config` / `file_config` entry; `.ts` modules keep their exports and types
- [x] Field completeness: every item has every structure-value key (`timeline_links`, `compass_entries`, `progress`, `period` included); album files have every schema key; photos every `album_photos` key
- [x] Consumers checked for `""`, `0`, `[]`, `null` where the old field was optional: project/device/game/timeline-link icons, game rating/hours, project/game/anime cover, compass `note`/`icon`/`blurb`, `link`/`repository`/`year`, music `duration` (`normalizeTrack` already drops `0`), anime `link`/`cover`
- [x] Icon scan reads JSON/YAML; seven icons that appear only in the JSON during the round trip landed in `src/generated/local-icon-collections.ts` and their SVG paths rendered on the page
- [x] CMS lists created from every icon in data, settings and moments, and every tag and category in posts, moments and series
- [x] `/src/...` paths: banner, avatar, game covers, music covers resolve and are still optimised (`/_astro/*.webp`/`.avif`, same image names and counts as the baseline)
- [x] Albums `_schema`; post `updated`/`seriesOrder` accept null and are in the post schema; moment `password` same
- [x] Admonitions and math normalised; built HTML compared
- [x] URL check: every post, series, album and `about` has its page in `dist/`; the only misses are the two drafts
- [x] Front matter key diff against `.cloudcannon/schemas/*.md`: no missing keys, no extra keys
- [x] No source-editable or page-builder content in this chunk (no `content_blocks`, no styled HTML in front matter)

### Findings

**Parity.** After every change, `node .parity-baseline/_compare.mjs` reports 0 field differences on the 47 HTML files once two counters are ignored: the per-post word counts on `admonitions` (+4) and `encrypted-demo` (+4) and the site-wide word total (+8). The counter counts `:::` markers in the raw markdown. The admonitions render exactly as before: the bracket label gives the same title as the spaced `{title="…"}` form, and `:::important` matches the GitHub alert. `llms-full.txt` changes as expected (the bracket form becomes a quoted title; the spaced form stayed raw before). `rss.xml` and `atom.xml` render post bodies without directive support, so the two converted GitHub alerts show as raw `:::important` / `:::tip` text in the feeds instead of a blockquote (see Open questions).

**Every data value round-trips.** With the JSON backed up:

- Pass A gave every text, URL, id, list item and number in the nine data files a unique marker (346 values), plus cover swaps in projects, games (`/src/...`), anime and music (`/src/...`), friend avatars, ratings, hours, progress and durations. Built by hand (exit 0), all 346 were found in `dist/` (ratings render as `> 3.5</span>` and `aria-label="Rating 3.5"`). The `/src/...` covers built as optimised `/_astro/` images.
- Pass B changed selects, switches and icons: project phase and category, skill level and category, timeline category, device status and category, game status, category and cleared cover, anime status, `featured` flipped in projects, timeline, devices and games (`--featured` counts 1→2, 2→3, 2→3, 1→1), and seven icons including a compass entry that had none. Every change showed on its page or in the island props.
- An item exactly as each structure adds it, and a game with `rating`/`hours` `null`, also build: empty icons fall back, the null and zero rating/hours are hidden, an empty music track is dropped by `normalizeTrack`.
- Restored (`diff` identical to the backup), rebuilt, compared clean again.

`tags.json` and `categories.json` render nothing; they only feed the CMS selects. `icons.json` does feed the icon scan, so every listed icon is always in the built collection.

**JSON imports need `with { type: "json" }`.** Without it, Vite builds but Node-run code fails: `tests/feature-data.test.mjs`, `tests/font-subsetting.test.mjs`, and scripts that import config modules through Node (`musicConfig.ts` imports `data/music.ts`) throw `ERR_IMPORT_ATTRIBUTE_MISSING`. With the attribute, Vite, Node, `astro check`, `type-check` and esbuild (`load-config.ts`) all accept it.

**Package mode.** The data `.ts` modules still ship and stay overridable at `shirones/config/data/<name>.ts`. A relative `./<name>.json` import from a mirrored `.ts` resolves to the user's sibling JSON if it exists, else the package's (overlay case 3). The override registry probes `.ts/.mts/.js/.mjs` only, so a user's `<name>.json` alone doesn't override anything; package-mode users customise data by mirroring the `.ts` module, as before. `check:package-manifest` ✓ (453 files), `check:manifest` ✓.

**Checks.** `corepack pnpm build` exit 0; `npx astro check` 0 errors, 0 warnings (with the committed empty `src/user/user-config.ts`); `type-check` ✓ (documented exception only); `biome ci ./src` ✓ (one pre-existing warning in `remark-restore-bare-directives.mjs`); `npx @cloudcannon/cli validate` ✓; `node --test "tests/**/*.test.mjs"` 778/780, the same two package-mode fixture failures as chunk 2.

**Things that still describe the old layout** (developer docs, not changed): `src/config/README.md`, `docs/npm-package-mode.md`, `docs/remote-data-system.md`, `docs/font-system.md`, `docs/sidebar-widgets.md`, `.agents/skills/shirone-{feature,config}/SKILL.md` and `.vscode/schemas/*.schema.json` refer to the data living in `src/data/*.ts`. The content-separation scripts (`scripts/content/eject.mjs`) gitignore and untrack `src/data/*.ts` only, so an eject would leave the JSON tracked in the code repo.

### Decisions and why

1. **JSON stays beside each module, imported with `with { type: "json" }` and cast to the existing type.** Every consumer, test and package-mode override keeps importing `src/data/<name>.ts`; the cast restores the literal unions JSON widens, and the CloudCannon selects constrain those values.
2. **Interfaces stay in their `.ts` files** (`FriendItem`, `CompassShelf`, `AnimeItem`, …); the data moved, the types didn't.
3. **JSON is formatted with Biome** (tabs), because CI runs `biome ci ./src` over `src/data/*.json`.
4. **`/src/<path>` means `src/<path>`** in `resolveImageAsset`/`resolveAsset`; the existing `assets/...` form keeps working, so package-mode configs and docs need nothing. Editor-facing values (banner, avatar, game and music covers) are written in the `/src/...` form CloudCannon uses.
5. **Icon fallbacks use `||`** so an icon cleared in the editor (`""`) falls back to the component's default, as an absent icon did.
6. **Game rating and hours hide when `0` or `null`**: a new game's structure value has `0`, which isn't a rating.
7. **Project `coverAlt` keeps `??`**: an empty `coverAlt` means a decorative cover (`alt=""`), as the type's comment documents. Only the one project with a cover is affected today, and it has alt text.
8. **Cleared values are made absent in the Zod schema** (`z.preprocess` turning `null`/`""` into `undefined`) rather than in every consumer, for `updated`, `seriesOrder` and `password`. The output types don't change, so no consumer changed.
9. **Front matter keys were inserted line by line**, not by re-serialising YAML, so existing quoting, flow lists and dates are untouched.
10. **CMS lists**: icon names follow the configuration-gotchas recipe (prefix stripped, title case, `rounded` dropped, ` (logo)` / ` (brand)` for the logo sets, a few proper names spelled out); tags keep their existing case (`daily` and `Demo` both exist in content).

### Open questions

1. **GitHub alerts in feeds** — default: keep `:::important` / `:::tip` (they render the same on the site; RSS/Atom readers see the raw markers instead of a blockquote). Alternative: keep the two alerts as GitHub alerts and accept that the Content Editor rewrites them.
2. **JSON formatting after editor saves** — default: leave `biome ci ./src` covering `src/data/*.json`. If CloudCannon's JSON output differs from Biome's (array wrapping, indentation), CI's `checks` job fails after an editor save; then exclude `src/data/*.json` in `biome.json`. A Phase 5 check: save one data file in CloudCannon and run `pnpm exec biome ci ./src`.
3. **Developer docs that still say `src/data/*.ts`** — default: leave for the theme maintainer; the `.ts` modules remain the entry points.
4. **Content-separation eject with JSON data** — default: not supported by this setup (CloudCannon edits the files in this repository). If the site later ejects content, add `src/data/*.json` to `eject.mjs`'s ignore and untrack lists.
