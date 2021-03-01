import { Message } from "discord.js";
import { GuildPrtl } from "../../../types/classes/GuildPrtl";
import { ReturnPormise } from "../../../types/interfaces/InterfacesPrtl";
import { create_rich_embed } from "../../../libraries/helpOps";

function get_role_name(i:  number, role_id: string, message: Message): string {
	if (!message.guild) {
		return ` - `;
	}

	const role = message.guild.roles.cache
		.find(r => r.id === role_id);

	return role
		? `${i}.\t${role.name}`
		: `${i}.\tundefined`;
};

module.exports = async (
	message: Message, args: string[], guild_object: GuildPrtl
): Promise<ReturnPormise> => {
	return new Promise((resolve) => {
		const roles = guild_object.auth_role;

		if (guild_object.auth_role.length > 0) {
			message.channel.send(create_rich_embed(
				'Authorised Roles',
				`${roles.map((r, i) => get_role_name(i, r, message)).join('\n')}`,
				'#0ac2cc',
				[],
				// roles.map((r, i) => {
				// 	return {
				// 		emote: `${i}`,
				// 		role: get_role_name(r, message),
				// 		inline: false
				// 	}
				// }),
				null,
				null,
				true,
				null,
				null)
			);

			resolve({
				result: true,
				value: '',
			});
		}
		else {
			resolve({
				result: false,
				value: 'there are no authorisation roles',
			});
		}
	});
};
