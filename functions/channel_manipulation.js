const class_portal = require('./../classes/portal.js');
const class_role = require('./../classes/role.js');

module.exports =
{
	portal_counter: 0,
	voice_counter: 0,

	included_in_portal_list: function (channel_id, portal_list) {
		if (portal_list[channel_id])
			return true;
		return false;
	}
	,

	included_in_voice_list: function (channel_id, portal_list) {
		for (let key in portal_list)
			if (portal_list[key].voice_list[channel_id])
				return true;
		return false;
	}
	,

	delete_voice_channel: function (channel_to_delete, portal_list) {
		for (let key in portal_list)
			if (portal_list[key].voice_list[channel_to_delete.id])
				delete portal_list[key].voice_list[channel_to_delete.id];

		channel_to_delete.delete()
			.then(g => console.log(`Deleted channel with id: ${g}`))
			.catch(console.error);
	}
	,

	create_portal_channel: function (guild, portal_name, category_name, json_portal_list, creator_id) {
		if (category_name) { // with category
			
			guild.channels.create(portal_name, { type: 'voice', bitrate: 8000 })
				.then(channel => {
					json_portal_list[channel.id] =  new class_portal.portal_channel(
						creator_id, portal_name, 'G$#-P$member_count | $status_list', {},
						false, 0, 0, 0, 'gr'
					);
					
					guild.channels.create(category_name, { type: 'category' })
						.then(cat_channel => channel.setParent(cat_channel))
						.catch(console.error);
				})
				.catch(console.error);
		} else {
			// creating voice channel
			guild.channels.create(portal_name, { type: 'voice', bitrate: 8000 })
				.then(channel => {
					json_portal_list[channel.id] = new class_portal.portal_channel(
						creator_id, portal_name, 'G$#-P$member_count | $status_list', {},
						false, 0, 0, 0, 'gr'
					);
				})
				.catch(console.error);
		}
	}
	,

	create_voice_channel: function (state, json_portal, creator_id) {
		state.channel.guild.channels.create('loading...', { type: 'voice', bitrate: 64000 })
			.then(channel => {
				channel.userLimit = json_portal.user_limit_portal;
				json_portal['voice_list'][channel.id] = new class_portal.voice_channel(
					creator_id, json_portal.regex_voice,
					false, 0, 0, 'gr'
				);
				
				// for (i = 0; i < portal_list.length; i++)
				// 	if (portal_list[i].id === state.channel.id) {
				// 		portal_list[i].voice_list.push(
				// 			new class_portal.voice_channel(
				// 				channel.id, creator_id, portal_list[i].regex_voice,
				// 				false, 0, 0, 'gr'
				// 			)
				// 		);
				// 		channel.userLimit = portal_list[i].user_limit_portal;
				// 		break;
				// 	}

				// doesn't have category
				if (state.channel.parentID !== null)
					channel.setParent(state.channel.parentID);
				// move member from portal to voice channel
				state.member.voice.setChannel(channel);
			}).catch(console.error);

		return
	}
	,

	create_url_channel: function (guild, url_name, category_name, url_list) {
		if (category_name) {
			// creating category
			guild.channels.create(category_name, { type: 'category' })

			// creating voice channel
			guild.channels.create(url_name + ' (url-only)', { type: 'text' })
				.then(channel => {
					url_list.push(channel.id);

					let category = guild.channels.find(
						c => c.name == category_name && c.type == 'category'
					);
					if (!category) throw new Error('Category channel does not exist');
					channel.setParent(category);
				}).catch(console.error);
		} else {
			// creating voice channel
			guild.channels.create(url_name + ' (url-only)', { type: 'text' })
				.then(channel => {
					url_list.push(channel.id);
					console.log('url_list = ' + url_list);
				})
		}
	}
	,

	create_role_message: function (message, role_list, title, desc, colour, role_emb) {
		role_message_emb = create_rich_embed(title, desc, colour, role_emb);
		message.channel.send(role_message_emb)
			.then(sent_message => {
				// add roles emotes
				role_list.push(new class_role.role_message(sent_message.id, role_emb));
			});
	}
};

// console.log('Object.getOwnPropertyNames(state)= ', Object.getOwnPropertyNames(state));
// console.log('Object.getOwnPropertyNames(state.user)= ', Object.getOwnPropertyNames(state.user));