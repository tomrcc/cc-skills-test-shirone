import { registerSvelteComponent } from "@cloudcannon/editable-regions/svelte";
import { trackSettings } from "../live-settings";
import AnimeSectionRegion from "../sections/AnimeSectionRegion.svelte";

registerSvelteComponent("anime-section", AnimeSectionRegion);

trackSettings("anime_settings", "anime-section");
