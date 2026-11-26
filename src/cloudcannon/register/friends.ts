import { registerSvelteComponent } from "@cloudcannon/editable-regions/svelte";
import { trackSettings } from "../live-settings";
import FriendsSectionRegion from "../sections/FriendsSectionRegion.svelte";

registerSvelteComponent("friends-section", FriendsSectionRegion);

trackSettings("friends_settings", "friends-section");
