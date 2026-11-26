# Phase 5 — Build and test (Shirone)

## Files changed

- `cloudcannon.config.yml` — albums `_enabled_editors` gains `visual` (see Decisions)

## Build verification checklist

- [x] Full build: `.astro/` and `dist/` cleared, then `npx pnpm@11.28.2 install --frozen-lockfile` and `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm build`. Exit 0. No `build.environment_variables` to set. Warnings are all pre-existing: pnpm "Unsupported engine" (local Node 24.22.1 against `>=26.13.0`), a Vite chunk-size notice, npm's "Unknown project config manage-package-manager-versions".
- [x] Frozen install from an empty store: `node_modules` removed, install run with `--store-dir` pointing at an empty gitignored folder, "Done … using pnpm v11.28.2", exit 0. `node_modules` then reinstalled against the default store and the temporary store deleted.
- [x] Regions in the output (`data-editable` counts):
  - `/`: 9 text, 1 array, `<editable-image>` avatar (banner title, subtitle, profile, announcement)
  - `/posts/guide/`: 11 text, 1 array, 1 image (cover)
  - `/about/`: 10 text, 1 array
  - `/series/markdown-syntax-guide/`: 11 text, 1 array
  - `/projects/`: `<editable-component>`, 26 text, 4 array, 1 image
  - `/albums/AcgExample/`, `/moments/`: 9 text, 1 array (shell only)
- [x] `registerComponents.ts` is bundled: `dist/_astro/registerComponents.*.js`, imported from the Layout script chunk; the feature-page `register/<page>.ts` scripts appear as `<page>.astro_astro_type_script_*` chunks.
- [x] Config validates: `npx @cloudcannon/cli validate` passes (config, three inputs files, `initial-site-settings.json`).
- [x] Collection URLs match the build: every file in posts, series, albums, spec, home and feature_pages has `dist/<url>index.html`. The only misses are the drafts `draft.md` and `markdown-fields.md`, which the build leaves out.
- [x] Schema keys resolve: posts, series, moments and snippets files name no `_schema` (all `default`); the two photo-list albums name `external`; every `add_options[].schema` is a key under its collection's `schemas`.
- [x] Search index: the build runs Pagefind after `astro build`; `dist/pagefind/` exists (22 pages indexed).
- [x] Schema round-trip: no file in posts, series, moments, snippets or albums is missing a schema key, so no fill-and-compare run was needed. Snippet files have no front matter, matching their schema.
- [x] `prose` audit: `ProtectedPost.svelte` uses `prose`; `@tailwindcss/typography` is a dependency, registered with `@plugin` in `src/styles/main.css` after `@import "tailwindcss"` and the `@source` line; `.prose` rules are in the built CSS.
- [ ] No hydration errors: no browser in this session. Pages listed in the hand-off for the user.
- [x] `src/user/user-config.ts` restored after every build.

## Findings

- `cloudcannon configure detect-build-commands` (CLI 0.0.20) suggests Hugo with output `public`: `detect-ssg` scores Hugo 60, Astro 50, because the Hugo detector treats any path containing `/config/` as a Hugo config directory, and the settings overlay lives in `site-settings/config/`. The hosted site is unaffected (`initial-site-settings.json` sets `ssg: astro` and `output_path: dist`). Locally, ignore the suggestion and serve `dist`.
- `cloudcannon dev dist` starts from the site folder and serves the build: `/__api/details` reports `siteName: Shirone`, `outputDir: dist`; `/__output/index.html` and `/__output/albums/AcgExample/index.html` return 200. Started on a checked-free port, then stopped.

## Decisions and why

1. **Albums open in the Visual Editor** (`_enabled_editors: [visual, data]`). Each album has a built page at its collection URL, and the page carries the shell regions (profile, announcement, avatar), so editors get a preview of the album beside its `info.json` fields in the sidebar, matching how `feature_pages` and `home` open. The album grid itself stays without regions (visual-editing.md, chunk 5). `add_options` keep `editor: data`, because a new album has no page until the next build.
2. **Install command stays `npx pnpm@11.28.2 install --frozen-lockfile`.** It runs the exact pnpm in `packageManager`, which is what Corepack does locally. Node 25 and later no longer ship Corepack, so a `corepack pnpm install` install command could fail on CloudCannon's Node 26. Locally, keep using `corepack pnpm …` on Node 24.
3. **Build command stays `pnpm build`.** `.npmrc` sets `manage-package-manager-versions = true`, so CloudCannon's preinstalled pnpm switches to 11.28.2 from `packageManager`, and the script itself only chains content sync, `astro build`, Pagefind and the font check.
4. **`node_version: "26"`** per the user, satisfying `engines >=26.13.0`. If CloudCannon doesn't offer 26, set 24: the full build passes locally on 24.22.1 with only the engine warning. `engines` unchanged.
5. **Output path `dist`**, as built.

## Open questions

1. **Node 26 on CloudCannon** — default `"26"`; if the build log shows a different version or the setting rejects it, use `"24"`.
2. **Album visual editing** — default on (Decision 1). Alternative: back to `data` only if the album preview is slow or confusing for editors.

