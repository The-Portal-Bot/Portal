const class_portal = require('./../classes/portal.js');
const class_role = require('./../classes/role.js');

module.exports =
{
	portal_counter: 0,
	voice_counter: 0,

	included_in_portal_list: function (channel_id, portal_list) {
		for (i = 0; i < portal_list.length; i++)
			if (portal_list[i].id === channel_id)
				return true;
		return false;
	}
	,

	included_in_voice_list: function (channel_id, portal_list) {
		for (i = 0; i < portal_list.length; i++)
			for (j = 0; j < portal_list[i].voice_list.length; j++)
				if (portal_list[i].voice_list[j].id === channel_id)
					return true;
		return false;
	}
	,

	delete_voice_channel: function (channel_to_delete, portal_list) {
		for (i = 0; i < portal_list.length; i++)
			for (j = 0; j < portal_list[i].voice_list.length; j++)
				if (portal_list[i].voice_list[j].id === channel_to_delete.id)
					portal_list[i].voice_list.splice(j, 1);

		channel_to_delete.delete()
			.then(g => console.log(`Deleted channel with id: ${g}`))
			.catch(console.error);
	}
	,

	create_portal_channel: function (server, portal_name,
		category_name, portal_list, creator_id) {
		if (category_name) {
			// creating category
			server.createChannel(category_name, { type: 'category' })

			// creating voice channel
			server.createChannel(portal_name, { type: 'voice' }, { bitrate: 8 })
				.then(channel => {
					portal_list.push(new class_portal.portal_channel(
						channel.id, creator_id, portal_name,
						'G$#-P$member_count | $status_list', [],
						false, 0, 0, 0, 'gr'
					));

					let category = server.channels.find(
						c => c.name == category_name && c.type == 'category'
					);
					if (!category) throw new Error('Category channel does not exist');
					channel.setParent(category);
				}).catch(console.error);
		} else {
			// creating voice channel
			server.createChannel(portal_name, { type: 'voice' }, { bitrate: 8 })
				.then(channel => {
					portal_list.push(new class_portal.portal_channel(
						channel.id, creator_id, portal_name,
						'G$#-P$member_count | $status_list', [],
						false, 0, 0, 0, 'gr'
					));
				})
		}
	}
	,

	create_voice_channel: function (state, portal_list, creator_id) {
		state.voiceChannel.guild.createChannel('loading...', { type: 'voice' }, { bitrate: 64 })
			.then(channel => {
				for (i = 0; i < portal_list.length; i++)
					if (portal_list[i].id === state.voiceChannel.id) {
						portal_list[i].voice_list.push(
							new class_portal.voice_channel(
								channel.id, creator_id, portal_list[i].regex_voice,
								false, 0, 0, 'gr'
							)
						);
						channel.userLimit = portal_list[i].limit_portal;
					}
				// doesn't have category
				if (state.voiceChannel.parentID !== null)
					channel.setParent(state.voiceChannel.parentID);
				// move member from portal to voice channel
				state.setVoiceChannel(channel);
			}).catch(console.error);

		return
	}
	,

	create_url_channel: function (server, url_name, category_name, url_list) {
		if (category_name) {
			// creating category
			server.createChannel(category_name, { type: 'category' })

			// creating voice channel
			server.createChannel(url_name + ' (url-only)', { type: 'text' })
				.then(channel => {
					url_list.push(channel.id);

					let category = server.channels.find(
						c => c.name == category_name && c.type == 'category'
					);
					if (!category) throw new Error('Category channel does not exist');
					channel.setParent(category);
				}).catch(console.error);
		} else {
			// creating voice channel
			server.createChannel(url_name + ' (url-only)', { type: 'text' })
				.then(channel => {
					url_list.push(channel.id);
					console.log('url_list = ' + url_list);
				})
		}
	}
	,

	create_role_message: function (message, role_list, title, desc, colour, role_emb) {
		message.channel.send(create_rich_embed(title, desc, colour, role_emb))
			.then(sent_message => {
				role_list.push(new class_role.role_message(sent_message.id, role_emb));
			});
	}
};

// console.log('Object.getOwnPropertyNames(state)= ', Object.getOwnPropertyNames(state));
// console.log('Object.getOwnPropertyNames(state.user)= ', Object.getOwnPropertyNames(state.user));