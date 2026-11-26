<script lang="ts">
/** The games page section, re-rendered in CloudCannon's Visual Editor from the edited data file and page settings. */
import GamesSection from "@components/organisms/GamesSection.svelte";
import { gamesSectionProps } from "@utils/feature-sections";
import { liveSettings } from "@/cloudcannon/live-settings";
import { gamesConfig } from "@/config/gamesConfig";
import type { GameItem, GamesConfig } from "@/types/gamesConfig";

// The wrapper binds the whole data file as the base prop, so the props object is the array itself.
const items: ArrayLike<GameItem> = $props();

const sectionProps = $derived(
	gamesSectionProps(
		{
			...gamesConfig,
			...(liveSettings("games_settings") as Partial<GamesConfig>),
		},
		Array.from(items),
	),
);
</script>

<GamesSection {...sectionProps} />
