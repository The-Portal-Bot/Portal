import { Guild, GuildMember, Message, MessageEmbed, VoiceChannel } from 'discord.js';
import { AuthEnum } from '../../data/enums/Admin.enum';
import { LocaleEnum, LocaleList } from '../../data/enums/Locales.enum';
import { ProfanityLevelEnum, ProfanityLevelList } from '../../data/enums/ProfanityLevel.enum';
import { RankSpeedEnum, RankSpeedList } from '../../data/enums/RankSpeed.enum';
import { create_rich_embed, get_key_from_enum, is_authorised } from '../../libraries/help.library';
import { update_guild, update_member, update_portal, update_voice } from '../../libraries/mongo.library';
import { GuildPrtl } from '../classes/GuildPrtl.class';
import { MemberPrtl } from '../classes/MemberPrtl.class';
import { PortalChannelPrtl } from '../classes/PortalChannelPrtl.class';
import { Field, InterfaceBlueprint, ReturnPormise } from '../classes/TypesPrtl.interface';
import { VoiceChannelPrtl } from '../classes/VoiceChannelPrtl.class';

const portal_url = 'https://portal-bot.xyz/docs';
const interpreter_url = '/interpreter/objects';
export const attribute_prefix = '&';

const attributes: InterfaceBlueprint[] = [
	{
		name: 'p.ann_announce',
		get: (
			voice_channel: VoiceChannel | undefined | null, voice_object: VoiceChannelPrtl | undefined | null,
			portal_object_list: PortalChannelPrtl[] | undefined | null // , guild_object: GuildPrtl, guild: Guild
		): boolean | string => {
			if (!voice_object) {
				return 'N/A';
			}

			if (!portal_object_list) {
				return 'N/A';
			}

			const portal_object = portal_object_list.find(portal =>
				portal.voice_list.some(voice => voice.id === voice_object.id)
			);

			if (portal_object) {
				return portal_object.ann_announce;
			}

			return 'N/A';
		},
		set: (
			voice_channel: VoiceChannel, voice_object: VoiceChannelPrtl, portal_object: PortalChannelPrtl,
			guild_object: GuildPrtl, value: string // , member_object: MemberPrtl | undefined
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
									: `attribute ${ctgr.join('.') + '.' + attr} failed to be set`
							});
						})
						.catch(e => {
							return resolve({
								result: false,
								value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set / ${e}`
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
								value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set / ${e}`
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
		get: (
			voice_channel: VoiceChannel | undefined | null, voice_object: VoiceChannelPrtl | undefined | null,
			// portal_object_list: PortalChannelPrtl[] | undefined | null, guild_object: GuildPrtl, guild: Guild
		): boolean | string => {
			if (!voice_object) {
				return 'N/A';
			}

			return voice_object.ann_announce;
		},
		set: (
			voice_channel: VoiceChannel, voice_object: VoiceChannelPrtl, portal_object: PortalChannelPrtl,
			guild_object: GuildPrtl, value: string // , member_object: MemberPrtl | undefined
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
									: `attribute ${ctgr.join('.') + '.' + attr} failed to be set`
							});
						})
						.catch(e => {
							return resolve({
								result: false,
								value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set / ${e}`
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
									: `attribute ${ctgr.join('.') + '.' + attr} failed to be set`
							});
						})
						.catch(e => {
							return resolve({
								result: false,
								value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set / ${e}`
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
		get: (
			voice_channel: VoiceChannel | undefined | null, voice_object: VoiceChannelPrtl | undefined | null,
			portal_object_list: PortalChannelPrtl[] | undefined | null // , guild_object: GuildPrtl, guild: Guild
		): boolean | string => {
			if (!voice_object) {
				return 'N/A';
			}
			if (!portal_object_list) {
				return 'N/A';
			}

			const portal_object = portal_object_list.find(portal =>
				portal.voice_list.some(voice =>
					voice.id === voice_object.id)
			);

			if (portal_object) {
				return portal_object.no_bots;
			}

			return 'N/A';
		},
		set: (
			voice_channel: VoiceChannel, voice_object: VoiceChannelPrtl, portal_object: PortalChannelPrtl,
			guild_object: GuildPrtl, value: string // , member_object: MemberPrtl | undefined
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
									: `attribute ${ctgr.join('.') + '.' + attr} failed to be set`
							});
						})
						.catch(e => {
							return resolve({
								result: false,
								value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set / ${e}`
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
								value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set / ${e}`
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
		get: (
			voice_channel: VoiceChannel | undefined | null, voice_object: VoiceChannelPrtl | undefined | null,
			// portal_object_list: PortalChannelPrtl[] | undefined | null, guild_object: GuildPrtl, guild: Guild
		): boolean | string => {
			if (!voice_object) {
				return 'N/A';
			}

			return voice_object.no_bots;
		},
		set: (
			voice_channel: VoiceChannel, voice_object: VoiceChannelPrtl, portal_object: PortalChannelPrtl,
			guild_object: GuildPrtl, value: string // , member_object: MemberPrtl | undefined
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
									: `attribute ${ctgr.join('.') + '.' + attr} failed to be set`
							});
						})
						.catch(e => {
							return resolve({
								result: false,
								value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set / ${e}`
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
									: `attribute ${ctgr.join('.') + '.' + attr} failed to be set`
							});
						})
						.catch(e => {
							return resolve({
								result: false,
								value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set / ${e}`
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
		get: (
			voice_channel: VoiceChannel | undefined | null, voice_object: VoiceChannelPrtl | undefined | null,
			portal_object_list: PortalChannelPrtl[] | undefined | null // , guild_object: GuildPrtl, guild: Guild
		): boolean | string => {
			if (!voice_object) {
				return 'N/A';
			}
			if (!portal_object_list) {
				return 'N/A';
			}

			const portal_object = portal_object_list.find(portal =>
				portal.voice_list.some(voice =>
					voice.id === voice_object.id)
			);

			if (portal_object) {
				return portal_object.render;
			}

			return 'N/A';
		},
		set: (
			voice_channel: VoiceChannel, voice_object: VoiceChannelPrtl, portal_object: PortalChannelPrtl,
			guild_object: GuildPrtl, value: string // , member_object: MemberPrtl | undefined
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
									: `attribute ${ctgr.join('.') + '.' + attr} failed to be set`
							});
						})
						.catch(e => {
							return resolve({
								result: false,
								value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set / ${e}`
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
								value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set / ${e}`
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
		get: (
			voice_channel: VoiceChannel | undefined | null, voice_object: VoiceChannelPrtl | undefined | null,
			// portal_object_list: PortalChannelPrtl[] | undefined | null, guild_object: GuildPrtl, guild: Guild
		): boolean | string => {
			if (!voice_object) {
				return 'N/A';
			}

			return voice_object.render;
		},
		set: (
			voice_channel: VoiceChannel, voice_object: VoiceChannelPrtl, portal_object: PortalChannelPrtl,
			guild_object: GuildPrtl, value: string// , member_object: MemberPrtl | undefined
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
									: `attribute ${ctgr.join('.') + '.' + attr} failed to be set`
							});
						})
						.catch(e => {
							return resolve({
								result: false,
								value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set / ${e}`
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
									: `attribute ${ctgr.join('.') + '.' + attr} failed to be set`
							});
						})
						.catch(e => {
							return resolve({
								result: false,
								value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set / ${e}`
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
		get: (
			voice_channel: VoiceChannel | undefined | null, voice_object: VoiceChannelPrtl | undefined | null,
			portal_object_list: PortalChannelPrtl[] | undefined | null // , guild_object: GuildPrtl, guild: Guild
		): boolean | string => {
			if (!voice_object) {
				return 'N/A';
			}
			if (!portal_object_list) {
				return 'N/A';
			}

			const portal_object = portal_object_list.find(portal =>
				portal.voice_list.some(voice =>
					voice.id === voice_object.id)
			);

			if (portal_object) {
				return portal_object.ann_user;
			}

			return 'N/A';
		},
		set: (
			voice_channel: VoiceChannel, voice_object: VoiceChannelPrtl, portal_object: PortalChannelPrtl,
			guild_object: GuildPrtl, value: string // , member_object: MemberPrtl | undefined
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
									: `attribute ${ctgr.join('.') + '.' + attr} failed to be set`
							});
						})
						.catch(e => {
							return resolve({
								result: false,
								value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set / ${e}`
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
								value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set / ${e}`
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
		get: (
			voice_channel: VoiceChannel | undefined | null, voice_object: VoiceChannelPrtl | undefined | null,
			// portal_object_list: PortalChannelPrtl[] | undefined | null, guild_object: GuildPrtl, guild: Guild
		): boolean | string => {
			if (!voice_object) {
				return 'N/A';
			}

			return voice_object.ann_user;
		},
		set: (
			voice_channel: VoiceChannel, voice_object: VoiceChannelPrtl, portal_object: PortalChannelPrtl,
			guild_object: GuildPrtl, value: string // , member_object: MemberPrtl | undefined
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
									: `attribute ${ctgr.join('.') + '.' + attr} failed to be set`
							});
						})
						.catch(e => {
							return resolve({
								result: false,
								value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set / ${e}`
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
									: `attribute ${ctgr.join('.') + '.' + attr} failed to be set`
							});
						})
						.catch(e => {
							return resolve({
								result: false,
								value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set / ${e}`
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
		get: (
			voice_channel: VoiceChannel
		): number => {
			return voice_channel.bitrate;
		},
		set: (
			voice_channel: VoiceChannel, voice_object: VoiceChannelPrtl, portal_object: PortalChannelPrtl,
			guild_object: GuildPrtl, value: string //, member_object: MemberPrtl | undefined
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
							value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set / ${e}`
						});
					});
			});
		},
		auth: AuthEnum.voice
	},
	{
		name: 'g.prefix',
		get: (
			voice_channel: VoiceChannel | undefined | null, voice_object: VoiceChannelPrtl | undefined | null,
			portal_object_list: PortalChannelPrtl[] | undefined | null, guild_object: GuildPrtl // , guild: Guild
		): string => {
			return guild_object.prefix;
		},
		set: (
			voice_channel: VoiceChannel, voice_object: VoiceChannelPrtl, portal_object: PortalChannelPrtl,
			guild_object: GuildPrtl, value: string // , member_object: MemberPrtl | undefined
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
								: `attribute ${ctgr.join('.') + '.' + attr} failed to be set`
						});
					})
					.catch(e => {
						return resolve({
							result: false,
							value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set / ${e}`
						});
					});
			});
		},
		auth: AuthEnum.admin
	},
	{
		name: 'g.rank_speed',
		get: (
			voice_channel: VoiceChannel | undefined | null, voice_object: VoiceChannelPrtl | undefined | null,
			portal_object_list: PortalChannelPrtl[] | undefined | null, guild_object: GuildPrtl // , guild: Guild
		): string => {
			return RankSpeedEnum[guild_object.rank_speed];
		},
		set: (
			voice_channel: VoiceChannel, voice_object: VoiceChannelPrtl, portal_object: PortalChannelPrtl,
			guild_object: GuildPrtl, value: string // , member_object: MemberPrtl | undefined
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
									: `attribute ${ctgr.join('.') + '.' + attr} failed to be set`
							});
						})
						.catch(e => {
							return resolve({
								result: false,
								value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set / ${e}`
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
		get: (
			voice_channel: VoiceChannel | undefined | null, voice_object: VoiceChannelPrtl | undefined | null,
			portal_object_list: PortalChannelPrtl[] | undefined | null, guild_object: GuildPrtl // , guild: Guild
		): string => {
			return ProfanityLevelEnum[guild_object.profanity_level];
		},
		set: (
			voice_channel: VoiceChannel, voice_object: VoiceChannelPrtl, portal_object: PortalChannelPrtl,
			guild_object: GuildPrtl, value: string // , member_object: MemberPrtl | undefined
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
									: `attribute ${ctgr.join('.') + '.' + attr} failed to be set`
							});
						})
						.catch(e => {
							return resolve({
								result: false,
								value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set / ${e}`
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
		name: 'g.initial_role',
		get: (
			voice_channel: VoiceChannel | undefined | null, voice_object: VoiceChannelPrtl | undefined | null,
			portal_object_list: PortalChannelPrtl[] | undefined | null, guild_object: GuildPrtl, guild: Guild
		): string => {
			if (!guild_object.initial_role || guild_object.initial_role === 'null') {
				return 'initial role has not been set yet 1';
			}

			const role = guild.roles.cache
				.find(r => r.id === guild_object.initial_role);

			if (role) {
				return `@${role.name}`;
			} else {
				return 'initial role has not been set yet 2';
			}
		},
		set: (
			voice_channel: VoiceChannel, voice_object: VoiceChannelPrtl, portal_object: PortalChannelPrtl,
			guild_object: GuildPrtl, value: string, member_object: MemberPrtl | undefined, message: Message
		): Promise<ReturnPormise> => {
			const ctgr = ['g'];
			const attr = 'initial_role';

			return new Promise((resolve) => {
				if (!message.guild) {
					return resolve({
						result: false,
						value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set as user guild could not be fetched`
					});
				}

				if (!message.mentions || !message.mentions.roles || message.mentions.roles.array().length === 0) {
					console.log(`${value} === 'null' :>> `, value === 'null');
					if (value === 'null') {
						update_guild(guild_object.id, attr, 'null')
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
									value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set / ${e}`
								});
							});
					} else {
						return resolve({
							result: false,
							value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set as no role was given`
						});
					}
				} else {
					const new_role = message.mentions.roles.first() || message.guild.roles.cache.get(value);

					if (new_role) {
						update_guild(guild_object.id, attr, new_role.id)
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
									value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set / ${e}`
								});
							});
					} else {
						return resolve({
							result: false,
							value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set as role could not be found`
						});
					}
				}
			});
		},
		auth: AuthEnum.admin
	},
	{
		name: 'g.locale',
		get: (
			voice_channel: VoiceChannel | undefined | null, voice_object: VoiceChannelPrtl | undefined | null,
			portal_object_list: PortalChannelPrtl[] | undefined | null, guild_object: GuildPrtl // , guild: Guild
		): string => {
			return LocaleEnum[guild_object.locale];
		},
		set: (
			voice_channel: VoiceChannel, voice_object: VoiceChannelPrtl, portal_object: PortalChannelPrtl,
			guild_object: GuildPrtl, value: string // , member_object: MemberPrtl | undefined
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
									: `attribute ${ctgr.join('.') + '.' + attr} failed to be set`
							});
						})
						.catch(e => {
							return resolve({
								result: false,
								value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set / ${e}`
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
		get: (
			voice_channel: VoiceChannel | undefined | null, voice_object: VoiceChannelPrtl | undefined | null,
			portal_object_list: PortalChannelPrtl[] | undefined | null // , guild_object: GuildPrtl, guild: Guild
		): string => {
			if (!voice_object) {
				return 'N/A';
			}
			if (!portal_object_list) {
				return 'N/A';
			}

			const portal_object = portal_object_list.find(portal =>
				portal.voice_list.some(voice =>
					voice.id === voice_object.id)
			);

			if (portal_object) {
				return LocaleEnum[portal_object.locale];
			}

			return 'N/A';
		},
		set: (
			voice_channel: VoiceChannel, voice_object: VoiceChannelPrtl, portal_object: PortalChannelPrtl,
			guild_object: GuildPrtl, value: string // , member_object: MemberPrtl | undefined
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
									: `attribute ${ctgr.join('.') + '.' + attr} failed to be set`
							});
						})
						.catch(e => {
							return resolve({
								result: false,
								value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set / ${e}`
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
		get: (
			voice_channel: VoiceChannel | undefined | null, voice_object: VoiceChannelPrtl | undefined | null,
			// portal_object_list: PortalChannelPrtl[] | undefined | null, guild_object: GuildPrtl, guild: Guild
		): string => {
			if (!voice_object) {
				return 'N/A';
			}

			return LocaleEnum[voice_object.locale];
		},
		set: (
			voice_channel: VoiceChannel, voice_object: VoiceChannelPrtl, portal_object: PortalChannelPrtl,
			guild_object: GuildPrtl, value: string // , member_object: MemberPrtl | undefined
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
									: `attribute ${ctgr.join('.') + '.' + attr} failed to be set`
							});
						})
						.catch(e => {
							return resolve({
								result: false,
								value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set / ${e}`
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
		get: (
			voice_channel: VoiceChannel | undefined | null // , voice_object: VoiceChannelPrtl | undefined | null,
			// portal_object_list: PortalChannelPrtl[] | undefined | null, guild_object: GuildPrtl, guild: Guild
		): number | string => {
			if (!voice_channel) {
				return 'N/A';
			}

			return voice_channel.position;
		},
		set: (
			voice_channel: VoiceChannel, voice_object: VoiceChannelPrtl, portal_object: PortalChannelPrtl,
			guild_object: GuildPrtl, value: string // , member_object: MemberPrtl | undefined
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
							value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set / ${e}`
						});
					});
			});
		},
		auth: AuthEnum.voice
	},
	{
		name: 'p.regex_overwrite',
		get: (
			voice_channel: VoiceChannel | undefined | null, voice_object: VoiceChannelPrtl | undefined | null,
			portal_object_list: PortalChannelPrtl[] | undefined | null // , guild_object: GuildPrtl, guild: Guild
		): boolean | string => {
			if (!voice_object) {
				return 'N/A';
			}
			if (!portal_object_list) {
				return 'N/A';
			}

			const portal_object = portal_object_list.find(portal =>
				portal.voice_list.some(voice =>
					voice.id === voice_object.id)
			);

			if (portal_object) {
				return portal_object.regex_overwrite;
			}

			return 'N/A';
		},
		set: (
			voice_channel: VoiceChannel, voice_object: VoiceChannelPrtl, portal_object: PortalChannelPrtl,
			guild_object: GuildPrtl, value: string // , member_object: MemberPrtl | undefined
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
								value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set / ${e}`
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
								value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set / ${e}`
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
		get: (
			voice_channel: VoiceChannel | undefined | null, voice_object: VoiceChannelPrtl | undefined | null,
			portal_object_list: PortalChannelPrtl[] | undefined | null // , guild_object: GuildPrtl, guild: Guild
		): string => {
			if (!voice_object) {
				return 'N/A';
			}
			if (!portal_object_list) {
				return 'N/A';
			}

			const portal_object = portal_object_list.find(portal =>
				portal.voice_list.some(voice =>
					voice.id === voice_object.id)
			);

			if (portal_object) {
				return portal_object.regex_portal;
			}

			return 'N/A';
		},
		set: (
			voice_channel: VoiceChannel, voice_object: VoiceChannelPrtl, portal_object: PortalChannelPrtl,
			guild_object: GuildPrtl, value: string // , member_object: MemberPrtl | undefined
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
							value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set / ${e}`
						});
					});
			});
		},
		auth: AuthEnum.portal
	},
	{
		name: 'p.v.regex',
		get: (
			voice_channel: VoiceChannel | undefined | null, voice_object: VoiceChannelPrtl | undefined | null,
			portal_object_list: PortalChannelPrtl[] | undefined | null // , guild_object: GuildPrtl, guild: Guild
		): string => {
			if (!voice_object) {
				return 'N/A';
			}
			if (!portal_object_list) {
				return 'N/A';
			}

			const portal_object = portal_object_list.find(portal =>
				portal.voice_list.some(voice =>
					voice.id === voice_object.id)
			);

			if (portal_object) {
				return portal_object.regex_voice;
			}

			return 'N/A';
		},
		set: (
			voice_channel: VoiceChannel, voice_object: VoiceChannelPrtl, portal_object: PortalChannelPrtl,
			guild_object: GuildPrtl, value: string // , member_object: MemberPrtl | undefined
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
							value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set / ${e}`
						});
					});
			});
		},
		auth: AuthEnum.portal
	},
	{
		name: 'v.regex',
		get: (
			voice_channel: VoiceChannel | undefined | null, voice_object: VoiceChannelPrtl | undefined | null,
			// portal_object_list: PortalChannelPrtl[] | undefined | null, guild_object: GuildPrtl, guild: Guild
		): string => {
			if (!voice_object) {
				return 'N/A';
			}

			return voice_object.regex;
		},
		set: (
			voice_channel: VoiceChannel, voice_object: VoiceChannelPrtl, portal_object: PortalChannelPrtl,
			guild_object: GuildPrtl, value: string // , member_object: MemberPrtl | undefined
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
							value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set / ${e}`
						});
					});
			});
		},
		auth: AuthEnum.voice
	},
	{
		name: 'm.regex',
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
								value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set / ${e}`
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
		get: (
			voice_channel: VoiceChannel | undefined | null, voice_object: VoiceChannelPrtl | undefined | null,
			portal_object_list: PortalChannelPrtl[] | undefined | null // , guild_object: GuildPrtl, guild: Guild
		): number | string => {
			if (!voice_object) {
				return 'N/A';
			}

			if (!portal_object_list) {
				return 'N/A';
			}

			const portal_object = portal_object_list.find(portal =>
				portal.voice_list.some(voice => voice.id === voice_object.id)
			);

			if (portal_object) {
				return portal_object.user_limit_portal;
			}

			return 'N/A';
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
						value: `attribute ${ctgr.join('.') + '.' + attr} can only be **a number from 0-99 (0 means unlimited)**`
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
								value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set / ${e}`
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
		get: (
			voice_channel: VoiceChannel | undefined | null // , voice_object: VoiceChannelPrtl | undefined | null,
			// portal_object_list: PortalChannelPrtl[] | undefined | null, guild_object: GuildPrtl, guild: Guild
		): number | string => {
			if (!voice_channel) {
				return 'N/A';
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
								value: `attribute ${ctgr.join('.') + '.' + attr} failed to be set / ${e}`
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
		const sub_str = String(candidate)
			.substring(1, (String(attributes[i].name).length + 1));

		if (sub_str == attributes[i].name) {
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
			emote: '1.\tIn any text channel execute command `./run`',
			role: './run just like channel name generation uses the text interpreter',
			inline: false
		},
		{
			emote: '2.\t`./run My set locale is = &g.locale`',
			role: './run executes the given text and replies with the processed output',
			inline: false
		},
		{
			emote: '3.\tAwait a reply from portal which will be gr, de or en',
			role: '*The replied string will look like this: `My set locale is = gr`*',
			inline: false
		},
		{
			emote: '4.\t`./set g.locale de` (no prefix & needed)',
			role: '*set command, updates the data of an attribute in this case **locale** to **de***',
			inline: false
		},
		{
			emote: '5.\tWait for portal response which will be inform you if it was executed without issues',
			role: '*portal will either confirm update or inform you of the error it faced*',
			inline: false
		}
	];

	return create_rich_embed(
		'Attribute Guide',
		'[Attributes](' + portal_url + interpreter_url + '/attributes/description) ' +
		'are options that can be manipulated by whomever has clearance.\n' +
		'How to use attributes with the Text Interpreter',
		'#FF5714',
		attr_array,
		null,
		null,
		null,
		null,
		null
	);
}

function get_link(attribute: string): string {
	const url = portal_url + interpreter_url + '/attributes';

	if (attribute.indexOf('g.') > -1) {
		return `${url}/detailed/global/${attribute}`
	} else if (attribute.indexOf('m.') > -1) {
		return `${url}/detailed/member/${attribute}`
	} else if (attribute.indexOf('p.') > -1) {
		return `${url}/detailed/portal/${attribute}`
	} else if (attribute.indexOf('v.') > -1) {
		return `${url}/detailed/voice/${attribute}`
	} else {
		return `${url}/description`
	}
}

export function get_attribute_help(): MessageEmbed[] {
	const attr_array: Field[][] = [];

	for (let l = 0; l <= attributes.length / 25; l++) {
		attr_array[l] = []
		for (let i = (24 * l); i < attributes.length && i < 24 * (l + 1); i++) {
			attr_array[l]
				.push({
					emote: `${i + 1}. ${attributes[i].name}`,
					role: `[description](${get_link(attributes[i].name)})`,
					inline: true
				});
		}
	}

	return attr_array
		.map((cmmd, index) => {
			if (index === 0) {
				return create_rich_embed(
					'Attributes',
					'[Attributes](' + portal_url + interpreter_url + '/attributes/description) ' +
					'are options that can be manipulated by whomever has clearance.\n' +
					'Prefix: ' + attribute_prefix,
					'#FF5714',
					attr_array[0],
					null,
					null,
					null,
					null,
					null
				)
			} else {
				return create_rich_embed(
					null,
					null,
					'#FF5714',
					attr_array[index],
					null,
					null,
					null,
					null,
					null
				)
			}
		});
}

export function get_attribute_help_super(
	candidate: string
): MessageEmbed | boolean {
	for (let i = 0; i < attributes.length; i++) {
		const attr = attributes[i];
		if (attr.name === candidate) {
			return create_rich_embed(
				attr.name,
				null,
				'#FF5714',
				[
					{ emote: `Type`, role: `Attribute`, inline: true },
					{ emote: `Prefix`, role: `${attribute_prefix}`, inline: true },
					{ emote: `Description`, role: `[${candidate} doc](${get_link(candidate)})`, inline: true }
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

export function get_attribute(
	voice_channel: VoiceChannel | undefined | null, voice_object: VoiceChannelPrtl | undefined | null,
	portal_object_list: PortalChannelPrtl[] | undefined | null, guild_object: GuildPrtl,
	guild: Guild, attr: string
): string | number | boolean {

	for (let l = 0; l < attributes.length; l++) {
		if (attr === attributes[l].name) {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
			return attributes[l].get(
				voice_channel, voice_object, portal_object_list, guild_object, guild
			);
		}
	}

	return -1;
}

export function set_attribute(
	voice_channel: VoiceChannel | undefined | null, guild_object: GuildPrtl,
	candidate: string, value: any, member: GuildMember, message: Message
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

				// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
				attributes[l]
					.set(voice_channel, voice_object, portal_object, guild_object, value, member_object, message)
					.then((r: ReturnPormise) => {
						return resolve(r);
					})
					.catch((e: any) => {
						return resolve({
							result: false,
							value: `attribute ${candidate} failed to be set / ${e}`
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
}