import { Guild, EmbedBuilder, VoiceChannel } from 'discord.js';
import moment from 'moment';
import { AuthEnum } from '../../data/enums/Admin.enum';
import { createEmbed } from '../../libraries/help.library';
import { get_status_list } from '../../libraries/status.library';
import { PGuild } from '../classes/PGuild.class';
import { PChannel } from '../classes/PPortalChannel.class';
import { Field, InterfaceBlueprint } from '../classes/PTypes.interface';
import { PVoiceChannel } from '../classes/PVoiceChannel.class';

const PORTAL_URL = 'https://portal-bot.xyz/docs';
const INTERPRETER_URL = '/interpreter/objects';
export const variable_prefix = '$';

const variables: InterfaceBlueprint[] = [
	{
		name: '##',
		hover: 'number of voice channel with #',
		get: (
			voice_channel: VoiceChannel | undefined | null, voice_object: PVoiceChannel | undefined | null,
			portal_object_list: PChannel[] | undefined | null // , guild_object: any, guild: Guild
		) => {
			if (!voice_object) {
				return 'N/A';
			}
			if (!portal_object_list) {
				return 'N/A';
			}

			const portal_object = portal_object_list.find(portal =>
				portal.voiceList.some(voice =>
					voice.id === voice_object.id)
			);

			if (portal_object !== undefined) {
				let i = 0;
				portal_object.voiceList.some(voice => {
					i++;
					return voice.id === voice_object.id;
				});
				return `#${i}`;
			}
			return '#-';
		},
		set: null,
		auth: AuthEnum.none
	},
	{
		name: '#',
		hover: 'number of voice channel',
		get: (
			voice_channel: VoiceChannel | undefined | null, voice_object: PVoiceChannel | undefined | null,
			portal_object_list: PChannel[] | undefined | null // , guild_object: any, guild: Guild
		) => {
			if (!voice_object) {
				return 'N/A';
			}
			if (!portal_object_list) {
				return 'N/A';
			}

			const portal_object = portal_object_list.find(portal =>
				portal.voiceList.some(voice =>
					voice.id === voice_object.id)
			);

			if (portal_object !== undefined) {
				let i = 0;
				portal_object.voiceList.some(voice => {
					i++;
					return voice.id === voice_object.id;
				});
				return `${i}`;
			}
			return '-';
		},
		set: null,
		auth: AuthEnum.none
	},
	{
		name: 'creator_portal',
		hover: 'creator of portal channel',
		get: (
			voice_channel: VoiceChannel | undefined | null, voice_object: PVoiceChannel | undefined | null,
			portal_object_list: PChannel[] | undefined | null // , guild_object: any, guild: Guild
		) => {
			if (!voice_object) {
				return 'N/A';
			}
			if (!portal_object_list) {
				return 'N/A';
			}

			const portal_object = portal_object_list.find(portal =>
				portal.voiceList.some(voice =>
					voice.id === voice_object.id)
			);

			if (portal_object !== undefined) {
				return '' + portal_object.creatorId;
			}

			return '?';
		},
		set: null,
		auth: AuthEnum.none
	},
	{
		name: 'creator_voice',
		hover: 'creator of voice channel',
		get: (
			voice_channel: VoiceChannel | undefined | null, voice_object: PVoiceChannel | undefined | null,
			// portal_object_list: PChannel[] | undefined | null, guild_object: any, guild: Guild
		) => {
			if (!voice_object) {
				return 'N/A';
			}

			return voice_object.creator_id;
		},
		set: null,
		auth: AuthEnum.none
	},
	{
		name: 'date',
		hover: 'current date',
		get: (
			voice_channel: VoiceChannel | undefined | null, voice_object: PVoiceChannel | undefined | null,
			// portal_object_list: PChannel[] | undefined | null, guild_object: any, guild: Guild
		) => {
			if (!voice_object) {
				return moment().subtract(10, 'days').calendar();
			}

			return moment().subtract(10, 'days').calendar();
		},
		set: null,
		auth: AuthEnum.none
	},
	{
		name: 'day_number',
		hover: 'current day in number format',
		get: (
			voice_channel: VoiceChannel | undefined | null, voice_object: PVoiceChannel | undefined | null,
			// portal_object_list: PChannel[] | undefined | null, guild_object: any, guild: Guild
		) => {
			if (!voice_object) {
				return moment().date();
			}

			return moment().date();
		},
		set: null,
		auth: AuthEnum.none
	},
	{
		name: 'day_name',
		hover: 'current day in text format',
		get: (
			voice_channel: VoiceChannel | undefined | null, voice_object: PVoiceChannel | undefined | null,
			// portal_object_list: PChannel[] | undefined | null, guild_object: any, guild: Guild
		) => {
			if (!voice_object) {
				return moment().format('dddd');
			}
			return moment().format('dddd');
		},
		set: null,
		auth: AuthEnum.none
	},
	{
		name: 'month_number',
		hover: 'current month in number format',
		get: (
			voice_channel: VoiceChannel | undefined | null, voice_object: PVoiceChannel | undefined | null,
			// portal_object_list: PChannel[] | undefined | null, guild_object: any, guild: Guild
		) => {
			if (!voice_object) {
				return moment().format('M');
			}
			return moment().format('M');
		},
		set: null,
		auth: AuthEnum.none
	},
	{
		name: 'month_name',
		hover: 'current month in text format',
		get: (
			voice_channel: VoiceChannel | undefined | null, voice_object: PVoiceChannel | undefined | null,
			// portal_object_list: PChannel[] | undefined | null, guild_object: any, guild: Guild
		) => {
			if (!voice_object) {
				return moment().startOf('month').format('MMMM');
			}
			return moment().startOf('month')
				.format('MMMM');
		},
		set: null,
		auth: AuthEnum.none
	},
	{
		name: 'year',
		hover: 'current year',
		get: (
			voice_channel: VoiceChannel | undefined | null, voice_object: PVoiceChannel | undefined | null,
			// portal_object_list: PChannel[] | undefined | null, guild_object: any, guild: Guild
		) => {
			if (!voice_object) {
				return moment().format('yyyy');
			}
			return moment().format('yyyy');
		},
		set: null,
		auth: AuthEnum.none
	},
	{
		name: 'time',
		hover: 'current time',
		get: (
			voice_channel: VoiceChannel | undefined | null, voice_object: PVoiceChannel | undefined | null,
			// portal_object_list: PChannel[] | undefined | null, guild_object: any, guild: Guild
		) => {
			if (!voice_object) {
				return moment().format('hh:mm:ss');
			}
			return moment().format('hh:mm:ss');
		},
		set: null,
		auth: AuthEnum.none
	},
	{
		name: 'hour',
		hover: 'current hour',
		get: (
			voice_channel: VoiceChannel | undefined | null, voice_object: PVoiceChannel | undefined | null,
			// portal_object_list: PChannel[] | undefined | null, guild_object: any, guild: Guild
		) => {
			if (!voice_object) {
				return moment().format('hh');
			}
			return moment().format('hh');
		},
		set: null,
		auth: AuthEnum.none
	},
	{
		name: 'minute',
		hover: 'current minute',
		get: (
			voice_channel: VoiceChannel | undefined | null, voice_object: PVoiceChannel | undefined | null,
			// portal_object_list: PChannel[] | undefined | null, guild_object: any, guild: Guild
		) => {
			if (!voice_object) {
				return moment().format('mm');
			}
			return moment().format('mm');
		},
		set: null,
		auth: AuthEnum.none
	},
	{
		name: 'second',
		hover: 'current second',
		get: (
			voice_channel: VoiceChannel | undefined | null, voice_object: PVoiceChannel | undefined | null,
			// portal_object_list: PChannel[] | undefined | null, guild_object: any, guild: Guild
		) => {
			if (!voice_object) {
				return moment().format('ss');
			}
			return moment().format('ss');
		},
		set: null,
		auth: AuthEnum.none
	},
	{
		name: 'member_active_count',
		hover: 'number of members with status',
		get: (
			voice_channel: VoiceChannel | undefined | null // , voice_object: PVoiceChannel | undefined | null,
			// portal_object_list: PChannel[] | undefined | null, guild_object: any, guild: Guild
		) => {
			if (!voice_channel) return 'N/A'
			let cnt = 0;
			voice_channel.members.forEach((member) => {
				if (member.presence?.activities !== null && !member.user.bot) {
					cnt++;
				}
			});

			return cnt;
		},
		set: null,
		auth: AuthEnum.none
	},
	{
		name: 'member_count',
		hover: 'number of members in channel',
		get: (
			voice_channel: VoiceChannel | undefined | null // , voice_object: PVoiceChannel | undefined | null,
			// portal_object_list: PChannel[] | undefined | null, guild_object: any, guild: Guild
		) => {
			if (!voice_channel) return 'N/A'
			let cnt = 0;
			voice_channel.members.forEach((member) => {
				if (!member.user.bot) {
					cnt++;
				}
			});

			return cnt;
		},
		set: null,
		auth: AuthEnum.none
	},
	{
		name: 'member_history',
		hover: 'all members to ever pass through channel',
		get: (
			// voice_channel: VoiceChannel | undefined | null, voice_object: PVoiceChannel | undefined | null,
			// portal_object_list: PChannel[] | undefined | null, guild_object: any, guild: Guild
		) => {
			return 'no_yet_implemented';
		},
		set: null,
		auth: AuthEnum.none
	},
	{
		name: 'member_list',
		hover: 'current members names',
		get: (
			voice_channel: VoiceChannel | undefined | null // , voice_object: PVoiceChannel | undefined | null,
			// portal_object_list: PChannel[] | undefined | null, guild_object: any, guild: Guild
		) => {
			if (!voice_channel) return 'N/A'
			const memberList: string[] = [];
			voice_channel.members.forEach(member => {
				memberList.push(member.displayName);
			});

			return memberList;
		},
		set: null,
		auth: AuthEnum.none
	},
	{
		name: 'member_with_status',
		hover: 'names of members with statuses',
		get: (
			voice_channel: VoiceChannel | undefined | null// , voice_object: PVoiceChannel | undefined | null,
			// portal_object_list: PChannel[] | undefined | null, guild_object: any, guild: Guild
		) => {
			if (!voice_channel) return 'N/A'
			const memberList: string[] = [];
			voice_channel.members.forEach(member => {
				if (member.presence?.activities !== null) {
					memberList.push(member.displayName);
				}
			});

			return memberList;
		},
		set: null,
		auth: AuthEnum.none
	},
	{
		name: 'status_count',
		hover: 'number of unique statuses',
		get: (
			voice_channel: VoiceChannel | undefined | null, voice_object: PVoiceChannel | undefined | null,
			// portal_object_list: PChannel[] | undefined | null, guild_object: any, guild: Guild
		) => {
			if (!voice_channel) {
				return 'N/A';
			}
			if (!voice_object) {
				return 'N/A';
			}

			// can be faster
			const status_list: string[] = get_status_list(voice_channel, voice_object);

			return status_list.length;
		},
		set: null,
		auth: AuthEnum.none
	},
	{
		name: 'status_history',
		hover: 'all statuses from start',
		get: (
			// voice_channel: VoiceChannel | undefined | null, voice_object: PVoiceChannel | undefined | null,
			// portal_object_list: PChannel[] | undefined | null, guild_object: any, guild: Guild
		) => {
			return 'no_yet_implemented';
		},
		set: null,
		auth: AuthEnum.none
	},
	{
		name: 'status_list',
		hover: 'all statuses names',
		get: (
			voice_channel: VoiceChannel | undefined | null, voice_object: PVoiceChannel | undefined | null,
			// portal_object_list: PChannel[] | undefined | null, guild_object: any, guild: Guild
		) => {
			if (!voice_channel) {
				return 'N/A';
			}
			if (!voice_object) {
				return 'N/A';
			}

			return get_status_list(voice_channel, voice_object);
		},
		set: null,
		auth: AuthEnum.none
	}
];

