# Phase 4 — Visual editing (Shirone)

## Setup and detail pages (chunk 4)

Scope: `@cloudcannon/editable-regions` wired through `src/integration/` for both modes, the editor-only registration import, the load-time patches (entrance animations, banner, Swup, lightbox), and the post, series and about regions. Sets the Phase 4 global decisions chunks 5 and 6 follow.

### Files changed

- `package.json`, `pnpm-lock.yaml` — `@cloudcannon/editable-regions` `0.0.22` in `dependencies` (published 2026-10-15, outside `minimumReleaseAge`; no peer dependencies; its own dev setup tests Astro 7.3.8 and Svelte 5.57.2, so no Astro or Svelte upgrade)
- `src/integration/index.ts` — `editableRegions()` added in `createBundledIntegrations()`, so the theme repo and package mode get it from the same place
- `src/cloudcannon/registerComponents.ts` — new; imports the Svelte renderer, registers nothing yet
- `src/layouts/Layout.astro` — head script: in the editor, adds `motion-reduced` and `data-no-swup` to `<html>`; the existing fancybox/layout-mode `<script>` imports `registerComponents` under `window.inEditorMode`
- `src/global.d.ts` — `Window.inEditorMode`
- `src/styles/transition.css` — `.cms-editor-active .onload-animation` override
- `src/components/organisms/BannerStage.astro` — in the editor the script leaves the subtitle and context copy as rendered
- `src/utils/fancybox-runtime.ts` — lightbox not bound in the editor
- `src/utils/fab-controller.ts` — the FAB's home button loads the page directly in the editor
- `src/components/content/Markdown.astro` — `editableBody` prop: `@content` region with `data-defer-mount`
- `src/components/atoms/display/PageHeader.astro` — `titleProp` prop
- `src/components/molecules/ImageWrapper.astro` — `imageProp` prop (image region on the `<img>` in all three branches)
- `src/pages/posts/[...slug].astro`, `src/pages/[...permalink].astro` — title, cover and body regions (the permalink route is the same template; it builds nothing while permalinks are off)
- `src/pages/series/[slug]/index.astro` — title and body regions; `src/pages/about.astro` — body region

### Checklist

Infrastructure (`astro/visual-editing.md`):

- [x] `@cloudcannon/editable-regions` in `dependencies`
- [x] `editableRegions()` in the integrations list — through `createBundledIntegrations()`, since `astro.config.mjs` only calls `shirones()`
- [x] `src/cloudcannon/registerComponents.ts` exists
- [x] Base layout imports it inside `if (window.inEditorMode)`
- [x] Svelte renderer imported (the only UI framework)
- [x] `astro-icon` not installed; no `src/icons/` needed
- [x] Registered components grepped for `Astro.*` and `.svg` imports — none registered in this chunk
- [x] `astro build` passes after setup

Completeness, for this chunk's pages:

- [x] Editor enablement: posts, series, spec have `visual`
- [x] Census rows in scope wired or justified (below)
- [x] Image editables: post cover
- [x] Markdown body: `@content` on posts, series and about
- [x] Conditional guards: cover region only when `image` is set; series body only when the file has one
- [x] Inline vs block: titles are plain `text` inputs on `span` regions; `@content` takes no `data-type`
- [x] `_inputs` audit: `title` (posts, series: `text`), `image` (posts: `image`); `@content` needs none
- [x] Schema seed: `title` and `image` are in `.cloudcannon/schemas/post.md`, `title` in `series.md`
- [x] Child component labels: post-page labels (word count, copy link, share, discovery headings) are i18n copy, developer-owned per audit Decision 5
- [x] Cross-collection items: series member list and post discovery cards come from other files and carry no regions
- [ ] Arrays, components, data files, source editables — none in this chunk; chunks 5–6

### Checks run

- `corepack pnpm build` exit 0 (`src/user/user-config.ts` restored after every build)
- `npx astro check`: 0 errors, 0 warnings
- `corepack pnpm exec biome ci ./src`: passes (one existing warning in `remark-restore-bare-directives.mjs`)
- `corepack pnpm type-check`: only the documented exception
- `check:package-manifest` ✓ (454 files), `check:manifest` ✓
- `npx @cloudcannon/cli validate`: every file valid
- `node --test` over `tests/**/*.test.mjs`: 778/780, the same two package-mode fixture failures as Phase 3
- Built HTML (`grep -oE 'data-editable="[a-z-]+" data-prop(-src)?="[^"]*"'`):
  - 20 post pages: `text`/`title`; 19 with `text`/`@content` (`encrypted-demo` has none: its body is encrypted)
  - `/posts/guide/`: also `image`/`data-prop-src="image"` on the cover `<img>` inside its `<picture>`
  - `/about/`: `@content`; `/series/markdown-syntax-guide/`: `title` + `@content`; `/series/media-embeds/`: `title` only (no body)
  - No other page has a region; `data-prop-src` appears once in `dist/`
- Production output: every page references the same `_astro` assets as the build before this chunk (hashes stripped, all 47 pages compared). The registration import shares an existing Layout script, so public pages make no extra request. `registerComponents.*.js` (88 KB) is only requested in the editor. Re-chunking renamed export bindings in shared chunks; sampled chunks are otherwise identical.

