import { getVoiceConnection, joinVoiceChannel, VoiceConnection } from "@discordjs/voice";
import { Client, Collection, ColorResolvable, EmbedAuthorOptions, EmbedBuilder, Guild, GuildBasedChannel, GuildMember, Message, PermissionResolvable, TextBasedChannel, TextChannel, User, VoiceChannel } from "discord.js";
import moment from "moment";
import { createLogger, format } from "winston";
import { VideoSearchResult } from "yt-search";
import { PGuild, MusicData } from "../types/classes/PGuild.class";
import { Field, TimeElapsed } from "../types/classes/PTypes.interface";
import { createDiscordJSAdapter } from "./adapter.library";
// import { client_talk } from "./localisation.library";
import { fetchGuild, fetchGuildList, setMusicData } from "./mongo.library";

const idle_thumbnail = 'https://raw.githubusercontent.com/keybraker/' +
	'Portal/master/src/assets/img/empty_queue.png';

const deletedMessages = new WeakSet<Message>();
const deletedChannel = new WeakSet<GuildBasedChannel | TextBasedChannel>();
const deletedGuild = new WeakSet<Guild>();

export function isMessageDeleted(message: Message) {
  return deletedMessages.has(message);
}

export function markMessageAsDeleted(message: Message) {
  deletedMessages.add(message);
}

export function isChannelDeleted(channel: GuildBasedChannel | TextBasedChannel) {
  return deletedChannel.has(channel);
}

export function markChannelAsDeleted(channel: GuildBasedChannel) {
  deletedChannel.add(channel);
}

export function isGuildDeleted(guild: Guild) {
  return deletedGuild.has(guild);
}

export function markGuildAsDeleted(guild: Guild) {
  deletedGuild.add(guild);
}

