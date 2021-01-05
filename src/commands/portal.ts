import { Client, Message } from "discord.js";
import { GuildPrtl } from "../types/classes/GuildPrtl";
import { create_portal_channel } from "../libraries/guildOps";

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

		if (!message.member) {
			return resolve({ result: true, value: 'member could not be fetched' });
		}

		const portal_channel = args.join(' ').substr(0, args.join(' ').indexOf('|'));
		const portal_category = args.join(' ').substr(args.join(' ').indexOf('|') + 1);

		if (portal_channel !== '') {
			create_portal_channel(
				message.guild,
				portal_channel,
				portal_category,
				guild_object.portal_list,
				guild_object,
				message.member.id);

			return resolve({
				result: true, value: '*portal channel has been created.\n' +
					'Keep in mind that due to Discord\'s limitations,*\n' +
					'**channel names will be updated on a five minute interval.**',
			});
		}
		else if (portal_channel === '' && portal_category !== '') {
			create_portal_channel(
				message.guild,
				portal_category,
				null,
				guild_object.portal_list,
				guild_object,
				message.member.id);

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