### Findings

**Registering a component in `registerComponents.ts` links its CSS on every page.** Experiment (reverted): registering `ProjectSection.svelte` there added `ProjectSection.*.css` to all 47 pages. Registering it from a module imported only by `projects.astro`'s own editor-gated `<script>` limited it to `/projects/`, at the cost of one extra module request on that page and the component's CSS linked a second time there (`ProjectSection.*.css` beside `projects.*.css`). This sets global decision 2.

**`@content` replaces the rendered body as soon as it mounts.** `editable-text` mounts CloudCannon's rich text editor on connect and calls `setContent()` with the markdown, rendered by CloudCannon, not by the site's processor. Without deferral, every post in the Visual Editor would lose expressive-code frames, admonitions, KaTeX, mermaid, tabs and embeds on load. `data-defer-mount` keeps the site's rendering until an editor clicks the body.

**The theme's own reduced-motion mode is the editor's static state.** `html.motion-reduced` zeroes every animation and transition duration, and `prefersReducedMotion()` (which every motion utility, the banner carousel, ken-burns and typewriter check) reads it. Adding it in the head script under `window.inEditorMode` stops all of them with no per-component patch. The `.cms-editor-active .onload-animation` rule covers markup re-rendered after an edit.

**Swup is turned off with an attribute.** `@swup/astro`'s `ignoreVisit` checks `el.closest('[data-no-swup]')`; `data-no-swup` on `<html>` makes every link load the page directly, so the editor always shows the file the page belongs to. The `ignore` option was not used: `tests/integrations-config.test.mjs` pins it to the array form.

**The banner script rewrites its copy from data attributes** on every resize, theme change and Swup visit (`syncContext`, subtitle typing). In the editor it now leaves the rendered text alone, so text regions chunk 6 adds there keep the editor's value.

**Post cover paths are relative** (`./cover.jpeg` in `guide/index.md`). The image region calls `CloudCannon.getPreviewUrl()` with the stored value on mount, so whether the cover shows in the editor depends on CloudCannon resolving a relative path against the file. Phase 5 check below.

### Census (all key pages)

Every row is wired (✓) or carries its justification. Chunk 5 rows are detailed under Feature pages, chunk 6 rows under Shell.

