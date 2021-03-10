import { Guild, MessageEmbed, VoiceChannel } from 'discord.js';
import moment from 'moment';
import { create_rich_embed } from '../../libraries/help.library';
import { get_status_list } from '../../libraries/status.library';
import { PortalChannelPrtl } from '../classes/PortalChannelPrtl.class';
import { VoiceChannelPrtl } from '../classes/VoiceChannelPrtl.class';
import { Field, InterfaceBlueprint } from './InterfacesPrtl.interface';


export const variable_prefix: string = '$';
const variables: InterfaceBlueprint[] = [
	{
		name: '##',
		description: 'returns the channel number in list with # in the front',
		super_description: '**##**, returns the channel number in list with # ' +
			'in the front, if it was created first ' +
			'it will display #1, if third #3, etc',
		example: '$##',
		args: 'none',
		get: (
			voice_channel: VoiceChannel | undefined | null, voice_object: VoiceChannelPrtl | undefined | null,
			portal_object_list: PortalChannelPrtl[] | undefined | null, guild_object: any, guild: Guild
		) => {
			if (!voice_object) {
				return 'must be in portal channel';
			}
			if (!portal_object_list) {
				return 'must be in portal channel';
			}

			const portal_object = portal_object_list.find(portal =>
				portal.voice_list.some(voice =>
					voice.id === voice_object.id)
			);

			if (portal_object !== undefined) {
				let i = 0;
				portal_object.voice_list.some(voice => {
					i++;
					return voice.id === voice_object.id;
				});
				return '#' + i;
			}
			return '#-';
		},
		set: null,
		auth: 'none'
	},
	{
		name: '#',
		description: 'returns the channel number in list',
		super_description: '**#**, returns the channel number in list, if it was created first ' +
			'it will display 1, if third 3, etc',
		example: '#',
		args: 'none',
		get: (
			voice_channel: VoiceChannel | undefined | null, voice_object: VoiceChannelPrtl | undefined | null,
			portal_object_list: PortalChannelPrtl[] | undefined | null, guild_object: any, guild: Guild
		) => {
			if (!voice_object) {
				return 'must be in portal channel';
			}
			if (!portal_object_list) {
				return 'must be in portal channel';
			}

			const portal_object = portal_object_list.find(portal =>
				portal.voice_list.some(voice =>
					voice.id === voice_object.id)
			);

			if (portal_object !== undefined) {
				let i = 0;
				portal_object.voice_list.some(voice => {
					i++;
					return voice.id === voice_object.id;
				});
				return '' + i;
			}
			return '-';
		},
		set: null,
		auth: 'none'
	},
	{
		name: 'creator_portal',
		description: 'returns the creator of current voice channel\'s portal',
		super_description: '**creator_portal**, returns the creator of current voice channel\'s portal',
		example: '$creator_portal',
		args: 'none',
		get: (
			voice_channel: VoiceChannel | undefined | null, voice_object: VoiceChannelPrtl | undefined | null,
			portal_object_list: PortalChannelPrtl[] | undefined | null, guild_object: any, guild: Guild
		) => {
			if (!voice_object) {
				return 'must be in portal channel';
			}
			if (!portal_object_list) {
				return 'must be in portal channel';
			}

			const portal_object = portal_object_list.find(portal =>
				portal.voice_list.some(voice =>
					voice.id === voice_object.id)
			);

			if (portal_object !== undefined) {
				return '' + portal_object.creator_id;
			}

			return '?';
		},
		set: null,
		auth: 'none'
	},
	{
		name: 'creator_voice',
		description: 'returns the creator of current voice channel',
		super_description: '**creator_voice**, returns the creator of current voice channel',
		example: '$creator_voice',
		args: 'none',
		get: (
			voice_channel: VoiceChannel | undefined | null, voice_object: VoiceChannelPrtl | undefined | null,
			portal_object_list: PortalChannelPrtl[] | undefined | null, guild_object: any, guild: Guild
		) => {
			if (!voice_object) {
				return 'must be in portal channel';
			}

			return voice_object.creator_id;
		},
		set: null,
		auth: 'none'
	},
	{
		name: 'date',
		description: 'returns the full date: dd/mm/yyyy',
		super_description: '**date**, full date: dd/mm/yyyy',
		example: '$date',
		args: 'none',
		get: (
			voice_channel: VoiceChannel | undefined | null, voice_object: VoiceChannelPrtl | undefined | null,
			portal_object_list: PortalChannelPrtl[] | undefined | null, guild_object: any, guild: Guild
		) => {
			if (!voice_object) {
				return moment()
					.subtract(10, 'days')
					.calendar();
			}

			return moment()
				.subtract(10, 'days')
				.calendar();
		},
		set: null,
		auth: 'none'
	},
	{
		name: 'day_number',
		description: 'returns the day number',
		super_description: '**day_number**, returns the day number',
		example: '$day_number',
		args: 'none',
		get: (
			voice_channel: VoiceChannel | undefined | null, voice_object: VoiceChannelPrtl | undefined | null,
			portal_object_list: PortalChannelPrtl[] | undefined | null, guild_object: any, guild: Guild
		) => {
			if (!voice_object) {
				return moment()
					.date();
			}

			return moment()
				.date();
		},
		set: null,
		auth: 'none'
	},
	{
		name: 'day_name',
		description: 'returns the day name',
		super_description: '**day_name**, returns the day name',
		example: '$day_name',
		args: 'none',
		get: (
			voice_channel: VoiceChannel | undefined | null, voice_object: VoiceChannelPrtl | undefined | null,
			portal_object_list: PortalChannelPrtl[] | undefined | null, guild_object: any, guild: Guild
		) => {
			if (!voice_object) {
				return moment()
					.format('dddd');
			}
			return moment()
				.format('dddd');
		},
		set: null,
		auth: 'none'
	},
	{
		name: 'month_number',
		description: 'returns the month by number',
		super_description: '**month_number**, returns the month by number',
		example: '$month_number',
		args: 'none',
		get: (
			voice_channel: VoiceChannel | undefined | null, voice_object: VoiceChannelPrtl | undefined | null,
			portal_object_list: PortalChannelPrtl[] | undefined | null, guild_object: any, guild: Guild
		) => {
			if (!voice_object) {
				return moment()
					.format('M');
			}
			return moment()
				.format('M');
		},
		set: null,
		auth: 'none'
	},
	{
		name: 'month_name',
		description: 'returns the month by name',
		super_description: '**month_name**, returns the month by name',
		example: '$month_name',
		args: 'none',
		get: (
			voice_channel: VoiceChannel | undefined | null, voice_object: VoiceChannelPrtl | undefined | null,
			portal_object_list: PortalChannelPrtl[] | undefined | null, guild_object: any, guild: Guild
		) => {
			if (!voice_object) {
				return moment()
					.startOf('month')
					.format('MMMM');
			}
			return moment()
				.startOf('month')
				.format('MMMM');
		},
		set: null,
		auth: 'none'
	},
	{
		name: 'year',
		description: 'returns the year',
		super_description: '**year**, returns the year',
		example: '$year',
		args: 'none',
		get: (
			voice_channel: VoiceChannel | undefined | null, voice_object: VoiceChannelPrtl | undefined | null,
			portal_object_list: PortalChannelPrtl[] | undefined | null, guild_object: any, guild: Guild
		) => {
			if (!voice_object) {
				return moment()
					.format('yyyy');
			}
			return moment()
				.format('yyyy');
		},
		set: null,
		auth: 'none'
	},
	{
		name: 'time',
		description: 'full time: hh/mm/ss',
		super_description: '**time**, full time: hh/mm/ss',
		example: '$time',
		args: 'none',
		get: (
			voice_channel: VoiceChannel | undefined | null, voice_object: VoiceChannelPrtl | undefined | null,
			portal_object_list: PortalChannelPrtl[] | undefined | null, guild_object: any, guild: Guild
		) => {
			if (!voice_object) {
				return moment()
					.format('hh:mm:ss');
			}
			return moment()
				.format('hh:mm:ss');
		},
		set: null,
		auth: 'none'
	},
	{
		name: 'hour',
		description: 'returns the hour in current time',
		super_description: '**hour**, returns the hour',
		example: '$hour',
		args: 'none',
		get: (
			voice_channel: VoiceChannel | undefined | null, voice_object: VoiceChannelPrtl | undefined | null,
			portal_object_list: PortalChannelPrtl[] | undefined | null, guild_object: any, guild: Guild
		) => {
			if (!voice_object) {
				return moment()
					.format('hh');
			}
			return moment()
				.format('hh');
		},
		set: null,
		auth: 'none'
	},
	{
		name: 'minute',
		description: 'returns the minute in current time',
		super_description: '**minute**, returns the minute',
		example: '$minute',
		args: 'none',
		get: (
			voice_channel: VoiceChannel | undefined | null, voice_object: VoiceChannelPrtl | undefined | null,
			portal_object_list: PortalChannelPrtl[] | undefined | null, guild_object: any, guild: Guild
		) => {
			if (!voice_object) {
				return moment()
					.format('mm');
			}
			return moment()
				.format('mm');
		},
		set: null,
		auth: 'none'
	},
	{
		name: 'second',
		description: 'returns the second in current time',
		super_description: '**second**, returns the second',
		example: '$second',
		args: 'none',
		get: (
			voice_channel: VoiceChannel | undefined | null, voice_object: VoiceChannelPrtl | undefined | null,
			portal_object_list: PortalChannelPrtl[] | undefined | null, guild_object: any, guild: Guild
		) => {
			if (!voice_object) {
				return moment()
					.format('ss');
			}
			return moment()
				.format('ss');
		},
		set: null,
		auth: 'none'
	},
	{
		name: 'member_active_count',
		description: 'returns number of members with a status',
		super_description: '**member_with_status**, returns the number of members with a status',
		example: '$member_active_count',
		args: 'none',
		get: (
			voice_channel: VoiceChannel | undefined | null, voice_object: VoiceChannelPrtl | undefined | null,
			portal_object_list: PortalChannelPrtl[] | undefined | null, guild_object: any, guild: Guild
		) => {
			if (!voice_channel) return 'must be in voice channel'
			let cnt = 0;
			voice_channel.members.forEach((member) => {
				if (member.presence.activities !== null && !member.user.bot) {
					cnt++;
				}
			});

			return cnt;
		},
		set: null,
		auth: 'none'
	},
	{
		name: 'member_count',
		description: 'returns number of members in channel',
		super_description: '**member_count**, returns the number of members in channel',
		example: '$member_count',
		args: 'none',
		get: (
			voice_channel: VoiceChannel | undefined | null, voice_object: VoiceChannelPrtl | undefined | null,
			portal_object_list: PortalChannelPrtl[] | undefined | null, guild_object: any, guild: Guild
		) => {
			if (!voice_channel) return 'must be in voice channel'
			let cnt = 0;
			voice_channel.members.forEach((member) => {
				if (!member.user.bot) {
					cnt++;
				}
			});

			return cnt;
		},
		set: null,
		auth: 'none'
	},
	{
		name: 'member_history',
		description: 'returns a list of all members that have connected to the channel',
		super_description: '**member_history**, returns a list of all members that have connected to the channel',
		example: '$member_history',
		args: 'none',
		get: (
			voice_channel: VoiceChannel | undefined | null, voice_object: VoiceChannelPrtl | undefined | null,
			portal_object_list: PortalChannelPrtl[] | undefined | null, guild_object: any, guild: Guild
		) => {
			return 'no_yet_implemented';
		},
		set: null,
		auth: 'none'
	},
	{
		name: 'member_list',
		description: 'returns the currently played games',
		super_description: '**member_list**, returns the currentstatuses',
		example: '$member_list',
		args: 'none',
		get: (
			voice_channel: VoiceChannel | undefined | null, voice_object: VoiceChannelPrtl | undefined | null,
			portal_object_list: PortalChannelPrtl[] | undefined | null, guild_object: any, guild: Guild
		) => {
			if (!voice_channel) return 'must be in voice channel'
			const mmbr_lst: string[] = [];
			voice_channel.members.forEach(member => {
				mmbr_lst.push(member.displayName);
			});

			return mmbr_lst;
		},
		set: null,
		auth: 'none'
	},
	{
		name: 'member_with_status',
		description: 'returns number of members with a status',
		super_description: '**member_with_status**, returns the number of members with a status',
		example: '$member_with_status',
		args: 'none',
		get: (
			voice_channel: VoiceChannel | undefined | null, voice_object: VoiceChannelPrtl | undefined | null,
			portal_object_list: PortalChannelPrtl[] | undefined | null, guild_object: any, guild: Guild
		) => {
			if (!voice_channel) return 'must be in voice channel'
			let cnt = 0;
			voice_channel.members.forEach((member) => {
				if (member.presence.activities !== null) {
					cnt++;
				}
			});

			return cnt;
		},
		set: null,
		auth: 'none'
	},
	{
		name: 'status_count',
		description: 'returns the count of current member statuses',
		super_description: '**status_count**, returns the count of current member statuses',
		example: '$status_count',
		args: 'none',
		get: (
			voice_channel: VoiceChannel | undefined | null, voice_object: VoiceChannelPrtl | undefined | null,
			portal_object_list: PortalChannelPrtl[] | undefined | null, guild_object: any, guild: Guild
		) => {
			if (!voice_channel) {
				return 'must be in voice channel';
			}
			if (!voice_object) {
				return 'must be in portal channel';
			}

			const status_list: string[] = get_status_list(voice_channel, voice_object);

			return status_list.length;
		},
		set: null,
		auth: 'none'
	},
	{
		name: 'status_history',
		description: 'returns the history of all the statuses',
		super_description: '**status_history**, returns the history of all the statuses',
		example: '$status_history',
		args: 'none',
		get: (
			voice_channel: VoiceChannel | undefined | null, voice_object: VoiceChannelPrtl | undefined | null,
			portal_object_list: PortalChannelPrtl[] | undefined | null, guild_object: any, guild: Guild
		) => {
			return 'no_yet_implemented';
		},
		set: null,
		auth: 'none'
	},
	{
		name: 'status_list',
		description: 'returns the list of current member statuses',
		super_description: '**status_list**, returns the list of all current members statuses',
		example: '$status_list',
		args: 'none',
		get: (
			voice_channel: VoiceChannel | undefined | null, voice_object: VoiceChannelPrtl | undefined | null,
			portal_object_list: PortalChannelPrtl[] | undefined | null, guild_object: any, guild: Guild
		) => {
			if (!voice_channel) {
				return 'must be in voice channel';
			}
			if (!voice_object) {
				return 'must be in portal channel';
			}

			return get_status_list(voice_channel, voice_object);
		},
		set: null,
		auth: 'none'
	},
	// {
	// 	name: 'last_update',
	// 	description: 'is the last time the channel name was updated',
	// 	super_description: '**last_update**, is the last time the channel name was updated',
	// 	example: '$last_update',
	// 	args: 'none',
	// 	get: (
	// voice_channel: VoiceChannel | undefined | null, voice_object: VoiceChannelPrtl | undefined | null,
	// portal_object_list: PortalChannelPrtl[] | undefined | null, guild_object: any, guild: Guild
	// 	) => {
	//      if (!voice_object) return 'must be in portal channel'
	// 		return `${Math.round(((Date.now() - voice_object.last_update) / 1000 / 60))}m` +
	// 			`${Math.round(((Date.now() - voice_object.last_update) / 1000) % 60)}s`;
	// 	},
	// 	set: null,
	// 	auth: 'none'
	// }
];