export function is_variable(candidate: string): string {
	for (let i = 0; i < variables.length; i++) {
		const sub_str = String(candidate)
			.substring(1, (String(variables[i].name).length + 1));

		if (sub_str === variables[i].name) {
			return variables[i].name;
		}
	}

	return '';
}

export function get_variable_guide(): EmbedBuilder {
	const structArray: Field[] = [
		{
			emote: 'Used in Regex Interpreter',
			role: '*used by channel name (regex, regex_voice, regex_portal) and run command*',
			inline: true
		},
		{
			emote: 'variables are immutable and live data',
			role: '*data corresponds to server, portal or voice channel live data*',
			inline: true
		},
		{
			emote: '1.\tIn any text channel execute command `./run`',
			role: './run just like channel name generation uses the text interpreter',
			inline: false
		},
		{
			emote: '2.\t`./run The year is $year`',
			role: './run executes the given text and replies with the processed output',
			inline: false
		},
		{
			emote: '3.\tAwait a reply from portal which will be `The year is 2021',
			role: '*note that at the time of writhing it is 2021*',
			inline: false
		}
	];

	return createEmbed(
		'Variable Guide',
		'[Variables](' + PORTAL_URL + INTERPRETER_URL + '/variables/description) ' +
		'are immutable and live data that return information about your current voice channel.\n' +
		'how to use variables with text interpreter',
		'#1BE7FF',
		structArray,
		null,
		null,
		null,
		null,
		null
	);
}

