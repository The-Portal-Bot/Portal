import { GuildMember, VoiceChannel, Activity } from "discord.js";

import games from '../assets/jsons/GameNames.json';
import programs from '../assets/jsons/ProgramNames.json';
import { VoiceChannelPrtl } from "../types/classes/VoiceChannelPrtl";

function status_aliases(activities: Activity[], locale: string): string[] {
	const new_status: string[] = [];

	activities.forEach(activity => {
		let found = false;
		for (let l = 0; l < games.game_attributes.length; l++) {
			if (activity.name == games.game_attributes[l].status) {
				if (locale === 'gr') {
					new_status.push(games.game_attributes[l].locale.gr);
					found = true;
				}
				else {
					new_status.push(games.game_attributes[l].locale.en);
					found = true;
				}
			}
		}

		if (!found) {
			for (let l = 0; l < programs.program_attributes.length; l++) {
				if (activity.name == programs.program_attributes[l].status) {
					if (locale === 'gr') {
						new_status.push(programs.program_attributes[l].locale.gr);
						found = true;
					}
					else {
						new_status.push(programs.program_attributes[l].locale.en);
						found = true;
					}
				}
			}
		}

		if (!found) {
			new_status.push(activity.name);
		}
	});

	return new_status;
};

export function get_status_list(voice_channel: VoiceChannel, voice_object: VoiceChannelPrtl): string[] {
	const array_of_statuses: string[] = [];

	voice_channel.members.forEach((member: GuildMember) => {
		if (!member.user.bot) {
			if (member.presence.activities !== undefined) {
				if (member.presence.activities.length > 0) {
					status_aliases(member.presence.activities, voice_object.locale)
						.forEach(stat => {
							if (!array_of_statuses.includes(stat)) {
								array_of_statuses.push(stat);
							}
						});
				}
			}
		}
	});

	if (array_of_statuses.length === 0) {
		if (voice_object.locale === 'gr') {
			array_of_statuses.push('Άραγμα');
		}
		else if (voice_object.locale === 'de') {
			array_of_statuses.push('Chillen');
		}
		else {
			array_of_statuses.push('Chilling');
		}
	}

	return array_of_statuses;
};
