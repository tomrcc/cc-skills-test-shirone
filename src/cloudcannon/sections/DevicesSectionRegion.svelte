<script lang="ts">
/** The devices page section, re-rendered in CloudCannon's Visual Editor from the edited data file and page settings. */
import DeviceSection from "@components/organisms/DeviceSection.svelte";
import { devicesSectionProps } from "@utils/feature-sections";
import { liveSettings } from "@/cloudcannon/live-settings";
import { devicesConfig } from "@/config/devicesConfig";
import type { DeviceItem, DevicesConfig } from "@/types/devicesConfig";

// The wrapper binds the whole data file as the base prop, so the props object is the array itself.
const items: ArrayLike<DeviceItem> = $props();

const sectionProps = $derived(
	devicesSectionProps(
		{
			...devicesConfig,
			...(liveSettings("devices_settings") as Partial<DevicesConfig>),
		},
		Array.from(items),
	),
);
</script>

<DeviceSection {...sectionProps} />
