import { registerSvelteComponent } from "@cloudcannon/editable-regions/svelte";
import { trackSettings } from "../live-settings";
import GamesSectionRegion from "../sections/GamesSectionRegion.svelte";

registerSvelteComponent("games-section", GamesSectionRegion);

trackSettings("games_settings", "games-section");
