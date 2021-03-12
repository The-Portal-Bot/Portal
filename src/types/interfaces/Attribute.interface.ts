import { Guild, GuildMember, MessageEmbed, VoiceChannel } from 'discord.js';
import { AuthEnum } from '../../data/enums/Admin.enum';
import { LocaleEnum, LocaleList } from '../../data/enums/Locales.enum';
import { ProfanityLevelEnum, ProfanityLevelList } from '../../data/enums/ProfanityLevel.enum';
import { RankSpeedEnum, RankSpeedList } from '../../data/enums/RankSpeed.enum';
import { create_rich_embed, get_key_from_enum, is_authorised } from '../../libraries/help.library';
import { update_guild, update_member, update_portal, update_voice } from '../../libraries/mongo.library';
import { GuildPrtl } from '../classes/GuildPrtl.class';
import { MemberPrtl } from '../classes/MemberPrtl.class';
import { PortalChannelPrtl } from '../classes/PortalChannelPrtl.class';
import { VoiceChannelPrtl } from '../classes/VoiceChannelPrtl.class';
import { Field, InterfaceBlueprint, ReturnPormise } from './InterfacesPrtl.interface';

export const attribute_prefix: string = '&';

const attributes: InterfaceBlueprint[] = [
	{
		name: 'p.ann_announce',
		description: 'returns/sets whether Portal announces events in current portals spawned channels',
		super_description: '**p.ann_announce** returns/sets whether Portal announces events in ' +
			'current portals spawned channels',
		example: '&p.ann_announce',
		args: 'true/false',
		get: (
			voice_channel: VoiceChannel | undefined | null, voice_object: VoiceChannelPrtl | undefined | null,
			portal_object_list: PortalChannelPrtl[] | undefined | null, guild_object: GuildPrtl, guild: Guild
		): boolean | string => {
			if (!voice_object) {
				return 'must be in voice channel';
			}
			if (!portal_object_list) {
				return 'must be in portal channel';
			}

			const portal_object = portal_object_list.find(portal =>
				portal.voice_list.some(voice =>
					voice.id === voice_object.id)
			);

			if (portal_object) {
				return portal_object.ann_announce;
			}

			return 'ERROR';
		},
		set: (
			voice_channel: VoiceChannel, voice_object: VoiceChannelPrtl, portal_object: PortalChannelPrtl,
			guild_object: GuildPrtl, value: string, member_object: MemberPrtl | undefined
		): Promise<ReturnPormise> => {
			const ctgr = ['p'];
			const attr = 'ann_announce';

			return new Promise((resolve) => {
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
						value: `attribute ${ctgr.join('.') + '.' + attr} can only be **true or false**`
					});
				}
			});
		},
		auth: AuthEnum.portal
	},
	{
		name: 'v.ann_announce',
		description: 'returns/sets whether Portal announces events in current channel',
		super_description: '**v.ann_announce** returns/sets whether Portal announces events in current channel',
		example: '&v.ann_announce',
		args: 'true/false',
		get: (
			voice_channel: VoiceChannel | undefined | null, voice_object: VoiceChannelPrtl | undefined | null,
			portal_object_list: PortalChannelPrtl[] | undefined | null, guild_object: GuildPrtl, guild: Guild
		): boolean | string => {
			if (!voice_object) {
				return 'must be in voice channel';
			}

			return voice_object.ann_announce;
		},
		set: (
			voice_channel: VoiceChannel, voice_object: VoiceChannelPrtl, portal_object: PortalChannelPrtl,
			guild_object: GuildPrtl, value: string, member_object: MemberPrtl | undefined
		): Promise<ReturnPormise> => {
			const ctgr = ['v'];
			const attr = 'ann_announce';

			return new Promise((resolve) => {
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
						value: `attribute ${ctgr.join('.') + '.' + attr} can only be **true or false**`
					});
				}
			});
		},
		auth: AuthEnum.voice
	},
	{
		name: 'p.no_bots',
		description: 'returns/sets whether bots can join portal\'s voice channels',
		super_description: '**p.no_bots** returns/sets whether bots can join portal\'s voice channels. ' +
			'Basically switching name rendering on/off.',
		example: '&p.no_bots',
		args: 'true/false',
		get: (
			voice_channel: VoiceChannel | undefined | null, voice_object: VoiceChannelPrtl | undefined | null,
			portal_object_list: PortalChannelPrtl[] | undefined | null, guild_object: GuildPrtl, guild: Guild
		): boolean | string => {
			if (!voice_object) {
				return 'must be in voice channel';
			}
			if (!portal_object_list) {
				return 'must be in portal channel';
			}

			const portal_object = portal_object_list.find(portal =>
				portal.voice_list.some(voice =>
					voice.id === voice_object.id)
			);

			if (portal_object) {
				return portal_object.no_bots;
			}

			return 'ERROR';
		},
		set: (
			voice_channel: VoiceChannel, voice_object: VoiceChannelPrtl, portal_object: PortalChannelPrtl,
			guild_object: GuildPrtl, value: string, member_object: MemberPrtl | undefined
		): Promise<ReturnPormise> => {
			const ctgr = ['p'];
			const attr = 'no_bots';

			return new Promise((resolve) => {
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
						value: `attribute ${ctgr.join('.') + '.' + attr} can only be **true or false**`
					});
				}
			});
		},
		auth: AuthEnum.portal
	},
	{
		name: 'v.no_bots',
		description: 'returns/sets whether bots can join voice channel',
		super_description: '**v.no_bots** returns/sets whether bots can join voice channel. ',
		example: '&v.no_bots',
		args: 'true/false',
		get: (
			voice_channel: VoiceChannel | undefined | null, voice_object: VoiceChannelPrtl | undefined | null,
			portal_object_list: PortalChannelPrtl[] | undefined | null, guild_object: GuildPrtl, guild: Guild
		): boolean | string => {
			if (!voice_object) {
				return 'must be in voice channel';
			}

			return voice_object.no_bots;
		},
		set: (
			voice_channel: VoiceChannel, voice_object: VoiceChannelPrtl, portal_object: PortalChannelPrtl,
			guild_object: GuildPrtl, value: string, member_object: MemberPrtl | undefined
		): Promise<ReturnPormise> => {
			const ctgr = ['v'];
			const attr = 'no_bots';

			return new Promise((resolve) => {
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
						value: `attribute ${ctgr.join('.') + '.' + attr} can only be **true or false**`
					});
				}
			});
		},
		auth: AuthEnum.voice
	},
	{
		name: 'p.render',
		description: 'returns/sets whether portal\'s voice channels render names',
		super_description: '**p.render** returns/sets whether portal\'s voice channels render names. ' +
			'Basically switching name rendering on/off.',
		example: '&p.render',
		args: 'true/false',
		get: (
			voice_channel: VoiceChannel | undefined | null, voice_object: VoiceChannelPrtl | undefined | null,
			portal_object_list: PortalChannelPrtl[] | undefined | null, guild_object: GuildPrtl, guild: Guild
		): boolean | string => {
			if (!voice_object) {
				return 'must be in voice channel';
			}
			if (!portal_object_list) {
				return 'must be in portal channel';
			}

			const portal_object = portal_object_list.find(portal =>
				portal.voice_list.some(voice =>
					voice.id === voice_object.id)
			);

			if (portal_object) {
				return portal_object.render;
			}

			return 'ERROR';
		},
		set: (
			voice_channel: VoiceChannel, voice_object: VoiceChannelPrtl, portal_object: PortalChannelPrtl,
			guild_object: GuildPrtl, value: string, member_object: MemberPrtl | undefined
		): Promise<ReturnPormise> => {
			const ctgr = ['p'];
			const attr = 'render';

			return new Promise((resolve) => {
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
						value: `attribute ${ctgr.join('.') + '.' + attr} can only be **true or false**`
					});
				}
			});
		},
		auth: AuthEnum.portal
	},
	{
		name: 'v.render',
		description: 'returns/sets whether voice channel renders its name',
		super_description: '**v.render** returns/sets whether voice channel renders its name. ' +
			'Basically switching name rendering on/off.',
		example: '&v.render',
		args: 'true/false',
		get: (
			voice_channel: VoiceChannel | undefined | null, voice_object: VoiceChannelPrtl | undefined | null,
			portal_object_list: PortalChannelPrtl[] | undefined | null, guild_object: GuildPrtl, guild: Guild
		): boolean | string => {
			if (!voice_object) {
				return 'must be in voice channel';
			}

			return voice_object.render;
		},
		set: (
			voice_channel: VoiceChannel, voice_object: VoiceChannelPrtl, portal_object: PortalChannelPrtl,
			guild_object: GuildPrtl, value: string, member_object: MemberPrtl | undefined
		): Promise<ReturnPormise> => {
			const ctgr = ['v'];
			const attr = 'render';

			return new Promise((resolve) => {
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
						value: `attribute ${ctgr.join('.') + '.' + attr} can only be **true or false**`
					});
				}
			});
		},
		auth: AuthEnum.voice
	},
	{
		name: 'p.ann_user',
		description: 'returns/sets whether Portal announces user\'s join or leave from current portals spawned channels',
		super_description: '**p.ann_user** returns/sets whether Portal announces user\'s join or leave from ' +
			'current portals spawned channels',
		example: '&p.ann_user',
		args: 'true/false',
		get: (
			voice_channel: VoiceChannel | undefined | null, voice_object: VoiceChannelPrtl | undefined | null,
			portal_object_list: PortalChannelPrtl[] | undefined | null, guild_object: GuildPrtl, guild: Guild
		): boolean | string => {
			if (!voice_object) {
				return 'must be in voice channel';
			}
			if (!portal_object_list) {
				return 'must be in portal channel';
			}

			const portal_object = portal_object_list.find(portal =>
				portal.voice_list.some(voice =>
					voice.id === voice_object.id)
			);

			if (portal_object) {
				return portal_object.ann_user;
			}

			return 'ERROR';
		},
		set: (
			voice_channel: VoiceChannel, voice_object: VoiceChannelPrtl, portal_object: PortalChannelPrtl,
			guild_object: GuildPrtl, value: string, member_object: MemberPrtl | undefined
		): Promise<ReturnPormise> => {
			const ctgr = ['p'];
			const attr = 'ann_user';

			return new Promise((resolve) => {
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
						value: `attribute ${ctgr.join('.') + '.' + attr} can only be **true or false**`
					});
				}
			});
		},
		auth: AuthEnum.portal
	},
	{
		name: 'v.ann_user',
		description: 'returns/sets whether Portal announces user\'s join or leave from current channel',
		super_description: '**v.ann_user** returns/sets whether Portal announces user\'s join or leave from current channel',
		example: '&v.ann_user',
		args: 'true/false',
		get: (
			voice_channel: VoiceChannel | undefined | null, voice_object: VoiceChannelPrtl | undefined | null,
			portal_object_list: PortalChannelPrtl[] | undefined | null, guild_object: GuildPrtl, guild: Guild
		): boolean | string => {
			if (!voice_object) {
				return 'must be in voice channel';
			}

			return voice_object.ann_user;
		},
		set: (
			voice_channel: VoiceChannel, voice_object: VoiceChannelPrtl, portal_object: PortalChannelPrtl,
			guild_object: GuildPrtl, value: string, member_object: MemberPrtl | undefined
		): Promise<ReturnPormise> => {
			const ctgr = ['v'];
			const attr = 'ann_user';

			return new Promise((resolve) => {
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
						value: `attribute ${ctgr.join('.') + '.' + attr} can only be **true or false**`
					});
				}
			});
		},
		auth: AuthEnum.voice
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
			const ctgr = ['v'];
			const attr = 'bitrate';
			const new_bitrate = Number(value);

			return new Promise((resolve) => {
				if (isNaN(new_bitrate)) {
					return resolve({
						result: false,
						value: `attribute ${ctgr.join('.') + '.' + attr} can only be **a number**`
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
		auth: AuthEnum.voice
	},
	{
		name: 'g.prefix',
		description: 'returns/sets prefix of Portal',
		super_description: '**prefix**, returns/sets guild prefix which is how you refere to Portal',
		example: '&g.prefix',
		args: 'string',
		get: (
			voice_channel: VoiceChannel | undefined | null, voice_object: VoiceChannelPrtl | undefined | null,
			portal_object_list: PortalChannelPrtl[] | undefined | null, guild_object: GuildPrtl, guild: Guild
		): string => {
			return guild_object.prefix;
		},
		set: (
			voice_channel: VoiceChannel, voice_object: VoiceChannelPrtl, portal_object: PortalChannelPrtl,
			guild_object: GuildPrtl, value: string, member_object: MemberPrtl | undefined
		): Promise<ReturnPormise> => {
			const ctgr = ['g'];
			const attr = 'prefix';

			return new Promise((resolve) => {
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
			});
		},
		auth: AuthEnum.admin
	},
	{
		name: 'g.rank_speed',
		description: 'returns/sets leveling speed of your server',
		super_description: '**g.rank_speed**, returns/sets leveling speed of your server,' +
			'Basically how fast or slow members will reach levels that will give them roles.',
		example: '&g.rank_speed',
		args: 'none/slow/default/fast',
		get: (
			voice_channel: VoiceChannel | undefined | null, voice_object: VoiceChannelPrtl | undefined | null,
			portal_object_list: PortalChannelPrtl[] | undefined | null, guild_object: GuildPrtl, guild: Guild
		): string => {
			return RankSpeedEnum[guild_object.rank_speed];
		},
		set: (
			voice_channel: VoiceChannel, voice_object: VoiceChannelPrtl, portal_object: PortalChannelPrtl,
			guild_object: GuildPrtl, value: string, member_object: MemberPrtl | undefined
		): Promise<ReturnPormise> => {
			const ctgr = ['g'];
			const attr = 'rank_speed';

			return new Promise((resolve) => {
				const speed = get_key_from_enum(value, RankSpeedEnum);

				if (speed !== undefined) {
					update_guild(guild_object.id, attr, speed)
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
						value: `attribute ${ctgr.join('.') + '.' + attr} can only be **${RankSpeedList.join(', ')}**`
					});
				}

			});
		},
		auth: AuthEnum.admin
	},
	{
		name: 'g.profanity_level',
		description: 'returns/sets the level of Profanity check strictness',
		super_description: '**g.profanity_level**, returns/sets the level of Profanity check strictness,' +
			'For example fuckshit would not be flagged in `default` level but would in `strict`.',
		example: '&g.profanity_level',
		args: 'none/default/strict',
		get: (
			voice_channel: VoiceChannel | undefined | null, voice_object: VoiceChannelPrtl | undefined | null,
			portal_object_list: PortalChannelPrtl[] | undefined | null, guild_object: GuildPrtl, guild: Guild
		): string => {
			return ProfanityLevelEnum[guild_object.profanity_level];
		},
		set: (
			voice_channel: VoiceChannel, voice_object: VoiceChannelPrtl, portal_object: PortalChannelPrtl,
			guild_object: GuildPrtl, value: string, member_object: MemberPrtl | undefined
		): Promise<ReturnPormise> => {
			const ctgr = ['g'];
			const attr = 'profanity_level';

			return new Promise((resolve) => {
				const level = get_key_from_enum(value, ProfanityLevelEnum);

				if (level !== undefined) {
					update_guild(guild_object.id, attr, level)
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
						value: `attribute ${ctgr.join('.') + '.' + attr} can only be **${ProfanityLevelList.join(', ')}**`
					});
				}

			});
		},
		auth: AuthEnum.admin
	},
	{
		name: 'g.locale',
		description: 'returns/sets g.locale of the guild',
		super_description: '**g.locale**, returns/sets guild locale makes the bot talk your language and all communication is done' +
			'in your local language',
		example: '&g.locale',
		args: 'en/gr/de',
		get: (
			voice_channel: VoiceChannel | undefined | null, voice_object: VoiceChannelPrtl | undefined | null,
			portal_object_list: PortalChannelPrtl[] | undefined | null, guild_object: GuildPrtl, guild: Guild
		): string => {
			return LocaleEnum[guild_object.locale];
		},
		set: (
			voice_channel: VoiceChannel, voice_object: VoiceChannelPrtl, portal_object: PortalChannelPrtl,
			guild_object: GuildPrtl, value: string, member_object: MemberPrtl | undefined
		): Promise<ReturnPormise> => {
			const ctgr = ['g'];
			const attr = 'locale';

			return new Promise((resolve) => {
				const locale = get_key_from_enum(value, LocaleEnum);

				if (locale !== undefined) {
					update_guild(guild_object.id, attr, locale)
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
						value: `attribute ${ctgr.join('.') + '.' + attr} can only be **${LocaleList.join(', ')}**`
					});
				}
			});
		},
		auth: AuthEnum.admin
	},
	{
		name: 'p.locale',
		description: 'returns/sets p.locale of current channel',
		super_description: '**p.locale**, returns/sets language used in statuses',
		example: '&p.locale',
		args: 'en/gr/de',
		get: (
			voice_channel: VoiceChannel | undefined | null, voice_object: VoiceChannelPrtl | undefined | null,
			portal_object_list: PortalChannelPrtl[] | undefined | null, guild_object: GuildPrtl, guild: Guild
		): string => {
			if (!voice_object) {
				return 'must be in voice channel';
			}
			if (!portal_object_list) {
				return 'must be in portal channel';
			}

			const portal_object = portal_object_list.find(portal =>
				portal.voice_list.some(voice =>
					voice.id === voice_object.id)
			);

			if (portal_object) {
				return LocaleEnum[portal_object.locale];
			}

			return 'ERROR';
		},
		set: (
			voice_channel: VoiceChannel, voice_object: VoiceChannelPrtl, portal_object: PortalChannelPrtl,
			guild_object: GuildPrtl, value: string, member_object: MemberPrtl | undefined
		): Promise<ReturnPormise> => {
			const ctgr = ['p'];
			const attr = 'locale';

			return new Promise((resolve) => {
				const locale = get_key_from_enum(value, LocaleEnum);

				if (locale !== undefined) {
					update_portal(guild_object.id, portal_object.id, attr, locale)
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
						value: `attribute ${ctgr.join('.') + '.' + attr} can only be **${LocaleList.join(', ')}**`
					});
				}
			});
		},
		auth: AuthEnum.portal
	},
	{
		name: 'v.locale',
		description: 'returns/sets v.locale of current channel',
		super_description: '**v.locale**, returns/sets language used in statuses',
		example: '&v.locale',
		args: 'en/gr/de',
		get: (
			voice_channel: VoiceChannel | undefined | null, voice_object: VoiceChannelPrtl | undefined | null,
			portal_object_list: PortalChannelPrtl[] | undefined | null, guild_object: GuildPrtl, guild: Guild
		): string => {
			if (!voice_object) {
				return 'must be in voice channel';
			}

			return LocaleEnum[voice_object.locale];
		},
		set: (
			voice_channel: VoiceChannel, voice_object: VoiceChannelPrtl, portal_object: PortalChannelPrtl,
			guild_object: GuildPrtl, value: string, member_object: MemberPrtl | undefined
		): Promise<ReturnPormise> => {
			const ctgr = ['v'];
			const attr = 'locale';

			return new Promise((resolve) => {
				const locale = get_key_from_enum(value, LocaleEnum);

				if (locale !== undefined) {
					update_voice(guild_object.id, portal_object.id, voice_object.id, attr, locale)
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
						value: `attribute ${ctgr.join('.') + '.' + attr} can only be **${LocaleList.join(', ')}**`
					});
				}

			});
		},
		auth: AuthEnum.voice
	},
	{
		name: 'v.position',
		description: 'returns/sets the position of the voice channel',
		super_description: '**v.position**, returns/sets the position of the voice channel',
		example: '&v.position',
		args: '!v.position_of_channel',
		get: (
			voice_channel: VoiceChannel | undefined | null, voice_object: VoiceChannelPrtl | undefined | null,
			portal_object_list: PortalChannelPrtl[] | undefined | null, guild_object: GuildPrtl, guild: Guild
		): number | string => {
			if (!voice_channel) {
				return 'must be in voice channel';
			}

			return voice_channel.position;
		},
		set: (
			voice_channel: VoiceChannel, voice_object: VoiceChannelPrtl, portal_object: PortalChannelPrtl,
			guild_object: GuildPrtl, value: string, member_object: MemberPrtl | undefined
		): Promise<ReturnPormise> => {
			const ctgr = ['v'];
			const attr = 'position';

			return new Promise((resolve) => {
				if (isNaN(Number(value))) {
					return resolve({
						result: false,
						value: `attribute ${ctgr.join('.') + '.' + attr} can only be **a number**`
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
		auth: AuthEnum.voice
	},
	{
		name: 'p.regex_overwrite',
		description: 'returns/sets your personal voice channel regex',
		super_description: '**p.regex_overwrite**, returns/sets your personal voice channel regex',
		example: '&p.regex_overwrite',
		args: '!true/false',
		get: (
			voice_channel: VoiceChannel | undefined | null, voice_object: VoiceChannelPrtl | undefined | null,
			portal_object_list: PortalChannelPrtl[] | undefined | null, guild_object: GuildPrtl, guild: Guild
		): boolean | string => {
			if (!voice_object) {
				return 'must be in voice channel';
			}
			if (!portal_object_list) {
				return 'must be in portal channel';
			}

			const portal_object = portal_object_list.find(portal =>
				portal.voice_list.some(voice =>
					voice.id === voice_object.id)
			);

			if (portal_object) {
				return portal_object.regex_overwrite;
			}

			return 'ERROR';
		},
		set: (
			voice_channel: VoiceChannel, voice_object: VoiceChannelPrtl, portal_object: PortalChannelPrtl,
			guild_object: GuildPrtl, value: string, member_object: MemberPrtl | undefined
		): Promise<ReturnPormise> => {
			const ctgr = ['p'];
			const attr = 'regex_overwrite';

			return new Promise((resolve) => {
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
						value: `attribute ${ctgr.join('.') + '.' + attr} can only be **true or false**`
					});
				}
			});
		},
		auth: AuthEnum.voice
	},
	{
		name: 'p.regex',
		description: 'returns/sets title-guidelines of portal channel',
		super_description: '**p.regex**, returns/sets title-guidelines of portal channel',
		example: '&p.regex',
		args: '!regex',
		get: (
			voice_channel: VoiceChannel | undefined | null, voice_object: VoiceChannelPrtl | undefined | null,
			portal_object_list: PortalChannelPrtl[] | undefined | null, guild_object: GuildPrtl, guild: Guild
		): string => {
			if (!voice_object) {
				return 'must be in voice channel';
			}
			if (!portal_object_list) {
				return 'must be in portal channel';
			}

			const portal_object = portal_object_list.find(portal =>
				portal.voice_list.some(voice =>
					voice.id === voice_object.id)
			);

			if (portal_object) {
				return portal_object.regex_portal;
			}

			return 'ERROR';
		},
		set: (
			voice_channel: VoiceChannel, voice_object: VoiceChannelPrtl, portal_object: PortalChannelPrtl,
			guild_object: GuildPrtl, value: string, member_object: MemberPrtl | undefined
		): Promise<ReturnPormise> => {
			const ctgr = ['p'];
			const attr = 'regex_portal';

			return new Promise((resolve) => {
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
		auth: AuthEnum.portal
	},
	{
		name: 'p.v.regex',
		description: 'returns/sets the default title for created voice channels',
		super_description: '**p.v.regex**, returns/sets the default title for created voice channels',
		example: '&p.v.regex',
		args: '!regex',
		get: (
			voice_channel: VoiceChannel | undefined | null, voice_object: VoiceChannelPrtl | undefined | null,
			portal_object_list: PortalChannelPrtl[] | undefined | null, guild_object: GuildPrtl, guild: Guild
		): string => {
			if (!voice_object) {
				return 'must be in voice channel';
			}
			if (!portal_object_list) {
				return 'must be in portal channel';
			}

			const portal_object = portal_object_list.find(portal =>
				portal.voice_list.some(voice =>
					voice.id === voice_object.id)
			);

			if (portal_object) {
				return portal_object.regex_voice;
			}

			return 'ERROR';
		},
		set: (
			voice_channel: VoiceChannel, voice_object: VoiceChannelPrtl, portal_object: PortalChannelPrtl,
			guild_object: GuildPrtl, value: string, member_object: MemberPrtl | undefined
		): Promise<ReturnPormise> => {
			const ctgr = ['p', 'v'];
			const attr = 'regex_voice';

			return new Promise((resolve) => {
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
		auth: AuthEnum.portal
	},
	{
		name: 'v.regex',
		description: 'returns/sets the title for current voice channel',
		super_description: '**v.regex**, returns/sets the title for current voice channel',
		example: '&v.regex',
		args: '!v.regex',
		get: (
			voice_channel: VoiceChannel | undefined | null, voice_object: VoiceChannelPrtl | undefined | null,
			portal_object_list: PortalChannelPrtl[] | undefined | null, guild_object: GuildPrtl, guild: Guild
		): string => {
			if (!voice_object) {
				return 'must be in voice channel';
			}

			return voice_object.regex;
		},
		set: (
			voice_channel: VoiceChannel, voice_object: VoiceChannelPrtl, portal_object: PortalChannelPrtl,
			guild_object: GuildPrtl, value: string, member_object: MemberPrtl | undefined
		): Promise<ReturnPormise> => {
			const ctgr = ['v'];
			const attr = 'regex';

			return new Promise((resolve) => {
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
		auth: AuthEnum.voice
	},
	{
		name: 'm.regex',
		description: 'returns/sets your personal voice channel regex',
		super_description: '**m.regex**, returns/sets your personal voice channel regex',
		example: '&m.regex',
		args: '!m.regex',
		get: (
			voice_channel: VoiceChannel | undefined | null, voice_object: VoiceChannelPrtl | undefined | null,
			portal_object_list: PortalChannelPrtl[] | undefined | null, guild_object: GuildPrtl, guild: Guild,
			member_object: MemberPrtl | undefined
		): string => {
			return (member_object && member_object.regex)
				? member_object.regex
				: 'not-set';
		},
		set: (
			voice_channel: VoiceChannel, voice_object: VoiceChannelPrtl, portal_object: PortalChannelPrtl,
			guild_object: GuildPrtl, value: string, member_object: MemberPrtl | undefined
		): Promise<ReturnPormise> => {
			const ctgr = ['m'];
			const attr = 'regex';

			return new Promise((resolve) => {
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
		auth: AuthEnum.none
	},
	{
		name: 'p.user_limit',
		description: 'returns/sets maximum number of members guideline for portal',
		super_description: '**p.user_limit**, returns/sets maximum number of members guideline for portal',
		example: '&p.user_limit',
		args: '!number of maximum members (0 is infinite)',
		get: (
			voice_channel: VoiceChannel | undefined | null, voice_object: VoiceChannelPrtl | undefined | null,
			portal_object_list: PortalChannelPrtl[] | undefined | null, guild_object: GuildPrtl, guild: Guild
		): number | string => {
			if (!voice_object) {
				return 'must be in voice channel';
			}
			if (!portal_object_list) {
				return 'must be in portal channel';
			}

			const portal_object = portal_object_list.find(portal =>
				portal.voice_list.some(voice =>
					voice.id === voice_object.id)
			);

			if (portal_object) {
				return portal_object.user_limit_portal;
			}

			return 'ERROR';
		},
		set: (
			voice_channel: VoiceChannel, voice_object: VoiceChannelPrtl,
			portal_object: PortalChannelPrtl, guild_object: GuildPrtl, value: number
		): Promise<ReturnPormise> => {
			const ctgr = ['p'];
			const attr = 'user_limit_portal';
			const new_user_limit = Number(value);

			return new Promise((resolve) => {
				if (isNaN(new_user_limit)) {
					return resolve({
						result: false,
						value: `attribute ${ctgr.join('.') + '.' + attr} can only be **a number from 0-n (0 means unlimited)**`
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
		auth: AuthEnum.portal
	},
	{
		name: 'v.user_limit',
		description: 'returns/sets maximum number of members allowed',
		super_description: '**v.user_limit**, returns/sets maximum number of members allowed',
		example: '&v.user_limit',
		args: '!number of maximum members (0 is infinite)',
		get: (
			voice_channel: VoiceChannel | undefined | null, voice_object: VoiceChannelPrtl | undefined | null,
			portal_object_list: PortalChannelPrtl[] | undefined | null, guild_object: GuildPrtl, guild: Guild
		): number | string => {
			if (!voice_channel) {
				return 'must be in voice channel';
			}

			return voice_channel.userLimit;
		},
		set: (
			voice_channel: VoiceChannel, voice_object: VoiceChannelPrtl,
			portal_object: PortalChannelPrtl, guild_object: GuildPrtl, value: number
		): Promise<ReturnPormise> => {
			const ctgr = ['v'];
			const attr = 'user_limit';
			const new_user_limit = Number(value);

			return new Promise((resolve) => {
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
						value: `attribute ${ctgr.join('.') + '.' + attr} can only be **a number from 0-n (0 means unlimited)**`
					});
				}
			});
		},
		auth: AuthEnum.voice,
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
					{ emote: 'Clearance', role: '' + AuthEnum[attr.auth] + '', inline: false }
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
};

export function get_attribute(
	voice_channel: VoiceChannel | undefined | null, voice_object: VoiceChannelPrtl | undefined | null,
	portal_object_list: PortalChannelPrtl[] | undefined | null, guild_object: GuildPrtl,
	guild: Guild, attr: string, member_object: MemberPrtl | undefined
): string | number | boolean {

	for (let l = 0; l < attributes.length; l++) {
		if (attr === attributes[l].name) {
			return attributes[l].get(
				voice_channel, voice_object, portal_object_list, guild_object, guild
			);
		}
	}
	return -1;
};

// export function get_attribute(
// 	voice_channel: VoiceChannel, voice_object: VoiceChannelPrtl, portal_object: PortalChannelPrtl,
// 	guild_object: GuildPrtl, candidate: string, member_object: MemberPrtl | undefined | undefined
// ): string | number | boolean {
// 	for (let l = 0; l < attributes.length; l++) {
// 		if (candidate === attributes[l].name) {
// 			return attributes[l].get(voice_channel, voice_object, portal_object_list, guild_object, member_object);
// 		}
// 	}
// 	return -1;
// };

export function set_attribute(
	voice_channel: VoiceChannel | undefined | null, guild_object: GuildPrtl,
	candidate: string, value: any, member: GuildMember
): Promise<ReturnPormise> {
	return new Promise((resolve) => {
		let voice_object: VoiceChannelPrtl | undefined = undefined;
		let portal_object: PortalChannelPrtl | undefined = undefined;

		for (let l = 0; l < attributes.length; l++) {
			if (candidate === attributes[l].name) {
				switch (attributes[l].auth) {
					case AuthEnum.admin:
						if (!is_authorised(member)) {
							return resolve({
								result: false,
								value: `attribute ${candidate} can only be **set by an administrator**`
							});
						}

						break;
					case AuthEnum.none:
						// passes through no checks needed
						break;
					default:
						if (!voice_channel) {
							return resolve({
								result: false,
								value: 'you must be in a channel handled by Portal'
							});
						}

						for (let i = 0; i < guild_object.portal_list.length; i++) {
							for (let j = 0; j < guild_object.portal_list[i].voice_list.length; j++) {
								if (guild_object.portal_list[i].voice_list[j].id === voice_channel.id) {
									portal_object = guild_object.portal_list[i];
									voice_object = guild_object.portal_list[i].voice_list[j];

									break;
								}
							}
						}

						if (!portal_object || !voice_object) {
							return resolve({
								result: false,
								value: 'you must be in a channel handled by Portal'
							});
						}

						if (attributes[l].auth === AuthEnum.portal) {
							if (portal_object.creator_id !== member.id) {
								return resolve({
									result: false,
									value: `attribute ${candidate} can only be **set by the portal creator**`
								});
							}
						} else if (attributes[l].auth === AuthEnum.voice) {
							if (voice_object.creator_id !== member.id) {
								return resolve({
									result: false,
									value: `attribute ${candidate} can only be **set by the voice creator**`
								});
							}
						}

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
			} else if (l + 1 === attributes.length) {
				return resolve({
					result: false,
					value: `${candidate} is not an attribute`
				});
			}
		}
	});
};