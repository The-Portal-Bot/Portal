const classes = require('./../classes/portal.js');

module.exports =
{
	portal_counter: 0,
	voice_counter: 0,

	included_in_portal_list: function (channel_id, portal_list) {
		for (i = 0; i < portal_list.length; i++)
			if (portal_list[i].get_id() === channel_id)
				return true;
		return false;
	}
	,

	included_in_voice_list: function (channel_id, portal_list) {
		for (i = 0; i < portal_list.length; i++)
			for (j = 0; j < portal_list[i].get_voice_list().length; j++)
				if (portal_list[i].get_voice_list()[j].get_id() === channel_id)
					return true;
		return false;
	}
	,

	delete_voice_channel: function (channel_to_delete, portal_list) {
		for (i = 0; i < portal_list.length; i++)
			for (j = 0; j < portal_list[i].get_voice_list().length; j++)
				if (portal_list[i].get_voice_list()[j].get_id() === channel_to_delete.id)
					portal_list[i].get_voice_list().splice(j, 1);

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
						'G$#-P$mmbr_cnt | $status_lst', [],
						false, 0, 0, 0, 'gr',
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
						'G$#-P$mmbr_cnt | $status_lst', [],
						false, 0, 0, 0, 'gr',
						this.portal_counter++ // not editable				
					));
				})
		}
	}
	,

	create_voice_channel: function (state, portal_list, creator_id) {
		state.voiceChannel.guild.createChannel('loading...', { type: 'voice' }, { bitrate: 64 })
			.then(channel => {
				for (i = 0; i < portal_list.length; i++)
					if (portal_list[i].get_id() === state.voiceChannel.id)
						portal_list[i].get_voice_list().push(
							new classes.voice_channel(
								channel.id, creator_id, portal_list[i].regex_voice,
								false, 0, 0, 0,
								this.portal_counter++ // not editable
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
};

// console.log('Object.getOwnPropertyNames(state)= ', Object.getOwnPropertyNames(state));
// console.log('Object.getOwnPropertyNames(state.user)= ', Object.getOwnPropertyNames(state.user));