module.exports = {
	status_aliases: function(current_status)
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

			{status: "Google Chrome", alias: "Google Chrome", type: "program"},
			{status: "Spotify", alias: "Μουσικούλα", type: "program"},
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
	
	get_status_list: function (guild, id)
	{
		let array_of_games = [];
		
		guild.channels.forEach( channel => {
			if(channel.id === id)
			{
				channel.members.forEach( (member_game) => {
					if(member_game.presence.game !== null) {
						array_of_games.push(this.status_aliases(member_game.presence.game));
					}
				})
				if(array_of_games.length === 0) {
					array_of_games.push("chilling")
				}
			}
		})

		return array_of_games;
	}
};
