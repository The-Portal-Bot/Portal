const object = require('./../../functions/object_retrievers.js');

const moment = require('moment');

module.exports =
{
	prefix: '$',
	variables: [
		{
			name: '##',
			description: 'returns the channel number in list with # in the front.',
			super_description: '**##**, returns the channel number in list with # in the front, if it was created first ' +
				'it will display #1, if third #3, etc.',
			args: 'none',
			get: (guild, id, portal_list) => {
				let voice_number = undefined;
				portal_list.forEach(portal => {
					portal.voice_list.forEach((voice, key) => {
						if (voice.id === id) voice_number = '#' +(key + 1);
					})
				})
				return voice_number;
			}
		},{
			name: '#',
			description: 'returns the channel number in list.',
			super_description: '**#**, returns the channel number in list, if it was created first .'+
			'it will display 1, if third 3, etc.',
			args: 'none',
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
			name: 'date',
			description: 'returns the full date: dd/mm/yyyy.',
			super_description: '**date**, full date: dd/mm/yyyy.',
			args: 'none',
			get: () => { return moment().locale('gr').subtract(10, 'days').calendar(); }
		},
		{
			name: 'number_day',
			description: 'returns the day number.',
			super_description: '**number_day**, returns the day number.',
			args: 'none',
			get: () => { return moment().locale('gr').date(); }
		},
		{
			name: 'name_day',
			description: 'returns the day name.',
			super_description: '**name_day**, returns the day name.',
			args: 'none',
			get: () => { return moment().locale('gr').format('dddd'); }
		},
		{
			name: 'month',
			description: 'returns the month.',
			super_description: '**month**, returns the month.',
			args: 'none',
			get: () => { return moment().locale('gr').format('mmmm'); }
		},
		{
			name: 'year',
			description: 'returns the year.',
			super_description: '**year**, returns the year.',
			args: 'none',
			get: () => { return moment().locale('gr').format('yyyy'); }
		},
		{
			name: 'time',
			description: 'full time: hh/mm/ss.',
			super_description: '**time**, full time: hh/mm/ss.',
			args: 'none',
			get: () => { return moment().locale('gr').format('h:mm:ss'); }
		},
		{
			name: 'hour',
			description: 'returns the hour in current time.',
			super_description: '**hour**, returns the hour.',
			args: 'none',
			get: () => { return moment().locale('gr').format('h'); }
		},
		{
			name: 'minute',
			description: 'returns the minute in current time.',
			super_description: '**minute**, returns the minute.',
			args: 'none',
			get: () => { return moment().locale('gr').format('mm'); }
		},
		{
			name: 'second',
			description: 'returns the second in current time.',
			super_description: '**second**, returns the second.',
			args: 'none',
			get: () => { return moment().locale('gr').format('ss'); }
		},
		{
			name: 'status_list',
			description: 'returns the list of current member statuses.',
			super_description: '**status_list**, returns the list of all current members statuses.',
			args: 'none',
			get: (guild, id, portal_list) => { return object.get_status_list(guild, id, portal_list) }
		},
		{
			name: 'status_count',
			description: 'returns the count of current member statuses.',
			super_description: '**status_count**, returns the count of current member statuses.',
			args: 'none',
			get: (guild, id, portal_list) => { //check if he is in a voice channel of a portal 
				let status_list = object.get_status_list(guild, id, portal_list);
				if (typeof status_list === 'object' && status_list !== null) { return 0; }
				else { status_list.length; }
			}
		},
		{
			name: 'status_history',
			description: 'returns the history of all the statuses.',
			super_description: '**status_history**, returns the history of all the statuses.',
			args: 'none',
			get: () => { return 'no_yet_implemented' }
		},
		{
			name: 'member_list',
			description: 'returns the currently played games.',
			super_description: '**member_list**, returns the currentstatuses.',
			args: 'none',
			get: (guild, id) => {
				let mmbr_lst = [];
				guild.channels.cache.forEach(channel => {
					if (channel.id === id)
						channel.members.forEach(member => {
							mmbr_lst.push(member.displayName);
						});
				});
				return mmbr_lst;
			}
		},
		{
			name: 'member_count',
			description: 'returns number of members in channel.',
			super_description: '**member_count**, returns the number of members in channel.',
			args: 'none',
			get: (guild, id) => {
				let cnt = undefined;
				guild.channels.cache.forEach(channel => {
					if (channel.id === id) cnt = channel.members.size;
				})
				return cnt;
			}
		},
		{
			name: 'member_with_status',
			description: 'returns number of members with a status.',
			super_description: '**member_with_status**, returns the number of members with a status.',
			args: 'none',
			get: (guild, id) => {
				let cnt = 0;
				guild.channels.cache.forEach(channel => {
					if (channel.id === id)
						channel.members.forEach((member) => {
							if (member.presence.game !== null) cnt++;
						})
				})
				return cnt;
			}
		},
		{
			name: 'member_history',
			description: 'returns a list of all members that have connected to the channel.',
			super_description: '**member_history**, returns a list of all members that have connected to the channel.',
			args: 'none',
			get: () => { return 'no_yet_implemented' }
		},
		{
			name: 'creator_portal',
			description: 'returns the creator of current voice channel\'s portal.',
			super_description: '**creator_portal**, returns the creator of current voice channel\'s portal.',
			args: 'none',
			get: (guild, id, portal_list) => {
				for (i = 0; i < portal_list.length; i++)
					for (j = 0; j < portal_list[i].voice_list.length; j++)
						if (id === portal_list[i].voice_list[j].id)
							return portal_list[i].creator_id;
			}
		},
		{
			name: 'creator_voice',
			description: 'returns the creator of current voice channel.',
			super_description: '**creator_voice**, returns the creator of current voice channel.',
			args: 'none',
			get: (guild, id, portal_list) => {
				console.log('portal_list: ', portal_list);
				for (i = 0; i < portal_list.length; i++)
					for (j = 0; j < portal_list[i].voice_list.length; j++)
						if (id === portal_list[i].voice_list[j].id)
							return portal_list[i].voice_list[j].creator_id;
			}
		}
	]
}
