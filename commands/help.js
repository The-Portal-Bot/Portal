/* eslint-disable no-unused-vars */
/* eslint-disable no-cond-assign */
/* eslint-disable no-undef */
const cmmd_objct = require('../properties/command_list');
const vrbl_objct = require('../properties/variable_list');
const pipe_objct = require('../properties/pipe_list');
const attr_objct = require('../properties/attribute_list');
const strc_objct = require('../properties/structure_list');

module.exports = async (client, message, args, portal_guilds, portal_managed_guilds_path) => {
	return new Promise((resolve) => {
		if (args.length === 0) {
			message.author.send(cmmd_objct.get_help()).catch(console.error);
			message.author.send(vrbl_objct.get_help()).catch(console.error);
			message.author.send(pipe_objct.get_help()).catch(console.error);
			message.author.send(attr_objct.get_help()).catch(console.error);
			message.author.send(strc_objct.get_help()).catch(console.error);
		} else if (args.length === 1) {
			if (args[0] === 'cmmd') {
				message.author.send(cmmd_objct.get_help()).catch(console.error);
			} else if (args[0] === 'vrbl') {
				message.author.send(vrbl_objct.get_help()).catch(console.error);
			} else if (args[0] === 'pipe') {
				message.author.send(pipe_objct.get_help()).catch(console.error);
			} else if (args[0] === 'attr') {
				message.author.send(attr_objct.get_help()).catch(console.error);
			} else if (args[0] === 'strc') {
				message.author.send(strc_objct.get_help()).catch(console.error);
			} else if (func_detailed = cmmd_objct.get_help_super(args[0])) {
				message.author.send(func_detailed).catch(console.error);
			} else if (vrbl_detailed = vrbl_objct.get_help_super(args[0])) {
				message.author.send(vrbl_detailed).catch(console.error);
			} else if (pipe_detailed = pipe_objct.get_help_super(args[0])) {
				message.author.send(pipe_detailed).catch(console.error);
			} else if (attr_detailed = attr_objct.get_help_super(args[0])) {
				message.author.send(attr_detailed).catch(console.error);
			} else if (strc_detailed = strc_objct.get_help_super(args[0])) {
				message.author.send(strc_detailed).catch(console.error);
			} else {
				return resolve ({ result: false, value: `**${args[0]}**, *does not exist in Portal™,` +
					'you can run "./help help" for help.*' });
			}
		}
		return resolve ({ result: true, value: 'I sent you a private message' });
	});
};