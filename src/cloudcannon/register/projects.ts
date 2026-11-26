import { registerSvelteComponent } from "@cloudcannon/editable-regions/svelte";
import { trackSettings } from "../live-settings";
import ProjectsSectionRegion from "../sections/ProjectsSectionRegion.svelte";

registerSvelteComponent("projects-section", ProjectsSectionRegion);

trackSettings("projects_settings", "projects-section");
