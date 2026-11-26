<script lang="ts">
/** The skills page section, re-rendered in CloudCannon's Visual Editor from the edited data file and page settings. */
import SkillSection from "@components/organisms/SkillSection.svelte";
import { skillsSectionProps } from "@utils/feature-sections";
import { skillsConfig } from "@/config/skillsConfig";
import type { SkillItem, SkillsConfig } from "@/types/skillsConfig";

let {
	items = [],
	settings = {},
}: { items?: SkillItem[]; settings?: Partial<SkillsConfig> } = $props();

const sectionProps = $derived(
	skillsSectionProps({ ...skillsConfig, ...settings }, items),
);
</script>

<SkillSection {...sectionProps} />
