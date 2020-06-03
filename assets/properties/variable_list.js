const object = require('./../../functions/object_retrievers.js');
const moment = require('moment');

module.exports =
{
	get: function (voice_channel, voice_object, portal_object, vrbl) {
		for (l = 0; l < this.variables.length; l++) {
			if (vrbl === this.variables[l].name) {
				return this.variables[l].get(voice_channel, voice_object, portal_object);
			}
		}
		return -1;
	},
	prefix: '$',
	variables: [
		{
			name: '##',
			description: 'returns the channel number in list with # in the front.',
			super_description: '**##**, returns the channel number in list with # in the front, if it was created first ' +
				'it will display #1, if third #3, etc.',
			args: 'none',
			get: (voice_channel, voice_object, portal_object) => {
				let i = 0;
				for (let key in portal_object) {
					i++;
					if (portal_object.voice_list[voice_channel.id] === voice_object) {
						return '#' + i;
					}
				}
				return '#' + '-1';
			}
		},{
			name: '#',
			description: 'returns the channel number in list.',
			super_description: '**#**, returns the channel number in list, if it was created first .'+
			'it will display 1, if third 3, etc.',
			args: 'none',
			get: (voice_channel, voice_object, portal_object) => {
				let i = 0;
				for (let key in portal_object) {
					i++;
					if (portal_object[key].voice_list[voice_channel.id] === voice_object) {
						return +i;
					}
				}
				return +-1;
			}
		},
		{
			name: 'date',
			description: 'returns the full date: dd/mm/yyyy.',
			super_description: '**date**, full date: dd/mm/yyyy.',
			args: 'none',
			get: (voice_channel, voice_object, portal_object) => {
				return moment().locale(voice_object.locale).subtract(10, 'days').calendar();
			}
		},
		{
			name: 'number_day',
			description: 'returns the day number.',
			super_description: '**number_day**, returns the day number.',
			args: 'none',
			get: (voice_channel, voice_object, portal_object) => {
				return moment().locale(voice_object.locale).date();
			}
		},
		{
			name: 'name_day',
			description: 'returns the day name.',
			super_description: '**name_day**, returns the day name.',
			args: 'none',
			get: (voice_channel, voice_object, portal_object) => {
				return moment().locale(voice_object.locale).format('dddd');
			}
		},
		{
			name: 'month',
			description: 'returns the month.',
			super_description: '**month**, returns the month.',
			args: 'none',
			get: (voice_channel, voice_object, portal_object) => {
				return moment().locale(voice_object.locale).format('mmmm');
			}
		},
		{
			name: 'year',
			description: 'returns the year.',
			super_description: '**year**, returns the year.',
			args: 'none',
			get: (voice_channel, voice_object, portal_object) => {
				return moment().locale(voice_object.locale).format('yyyy');
			}
		},
		{
			name: 'time',
			description: 'full time: hh/mm/ss.',
			super_description: '**time**, full time: hh/mm/ss.',
			args: 'none',
			get: (voice_channel, voice_object, portal_object) => {
				return moment().locale(voice_object.locale).format('h:mm:ss');
			}
		},
		{
			name: 'hour',
			description: 'returns the hour in current time.',
			super_description: '**hour**, returns the hour.',
			args: 'none',
			get: (voice_channel, voice_object, portal_object) => {
				return moment().locale(voice_object.locale).format('h');
			}
		},
		{
			name: 'minute',
			description: 'returns the minute in current time.',
			super_description: '**minute**, returns the minute.',
			args: 'none',
			get: (voice_channel, voice_object, portal_object) => {
				return moment().locale(voice_object.locale).format('mm');
			}
		},
		{
			name: 'second',
			description: 'returns the second in current time.',
			super_description: '**second**, returns the second.',
			args: 'none',
			get: (voice_channel, voice_object, portal_object) => {
				return moment().locale(voice_object.locale).format('ss');
			}
		},
		{
			name: 'status_list',
			description: 'returns the list of current member statuses.',
			super_description: '**status_list**, returns the list of all current members statuses.',
			args: 'none',
			get: (voice_channel, voice_object, portal_object) => { 
				// return object.get_status_list(guild, id, portal_object)
			}
		},
		{
			name: 'status_count',
			description: 'returns the count of current member statuses.',
			super_description: '**status_count**, returns the count of current member statuses.',
			args: 'none',
			get: (voice_channel, voice_object, portal_object) => {
				// let status_list = object.get_status_list(guild, id, portal_object);
				// if (typeof status_list === 'object' && status_list !== null) { return 0; }
				// else { status_list.length; }
			}
		},
		{
			name: 'status_history',
			description: 'returns the history of all the statuses.',
			super_description: '**status_history**, returns the history of all the statuses.',
			args: 'none',
			get: (voice_channel, voice_object, portal_object) => {
				return 'no_yet_implemented'
			}
		},
		{
			name: 'member_list',
			description: 'returns the currently played games.',
			super_description: '**member_list**, returns the currentstatuses.',
			args: 'none',
			get: (voice_channel, voice_object, portal_object) => {
				let mmbr_lst = [];
				voice_channel.members.forEach(member => { mmbr_lst.push(member.displayName); });
				return mmbr_lst;
			}
		},
		{
			name: 'member_count',
			description: 'returns number of members in channel.',
			super_description: '**member_count**, returns the number of members in channel.',
			args: 'none',
			get: (voice_channel, voice_object, portal_object) => {
				return voice_channel.members.size;
			}
		},
		{
			name: 'member_with_status',
			description: 'returns number of members with a status.',
			super_description: '**member_with_status**, returns the number of members with a status.',
			args: 'none',
			get: (voice_channel, voice_object, portal_object) => {
				let cnt = 0;
				voice_channel.members.forEach((member) => {
					if (member.presence.game !== null)
						cnt++;
				})
				return cnt;
			}
		},
		{
			name: 'member_history',
			description: 'returns a list of all members that have connected to the channel.',
			super_description: '**member_history**, returns a list of all members that have connected to the channel.',
			args: 'none',
			get: (voice_channel, voice_object, portal_object) => {
				return 'no_yet_implemented'
			}
		},
		{
			name: 'creator_portal',
			description: 'returns the creator of current voice channel\'s portal.',
			super_description: '**creator_portal**, returns the creator of current voice channel\'s portal.',
			args: 'none',
			get: (voice_channel, voice_object, portal_object) => {
				return portal_object.creator_id;
			}
		},
		{
			name: 'creator_voice',
			description: 'returns the creator of current voice channel.',
			super_description: '**creator_voice**, returns the creator of current voice channel.',
			args: 'none',
			get: (voice_channel, voice_object, portal_object) => {
				return voice_object.creator_id;
			}
		}
	]
}
