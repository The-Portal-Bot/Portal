import { Message, TextChannel } from "discord.js";
import { create_music_message } from "../libraries/helpOps";
import { GuildPrtl } from "../types/classes/GuildPrtl";

module.exports = async (
	args: { guild_list: GuildPrtl[], message: Message }
) => {
	if (!args.message.guild) return { result: true, value: 'message guild could not be found' };

	const guild_object = args.guild_list.find(g => {
		if (args.message.guild)
			return g.id === args.message.guild.id;
	});
	if (!guild_object) return { result: true, value: 'message could not be found' };

	const role_list = guild_object.role_list;
	const music_data = guild_object.music_data;
	const portal_icon_url = 'https://raw.githubusercontent.com/keybraker/keybraker' +
		'.github.io/master/assets/img/logo.png';

	const role_list_object = role_list.find((r, index) => {
		if (args.message.guild && r.message_id === args.message.id) {
			role_list.splice(index, 1);
			return true;
		}
		return false;
	});
	if (role_list_object) return {
		result: true,
		value: 'role message was deleted and successfully removed from json'
	};

	if (music_data.message_id === args.message.id) {
		const current_channel = args.message.guild.channels.cache.find(channel =>
			channel.id === guild_object.music_data.channel_id);
		if (current_channel) {
			create_music_message(<TextChannel>current_channel, portal_icon_url, guild_object);

			return {
				result: true,
				value: 'music message has been created again',
			};
		} else {
			return {
				result: false,
				value: 'could not find channel',
			};
		}
	}
};