import { Activity, GuildMember, VoiceChannel } from "discord.js";
import { GameNames } from "../data/lists/game_names.static";
import { ProgramNames } from "../data/lists/program_names.static";
import { PVoiceChannel } from "../types/classes/PVoiceChannel.class";
import { LocaleEnum } from "../data/enums/Locales.enum";

function statusAliases(
	activities: Activity[], locale: number
): string[] {
	const newStatus: string[] = [];

	activities.forEach(activity => {
		let found = false;

		if (activity.name.toLowerCase() === 'custom status') {
			found = true;
		}

		if (!found) {
			for (let l = 0; l < GameNames.gameAttributes.length; l++) {
				if (activity.name.trim() == GameNames.gameAttributes[l].status) {
					if (locale === LocaleEnum.gr) {
						newStatus.push(GameNames.gameAttributes[l].locale.gr);
					}
					else if (locale === LocaleEnum.de) {
						newStatus.push(GameNames.gameAttributes[l].locale.de);
					}
					else {
						newStatus.push(GameNames.gameAttributes[l].locale.en);
					}

					found = true;
				}
			}
		}

		if (!found) {
			for (let l = 0; l < ProgramNames.programAttributes.length; l++) {
				if (activity.name.trim() == ProgramNames.programAttributes[l].status) {
					if (locale === LocaleEnum.gr) {
						newStatus.push(ProgramNames.programAttributes[l].locale.gr);
					}
					else if (locale === LocaleEnum.de) {
						newStatus.push(ProgramNames.programAttributes[l].locale.de);
					}
					else {
						newStatus.push(ProgramNames.programAttributes[l].locale.en);
					}

					found = true;
				}
			}
		}

		if (!found) {
			newStatus.push(activity.name);
		}
	});

	return newStatus;
}

export function getStatusList(
	voice_channel: VoiceChannel, voice_object: PVoiceChannel
): string[] {
	const arrayOfStatuses: string[] = [];

	voice_channel.members.forEach((member: GuildMember) => {
		if (member.presence) {
			if (!member.user.bot) {
				if (member.presence.activities !== undefined) {
					if (member.presence.activities.length > 0) {
						statusAliases(member.presence.activities, voice_object.locale)
							.forEach(stat => {
								if (!arrayOfStatuses.includes(stat)) {
									arrayOfStatuses.push(stat);
								}
							});
					}
				}
			}
		}
	});

	if (arrayOfStatuses.length === 0) {
		if (voice_object.locale === LocaleEnum.gr) {
			arrayOfStatuses.push('Άραγμα');
		}
		else if (voice_object.locale === LocaleEnum.de) {
			arrayOfStatuses.push('Chillen');
		}
		else {
			arrayOfStatuses.push('Chilling');
		}
	}

	return arrayOfStatuses;
}