function get_link(variable: string): string {
	const url = PORTAL_URL + INTERPRETER_URL + '/variables';
	const general = ['creator_portal', 'creator_voice', '##', '#'];
	const member = ['member_list', 'member_count', 'member_active_count', 'member_with_status', 'member_history'];
	const status = ['status_list', 'status_count', 'status_history'];
	const time = ['date', 'day_number', 'day_name', 'month_number', 'month_name', 'year', 'time', 'hour', 'minute', 'second'];

	if (general.includes(variable)) {
		if (variable === '##') {
			return `${url}/detailed/general/slash`
		} else if (variable === '#') {
			return `${url}/detailed/general/double_slash`
		} else {
			return `${url}/detailed/general/${variable}`
		}
	} else if (member.includes(variable)) {
		return `${url}/detailed/member/${variable}`
	} else if (status.includes(variable)) {
		return `${url}/detailed/status/${variable}`
	} else if (time.includes(variable)) {
		return `${url}/detailed/time/${variable}`
	} else {
		return `${url}/description`
	}
}

export function get_variable_help(): EmbedBuilder[] {
	const variableArray: Field[][] = [];

	for (let l = 0; l <= variables.length / 24; l++) {
		variableArray[l] = []
		for (let i = (24 * l); i < variables.length && i < 24 * (l + 1); i++) {
			variableArray[l].push({
				emote: `${i + 1}. ${variables[i].name}`,
				role: `[hover or click](${get_link(variables[i].name)} "${get_link(variables[i].hover)}")`,
				inline: true
			});
		}
	}

	return variableArray.map((command, index) => {
		if (index === 0) {
			return createEmbed(
				'Variables',
				'[Variables](' + PORTAL_URL + INTERPRETER_URL + '/variables/description) ' +
				'are immutable and live data that return information about your current voice channel.\n' +
				'Prefix: ' + variable_prefix,
				'#1BE7FF',
				variableArray[0],
				null,
				null,
				null,
				null,
				null
			);
		} else {
			return createEmbed(
				null,
				null,
				'#1BE7FF',
				variableArray[index],
				null,
				null,
				null,
				null,
				null
			);
		}
	});
}

export function get_variable_help_super(candidate: string): EmbedBuilder | boolean {
	for (let i = 0; i < variables.length; i++) {
		if (variables[i].name === candidate) {
			return createEmbed(
				variables[i].name,
				null,
				'#1BE7FF',
				[
					{ emote: `Type`, role: `Variables`, inline: true },
					{ emote: `Prefix`, role: `${variable_prefix}`, inline: true },
					{ emote: `Description`, role: `[hover or click](${get_link(candidate)} "${variables[i].hover}")`, inline: true }
				],
				null,
				null,
				null,
				null,
				null
			);
		}
	}

	return false;
}

export function get_variable(
	voice_channel: VoiceChannel | undefined | null, voice_object: PVoiceChannel | undefined | null,
	portal_object_list: PChannel[] | undefined | null, guild_object: PGuild, guild: Guild, variable: string
): any {
	for (let l = 0; l < variables.length; l++) {
		if (variable === variables[l].name) {
			return variables[l].get(
				voice_channel, voice_object, portal_object_list, guild_object, guild
			);
		}
	}
	return -1;
}
