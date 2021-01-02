import moment from 'moment';

import { get_status_list } from '../libraries/statusOps';
import { create_rich_embed } from '../libraries/helpOps';
import { ObjectFunction } from './TypePortal';
import { Guild, GuildMember, MessageEmbed, VoiceChannel } from 'discord.js';

export const variable_prefix: string = '$';
const variables: ObjectFunction[] = [
	{
		name: '#',
		description: 'returns the channel number in list.',
		super_description: '**#**, returns the channel number in list, if it was created first .' +
			'it will display 1, if third 3, etc.',
		example: '$#',
		args: 'none',
		get: (voice_channel: VoiceChannel, voice_object: any, portal_list_object: any) => {
			let i = 0;
			for (const portal_key in portal_list_object) {
				if (portal_list_object[portal_key].voice_list[voice_channel.id]) {
					for (const voice_key in portal_list_object[portal_key].voice_list) {
						console.log('voice_key :>> ', voice_key);
						i++;
						if (voice_key === voice_channel.id) return i.toString();
					}
				}
			}
			return '0';
		},
		set: null,
		auth: 'none'
	},
	{
		name: '##',
		description: 'returns the channel number in list with # in the front.',
		super_description: '**##**, returns the channel number in list with # ' +
			'in the front, if it was created first ' +
			'it will display #1, if third #3, etc.',
		example: '$##',
		args: 'none',
		get: (voice_channel: VoiceChannel, voice_object: any, portal_list_object: any) => {
			let i = 0;
			for (const portal_key in portal_list_object) {
				if (portal_list_object[portal_key].voice_list[voice_channel.id]) {
					for (const voice_key in portal_list_object[portal_key].voice_list) {
						i++;
						if (voice_key === voice_channel.id) return '#' + i.toString();
					}
				}
			}
			return '#0';
		},
		set: null,
		auth: 'none'
	},
	{
		name: 'creator_portal',
		description: 'returns the creator of current voice channel\'s portal.',
		super_description: '**creator_portal**, returns the creator of current voice channel\'s portal.',
		example: '$creator_portal',
		args: 'none',
		get: (voice_channel: VoiceChannel, voice_object: any, portal_list_object: any, guild_object: any, guild: Guild) => {
			if (!portal_list_object) {
				return;
			}
			for (const portal_key in portal_list_object) {
				if (portal_list_object[portal_key].voice_list[voice_channel.id]) {
					const member: GuildMember | undefined = guild.members.cache.find(member_current =>
						member_current.id === portal_list_object[portal_key].creator_id);
					return member !== undefined ? member.displayName : 'portal creator left';
				}
			}
		},
		set: null,
		auth: 'none'
	},
	{
		name: 'creator_voice',
		description: 'returns the creator of current voice channel.',
		super_description: '**creator_voice**, returns the creator of current voice channel.',
		example: '$creator_voice',
		args: 'none',
		get: (voice_channel: VoiceChannel, voice_object: any, portal_list_object: any, guild_object: any, guild: Guild) => {
			const member: GuildMember | undefined = guild.members.cache.find(member_current =>
				member_current.id === voice_object.creator_id);
			return member !== undefined ? member.displayName : 'voice creator left';
		},
		set: null,
		auth: 'none'
	},
	{
		name: 'date',
		description: 'returns the full date: dd/mm/yyyy.',
		super_description: '**date**, full date: dd/mm/yyyy.',
		example: '$date',
		args: 'none',
		get: (voice_channel: VoiceChannel, voice_object: any) => {
			return moment().locale(voice_object.locale).subtract(10, 'days').calendar();
		},
		set: null,
		auth: 'none'
	},
	{
		name: 'day_number',
		description: 'returns the day number.',
		super_description: '**day_number**, returns the day number.',
		example: '$day_number',
		args: 'none',
		get: (voice_channel: VoiceChannel, voice_object: any) => {
			return moment().locale(voice_object.locale).date();
		},
		set: null,
		auth: 'none'
	},
	{
		name: 'day_name',
		description: 'returns the day name.',
		super_description: '**day_name**, returns the day name.',
		example: '$day_name',
		args: 'none',
		get: (voice_channel: VoiceChannel, voice_object: any) => {
			return moment().locale(voice_object.locale).format('dddd');
		},
		set: null,
		auth: 'none'
	},
	{
		name: 'month_number',
		description: 'returns the month by number.',
		super_description: '**month_number**, returns the month by number.',
		example: '$month_number',
		args: 'none',
		get: (voice_channel: VoiceChannel, voice_object: any) => {
			return moment().locale(voice_object.locale).format('M');
		},
		set: null,
		auth: 'none'
	},
	{
		name: 'month_name',
		description: 'returns the month by name.',
		super_description: '**month_name**, returns the month by name.',
		example: '$month_name',
		args: 'none',
		get: (voice_channel: VoiceChannel, voice_object: any) => {
			return moment().locale(voice_object.locale)
				.startOf('month').format('MMMM');
		},
		set: null,
		auth: 'none'
	},
	{
		name: 'year',
		description: 'returns the year.',
		super_description: '**year**, returns the year.',
		example: '$year',
		args: 'none',
		get: (voice_channel: VoiceChannel, voice_object: any) => {
			return moment().locale(voice_object.locale).format('yyyy');
		},
		set: null,
		auth: 'none'
	},
	{
		name: 'time',
		description: 'full time: hh/mm/ss.',
		super_description: '**time**, full time: hh/mm/ss.',
		example: '$time',
		args: 'none',
		get: (voice_channel: VoiceChannel, voice_object: any) => {
			return moment().locale(voice_object.locale).format('h:mm:ss');
		},
		set: null,
		auth: 'none'
	},
	{
		name: 'hour',
		description: 'returns the hour in current time.',
		super_description: '**hour**, returns the hour.',
		example: '$hour',
		args: 'none',
		get: (voice_channel: VoiceChannel, voice_object: any) => {
			return moment().locale(voice_object.locale).format('h');
		},
		set: null,
		auth: 'none'
	},
	{
		name: 'minute',
		description: 'returns the minute in current time.',
		super_description: '**minute**, returns the minute.',
		example: '$minute',
		args: 'none',
		get: (voice_channel: VoiceChannel, voice_object: any) => {
			return moment().locale(voice_object.locale).format('mm');
		},
		set: null,
		auth: 'none'
	},
	{
		name: 'second',
		description: 'returns the second in current time.',
		super_description: '**second**, returns the second.',
		example: '$second',
		args: 'none',
		get: (voice_channel: VoiceChannel, voice_object: any) => {
			return moment().locale(voice_object.locale).format('ss');
		},
		set: null,
		auth: 'none'
	},
	{
		name: 'member_active_count',
		description: 'returns number of members with a status.',
		super_description: '**member_with_status**, returns the number of members with a status.',
		example: '$member_active_count',
		args: 'none',
		get: (voice_channel: VoiceChannel) => {
			let cnt = 0;
			voice_channel.members.forEach((member) => {
				if (member.presence.activities !== null && !member.user.bot) { cnt++; }
			});
			return cnt;
		},
		set: null,
		auth: 'none'
	},
	{
		name: 'member_count',
		description: 'returns number of members in channel.',
		super_description: '**member_count**, returns the number of members in channel.',
		example: '$member_count',
		args: 'none',
		get: (voice_channel: VoiceChannel) => {
			let cnt = 0;
			voice_channel.members.forEach((member) => {
				if (!member.user.bot) { cnt++; }
			});
			return cnt;
		},
		set: null,
		auth: 'none'
	},
	{
		name: 'member_history',
		description: 'returns a list of all members that have connected to the channel.',
		super_description: '**member_history**, returns a list of all members that have connected to the channel.',
		example: '$member_history',
		args: 'none',
		get: () => {
			return 'no_yet_implemented';
		},
		set: null,
		auth: 'none'
	},
	{
		name: 'member_list',
		description: 'returns the currently played games.',
		super_description: '**member_list**, returns the currentstatuses.',
		example: '$member_list',
		args: 'none',
		get: (voice_channel: VoiceChannel) => {
			const mmbr_lst: string[] = [];
			voice_channel.members.forEach(member => { mmbr_lst.push(member.displayName); });
			return mmbr_lst;
		},
		set: null,
		auth: 'none'
	},
	{
		name: 'member_with_status',
		description: 'returns number of members with a status.',
		super_description: '**member_with_status**, returns the number of members with a status.',
		example: '$member_with_status',
		args: 'none',
		get: (voice_channel: VoiceChannel) => {
			let cnt = 0;
			voice_channel.members.forEach((member) => {
				if (member.presence.activities !== null) { cnt++; }
			});
			return cnt;
		},
		set: null,
		auth: 'none'
	},
	{
		name: 'status_count',
		description: 'returns the count of current member statuses.',
		super_description: '**status_count**, returns the count of current member statuses.',
		example: '$status_count',
		args: 'none',
		get: (voice_channel: VoiceChannel, voice_object: any) => {
			const status_list: string[] = get_status_list(voice_channel, voice_object);
			return status_list.length;
		},
		set: null,
		auth: 'none'
	},
	{
		name: 'status_history',
		description: 'returns the history of all the statuses.',
		super_description: '**status_history**, returns the history of all the statuses.',
		example: '$status_history',
		args: 'none',
		get: () => {
			return 'no_yet_implemented';
		},
		set: null,
		auth: 'none'
	},
	{
		name: 'status_list',
		description: 'returns the list of current member statuses.',
		super_description: '**status_list**, returns the list of all current members statuses.',
		example: '$status_list',
		args: 'none',
		get: (voice_channel: VoiceChannel, voice_object: any) => {
			return get_status_list(voice_channel, voice_object);
		},
		set: null,
		auth: 'none'
	},
	{
		name: 'last_update',
		description: 'is the last time the channel name was updated',
		super_description: '**last_update**, is the last time the channel name was updated',
		example: '$last_update',
		args: 'none',
		get: (voice_channel: VoiceChannel, voice_object: any) => {
			return `${Math.round(((Date.now() - voice_object.last_update) / 1000 / 60))}m` +
				`${Math.round(((Date.now() - voice_object.last_update) / 1000) % 60)}s`;
		},
		set: null,
		auth: 'none'
	}
];

