<script lang="ts">
/** The skills page section, re-rendered in CloudCannon's Visual Editor from the edited data file and page settings. */
import SkillSection from "@components/organisms/SkillSection.svelte";
import { skillsSectionProps } from "@utils/feature-sections";
import { liveSettings } from "@/cloudcannon/live-settings";
import { skillsConfig } from "@/config/skillsConfig";
import type { SkillItem, SkillsConfig } from "@/types/skillsConfig";

// The wrapper binds the whole data file as the base prop, so the props object is the array itself.
const items: ArrayLike<SkillItem> = $props();

const sectionProps = $derived(
	skillsSectionProps(
		{
			...skillsConfig,
			...(liveSettings("skills_settings") as Partial<SkillsConfig>),
		},
		Array.from(items),
	),
);
</script>

<SkillSection {...sectionProps} />
