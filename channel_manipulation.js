module.exports = 
{
	included_in_portal_list: function(channel_id, portal_list)
	{
		for(i=0, portal=portal_list[i]; i < portal_list.length; i++, portal=portal_list[i]) {
			console.log(portal.id + " === " + channel_id)
			if(portal.id === channel_id) {
				return true;
			}
		}

		return false;
	}
	
	,

	included_in_voice_list: function(channel_id, portal_list)
	{
		for(i=0, portal=portal_list[i]; i < portal_list.length; i++, portal=portal_list[i]) {
			for(j=0, voice=portal.voice_list[j]; j < portal.voice_list.length; j++, voice=portal.voice_list[j]) {
				console.log(voice.id + " === " + channel_id)
				if(voice.id === channel_id) {
					return true;
				}
			}
		}

		return false;
	}
	
	,

	delete_voice_channel: function (channel_to_delete, portal_list)
	{
		for(i=0, portal=portal_list[i]; i < portal_list.length; i++, portal=portal_list[i]) {
			for(j=0, voice=portal.voice_list[j]; j < portal.voice_list.length; j++, voice=portal.voice_list[j]) {
				if(voice.id === channel_to_delete.id) {
					portal.voice_list.splice(j, 1);
				}
			}
		}
		

		channel_to_delete.delete()
		.then(g => console.log(`Deleted the guild ${g}`))
		.catch(console.error);
	}
	,

	create_portal_channel: function (server, portal_name, category_name, portal_list)
	{
		if(category_name)
		{
			// creating category
			server.createChannel(category_name, {type: "category"})

			// creating voice channel
			server.createChannel(portal_name, {type: "voice"}, { bitrate: 8 })
			.then (channel => {
				portal_list.push({id: channel.id, regex: portal_name, voice_list: []});

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
				portal_list.push({id: channel.id, regex: portal_name, voice_list: []});
			})
		}
	}
	,

	create_voice_channel: function (state, portal_list)
	{
		state.voiceChannel.guild.createChannel("loading...", {type: "voice"}, { bitrate: 64 })
		.then(channel => {
			for(i=0, portal=portal_list[i]; i < portal_list.length; i++, portal=portal_list[i])
			{
				// finding the portal channel in portal channel list
				console.log(portal.id + "===" + state.voiceChannel.id)
				if(portal.id === state.voiceChannel.id)
				{
					console.log("found portal.id in portal_list")
					portal.voice_list.push({id: channel.id, regex: "## $game_name"});
				}
			}
						
			if (state.voiceChannel.parentID === null){ // doesn't have category
				state.setVoiceChannel(channel);
			} else { // has category
				channel.setParent(state.voiceChannel.parentID);
				state.setVoiceChannel(channel); // move member from portal to voice channel
			}
		}).catch(console.error);
		
		return
	}
	,

	get_array_of_games: function (guild, portal_list)
	{
		let array_of_games = [];

		guild.channels.forEach( channel => {
			for(i=0, portal=portal_list[i]; i < portal_list.length; i++, portal=portal_list[i]) {
				for(j=0, voice=portal.voice_list[j]; j < portal.voice_list.length; j++, voice=portal.voice_list[j]) {
					if(channel.id === voice.id)
					{
						channel.members.forEach( (member_game) => {
							if(member_game.presence.game !== null) {
								console.log("member_game.presence.game: "+member_game.presence.game)
								array_of_games.push(member_game.presence.game);
							}
						})
						console.log("array_of_games="+array_of_games)
						console.log("array_of_games.length="+array_of_games.length)

						if(array_of_games.length > 0) {
							channel.setName(array_of_games.toString());
						} else {
							channel.setName("general")
						}
						
						console.log("update channel with id: "+channel.id+", with name"+array_of_games[channel.id])
						
						return
					}
				}
			}
		})
	}

	,

	generate_channel_names: function (guild, voice_list_id, regex_string)
	{
	}

};