export const logger = createLogger({
  format: format.combine(
    format.timestamp({
      format: 'DD-MM-YY HH:mm:ss'
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  defaultMeta: { service: 'portal' },
  // you can also add a mongo transport to store logs
  // in the database (there is a performance penalty)
  transports: []
});


export async function askForApproval(
  message: Message, requester: GuildMember, question: string
): Promise<boolean> {
  return new Promise((resolve, reject) => {
    message.channel
      .send(question)
      .then(question_msg => {
        let accepted = false;
        const filter = (m: Message) => m.author.id === requester.user.id;
        const collector = message.channel
          .createMessageCollector({ filter, time: 10000 });

        collector.on('collect', (m: Message) => {
          if (m.content === 'yes') {
            accepted = true;
            collector.stop();
          }
          else if (m.content === 'no') {
            collector.stop();
          }
        });

        collector.on('end', async collected => {
          for (const reply_message of collected.values()) {
            if (isMessageDeleted(reply_message)) {
              const deletedMessage = await reply_message
                .delete()
                .catch((e: any) => {
                  return reject(`failed to delete message: ${e}`);
                });

              if (deletedMessage) {
                markMessageAsDeleted(deletedMessage);
              }
            }
          }

          if (isMessageDeleted(question_msg)) {
            const deletedMessage = await question_msg
              .delete()
              .catch((e: any) => {
                return reject(`failed to delete message: ${e}`);
              });

            if (deletedMessage) {
              markMessageAsDeleted(deletedMessage);
            }
          }

          return resolve(accepted);
        });
      })
      .catch(e => {
        return reject(e);
      });
  });
}

export function getJsonFromString(
  str: string
): any | unknown {
  let data = null;

  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    data = JSON.parse(str);
  }
  catch (error) {
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return data;
}

export function maxString(
  abstract: string, max: number
): string {
  return abstract.length < max
    ? abstract
    : abstract.substring(0, max - 3) + '...';
}

export function getKeyFromEnum(
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  value: string, enumeration: any
): string | number | undefined {
  for (const e in enumeration) {
    if (e === value) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
      return enumeration[e];
    }
  }

  return undefined;
}

export function createMusicMessage(
  channel: TextChannel, pGuild: PGuild
): Promise<string> {
  return new Promise((resolve, reject) => {
    const music_message_emb = createEmbed(
      'Music Player',
      'Type and Portal will play it !',
      '#e60026',
      [
        { emote: 'Duration', role: '-', inline: true },
        { emote: 'Views', role: '-', inline: true },
        { emote: 'Pinned', role: pGuild.musicData.pinned ? 'yes' : 'no', inline: true },
        { emote: 'Queue', role: 'empty', inline: false },
        { emote: 'Latest Action', role: '```music message created```', inline: false }
      ],
      null,
      null,
      true,
      null,
      idle_thumbnail,
      'https://raw.githubusercontent.com/keybraker/Portal/master/src/assets/img/music.png'
    );

    channel
      .send({ embeds: [music_message_emb] })
      .then(sent_message => {
        sent_message.react('▶️')
          .catch((e: any) => {
            return reject(`failed to set remote: ${e}`);
          });
        sent_message.react('⏸')
          .catch((e: any) => {
            return reject(`failed to set remote: ${e}`);
          });
        sent_message.react('⏭')
          .catch((e: any) => {
            return reject(`failed to set remote: ${e}`);
          });
        sent_message.react('📌')
          .catch((e: any) => {
            return reject(`failed to set remote: ${e}`);
          });
        sent_message.react('📄')
          .catch((e: any) => {
            return reject(`failed to set remote: ${e}`);
          });
        sent_message.react('⬇️')
          .catch((e: any) => {
            return reject(`failed to set remote: ${e}`);
          });
        sent_message.react('🧹')
          .catch((e: any) => {
            return reject(`failed to set remote: ${e}`);
          });
        sent_message.react('🚪')
          .catch((e: any) => {
            return reject(`failed to set remote: ${e}`);
          });

        const music_data = new MusicData(
          channel.id,
          sent_message.id,
          pGuild.musicData.messageLyricsId
            ? pGuild.musicData.messageLyricsId
            : 'null',
          [],
          false
        );

        setMusicData(pGuild.id, music_data)
          .catch((e: any) => {
            return reject(`failed to set music data: ${e}`);
          });

        return resolve(sent_message.id);
      })
      .catch(() => {
        return reject('failed to send message to channel');
      });
  });
}

export function createMusicLyricsMessage(
  channel: TextChannel, pGuild: PGuild, messageId: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const music_lyrics_message_emb = createEmbed(
      'Lyrics 📄',
      '',
      '#e60026',
      null,
      null,
      null,
      false,
      null,
      null
    );

    channel
      .send({ embeds: [music_lyrics_message_emb] })
      .then(sent_message_lyrics => {
        const music_data = new MusicData(
          channel.id,
          messageId,
          sent_message_lyrics.id,
          [],
          false
        );

        setMusicData(pGuild.id, music_data)
          .catch((e: any) => {
            return reject(`failed to set music data: ${e}`);
          });

        return resolve(sent_message_lyrics.id);
      })
      .catch(e => {
        return reject(`failed to send message to channel: ${e}`);
      });
  });
}

