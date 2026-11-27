// Loaded only inside CloudCannon's Visual Editor (see `layouts/Layout.astro`).
// Registers nothing: Astro links the CSS of every component imported here on
// every page, duplicating rules the page already has. Feature pages register
// from `register/<page>.ts`; the shell uses primitive regions only.
import "@cloudcannon/editable-regions/astro-svelte-renderer";

// An image region updates `src` only, so a plain `<img srcset>` would keep
// showing the old image after an edit.
for (const img of document.querySelectorAll<HTMLImageElement>(
	':is([data-editable="image"], editable-image) img[srcset], img[data-editable="image"][srcset]',
)) {
	if (img.parentElement?.tagName === "PICTURE") continue;
	img.removeAttribute("srcset");
	img.removeAttribute("sizes");
}

// CloudCannon appends its snippet menu to <body> at z-index 11, under the
// z-30 `#main-layout`; z-40 keeps it above the page and below the z-50 navbar.
// The extra selector parts outrank CloudCannon's own `#cms-controls-wrapper` rule.
const controlsLayer = document.createElement("style");
controlsLayer.textContent =
	"html body > #cms-controls-wrapper { z-index: 40; }";
document.head.append(controlsLayer);
