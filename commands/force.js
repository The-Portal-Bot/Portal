/* eslint-disable no-unused-vars */
const guld_mngr = require('./../functions/guild_manager');

const renameKey = (objct, oldKey, newKey) => {
	if (oldKey !== newKey) {
		if (Object.prototype.hasOwnProperty.call(objct.voice_list, oldKey)) {
		// if (objct.voice_list.hasOwnProperty(oldKey)) {
			objct.voice_list[newKey] = objct.voice_list[oldKey];
			delete objct.voice_list[oldKey];

			return objct;
		}
	}
	return objct;
};

const copyKey = (objct, oldKey, cpyKey) => {
	if (oldKey !== cpyKey) {
		if (Object.prototype.hasOwnProperty.call(objct.voice_list, oldKey)) {
		// if (objct.voice_list.hasOwnProperty(oldKey)) {
			objct.voice_list[cpyKey] = objct.voice_list[oldKey];
			return objct;
		}
	}
	return objct;
};

module.exports = async (client, message, args, portal_guilds, portal_managed_guilds_path) => {
	return new Promise((resolve) => {
		let current_portal_list = portal_guilds[message.guild.id].portal_list;

		if (message.member.voice.channel === undefined || message.member.voice.channel === null) {
			return resolve({
				result: false,
				value: '*you must be in a channel handled by* **Portal™***.*'
			});
		} else if (!guld_mngr.included_in_voice_list(message.member.voice.channel.id, current_portal_list)) {
			return resolve({
				result: false,
				value: '*the channel you are in is not handled by* **Portal™***.*'
			});
		}

		for (let portal_id in current_portal_list) {

			let current_portal = current_portal_list[portal_id];
			if (current_portal.voice_list[message.member.voice.channel.id]) {

				let current_voice = current_portal.voice_list[message.member.voice.channel.id];
				if (current_voice.creator_id === message.member.id) {

					let updated_name = guld_mngr.regex_interpreter(
						current_voice.regex,
						message.member.voice.channel,
						current_voice,
						current_portal_list,
						portal_guilds,
						message.guild
					);

					message.member.voice.channel.clone({
						name: updated_name
					})
						.then(clone => {
							current_portal = copyKey(
								current_portal,
								message.member.voice.channel.id,
								'intermidiary'
							);

							message.member.voice.channel.members.forEach(member => {
								member.voice.setChannel(clone);
							});
							
							setTimeout(() => {
								current_portal = renameKey(
									current_portal, 'intermidiary', clone.id
								);
							}, 2000);
						})
						.catch(error => {
							return resolve({
								result: true,
								value: `*an error occured why trying to force update.\n${error}*`
							});
						});
				} else {
					return resolve({
						result: false,
						value: '*you must be the creator of the voice channel to force update it.*'
					});
				}
			}
		}

		
	});
};
