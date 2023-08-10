import { getVoiceConnection, joinVoiceChannel, VoiceConnection } from '@discordjs/voice';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import {
  ChatInputCommandInteraction,
  Client,
  Collection,
  ColorResolvable,
  EmbedAuthorOptions,
  EmbedBuilder,
  Guild,
  GuildBasedChannel,
  GuildMember,
  Message,
  PermissionResolvable,
  TextBasedChannel,
  TextChannel,
  User,
  VoiceChannel,
} from 'discord.js';
import { createLogger, format, transports } from 'winston';
import { VideoSearchResult } from 'yt-search';
import { MusicData, PGuild } from '../types/classes/PGuild.class';
import { Field, TimeElapsed } from '../types/classes/PTypes.interface';
import { Locale } from '../types/enums/Locales.enum';
import { OpapGameId } from '../types/enums/OpapGames.enum';
import { ProfanityLevel } from '../types/enums/ProfanityLevel.enum';
import { RankSpeed } from '../types/enums/RankSpeed.enum';
import { createDiscordJSAdapter } from './adapter.library';
import { fetchGuild, fetchGuildList, setMusicData } from './mongo.library';
import commandConfig from '../config.command.json';

const idleThumbnail = 'https://raw.githubusercontent.com/keybraker/' + 'Portal/master/src/assets/img/emptyQueue.png';

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
      format: 'DD-MM-YY HH:mm:ss',
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  defaultMeta: { service: 'portal' },
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'error.log', level: 'error' }),
    new transports.File({ filename: 'combined.log' }),
  ],
});

export async function askForApproval(
  interaction: ChatInputCommandInteraction,
  requester: GuildMember,
  question: string
): Promise<boolean> {
  const questionMessage = await interaction.channel?.send(question);

  if (!questionMessage) {
    return false;
  }

  let accepted = false;
  const filter = (m: Message) => m.author.id === requester.user.id;
  const collector = interaction.channel?.createMessageCollector({ filter, time: 10000 });

  collector?.on('collect', (m: Message) => {
    if (m.content === 'yes') {
      accepted = true;
      collector?.stop();
    } else if (m.content === 'no') {
      collector?.stop();
    }
  });

  return new Promise((resolve) => {
    collector?.on('end', async (collected) => {
      for (const replyMessage of collected.values()) {
        if (isMessageDeleted(replyMessage)) {
          const deletedMessage = await replyMessage.delete();

          if (deletedMessage) {
            markMessageAsDeleted(deletedMessage);
          }
        }
      }

      if (isMessageDeleted(questionMessage)) {
        const deletedMessage = await questionMessage.delete();

        if (deletedMessage) {
          markMessageAsDeleted(deletedMessage);
        }
      }

      resolve(accepted);
    });
  }).then(() => accepted);
}

export function getJSONFromString(str: string) {
  let data = null;

  try {
    data = JSON.parse(str);
  } catch (error) {
    return null;
  }

  return data;
}

export function maxString(abstract: string, max: number): string {
  return abstract.length < max ? abstract : abstract.substring(0, max - 3) + '...';
}

type enumTypes = typeof OpapGameId | typeof RankSpeed | typeof ProfanityLevel | typeof Locale;
export function getKeyFromEnum(value: string, enumeration: enumTypes): string | number | undefined {
  let enumerationArray;

  switch (enumeration) {
  case OpapGameId:
    enumerationArray = Object.values(OpapGameId);
    break;
  case RankSpeed:
    enumerationArray = Object.values(RankSpeed);
    break;
  case ProfanityLevel:
    enumerationArray = Object.values(ProfanityLevel);
    break;
  case Locale:
    enumerationArray = Object.values(Locale);
    break;
  default:
    return undefined;
  }

  for (const enumerationValue of enumerationArray) {
    if (enumerationValue === value) {
      return enumerationValue;
    }
  }

  return undefined;
}

