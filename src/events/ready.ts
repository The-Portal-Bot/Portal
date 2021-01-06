import { Client, Guild, TextChannel, Message } from "discord.js";
import { update_portal_managed_guilds } from "../libraries/helpOps";
import { console_text } from "../libraries/localizationOps";
import { GuildPrtl } from "../types/classes/GuildPrtl";

function remove_deleted_guild(guild: Guild, guild_list: GuildPrtl[]): boolean {
	if (!guild_list.some(g => g.id === guild.id)) {
		guild.leave()
			.then(guild => console.log(`left guild ${guild}`))
			.catch(console.error);
		return true;
	}
	return false;
}

function remove_deleted_channels(guild: Guild, guild_list: GuildPrtl[]): void {
	const guild_object = guild_list.find(g => g.id === guild.id);
	if (guild_object) {
		guild_object.portal_list.forEach((p, index_p) => {
			if (!guild.channels.cache.some(c => c.id === p.id)) {
				guild_object.portal_list.splice(index_p, 1);
			}
			p.voice_list.forEach((v, index_v) => {
				if (!guild.channels.cache.some(c => c.id === v.id)) {
					p.voice_list.splice(index_v, 1);
				}
			});
		});

		guild_object.url_list.some((u_id, index_u) => {
			if (!guild.channels.cache.some(c => c.id === u_id)) {
				guild_object.url_list.splice(index_u, 1);
				return true;
			}
			return false;
		});

		guild_object.role_list.forEach((r, index_r) => {
			!guild.channels.cache.some(c => {
				if (c instanceof TextChannel) {
					let found = false;
					c.messages
						.fetch(r.message_id)
						.then((message: Message) => {
							// clear from emotes leave only those from portal
							found = true;
						})
						.catch(() => {
							guild_object.role_list.splice(index_r, 1);
						});
					return found;
				}
				return false;
			});
		});

		guild_object.member_list.some((m, index_m) => {
			if (!guild.members.cache.some(m => m.id === m.id)) {
				guild_object.url_list.splice(index_m, 1);
				return true;
			}
			return false;
		});

		if (!guild.channels.cache.some(c => c.id === guild_object.spotify)) {
			guild_object.spotify = null;
		}

		if (!guild.channels.cache.some(c => c.id === guild_object.music_data.channel_id)) {
			guild_object.music_data.channel_id = undefined;
			guild_object.music_data.message_id = undefined;
			guild_object.music_data.votes = undefined;
		}

		if (!guild.channels.cache.some(c => c.id === guild_object.announcement)) {
			guild_object.announcement = null;
		}
	}
}

function remove_empty_voice_channels(guild: Guild, guild_list: GuildPrtl[]): void {
	guild.channels.cache.forEach(channel => {
		if (!channel.members.size) {
			const deleted = guild_list.some(g =>
				g.portal_list.some(p =>
					p.voice_list.some((v, index) => {
						if (v.id === channel.id) {
							console.log(`Deleting channel: ${channel.name} (${channel.id}) from ${channel.guild.name}`);
							if (channel.deletable) {
								channel
									.delete()
									.then(g => {
										p.voice_list.splice(index, 1);
										console.log('...done');
									})
									.catch(console.error);
							}
							return true;
						}
						return false
					})
				)
			);

			if (!deleted)
				console.log('failed to delete channel');
		}
	});
};

module.exports = async (
	args: { client: Client, guild_list: GuildPrtl[], portal_managed_guilds_path: string }
) => {
	if (args.client.user === null || args.client.user === undefined) return {
		result: false,
		value: 'could not fetch user from client'
	}

	// Changing Portal bots status
	args.client.user.setActivity('./help', {
		url: 'https://github.com/keybraker',
		type: 'LISTENING'
	});

	let index = 0;
	console.log(`> loading portal\'s guilds from ${args.portal_managed_guilds_path}`);
	args.client.guilds.cache.forEach((guild) => {
		console.log(`> ${index++}. ${guild} (${guild.id})`);

		remove_deleted_guild(guild, args.guild_list);
		remove_deleted_channels(guild, args.guild_list);
		remove_empty_voice_channels(guild, args.guild_list);

		update_portal_managed_guilds(true, args.portal_managed_guilds_path, args.guild_list);
	});
	console.log('');

	return {
		result: true,
		value: console_text.some(ct => {
			if (ct.name === 'ready') {
				ct.lang.en({
					'a': args.client.users.cache.size,
					'b': args.client.channels.cache.size,
					'c': args.client.guilds.cache.size
				});
			}
		})
	};
};
