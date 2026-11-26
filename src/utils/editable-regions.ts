/**
 * Region attributes for CloudCannon's Visual Editor on items that come from a
 * data file. Items carry `editablePath` (`@data[<key>].<index>`); without it
 * every helper returns no attributes, so other callers render unchanged.
 *
 * Feature pages filter, sort and paginate their items, so the regions bind by
 * each item's index in the data file rather than through an array region.
 */

export interface EditablePath {
	editablePath?: string;
}

type RegionAttributes = Record<string, string>;

export function textRegion(
	base: string | undefined,
	field: string,
): RegionAttributes {
	return base
		? { "data-editable": "text", "data-prop": `${base}.${field}` }
		: {};
}

export function imageRegion(
	base: string | undefined,
	field: string,
): RegionAttributes {
	return base
		? { "data-editable": "image", "data-prop-src": `${base}.${field}` }
		: {};
}

/** A list of strings inside one item: rendered whole and in order, so it takes an array region. */
export function arrayRegion(
	base: string | undefined,
	field: string,
): RegionAttributes {
	return base
		? { "data-editable": "array", "data-prop": `${base}.${field}` }
		: {};
}

export function arrayItemRegion(base: string | undefined): RegionAttributes {
	return base ? { "data-editable": "array-item" } : {};
}

/** The string itself, inside an `arrayItemRegion`. */
export function valueRegion(base: string | undefined): RegionAttributes {
	return base ? { "data-editable": "text", "data-prop": "" } : {};
}

/**
 * Adds `editablePath` to each item found in `source` (the data file's array),
 * matched by `keyOf`. Items not in the data file get no path.
 */
export function withEditablePaths<T>(
	items: readonly T[],
	source: readonly T[],
	dataKey: string,
	keyOf: (item: T) => string | number,
): (T & EditablePath)[] {
	const indexByKey = new Map<string | number, number>();
	source.forEach((item, index) => {
		const key = keyOf(item);
		if (!indexByKey.has(key)) indexByKey.set(key, index);
	});
	return items.map((item): T & EditablePath => {
		const index = indexByKey.get(keyOf(item));
		return index === undefined
			? ({ ...item } as T & EditablePath)
			: { ...item, editablePath: `@data[${dataKey}].${index}` };
	});
}
