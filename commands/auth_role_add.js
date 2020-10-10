module.exports = async (client, message, args, portal_guilds) => {
	return new Promise((resolve) => {
		if (args.length <= 0) {
			resolve({ result: false, value: 'you should give one role.\nyou can run "./help auth_role_rem" for help.*' });
		}

		const role_name = args.join(' ');
		const role = message.guild.roles.cache.find(current_role => role_name === current_role.name);

		if (role) {
			for (const i in portal_guilds[message.guild.id].auth_role) {
				if (portal_guilds[message.guild.id].auth_role[i] === role.id) {
					return resolve({ result: false, value: `role "${role_name}" is already an authorized role.` });
				}
			}
			portal_guilds[message.guild.id].auth_role.push(role.id);
			resolve({ result: true, value: `role "${role_name}" has been added to role list.` });
		}
		else {
			resolve({ result: false, value: `role "${role_name}" does not exist in guild "${message.guild}".` });
		}
	});
};