## Commands (run from the site folder)

Site folder: `/Users/tomrichardson/Dev/work/skills-work/migration-tests/migrated/astro/shirone`

Install (once per clone or lockfile change):

```sh
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm install --frozen-lockfile
```

(a) Run the site locally:

```sh
corepack pnpm dev                      # http://localhost:4321 (Astro takes the next port if busy)
corepack pnpm build                    # production build into dist/
corepack pnpm preview --port 4322      # serves dist/
git restore src/user/user-config.ts    # after any dev or build, before committing
```

(b) Run the CloudCannon dev server locally:

The migration is uncommitted, and editor saves write straight into the working tree. To tell the two apart, commit the migration first, or note `git status --short` before testing.

```sh
corepack pnpm build
lsof -nP -iTCP:10101 -sTCP:LISTEN      # no output means the port is free
npx @cloudcannon/cli dev dist --port 10101
```

Open `http://localhost:10101`. The server never builds: after edits, run `corepack pnpm build` in a second terminal and the preview reloads. Ctrl-C stops the server. Afterwards, review with `git diff` and run `git restore src/user/user-config.ts`. Ignore `detect-build-commands`' Hugo/`public` suggestion (Findings).

## Hand-off checklist

Checks already run here: clean frozen install with pnpm 11.28.2, `corepack pnpm build` exit 0, `@cloudcannon/cli validate`, URL-to-build match for every collection file, schema key coverage, region counts in `dist/`, local `cloudcannon dev` start.

### Build settings (CloudCannon)

1. Does the first CloudCannon build succeed? (yes/no; if no, paste the last 30 lines of the build log)
2. Paste the build log line that names the Node version.
3. Paste the build log line ending "using pnpm v…".

### Hydration (local browser, console open)

Serve production with `corepack pnpm build && corepack pnpm preview --port 4322`, open each page, and paste any console error or hydration warning (or "none"):

`/`, `/posts/guide/`, `/posts/markdown/`, `/about/`, `/series/markdown-syntax-guide/`, `/projects/`, `/skills/`, `/timeline/`, `/devices/`, `/games/`, `/friends/`, `/compass/`, `/anime/`, `/moments/`, `/albums/`, `/albums/AcgExample/`

Then `corepack pnpm dev` and repeat for `/`, `/posts/guide/`, `/projects/`, `/moments/`, `/albums/AcgExample/` (dev-mode warnings, audit open question 7).

### Visual Editor (CloudCannon)

4. Open **Pages → Home page → post-list.yaml** in the Visual Editor: does `/` load with the banner title and announcement? (yes/no)
5. On `/`, click the banner title, type one word, save: does the commit change only `banner.homeText.title` in `site-settings/config/site.yaml`? (yes/no)
6. On `/`, does the banner subtitle stay still (no typing, no carousel change) for 10 seconds? (yes/no)
7. On `/`, add a line break inside the announcement text and save: paste the saved `content` value from `site-settings/config/announcement.yaml`.
8. On any post, change the sidebar profile name inline and save: does the commit change only `name` in `site-settings/config/profile.yaml`? (yes/no)
9. On that post, does the footer name show the new value before saving? (yes/no)
10. On any post, click the avatar and pick another image from `src/assets/images`: does the new image show before saving? (yes/no)
11. Open `/posts/guide/`: does the cover image show? (yes/no)
12. On `/posts/markdown/`, click the body, change one word, save: does the git diff show only that word changed (math and footnotes intact)? (yes/no)
13. Open **Feature pages → projects.yaml**: does `/projects/` load with the cards? (yes/no)
14. On `/projects/`, click a project title, type one word, save: does the commit change only that project in `src/data/projects.json`? (yes/no)
15. On `/projects/`, change a summary from the component's data panel: do the cards sit without overlapping after the update? (yes/no)
16. On `/games/`, pick a new cover for one game: does it show before saving? (yes/no)
17. On `/friends/`, click an avatar: does the image picker open? (yes/no)
18. Open **Albums → AcgExample** (`info.json`): does it open in the Visual Editor on `/albums/AcgExample/` with the album fields in the sidebar? (yes/no)

### Content Editor round trips (CloudCannon)

19. Open each file below in the Content Editor, change one word in the body, save. Does each git diff show only that word changed in the body? (yes, or paste the names of the files with extra changes)
    `admonitions.md`, `encrypted-demo.md`, `markdown-extended.md`, `video.md`, `steps.md`, `markdown-enhancements.md`, `image-grid-demo/index.md`, `collapse-panels.md`, `spoilers.md`, `audio-reader.md`, `markdown-includes.md`, `markdown.md` (math, footnotes), `markdown-abbreviations.md`, `expressive-code.md` (fence `title=`, `ins={…}`), `src/content/snippets/include-example.md`, `src/content/spec/about.md`

### Settings and data files (CloudCannon)

20. Change one value in a **Site settings** file and save: after the build, does the change show on the site, and is the saved YAML free of `null` values? (yes/no)
21. After saving one file in **Page data**, does `corepack pnpm exec biome ci ./src` pass on a pull? (yes, or paste the first error)