export function is_variable(candidate: string): string {
	for (let i = 0; i < variables.length; i++) {
		if (String(candidate).substring(1, (String(variables[i].name).length + 1)) == variables[i].name) {
			return variables[i].name;
		}
	}
	return '';
};

export function get_variable_guide(): MessageEmbed {
	const strc_array: Field[] = [
		{
			emote: 'Used in Regex Interpreter',
			role: '*used by channel name (regex, regex_voice, regex_portal) and run command*',
			inline: true
		},
		{
			emote: 'variables are immutable and live data',
			role: '*data coresponds to server, portal or voice channel live data*',
			inline: true
		},
		{
			emote: '1. Go to any channel',
			role: '*you can run commands ./run OR ./set in any channel and Portal will see them*',
			inline: false
		},
		{
			emote: '2-1. `./run year is: $year`',
			role: '*run command, processes given text and returns processed text (note it is JSON format)*',
			inline: false
		},
		{
			emote: '2-2. Wait for portal response which will be `year is: 2021` (as it currently is 2021)',
			role: '*it will reply with your string until it edits it with processed info*',
			inline: false
		},
		{
			emote: '3-1. `./set regex_voice year is: $year` (note that when setting you do not need prefix &)',
			role: '*set command, updates the data of an attribute in this case **regex_voice** to ***year is: $year***',
			inline: false
		},
		{
			emote: '3-2. Wait for portal response which will be inform you if it was executed without issues',
			role: '*portal will either confirm update or inform you of the error it faced*',
			inline: false
		}
	];

	return create_rich_embed(
		'Variable Guide',
		'go to https://portal-bot.xyz/docs/regex/interpreter/variables\n\n' +
		'how to use variables with regex interpreter',
		'#EEB902',
		strc_array,
		null,
		null,
		null,
		null,
		null
	);
}