export function updateMusicMessage(
  guild: Guild, pGuild: PGuild, yts: VideoSearchResult | undefined,
  status: string, animated = true
): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const guild_channel: GuildBasedChannel | undefined = guild.channels.cache
      .find(c => c.id === pGuild.musicData.channelId);

    if (!guild_channel) {
      return reject(`could not fetch channel`);
    }

    const channel: TextChannel = <TextChannel>guild_channel;

    if (!channel || !pGuild.musicData.messageId) {
      return reject(`could not find channel`);
    }

    const music_queue = pGuild.musicQueue ?
      pGuild.musicQueue.length > 1
        ? pGuild.musicQueue
          .map((v, i) => {
            if (i !== 0 && i < 6) {
              return (`${i}. ${maxString(v.title, 61)}`);
            } else if (i === 6) {
              return `_...${pGuild.musicQueue.length - 6} more_`;
            }
          })
          .filter(v => !!v)
          .join('\n')
        : 'empty'
      : 'empty';

    const music_message_emb = createEmbed(
      yts ? yts.title : 'Music Player',
      yts ? yts.url : 'Type and Portal will play it !',
      '#e60026',
      [
        { emote: 'Duration', role: yts ? yts.timestamp : '-', inline: true },
        { emote: 'Views', role: (yts ? yts.timestamp : 0) === 0 ? '-' : yts ? yts.views : '-', inline: true },
        { emote: 'Pinned', role: pGuild.musicData.pinned ? 'yes' : 'no', inline: true },
        // { emote: null, role: null, inline: true },
        { emote: 'Queue', role: music_queue, inline: false },
        // { emote: null, role: null, inline: true },
        { emote: 'Latest Action', role: '```' + status + '```', inline: false }
      ],
      null,
      null,
      true,
      null,
      yts ? yts.thumbnail : idle_thumbnail,
      animated
        ? 'https://raw.githubusercontent.com/keybraker/Portal/master/src/assets/img/music.gif'
        : 'https://raw.githubusercontent.com/keybraker/Portal/master/src/assets/img/music.png'
    );

    if (pGuild.musicData.messageId) {
      if (channel) {
        channel.messages
          .fetch(pGuild.musicData.messageId)
          .then((message: Message) => {
            message
              .edit({ embeds: [music_message_emb] })
              .then(() => {
                return resolve(true);
              })
              .catch(e => {
                return reject(`failed to edit messages: ${e}`);
              });
          })
          .catch(e => {
            return reject(`failed to fetch messages: ${e}`);
          });
      }
    }
  });
}

export function updateMusicLyricsMessage(
  guild: Guild, pGuild: PGuild, lyrics: string, url?: string
): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const guild_channel: GuildBasedChannel | undefined = guild.channels.cache
      .find(c => c.id === pGuild.musicData.channelId);

    if (!guild_channel) {
      return reject(`could not fetch channel`);
    }

    const channel: TextChannel = <TextChannel>guild_channel;

    if (!channel || !pGuild.musicData.messageId) {
      return reject(`could not find channel`);
    }

    const music_message_emb = createEmbed(
      `Lyrics 📄 ${url ? `at ${url}` : ''}`,
      maxString(lyrics, 2000),
      '#e60026',
      null,
      null,
      null,
      false,
      null,
      null
    );

    if (pGuild.musicData.messageLyricsId) {
      if (channel) {
        channel.messages
          .fetch(pGuild.musicData.messageLyricsId)
          .then((message: Message) => {
            message.edit({ embeds: [music_message_emb] })
              .then(() => {
                return resolve(true);
              })
              .catch(e => {
                return reject(`failed to edit messages: ${e}`);
              });
          })
          .catch(e => {
            return reject(`failed to fetch messages: ${e}`);
          });
      }
    }
  });
}

export async function joinUserVoiceChannelByReaction(
  guild: Guild, client: Client, pGuild: PGuild, user: User, announce_entrance: boolean
): Promise<VoiceConnection> {
  const guildMembers = await guild.members.fetch();

  if (!guildMembers) {
    return Promise.reject(`could not fetch members`);
  }

  const member = guildMembers.find(guildMember => !guildMember.user?.bot && guildMember.id === user.id);

  if (!member) {
    return Promise.reject(`could not find member`);
  }

  if (!member.voice) {
    return Promise.reject('you must be connected to a voice channel');
  }

  if (!member.voice.channel) {
    return Promise.reject('you must be connected to a voice channel');
  }

  let voiceConnection = await getVoiceConnection(member.voice.channel.id);
  const clientVoiceState = member.voice.channel.guild.voiceStates.cache.get(member.client.user.id);

  if (voiceConnection && clientVoiceState?.channelId === member.voice.channel?.id) {
    // member.voice.channel.guild.me?.voice.setDeaf();
    clientVoiceState.setDeaf(true);
  } else {
    voiceConnection = joinVoiceChannel({
      channelId: member.voice.channel.id,
      guildId: member.voice.channel.guild.id,
      adapterCreator: createDiscordJSAdapter(member.voice.channel as VoiceChannel),
    });

    if (!voiceConnection) {
      return Promise.reject('could not join voice channel');
    }

    // member.voice.channel.guild.me?.voice.setDeaf();
    if (clientVoiceState) {
      clientVoiceState.setDeaf(true);
    }
  }

  return voiceConnection;
}

