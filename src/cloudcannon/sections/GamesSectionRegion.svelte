<script lang="ts">
/** The games page section, re-rendered in CloudCannon's Visual Editor from the edited data file and page settings. */
import GamesSection from "@components/organisms/GamesSection.svelte";
import { gamesSectionProps } from "@utils/feature-sections";
import { gamesConfig } from "@/config/gamesConfig";
import type { GameItem, GamesConfig } from "@/types/gamesConfig";

let {
	items = [],
	settings = {},
}: { items?: GameItem[]; settings?: Partial<GamesConfig> } = $props();

const sectionProps = $derived(
	gamesSectionProps({ ...gamesConfig, ...settings }, items),
);
</script>

<GamesSection {...sectionProps} />
