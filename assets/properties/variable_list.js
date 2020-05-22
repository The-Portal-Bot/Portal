const object = require('./../../functions/object_retrievers.js');

const moment = require('moment');
const vocal = require('voca');

module.exports =
{
	prefix: "$",
	variables: [
		{
			name: "#",
			description: "number of channel in list",
			args: "none",
			get: (guild, id, portal_list) => {
				let voice_number = undefined;
				portal_list.forEach(portal => {
					portal.voice_list.forEach((voice, key) => {
						if (voice.id === id) voice_number = key + 1;
					})
				})
				return voice_number;
			}
		},
		{
			name: "##",
			description: "number of channel in list with #",
			args: "none",
			get: (guild, id, portal_list) => {
				return portal_list.some((portal, key) => {
					if (portal.id === id) return key;
				})
			}
		},
		{
			name: "date",
			description: "full date: dd/mm/yyyy",
			args: "none",
			get: () => { return moment().locale("gr").subtract(10, 'days').calendar(); }
		},
		{
			name: "number_day",
			description: "gets the day number",
			args: "none",
			get: () => { return moment().locale("gr").format('dddd'); }
		},
		{
			name: "name_day",
			description: "gets the day name",
			args: "none",
			get: () => { return moment().locale("gr").format('dddd'); }
		},
		{
			name: "month",
			description: "gets the month",
			args: "none",
			get: () => { return moment().locale("gr").format('mmmm'); }
		},
		{
			name: "year",
			description: "gets the year",
			args: "none",
			get: () => { return moment().locale("gr").format('yyyy'); }
		},
		{
			name: "time",
			description: "full time: hh/mm/ss",
			args: "none",
			get: () => { return moment().locale("gr").format('h:mm:ss'); }
		},
		{
			name: "hour",
			description: "gets the hour",
			args: "none",
			get: () => { return moment().locale("gr").format('h'); }
		},
		{
			name: "minute",
			description: "gets the minute",
			args: "none",
			get: () => { return moment().locale("gr").format('mm'); }
		},
		{
			name: "second",
			description: "gets the second",
			args: "none",
			get: () => { return moment().locale("gr").format('ss'); }
		},
		{
			name: "crtr",
			description: "creator of the channel",
			args: "none",
			get: (guild, id, portal_list) => {
				portal_list.forEach(portal => {
					portal.voice_list.forEach(voice => {
						if (voice.id === id) return voice.creator;
					})
				})
			}
		},
		{
			name: "status_list",
			description: "list of current member statuses",
			args: "none",
			get: (guild, id, portal_list) => { return object.get_status_list(guild, id, portal_list) }
		},
		{
			name: "status_count",
			description: "count of current member statuses",
			args: "none",
			get: (guild, id) => { //check if he is in a voice channel of a portal 
				if (typeof (object.get_status_list(guild, id)) !== "object") { return 0; }
				else { object.get_status_list(guild, id).length; }
			}
		},
		{
			name: "status_history",
			description: "history of all the statuses",
			args: "none",
			get: () => { return "no_yet_implemented" }
		},
		{
			name: "member_list",
			description: "returns the currently played games",
			args: "none",
			get: (guild, id) => {
				let mmbr_lst = [];
				guild.channels.forEach(channel => {
					if (channel.id === id)
						channel.members.forEach(member => {
							mmbr_lst.push(member);
						});
				});
				return mmbr_lst;
			}
		},
		{
			name: "member_count",
			description: "number of members in channel",
			args: "none",
			get: (guild, id) => {
				let cnt = undefined;
				guild.channels.forEach(channel => {
					if (channel.id === id) cnt = channel.members.size;
				})
				return cnt;
			}
		},
		{
			name: "member_playing",
			description: "number of members playing",
			args: "none",
			get: (guild, id) => {
				let cnt = 0;
				guild.channels.forEach(channel => {
					if (channel.id === id)
						channel.members.forEach((member) => {
							if (member.presence.game !== null) cnt++;
						})
				})
				return cnt;
			}
		},
		{
			name: "member_history",
			description: "returns the currently played games",
			args: "none",
			get: () => { return "no_yet_implemented" }
		},
		{
			name: "member_limit",
			description: "sets the limit of users in channel",
			args: "none",
			get: (guild, id) => {
				let cnt = undefined;
				guild.channels.forEach(channel => {
					if (channel.id === id) cnt = channel.userLimit;
				})
				return cnt;
			}
		}
	]
}
