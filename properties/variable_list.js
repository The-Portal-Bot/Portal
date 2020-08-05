const moment = require('moment');

const rtrv = require('../functions/status_manager');
const help_mngr = require('../functions/help_manager');

module.exports =
{
	is_variable: function (arg) {
		for (let i = 0; i < this.variables.length; i++)
			if (String(arg).substring(1, (String(this.variables[i].name).length + 1)) == this.variables[i].name)
				return this.variables[i].name;
		return false;
	},
	get_help: function () {
		let vrbl_array = [];
		for (let i = 0; i < this.variables.length; i++) {
			vrbl_array.push({
				emote: this.variables[i].name,
				role: '**desc**: *' + this.variables[i].description + '*' +
					'\n**args**: *' + this.variables[i].args + '*',
				inline: true
			});
		}
		return help_mngr.create_rich_embed('Variables',
			'Prefix: ' + this.prefix + '\nCommands to access portal bot.' +
			'\n**!**: *mandatory*, **@**: *optional*',
			'#1BE7FF', vrbl_array);
	},
	get_help_super: function (check) {
		for (let i = 0; i < this.variables.length; i++) {
			let vrbl = this.variables[i];
			if (vrbl.name === check) {
				return help_mngr.create_rich_embed(
					vrbl.name,
					'Type: Variable' +
					'\nPrefix: ' + this.prefix +
					'\n**!**: *mandatory*, **@**: *optional*',
					'#1BE7FF',
					[
						{ emote: 'Description', role: '*' + vrbl.super_description + '*', inline: false },
						{ emote: 'Arguments', role: '*' + vrbl.args + '*', inline: false },
						{ emote: 'Example', role: '```' + vrbl.example + '```', inline: false }
					]
				);
			}
		}
		return false;
	},
	get: function (voice_channel, voice_object, portal_object, vrbl) {
		for (let l = 0; l < this.variables.length; l++) {
			if (vrbl === this.variables[l].name) {
				return this.variables[l].get(voice_channel, voice_object, portal_object);
			}
		}
		return -1;
	},

	prefix: '$',
	variables: [
		{
			name: '#',
			description: 'returns the channel number in list.',
			super_description: '**#**, returns the channel number in list, if it was created first .'+
			'it will display 1, if third 3, etc.',
			example: '$#',
			args: 'none',
			get: (voice_channel, voice_object, portal_object) => {
				let i = 0;
				for(let portal_key in portal_object) {
					if (portal_object[portal_key].voice_list[voice_channel.id]) {
						for (let voice_key in portal_object[portal_key].voice_list) {
							i++;
							if (voice_key === voice_channel.id) return i.toString();
						}
					}
				}
				return '0';
			}
		},
		{
			name: '##',
			description: 'returns the channel number in list with # in the front.',
			super_description: '**##**, returns the channel number in list with # in the front, if it was created first ' +
				'it will display #1, if third #3, etc.',
			example: '$##',
			args: 'none',
			get: (voice_channel, voice_object, portal_object) => {
				let i = 0;
				for(let portal_key in portal_object) {
					if (portal_object[portal_key].voice_list[voice_channel.id]) {
						for (let voice_key in portal_object[portal_key].voice_list) {
							i++;
							if (voice_key === voice_channel.id) return '#' + i.toString();
						}
					}
				}
				return '#0';
			}
		},
		{
			name: 'creator_portal',
			description: 'returns the creator of current voice channel\'s portal.',
			super_description: '**creator_portal**, returns the creator of current voice channel\'s portal.',
			example: '$creator_portal',
			args: 'none',
			get: (voice_channel, voice_object, portal_object) => {
				return portal_object.creator_id;
			}
		},
		{
			name: 'creator_voice',
			description: 'returns the creator of current voice channel.',
			super_description: '**creator_voice**, returns the creator of current voice channel.',
			example: '$creator_voice',
			args: 'none',
			get: (voice_channel, voice_object) => {
				return voice_object.creator_id;
			}
		},
		{
			name: 'date',
			description: 'returns the full date: dd/mm/yyyy.',
			super_description: '**date**, full date: dd/mm/yyyy.',
			example: '$date',
			args: 'none',
			get: (voice_channel, voice_object) => {
				return moment().locale(voice_object.locale).subtract(10, 'days').calendar();
			}
		},
		{
			name: 'number_day',
			description: 'returns the day number.',
			super_description: '**number_day**, returns the day number.',
			example: '$number_day',
			args: 'none',
			get: (voice_channel, voice_object) => {
				return moment().locale(voice_object.locale).date();
			}
		},
		{
			name: 'name_day',
			description: 'returns the day name.',
			super_description: '**name_day**, returns the day name.',
			example: '$name_day',
			args: 'none',
			get: (voice_channel, voice_object) => {
				return moment().locale(voice_object.locale).format('dddd');
			}
		},
		{
			name: 'month',
			description: 'returns the month.',
			super_description: '**month**, returns the month.',
			example: '$month',
			args: 'none',
			get: (voice_channel, voice_object) => {
				return moment().locale(voice_object.locale).format('mmmm');
			}
		},
		{
			name: 'year',
			description: 'returns the year.',
			super_description: '**year**, returns the year.',
			example: '$year',
			args: 'none',
			get: (voice_channel, voice_object) => {
				return moment().locale(voice_object.locale).format('yyyy');
			}
		},
		{
			name: 'time',
			description: 'full time: hh/mm/ss.',
			super_description: '**time**, full time: hh/mm/ss.',
			example: '$time',
			args: 'none',
			get: (voice_channel, voice_object) => {
				return moment().locale(voice_object.locale).format('h:mm:ss');
			}
		},
		{
			name: 'hour',
			description: 'returns the hour in current time.',
			super_description: '**hour**, returns the hour.',
			example: '$hour',
			args: 'none',
			get: (voice_channel, voice_object) => {
				return moment().locale(voice_object.locale).format('h');
			}
		},
		{
			name: 'minute',
			description: 'returns the minute in current time.',
			super_description: '**minute**, returns the minute.',
			example: '$minute',
			args: 'none',
			get: (voice_channel, voice_object) => {
				return moment().locale(voice_object.locale).format('mm');
			}
		},
		{
			name: 'second',
			description: 'returns the second in current time.',
			super_description: '**second**, returns the second.',
			example: '$second',
			args: 'none',
			get: (voice_channel, voice_object) => {
				return moment().locale(voice_object.locale).format('ss');
			}
		},
		{
			name: 'member_active_count',
			description: 'returns number of members with a status.',
			super_description: '**member_with_status**, returns the number of members with a status.',
			example: '$member_active_count',
			args: 'none',
			get: (voice_channel) => {
				let cnt = 0;
				voice_channel.members.forEach((member) => {
					if (member.presence.game !== null)
						cnt++;
				});
				return cnt;
			}
		},
		{
			name: 'member_count',
			description: 'returns number of members in channel.',
			super_description: '**member_count**, returns the number of members in channel.',
			example: '$member_count',
			args: 'none',
			get: (voice_channel) => {
				return voice_channel.members.size;
			}
		},
		{
			name: 'member_history',
			description: 'returns a list of all members that have connected to the channel.',
			super_description: '**member_history**, returns a list of all members that have connected to the channel.',
			example: '$member_history',
			args: 'none',
			get: () => {
				return 'no_yet_implemented';
			}
		},
		{
			name: 'member_list',
			description: 'returns the currently played games.',
			super_description: '**member_list**, returns the currentstatuses.',
			example: '$member_list',
			args: 'none',
			get: (voice_channel) => {
				let mmbr_lst = [];
				voice_channel.members.forEach(member => { mmbr_lst.push(member.displayName); });
				return mmbr_lst;
			}
		},
		{
			name: 'member_with_status',
			description: 'returns number of members with a status.',
			super_description: '**member_with_status**, returns the number of members with a status.',
			example: '$member_with_status',
			args: 'none',
			get: (voice_channel) => {
				let cnt = 0;
				voice_channel.members.forEach((member) => {
					if (member.presence.game !== null)
						cnt++;
				});
				return cnt;
			}
		},
		{
			name: 'status_count',
			description: 'returns the count of current member statuses.',
			super_description: '**status_count**, returns the count of current member statuses.',
			example: '$status_count',
			args: 'none',
			get: (voice_channel, voice_object) => {
				let status_list = rtrv.get_status_list(voice_channel, voice_object);
				if (typeof status_list === 'object' && status_list !== null) { return 0; }
				else { status_list.length; }
			}
		},
		{
			name: 'status_history',
			description: 'returns the history of all the statuses.',
			super_description: '**status_history**, returns the history of all the statuses.',
			example: '$status_history',
			args: 'none',
			get: () => {
				return 'no_yet_implemented';
			}
		},
		{
			name: 'status_list',
			description: 'returns the list of current member statuses.',
			super_description: '**status_list**, returns the list of all current members statuses.',
			example: '$status_list',
			args: 'none',
			get: (voice_channel, voice_object) => { 
				return rtrv.get_status_list(voice_channel, voice_object);
			}
		},
		{
			name: 'last_update',
			description: 'is the last time the channel name was updated',
			super_description: '**last_update**, is the last time the channel name was updated',
			example: '$last_update',
			args: 'none',
			get: (voice_channel, voice_object) => {
				return `${Math.round(((Date.now() - voice_object.last_update) / 1000 / 60))}m` +
					`${Math.round(((Date.now() - voice_object.last_update) / 1000) % 60)}s`;
			}
		}
	]
};