export async function joinUserVoiceChannelByMessage(
  client: Client, message: Message, pGuild: PGuild, join = false
): Promise<VoiceConnection> {
  if (!message.member) {
    return Promise.reject('user could not be fetched for message');
  }

  if (!message.member.voice) {
    return Promise.reject('voice could not be fetched for member');
  }

  if (!message.member.voice.channel) {
    return Promise.reject('you aren\'t in a channel');
  }

  if (!message.guild) {
    return Promise.reject('guild could not be fetched for message');
  }

  if (!message.guild.voiceAdapterCreator) {
    return Promise.reject('voiceAdapterCreator could not be fetched for guild');
  }

  if (!pGuild) {
    return Promise.reject('could not find guild of message');
  }

  if (!client.voice) {
    return Promise.reject('could not fetch portal\'s voice connections');
  }

  let voiceConnection = await getVoiceConnection(message.member.voice.channel.id);
  const clientVoiceState = message.guild.voiceStates.cache.get(message.guild.client.user.id);

  if (voiceConnection && clientVoiceState?.channelId === message.member.voice.channel?.id) {
    // message.guild.me?.voice.setDeaf();
    clientVoiceState.setDeaf(true);
  } else {
    voiceConnection = await joinVoiceChannel({
      channelId: message.member.voice.channel.id,
      guildId: message.guild.id,
      adapterCreator: createDiscordJSAdapter(message.member.voice.channel as VoiceChannel),
    });

    if (!voiceConnection) {
      return Promise.reject('could not join voice channel');
    }

    // message.guild.me?.voice.setDeaf();
    if (clientVoiceState) {
      clientVoiceState.setDeaf(true);
    }
  }

  return voiceConnection;
}

export function createEmbed(
  title: string | null | undefined,
  description: string | null | undefined,
  colour: ColorResolvable | null | undefined,
  field_array: Field[] | null,
  thumbnail: string | null | undefined,
  member: GuildMember | null | undefined,
  from_bot: boolean | null | undefined,
  url: string | null | undefined,
  image: string | null | undefined,
  custom_gif?: string,
  author?: { name: string, icon: string },
  footer?: string,
): EmbedBuilder {
  const portal_icon_url: string = 'https://raw.githubusercontent.com/keybraker' +
		'/Portal/master/src/assets/img/portal_logo_spinr.gif';

  const rich_message = new EmbedBuilder();

  if (title) rich_message.setTitle(title);
  if (url) rich_message.setURL(url);
  if (colour) rich_message.setColor(colour);
  if (description) rich_message.setDescription(description);
  if (footer) rich_message.setFooter({ text: footer });
  if (from_bot) rich_message.setFooter({
    text: footer
      ? footer
      : 'Portal',
    iconURL: custom_gif
      ? custom_gif
      : portal_icon_url
  }).setTimestamp();
  if (thumbnail) rich_message.setThumbnail(thumbnail);
  if (image) rich_message.setImage(image);
  if (author) rich_message.setAuthor({
    name: author.name,
    iconURL: author.icon
    // url: 'https://discord.js.org'
  });
  if (field_array) {
    field_array.forEach(row => {
      rich_message
        .addFields({
          name: row.emote === '' || !row.emote
            ? `\u200b`
            : `__${row.emote}__`,
          value: row.role === '' || !row.role
            ? `\u200b`
            : `${row.role}`,
          inline: row.inline
        }
        );
    });
  }
  if (member && !author) {
    const url = member.user.avatarURL()
      ? member.user.avatarURL()
      : undefined;

    rich_message.setAuthor({
      name: member.displayName,
      value: url ? url.toString() : undefined,
      inline: undefined
    } as EmbedAuthorOptions
    );
  }

  return rich_message;
}