export async function createMusicMessage(channel: TextChannel, pGuild: PGuild): Promise<string> {
  const musicMessageEmb = createEmbed(
    'Music Player',
    'Type and Portal will play it !',
    '#e60026',
    [
      { emote: 'Duration', role: '-', inline: true },
      { emote: 'Views', role: '-', inline: true },
      { emote: 'Pinned', role: pGuild.musicData.pinned ? 'yes' : 'no', inline: true },
      { emote: 'Queue', role: 'empty', inline: false },
      { emote: 'Latest Action', role: '```music message created```', inline: false },
    ],
    null,
    null,
    true,
    null,
    idleThumbnail,
    'https://raw.githubusercontent.com/keybraker/Portal/master/src/assets/img/music.png'
  );

  const sentMessage = await channel.send({ embeds: [musicMessageEmb] })

  if (!sentMessage) {
    return 'failed to send message to channel';
  }

  const emojis = ['▶️', '⏸', '⏭', '📌', '📄', '⬇️', '🧹', '🚪'];

  for (const emoji of emojis) {
    sentMessage.react(emoji).catch((e) => logger.error(`failed to react to message: ${e}`));
  }

  const musicData = new MusicData(
    channel.id,
    sentMessage.id,
    pGuild.musicData.messageLyricsId ? pGuild.musicData.messageLyricsId : 'null',
    [],
    false
  );

  setMusicData(pGuild.id, musicData).catch((e) => logger.error(`failed to set music data: ${e}`));

  return sentMessage.id;
}

export async function createMusicLyricsMessage(channel: TextChannel, pGuild: PGuild, messageId: string): Promise<string | undefined> {
  const musicLyricsMessageEmb = createEmbed('Lyrics 📄', '', '#e60026', null, null, null, false, null, null);

  const sentMessageLyrics = await channel.send({ embeds: [musicLyricsMessageEmb] });

  if (!sentMessageLyrics) {
    return undefined;
  }

  const musicData = new MusicData(channel.id, messageId, sentMessageLyrics.id, [], false);
  await setMusicData(pGuild.id, musicData);

  return sentMessageLyrics.id;
}

export async function updateMusicMessage(
  guild: Guild,
  pGuild: PGuild,
  yts: VideoSearchResult | undefined,
  status: string,
  animated = true
): Promise<boolean> {
  const guildChannel: GuildBasedChannel | undefined = guild.channels.cache.find(
    (c) => c.id === pGuild.musicData.channelId
  );

  if (!guildChannel) {
    return false
  }

  const channel: TextChannel = <TextChannel>guildChannel;

  if (!channel || !pGuild.musicData.messageId) {
    return false
  }

  const musicQueue = pGuild.musicQueue
    ? pGuild.musicQueue.length > 1
      ? pGuild.musicQueue
        .map((v, i) => {
          if (i !== 0 && i < 6) {
            return `${i}. ${maxString(v.title, 61)}`;
          } else if (i === 6) {
            return `...${pGuild.musicQueue.length - 6} more`;
          }
        })
        .filter((v) => !!v)
        .join('\n')
      : 'empty'
    : 'empty';

  const musicMessageEmb = createEmbed(
    yts ? yts.title : 'Music Player',
    yts ? yts.url : 'Type and Portal will play it !',
    '#e60026',
    [
      { emote: 'Duration', role: yts ? yts.timestamp : '-', inline: true },
      { emote: 'Views', role: (yts ? yts.timestamp : 0) === 0 ? '-' : yts ? yts.views : '-', inline: true },
      { emote: 'Pinned', role: pGuild.musicData.pinned ? 'yes' : 'no', inline: true },
      // { emote: null, role: null, inline: true },
      { emote: 'Queue', role: musicQueue, inline: false },
      // { emote: null, role: null, inline: true },
      { emote: 'Latest Action', role: '```' + status + '```', inline: false },
    ],
    null,
    null,
    true,
    null,
    yts ? yts.thumbnail : idleThumbnail,
    animated
      ? 'https://raw.githubusercontent.com/keybraker/Portal/master/src/assets/img/music.gif'
      : 'https://raw.githubusercontent.com/keybraker/Portal/master/src/assets/img/music.png'
  );

  if (!pGuild.musicData.messageId || !channel) {
    return false;
  }

  const message = await channel.messages.fetch(pGuild.musicData.messageId);

  if (!message) {
    return false;
  }

  const messageEdit = await message.edit({ embeds: [musicMessageEmb] });

  return !!messageEdit;
}

