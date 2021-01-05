import { Client, Message, TextChannel } from "discord.js";
import { is_role } from "../libraries/guildOps";
import { create_role_message, getJSON } from "../libraries/helpOps";
import { GiveRole } from "../types/classes/GiveRolePrtl";
import { GuildPrtl } from "../types/classes/GuildPrtl";
import { Field } from "../types/interfaces/InterfacesPrtl";

const multiple_same_emote = function (emote_map: GiveRole[]) {
	for (let i = 0; i < emote_map.length; i++) {
		for (let j = i + 1; j < emote_map.length; j++) {
			if (emote_map[i].give === emote_map[j].give) { return true; }
			else if (emote_map[i].give === emote_map[j].strip) { return true; }
			else if (emote_map[i].strip === emote_map[j].give) { return true; }
			else if (emote_map[i].strip === emote_map[j].strip) { return true; }
		}
	}

	return false;
};

// NEEDS FIXING
module.exports = async (
	client: Client, message: Message, args: string[],
	guild_list: GuildPrtl[], portal_managed_guilds_path: string
) => {
	return new Promise((resolve) => {
		const guild_object = guild_list.find(g => g.id === message.guild?.id);
		if (!guild_object) {
			return resolve({ result: true, value: 'portal guild could not be fetched' });
		}
		if (!message.guild) {
			return resolve({ result: true, value: 'guild could not be fetched' });
		}

		const roles = [...message.guild.roles.cache];
		// client.emojis.cache.forEach(emoji => console.log('emoji: ', emoji));
		if (args.length > 0) {
			const role_map_json = getJSON(args.join(' '));
			if (role_map_json === null) {
				return resolve(
					{
						result: false,
						value: '*roles must be in JSON format for more info ./help role*'
					},
				);
			}
			const role_map = <GiveRole[]>role_map_json;
			if (multiple_same_emote(role_map)) {
				return resolve(
					{ result: false, value: '*emotes should differ ./help role*' },
				);
			}

			const role_emb_value: GiveRole[] = [];
			const role_emb_display: Field[] = [];

			role_emb_display.push({
				emote: '',
				role: 'React with emote to get correlating role',
				inline: false,
			});

			let return_value: string = '';
			const give_failed = role_map.some(r => {
				if (message.guild) {
					const role_fetched = is_role(message.guild, r.role_id);
					if (!role_fetched) {
						return_value = `${r.role_id} is not a role in ${message.guild}`;
						return true;
					}
					role_emb_display.push(new Field(
						r.give,
						role_fetched.id,
						true
					));
					role_emb_value.push(new GiveRole(
						r.give,
						r.role_id,
						''
					));
				} else {
					return_value = `could not fetch guild of message`;
					return true;
				}
			});

			if (give_failed) return resolve({ result: false, value: return_value });

			role_emb_display.push({
				emote: '',
				role: 'React with emote to strip correlating role',
				inline: false,
			});

			return_value = '';
			const strip_failed = role_map.some(r => {
				if (message.guild) {
					const role_fetched = is_role(message.guild, r.role_id);
					if (!role_fetched) {
						return_value = `${r.role_id} is not a role in ${message.guild}`;
						return true;
					}
					role_emb_display.push(new Field(
						r.strip,
						role_fetched.id,
						true
					));
					role_emb_value.push(new GiveRole(
						r.strip,
						r.role_id,
						''
					));
				} else {
					return_value = `could not fetch guild of message`;
					return true;
				}
			});

			if (strip_failed) return resolve({ result: false, value: return_value });

			create_role_message(
				<TextChannel>message.channel,
				guild_object.role_list,
				'Portal Role Assigner',
				'',
				'#FF7F00',
				role_emb_display,
				role_map
			);

		}
		else {
			return resolve({ result: false, value: '*you can run "./help role" for help.*' });
		}

		return resolve({ result: true, value: '*role message has been created.*' });
	});
};
