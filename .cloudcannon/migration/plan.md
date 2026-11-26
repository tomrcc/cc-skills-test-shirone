# Migration plan

## Sizing

- Total pages: 41 (threshold >30: tripped)
- Hardcoded → YAML conversions: 0 (threshold >15: ok)
- Distinct collections: 6 (threshold >5: tripped)
- Tripped: 2/3

## Shape

horizontal — because: the collections are uniform markdown/JSON, and the real work is two cross-cutting layers (settings + data files, then Svelte organisms in the Visual Editor) that benefit from one mental model at a time.

## Chunks

Each row is one subagent dispatch, run in order. Phases 2 and 5 are one row each.

| #   | Scope | Phase | Inputs | Output |
| --- | ----- | ----- | ------ | ------ |
| 1 | All collections (posts, series, moments, spec, snippets, albums), settings + data files, snippets for markdown forms, build settings; includes the overlay feasibility test (audit Decision 2) | 2 | audit.md | configuration.md |
| 2 | Settings layer: overlay folder + `shirone.content.json`, YAML for the editor-facing domains, package-mode checks | 3 | audit.md, configuration.md | content.md (settings section) |
| 3 | Data files (`src/data/*.ts` → JSON/YAML imported by the `.ts` modules), albums `info.json`, post/series/moment front matter fixes, math normalisation | 3 | audit.md, configuration.md, content.md | content.md (data + collections section) |
| 4 | Editable-regions setup in `src/integration/` (both modes), Svelte renderer, load-time patches (onload-animation, banner, Swup), post/series/about body and title regions | 4 | audit.md, configuration.md, content.md | visual-editing.md (setup + detail pages) |
| 5 | Feature pages: projects, skills, timeline, devices, games, friends, compass, anime, moments, albums — register and wire the `*Section.svelte` organisms to their data files | 4 | all above | visual-editing.md (feature pages section) |
| 6 | Shell: home banner text, sidebar profile + announcement, footer | 4 | all above | visual-editing.md (shell section) |
| 7 | Build and test | 5 | all notes | build.md |

## Global decisions (set by the first chunk of each phase; later chunks follow them)

- Collection URL patterns (posts incl. folder `index.md`, series, albums; data collections `disable_url: true`)
- Settings mechanism (YAML overlay vs imported data files) and file locations
- Shared structures (`_structures`) for data arrays (projects, skills, timeline, devices, games, friends, compass, anime)
- Snippet configs for the markdown directive forms (from `src/plugins/markdown/manifest.json`)
- Editable-regions setup: `editableRegions()` added through `src/integration/index.ts`, `src/cloudcannon/registerComponents.ts` with the Svelte renderer, `componentMap.ts`; package mode stays working

### Phase 3 (set by chunk 2; details in content.md § Global decisions for Phase 3)

- Settings: the theme's overlay, `site-settings/config/<domain>.yaml` via the committed `shirone.content.json`. Each file holds every editor-facing key, seeded with the current default, in structure key order; no nulls.
- `src/user/user-config.ts` stays committed as the empty module. Builds regenerate it; restore it (`git restore`) before handing over or committing.
- Parity: `node .parity-baseline/_compare.mjs .parity-baseline dist` after each change. The last Phase 3 chunk deletes `.parity-baseline/` and its `.gitignore` line.
- Round trips: back up, change values with `yaml` `parseDocument().setIn()`, build by hand, find each value in `dist/`, restore, rebuild, re-compare.

### Phase 4 (set by chunk 4; details in visual-editing.md § Global decisions for Phase 4)

- Setup: `editableRegions()` in `createBundledIntegrations()` (`src/integration/index.ts`), so both modes get it. `src/cloudcannon/registerComponents.ts` imports the Svelte renderer and loads from Layout's existing script under `window.inEditorMode`. No `componentMap.ts`: there is no page builder.
- Registration: `registerComponents.ts` links every registered component's CSS on all pages (measured), so it holds shell components only (chunk 6). Feature pages register in `src/cloudcannon/register/<page>.ts`, imported by an editor-gated `<script>` in that route (chunk 5). Compare per-page asset references before and after each registration.
- Svelte organisms: `registerSvelteComponent("<feature>-section", …)`, wrapped in `<editable-component>` at the route call site. Arrays bind with lowercase `data-prop-<name>` (values must be objects); use a thin wrapper when props are camelCase or pre-filtered by `feature-data.ts`. Put the Svelte `EditableRegions` root inside each hydrated island that holds regions.
- Data files: `@data[<data_config key>]` — `@data[projects]` etc. for arrays, `@data[<domain>_settings]` for settings (`nav_bar_settings`). Don't put text regions on `$t:` i18n references.
- Load-time: editor mode uses the theme's `motion-reduced` mode plus `data-no-swup` on `<html>`; the banner keeps its rendered copy; the lightbox is off. New regions need no motion patches.
