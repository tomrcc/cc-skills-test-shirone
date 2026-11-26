<script lang="ts">
/** The devices page section, re-rendered in CloudCannon's Visual Editor from the edited data file and page settings. */
import DeviceSection from "@components/organisms/DeviceSection.svelte";
import { devicesSectionProps } from "@utils/feature-sections";
import { devicesConfig } from "@/config/devicesConfig";
import type { DeviceItem, DevicesConfig } from "@/types/devicesConfig";

let {
	items = [],
	settings = {},
}: { items?: DeviceItem[]; settings?: Partial<DevicesConfig> } = $props();

const sectionProps = $derived(
	devicesSectionProps({ ...devicesConfig, ...settings }, items),
);
</script>

<DeviceSection {...sectionProps} />
