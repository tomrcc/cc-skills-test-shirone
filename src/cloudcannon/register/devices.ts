import { registerSvelteComponent } from "@cloudcannon/editable-regions/svelte";
import { trackSettings } from "../live-settings";
import DevicesSectionRegion from "../sections/DevicesSectionRegion.svelte";

registerSvelteComponent("devices-section", DevicesSectionRegion);

trackSettings("devices_settings", "devices-section");
