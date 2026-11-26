<script lang="ts">
/** The timeline page section, re-rendered in CloudCannon's Visual Editor from the edited data file and page settings. */
import TimelineSection from "@components/organisms/TimelineSection.svelte";
import { timelineSectionProps } from "@utils/feature-sections";
import { timelineConfig } from "@/config/timelineConfig";
import type { TimelineConfig, TimelineItem } from "@/types/timelineConfig";

let {
	items = [],
	settings = {},
}: { items?: TimelineItem[]; settings?: Partial<TimelineConfig> } = $props();

const sectionProps = $derived(
	timelineSectionProps({ ...timelineConfig, ...settings }, items),
);
</script>

<TimelineSection {...sectionProps} />