export function isUserAuthorised(
  member: GuildMember
): boolean {
  const administrator: PermissionResolvable = 'Administrator';

  if (member.permissions.has(administrator, true)) {
    return true;
  }

  if (member.roles.cache) {
    return member.roles.cache.some(r =>
      r.name.toLowerCase() === 'p.admin');
  }

  return false;
}

export function isUserDj(
  member: GuildMember
): boolean {
  if (member.roles.cache) {
    return member.roles.cache.some(r =>
      r.name.toLowerCase() === 'p.dj');
  }

  return false;
}

export function isUserIgnored(
  member: GuildMember
): boolean {
  return member.roles.cache.some(r =>
    r.name.toLowerCase() === 'p.ignore');
}

export function isMod(
  member: GuildMember | null
): boolean {
  if (member && member.roles.cache) {
    return member.roles.cache.some(r =>
      r.name.toLowerCase() === 'p.mod');
  }

  return false;
}

export function isWhitelist(
  member: GuildMember | null
): boolean {
  if (member && member.roles.cache) {
    return member.roles.cache.some(r =>
      r.name.toLowerCase() === 'p.whitelist');
  }

  return false;
}

export function messageHelp(
  type: string, argument: string, info = ''
): string {
  if (info !== '') info += '\n';
  return `${info} get help by typing \`./help ${argument}\`\n` +
		`*https://portal-bot.xyz/docs/${type}/detailed/${argument}*`;
}

export async function messageReply(
  status: boolean,
  message: Message,
  replyString: string,
  deleteSource = false,
  deleteReply = false,
  emotePass = '✔️',
  emoteFail = '❌'
): Promise<boolean> {
  if (!message) {
    return Promise.reject(`failed to find message`);
  }

  if (!isChannelDeleted(message.channel) && replyString !== null && replyString !== '') {
    const sentMessage = await message.reply(replyString)
      .catch(e => { return Promise.reject(`failed to send message: ${e}`); });

    if (!sentMessage) {
      return Promise.reject(`failed to send message`);
    }

    if (deleteReply) {
      const delay = (process.env.DELETE_DELAY as unknown as number) * 1000;
      setTimeout(async () => {
        if (isMessageDeleted(sentMessage)) {
          const deletedMessage = await sentMessage
            .delete()
            .catch((e: any) => {
              return Promise.reject(`failed to delete message: ${e}`);
            });

          if (deletedMessage) {
            markMessageAsDeleted(deletedMessage);
          }
        }
      }, delay);
    }
  }

  if (deleteSource) {
    const reaction = await message.react(status ? emotePass : emoteFail)
      .catch(e => { return Promise.reject(`failed to react to message: ${e}`); });

    if (!reaction) {
      return Promise.reject(`failed to react to message`);
    }

    const delay = (process.env.DELETE_DELAY as unknown as number) * 1000;
    setTimeout(async () => {
      if (isMessageDeleted(message)) {
        const deletedMessage = await message
          .delete()
          .catch((e: any) => {
            return Promise.reject(`failed to delete message: ${e}`);
          });

        if (deletedMessage) {
          markMessageAsDeleted(deletedMessage);
        }
      }
    }, delay);

    return true;
  }

  return false;
}

