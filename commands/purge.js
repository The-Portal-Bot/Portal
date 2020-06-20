const guld_mngr = require('./../functions/guild_manager');

module.exports = async (client, message, args, portal_guilds, portal_managed_guilds_path) => {
	// if (message.guild.id !== '228667314252283904') {
	// 	message.guild.channels.cache.forEach((value) => {
	// 		if (value.deletable) {
	// 			value.delete()
	// 				.then(channel => console.log('Deleted the channel: ' + channel))
	// 				.catch(console.error);
	// 		}
	// 	});

	// 	message.guild.channels.create('general voice', { type: 'voice' }, { bitrate: 8 })
	// 		.then(
	// 			message.guild.channels.create('general text', { type: 'text' })
	// 				.then(value => { value.send('**Purge done**').then(msg => { msg.delete({ timeout: 5000 }); }); })
	// 		);

	// 	guld_mngr.delete_guild(message.guild.id, portal_guilds);
	// 	guld_mngr.insert_guild(message.guild.id, portal_guilds, portal_managed_guilds_path);
		
	// 	return {
	// 		result: true, value: '**Purge done.**'
	// 	};
	// }
	// return {
	// 	result: false, value: '**Purge failed.**'
	// };
};
