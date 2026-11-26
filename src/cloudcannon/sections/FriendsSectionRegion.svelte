<script lang="ts">
/** The friends page section, re-rendered in CloudCannon's Visual Editor from the edited data file and page settings. */
import FriendSection from "@components/organisms/FriendSection.svelte";
import { friendsSectionProps } from "@utils/feature-sections";
import { liveSettings } from "@/cloudcannon/live-settings";
import { friendsConfig } from "@/config/friendsConfig";
import type { FriendItem } from "@/data/friends";
import type { FriendsConfig } from "@/types/friendsConfig";

// The wrapper binds the whole data file as the base prop, so the props object is the array itself.
const items: ArrayLike<FriendItem> = $props();

const sectionProps = $derived(
	friendsSectionProps(
		{
			...friendsConfig,
			...(liveSettings("friends_settings") as Partial<FriendsConfig>),
		},
		Array.from(items),
	),
);
</script>

<FriendSection {...sectionProps} />
