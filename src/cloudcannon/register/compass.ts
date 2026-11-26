import { registerSvelteComponent } from "@cloudcannon/editable-regions/svelte";
import { trackSettings } from "../live-settings";
import CompassSectionRegion from "../sections/CompassSectionRegion.svelte";

registerSvelteComponent("compass-section", CompassSectionRegion);

trackSettings("compass_settings", "compass-section");
