/**
 * Page settings for the feature sections in CloudCannon's Visual Editor.
 *
 * Each section's `<editable-component>` binds only its data file as the base
 * prop: editable-regions clones keyed props with `structuredClone`, which
 * fails on a whole `@data[...]` dataset. The settings file is read here
 * instead, and a change to it re-renders the section.
 */
type Settings = Record<string, unknown>;

interface EditorFile {
	data: { get: () => Promise<unknown> };
}

interface EditorDataset extends EventTarget {
	items: () => Promise<EditorFile | EditorFile[]>;
}

interface EditorApi {
	dataset: (key: string) => EditorDataset;
}

const current: Record<string, Settings> = {};

/** The latest settings, or an empty object before the first read. */
export function liveSettings(dataKey: string): Settings {
	return current[dataKey] ?? {};
}

function editorApi(): Promise<EditorApi> {
	const read = () =>
		(
			window as unknown as {
				CloudCannonAPI: {
					useVersion: (version: "v1", local: boolean) => EditorApi;
				};
			}
		).CloudCannonAPI.useVersion("v1", true);
	if ("CloudCannonAPI" in window) return Promise.resolve(read());
	return new Promise((resolve) => {
		document.addEventListener("cloudcannon:load", () => resolve(read()), {
			once: true,
		});
	});
}

/** Keeps `liveSettings(dataKey)` current and re-renders `component` when it changes. */
export async function trackSettings(
	dataKey: string,
	component: string,
): Promise<void> {
	const dataset = (await editorApi()).dataset(dataKey);
	const read = async () => {
		const items = await dataset.items();
		const file = Array.isArray(items) ? items[0] : items;
		const data = await file?.data.get();
		current[dataKey] =
			data && typeof data === "object" && !Array.isArray(data)
				? (data as Settings)
				: {};
	};
	const rerender = () => {
		for (const element of document.querySelectorAll(
			`editable-component[data-component="${component}"]`,
		)) {
			const editable = (
				element as unknown as {
					editable?: { mounted: boolean; update: () => unknown };
				}
			).editable;
			if (editable?.mounted) editable.update();
		}
	};
	await read();
	rerender();
	dataset.addEventListener("change", () => {
		read().then(rerender);
	});
}
