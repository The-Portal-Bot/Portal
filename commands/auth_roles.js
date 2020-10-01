module.exports = async (client, message, args, portal_guilds) => {
	return new Promise((resolve) => {
		const roles = portal_guilds[message.guild.id].auth_role;
		const get_role_name = (role_id, i) => {
			return `${i}. ${message.guild.roles.cache.find(r => r.id === role_id).name}\n`;
		};
		if (portal_guilds[message.guild.id].auth_role.length > 0) {
			resolve({
				result: true,
				value: `*Authorized Roles:*\n${roles.map((r, i) => get_role_name(r, i))}`,
			});
		}
		else {
			resolve({
				result: false,
				value: 'There are no authorization roles.',
			});
		}
	});
};