export function get_variable_help(): MessageEmbed[] {
	const vrbl_array: Field[][] = [];

	for (let l = 0; l <= variables.length / 24; l++) {
		vrbl_array[l] = []
		for (let i = (24 * l); i < variables.length && i < 24 * (l + 1); i++) {
			vrbl_array[l].push({
				emote: `${i + 1}. ${variables[i].name}`,
				role: '**desc**: *' + variables[i].description + '*' +
					'\n**args**: *' + variables[i].args + '*',
				inline: true
			});
		}
	}

	return vrbl_array.map((cmmd, index) => {
		if (index === 0) {
			return create_rich_embed(
				'Variables',
				'go to https://portal-bot.xyz/docs/regex/interpreter/variables\n\n' +
				'Prefix: ' + variable_prefix + '\n' +
				'Immutable and live data that return information\n' +
				'about your current voice channel' +
				'argument preceded by **!** is *mandatory*, **@** is *optional*\n',
				'#1BE7FF', vrbl_array[0], null, null, null, null, null
			)
		} else {
			return create_rich_embed(
				null, null, '#1BE7FF', vrbl_array[index], null, null, null, null, null
			)
		}
	});
};

export function get_variable_help_super(candidate: string): MessageEmbed | boolean {
	for (let i = 0; i < variables.length; i++) {
		const vrbl = variables[i];
		if (vrbl.name === candidate) {
			return create_rich_embed(
				vrbl.name,
				'Type: Variable' +
				'\nPrefix: ' + variable_prefix + '\n' +
				'argument preceded by **!** is *mandatory*, **@** is *optional*\n',
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

export function get_variable(
	voice_channel: VoiceChannel | undefined | null, voice_object: VoiceChannelPrtl | undefined | null,
	portal_object_list: PortalChannelPrtl[] | undefined | null, guild_object: any, guild: Guild, vrbl: string
): any {
	for (let l = 0; l < variables.length; l++) {
		if (vrbl === variables[l].name) {
			return variables[l].get(
				voice_channel, voice_object, portal_object_list, guild_object, guild
			);
		}
	}
	return -1;
};
