const games = require('../assets/status/game_list.json');
const programs = require('../assets/status/program_list.json');

module.exports = {
	status_aliases: function (current_statuses, portal_list, id) {
		new_status = [];

		for (i = 0; i < portal_list.length; i++)
			for (j = 0; j < portal_list[i].voice_list.length; j++)
				if (portal_list[i].voice_list[j].id === id) {



					current_statuses.forEach(status => {
						let found = false;

						for (l = 0; l < games.game_attributes.length; l++)
							if (status.name == games.game_attributes[l].status)
								if (portal_list[i].voice_list[j].locale === 'gr') {
									new_status.push(games.game_attributes[l].locale.gr);
									found = true;
								}
								else {
									new_status.push(games.game_attributes[l].locale.en);
									found = true;
								}
						if(!found)
							for (l = 0; l < programs.program_attributes.length; l++)
								if (status.name == programs.program_attributes[l].status)
									if (portal_list[i].voice_list[j].locale === 'gr') {
										new_status.push(programs.program_attributes[l].locale.gr);
										found = true;
									}
									else {
										new_status.push(programs.program_attributes[l].locale.en);
										found = true;
									}

						if(!found)
							new_status.push(status.name);
					});

					// for (l = 0; l < games.game_attributes.length; l++)
					// 	if (current_statuses == games.game_attributes[l].status)
					// 		if (portal_list[i].voice_list[j].locale === 'gr')
					// 			return games.game_attributes[l].locale.gr;
					// 		else
					// 			return games.game_attributes[l].locale.en;
					// for (l = 0; l < programs.program_attributes.length; l++)
					// 	if (current_statuses == programs.program_attributes[l].status)
					// 		if (portal_list[i].voice_list[j].locale === 'gr')
					// 			return programs.program_attributes[l].locale.gr;
					// 		else
					// 			return programs.program_attributes[l].locale.en;
				}
								
		return new_status.join('/');
	}
	,

get_status_list: function (guild, id, portal_list) {
	let array_of_statuses = [];

	guild.channels.cache.some(channel => {
		if (channel.id === id) {
			channel.members.forEach((member, index) => {
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
	console.log('\n\n\narray_of_statuses: ', array_of_statuses);
	return array_of_statuses;
}
};