| Page | Section | Treatment | Binding plan | Data completeness | Justification | Chunk |
| --- | --- | --- | --- | --- | --- | --- |
| Post | Title | text | `data-prop="title"` on the title `<div>` | In front matter | — | 4 ✓ |
| Post | Cover image | image | `ImageWrapper imageProp="image"` → `data-prop-src="image"` on the `<img>` | No alt field (decorative `alt=""`) | — | 4 ✓ |
| Post | Body | text (`@content`) | `Markdown editableBody` → `data-prop="@content"` + `data-defer-mount` | — | Encrypted posts: no region; the body is encrypted at build (audit open question 6) | 4 ✓ |
| Post | Word count, reading time | sidebar-only | — | Computed from the body | Derived by remark plugins at build; no field to bind | 4 ✓ |
| Post | Dates, tags, category (`PostMeta`) | sidebar-only | — | In front matter | Formatted dates and taxonomy links from scattered top-level fields; no single object to give a registered component (skill: blog heroes keep primitives + sidebar). Date/select inputs; updates after rebuild | 4 ✓ |
| Post | Series card | sidebar-only | — | `series`, `seriesOrder` in front matter; rest from other files | Built from the series collection and every member post | 4 ✓ |
| Post | License block | sidebar-only | — | `license` in front matter + license settings | Resolved against settings at build | 4 ✓ |
| Post | Share, discovery, prev/next, comments | external / cross-collection | — | Other posts, settings, build-filled `prevTitle` etc. | Not this file's data | 4 ✓ |
| Post / series | Banner context title, description, date | sidebar-only | — | Mirrors `title`, `published` | Duplicates the title edited in the card; banner sits in the shell outside the page | 4 ✓ |
| Series | Title | text | `PageHeader titleProp="title"` | In front matter | — | 4 ✓ |
| Series | Status · post count subtitle | sidebar-only | — | `status` select | Status label translated + count of member posts | 4 ✓ |
| Series | Overview body | text (`@content`) | `Markdown editableBody` | — | Only rendered when the file has a body (`media-embeds` has none): add it in the Content Editor | 4 ✓ |
| Series | Member list | cross-collection | — | Posts collection | Other files | 4 ✓ |
| About | Body | text (`@content`) | `Markdown editableBody` | — | — | 4 ✓ |
| About | Title / description | sidebar-only | `about_settings` in Site settings | `$t:about` i18n refs | Shown as the banner context title and `<title>`, resolved from `$t:` references; a text region would show and write the raw `$t:` string (global decision 4) | 6 ✓ |
| Home | Banner title + subtitle | data-file + text | `<h1>` → `@data[site_settings].banner.homeText.title`; `<p>` → `@data[site_settings].banner.homeText.subtitle.0` | In `site.yaml` | Only the first subtitle renders in the editor (typing is off there); the others, `enable` and typing are in the data panel | 6 ✓ |
| Home | Banner images | sidebar-only | `site.yaml` `banner.src.*` | In `site.yaml` | Two stacked `<img>` layers the carousel script fills from a data attribute of built URLs (light/dark, desktop/mobile), with srcsets from `getImage`; an image region would update one layer only, and new uploads under `src/assets` need the build to optimise them | 6 ✓ |
| All | Sidebar profile (avatar, name, bio, links) | data-file + text + image + array | `@data[profile_settings].name`, `.bio` (text); `<editable-image data-prop-src="@data[profile_settings].avatar">`; `data-prop="@data[profile_settings].links"` array, one `array-item` span per link, `name` text on the single-link label | In `profile.yaml` | Link icon, URL and the multi-link names (tooltip only) are edited per item in the data panel; no component (shell section below) | 6 ✓ |
| Home (all pages, shown on home only) | Announcement | data-file + text | `.title` (when set), `.content`, `.link.text` under `@data[announcement_settings]` | In `announcement.yaml` | `closable`, `link.enable/url/external` and an empty title (falls back to the translated "Announcement") are in the data panel; update after rebuild | 6 ✓ |
| All | Footer | text (name) + developer-owned | `FooterBar nameProp` → `@data[profile_settings].name` on the copyright name | Name in `profile.yaml`; year computed; RSS/Atom/Sitemap and Powered-by links, "All Rights Reserved." and the version are theme copy | `footer.html` is developer-owned raw HTML (configuration.md decision); the rest is theme chrome, not site content | 6 ✓ |
| All | Navigation | sidebar-only | `nav-bar.yaml` in Site settings | In `nav-bar.yaml` | Presets resolve to translated labels and routes at build, and links missing a page are pruned, so rendered items don't map to file entries | 6 ✓ |
| All | Top app bar site title | data-file + text | `@data[site_settings].title` on the title `<span>` | In `site.yaml` | — | 6 ✓ |
| All | Navigation drawer title + subtitle | sidebar-only | `site.yaml` `title`, `subtitle` | In `site.yaml` | Rendered inside the `SiteNavigationDrawer` island (`client:load`); regions there need the Svelte `EditableRegions` root in the production island bundle (zero-extra-burden rule). The title is editable in the top app bar | 6 ✓ |
| Projects | Header + cards | data-file + component + array | `ProjectSection` per global decision 3; `data-prop="@data[projects]"`, settings (categories, title) from `projects_settings` via `live-settings.ts` | Data JSON + settings | — | 5 ✓ (see Feature pages) |
| Skills, timeline, devices, games, friends, compass, anime | Header + items | data-file + component + array | Same pattern, `@data[<feature>]` + `@data[<feature>_settings]` | Data JSON + settings | — | 5 ✓ (see Feature pages) |
| Moments | Header + moment cards | component / sidebar | Header from `moments_settings`; cards are a collection listing | Moments collection | Bodies edited in the moments collection | 5 ✓ (see Feature pages) |
| Albums | Header + album grid | data-file (header) | `@data[albums_settings]` | Album `info.json` files | Grid lists other files | 5 ✓ (see Feature pages) |
| Archive, categories, tags, series index, RSS, Atom, 404 | Generated listings / i18n copy | none | — | — | Audit census: generated or developer-owned copy | — |

### Decisions and why

1. **`editableRegions()` lives in `createBundledIntegrations()`**, beside swup, svelte and mdx. That function is the single Astro config for the theme repo and package mode (`rules/project-rules.md` §12.1), so one line covers both, and `bundledIntegrations: false` drops it with the rest. Outside the editor it changes no page's assets (checked above).
2. **The registration import shares Layout's existing fancybox/layout-mode `<script>`**, so a public page loads no new module. `import("@/cloudcannon/registerComponents")` uses the theme alias, which resolves to the package's `src/` in package mode; `src/cloudcannon/` ships automatically (only `content/` and `integration/` are excluded from the package).
3. **No `src/cloudcannon/componentMap.ts`.** The skill prescribes it for a page builder's `BlockRenderer`; Shirone has none, and the registration split in global decision 2 replaces a single map.
4. **Body regions are deferred** (`data-defer-mount`), for the finding above. Clicking the body switches it to CloudCannon's rich text view with snippets; the site's own rendering returns after the next build.
5. **Shared components take optional region props** (`titleProp`, `imageProp`, `editableBody`) that emit attributes only when set, so other callers' output is unchanged and package-mode overrides of these components keep working without them.
6. **Load-time patches reuse the theme's switches** (`motion-reduced`, `data-no-swup`) rather than adding editor branches to each script. Only the banner copy and the lightbox needed their own `window.inEditorMode` checks.
7. **Titles bind to the front matter key directly** (`data-prop="title"`), with no component wrapper: the hero fields are top-level, so there is no object to give a registered component (skill: blog detail pages).

### Global decisions for Phase 4 (chunks 5 and 6 follow these)

