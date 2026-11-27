# Phase 2 — Configuration (Shirone, chunk 1)

Scope: every collection (posts, series, moments, spec, snippets, albums), the settings and data-file collections and datasets, snippets for the markdown forms, build settings, and the overlay feasibility test (audit Decision 2). The settings YAML files and data JSON files the config points at don't exist yet; Phase 3 creates them to the shapes below.

## Files written

- `cloudcannon.config.yml`
- `.cloudcannon/initial-site-settings.json`
- `.cloudcannon/README.md` (editor-facing)
- `.cloudcannon/schemas/`: `post.md`, `series.md`, `moment.md`, `snippet.md`, `album.json`, `album-external.json`
- `.cloudcannon/inputs/`: `icon.cloudcannon.inputs.yml`, `sidebar-widget.cloudcannon.inputs.yml`, `category-key.cloudcannon.inputs.yml`
- `.gitignore`: added `.cloudcannon/migration/*.schema.json` (skill rule; the schemas are downloaded reference files)

## Validation

- `npx @cloudcannon/cli validate` (CLI 0.0.20) against the JSON schemas downloaded today into `.cloudcannon/migration/` (gitignored): every file valid, exit 0 — `cloudcannon.config.yml`, the three `*.cloudcannon.inputs.yml` files, `.cloudcannon/initial-site-settings.json`.
- Every literal icon checked with the schema's icon enum (`jq … .definitions.icon.enum | index($i)`), preview and picker icons included.
- No YAML anchors or aliases; every `type: markdown` input has an `options` block.
- URLs: for every file in posts, series, spec and albums, the computed URL exists as `dist/<url>index.html` in a fresh `corepack pnpm build`. All match; the only misses are the two drafts (`draft.md`, `markdown-fields.md`), which the build leaves out.

## Checklist

Shared (`cloudcannon-configuration/configuration.md` § Verification checklist), Astro and snippets items. "Phase 3" means the item applies to files Phase 3 creates and is configured here to the planned shape.

- [x] Structures: every array of objects links `options.structures: _structures.<name>`; every structure value has `preview` and `picker_preview`; nested objects (`anime progress`, `period`, settings objects) have `type: object` + preview icon
- [ ] Field completeness (rule 1) on real data: Phase 3, when it writes the JSON/YAML (each item carries every key of its structure value)
- [x] `npx @cloudcannon/cli validate` passes
- [x] `cloudcannon.config.yml` exists and is valid YAML
- [x] Build settings nested under `build`
- [x] The build command alone produces the complete output (`pnpm build` runs content sync, `astro build`, Pagefind and the font check)
- [x] `.cloudcannon/README.md` written
- [x] `collections_config` has an entry for every audit collection: posts, series, moments, spec, snippets, albums, plus `settings` and `data`
- [x] No defunct keys; no non-content directories
- [ ] No single-file collections: `spec` and `snippets` each hold one file — kept on purpose, see Decisions
- [x] `collection_groups`: Writing / Pages / Site
- [x] Every collection has a `url` with a trailing slash or `disable_url: true`
- [x] Every file with a `url` checked against `dist/`
- [x] No index pages with differing fields
- [x] `_inputs` for every front matter key in use (posts, series, moments, albums), and for every Zod field: post `publishedAt`, `updatedAt`, `license` (with `enable`, `name`, `url`, `author.name`, `author.url`, `source`), `alias` and `permalink` are typed with comments; the build-filled `prevUrl`, `nextUrl`, `prevTitle`, `prevSlug`, `nextTitle`, `nextSlug` are `hidden: true` (audit Decision 11). None of these are in the post schema, so they appear only on files that set them. `license` given as a plain string shows as text. Zod-required fields are `required: true`
- [x] Every select/multiselect has values (datasets, `_select_data`, collections or inline)
- [x] Icon fields: `type: select`, `value_key: id`, `values: data.icons`, `allow_create: true` (Iconify names), defined on every structure value with an `icon` through `_inputs_from_glob`
- [x] Enum-like keys in structure values (`status`, `phase`, `level`, `slot`, `column`, `preset`, `layout`, `columns`) are selects on the structure value
- [x] No bare numbers on text inputs (album `columns`, photo sizes, ratings, counts are `number`/select; grid `columns` stays a quoted string to match content)
- [x] `_schema` hidden; `mode` hidden
- [x] `file_config` uses the array format
- [x] `paths.uploads` set; `src/assets` image inputs override with `static: ""` (see Decisions — needs a Phase 3 resolver change)
- [x] `_enabled_editors` defaults correct per collection
- [x] `markdown.options.table: true` (tables in `guide`, `encrypted-demo`, `image-grid-demo`, `mdx-showcase`); `subscript`/`superscript` off; `escape_snippets_in_code_blocks: true`
- [x] Every schema default means the same as the key being absent (`draft: false`, `comment: true`, `hideHomeContent: true`, empty strings/arrays)
- [ ] Data files are top-level arrays: Phase 3 (configured with `$` array inputs)
- [x] `add_options` limit **+ Add**; `disable_add` on spec, settings, data; creatable options have `editor: content` (posts, moments, shared text), `new_preview_url` (series) or `editor: data` (albums, JSON)
- [x] Astro MDX gate: `mdx-showcase.mdx` is the only `.mdx` with components; it is kept out of the Content Editor (`_enabled_editors: [data]`), so the auto-import pipeline isn't needed — see Decisions
- [x] `node_version` follows the user's answer (`"26"`)
- [ ] Snippet round trips: can't be tested locally (no local snippet parser); listed for Phase 5 below

