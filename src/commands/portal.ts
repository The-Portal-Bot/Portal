import { Client, Message } from "discord.js";
import { GuildPrtl } from "../types/classes/GuildPrtl";
import { create_portal_channel } from "../libraries/guildOps";

module.exports = async (args: {
	client: Client, message: Message, args: string[],
	guild_list: GuildPrtl[], portal_managed_guilds_path: string
}) => {
	return new Promise((resolve) => {
		const guild_object = args.guild_list.find(g => g.id === args.message.guild?.id);
		if (!guild_object) {
			return resolve({ result: true, value: 'portal guild could not be fetched' });
		}
		if (!args.message.guild) {
			return resolve({ result: true, value: 'guild could not be fetched' });
		}

		if (!args.message.member) {
			return resolve({ result: true, value: 'member could not be fetched' });
		}

		const portal_channel = args.args.join(' ').substr(0, args.args.join(' ').indexOf('|'));
		const portal_category = args.args.join(' ').substr(args.args.join(' ').indexOf('|') + 1);

		if (portal_channel !== '') {
			create_portal_channel(
				args.message.guild,
				portal_channel,
				portal_category,
				guild_object.portal_list,
				guild_object,
				args.message.member.id);

			return resolve({
				result: true, value: '*portal channel has been created.\n' +
					'Keep in mind that due to Discord\'s limitations,*\n' +
					'**channel names will be updated on a five minute interval.**',
			});
		}
		else if (portal_channel === '' && portal_category !== '') {
			create_portal_channel(
				args.message.guild,
				portal_category,
				null,
				guild_object.portal_list,
				guild_object,
				args.message.member.id);

			return resolve({
				result: true, value: '*portal channel has been created.\n' +
					'Keep in mind that due to Discord\'s limitations,*\n' +
					'**channel names will be updated on a five minute interval.**',
			});
		}
		else {
			return resolve({ result: false, value: '*you can run "./help portal" for help.*' });
		}
	});
};
