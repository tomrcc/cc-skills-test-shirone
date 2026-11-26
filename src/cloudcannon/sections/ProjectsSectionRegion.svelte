<script lang="ts">
/** The projects page section, re-rendered in CloudCannon's Visual Editor from the edited data file and page settings. */
import ProjectSection from "@components/organisms/ProjectSection.svelte";
import { projectsSectionProps } from "@utils/feature-sections";
import { liveSettings } from "@/cloudcannon/live-settings";
import { projectsConfig } from "@/config/projectsConfig";
import type { ProjectItem, ProjectsConfig } from "@/types/projectsConfig";

// The wrapper binds the whole data file as the base prop, so the props object is the array itself.
const items: ArrayLike<ProjectItem> = $props();

const sectionProps = $derived(
	projectsSectionProps(
		{
			...projectsConfig,
			...(liveSettings("projects_settings") as Partial<ProjectsConfig>),
		},
		Array.from(items),
	),
);
</script>

<ProjectSection {...sectionProps} />
