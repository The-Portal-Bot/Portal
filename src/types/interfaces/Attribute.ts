import { GuildMember, MessageEmbed, VoiceChannel } from 'discord.js';
import { create_rich_embed, is_authorised } from '../../libraries/helpOps';
import { update_guild, update_member, update_portal, update_voice } from '../../libraries/mongoOps';
import { GuildPrtl } from '../classes/GuildPrtl';
import { MemberPrtl } from '../classes/MemberPrtl';
import { PortalChannelPrtl } from '../classes/PortalChannelPrtl';
import { VoiceChannelPrtl } from '../classes/VoiceChannelPrtl';
import { Field, InterfaceBlueprint, ReturnPormise } from './InterfacesPrtl';
import { isNumber } from 'util';

export const attribute_prefix: string = '&';
const locales = ['gr', 'en', 'de'];
const attributes: InterfaceBlueprint[] = [
	{
		name: 'p.ann_announce',
		description: 'returns/sets whether Portal announces events in current portals spawned channels',
		super_description: '**p.ann_announce** returns/sets whether Portal announces events in ' +
			'current portals spawned channels',
		example: '&p.ann_announce',
		args: 'true/false',
		get: (
			voice_channel: VoiceChannel, voice_object: VoiceChannelPrtl,
			portal_object: PortalChannelPrtl, guild_object: GuildPrtl, member_object: MemberPrtl | undefined
		): boolean => {
			return portal_object.ann_announce;
		},
		set: (
			voice_channel: VoiceChannel, voice_object: VoiceChannelPrtl, portal_object: PortalChannelPrtl,
			guild_object: GuildPrtl, value: string, member_object: MemberPrtl | undefined
		): Promise<ReturnPormise> => {
			return new Promise((resolve) => {
				const ctgr = ['p'];
				const attr = 'ann_announce';
				if (value === 'true') {
					update_portal(guild_object.id, portal_object.id, attr, true)
						.then(r => {
							return resolve({
								result: r,
								value: r
									? `attribute ${ctgr.join('.') + '.' + attr} set to ${value} successfully`
									: `attribute ${ctgr.join('.') + '.' + attr} can failed to be set`
							});
						})
						.catch(e => {
							return resolve({
								result: false,
								value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set (${e})`
							});
						});
				}
				else if (value === 'false') {
					update_portal(guild_object.id, portal_object.id, attr, false)
						.then(r => {
							return resolve({
								result: r,
								value: r
									? `attribute ${ctgr.join('.') + '.' + attr} set to ${value} successfully`
									: `attribute ${ctgr.join('.') + '.' + attr} can failed to be set`
							});
						})
						.catch(e => {
							return resolve({
								result: false,
								value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set (${e})`
							});
						});
				} else {
					return resolve({
						result: false,
						value: `attribute ${ctgr.join('.') + '.' + attr} can only be true or false`
					});
				}
			});
		},
		auth: 'portal'
	},
	{
		name: 'v.ann_announce',
		description: 'returns/sets whether Portal announces events in current channel',
		super_description: '**v.ann_announce** returns/sets whether Portal announces events in current channel',
		example: '&v.ann_announce',
		args: 'true/false',
		get: (
			voice_channel: VoiceChannel, voice_object: VoiceChannelPrtl,
			portal_object: PortalChannelPrtl, guild_object: GuildPrtl, member_object: MemberPrtl | undefined
		): boolean => {
			return voice_object.ann_announce;
		},
		set: (
			voice_channel: VoiceChannel, voice_object: VoiceChannelPrtl, portal_object: PortalChannelPrtl,
			guild_object: GuildPrtl, value: string, member_object: MemberPrtl | undefined
		): Promise<ReturnPormise> => {
			return new Promise((resolve) => {
				const ctgr = ['v'];
				const attr = 'ann_announce';
				if (value === 'true') {
					update_voice(guild_object.id, portal_object.id, voice_object.id, attr, true)
						.then(r => {
							return resolve({
								result: r,
								value: r
									? `attribute ${ctgr.join('.') + '.' + attr} set to ${value} successfully`
									: `attribute ${ctgr.join('.') + '.' + attr} can failed to be set`
							});
						})
						.catch(e => {
							return resolve({
								result: false,
								value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set (${e})`
							});
						});
				}
				else if (value === 'false') {
					update_voice(guild_object.id, portal_object.id, voice_object.id, attr, false)
						.then(r => {
							return resolve({
								result: r,
								value: r
									? `attribute ${ctgr.join('.') + '.' + attr} set to ${value} successfully`
									: `attribute ${ctgr.join('.') + '.' + attr} can failed to be set`
							});
						})
						.catch(e => {
							return resolve({
								result: false,
								value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set (${e})`
							});
						});
				} else {
					return resolve({
						result: false,
						value: `attribute ${ctgr.join('.') + '.' + attr} can only be true or false`
					});
				}
			});
		},
		auth: 'voice'
	},
	{
		name: 'p.ann_user',
		description: 'returns/sets whether Portal announces user\'s join or leave from current portals spawned channels',
		super_description: '**p.ann_user** returns/sets whether Portal announces user\'s join or leave from ' +
			'current portals spawned channels',
		example: '&p.ann_user',
		args: 'true/false',
		get: (
			voice_channel: VoiceChannel, voice_object: VoiceChannelPrtl,
			portal_object: PortalChannelPrtl, guild_object: GuildPrtl, member_object: MemberPrtl | undefined
		): boolean => {
			return portal_object.ann_user;
		},
		set: (
			voice_channel: VoiceChannel, voice_object: VoiceChannelPrtl, portal_object: PortalChannelPrtl,
			guild_object: GuildPrtl, value: string, member_object: MemberPrtl | undefined
		): Promise<ReturnPormise> => {
			return new Promise((resolve) => {
				const ctgr = ['p'];
				const attr = 'ann_user';
				if (value === 'true') {
					update_portal(guild_object.id, portal_object.id, attr, true)
						.then(r => {
							return resolve({
								result: r,
								value: r
									? `attribute ${ctgr.join('.') + '.' + attr} set to ${value} successfully`
									: `attribute ${ctgr.join('.') + '.' + attr} can failed to be set`
							});
						})
						.catch(e => {
							return resolve({
								result: false,
								value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set (${e})`
							});
						});
				}
				else if (value === 'false') {
					update_portal(guild_object.id, portal_object.id, attr, false)
						.then(r => {
							return resolve({
								result: r,
								value: r
									? `attribute ${ctgr.join('.') + '.' + attr} set to ${value} successfully`
									: `attribute ${ctgr.join('.') + '.' + attr} can failed to be set`
							});
						})
						.catch(e => {
							return resolve({
								result: false,
								value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set (${e})`
							});
						});
				} else {
					return resolve({
						result: false,
						value: `attribute ${ctgr.join('.') + '.' + attr} can only be true or false`
					});
				}
			});
		},
		auth: 'portal'
	},
	{
		name: 'v.ann_user',
		description: 'returns/sets whether Portal announces user\'s join or leave from current channel',
		super_description: '**v.ann_user** returns/sets whether Portal announces user\'s join or leave from current channel',
		example: '&v.ann_user',
		args: 'true/false',
		get: (
			voice_channel: VoiceChannel, voice_object: VoiceChannelPrtl,
			portal_object: PortalChannelPrtl, guild_object: GuildPrtl, member_object: MemberPrtl | undefined
		): boolean => {
			return voice_object.ann_user;
		},
		set: (
			voice_channel: VoiceChannel, voice_object: VoiceChannelPrtl, portal_object: PortalChannelPrtl,
			guild_object: GuildPrtl, value: string, member_object: MemberPrtl | undefined
		): Promise<ReturnPormise> => {
			return new Promise((resolve) => {
				const ctgr = ['v'];
				const attr = 'ann_user';
				if (value === 'true') {
					update_voice(guild_object.id, portal_object.id, voice_object.id, attr, true)
						.then(r => {
							return resolve({
								result: r,
								value: r
									? `attribute ${ctgr.join('.') + '.' + attr} set to ${value} successfully`
									: `attribute ${ctgr.join('.') + '.' + attr} can failed to be set`
							});
						})
						.catch(e => {
							return resolve({
								result: false,
								value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set (${e})`
							});
						});
				}
				else if (value === 'false') {
					update_voice(guild_object.id, portal_object.id, voice_object.id, attr, false)
						.then(r => {
							return resolve({
								result: r,
								value: r
									? `attribute ${ctgr.join('.') + '.' + attr} set to ${value} successfully`
									: `attribute ${ctgr.join('.') + '.' + attr} can failed to be set`
							});
						})
						.catch(e => {
							return resolve({
								result: false,
								value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set (${e})`
							});
						});
				} else {
					return resolve({
						result: false,
						value: `attribute ${ctgr.join('.') + '.' + attr} can only be true or false`
					});
				}
			});
		},
		auth: 'voice'
	},
	{
		name: 'v.bitrate',
		description: 'returns/sets bitrate of channel',
		super_description: '**v.bitrate** returns/sets bitrate of channel',
		example: '&v.bitrate',
		args: 'number',
		get: (
			voice_channel: VoiceChannel
		): number => {
			return voice_channel.bitrate;
		},
		set: (
			voice_channel: VoiceChannel, voice_object: VoiceChannelPrtl, portal_object: PortalChannelPrtl,
			guild_object: GuildPrtl, value: string, member_object: MemberPrtl | undefined
		): Promise<ReturnPormise> => {
			return new Promise((resolve) => {
				const ctgr = ['v'];
				const attr = 'bitrate';
				const new_bitrate = Number(value);

				if (!isNumber(new_bitrate)) {
					return resolve({
						result: false,
						value: `attribute ${ctgr.join('.') + '.' + attr} can only be a number`
					});
				}

				if (new_bitrate < 8000) {
					return resolve({
						result: false,
						value: `attribute ${ctgr.join('.') + '.' + attr} must be greater or equal to 8000`
					});
				}

				voice_channel.edit({ bitrate: new_bitrate })
					.then(r => {
						return resolve({
							result: r.bitrate === new_bitrate,
							value: r.bitrate === new_bitrate
								? `attribute ${ctgr.join('.') + '.' + attr} set to ${value} successfully`
								: `attribute ${ctgr.join('.') + '.' + attr} failed to be set to ${value} (is ${r.bitrate})`
						});
					})
					.catch(e => {
						return resolve({
							result: false,
							value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set (${e})`
						});
					});
			});
		},
		auth: 'voice'
	},
	{
		name: 'g.locale',
		description: 'returns/sets g.locale of the guild',
		super_description: '**g.locale**, returns/sets guild locale makes the bot talk your language and all communication is done' +
			'in your local language',
		example: '&g.locale',
		args: 'en/gr/de',
		get: (
			voice_channel: VoiceChannel, voice_object: VoiceChannelPrtl,
			portal_object: PortalChannelPrtl, guild_object: GuildPrtl, member_object: MemberPrtl | undefined
		): string => {
			return guild_object.locale;
		},
		set: (
			voice_channel: VoiceChannel, voice_object: VoiceChannelPrtl, portal_object: PortalChannelPrtl,
			guild_object: GuildPrtl, value: string, member_object: MemberPrtl | undefined
		): Promise<ReturnPormise> => {
			return new Promise((resolve) => {
				const ctgr = ['g'];
				const attr = 'locale';

				if (locales.includes(value)) {
					update_guild(guild_object.id, attr, String(value))
						.then(r => {
							return resolve({
								result: r,
								value: r
									? `attribute ${ctgr.join('.') + '.' + attr} set to ${value} successfully`
									: `attribute ${ctgr.join('.') + '.' + attr} can failed to be set`
							});
						})
						.catch(e => {
							return resolve({
								result: false,
								value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set (${e})`
							});
						});
				}
				else {
					return resolve({
						result: false,
						value: `attribute ${ctgr.join('.') + '.' + attr} can only be ${locales.join(', ')}`
					});
				}
			});
		},
		auth: 'admin'
	},
	{
		name: 'p.locale',
		description: 'returns/sets p.locale of current channel',
		super_description: '**p.locale**, returns/sets language used in statuses',
		example: '&p.locale',
		args: 'en/gr/de',
		get: (
			voice_channel: VoiceChannel, voice_object: VoiceChannelPrtl,
			portal_object: PortalChannelPrtl, guild_object: GuildPrtl, member_object: MemberPrtl | undefined
		): string => {
			return portal_object.locale;
		},
		set: (
			voice_channel: VoiceChannel, voice_object: VoiceChannelPrtl, portal_object: PortalChannelPrtl,
			guild_object: GuildPrtl, value: string, member_object: MemberPrtl | undefined
		): Promise<ReturnPormise> => {
			const ctgr = ['p'];
			const attr = 'locale';

			return new Promise((resolve) => {
				if (locales.includes(value)) {
					update_portal(guild_object.id, portal_object.id, attr, String(value))
						.then(r => {
							return resolve({
								result: r,
								value: r
									? `attribute ${ctgr.join('.') + '.' + attr} set to ${value} successfully`
									: `attribute ${ctgr.join('.') + '.' + attr} can failed to be set`
							});
						})
						.catch(e => {
							return resolve({
								result: false,
								value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set (${e})`
							});
						});
				}
				else {
					return resolve({
						result: false,
						value: `attribute ${ctgr.join('.') + '.' + attr} can only be ${locales.join(', ')}`
					});
				}
			});
		},
		auth: 'portal'
	},
	{
		name: 'v.locale',
		description: 'returns/sets v.locale of current channel',
		super_description: '**v.locale**, returns/sets language used in statuses',
		example: '&v.locale',
		args: 'en/gr/de',
		get: (
			voice_channel: VoiceChannel, voice_object: VoiceChannelPrtl,
			portal_object: PortalChannelPrtl, guild_object: GuildPrtl, member_object: MemberPrtl | undefined
		): string => {
			return voice_object.locale;
		},
		set: (
			voice_channel: VoiceChannel, voice_object: VoiceChannelPrtl, portal_object: PortalChannelPrtl,
			guild_object: GuildPrtl, value: string, member_object: MemberPrtl | undefined
		): Promise<ReturnPormise> => {
			return new Promise((resolve) => {
				const ctgr = ['v'];
				const attr = 'locale';

				if (locales.includes(value)) {
					update_voice(guild_object.id, portal_object.id, voice_object.id, attr, String(value))
						.then(r => {
							return resolve({
								result: r,
								value: r
									? `attribute ${ctgr.join('.') + '.' + attr} set to ${value} successfully`
									: `attribute ${ctgr.join('.') + '.' + attr} can failed to be set`
							});
						})
						.catch(e => {
							return resolve({
								result: false,
								value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set (${e})`
							});
						});
				}
				else {
					return resolve({
						result: false,
						value: `attribute ${ctgr.join('.') + '.' + attr} can only be ${locales.join(', ')}`
					});
				}
			});
		},
		auth: 'voice'
	},
	{
		name: 'v.position',
		description: 'returns/sets the position of the voice channel',
		super_description: '**v.position**, returns/sets the position of the voice channel',
		example: '&v.position',
		args: '!v.position_of_channel',
		get: (
			voice_channel: VoiceChannel, voice_object: VoiceChannelPrtl,
			portal_object: PortalChannelPrtl, guild_object: GuildPrtl, member_object: MemberPrtl | undefined
		): number => {
			return voice_channel.position;
		},
		set: (
			voice_channel: VoiceChannel, voice_object: VoiceChannelPrtl, portal_object: PortalChannelPrtl,
			guild_object: GuildPrtl, value: string, member_object: MemberPrtl | undefined
		): Promise<ReturnPormise> => {
			return new Promise((resolve) => {
				const ctgr = ['v'];
				const attr = 'position';

				if (!isNumber(Number(value))) {
					return resolve({
						result: false,
						value: `attribute ${ctgr.join('.') + '.' + attr} can only be a number`
					});
				}

				voice_channel.edit({ position: Number(value) })
					.then(r => {
						return resolve({
							result: r.position === Number(value),
							value: r.position === Number(value)
								? `attribute ${ctgr.join('.') + '.' + attr} set to ${value} successfully`
								: `attribute ${ctgr.join('.') + '.' + attr} failed to be set to ${value} (is ${r.position})`
						});
					})
					.catch(e => {
						return resolve({
							result: false,
							value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set`
						});
					});
			});
		},
		auth: 'voice'
	},
	{
		name: 'p.regex_overwrite',
		description: 'returns/sets your personal voice channel regex',
		super_description: '**p.regex_overwrite**, returns/sets your personal voice channel regex',
		example: '&p.regex_overwrite',
		args: '!true/false',
		get: (
			voice_channel: VoiceChannel, voice_object: VoiceChannelPrtl,
			portal_object: PortalChannelPrtl, guild_object: GuildPrtl, member_object: MemberPrtl | undefined
		): boolean => {
			return portal_object.regex_overwrite;
		},
		set: (
			voice_channel: VoiceChannel, voice_object: VoiceChannelPrtl, portal_object: PortalChannelPrtl,
			guild_object: GuildPrtl, value: string, member_object: MemberPrtl | undefined
		): Promise<ReturnPormise> => {
			return new Promise((resolve) => {
				const ctgr = ['p'];
				const attr = 'regex_overwrite';

				if (value === 'true') {
					update_portal(guild_object.id, portal_object.id, attr, true)
						.then(r => {
							return resolve({
								result: r,
								value: r
									? `attribute ${ctgr.join('.') + '.' + attr} set to ${value} successfully`
									: `attribute ${ctgr.join('.') + '.' + attr} failed to be set`
							});
						})
						.catch(e => {
							return resolve({
								result: false,
								value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set`
							});
						});
				}
				else if (value === 'false') {
					update_portal(guild_object.id, portal_object.id, attr, false)
						.then(r => {
							return resolve({
								result: r,
								value: r
									? `attribute ${ctgr.join('.') + '.' + attr} set to ${value} successfully`
									: `attribute ${ctgr.join('.') + '.' + attr} failed to be set`
							});
						})
						.catch(e => {
							return resolve({
								result: false,
								value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set`
							});
						});
				} else {
					return resolve({
						result: false,
						value: `attribute ${ctgr.join('.') + '.' + attr} can only be true or false`
					});
				}
			});
		},
		auth: 'voice'
	},
	{
		name: 'p.regex',
		description: 'returns/sets title-guidelines of portal channel',
		super_description: '**p.regex**, returns/sets title-guidelines of portal channel',
		example: '&p.regex',
		args: '!regex',
		get: (
			voice_channel: VoiceChannel, voice_object: VoiceChannelPrtl,
			portal_object: PortalChannelPrtl, guild_object: GuildPrtl, member_object: MemberPrtl | undefined
		): string => {
			return portal_object.regex_portal;
		},
		set: (
			voice_channel: VoiceChannel, voice_object: VoiceChannelPrtl, portal_object: PortalChannelPrtl,
			guild_object: GuildPrtl, value: string, member_object: MemberPrtl | undefined
		): Promise<ReturnPormise> => {
			return new Promise((resolve) => {
				const ctgr = ['p'];
				const attr = 'regex_portal';

				update_portal(guild_object.id, portal_object.id, attr, value)
					.then(r => {
						return resolve({
							result: r,
							value: r
								? `attribute ${ctgr.join('.') + '.' + attr} set to ${value} successfully`
								: `attribute ${ctgr.join('.') + '.' + attr} failed to be set`
						});
					})
					.catch(e => {
						return resolve({
							result: false,
							value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set`
						});
					});
			});
		},
		auth: 'portal'
	},
	{
		name: 'p.v.regex',
		description: 'returns/sets the default title for created voice channels',
		super_description: '**p.v.regex**, returns/sets the default title for created voice channels',
		example: '&p.v.regex',
		args: '!regex',
		get: (
			voice_channel: VoiceChannel, voice_object: VoiceChannelPrtl,
			portal_object: PortalChannelPrtl, guild_object: GuildPrtl, member_object: MemberPrtl | undefined
		): string => {
			return portal_object.regex_voice;
		},
		set: (
			voice_channel: VoiceChannel, voice_object: VoiceChannelPrtl, portal_object: PortalChannelPrtl,
			guild_object: GuildPrtl, value: string, member_object: MemberPrtl | undefined
		): Promise<ReturnPormise> => {
			return new Promise((resolve) => {
				const ctgr = ['p', 'v'];
				const attr = 'regex_voice';

				update_portal(guild_object.id, portal_object.id, attr, value)
					.then(r => {
						return resolve({
							result: r,
							value: r
								? `attribute ${ctgr.join('.') + '.' + attr} set to ${value} successfully`
								: `attribute ${ctgr.join('.') + '.' + attr} failed to be set`
						});
					})
					.catch(e => {
						return resolve({
							result: false,
							value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set`
						});
					});
			});
		},
		auth: 'portal'
	},
	{
		name: 'v.regex',
		description: 'returns/sets the title for current voice channel',
		super_description: '**v.regex**, returns/sets the title for current voice channel',
		example: '&v.regex',
		args: '!v.regex',
		get: (
			voice_channel: VoiceChannel, voice_object: VoiceChannelPrtl,
			portal_object: PortalChannelPrtl, guild_object: GuildPrtl, member_object: MemberPrtl | undefined
		): string => {
			return voice_object.regex;
		},
		set: (
			voice_channel: VoiceChannel, voice_object: VoiceChannelPrtl, portal_object: PortalChannelPrtl,
			guild_object: GuildPrtl, value: string, member_object: MemberPrtl | undefined
		): Promise<ReturnPormise> => {
			return new Promise((resolve) => {
				const ctgr = ['v'];
				const attr = 'regex';

				update_voice(guild_object.id, portal_object.id, voice_object.id, attr, value)
					.then(r => {
						return resolve({
							result: r,
							value: r
								? `attribute ${ctgr.join('.') + '.' + attr} set to ${value} successfully`
								: `attribute ${ctgr.join('.') + '.' + attr} failed to be set`
						});
					})
					.catch(e => {
						return resolve({
							result: false,
							value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set`
						});
					});
			});
		},
		auth: 'voice'
	},
	{
		name: 'm.regex',
		description: 'returns/sets your personal voice channel regex',
		super_description: '**m.regex**, returns/sets your personal voice channel regex',
		example: '&m.regex',
		args: '!m.regex',
		get: (
			voice_channel: VoiceChannel, voice_object: VoiceChannelPrtl,
			portal_object: PortalChannelPrtl, guild_object: GuildPrtl, member_object: MemberPrtl | undefined
		): string => {
			return member_object && member_object.regex ? member_object.regex : 'not set';
		},
		set: (
			voice_channel: VoiceChannel, voice_object: VoiceChannelPrtl, portal_object: PortalChannelPrtl,
			guild_object: GuildPrtl, value: string, member_object: MemberPrtl | undefined
		): Promise<ReturnPormise> => {
			return new Promise((resolve) => {
				const ctgr = ['m'];
				const attr = 'regex';

				if (member_object) {
					update_member(guild_object.id, member_object.id, attr, value)
						.then(r => {
							return resolve({
								result: r,
								value: r
									? `attribute ${ctgr.join('.') + '.' + attr} set to ${value} successfully`
									: `attribute ${ctgr.join('.') + '.' + attr} failed to be set`
							});
						})
						.catch(e => {
							return resolve({
								result: false,
								value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set`
							});
						});
				} else {
					return resolve({
						result: false,
						value: `could not find member`
					});
				}
			});
		},
		auth: 'admin'
	},
	{
		name: 'p.user_limit',
		description: 'returns/sets maximum number of members guideline for portal',
		super_description: '**p.user_limit**, returns/sets maximum number of members guideline for portal',
		example: '&p.user_limit',
		args: '!number of maximum members (0 is infinite)',
		get: (
			voice_channel: VoiceChannel, voice_object: VoiceChannelPrtl, portal_object: PortalChannelPrtl
		): number => {
			return portal_object.user_limit_portal;
		},
		set: (
			voice_channel: VoiceChannel, voice_object: VoiceChannelPrtl,
			portal_object: PortalChannelPrtl, guild_object: GuildPrtl, value: number
		): Promise<ReturnPormise> => {
			return new Promise((resolve) => {
				const ctgr = ['p'];
				const attr = 'user_limit_portal';
				const new_user_limit = Number(value);

				if (isNumber(new_user_limit)) {
					return resolve({
						result: false,
						value: `attribute ${ctgr.join('.') + '.' + attr} can only be a number from 0-n (0 means unlimited)`
					});
				}

				if (value >= 0) {
					update_portal(guild_object.id, portal_object.id, 'user_limit_portal', new_user_limit)
						.then(r => {
							return resolve({
								result: r,
								value: r
									? `attribute ${ctgr.join('.') + '.' + attr} set to ${value} successfully`
									: `attribute ${ctgr.join('.') + '.' + attr} failed to be set`
							});
						})
						.catch(e => {
							return resolve({
								result: false,
								value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set`
							});
						});
				} else {
					return resolve({
						result: false,
						value: `attribute ${ctgr.join('.') + '.' + attr} can be a number from 0-n (0 means unlimited)`
					});
				}
			});
		},
		auth: 'portal'
	},
	{
		name: 'v.user_limit',
		description: 'returns/sets maximum number of members allowed',
		super_description: '**v.user_limit**, returns/sets maximum number of members allowed',
		example: '&v.user_limit',
		args: '!number of maximum members (0 is infinite)',
		get: (
			voice_channel: VoiceChannel, voice_object: VoiceChannelPrtl,
			portal_object: PortalChannelPrtl, guild_object: GuildPrtl, member_object: MemberPrtl | undefined
		): number => {
			return voice_channel.userLimit;
		},
		set: (
			voice_channel: VoiceChannel, voice_object: VoiceChannelPrtl,
			portal_object: PortalChannelPrtl, guild_object: GuildPrtl, value: number
		): Promise<ReturnPormise> => {
			return new Promise((resolve) => {
				const ctgr = ['v'];
				const attr = 'user_limit';
				const new_user_limit = Number(value);

				if (new_user_limit >= 0) {
					voice_channel.setUserLimit(new_user_limit)
						.then(r => {
							return resolve({
								result: r.userLimit === new_user_limit,
								value: r.userLimit === new_user_limit
									? `attribute ${ctgr.join('.') + '.' + attr} set to ${value} successfully`
									: `attribute ${ctgr.join('.') + '.' + attr} failed to be set`
							});
						})
						.catch(e => {
							return resolve({
								result: false,
								value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set`
							});
						});
				} else {
					return resolve({
						result: false,
						value: `attribute ${ctgr.join('.') + '.' + attr} can only be a number from 0-n (0 means unlimited)`
					});
				}
			});
		},
		auth: 'voice',
	}
];

export function is_attribute(candidate: string): string {
	for (let i = 0; i < attributes.length; i++) {
		if (String(candidate).substring(1, (String(attributes[i].name).length + 1)) == attributes[i].name) {
			return attributes[i].name;
		}
	}
	return '';
}

export function get_attribute_guide(): MessageEmbed {
	const attr_array: Field[] = [
		{
			emote: 'Used in Regex Interpreter',
			role: '*used by channel name (regex, regex_voice, regex_portal) and run command*',
			inline: true
		},
		{
			emote: 'attributes are mutable data options',
			role: '*options corespond to server, portal or voice channels*',
			inline: true
		},
		{
			emote: '1. Go to any channel',
			role: '*you can run commands ./run OR ./set in any channel and Portal will see them*',
			inline: false
		},
		{
			emote: '2-1.`./run &locale`',
			role: '*run command, processes given text and returns processed text*',
			inline: false
		},
		{
			emote: '2-2. Wait for portal response which will be either gr OR en OR de',
			role: '*it will reply with your string until it edits it with processed info*',
			inline: false
		},
		{
			emote: '3-1. `./set` locale de (note that when setting you do not need prefix &)',
			role: '*set command, updates the data of an attribute in this case **locale** to **de***',
			inline: false
		},
		{
			emote: '3-2. Wait for portal response which will be inform you if it was executed without issues',
			role: '*portal will either confirm update or inform you of the error it faced*',
			inline: false
		}
	];

	return create_rich_embed(
		'Attribute Guide',
		'go to https://portal-bot.xyz/docs/regex/interpreter/atributes\n\n' +
		'how to use attributes with regex interpreter',
		'#FF5714',
		attr_array,
		null,
		null,
		null,
		null,
		null
	);
}

export function get_attribute_help(): MessageEmbed[] {
	const attr_array: Field[][] = [];

	for (let l = 0; l <= attributes.length / 24; l++) {
		attr_array[l] = []
		for (let i = (24 * l); i < attributes.length && i < 24 * (l + 1); i++) {
			attr_array[l].push({
				emote: `${i + 1}. ${attributes[i].name}`,
				role: '**desc**: *' + attributes[i].description + '*' +
					'\n**args**: *' + attributes[i].args + '*',
				inline: true
			});
		}
	}

	return attr_array.map((cmmd, index) => {
		if (index === 0) {
			return create_rich_embed(
				'Attributes',
				'go to https://portal-bot.xyz/docs/regex/interpreter/attributes\n\n' +
				'Prefix: ' + attribute_prefix + '\n' +
				'are Portal\'s, portal or voice channel options ' +
				'that can be manipulated by whomever has clearance.\n' +
				'argument preceded by **!** is *mandatory*, **@** is *optional*\n',
				'#FF5714', attr_array[0], null, null, null, null, null
			)
		} else {
			return create_rich_embed(
				null, null, '#FF5714', attr_array[index], null, null, null, null, null
			)
		}
	});
};

export function get_attribute_help_super(
	candidate: string
): MessageEmbed | boolean {
	for (let i = 0; i < attributes.length; i++) {
		const attr = attributes[i];
		if (attr.name === candidate) {
			return create_rich_embed(
				attr.name,
				'Type: Attribute' +
				'\nPrefix: ' + attribute_prefix + '\n' +
				'argument preceded by **!** is *mandatory*, **@** is *optional*\n',
				'#FF5714',
				[
					{ emote: 'Description', role: '*' + attr.super_description + '*', inline: false },
					{ emote: 'Arguments', role: '*' + attr.args + '*', inline: false },
					{ emote: 'Example', role: '*' + attr.example + '*', inline: false },
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

export function get_attribute(
	voice_channel: VoiceChannel, voice_object: VoiceChannelPrtl, portal_object: PortalChannelPrtl,
	guild_object: GuildPrtl, candidate: string, member_object: MemberPrtl | undefined | undefined
): string | number | boolean {
	for (let l = 0; l < attributes.length; l++) {
		if (candidate === attributes[l].name) {
			return attributes[l].get(voice_channel, voice_object, portal_object, guild_object, member_object);
		}
	}
	return -1;
};

export function set_attribute(
	voice_channel: VoiceChannel, voice_object: VoiceChannelPrtl, portal_object: PortalChannelPrtl,
	guild_object: GuildPrtl, candidate: string, value: any, member: GuildMember
): Promise<ReturnPormise> {
	return new Promise((resolve) => {
		for (let l = 0; l < attributes.length; l++) {
			if (candidate === attributes[l].name) {
				switch (attributes[l].auth) {
					case 'admin':
						if (!is_authorised(guild_object.member_list, guild_object.auth_role, member)) {
							return resolve({
								result: false,
								value: `attribute ${candidate} can only be set by an administrator`
							});
						}
						break;
					case 'portal':
						if (portal_object.creator_id !== member.id) {
							return resolve({
								result: false,
								value: `attribute ${candidate} can only be set by the portal creator`
							});
						}
						break;
					case 'voice':
						if (voice_object.creator_id !== member.id) {
							return resolve({
								result: false,
								value: `attribute ${candidate} can only be set by the voice creator`
							});
						}
						break;
					default:
						break;
				}

				const member_object = guild_object.member_list.find(m => m.id === member.id);
				attributes[l].set(voice_channel, voice_object, portal_object, guild_object, value, member_object)
					.then((r: ReturnPormise) => {
						return resolve(r);
					})
					.catch((e: any) => {
						return resolve({
							result: false,
							value: `attribute ${candidate} failed to be set`
						});
					});
				break;
			}
			else if (l + 1 === attributes.length) {
				return resolve({
					result: false,
					value: `${candidate} is not an attribute`
				});
			}
		}
	});
};