## Findings

### Overlay feasibility test (audit Decision 2): passes

Set up in the site, then removed (`shirone.content.json`, `site-settings/config/site.yaml`, `content.lock.json` deleted; `src/user/user-config.ts` restored with `git restore`; baseline rebuilt).

1. `shirone.content.json` = `{ schemaVersion: 1, source: { type: "path", path: "site-settings" }, mounts: { content: false, data: false, assets: false, public: false } }`, and `site-settings/config/site.yaml` with `title: Overlay Test A` and `banner.homeText.title: Banner Overlay A`.
2. `node scripts/content/sync.mjs`: `Materialized 0 files (updated 0, pruned 0), config overlays 1 (updated)`, exit 0. It accepts a path source with only the config overlay; no mount copies anything.
3. `corepack pnpm build` (no watcher, by hand): exit 0; `dist/index.html` has `<title>Overlay Test A - …>` and `Banner Overlay A` ×3. Nested objects merge (the rest of `banner` kept its defaults).
4. Changed both values to B, rebuilt by hand: `dist/` has B, and `grep -rl 'Overlay Test A' dist` finds nothing.
5. Re-running sync with the YAML unchanged leaves `src/user/user-config.ts` byte-identical (same sha1): the output is deterministic.
6. A misspelt key (`titel:`) fails sync with a `tsc` error naming the file and key ("Did you mean to write 'title'?"), exit 1.
7. **A key with no value (`subtitle:`, YAML null) fails sync**: "Keys without values in YAML parse to null; use "" to clear text, or [] to clear lists." `subtitle: ""` passes. So every settings input that can be cleared sets `empty_type` (`string` / `array`), and settings structure values default to `""`, never null.

What CloudCannon itself writes to the YAML (key order kept, comments dropped) is a CloudCannon-side check (Phase 5).

### Other findings that change later phases

- **`src/user/user-config.ts` is tracked by git**, and sync rewrites it from the YAML on every `dev`/`build`. Editors commit YAML without regenerating it, so a developer's next local build shows a change nobody made. See Phase 3 instructions.
- **The icon collection scans only `.astro .md .mdx .svelte .ts .tsx`** (`SOURCE_EXTENSIONS` in `src/integration/vite/icon/collections.ts`). Icon names that move into `src/data/*.json` would drop out of the build-time icon set and render nothing. Settings YAML compiles into `src/user/user-config.ts`, which is scanned.
- **An unknown icon name fails the build** ("Throws on an unknown icon name"). Only the installed sets resolve: `material-symbols`, `simple-icons`, `fa7-brands`, `fa7-solid`. The icon input's comment names them.
- **`src/assets` image paths** are written as `assets/images/...` (no leading slash, relative to `src/`); a leading `/` means `public/`. CloudCannon can't write that form: with `static: ""` it writes `/src/assets/images/...`, which the resolvers (`resolveImageAsset`/`resolveAsset` in `src/utils/asset-utils.ts`, and any other path resolver for banner, avatar, game covers, music covers) currently treat as a public path.
- **Optional Zod fields reject null.** CloudCannon writes null when an editor clears most inputs. `description`, `image`, `category`, `series`, `lang`, `password`, `passwordHint`, `location`, `mood` set `empty_type: string`; arrays set `empty_type: array`. Date inputs can only write null or `""`, both of which fail `z.date().optional()` — so clearing a post's **Last updated** (`updated`) fails the build. `seriesOrder` (number) has the same problem.
- **`_snippets_templates` with `ref:` fails `cloudcannon validate`**: the schema's `literal` option takes only a string and `key_values.models` only an array, so `literal: { ref: … }` and `models: { ref: … }` are rejected. Every snippet is written out in full instead.
- Code inputs have no `latex` syntax; the equation snippet's code input has no syntax set.
- Admonition openers: `:::type`, `:::type[label]` (label keeps inline markdown), and two title forms the theme rewrites to `{title="…"}` — `::: type Title` and `:::type Title`. Used outside code fences: `admonitions.md` (2 spaced), `encrypted-demo.md` (4 unspaced-with-title). GitHub alerts (`> [!IMPORTANT]`, `> [!TIP]`) in `admonitions.md` and `markdown-extended.md`.
- Single-line display math `$$I = \int \rho R^{2} dV$$` in `markdown.md` (line 165).

