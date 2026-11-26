<script lang="ts">
/** The friends page section, re-rendered in CloudCannon's Visual Editor from the edited data file and page settings. */
import FriendSection from "@components/organisms/FriendSection.svelte";
import { friendsSectionProps } from "@utils/feature-sections";
import { friendsConfig } from "@/config/friendsConfig";
import type { FriendItem } from "@/data/friends";
import type { FriendsConfig } from "@/types/friendsConfig";

let {
	items = [],
	settings = {},
}: { items?: FriendItem[]; settings?: Partial<FriendsConfig> } = $props();

const sectionProps = $derived(
	friendsSectionProps({ ...friendsConfig, ...settings }, items),
);
</script>

<FriendSection {...sectionProps} />
