<script lang="ts">
/** The anime page section, re-rendered in CloudCannon's Visual Editor from the edited data file and page settings. */
import AnimeSection from "@components/organisms/AnimeSection.svelte";
import { animeSectionProps } from "@utils/feature-sections";
import { animeConfig } from "@/config/animeConfig";
import type { AnimeItem } from "@/data/anime";
import type { AnimeConfig } from "@/types/animeConfig";

let {
	items = [],
	settings = {},
}: { items?: AnimeItem[]; settings?: Partial<AnimeConfig> } = $props();

const sectionProps = $derived(
	animeSectionProps({ ...animeConfig, ...settings }, items, true),
);
</script>

<AnimeSection {...sectionProps} />
