import { Message, MessageEmbed, TextChannel } from "discord.js";
import { get_role } from "../../../libraries/guild.library";
import { create_rich_embed, getJSON, message_help } from "../../../libraries/help.library";
import { insert_role_assigner } from "../../../libraries/mongo.library";
import { GiveRole, GiveRolePrtl } from "../../../types/classes/GiveRolePrtl.class";
import { GuildPrtl } from "../../../types/classes/GuildPrtl.class";
import { Field, ReturnPormise } from "../../../types/interfaces/InterfacesPrtl.interface";

function create_role_message(
	channel: TextChannel, guild_object: GuildPrtl, title: string, desc: string,
	colour: string, role_emb: Field[], role_map: GiveRole[]
): Promise<ReturnPormise> {
	return new Promise((resolve) => {
		const role_message_emb: MessageEmbed = create_rich_embed(
			title, desc, colour, role_emb, null, null, null, null, null
		);

		channel
			.send(role_message_emb)
			.then(sent_message => {
				for (let i = 0; i < role_map.length; i++) {
					sent_message.react(role_map[i].give);
					sent_message.react(role_map[i].strip);
				}
				insert_role_assigner(guild_object.id, new GiveRolePrtl(sent_message.id, role_map))
					.then(r => {
						return resolve({
							result: r,
							value: r
								? 'Keep in mind that Portal role must be over any role you wish it to be able to distribute.\n' +
								'In order to change it, please head to your servers settings and put Portal role above them'
								: 'failed to set new ranks'
						});
					})
					.catch(e => {
						return resolve({
							result: false,
							value: 'failed to set new ranks'
						});
					});
			})
			.catch(e => {
				return resolve({
					result: false,
					value: 'failed to create role assigner message'
				})
			});
	});
};

function multiple_same_emote(emote_map: GiveRole[]) {
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
	message: Message, args: string[], guild_object: GuildPrtl
): Promise<ReturnPormise> => {
	return new Promise((resolve) => {
		if (!message.guild)
			return resolve({
				result: true,
				value: 'guild could not be fetched'
			});
		if (args.length <= 0)
			return resolve({
				result: false,
				value: message_help('commands', 'role_assigner')
			});

		const role_map_json = getJSON(args.join(' '));
		if (!role_map_json)
			return resolve({
				result: false,
				value: message_help('commands', 'role_assigner', 'must be an array in JSON format (even for one role)')
			});
		const role_map = <GiveRole[]>role_map_json;
		if (!Array.isArray(role_map))
			return resolve({
				result: false,
				value: message_help('commands', 'role_assigner', 'must be an array in JSON format (even for one role)')
			});
		if (multiple_same_emote(role_map))
			return resolve({
				result: false,
				value: message_help('commands', 'role_assigner', 'can not have the same emote for multiple actions')
			});
		if (!role_map.every(rm => rm.give && rm.strip && rm.role_id))
			return resolve({
				result: false,
				value: message_help('commands', 'role_assigner', 'JSON syntax has spelling errors')
			});

		role_map.forEach(r => { r.give = r.give.trim(); r.strip = r.strip.trim(); });
		// client.emojis.cache.forEach(emoji => console.log('emoji: ', emoji));

		const role_emb_value: GiveRole[] = [];
		const role_emb_display_give: Field[] = [];
		const role_emb_display_strip: Field[] = [];

		role_emb_display_give.push({ emote: '', role: 'React with emote to get correlating role', inline: false, });
		role_emb_display_strip.push({ emote: '', role: 'React with emote to strip correlating role', inline: false, });

		let return_value: string = '';
		// give roles
		const failed = role_map.some((r, index) => {
			if (message.guild) {
				const role_fetched = get_role(message.guild, r.role_id);
				if (!role_fetched) {
					return_value = `${index + 1}. ${r.role_id} is not a role in ${message.guild}`;
					return true;
				}
				role_emb_display_give.push(new Field(r.give, role_fetched.name, true));
				role_emb_display_strip.push(new Field(r.strip, role_fetched.name, true));
				role_emb_value.push(new GiveRole(role_fetched.id, r.give, r.strip));
			} else {
				return_value = `could not fetch guild of message`;
				return true;
			}
		});

		if (failed) return resolve({
			result: false,
			value: message_help('commands', 'role_assigner', return_value)
		});

		create_role_message(
			<TextChannel>message.channel,
			guild_object,
			'Portal Role Assigner',
			'',
			'#FF7F00',
			role_emb_display_give.concat(role_emb_display_strip),
			role_map
		)
			.then(r => {
				return resolve(r);
			})
			.catch(e => {
				return resolve({
					result: false,
					value: `an error occurred while creating role message (${e})`
				})
			});
	});
};
