import { Client, Message, TextChannel } from "discord.js";
import { create_music_message } from "../libraries/helpOps";
import { fetch_guild, remove_role_assigner } from "../libraries/mongoOps";
import { ReturnPormise } from "../types/interfaces/InterfacesPrtl";
import GuildPrtlMdl from "../types/models/GuildPrtlMdl";

module.exports = async (
	args: { client: Client, message: Message }
): Promise<ReturnPormise> => {
	return new Promise((resolve) => {
		if (args.message.guild) {
			fetch_guild(args.message.guild.id)
				.then(guild_object => {
					if (guild_object) {
						const role_list = guild_object.role_list;
						const music_data = guild_object.music_data;
						const portal_icon_url = 'https://raw.githubusercontent.com/keybraker/keybraker' +
							'.github.io/master/assets/img/logo.png';

						if (music_data.message_id === args.message.id) {
							const current_channel = args.message?.guild?.channels.cache.find(channel =>
								channel.id === guild_object.music_data.channel_id
							);

							if (current_channel) {
								create_music_message(<TextChannel>current_channel, portal_icon_url, guild_object);

								return resolve({
									result: true,
									value: 'music message has been created again',
								});
							} else {
								return resolve({
									result: false,
									value: 'could not find channel',
								});
							}
						} else {
							role_list.find(role_giver => {
								if (role_giver.message_id === args.message.id) {
									remove_role_assigner(guild_object.id, role_giver.message_id)
										.then(r => {
											return resolve({
												result: r,
												value: `role message ${r
													? 'deleted successfully'
													: 'failed to be deleted'}`
											})
										})
										.catch(e => resolve({
											result: false,
											value: 'role message was failed to be deleted'
										}));
									return true;
								}
								return false;
							});
						}
					} else {
						return resolve({
							result: false,
							value: `could not fetch guild`
						});
					}
				});
		} else {
			return resolve({
				result: false,
				value: `message ${args.message} was deleted`
			});
		}
	});
};