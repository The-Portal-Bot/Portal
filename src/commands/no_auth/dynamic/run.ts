import { Message } from "discord.js";
import { regex_interpreter } from "../../../libraries/guild.library";
import { create_rich_embed, max256 } from "../../../libraries/help.library";
import { GuildPrtl } from "../../../types/classes/GuildPrtl.class";
import { ReturnPormise } from "../../../types/interfaces/InterfacesPrtl.interface";

module.exports = async (
	message: Message, args: string[], guild_object: GuildPrtl
): Promise<ReturnPormise> => {
	return new Promise((resolve) => {
		if (!message.guild) {
			return resolve({
				result: true,
				value: 'guild could not be fetched'
			});
		}

		if (!message.member) {
			return resolve({
				result: true,
				value: 'member could not be fetched'
			});
		}

		const current_voice = message.member.voice;
		const current_voice_channel = current_voice.channel;

		if (!current_voice_channel) {
			message.channel.send(
				create_rich_embed(
					'executing: ' + args.join(' '),
					args.join(' '),
					'#00ffb3',
					null,
					null,
					null,
					false,
					null,
					null,
					undefined,
					undefined
				)
			)
				.then(sent_message => {
					if (message.guild) {
						sent_message.edit(
							create_rich_embed(
								max256(regex_interpreter(
									args.join(' '),
									null,
									null,
									guild_object.portal_list,
									guild_object,
									message.guild,
									message.author.id
								)),
								args.join(' '),
								'#00ffb3',
								null,
								null,
								null,
								false,
								null,
								null,
								undefined,
								undefined
							));
					} else {
						sent_message.edit('could not fetch guild of message');
					}
				});

			return resolve({
				result: true,
				value: 'instruction ran successfully',
			});
		}

		const voice_found = guild_object.portal_list.some(p => {
			return p.voice_list.some(v => {
				if (v.id === current_voice_channel.id) {
					message.channel.send('executing: ' + args.join(' '))
						.then(sent_message => {
							if (message.guild) {
								sent_message.edit(
									regex_interpreter(
										args.join(' '),
										current_voice_channel,
										v,
										guild_object.portal_list,
										guild_object,
										message.guild,
										message.author.id
									)
								);
							} else {
								sent_message.edit('could not fetch guild of message');
							}
						});

					return true;
				}

				return false;
			})
		});

		if (voice_found) {
			return resolve(
				{
					result: true,
					value: 'instruction ran successfully'
				});
		}
		else {
			return resolve(
				{
					result: false,
					value: 'could not find your voice channel'
				});
		}

	});
};
