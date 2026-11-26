<script lang="ts">
/** The projects page section, re-rendered in CloudCannon's Visual Editor from the edited data file and page settings. */
import ProjectSection from "@components/organisms/ProjectSection.svelte";
import { projectsSectionProps } from "@utils/feature-sections";
import { projectsConfig } from "@/config/projectsConfig";
import type { ProjectItem, ProjectsConfig } from "@/types/projectsConfig";

let {
	items = [],
	settings = {},
}: { items?: ProjectItem[]; settings?: Partial<ProjectsConfig> } = $props();

const sectionProps = $derived(
	projectsSectionProps({ ...projectsConfig, ...settings }, items),
);
</script>

<ProjectSection {...sectionProps} />
