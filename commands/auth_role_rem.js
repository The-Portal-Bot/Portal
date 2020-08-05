module.exports = async (client, message, args, portal_guilds) => {
	return new Promise((resolve) => {
		if(args.length !== 1) {
			resolve({ result: false, value: 'you should give one role.\nyou can run "./help auth_role_rem" for help.*' });
		}

		let role = message.guild.roles.cache.find(role => args[0] === role.name);
		if(role) {

			for (var i in portal_guilds[message.guild.id].auth_list) {
				if (portal_guilds[message.guild.id].auth_list[i] === role.id) {
					portal_guilds[message.guild.id].auth_list.splice(i, 1);
					return resolve({ result: true, value: `role ${args[0]} has been removed from authorized roles.` });
				}
			}
			return resolve({ result: false, value: `role ${args[0]} is not in role list.` });

		} else {
			resolve({ result: false, value: `role ${args[0]} does not exist in guild ${message.guild}.` });
		}
	});
};
