const games = require('../assets/status/game_list.json');
const programs = require('../assets/status/program_list.json');

module.exports = {
	status_aliases: function (current_statuses, portal_list, id) {
		new_status = [];

		for (let key in portal_list) {
			if (portal_list[key].voice_list[id]) {
				current_statuses.forEach(status => {
					let found = false;
					for (l = 0; l < games.game_attributes.length; l++)
						if (status.name == games.game_attributes[l].status)
							if (portal_list[key].voice_list[id].locale === 'gr') {
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
								if (portal_list[key].voice_list[id].locale === 'gr') {
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
			}
		}					
		return new_status.join('_');
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
				for (let key in portal_list)
					if (portal_list[key].voice_list[id])
						if (portal_list[key].voice_list[id].locale === 'gr')
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
