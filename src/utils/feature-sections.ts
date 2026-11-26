/**
 * Props for the feature-page section organisms, built from a page config and
 * its data file. The routes render with these at build time, and CloudCannon's
 * Visual Editor re-renders with them from the edited files
 * (`src/cloudcannon/sections/`), so both stay identical. Browser-safe.
 */
import type { AnimeItem } from "../data/anime.ts";
import { type CompassShelf, compassData } from "../data/compass.ts";
import { devicesData } from "../data/devices.ts";
import { type FriendItem, friendsData } from "../data/friends.ts";
import { gamesData } from "../data/games.ts";
import { projectsData } from "../data/projects.ts";
import { skillsData } from "../data/skills.ts";
import { timelineData } from "../data/timeline.ts";
import I18nKey from "../i18n/i18nKey.ts";
import type { AnimeConfig } from "../types/animeConfig.ts";
import type { CompassConfig } from "../types/compassConfig.ts";
import type { DeviceItem, DevicesConfig } from "../types/devicesConfig.ts";
import type { FriendsConfig } from "../types/friendsConfig.ts";
import type { GameItem, GamesConfig } from "../types/gamesConfig.ts";
import type { ProjectItem, ProjectsConfig } from "../types/projectsConfig.ts";
import type { SkillItem, SkillsConfig } from "../types/skillsConfig.ts";
import type { TimelineConfig, TimelineItem } from "../types/timelineConfig.ts";
import { withEditablePaths } from "./editable-regions.ts";
import {
	resolveDevicesData,
	resolveGamesData,
	resolveProjectsData,
	resolveSkillsData,
	resolveTimelineData,
} from "./feature-data.ts";
import { resolveI18nText } from "./i18n-utils.ts";

export function projectsSectionProps(
	config: ProjectsConfig,
	data: readonly ProjectItem[] = projectsData,
) {
	const items = resolveProjectsData(config, config.items ?? data);
	return {
		categories: config.categories,
		items: config.items
			? items
			: withEditablePaths(items, data, "projects", (item) => item.key),
		title: resolveI18nText(config.title, I18nKey.projects),
		subtitle: resolveI18nText(config.description, I18nKey.projectsBanner),
	};
}

export function skillsSectionProps(
	config: SkillsConfig,
	data: readonly SkillItem[] = skillsData,
) {
	const items = resolveSkillsData(config, config.items ?? data);
	return {
		categories: config.categories,
		items: config.items
			? items
			: withEditablePaths(items, data, "skills", (item) => item.name),
		title: resolveI18nText(config.title, I18nKey.skills),
		subtitle: resolveI18nText(config.description, I18nKey.skillsBanner),
	};
}

export function timelineSectionProps(
	config: TimelineConfig,
	data: readonly TimelineItem[] = timelineData,
) {
	const items = resolveTimelineData(config, config.items ?? data);
	return {
		categories: config.categories,
		items: config.items
			? items
			: withEditablePaths(
					items,
					data,
					"timeline",
					(item) => `${item.title}|${item.date}`,
				),
		title: resolveI18nText(config.title, I18nKey.timeline),
		subtitle: resolveI18nText(config.description, I18nKey.timelineBanner),
	};
}

export function devicesSectionProps(
	config: DevicesConfig,
	data: readonly DeviceItem[] = devicesData,
) {
	const items = resolveDevicesData(config, config.items ?? data);
	return {
		categories: config.categories,
		items: config.items
			? items
			: withEditablePaths(items, data, "devices", (item) => item.id),
		title: resolveI18nText(config.title, I18nKey.devices),
		subtitle: resolveI18nText(config.description, I18nKey.devicesBanner),
	};
}

export function gamesSectionProps(
	config: GamesConfig,
	data: readonly GameItem[] = gamesData,
) {
	const items = resolveGamesData(config, config.items ?? data);
	return {
		categories: config.categories,
		items: config.items
			? items
			: withEditablePaths(items, data, "games", (item) => item.id),
		title: resolveI18nText(config.title, I18nKey.games),
		subtitle: resolveI18nText(config.description, I18nKey.gamesBanner),
	};
}

export function friendsSectionProps(
	config: FriendsConfig,
	data: readonly FriendItem[] = friendsData,
) {
	return {
		friends: withEditablePaths(data, data, "friends", (item) => item.id),
		title: resolveI18nText(config.title, I18nKey.friends),
		subtitle: resolveI18nText(config.description, I18nKey.friendsBanner),
		pageSize: config.pageSize,
	};
}

export function compassSectionProps(
	config: CompassConfig,
	data: readonly CompassShelf[] = compassData,
) {
	return {
		shelves: data.map((shelf, shelfIndex) => {
			const shelfPath = `@data[compass].${shelfIndex}`;
			return {
				...shelf,
				editablePath: shelfPath,
				entries: (shelf.entries ?? []).map((entry, entryIndex) => ({
					...entry,
					editablePath: `${shelfPath}.entries.${entryIndex}`,
				})),
			};
		}),
		title: resolveI18nText(config.title, I18nKey.compass),
		subtitle: resolveI18nText(config.description, I18nKey.compassBanner),
	};
}

/** `fromDataFile` is false when the list comes from a provider snapshot, which has no data file to edit. */
export function animeSectionProps(
	config: AnimeConfig,
	animes: readonly AnimeItem[],
	fromDataFile: boolean,
) {
	return {
		animes: fromDataFile
			? withEditablePaths(animes, animes, "anime", (item) => item.title)
			: [...animes],
		title: resolveI18nText(config.title, I18nKey.anime),
		subtitle: resolveI18nText(config.description, I18nKey.animeBanner),
		pageSize: config.pageSize,
	};
}
