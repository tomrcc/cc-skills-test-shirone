<script lang="ts">
/** The compass page section, re-rendered in CloudCannon's Visual Editor from the edited data file and page settings. */
import CompassSection from "@components/organisms/CompassSection.svelte";
import { compassSectionProps } from "@utils/feature-sections";
import { compassConfig } from "@/config/compassConfig";
import type { CompassShelf } from "@/data/compass";
import type { CompassConfig } from "@/types/compassConfig";

let {
	items = [],
	settings = {},
}: { items?: CompassShelf[]; settings?: Partial<CompassConfig> } = $props();

const sectionProps = $derived(
	compassSectionProps({ ...compassConfig, ...settings }, items),
);
</script>

<CompassSection {...sectionProps} />
