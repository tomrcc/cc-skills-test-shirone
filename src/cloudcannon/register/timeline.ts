import { registerSvelteComponent } from "@cloudcannon/editable-regions/svelte";
import { trackSettings } from "../live-settings";
import TimelineSectionRegion from "../sections/TimelineSectionRegion.svelte";

registerSvelteComponent("timeline-section", TimelineSectionRegion);

trackSettings("timeline_settings", "timeline-section");
