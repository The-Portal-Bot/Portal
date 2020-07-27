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
		if (portal_guilds[message.guild.id].member_list[message.member.id]) {
			return resolve ({ result: true,
				value: `your level is **${portal_guilds[message.guild.id].member_list[message.member.id].level}**` });
		}
		return resolve ({ result: false, value: 'you are not in the charts' });
	});
};