## Decisions and why

### Global decisions (later chunks follow these)

1. **Collection URLs**
   - posts: `/posts/[full_slug]/` — `[full_slug]` drops `index`, so `guide/index.md` → `/posts/guide/`; flat files → `/posts/<name>/`. Glob `**/*.md`, `**/*.mdx` (matches flat new files), `create.path` flat, `disable_add_folder: true`. Folder posts stay folders (audit Decision 9).
   - series: `/series/[slug]/`. spec: `/[slug]/` (`about.md` → `/about/`). albums: `/albums/[relative_base_path]/` (`AcgExample/info.json` → `/albums/AcgExample/`).
   - moments, snippets, settings, data: `disable_url: true`.
   - New files are named `{title|slugify|lowercase}` because Astro's glob ids are lowercase.
2. **Settings mechanism: the theme's YAML overlay**, confirmed by the test above. Location: `site-settings/config/<domain>.yaml`, read through a committed `shirone.content.json` (`source.type: "path"`, `path: "site-settings"`, all four mounts `false`). CloudCannon collection `settings` (path `site-settings/config`, glob `*.yaml`, `[data]`, no add/rename/delete). `src/config/*.ts` stays the defaults and docs source; each YAML holds only the editor-facing keys listed below.
3. **Data files: JSON beside the existing modules**, `src/data/<name>.json`, top-level arrays, imported by `src/data/<name>.ts`, which keeps its exports and types. CloudCannon collection `data` (path `src/data`, explicit glob list, `[data]`, no add/rename/delete).
4. **Datasets (`data_config`)**: every data JSON (`projects`, `skills`, `timeline`, `devices`, `games`, `friends`, `compass`, `anime`, `music`), three CMS lists (`icons`, `tags`, `categories`), and every settings file as `<domain>_settings` (`site_settings`, `profile_settings`, …, `llms_settings`). Phase 4 binds regions with `@data[<name>]` using these keys.
5. **Shared structures**: `project_items`, `skill_items`, `timeline_items` (+ `timeline_links`), `device_items`, `game_items`, `friend_items`, `compass_shelves` (+ `compass_entries`), `anime_items`, `music_tracks`, `moment_images`, `album_photos`, `profile_links`, `nav_links` (+ `nav_child_links`), `sidebar_widgets` (`id_key: type`), `page_categories`, `page_categories_described`, `llms_links`, `llms_sections`. Each value holds exactly the keys the existing items use (the type-only optional fields `website`, `image`, `specDetails`, `enable`, `identity` are left out; a developer can add them later).
6. **Category selects read the settings files**: an item's `category` uses `values: data.<feature>_settings.categories` with `value_key: key`, so editors pick from the categories defined on that page's settings. `disabledKeys` multiselects read the data file (`values: data.projects`, `value_key: key`; skills `name`, timeline `title`, devices/games `id`).
7. **Snippets**: one raw snippet per form, no templates (see Findings). Container directives use `:::name[[label]]\n[[body]]\n:::` with an optional `[title]` label; leaf directives use `::name[[attributes]]` with a `{…}` key/value boundary; text directives (`:spoiler[…]`, `:audio-reader[…]{src}`) are inline. Configured: `note`, `info`, `tip`, `important`, `warning`, `caution`, `details`, `steps`, `github`, `youtube`, `bilibili`, `acfun`, `artplayer`, `grid`, `file_tree`, `code_tree`, `collapse`, `spoiler`, `audio_reader`, `include`, `region_start`, `region_end`, `math_block`, `math_inline`, `abbreviation`, `footnote_reference`, `footnote`. File and code tree bodies are raw text (their `++`/`--`/`#` markers would be escaped by rich text). `marker` (`==text==`) and image width tokens need no snippet; they are plain text to the editor.
8. **Every post body round-trips through an editor save.** Snippets make each construct the editor would otherwise rewrite a unit it writes back unchanged:
   - `code_block_meta`: fences with options after the language (`title=`, `frame=`, `ins=`, `{1,4}`, `showLineNumbers`, ```` ```file-tree title="…" ````). It uses `strict_whitespace`, so plain fences stay native code blocks.
   - `option_group`, `field_group` and `field`: the `::: tabs`, `:::: field-group` and `::: field` containers, with raw bodies.
   - `marker`: `==text==` with an optional `{.variant}`.
   - `annotation`, `annotation_line` and `annotation_reference`: `[+label]` notes. The block snippet comes before the inline one.
   - `aligned_table`: tables whose delimiter row starts with `:`.
   - `mdx_imports`, `mdx_export`, `mdx_expression` and `html_block`: `mdx-showcase.mdx`'s import block, each `export const`, its `{authorInfo.…}` values and its top-level `<div>` blocks of HTML and Svelte components, all raw. `html_block` uses `strict_whitespace`, so only a `</div>` at the start of a line closes it.
   - The grid gets an `alternate_formats` entry for attribute-less `:::grid`. Every optional `key_values` model has `remove_empty: true`, so a save doesn't add `fit=""` or `icon=""`.
   - `abbreviation` trims its expansion.
   - `treat_indentation_as_code: true` keeps indented code blocks as code.
   
   Content uses the forms a save writes wherever the page renders the same: `\.` in numbered headings, `<code>` for the inline code that contains a fence, blank lines between one-line abbreviation and annotation definitions, and the reflowed bodies of `markdown.md` and `markdown-extended.md`. `encrypted-demo.md` uses a tight list, the form a save writes. No post is limited to the Data Editor.
9. **`markdown.options.code_block_fences: "~~~"`**, with the demo posts' outer four-backtick fences written as `~~~` (`steps.md`, `markdown-enhancements.md`, `collapse-panels.md`, `option-groups.md`, `image-grid-demo/index.md`). A save writes every fence in the body with this marker at three characters. With `` ``` `` the outer fence of a block that shows a ``` example comes out the same length as the inner one, and the example leaks into the post. With `~~~` the inner ``` lines stay code. The site renders `~~~` and ``` fences identically, so every saved file's fences turn to `~~~` with no change to the page. `excerptFromMarkdown` strips both fence styles.

### Other decisions

- **Editors**: posts, series, spec `[visual, content, data]`; moments and snippets `[content, data]` — they build no page, but their body is the content and reads best in the Content Editor (audit chose this; the checklist's `[data]` default would leave bodies to the Source Editor); albums, settings, data `[data]`.
- **`spec` and `snippets` stay single-file collections.** `spec/about.md` is read by a hard-coded route (`getEntry("spec", "about")`) shared with package mode; there is no `pages` collection to merge it into. `snippets` is where authors add include fragments, so it grows. Merging the two would give one collection two URL rules.
- **Post schema** omits `updated` and `seriesOrder` (an empty default fails Zod) and sets `remove_extra_inputs: false`, so files that have them keep them and show their inputs. New posts can't add them until Phase 3 makes them nullable (below).
- **Albums**: two schemas. `default` = folder album (images scanned from the folder, cover from `cover.webp`); `external` = photo list with `cover` and `photos`. **+ Add** offers only the photo-list album: a folder album needs files uploaded into a new folder, which the editor can't do from an input. New album path `{title|slugify|lowercase}/info.json`, glob `**/*.json` so a new flat file still matches.
- **Image paths**: global `static: public`, `uploads: public/images`. Public-path fields upload to their existing folders (`public/images/posts|moments|albums|friends`, `public/assets/projects|anime|music/url|audio`, `public/videos`). `src/assets` fields (banner images, avatar, game covers, music covers) use `static: ""` with uploads under `src/assets/...`.
- **Icons**: one developer-owned `icons` dataset (`src/data/icons.json`, `{ name, id }` objects, not in a collection), `allow_create: true` so any name in the installed sets can be typed.
- **Tags and categories**: editor-owned datasets `src/data/tags.json` and `src/data/categories.json` (arrays of strings, in the `data` collection). Posts and moments share `tags`; posts, series `defaultCategory` and `llms.excludeCategories` share `categories`. All allow new values.
- **Footer settings left out** of the editor-facing domains: `footer` is only an on/off switch for raw HTML injected from `src/config/FooterConfig.html` (empty and off by default). Editing raw HTML isn't an editor task, and the overlay would copy `footer.html` over a tracked file.
- **Settings page titles** stay text inputs that accept `$t:<key>` or literal text; the comment explains it. No i18n strings are exposed (audit Decision 5).
- **Build settings**: `install_command: npx pnpm@11.28.2 install --frozen-lockfile`, `build_command: pnpm build` (`manage-package-manager-versions = true` in `.npmrc` switches to the pinned pnpm), `output_path: dist`, `node_version: "26"` (user's answer; Astro 7.4.5 needs ≥ 22.23.4; `engines` unchanged). `mode: hosted`. The schema doesn't list available Node versions, so whether 26 is offered is a CloudCannon-side check; fall back to `"24"`.
- **Timezone**: `Asia/Shanghai`, from `siteConfig.timeZone`.

## Phase 3 instructions

### Chunk 2 — settings layer

1. Commit `shirone.content.json` exactly as in the test (path source `site-settings`, four mounts `false`). Check `docs/packaging-contract.md`: the manifest must not ship in the `shirones` package or change package-mode defaults.
2. Create `site-settings/config/<domain>.yaml` for each domain below, seeded with the **current values** from `src/config/<domain>Config.ts` so the built site doesn't change. No comments in the YAML. No bare keys: empty text is `""`, empty lists `[]`.
   - `site.yaml`: `title`, `subtitle`, `lang`, `themeColor.hue`, `banner.src.desktop[]`, `banner.src.mobile[]`, `banner.position`, `banner.dim.{enable,opacity}`, `banner.homeText.{enable,title,subtitle[]}`, `banner.homeText.typewriter.enable`, `banner.carousel.{enable,interval,animation}`, `banner.waves.enable`
   - `profile.yaml`: `avatar`, `name`, `bio`, `links[]` (`name`, `icon`, `url` — this key order)
   - `announcement.yaml`: `title`, `content`, `closable`, `link.{enable,text,url,external}`
   - `nav-bar.yaml`: `links[]` reproducing today's menu: `preset: Home`, `Archive`, `Friends`, `Moments`, `Anime`, `Compass`, `Albums`, then `{ name: "$t:more", icon: material-symbols:apps-rounded, children: [preset Timeline, Projects, Devices, Games, Skills, About, GitHub] }`. Confirm the built menu is unchanged.
   - `sidebar.yaml`: `enable`, `arrangement`, `side`, `components[]` — every widget written with `type`, `enable`, `slot`, `column` (`primary` where unset), `pages` (`[]` where unset; empty means every page, per `isWidgetVisibleOnPage`), and `collapseAfter` on categories/series/tags
   - `post-list.yaml`, `article.yaml`, `license.yaml`: all keys of the current defaults
   - `about`, `friends`, `moments`, `albums`, `compass`, `anime`, `series`: `enable`, `title`, `description`, plus `pageSize` (friends, anime) and `cardPosition` (series)
   - `projects`, `skills`, `timeline`, `devices`, `games`: `enable`, `title`, `description`, `categories[]` (key, label, icon; devices/games also description), `disabledKeys: []`, and `order` (timeline)
   - `llms.yaml`: `enable`, `generateFull`, `siteSummary`, `descriptionMaxLength`, `excludeTags`, `excludeCategories`, `corePages[]`, `customSections[]`
   - Not exposed: permalink, expressive-code, comment, context-menu, fab, footer, image-bloom, music, font, umami, i18n.
3. **`src/user/user-config.ts`**: recommended — untrack it (`git rm --cached`, add to `.gitignore`), and make sure every script that type-checks without building runs sync first (`check`, `type-check`, CI `astro check`), so a fresh clone still has the file. Fallback if that breaks package mode or CI: keep it tracked and regenerate and commit it whenever the YAML changes, accepting the local diff after editor edits. Record which in `content.md`.
4. Build twice and confirm `dist/` is unchanged from the baseline apart from expected differences (none expected).

### Chunk 3 — data files, albums, front matter, content normalisation

1. **Data JSON**: write `src/data/{projects,skills,timeline,devices,games,friends,compass,anime,music}.json` as top-level arrays from the current `.ts` arrays. Every item carries every key of its structure value (`cover: ""`, `featured: false`, `links: []`, …) in the structure's key order. The `.ts` modules import the JSON and re-export it with their types (cast; see `astro/configuration-gotchas.md § TypeScript config values`), keeping helper functions. Check `docs/packaging-contract.md` for how `src/data/*.ts` reaches package mode; the JSON must travel with it.
2. Check every consumer treats `""`, `0` and `[]` as absent where the old field was optional: project/game `cover`, `repository`, `link`, `year`; game `rating`/`hours` (guard `> 0`); music `duration`; anime `cover`, `link`.
3. **Icon scan**: add `.json` (and `.yaml`, if any icon names live outside the compiled overlay) to `SOURCE_EXTENSIONS` in `src/integration/vite/icon/collections.ts`, or the icons in the JSON drop out. Confirm the generated collection still holds every icon the pages render.
4. **CMS lists**: create `src/data/icons.json` (`[{ name, id }]`, every icon name in use across data, settings and moments, names derived per configuration-gotchas.md), `src/data/tags.json` and `src/data/categories.json` (arrays of strings: every tag and category in use in posts, moments and series).
5. **`src/assets` paths**: make the image resolvers accept `/src/<path>` as the local path `<path>` (`resolveImageAsset`/`resolveAsset` and any banner/avatar/game/music cover resolver). Then normalise existing `src/assets` values in the new YAML/JSON to `/src/assets/...` so editor previews and new uploads share one form. Build and confirm images are still optimised.
6. **Albums**: add `"_schema": "external"` to `ExternalExample/info.json` and `EncryptedExample/info.json`.
7. **Zod**: make post `updated` and `seriesOrder` accept null (`.nullish()`, or a preprocess turning `null`/`""` into `undefined`), check their consumers, then add both to `.cloudcannon/schemas/post.md` with empty values. Same check for moment `password`. Keep both modes working (`astro check` 0 errors).
8. **Normalise admonitions** to the bracket form: `::: note Deployment context` → `:::note[Deployment context]`, `::: details Inspect the complete command` → `:::details[Inspect the complete command]` (`admonitions.md`), and the four `:::type Title` lines in `encrypted-demo.md`. Convert the GitHub alerts (`admonitions.md` line 27, `markdown-extended.md` line 89) to `:::important` / `:::tip`. Diff the built HTML of those two posts before and after; if the label form renders differently from the `{title="…"}` form, use `:::type{title="…"}` and tell Phase 2's owner to add that form to the snippets.
9. **Math**: put the single-line `$$…$$` in `markdown.md` on its own lines.
10. Re-run the URL check and the front matter key diff against the real files.

## Phase 5 checks (CloudCannon side)

- Node 26 offered on CloudCannon; otherwise set Node to 24.
- Snippet round trips: open each of these in the Content Editor, change nothing, save; the diff should be empty — `admonitions.md`, `encrypted-demo.md`, `markdown-extended.md`, `video.md`, `steps.md`, `markdown-enhancements.md` (file/code tree), `image-grid-demo/index.md`, `collapse-panels.md`, `spoilers.md`, `audio-reader.md`, `markdown-includes.md`, `snippets/include-example.md` (regions), `markdown.md` (math, footnote), `markdown-abbreviations.md`, `spec/about.md`. Most at risk: inline math next to `$$` blocks, the optional `[label]`, consecutive abbreviation lines, and fenced-code info strings (`title=`, `ins={…}`) in `expressive-code.md`.
- A settings edit in CloudCannon writes YAML the overlay accepts (no nulls, key order kept) and the change appears after the build.

## Open questions

1. **Single-file collections** (`spec`, `snippets`) — default: keep both (Decisions). Alternative: hide the About body behind a settings entry, which needs a route change.
2. **Admonition normalisation** changes the wording of the `admonitions.md` demo, which shows the spaced title form as a feature — default: normalise (Phase 3 step 8). Alternative: keep `admonitions.md` out of the Content Editor too.
3. **`src/user/user-config.ts` tracking** — default: untrack and sync before type checks (Phase 3 chunk 2 step 3).
4. **Footer HTML** left developer-only — default: yes.
5. **Album creation** offers only photo-list albums — default: yes; folder albums are set up by a developer.
6. **Icons typed by editors** fail the build if misspelt or outside the four installed sets — default: allow typing (`allow_create: true`) with the comment; alternative: `allow_create: false` and a curated list only.
