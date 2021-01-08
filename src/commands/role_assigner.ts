import { Client, Message, TextChannel, MessageEmbed } from "discord.js";
import { get_role } from "../libraries/guildOps";
import { getJSON, create_rich_embed } from "../libraries/helpOps";
import { GiveRole, GiveRolePrtl } from "../types/classes/GiveRolePrtl";
import { GuildPrtl } from "../types/classes/GuildPrtl";
import { Field } from "../types/interfaces/InterfacesPrtl";

function create_role_message(
	channel: TextChannel, guild_object: GuildPrtl, title: string, desc: string,
	colour: string, role_emb: Field[], role_map: GiveRole[]
): void {
	const role_message_emb: MessageEmbed = create_rich_embed(title, desc, colour, role_emb, null, null, null, null, null);
	channel
		.send(role_message_emb)
		.then(sent_message => {
			for (let i = 0; i < role_map.length; i++) {
				sent_message.react(role_map[i].give);
				sent_message.react(role_map[i].strip);
			}
			guild_object.role_list.push(new GiveRolePrtl(sent_message.id, role_map));
		})
		.catch(error => console.log(error));
};

function multiple_same_emote (emote_map: GiveRole[]) {
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

module.exports = async (
	client: Client, message: Message, args: string[],
	guild_list: GuildPrtl[], portal_managed_guilds_path: string
) => {
	return new Promise((resolve) => {
		const guild_object = guild_list.find(g => g.id === message.guild?.id);
		if (!guild_object) return resolve({ result: true, value: 'portal guild could not be fetched' });
		if (!message.guild) return resolve({ result: true, value: 'guild could not be fetched' });
		if (args.length <= 0) return resolve({ result: false, value: 'you can run "./help role_assigner" for help.' });

		const role_map_json = getJSON(args.join(' '));
		if (!role_map_json) return resolve({ result: false, value: 'roles must be in JSON format for more info ./help role_assigner' });
		const role_map = <GiveRole[]>role_map_json;
		if (!Array.isArray(role_map)) return resolve({ result: false, value: 'must be array even for one role' });
		if (multiple_same_emote(role_map)) return resolve({ result: false, value: 'emotes should differ ./help role_assigner' });

		role_map.forEach(r => { r.give = r.give.trim(); r.strip = r.strip.trim(); });
		// client.emojis.cache.forEach(emoji => console.log('emoji: ', emoji));

		const role_emb_value: GiveRole[] = [];
		const role_emb_display: Field[] = [];

		role_emb_display.push({ emote: '', role: 'React with emote to get correlating role', inline: false, });

		let return_value: string = '';
		// give roles
		const give_failed = role_map.some((r, index) => {
			if (message.guild) {
				const role_fetched = get_role(message.guild, r.role_id);
				if (!role_fetched) {
					return_value = `${index}. ${r.role_id} is not a role in ${message.guild}`;
					return true;
				}
				role_emb_display.push(new Field(r.give, role_fetched.name, true));
				role_emb_value.push(new GiveRole(r.give, role_fetched.id, ''));
			} else {
				return_value = `could not fetch guild of message`;
				return true;
			}
		});

		if (give_failed) return resolve({ result: false, value: return_value });

		role_emb_display.push({ emote: '', role: 'React with emote to strip correlating role', inline: false, });

		return_value = '';
		// strip role
		const strip_failed = role_map.some((r, index) => {
			if (message.guild) {
				const role_fetched = get_role(message.guild, r.role_id);
				if (!role_fetched) {
					return_value = `${index}.. ${r.role_id} is not a role in ${message.guild}`;
					return true;
				}
				role_emb_display.push(new Field(r.strip, role_fetched.name, true));
				role_emb_value.push(new GiveRole(r.strip, role_fetched.id, ''));
			} else {
				return_value = `could not fetch guild of message`;
				return true;
			}
		});

		if (strip_failed) return resolve({ result: false, value: return_value });
		console.log('role_emb_display :>> ', role_emb_display);
		console.log('role_map :>> ', role_map);
		create_role_message(
			<TextChannel>message.channel,
			guild_object,
			'Portal Role Assigner',
			'',
			'#FF7F00',
			role_emb_display,
			role_map
		)

		return resolve({ result: true, value: 'role message has been created.' });
	});
};