export function is_variable(candidate: string): string {
	for (let i = 0; i < variables.length; i++) {
		if (String(candidate).substring(1, (String(variables[i].name).length + 1)) == variables[i].name) {
			return variables[i].name;
		}
	}
	return '';
};

export function get_variable_help(): MessageEmbed {
	const vrbl_array = [];
	for (let i = 0; i < variables.length; i++) {
		vrbl_array.push({
			emote: variables[i].name,
			role: '**desc**: *' + variables[i].description + '*' +
				'\n**args**: *' + variables[i].args + '*',
			inline: true,
		});
	}
	return create_rich_embed('Variables',
		'Prefix: ' + variable_prefix + '\nEditable variables of Portal channel.' +
		'\n**!**: *mandatory*, **@**: *optional*',
		'#1BE7FF', vrbl_array,
		null,
		null,
		null,
		null,
		null);
};

export function get_variable_help_super(candidate: string): MessageEmbed | boolean {
	for (let i = 0; i < variables.length; i++) {
		const vrbl = variables[i];
		if (vrbl.name === candidate) {
			return create_rich_embed(
				vrbl.name,
				'Type: Variable' +
				'\nPrefix: ' + variable_prefix +
				'\n**!**: *mandatory*, **@**: *optional*',
				'#1BE7FF',
				[
					{ emote: 'Description', role: '*' + vrbl.super_description + '*', inline: false },
					{ emote: 'Arguments', role: '*' + vrbl.args + '*', inline: false },
					{ emote: 'Example', role: '```' + vrbl.example + '```', inline: false }
				],
				null,
				null,
				null,
				null,
				null);
		}
	}
	return false;
};

export function get_variable(voice_channel: VoiceChannel, voice_object: any,
	portal_list_object: any, guild_object: any, guild: Guild, vrbl: string): any {
	for (let l = 0; l < variables.length; l++) {
		if (vrbl === variables[l].name) {
			return variables[l].get(voice_channel, voice_object, portal_list_object, guild_object, guild);
		}
	}
	return -1;
};
