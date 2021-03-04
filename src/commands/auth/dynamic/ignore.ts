import { Message } from "discord.js";
import { included_in_ignore_list } from "../../../libraries/guildOps";
import { insert_ignore, remove_ignore, update_member, insert_ignored_role, remove_ignored_role } from "../../../libraries/mongoOps";
import { GuildPrtl } from "../../../types/classes/GuildPrtl";
import { ReturnPormise } from "../../../types/interfaces/InterfacesPrtl";

module.exports = async (
	message: Message, args: string[], guild_object: GuildPrtl
): Promise<ReturnPormise> => {
	return new Promise((resolve) => {
		if (!message.guild) {
			return resolve({
				result: false,
				value: 'guild could not be fetched'
			});
		}

		if (args.length === 0) { // channel ignore
			if (included_in_ignore_list(message.channel.id, guild_object)) {
				remove_ignore(guild_object.id, message.channel.id)
					.then(r => {
						return resolve({
							result: r,
							value: r
								? 'successfully removed ignore channel'
								: 'failed to remove ignore channel'
						});
					})
					.catch(e => {
						return resolve({
							result: false,
							value: 'failed to remove ignore channel'
						});
					});
			}
			else {
				insert_ignore(guild_object.id, message.channel.id)
					.then(r => {
						return resolve({
							result: r,
							value: r
								? 'set as an ignore channel successfully'
								: 'failed to set as an ignore channel'
						});
					})
					.catch(e => {
						return resolve({
							result: false,
							value: 'failed to set as an ignore channel: ' + e
						});
					});
			}
		}
		else if (args.length >= 1) {
			const role_name = args.join(' ');

			const role = message.guild.roles.cache
				.find(r => r.name === role_name || r.id === role_name);

			if (role) {
				for (const i in guild_object.ignore_role) {
					if (guild_object.ignore_role[i] === role.id) {
						remove_ignored_role(guild_object.id, role.id)
							.then(r => {
								return resolve({
									result: r,
									value: r
										? `successfully stopped ignoring role ${role.name}`
										: `failed to stop ignoring role ${role.name}`
								});
							})
							.catch(e => {
								return resolve({
									result: false,
									value: `an error occured while stopping ignroring role "${role.name}" (${e})`
								});
							});
					}
				}

				insert_ignored_role(guild_object.id, role.id)
					.then(r => {
						return resolve({
							result: r,
							value: r
								? `successfully started ignoring role ${role.name}`
								: `failed to ignore role ${role.name}`
						});
					})
					.catch(e => {
						return resolve({
							result: false,
							value: `an error occured while ignoring role "${role.name}" (${e})`
						});
					});
			}

			if (message.member?.id === role_name) {
				return resolve({
					result: true,
					value: `you can't ignore yourself`
				});
			}
			else {
				// check if it is a user id
				guild_object.member_list.some(m => {
					if (m.id === role_name) {
						if (m.ignored === false) {
							update_member(guild_object.id, m.id, 'ignored', true)
								.then(r => {
									const member = message.guild?.members.cache
										.find(mb => mb.id === m.id);

									return resolve({
										result: r,
										value: r
											? `successfully started ignoring member ${member ? member : m.id}`
											: `failed to ignore member ${member ? member : m.id}`
									});
								})
								.catch(e => {
									const member = message.guild?.members.cache.find(mb => mb.id === m.id);

									return resolve({
										result: false,
										value: `something when wrong while ignoring ${member ? member : m.id}`
									});
								});
						}
						else {
							update_member(guild_object.id, m.id, 'ignored', false)
								.then(r => {
									const member = message.guild?.members.cache.find(mb => mb.id === m.id);

									return resolve({
										result: r,
										value: r
											? `successfully stopped ignoring member ${member ? member : m.id}`
											: `failed to stop ignoring member ${member ? member : m.id}`
									});
								})
								.catch(e => {
									const member = message.guild?.members.cache.find(mb => mb.id === m.id);

									return resolve({
										result: false,
										value: `something when wrong while removing ignore from ${member ? member : m.id}`
									});
								});
						}
					}
				});
			}
		}
		else {
			return resolve({
				result: false,
				value: 'you can run `./help ignore` for help'
			});
		}
	});
};