1. **Setup is done.** Don't touch `astro.config.mjs`; anything integration-level goes in `src/integration/index.ts`. `window.inEditorMode` is typed in `src/global.d.ts`.
2. **Where registrations go.** Every component imported by `src/cloudcannon/registerComponents.ts` has its CSS linked on all pages. So:
   - `registerComponents.ts` registers only shell components that render on every page anyway (chunk 6: profile, announcement, banner copy).
   - A feature page's components register in `src/cloudcannon/register/<page>.ts`, imported by an editor-gated `<script>` in that route: `if (window.inEditorMode) import("@/cloudcannon/register/<page>")`. Cost: one module request on that page and its organism's CSS linked twice there.
   - After each registration, compare per-page asset references against the previous build with hashes stripped. Only the intended page may change.
   - Where a section only needs inline text, image and array regions (no conditional markup or derived values), skip registration: it costs no CSS.
3. **Svelte organisms** (`*Section.svelte`, all `client:visible` islands):
   - Register with `registerSvelteComponent("<feature>-section", Component)` from `@cloudcannon/editable-regions/svelte`.
   - Wrap at the route call site: `<editable-component data-component="<feature>-section" …>`, never on the component root.
   - A registered framework component's value must be an object. Bind arrays and strings with `data-prop-<name>`, which arrives lowercased as `{ <name>: value }`. So the registered component needs lowercase prop names. If the organism's props are camelCase or already filtered by `src/utils/feature-data.ts`, register a thin wrapper that takes the raw data-file shape and applies the same resolver the route uses, so the build and the re-render match.
   - Regions inside a hydrated island need the Svelte `EditableRegions` root inside the island, around the template.
   - No `getContext` in a registered component or anything it renders.
   - Svelte template comments use `<!-- -->` (pitfalls 1.7).
4. **Data files are addressed by their `data_config` keys**:
   - arrays `@data[projects]`, `skills`, `timeline`, `devices`, `games`, `friends`, `compass`, `anime`, `music`
   - settings `@data[<domain>_settings]`, with hyphens as underscores: `nav_bar_settings`, `post_list_settings`
   - paths inside an array region are relative to the item.

   Settings titles and descriptions hold `$t:<key>` references (`projects.yaml` `title: $t:projects`). A text region on one would show and write the raw `$t:` string, so bind a text region only where the value renders as stored. Otherwise leave it to the data panel, or render it through a registered component that resolves it.
5. **Load-time behaviour is handled globally.** New regions need no per-component motion patch: motion goes through `prefersReducedMotion()` and `motion-reduced`. A script that rewrites text or runs timers without checking those needs its own `if (window.inEditorMode) return`.
6. **Shared components take optional region props** (decision 5 above) rather than always emitting attributes.

### Open questions

