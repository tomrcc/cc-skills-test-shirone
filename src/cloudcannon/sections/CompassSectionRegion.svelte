<script lang="ts">
/** The compass page section, re-rendered in CloudCannon's Visual Editor from the edited data file and page settings. */
import CompassSection from "@components/organisms/CompassSection.svelte";
import { compassSectionProps } from "@utils/feature-sections";
import { liveSettings } from "@/cloudcannon/live-settings";
import { compassConfig } from "@/config/compassConfig";
import type { CompassShelf } from "@/data/compass";
import type { CompassConfig } from "@/types/compassConfig";

// The wrapper binds the whole data file as the base prop, so the props object is the array itself.
const items: ArrayLike<CompassShelf> = $props();

const sectionProps = $derived(
	compassSectionProps(
		{
			...compassConfig,
			...(liveSettings("compass_settings") as Partial<CompassConfig>),
		},
		Array.from(items),
	),
);
</script>

<CompassSection {...sectionProps} />
