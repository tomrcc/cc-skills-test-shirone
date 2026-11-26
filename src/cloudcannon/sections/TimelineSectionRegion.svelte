<script lang="ts">
/** The timeline page section, re-rendered in CloudCannon's Visual Editor from the edited data file and page settings. */
import TimelineSection from "@components/organisms/TimelineSection.svelte";
import { timelineSectionProps } from "@utils/feature-sections";
import { liveSettings } from "@/cloudcannon/live-settings";
import { timelineConfig } from "@/config/timelineConfig";
import type { TimelineConfig, TimelineItem } from "@/types/timelineConfig";

// The wrapper binds the whole data file as the base prop, so the props object is the array itself.
const items: ArrayLike<TimelineItem> = $props();

const sectionProps = $derived(
	timelineSectionProps(
		{
			...timelineConfig,
			...(liveSettings("timeline_settings") as Partial<TimelineConfig>),
		},
		Array.from(items),
	),
);
</script>

<TimelineSection {...sectionProps} />