1. **Relative post cover paths in the editor** — default: keep the image region on the cover. If CloudCannon can't preview `./cover.jpeg` (Phase 5 check), move the guide cover to `public/images/posts/` with an absolute path, as new uploads already are.
2. **Deferred body editing** — default: `data-defer-mount`, so pages look like the site until the body is clicked. Alternative: mount immediately (CloudCannon's rendering from the start, no click needed).
3. **Series with no body** (`media-embeds`) have no inline body region — default: add the body in the Content Editor. Alternative: always render the overview host, which adds an empty box to the live page.
4. **Package-mode users get the integration too** — default: yes; outside CloudCannon it adds about 200 bytes to one shared script per page and an unused chunk. Alternative: a `ShironesOptions` switch to leave it out.
5. **No `componentMap.ts`** although `plan.md` lists one — default: none (Decision 3).

### Phase 5 checks (CloudCannon editor)

- `/posts/guide/` in the Visual Editor: does the cover image show? (yes/no)
- `/posts/markdown/`: clicking the body opens the rich text editor, and saving after one word change leaves the math and footnotes intact in the diff? (yes/no)
- `/`: banner subtitle stays still (no typing, no carousel change) for 10 seconds? (yes/no)

### Pages to check for hydration warnings (dev mode, console open)

Changed markup or scripts on: `/posts/guide/`, `/posts/markdown/`, `/about/`, `/series/markdown-syntax-guide/`, `/` (banner script). The changes are attributes on server-rendered markup and editor-only script branches; no island's props changed.

## Feature pages (chunk 5)

Scope: projects, skills, timeline, devices, games, friends, compass, anime, moments, albums.

### Files changed

- `src/utils/editable-regions.ts` (new): `withEditablePaths()` gives each item an `editablePath` (`@data[<key>].<index in the data file>`); `textRegion`, `imageRegion`, `arrayRegion`, `arrayItemRegion`, `valueRegion` return region attributes for it, or none when an item has no path
- `src/utils/feature-sections.ts` (new, browser-safe): one `<feature>SectionProps(config, data)` per data-backed page, building the organism's props (resolver from `feature-data.ts`, editable paths, `$t:` title/subtitle). Routes build with it; the editor re-renders with it
- `src/cloudcannon/sections/<Feature>SectionRegion.svelte` (8, new): thin wrappers whose props object is the data file's array, merging `liveSettings("<page>_settings")` over the built `<feature>Config`, rendering the organism with `<feature>SectionProps`
- `src/cloudcannon/register/<page>.ts` (8, new): `registerSvelteComponent("<page>-section", …)` and `trackSettings("<page>_settings", "<page>-section")`
- `src/cloudcannon/live-settings.ts` (new, editor-only): reads each settings file through the Visual Editor API and re-renders the section when it changes
- `src/pages/{projects,skills,timeline,devices,games,friends,compass,anime}.astro`: section wrapped in `<editable-component data-component="<page>-section" data-prop="@data[<page>]">`, plus an editor-gated `<script>` importing `@/cloudcannon/register/<page>`. Anime wraps only when `source.kind` is `local`
- Cards (`ProjectCard`, `SkillCard`, `TimelineCard`, `DeviceCard`, `GameCard`, `FriendCard`, `CompassTile`, `AnimeCard`): item type widened with `EditablePath`; regions on visible fields. `FriendCard` gains a `friend-card__avatar` span (flex, no shrink) as the image region host
- `SectionTitle.svelte`: optional `titleProp` / `subtitleProp`; `CompassSection.svelte` passes the shelf paths
- `cloudcannon.config.yml` (outside chunk scope, see Decision 1): new `feature_pages` collection over the ten feature settings files with `url: "/[slug]/"` and `[visual, data]`; `settings` glob excludes them; added to the Pages group

### Census rows covered

| Page | Treatment as built | Regions inside |
| --- | --- | --- |
| Projects | component `projects-section` (items + settings) | title, year, summary, cover (image), technologies (array of strings) |
| Skills | component `skills-section` | name, description |
| Timeline | component `timeline-section` | date, title, subtitle, location, description, highlights + tags (arrays of strings) |
| Devices | component `devices-section` | name, year, brand, specs, description |
| Games | component `games-section` | name, developer, year, description, cover (image), tags (array) |
| Friends | component `friends-section` | name, description, avatar (image), tags (array) |
| Compass | component `compass-section` | shelf name + blurb, entry label, entry note (when set; else the domain shows, unbound) |
| Anime | component `anime-section` (local source only) | title, comment, cover (image) |
| Moments | none (justified below) | — |
| Albums | none (justified below) | — |

Not wired, with reasons:

- **Page title / subtitle (all ten)**: settings hold `$t:` references by default (global decision 4). The page opens on its settings file, so both are in the sidebar, and on the eight component pages the header re-renders live from `@data[<page>_settings]`.
- **Top-level item arrays**: no array region. Every page filters (`enable`, `disabledKeys`), sorts (timeline) or paginates/searches (friends, anime, compass), so the nth rendered card isn't the nth entry. Fields bind by each item's index in the data file (the skill's bind-by-index fallback). Add, remove and reorder go through the data panel (component edit button); the component re-renders.
- **Icons, status/phase/level, category, featured, rating, hours, links, progress**: select, switch, number and URL inputs, or computed labels (translated status, rating formatting); sidebar, live through the component re-render.
- **Timeline link labels, game platform**: text sits beside an icon in the same element with no own host; sidebar, live through the re-render.
- **Device image, compass entry image**: not in the structures' inputs (configuration chunk); nothing to bind.
- **Moments**: entries are other files (moments collection, content + data editors) rendered at build: markdown bodies through the site's pipeline, encrypted moments, `getImage` avatars. The section can't be rebuilt in the browser from data, so no component; `@file` text regions would sit in a hydrated island with no component around it, which needs the Svelte `EditableRegions` root in the production island bundle (zero-extra-burden rule). The page opens on `moments.yaml` for its settings; preview updates after a rebuild.
- **Albums**: same reasoning. The grid is a build-time folder scan (`scanVisibleAlbums`) with cover resolution and hidden-album filtering; albums are edited in the albums collection. The page opens on `albums.yaml`.
- **Anime from a provider snapshot**: when `source.kind` isn't `local` the list comes from `src/data/anime-snapshots/`, not `anime.json`. No wrapper, no paths (`external`).

### Findings

- **Feature pages had no file to open in the Visual Editor.** Their data files and settings are in `disable_url` collections with `[data]`, so `/projects/` etc. couldn't be opened, and any region there was unreachable. Each feature page has exactly one settings file named after its route, so a `feature_pages` collection with `url: "/[slug]/"` maps all ten. `about.yaml` and `series.yaml` stay in `settings`: `/about/` already belongs to `spec/about.md`.
- **The component's first update replaces the island.** `EditableComponent.mount()` calls `update()`, which mounts the registered component into a detached `div` and diffs it into the host: `<astro-island>` against the section's root differs by node name, so the island is replaced. Regions in the server markup never mount before that (their parent, the host, isn't mounted), and after it they live in the registered component's DOM, not the hydrated island. So these sections don't need the Svelte `EditableRegions` root, which would have added `@cloudcannon/editable-regions/svelte` to every production island bundle.
- **`@data[...]` in `data-prop-*` is absolute**, so a dataset-backed component gets live updates from both files, and the edit button (`editPath` = common prefix of the prop paths, falling back to the first) opens `@data[<page>]`.
- **Asset references outside the editor** (hashes stripped, all 47 pages, against the chunk 4 build):
  - each of the eight wired pages adds its `<page>.astro` script module and the section CSS a second time under the organism's name (`ProjectSection.*.css` has the same hash as `projects.*.css`), the cost global decision 2 accepted. Friends also adds `friends.css`; skills adds no CSS
  - every page except anime drops `ProgressIndicator.css`: AnimeCard brings `ProgressIndicator` and `Skeleton` into the anime registration module, so Rolldown now gives both one CSS chunk. All 230 `ProgressIndicator.css` rules are in `Skeleton.css`, which every one of those pages links. Net: one fewer stylesheet request site-wide, same rules
  - every Svelte scoped class in every page's HTML has a rule in that page's linked CSS (scripted check)
- **Masonry after edits**: projects and devices pack their grid from measured heights. A re-render mounts off-document, where `packMasonry` measures nothing and clears the row spans; the diff copies the cleared `style` onto the live cards. The live grid's `ResizeObserver` repacks when its height changes, so it should self-heal: Phase 5 check.

### Decisions and why

1. **`feature_pages` collection** (config change outside this chunk) — without it no editor reaches these pages. Disjoint globs keep each settings file in one collection; the rest keep `disable_url`.
2. **One props builder shared by route and editor** (`feature-sections.ts`), so the re-render applies the same filtering, sorting and paths as the build. Games resolves covers through `resolveAsset` in the route only (Astro image pipeline); in the editor, the cover's image region shows CloudCannon's preview.
3. **Bind by original index, absolute `@data` paths**, not array regions (filtering, above). Nested string lists inside one item render whole and in order, so they get array regions.
4. **Thin wrapper per page** rather than registering the organism: the organisms take camelCase, pre-resolved props; the wrapper takes the raw data-file shape (global decision 3).
5. **No Svelte `EditableRegions` root** in the islands (finding above). Global decision 3's root bullet applies to islands with regions and no component around them; none are wired in this chunk.
6. **Region props stay optional** on cards and `SectionTitle`: with no `editablePath` nothing is emitted, so package-mode overrides and other callers are unchanged.
7. **Settings merge over the built config** in the wrapper (`{ ...<feature>Config, ...liveSettings(...) }`), matching the overlay's top-level replace, so keys missing from the YAML keep their built defaults.
8. **The wrapper binds the data file as its only prop** (`data-prop="@data[<page>]"`). editable-regions 0.0.22 runs `structuredClone` over a component's props whenever it has a keyed prop (`data-prop-<key>`) or more than one. A whole `@data[...]` dataset is a live API object, and cloning it throws `DataCloneError` once the editor attaches its focus handler to it, which happens on some loads and not others. The component then never mounts, and its bound-by-index regions show "expects … string but … undefined". A lone base prop isn't cloned, and the component gets the realized array. Settings come from `live-settings.ts`, which reads the settings file through the Visual Editor API and calls the mounted component's `update()` when the file changes.

### Checks run

- `corepack pnpm build` exit 0; `src/user/user-config.ts` restored after each build
- `npx astro check`: 0 errors, 0 warnings
- `biome ci ./src`: passes (the existing warning in `remark-restore-bare-directives.mjs`)
- `check:package-manifest` ✓, `check:manifest` ✓, `cloudcannon validate` ✓
- `node --test` over `tests/**/*.test.mjs`: 778/780, the same two package-mode failures as before
- Built HTML: each wired page has its `<editable-component>` with both `data-prop-*` paths, and text/image/array regions as listed in the census table; moments and albums have none

### Open questions

1. **`feature_pages` collection** — default: added. Alternative: leave the pages unreachable in the Visual Editor (sidebar-only data editing).
2. **Masonry spacing after an edit** (projects, devices) — default: rely on the live `ResizeObserver` repack. If cards overlap after an edit (Phase 5 check), add editor-only CSS for a plain grid.
3. **Moments and albums inline editing** — default: none. Alternative: `@file` regions on their cards plus the Svelte `EditableRegions` root in those two islands, at the cost of the editable-regions Svelte module in their production bundles.
4. **Title/subtitle inline** — default: sidebar (`$t:` references). Alternative: a text region shown only when the value isn't a `$t:` reference.
5. **Fast typing inside a section** — every saved keystroke re-renders the section. In the local dev server, 3 of about 15 bursts of three keys at 80–120 ms apart kept only the first key in the file, while the card showed all three. The same burst in a plain shell region never lost a key. Default: keep the component, which gives live filters, counts and settings. Watch for it on the hosted site. If it shows up there, the alternative is plain regions plus a Svelte `EditableRegions` root inside each island, which adds the Svelte editable-regions module to production bundles.

### Phase 5 checks (CloudCannon editor)

- Open **Feature pages → projects.yaml** in the Visual Editor: does `/projects/` load with the cards? (yes/no)
- On `/projects/`, click a project title, type one word, save: does the commit change only `src/data/projects.json` at that project? (yes/no)
- On `/projects/`, change a summary from the data panel (component edit button): do the cards still sit without overlapping after the update? (yes/no)
- On `/games/`, pick a new cover for one game: does it show before saving? (yes/no)
- On `/friends/`, click an avatar: does the image picker open for `imgurl`? (yes/no)

### Pages to check for hydration warnings (dev mode, console open)

`/projects/`, `/skills/`, `/timeline/`, `/devices/`, `/games/`, `/friends/`, `/compass/`, `/anime/`: island props now carry `editablePath`, and the cards render region attributes and, in timeline/projects/games/friends lists, an inner `<span>` per string. FriendCard's avatar sits in a new span. Server and client get the same props, so no mismatch is expected.

## Shell (chunk 6)

Scope: home banner text, top app bar title, sidebar profile and announcement, footer. All of it sits in `MainGridLayout` on every page and binds to the settings YAML through `@data[<domain>_settings]`, so an edit saves to that settings file whichever page file is open. Swup is off in the editor (`data-no-swup`), so every page loads directly, and the shell scripts that run on Swup hooks don't run in the editor.

### Files changed

- `src/components/organisms/BannerStage.astro`: text regions on the home `<h1>` (`banner.homeText.title`) and subtitle `<p>` (`banner.homeText.subtitle.0`, only when the list has an entry); `.cms-editor-active` rule gives the regions back `pointer-events` (the copy layer has `pointer-events: none`)
- `src/components/organisms/TopAppBar.astro`: text region on the site title (`@data[site_settings].title`)
- `src/components/organisms/Profile.astro`: name and bio text regions; `<editable-image class="block">` around the avatar; links container is an array region, each link wrapped in a `span.flex` array item, the single-link label a `name` text region
- `src/components/molecules/Announcement.astro`: text regions on the content (when `content` is set), the link text, and the title through `WidgetLayout`; `closeAnnouncement()` does nothing in the editor
- `src/components/molecules/WidgetLayout.astro`, `src/components/atoms/blog/FooterBar.astro`: optional `nameProp` (text region on the name only when set)
- `src/components/organisms/Footer.astro`: passes `nameProp="@data[profile_settings].name"`
- `src/cloudcannon/registerComponents.ts`: registers nothing (decision 1); removes `srcset`/`sizes` from image-region `<img>` elements outside a `<picture>` when the editor loads
- `cloudcannon.config.yml` (outside chunk scope, decision 2): `home` collection (`site-settings/config`, glob `post-list.yaml`, `url: /`, `[visual, data]`, no add/rename/delete) in the Pages group; `post-list.yaml` excluded from `settings`

### Census rows covered

Rows are in the census above (chunk 6). As built:

- Banner (`/`): title, first subtitle — text
- Top app bar (all pages): site title — text
- Profile (all pages): name, bio — text; avatar — image; links — array (CRUD, no re-render)
- Announcement (shown on `/` only, per `sidebar.yaml`): title (when set), content, link text — text
- Footer (all pages, rendered twice: desktop and mobile copies): copyright name — text, bound to the profile name

Not wired, with reasons: banner images, navigation, navigation drawer, about title/description (census Justification column); footer theme copy and `footer.html` (developer-owned, configuration.md decision). Sidebar arrangement (`sidebar.yaml`) and the other widgets (categories, tags, series, stats, calendar, TOC, music) are generated from other files or settings with no rendered text of their own; they stay in the data panel.

### Findings

- **Registering a shell component costs every page, even though the component already renders there.** Experiment (reverted): `Announcement.astro` and a `ProfileLinks.astro` molecule registered in `registerComponents.ts` added `Button.css` and `IconButton.css` to all 47 pages, plus about 5.3 KB of inline `<style>`: 2 more stylesheet requests and about 9.4 KB linked CSS per page, every rule already present in the page's own CSS (checked per page: the unique rule count didn't change, the duplicate bytes rose by the same amount). Astro links the CSS of the client-side registration graph as separate chunks. So the shell uses primitive regions only.
- **`/` had no file to open it.** No collection had a URL of `/`, so the banner copy and the announcement (both shown only on the home page) were unreachable. `post-list.yaml` holds the home page's own settings (page size, card layout), so it becomes the home page's file.
- **`Profile.astro` can't be re-rendered in the browser as it stands**: `resolveImageAsset` imports `node:path`, which doesn't exist in the editor bundle. Any future registration of the profile needs the avatar resolution moved out of the rendered component.
- **Image regions on `<img srcset>`** keep showing the old image after a change (skill known issue). The profile avatar's `Avatar.svelte` `<img>` has a srcset, so the editor-only module strips `srcset`/`sizes` from image-region `<img>` elements at load. This also covers chunk 5's image regions that render with a srcset, until a section re-renders.
- **The banner copy layer has `pointer-events: none`**, which would make its text regions unclickable. An editor-only rule (`.cms-editor-active … [data-editable]`) restores pointer events on the regions only.
- **Two footer copies**: `MainGridLayout` renders the footer once inside `#content-wrapper` (desktop) and once below it (mobile), hidden by breakpoint. Both carry the name region; only the visible one can be clicked.

### Extra assets outside the editor (chunk 5 follow-up)

Checked on the build, against the page source:

- **The per-page script loads no registration code outside the editor.** Each `<page>.astro_astro_type_script_index_0_lang.*.js` (980–1,210 B, 630–736 B gzip) imports only `preload-helper`, which `Layout`'s script already loads, and calls `import("./<page>.*.js")` inside `if (window.inEditorMode)`. Outside the editor the cost is that one module request.
- **The duplicate stylesheet is a byte-identical copy of the page's own.** `ProjectSection.*.css` and `projects.*.css` share a hash and content. Per page, uncompressed / gzip: projects 10.7 KB / 2.1 KB, games 10.0 / 2.0, anime 9.7 / 2.1, devices 8.5 / 1.8, timeline 7.7 / 1.5, compass 5.0 / 1.2, friends 4.1 / 1.1; skills none.
- **Not removed, because no cheap fix exists.** Astro links the CSS of every module a page script reaches, dynamic imports included. Every way to load the registration from a page script puts the organism's CSS on that page: a shared Layout script with a map or `import.meta.glob` would put all eight sections' CSS on every page. Removing the CSS from the client graph would also strip it from the hydrated islands, which share the same Svelte modules. Untested alternative: start the editor-gated import from each organism's `onMount`, so no page script exists. That couples eight organisms to CloudCannon and depends on the island hydrating (`client:visible`), so it's left as an open question.

### Decisions and why

1. **Primitive regions only in the shell; `registerComponents.ts` registers nothing.** This revises Phase 4 global decision 2, which reserved that file for shell components on the assumption that their CSS was already on every page. It is, but registration links it again as separate files (finding 1). Text, image and array regions cover every visible value. Conditional parts (announcement link on/off, external icon, closable, empty-title fallback, banner text on/off, single versus multiple profile links) update after a save and rebuild.
2. **`home` collection for `/`** (config change outside chunk scope), the same reasoning as chunk 5's `feature_pages`: without it no editor reaches the banner or the announcement. Editing a banner region from the home page saves `site.yaml`, not the open `post-list.yaml`.
3. **Absolute `@data[...]` paths on every shell region**: with no component around them there is no relative scope. Inside the profile links array region, the item's own `name` is relative.
4. **Regions emit unconditionally on the shell's single-caller components** (BannerStage, TopAppBar, Profile, Announcement). `WidgetLayout` and `FooterBar` are shared, so their region is an optional `nameProp` (global decision 6).
5. **Footer name binds to the profile name**, its source (`profileConfig.name`), so it and the sidebar name edit the same value.
6. **Announcement content region only when `content` is set**: an older config's `text` key renders as a fallback, and a region on it would write `content`.

### Checks run

- `corepack pnpm build` exit 0 (`src/user/user-config.ts` restored after each build)
- `npx astro check`: 0 errors, 0 warnings
- `biome ci ./src`: passes (the existing warning in `remark-restore-bare-directives.mjs`)
- `check:package-manifest` ✓, `check:manifest` ✓, `cloudcannon validate` ✓
- `node --test` over `tests/**/*.test.mjs`: 778/780, the same two package-mode failures
- Asset references, all 47 pages, hashes stripped: identical to the build before this chunk
- Built HTML, on `/`, `/posts/markdown/` and `/projects/`: `banner.homeText.title`, `banner.homeText.subtitle.0`, `site_settings].title`, `profile_settings].name` ×3 (sidebar + two footers), `.bio`, `<editable-image data-prop-src="@data[profile_settings].avatar">`, `data-editable="array" data-prop="@data[profile_settings].links"` with 3 `array-item` spans, `announcement_settings].content`, `.link.text` (no title region: `title` is empty)

### Open questions

1. **Shell component re-rendering** — default: none (decision 1). Alternative: register the announcement and profile links for live updates of their toggles, at 2 stylesheet requests and about 15 KB of duplicate CSS on every page.
2. **Duplicate section CSS and the stub script on the eight feature pages** — default: keep (about 1–2 KB gzip CSS plus a 0.7 KB gzip script per page). Alternative: move the editor-gated import into each organism's `onMount` (untested; couples the organisms to CloudCannon).
3. **Home page file** — default: `post-list.yaml` opens `/`. Alternative: `site.yaml`, which holds the banner; it would then be both the open file and `@data[site_settings]` on the same page.
4. **Announcement line breaks** — the content input is a textarea rendered with `white-space: pre-line`; inline editing is a plain-text span region, which may not keep line breaks. Default: keep inline editing (the current content is one line). Phase 5 check below.

### Phase 5 checks (CloudCannon editor)

- Open **Pages → Home page → post-list.yaml** in the Visual Editor: does `/` load with the banner title and announcement? (yes/no)
- On `/`, click the banner title, type one word, save: does the commit change only `site-settings/config/site.yaml` `banner.homeText.title`? (yes/no)
- On any post, change the sidebar profile name inline and save: does the commit change only `site-settings/config/profile.yaml` `name`, and does the footer name show the new value before saving? (yes/no)
- On any post, click the avatar and pick another image from `src/assets/images`: does the new image show before saving? (yes/no)
- On `/`, add a line break inside the announcement text and save: is the line break in the saved `announcement.yaml` `content`? (yes/no, or paste the saved value)

### Pages to check for hydration warnings (dev mode, console open)

Every page carries the changed shell. Check `/`, `/posts/guide/` and `/about/`. Each profile link's `Tooltip` island now sits inside a `span.flex` wrapper. No island's props changed, and the other changes are attributes on server-rendered markup.