export async function updateMusicLyricsMessage(guild: Guild, pGuild: PGuild, lyrics: string, url?: string): Promise<boolean> {
  const guildChannel = guild.channels.cache.find((c) => c.id === pGuild.musicData.channelId);

  if (!guildChannel) {
    return false;
  }

  const channel: TextChannel = <TextChannel>guildChannel;

  if (!channel || !pGuild.musicData.messageId) {
    return false;
  }

  const musicMessageEmb = createEmbed(
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

  if (!pGuild.musicData.messageLyricsId || !channel) {
    return false;
  }

  const fetchedMessage = await channel.messages.fetch(pGuild.musicData.messageLyricsId);

  if (!fetchedMessage) {
    return false;
  }

  const editedMessage = await fetchedMessage.edit({ embeds: [musicMessageEmb] });

  return !!editedMessage;
}

export async function joinUserVoiceChannelByReaction(
  guild: Guild,
  client: Client,
  pGuild: PGuild,
  user: User
  // announceEntrance: boolean
): Promise<VoiceConnection> {
  const guildMembers = await guild.members.fetch();

  if (!guildMembers) {
    return Promise.reject('could not fetch members');
  }

  const member = guildMembers.find((guildMember) => !guildMember.user?.bot && guildMember.id === user.id);

  if (!member) {
    return Promise.reject('could not find member');
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
export async function joinUserVoiceChannelByInteraction(
  client: Client,
  interaction: ChatInputCommandInteraction,
  pGuild: PGuild
  // join = false
): Promise<VoiceConnection> {
  const member = interaction.member as GuildMember;

  if (!member) {
    return Promise.reject('user could not be fetched for message');
  }

  if (!member.voice) {
    return Promise.reject('voice could not be fetched for member');
  }

  if (!member.voice.channel) {
    return Promise.reject('you aren\'t in a channel');
  }

  if (!interaction.guild) {
    return Promise.reject('guild could not be fetched for message');
  }

  if (!interaction.guild.voiceAdapterCreator) {
    return Promise.reject('voiceAdapterCreator could not be fetched for guild');
  }

  if (!pGuild) {
    return Promise.reject('could not find guild of message');
  }

  if (!client.voice) {
    return Promise.reject('could not fetch portal\'s voice connections');
  }

  let voiceConnection = await getVoiceConnection(member.voice.channel.id);
  const clientVoiceState = interaction.guild.voiceStates.cache.get(interaction.guild.client.user.id);

  if (voiceConnection && clientVoiceState?.channelId === member.voice.channel?.id) {
    // message.guild.me?.voice.setDeaf();
    clientVoiceState.setDeaf(true);
  } else {
    voiceConnection = await joinVoiceChannel({
      channelId: member.voice.channel.id,
      guildId: interaction.guild.id,
      adapterCreator: createDiscordJSAdapter(member.voice.channel as VoiceChannel),
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
  fieldArray: Field[] | null,
  thumbnail: string | null | undefined,
  member: GuildMember | null | undefined,
  fromBot: boolean | null | undefined,
  url: string | null | undefined,
  image: string | null | undefined,
  customGif?: string,
  author?: { name: string; icon: string },
  footer?: string
): EmbedBuilder {
  const portalIconUrl: string =
    'https://raw.githubusercontent.com/keybraker' + '/Portal/master/src/assets/img/portal_logo_spinr.gif';

  const richMessage = new EmbedBuilder();

  if (title) richMessage.setTitle(title);
  if (url) richMessage.setURL(url);
  if (colour) richMessage.setColor(colour);
  if (description) richMessage.setDescription(description);
  if (footer) richMessage.setFooter({ text: footer });
  if (fromBot)
    richMessage
      .setFooter({
        text: footer ?? 'Portal',
        iconURL: customGif ?? portalIconUrl,
      })
      .setTimestamp();
  if (thumbnail) richMessage.setThumbnail(thumbnail);
  if (image) richMessage.setImage(image);
  if (author)
    richMessage.setAuthor({
      name: author.name,
      iconURL: author.icon,
      // url: 'https://discord.js.org'
    });
  if (fieldArray) {
    fieldArray.forEach((row) => {
      richMessage.addFields({
        name: row.emote === '' || !row.emote ? '\u200b' : `${row.emote}`,
        value: row.role === '' || !row.role ? '\u200b' : `${row.role}`,
        inline: row.inline,
      });
    });
  }
  if (member && !author) {
    const url = member.user.avatarURL() ? member.user.avatarURL() : undefined;

    richMessage.setAuthor({
      name: member.displayName,
      value: url ? url.toString() : undefined,
      inline: undefined,
    } as EmbedAuthorOptions);
  }

  return richMessage;
}

export function isUserAuthorised(member: GuildMember): boolean {
  const administrator: PermissionResolvable = 'Administrator';

  if (member.permissions.has(administrator, true)) {
    return true;
  }

  if (member.roles.cache) {
    return member.roles.cache.some((r) => r.name.toLowerCase() === 'p.admin');
  }

  return false;
}

export function isUserDj(member: GuildMember): boolean {
  if (member.roles.cache) {
    return member.roles.cache.some((r) => r.name.toLowerCase() === 'p.dj');
  }

  return false;
}

export function isUserIgnored(member: GuildMember): boolean {
  return member.roles.cache.some((r) => r.name.toLowerCase() === 'p.ignore');
}

export function isMod(member: GuildMember | null): boolean {
  if (!member) {
    return false;
  }

  return member.guild.ownerId === member.id || member.roles.cache.some((r) => r.name.toLowerCase() === 'p.mod')
}

export function isWhitelist(member: GuildMember | null): boolean {
  if (member && member.roles.cache) {
    return member.roles.cache.some((r) => r.name.toLowerCase() === 'p.whitelist');
  }

  return false;
}

export function messageHelp(type: string, argument: string, info = ''): string {
  if (info !== '') info += '\n';
  return (
    `${info} get help by typing \`./help ${argument}\`\n` + `*https://portal-bot.xyz/docs/${type}/detailed/${argument}*`
  );
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
    return Promise.reject('failed to find message');
  }

  if (!isChannelDeleted(message.channel) && replyString !== null && replyString !== '') {
    const sentMessage = await message.reply(replyString).catch((e) => {
      return Promise.reject(`failed to send message: ${e}`);
    });

    if (!sentMessage) {
      return Promise.reject('failed to send message');
    }

    if (deleteReply) {
      const delay = (process.env.DELETE_DELAY as unknown as number) * 1000;
      setTimeout(async () => {
        if (isMessageDeleted(sentMessage)) {
          const deletedMessage = await sentMessage.delete().catch((e) => {
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
    const reaction = await message.react(status ? emotePass : emoteFail).catch((e) => {
      return Promise.reject(`failed to react to message: ${e}`);
    });

    if (!reaction) {
      return Promise.reject('failed to react to message');
    }

    const delay = (process.env.DELETE_DELAY as unknown as number) * 1000;
    setTimeout(async () => {
      if (isMessageDeleted(message)) {
        const deletedMessage = await message.delete().catch((e) => {
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

export function isUrl(potentialURL: string): boolean {
  const pattern = new RegExp(
    '^(https?:\\/\\/)?' + // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%.~+]*)*' + // port and path
    '(\\?[;&a-z\\d%.~+=-]*)?' + // query string
    '(\\#[-a-z\\d]*)?$',
    'i'
  ); // fragment locator

  return pattern.test(potentialURL);
}

export function pad(num: number): string {
  return num.toString().length >= 2 ? `${num}` : `0${num}`;
}

dayjs.extend(duration);
dayjs.extend(relativeTime);

export function timeElapsed(timestamp: Date | number, timeout: number): TimeElapsed {
  const timeoutTime = timeout * 60 * 1000;
  const el = dayjs.duration(dayjs().diff(dayjs(typeof timestamp === 'number' ? timestamp : timestamp.getTime())));

  const timeoutMin = dayjs.duration(timeoutTime).minutes();
  const timeoutSec = dayjs.duration(timeoutTime).seconds();
  const remainingHrs = el.hours();
  const remainingMin = el.minutes();
  const remainingSec = el.seconds();

  return { timeoutMin, timeoutSec, remainingHrs, remainingMin, remainingSec };
}

// must get updated
export async function removeDeletedChannels(guild: Guild): Promise<boolean> {
  const pGuild = await fetchGuild(guild.id)

  if (!pGuild) {
    return false;
  }

  pGuild.pChannels.forEach((portalChannel, indexP) => {
    if (!guild.channels.cache.some((channel) => channel.id === portalChannel.id)) {
      pGuild.pChannels.splice(indexP, 1);
    }
    portalChannel.pVoiceChannels.forEach((portalVoice, indexV) => {
      if (!guild.channels.cache.some((channel) => channel.id === portalVoice.id)) {
        portalChannel.pVoiceChannels.splice(indexV, 1);
      }
    });
  });

  pGuild.pURLs.some((uId, indexU) => {
    if (!guild.channels.cache.some((channel) => channel.id === uId)) {
      pGuild.pURLs.splice(indexU, 1);
      return true;
    }

    return false;
  });

  pGuild.pRoles.forEach((portalRole, indexR) => {
    !guild.channels.cache.some((channel) => {
      if (channel instanceof TextChannel) {
        let found = false;
        channel.messages
          .fetch(portalRole.messageId)
          .then(() => {
            // clear from emotes leave only those from portal
            found = true;
          })
          .catch(() => {
            pGuild.pRoles.splice(indexR, 1);
          });

        return found;
      }

      return false;
    });
  });

  pGuild.pMembers.forEach((portalMember, indexM) => {
    if (!guild.members.cache.some((m) => m.id === m.id)) {
      pGuild.pURLs.splice(indexM, 1);
    }
  });

  if (!guild.channels.cache.some((channel) => channel.id === pGuild.musicData.channelId)) {
    pGuild.musicData.channelId = undefined;
    pGuild.musicData.messageId = undefined;
    pGuild.musicData.votes = undefined;
  }

  if (!guild.channels.cache.some((channel) => channel.id === pGuild.announcement)) {
    pGuild.announcement = null;
  }

  return true;
}

// must get updated
export async function removeEmptyVoiceChannels(guild: Guild): Promise<boolean> {
  const guildList = await fetchGuildList({});

  if (!guildList) {
    return false;
  }

  if (guildList?.length === 0) {
    return true;
  }

  guild.channels.cache.forEach((channel) => {
    guildList.some((portalGuild) =>
      portalGuild.pChannels.some((portalChannel) =>
        portalChannel.pVoiceChannels.some((portalVoice, index) => {
          if (portalVoice.id === channel.id && (<Collection<string, GuildMember>>channel.members).size === 0) {
            channel
              .delete()
              .then(() => {
                portalChannel.pVoiceChannels.splice(index, 1);
                logger.log({
                  level: 'info',
                  type: 'none',
                  message: `deleted empty channel: ${channel.name} ` + `(${channel.id}) from ${channel.guild.name}`,
                });
              })
              .catch((e) => {
                logger.log({ level: 'error', type: 'none', message: `failed to send message: ${e}` });
              });
            return true;
          }
          return false;
        })
      )
    );
  });

  return true;
}

export function commandDescriptionByNameAndAuthenticationLevel(commandName: string, authenticationNeeded: boolean) {
  return authenticationNeeded
    ? commandConfig[1].commands.find((command) => command.name === commandName)?.description ?? commandName
    : commandConfig[0].commands.find((command) => command.name === commandName)?.description ?? commandName;
}