import { Message } from "discord.js";
import { create_rich_embed } from "../../../libraries/helpOps";
import { GuildPrtl } from "../../../types/classes/GuildPrtl";
import { get_attribute_guide, get_attribute_help, get_attribute_help_super } from "../../../types/interfaces/Attribute";
import { get_command_guide, get_command_help, get_command_help_super } from "../../../types/interfaces/Command";
import { Field, ReturnPormise } from "../../../types/interfaces/InterfacesPrtl";
import { get_pipe_guide, get_pipe_help, get_pipe_help_super } from "../../../types/interfaces/Pipe";
import { get_structure_guide, get_structure_help, get_structure_help_super } from "../../../types/interfaces/Structure";
import { get_variable_guide, get_variable_help, get_variable_help_super } from "../../../types/interfaces/Variable";

module.exports = async (
	message: Message, args: string[], guild_object: GuildPrtl
): Promise<ReturnPormise> => {
	return new Promise((resolve) => {
		if (args.length === 0) {
			const func_array: Field[] = [
				{
					emote: './help commands OR ./help commands guide',
					role: 'Commands are mini programs you can use to get a response',
					inline: false
				},
				{
					emote: null,
					role: 'Regex Interpreter',
					inline: false
				},
				{
					emote: './help variables OR ./help variables guide',
					role: 'Variables are live data you can use to make voice channel names or run with ./run',
					inline: false
				},
				{
					emote: './help pipes OR ./help pipes guide',
					role: 'Pipes are mini-programs that manipulate text or even variables',
					inline: false
				},
				{
					emote: './help attributes OR ./help attributes guide',
					role: 'Attributes are options the options of your current portal, which you can change with ./set',
					inline: false
				},
				{
					emote: './help structures OR ./help structures guide',
					role: 'Structures are a way to manipulate the outcome of a text to greater extend',
					inline: false
				},
				{
					emote: null,
					role: 'Specific help',
					inline: false
				},
				{
					emote: './help <specific_property_name>',
					role: 'If you want to specify the action of a anything just type ./help <specific_property_name>',
					inline: false
				}
			];

			message.reply(
				create_rich_embed(
					'Portal Documentation',
					'Documentation: https://portal-bot.xyz/docs\n\n' +
					'```If you want to make a member a dj, admin or ignore him. ' +
					'You have to assign him roles p.dj, p.admin, p.ignore respectively```',
					'#9775A9', func_array, null, null, true, null, null
				))
				.catch(console.error);

			return resolve({
				result: true,
				value: ''
			});
		}
		else if (args.length === 2) {
			if (args[0] === 'commands' && args[1] === 'guide') {
				message.author
					.send(get_command_guide())
					.catch(console.error);
			}
			else if (args[0] === 'variables' && args[1] === 'guide') {
				message.author
					.send(get_variable_guide())
					.catch(console.error);
			}
			else if (args[0] === 'pipes' && args[1] === 'guide') {
				message.author
					.send(get_pipe_guide())
					.catch(console.error);
			}
			else if (args[0] === 'attributes' && args[1] === 'guide') {
				message.author
					.send(get_attribute_guide())
					.catch(console.error);
			}
			else if (args[0] === 'structures' && args[1] === 'guide') {
				message.author
					.send(get_structure_guide())
					.catch(console.error);
			}
			else {
				return resolve({
					result: false,
					value: `*${args[0]} ${args[1]}* does not exist in portal' + 
					'go to https://portal-bot.xyz/docs\n' +
					'or type \`./help help\` for help`,
				});
			}
		}
		else if (args.length === 1) {
			if (args[0] === 'all') {
				get_command_help().forEach(embed =>
					message.author
						.send(embed)
						.catch(console.error)
				);
				get_variable_help().forEach(embed =>
					message.author
						.send(embed)
						.catch(console.error)
				);
				get_pipe_help().forEach(embed =>
					message.author
						.send(embed)
						.catch(console.error)
				);
				get_attribute_help().forEach(embed =>
					message.author
						.send(embed)
						.catch(console.error)
				);
				get_structure_help().forEach(embed =>
					message.author
						.send(embed)
						.catch(console.error)
				);
			}
			else if (args[0] === 'commands') {
				get_command_help().forEach(embed =>
					message.author
						.send(embed)
						.catch(console.error)
				);
			}
			else if (args[0] === 'variables') {
				get_variable_help().forEach(embed =>
					message.author
						.send(embed)
						.catch(console.error)
				);
			}
			else if (args[0] === 'pipes') {
				get_pipe_help().forEach(embed =>
					message.author
						.send(embed)
						.catch(console.error)
				);
			}
			else if (args[0] === 'attributes') {
				get_attribute_help().forEach(embed =>
					message.author
						.send(embed)
						.catch(console.error)
				);
			}
			else if (args[0] === 'structures') {
				get_structure_help().forEach(embed =>
					message.author
						.send(embed)
						.catch(console.error)
				);
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

				if (!func_detailed && !vrbl_detailed && !pipe_detailed && !attr_detailed && !strc_detailed) {
					return resolve({
						result: false,
						value: `*${args[0]}* does not exist in portal, you can run \`./help help\` for help`,
					});
				}
			}

			return resolve({
				result: true,
				value: 'I sent you a private message'
			});
		}
	});
};