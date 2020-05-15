const games = require('../assets/status/game_list.json');
const programs = require('../assets/status/program_list.json');

module.exports = {
	status_aliases: function (current_status, portal_list, id) {

		// these loops work either position because there are encapsulated returns
		for (i = 0; i < portal_list.length; i++)
			for (j = 0; j < portal_list[i].get_voice_list().length; j++)
				if (portal_list[i].get_voice_list()[j].get_id() === id)
					for (l = 0; l < games.game_attributes.length; l++)
						if (current_status == games.game_attributes[l].status)
							if (portal_list[i].get_voice_list()[j].get_lang() === 'gr')
								return games.game_attributes[l].lang.gr;
							else
								return games.game_attributes[l].lang.en;

		// these loops work either position because there are encapsulated returns
		for (i = 0; i < portal_list.length; i++)
			for (j = 0; j < portal_list[i].get_voice_list().length; j++)
				if (portal_list[i].get_voice_list()[j].get_id() === id)
					for (l = 0; l < programs.program_attributes.length; l++)
						if (current_status == programs.program_attributes[l].status)
							if (portal_list[i].get_voice_list()[j].get_lang() === 'gr')
								return programs.program_attributes[l].lang.gr;
							else
								return programs.program_attributes[l].lang.en;

		return current_status;
	}
	,

	get_status_list: function (guild, id, portal_list) {
		let array_of_statuses = [];

		guild.channels.forEach(channel => {
			if (channel.id === id) {
				channel.members.forEach((member_game) => {
					if (member_game.presence.game !== null)
						array_of_statuses.push(this.status_aliases(member_game.presence.game, portal_list, id));
				});
				if (array_of_statuses.length === 0)
					array_of_statuses.push("chilling");
				else
					array_of_statuses = array_of_statuses.filter((v, i, a) => a.indexOf(v) === i);
			}
		})
		return array_of_statuses;
	}
};
