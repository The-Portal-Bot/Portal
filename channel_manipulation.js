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
	
	status_list: function(current_status)
	{
		status_shortcuts = [
			{status: "League of Legends", alias: "LoL", type: "game"},
			{status: "Overwatch", alias: "OW", type: "game"},
			{status: "The Mean Greens - Plastic Warfare", alias: "Mean Greens", type: "game"},
			{status: "The Witcher 2: Assassins of Kings Enhanced Edition", alias: "Witcher 2", type: "game"},
			{status: "Don't Starve Together", alias: "Don't Starve", type: "game"},
			{status: "Age of Empires II (2013)", alias: "AoE II", type: "game"},
			{status: "Valorant", alias: "Kako Game", type: "game"},
			{status: "Counter-Strike: Global Offensive", alias: "CS:GO", type: "game"},
			{status: "Team Fortress 2", alias: "TF2", type: "game"},
			{status: "Grand Theft Auto V", alias: "GTAV", type: "game"},
			{status: "PLAYERUNKNOWN'S BATTLEGROUNDS", alias: "PUBG", type: "game"},
			{status: "MONSTER HUNTER: WORLD", alias: "MH:W", type: "game"},
			{status: "The Elder Scrolls V: Skyrim", alias: "Skyrim", type: "game"},
			{status: "The Elder Scrolls V: Skyrim Special Edition", alias: "Skyrim", type: "game"},
			{status: "The Elder Scrolls Online", alias: "ESO", type: "game"},
			{status: "Tom Clancy's Rainbow Six Siege", alias: "Rainbow Six Siege", type: "game"},
			{status: "FINAL FANTASY XIV", alias: "FFXIV", type: "game"},
			{status: "FINAL FANTASY XIV Online", alias: "FFXIV", type: "game"},
			{status: "Warhammer End Times Vermintide", alias: "Vermintide 1", type: "game"},
			{status: "Warhammer: Vermintide 2", alias: "Vermintide 2", type: "game"},
			{status: "World of Warcraft Classic", alias: "WoW Classic", type: "game"},
			{status: "World of Warcraft", alias: "WoW", type: "game"},
			{status: "Call of Dutyː Modern Warfare", alias: "CoDːMW", type: "game"},
			{status: "Call of Duty®️ː Modern Warfare®️", alias: "CoDːMW", type: "game"},

			{status: "Google Chrome", alias: "Chrome", type: "program"},
			{status: "Spotify", alias: "Spotify Music", type: "program"},
		];

		for(i=0, status=status_shortcuts[i]; i < status_shortcuts.length; i++, status=status_shortcuts[i]) {
			if(current_status == status.status)
			{
				return status.alias;
			}
		}
		return current_status;
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
						console.log("regex to follow: "+voice.regex)
						channel.members.forEach( (member_game) => {
							if(member_game.presence.game !== null) {
								console.log("member_game.presence.game: "+member_game.presence.game)
								console.log("status_list(member_game.presence.game): "+this.status_list(member_game.presence.game))
								array_of_games.push(this.status_list(member_game.presence.game));
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