export function isUrl(
  potentialURL: string
): boolean {
  const pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
		'((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
		'((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
		'(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
		'(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
		'(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator

  return pattern.test(potentialURL);
}

export function pad(
  num: number
): string {
  return num.toString().length >= 2
    ? `${num}`
    : `0${num}`;
}

export function timeElapsed(
  timestamp: Date | number, timeout: number
): TimeElapsed {
  const timeoutTime = timeout * 60 * 1000;
  const el = moment
    .duration(moment()
      .diff(
        moment(typeof timestamp === 'number'
          ? timestamp
          : timestamp.getTime()
        )
      )
    );

  const timeoutMin = moment(timeoutTime).minutes();
  const timeoutSec = moment(timeoutTime).seconds();
  const remainingHrs = el.hours();
  const remainingMin = el.minutes();
  const remainingSec = el.seconds();

  return { timeoutMin, timeoutSec, remainingHrs, remainingMin, remainingSec }
}

// must get updated
export function removeDeletedChannels(
  guild: Guild
): Promise<boolean> {
  return new Promise((resolve) => {
    fetchGuild(guild.id)
      .then(pGuild => {
        if (pGuild) {
          pGuild.pChannels.forEach((p, index_p) => {
            if (!guild.channels.cache.some(c => c.id === p.id)) {
              pGuild.pChannels.splice(index_p, 1);
            }
            p.pVoiceChannels.forEach((v, index_v) => {
              if (!guild.channels.cache.some(c => c.id === v.id)) {
                p.pVoiceChannels.splice(index_v, 1);
              }
            });
          });

          pGuild.urlList.some((u_id, index_u) => {
            if (!guild.channels.cache.some(c => c.id === u_id)) {
              pGuild.urlList.splice(index_u, 1);
              return true;
            }

            return false;
          });

          pGuild.pRoles.forEach((r, index_r) => {
            !guild.channels.cache.some(c => {
              if (c instanceof TextChannel) {
                let found = false;
                c.messages
                  .fetch(r.messageId)
                  .then(() => {
                    // clear from emotes leave only those from portal
                    found = true;
                  })
                  .catch(() => {
                    pGuild.pRoles.splice(index_r, 1);
                  });

                return found;
              }

              return false;
            });
          });

          pGuild.pMembers.forEach((m, index_m) => {
            if (!guild.members.cache.some(m => m.id === m.id)) {
              pGuild.urlList.splice(index_m, 1);
            }
          });

          if (!guild.channels.cache.some(c => c.id === pGuild.musicData.channelId)) {
            pGuild.musicData.channelId = undefined;
            pGuild.musicData.messageId = undefined;
            pGuild.musicData.votes = undefined;
          }

          if (!guild.channels.cache.some(c => c.id === pGuild.announcement)) {
            pGuild.announcement = null;
          }

          return resolve(true);
        }

        return resolve(false);
      })
      .catch(() => {
        return resolve(false);
      });
  });
}

// must get updated
export async function removeEmptyVoiceChannels(
  guild: Guild
): Promise<boolean> {
  const guild_list = await fetchGuildList();
  if (!guild_list) {
    return false;
  }

  if (guild_list?.length === 0) {
    return true;
  }

  guild.channels.cache.forEach(channel => {
    guild_list.some(g =>
      g.pChannels.some(p =>
        p.pVoiceChannels.some((v, index) => {
          if (v.id === channel.id && (<Collection<string, GuildMember>>channel.members).size === 0) {
            channel
              .delete()
              .then(() => {
                p.pVoiceChannels.splice(index, 1);
                logger.log({
                  level: 'info', type: 'none', message: `deleted empty channel: ${channel.name} ` +
										`(${channel.id}) from ${channel.guild.name}`
                });
              })
              .catch(e => {
                logger.log({ level: 'error', type: 'none', message: `failed to send message: ${e}` });
              });
            return true;
          }
          return false
        })
      )
    );
  });

  return true;
}