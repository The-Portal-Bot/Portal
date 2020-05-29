const games = require('../assets/status/game_list.json');
const programs = require('../assets/status/program_list.json');

module.exports = {
	status_aliases: function (current_status, portal_list, id) {

		for (i = 0; i < portal_list.length; i++)
			for (j = 0; j < portal_list[i].voice_list.length; j++)
				if (portal_list[i].voice_list[j].id === id)
					for (l = 0; l < games.game_attributes.length; l++)
						if (current_status == games.game_attributes[l].status)
							if (portal_list[i].voice_list[j].locale === 'gr')
								return games.game_attributes[l].locale.gr;
							else
								return games.game_attributes[l].locale.en;

		for (i = 0; i < portal_list.length; i++)
			for (j = 0; j < portal_list[i].voice_list.length; j++)
				if (portal_list[i].voice_list[j].id === id)
					for (l = 0; l < programs.program_attributes.length; l++)
						if (current_status == programs.program_attributes[l].status)
							if (portal_list[i].voice_list[j].locale === 'gr')
								return programs.program_attributes[l].locale.gr;
							else
								return programs.program_attributes[l].locale.en;

		return current_status;
	}
	,

get_status_list: function (guild, id, portal_list) {
	let array_of_statuses = [];

	guild.channels.cache.some(channel => {
		if (channel.id === id) {
			channel.members.forEach((member) => {
				if (member.presence.activities !== null) {
					let status = this.status_aliases(member.presence.activities, portal_list, id);
					if (!array_of_statuses.includes(status))
						array_of_statuses.push(status);
				}
			});
			if (array_of_statuses.length === 0)
				for (i = 0; i < portal_list.length; i++)
					for (j = 0; j < portal_list[i].voice_list.length; j++)
						if (portal_list[i].voice_list[j].id === id)
							if (portal_list[i].voice_list[j].locale === 'gr')
								array_of_statuses.push("Άραγμα");
							else
								array_of_statuses.push("Chilling");
			return;
		}
	})
	return array_of_statuses;
}
};
