<script lang="ts">
/** The anime page section, re-rendered in CloudCannon's Visual Editor from the edited data file and page settings. */
import AnimeSection from "@components/organisms/AnimeSection.svelte";
import { animeSectionProps } from "@utils/feature-sections";
import { liveSettings } from "@/cloudcannon/live-settings";
import { animeConfig } from "@/config/animeConfig";
import type { AnimeItem } from "@/data/anime";
import type { AnimeConfig } from "@/types/animeConfig";

// The wrapper binds the whole data file as the base prop, so the props object is the array itself.
const items: ArrayLike<AnimeItem> = $props();

const sectionProps = $derived(
	animeSectionProps(
		{
			...animeConfig,
			...(liveSettings("anime_settings") as Partial<AnimeConfig>),
		},
		Array.from(items),
		true,
	),
);
</script>

<AnimeSection {...sectionProps} />
