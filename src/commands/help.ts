import { Client, Message } from "discord.js";
import { GuildPrtl } from "../types/classes/GuildPrtl";
import { get_attribute_help, get_attribute_help_super } from "../types/interfaces/Attribute";
import { get_command_help, get_command_help_super } from "../types/interfaces/Command";
import { get_pipe_help, get_pipe_help_super } from "../types/interfaces/Pipe";
import { get_structure_help, get_structure_help_super } from "../types/interfaces/Structure";
import { get_variable_help, get_variable_help_super } from "../types/interfaces/Variable";

module.exports = async (
	client: Client, message: Message, args: string[],
	guild_list: GuildPrtl[], portal_managed_guilds_path: string
) => {
	return new Promise((resolve) => {
		const guild_object = guild_list.find(g => g.id === message.guild?.id);
		if (!guild_object) {
			return resolve({ result: true, value: 'portal guild could not be fetched' });
		}

		if (args.length === 0) {
			message.author
				.send(get_command_help())
				.catch(console.error);
			message.author
				.send(get_variable_help())
				.catch(console.error);
			message.author
				.send(get_pipe_help())
				.catch(console.error);
			message.author
				.send(get_attribute_help())
				.catch(console.error);
			message.author
				.send(get_structure_help())
				.catch(console.error);
		}
		else if (args.length === 1) {
			if (args[0] === 'commands') {
				message.author
					.send(get_command_help())
					.catch(console.error);
			}
			else if (args[0] === 'variables') {
				message.author
					.send(get_variable_help())
					.catch(console.error);
			}
			else if (args[0] === 'pipes') {
				message.author
					.send(get_pipe_help())
					.catch(console.error);
			}
			else if (args[0] === 'attributes') {
				message.author
					.send(get_attribute_help())
					.catch(console.error);
			}
			else if (args[0] === 'structures') {
				message.author
					.send(get_structure_help())
					.catch(console.error);
			} else {

				const func_detailed = get_command_help_super(args[0]);
				if (func_detailed) {
					message.author
						.send(func_detailed)
						.catch(console.error);
				}
				const vrbl_detailed = get_variable_help_super(args[0]);
				if (vrbl_detailed) {
					message.author
						.send(vrbl_detailed)
						.catch(console.error);
				}
				const pipe_detailed = get_pipe_help_super(args[0]);
				if (pipe_detailed) {
					message.author
						.send(pipe_detailed)
						.catch(console.error);
				}
				const attr_detailed = get_attribute_help_super(args[0]);
				if (attr_detailed) {
					message.author
						.send(attr_detailed)
						.catch(console.error);
				}
				const strc_detailed = get_structure_help_super(args[0]);
				if (strc_detailed) {
					message.author
						.send(strc_detailed)
						.catch(console.error);
				}

				if (!func_detailed || !vrbl_detailed || !pipe_detailed || !attr_detailed || !strc_detailed) {
					return resolve({
						result: false,
						value: `**${args[0]}**, *does not exist in Portal™, you can run "./help help" for help.*`,
					});
				}
			}
		}
		return resolve({
			result: true,
			value: 'I sent you a private message',
		});
	});
};