import { registerSvelteComponent } from "@cloudcannon/editable-regions/svelte";
import { trackSettings } from "../live-settings";
import SkillsSectionRegion from "../sections/SkillsSectionRegion.svelte";

registerSvelteComponent("skills-section", SkillsSectionRegion);

trackSettings("skills_settings", "skills-section");
