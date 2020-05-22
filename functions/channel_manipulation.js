const classes = require('./../classes/portal.js');

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
					portal_list.push(new classes.portal_channel(
						channel.id, creator_id, portal_name,
						'G$#-P$member_count | $status_list', [],
						false, 0, 0, 0, channel.position, 'gr',
						this.portal_counter++ // not editable
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
					portal_list.push(new classes.portal_channel(
						channel.id, creator_id, portal_name,
						'G$#-P$member_count | $status_list', [],
						false, 0, 0, 0, channel.position, 'gr'
					));
				})
		}
	}
	,

	create_voice_channel: function (state, portal_list, creator_id) {
		state.voiceChannel.guild.createChannel('loading...', { type: 'voice' }, { bitrate: 64 })
			.then(channel => {
				for (i = 0; i < portal_list.length; i++)
					if (portal_list[i].id === state.voiceChannel.id)
						portal_list[i].voice_list.push(
							new classes.voice_channel(
								channel.id, creator_id,
								false, 0, 0, 0, channel.position, 
								'gr'
							)
						);

				// doesn't have category
				if (state.voiceChannel.parentID !== null)
					channel.setParent(state.voiceChannel.parentID);
				// move member from portal to voice channel
				state.setVoiceChannel(channel);
			}).catch(console.error);

		return
	}
	,

	create_url_channel: function (server, url_name,
		category_name, url_list, creator_id) {
		if (category_name) {
			// creating category
			server.createChannel(category_name, { type: 'category' })

			// creating voice channel
			server.createChannel(url_name+' (url-only)', { type: 'text' }, { bitrate: 8 })
				.then(channel => {
					url_list.push(channel.id)
						// new classes.portal_channel(
						// channel.id, creator_id, url_name,
						// 'URL-ONLY', [],
						// false, 0, 0, 0, channel.position, 'gr',
						// this.portal_counter++ // not editable
						// ));

					let category = server.channels.find(
						c => c.name == category_name && c.type == 'category'
					);
					if (!category) throw new Error('Category channel does not exist');
					channel.setParent(category);
				}).catch(console.error);
		} else {
			// creating voice channel
			server.createChannel(url_name+' (url-only)', { type: 'text' }, { bitrate: 8 })
				.then(channel => {
					url_list.push(channel.id)
						// new classes.portal_channel(
						// channel.id, creator_id, url_name,
						// 'URL-ONLY', [],
						// false, 0, 0, 0, channel.position, 'gr',
						// this.portal_counter++ // not editable
						// ));
				})
		}
	}

};

// console.log('Object.getOwnPropertyNames(state)= ', Object.getOwnPropertyNames(state));
// console.log('Object.getOwnPropertyNames(state.user)= ', Object.getOwnPropertyNames(state.user));