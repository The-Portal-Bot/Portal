module.exports = 
{
	delete_voice_channel: function (channel_to_delete, voice_list_id)
	{
		const index = voice_list_id.indexOf(channel_to_delete.id);
		if (index > -1) { voice_list_id.splice(index, 1); }

		channel_to_delete.delete()
		.then(g => console.log(`Deleted the guild ${g}`))
		.catch(console.error);
	}
	,

	create_portal_channel: function (server, portal_name, category_name, portal_list_id)
	{
		if(category_name)
		{
			// creating category
			server.createChannel(category_name, {type: "category"})

			// creating voice channel
			server.createChannel(portal_name, {type: "voice"}, { bitrate: 8 })
			.then (channel => {
				portal_list_id.push(channel.id);
				let category = server.channels.find(
					c => c.name == category_name && c.type == "category"
				);
				if (!category) throw new Error("Category channel does not exist");
				channel.setParent(category);
			}).catch(console.error);
		}
		else
		{
			// creating voice channel
			server.createChannel(portal_name, {type: "voice"}, { bitrate: 8 })
			.then (channel => {
				portal_list_id.push(channel.id);
			})
		}
	}
	,

	create_voice_channel: function (state, voice_list_id, regex_string_id)
	{
		state.voiceChannel.guild.createChannel("loading...", {type: "voice"}, { bitrate: 64 })
		.then(channel => {
			voice_list_id.push(channel.id)
			regex_string_id[channel.id] = "## $game_name";
			
			if (state.voiceChannel.parentID === null){ // doesn't have category
				state.setVoiceChannel(channel);
			} else { // has category
				channel.setParent(state.voiceChannel.parentID);
				state.setVoiceChannel(channel);
			}
		}).catch(console.error);
		return
	}
	,

	get_array_of_games: function (guild, voice_list_id, regex_string_id)
	{
		let array_of_games = {};

		guild.channels.forEach( channel => {
			for(j=0, voice=voice_list_id[j]; j < voice_list_id.length; j++, voice=voice_list_id[j])
			{
				if(channel.id === voice)
				{
					array_of_games[channel.id] = " ";
					channel.members.forEach( (member_game) => {
						if(member_game.presence.game !== null) {
							console.log("member_game.presence.game: "+member_game.presence.game)
							array_of_games[channel.id] += member_game.presence.game;
						}
					})
					channel.setName(array_of_games[channel.id]);
					console.log("update channel with id: "+channel.id+", with name"+array_of_games[channel.id])
					return
				}
			}
		})
	}

	,

	generate_channel_names: function (guild, voice_list_id, regex_string)
	{
	}
};