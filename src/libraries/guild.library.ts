import dayjs from 'dayjs';
import {
  CategoryChannel,
  CategoryChannelResolvable,
  ChannelType,
  ChatInputCommandInteraction,
  Collection,
  Guild,
  GuildChannelCreateOptions,
  GuildMember,
  Message,
  OverwriteResolvable,
  PermissionFlagsBits,
  PermissionsBitField,
  Role,
  TextChannel,
  VoiceBasedChannel,
  VoiceChannel,
  VoiceState
} from 'discord.js';
import voca from 'voca';
import { getAttribute, isAttribute } from '../interpreter/attribute.functions';
import { getPipe, isPipe } from '../interpreter/pipe.functions';
import { getVariable, isVariable } from '../interpreter/variable.functions';
import { PGuild } from '../types/classes/PGuild.class';
import { PChannel } from '../types/classes/PPortalChannel.class';
import { PVoiceChannel } from '../types/classes/PVoiceChannel.class';
import { PortalChannelType } from '../types/enums/PortalChannel.enum';
import { Prefix } from '../types/enums/Prefix.enum';
import { createMusicLyricsMessage, createMusicMessage, getJSONFromString, maxString } from './help.library';
import logger from '../utilities/log.library';
import { insertVoice } from './mongo.library';

function inlineOperator(str: string) {
  switch (str) {
  case '==':
    return (a: string, b: string) => a == b;
  case '===':
    return (a: string, b: string) => a === b;
  case '!=':
    return (a: string, b: string) => a != b;
  case '!==':
    return (a: string, b: string) => a !== b;
  case '>':
    return (a: string, b: string) => a > b;
  case '<':
    return (a: string, b: string) => a < b;
  case '>=':
    return (a: string, b: string) => a >= b;
  case '<=':
    return (a: string, b: string) => a <= b;
  default:
    return (a: string, b: string) => a == b;
  }
}

export function getOptions(
  guild: Guild,
  topic: string,
  canWrite = true,
  parent?: CategoryChannelResolvable,
  type: ChannelType = ChannelType.GuildText
) {
  return {
    parent: parent,
    permissionOverwrites: canWrite
      ? [
        {
          id: guild.id,
          deny: PermissionFlagsBits.SendMessages, //['SEND_MESSAGES'],
        },
      ]
      : [],
    topic: `by Portal, ${topic}`,
    type: type,
    nsfw: false,
  } as GuildChannelCreateOptions;
}

export function includedInPortalGuilds(guildId: string, pGuilds: PGuild[]): boolean {
  return pGuilds ? pGuilds.some((pGuild) => pGuild.id === guildId) : false;
}

export function includedInPChannels(channelId: string, pChannels: PChannel[]): boolean {
  return pChannels ? pChannels.some((p) => p.id === channelId) : false;
}

export function includedInVoiceList(channelId: string, pChannels: PChannel[]): boolean {
  return pChannels ? pChannels.some((p) => p.pVoiceChannels.some((v) => v.id === channelId)) : false;
}

export function includedInPIgnores(channelId: string, pGuild: PGuild): boolean {
  return pGuild.pIgnores ? pGuild.pIgnores.some((i) => i === channelId) : false;
}

export function isUrlOnlyChannel(channelId: string, pGuild: PGuild): boolean {
  return pGuild.pURLs ? pGuild.pURLs.some((u) => u === channelId) : false;
}

export function isMusicChannel(channelId: string, pGuild: PGuild): boolean {
  return pGuild ? pGuild.musicData.channelId === channelId : false;
}

export function isAnnouncementChannel(channelId: string, pGuild: PGuild): boolean {
  return pGuild ? pGuild.announcement === channelId : false;
}

export function getRole(guild: Guild | null, roleIdOrName: string): Role | undefined {
  return guild?.roles.cache.find((role) => role.id === roleIdOrName || role.name === roleIdOrName);
}

export async function createChannel(
  guild: Guild,
  channelName: string,
  channelOptions: GuildChannelCreateOptions,
  channelCategory: string | null
): Promise<string> {
  const newGuildChannel = await guild.channels.create({ ...channelOptions, name: channelName });

  if (!newGuildChannel) {
    return Promise.reject(new Error('failed to create new channel'));
  }

  if (typeof channelCategory === 'string') {
    // create category
    const newGuildCategoryChannel = await guild.channels.create({
      name: channelName,
      type: ChannelType.GuildCategory,
    }); // channelName

    if (!newGuildCategoryChannel) {
      return Promise.reject(new Error('failed to create new category channel'));
    }

    newGuildChannel.setParent(newGuildCategoryChannel).catch((e) => {
      return Promise.reject(`failed to set parent to channel: ${e}`);
    });
  }

  return newGuildChannel.id;
}

function createVoiceOptions(state: VoiceState, pChannel: PChannel): GuildChannelCreateOptions {
  let permissionOverwrites = null;
  if (pChannel.allowedRoles) {
    permissionOverwrites = pChannel.allowedRoles.map(
      (id) =>
        <OverwriteResolvable>{
          id,
          allow: PermissionsBitField.Flags.Connect, // ['CONNECT']
        }
    );

    if (!pChannel.allowedRoles.some((id) => id === state.guild.roles.everyone.id)) {
      permissionOverwrites.push({
        id: state.guild.roles.everyone.id,
        deny: PermissionsBitField.Flags.Connect, // ['CONNECT']
      });
    }

    if (state.member) {
      permissionOverwrites.push({
        id: state.member.id,
        allow: PermissionsBitField.Flags.Connect, // ['CONNECT']
      });
    }
  }

  return {
    type: ChannelType.GuildVoice,
    bitrate: 96000,
    userLimit: pChannel.userLimitPortal,
    parent: state.channel?.parent ? state.channel?.parent : undefined,
    permissionOverwrites: permissionOverwrites,
  } as GuildChannelCreateOptions;
}

export async function createVoiceChannel(state: VoiceState, pChannel: PChannel): Promise<string | boolean> {
  if (!state) {
    return Promise.reject('there is no state');
  } else if (!state.channel) {
    return Promise.reject('state has no channel');
  } else if (!state.member) {
    return Promise.reject('state has no member');
  }

  const voiceOptions: GuildChannelCreateOptions = createVoiceOptions(state, pChannel);

  const newGuildVoiceChannel = await state.guild.channels.create({ ...voiceOptions, name: 'loading..' });
  if (!newGuildVoiceChannel) {
    return false;
  }

  const newVoice = new PVoiceChannel(
    newGuildVoiceChannel.id,
    state.member.id,
    pChannel.render,
    pChannel.regexVoice,
    pChannel.noBots,
    pChannel.locale,
    pChannel.annAnnounce,
    pChannel.annUser
  );

  insertVoice(state.member.guild.id, pChannel.id, newVoice).catch((e) => {
    return Promise.reject(`failed to store voice channel: ${e}`);
  });

  await state.member.voice.setChannel(newGuildVoiceChannel as unknown as VoiceBasedChannel); // as VoiceBasedChannel)

  return 'created channel and moved member to new voice';
}

export async function createMusicChannel(
  guild: Guild,
  musicChannel: string,
  musicCategory: string | CategoryChannel | null,
  pGuild: PGuild
): Promise<boolean> {
  let newMusicCategoryGuildChannel: CategoryChannel | undefined;
  if (musicCategory && typeof musicCategory === 'string') {
    // with category
    newMusicCategoryGuildChannel = await guild.channels
      .create({ name: musicCategory, type: ChannelType.GuildCategory })
      .catch((e) => {
        return Promise.reject(`failed to create music category: ${e}`);
      });
  } else if (musicCategory) {
    // with category object given
    newMusicCategoryGuildChannel = musicCategory as CategoryChannel;
  }

  const newMusicGuildChannel = await guild.channels
    .create({
      name: `${musicChannel}`,
      parent: newMusicCategoryGuildChannel,
      type: ChannelType.GuildText,
      topic: 'play:▶️, pause:⏸, skip:⏭, pin last:📌, lyrics:📄, queue text:⬇️, clear queue:🧹, leave:🚪', // , vol dwn ➖, vol up ➕
    })
    .catch((e) => {
      return Promise.reject(`failed to create focus channel: ${e}`);
    });

  if (!newMusicGuildChannel) {
    return false;
  }

  pGuild.musicData.channelId = newMusicGuildChannel.id;

  const musicMessageId = await createMusicMessage(newMusicGuildChannel, pGuild).catch((e) => {
    return Promise.reject(`failed to send music message: ${e}`);
  });

  if (!musicMessageId) {
    return false;
  }

  logger.log({ level: 'info', type: 'none', message: `send music message ${musicMessageId}` });
  createMusicLyricsMessage(newMusicGuildChannel, pGuild, musicMessageId).catch((e) => {
    return Promise.reject(`failed to send music lyrics message: ${e}`);
  });

  return true;
}

export async function moveMembersBack(
  oldChannel: VoiceBasedChannel,
  member: GuildMember,
  memberFound: GuildMember
): Promise<string> {
  if (!oldChannel.deletable) {
    return Promise.reject('could not move to original voice channel because it was deleted');
  }

  const setUserBackToOriginalChannel = await member.voice.setChannel(oldChannel).catch((e) => {
    return Promise.reject(`focus did not end properly: ${e}`);
  });

  if (!setUserBackToOriginalChannel) {
    return Promise.reject('did not move requester back to original channel');
  }

  const setUserFocusBackToOriginalChannel = await memberFound.voice.setChannel(oldChannel).catch((e) => {
    return Promise.reject(`focus did not end properly: ${e}`);
  });

  if (!setUserFocusBackToOriginalChannel) {
    return Promise.reject('did not move requested back to original channel');
  }

  return 'focus ended properly';
}

export async function createFocusChannel(
  guild: Guild,
  member: GuildMember,
  memberFound: GuildMember,
  focusTime: number,
  pChannel: PChannel
): Promise<string> {
  if (!member.voice.channel) {
    return Promise.reject('member is not in a voice channel');
  }

  const chatRoomName = `${focusTime === 0
    ? 'Private Room'
    : `PR-${focusTime}' $hour:$minute/${dayjs()
      .add(focusTime, focusTime === 1 ? 'minute' : 'minutes')
      .format('hh:mm')}`
  }`;

  const voiceOptions: GuildChannelCreateOptions = {
    name: chatRoomName,
    type: ChannelType.GuildVoice,
    bitrate: 96000,
    userLimit: 2,
  };

  const newVoiceChannel = await guild.channels.create(voiceOptions).catch((e) => {
    return Promise.reject(`failed to create focus channel: ${e}`);
  });

  if (!newVoiceChannel) {
    return Promise.reject('failed to create new voice channel');
  }

  member.voice
    .setChannel(newVoiceChannel as unknown as VoiceBasedChannel) // as VoiceBasedChannel)
    .catch((e) => {
      return Promise.reject(`failed to set member to new channel: ${e}`);
    });

  memberFound.voice
    .setChannel(newVoiceChannel as unknown as VoiceBasedChannel) // as VoiceBasedChannel)
    .catch((e) => {
      return Promise.reject(`failed to set member to new channel: ${e}`);
    });

  insertVoice(
    guild.id,
    pChannel.id,
    new PVoiceChannel(
      newVoiceChannel.id,
      member.id,
      pChannel.render,
      chatRoomName,
      pChannel.noBots,
      pChannel.locale,
      pChannel.annAnnounce,
      pChannel.annUser
    )
  ).catch((e) => {
    return Promise.reject(`failed to store voice channel: ${e}`);
  });

  if (focusTime === 0) {
    return 'private room successfully created';
  }

  return focusTime === 0 ? 'private room successfully created' : 'focus channel successfully created';
}

export async function deleteChannel(
  type: PortalChannelType,
  channelToDelete: VoiceChannel | TextChannel,
  interaction: ChatInputCommandInteraction | null,
  isPortal = false
): Promise<boolean> {
  if (isPortal && channelToDelete.deletable) {
    const channelDeleted = await channelToDelete.delete().catch((e) => {
      return Promise.reject(`failed to delete channel: ${e}`);
    });

    return !!channelDeleted;
  }

  if (!interaction) {
    return Promise.reject('message is undefined');
  }

  const author = interaction.user;
  const channelToDeleteName = channelToDelete.name;
  let repliedWithYes = false;

  const sentMessage = await interaction.channel
    ?.send(
      `${interaction.user}, do you wish to delete old ` +
      `${PortalChannelType[type].toString()} channel **${channelToDelete}** (yes / no) ?`
    )

  if (!sentMessage) {
    return Promise.reject('failed to send message');
  }

  const filter = (message: Message) => message.author.id === author.id;
  const collector = interaction?.channel?.createMessageCollector({ filter, time: 10000 });

  if (!collector) {
    return Promise.reject('failed to send message');
  }

  collector.on('collect', (m: Message) => {
    if (m.content === 'yes' || m.content === 'no') {
      repliedWithYes = m.content === 'yes' ? true : false;
      collector.stop();
    }
  });

  collector.on('end', (collected: Collection<string, Message>) => {
    collected.forEach((replyMessage: Message) => {
      if (replyMessage.deletable) {
        replyMessage.delete().catch((e) => {
          return Promise.reject(`failed to delete message: ${e}`);
        });
      }
    });

    if (!repliedWithYes) {
      sentMessage
        .edit(`channel **"${channelToDelete}"** will not be deleted`)
        .then((msg) => {
          setTimeout(
            () =>
              msg.delete().catch((e) => {
                return Promise.reject(`failed to delete message: ${e}`);
              }),
            5000
          );
        })
        .catch((e) => {
          return Promise.reject(`failed to send message: ${e}`);
        });
    } else {
      if (channelToDelete.deletable) {
        channelToDelete
          .delete()
          .then(() => {
            sentMessage
              .edit(`channel **"${channelToDeleteName}"** deleted`)
              .then((editMessage) => {
                setTimeout(
                  () =>
                    editMessage
                      .delete()
                      .then(() => {
                        return true;
                      })
                      .catch((e) => {
                        return Promise.reject(`failed to delete message: ${e}`);
                      }),
                  5000
                );
              })
              .catch((e) => {
                return Promise.reject(`failed to send message: ${e}`);
              });
          })
          .catch((e) => {
            return Promise.reject(`failed to delete channel: ${e}`);
          });
      } else {
        sentMessage
          .edit(`channel **"${channelToDelete}"** is not deletable`)
          .then((editMessage) => {
            setTimeout(
              () =>
                editMessage
                  .delete()
                  .then(() => {
                    return true;
                  })
                  .catch((e) => {
                    return Promise.reject(`failed to delete message: ${e}`);
                  }),
              5000
            );
          })
          .catch((e) => {
            return Promise.reject(`failed to send message: ${e}`);
          });
      }
    }
  });

  return true;
}

export async function generateChannelName(
  voiceChannel: VoiceChannel,
  pChannels: PChannel[],
  pGuild: PGuild,
  guild: Guild
): Promise<boolean> {
  for (let i = 0; i < pChannels.length; i++) {
    for (let j = 0; j < pChannels[i].pVoiceChannels.length; j++) {
      if (pChannels[i].pVoiceChannels[j].id === voiceChannel.id) {
        // I choose not to fetch the voice regex from database
        // if it changed users can create a new one instead of
        // me creating an database spam
        let regex = pChannels[i].pVoiceChannels[j].regex;
        if (pChannels[i].regexOverwrite) {
          const member = voiceChannel.members.find((m) => m.id === pChannels[i].pVoiceChannels[j].creatorId);

          if (member) {
            const pMember = pGuild.pMembers.find((m) => m.id === member.id);

            if (pMember?.regex && pMember.regex !== 'null') {
              regex = pMember.regex;
            }
          }
        }

        const newName = pChannels[i].pVoiceChannels[j].render
          ? regexInterpreter(
            regex,
            voiceChannel,
            pChannels[i].pVoiceChannels[j],
            pChannels,
            pGuild,
            guild,
            pChannels[i].pVoiceChannels[j].creatorId
          )
          : regex;

        if (newName.length >= 1) {
          const newNameCapped = maxString(newName, 99);
          if (voiceChannel.name !== newNameCapped) {
            await voiceChannel.edit({ name: newNameCapped }).catch((e) => {
              return Promise.reject(`failed to edit voice channel: ${e}`);
            });

            return true;
          } else {
            return false;
          }
        } else {
          return true;
        }
      }
    }
  }

  return true;
}

export function regexInterpreter(
  regex: string,
  voiceChannel: VoiceChannel,
  pVoiceChannel: PVoiceChannel | null,
  pChannels: PChannel[],
  pGuild: PGuild,
  guild: Guild,
  memberId: string
): string {
  let lastSpaceIndex = 0;
  let lastVariableEndIndex = 0;
  let lastAttributeEndIndex = 0;

  let lastVariable = '';
  let lastAttribute = '';
  let newChannelName = '';

  for (let i = 0; i < regex.length; i++) {
    if (regex[i] === Prefix.VARIABLE) {
      const variable = isVariable(regex.substring(i));

      if (variable.length !== 0) {
        const returnValue: string | number = <string>getVariable(
          voiceChannel,
          pVoiceChannel,
          pChannels,
          pGuild,
          guild,
          variable
        );

        if (returnValue !== null) {
          lastVariable = returnValue;
          newChannelName += returnValue;
          i += voca.chars(variable).length;
          lastVariableEndIndex = i;
        } else {
          newChannelName += regex[i];
        }
      } else {
        newChannelName += regex[i];
      }
    } else if (regex[i] === Prefix.ATTRIBUTE) {
      const attr = isAttribute(regex.substring(i));

      if (attr.length !== 0) {
        // const pMember = pGuild.member_list.find(m => m.id === memberId);

        const returnValue = getAttribute(
          voiceChannel,
          pVoiceChannel,
          pChannels,
          pGuild,
          guild,
          attr //, pMember
          // voiceChannel, pVoiceChannel, p, pGuild, attr, pMember
        );

        if (returnValue !== null) {
          lastAttribute = `${returnValue}`;
          newChannelName += returnValue;
          i += voca.chars(attr).length;
          lastAttributeEndIndex = i;
        } else {
          newChannelName += regex[i];
        }
      } else {
        newChannelName += regex[i];
      }
    } else if (regex[i] === Prefix.PIPE) {
      const pipe = isPipe(regex.substring(i));

      if (pipe.length !== 0) {
        if (lastVariableEndIndex + 1 === i) {
          const returnValue = getPipe(lastVariable, pipe);

          if (returnValue !== null) {
            newChannelName = newChannelName.substring(
              0,
              voca.chars(newChannelName).length - voca.chars(lastVariable).length
            );
            newChannelName += returnValue;
            i += voca.chars(pipe).length;
          } else {
            newChannelName += regex[i];
          }
        } else if (lastAttributeEndIndex + 1 === i) {
          const returnValue = getPipe(lastAttribute, pipe);

          if (returnValue !== null) {
            newChannelName = newChannelName.substring(
              0,
              voca.chars(newChannelName).length - voca.chars(lastAttribute).length
            );
            newChannelName += returnValue;
            i += voca.chars(pipe).length;
          } else {
            newChannelName += regex[i];
          }
        } else {
          const returnValue = getPipe(newChannelName.substring(lastSpaceIndex, newChannelName.length), pipe);

          if (returnValue !== null) {
            const str_for_pipe = returnValue;
            newChannelName = newChannelName.substring(0, lastSpaceIndex);
            newChannelName += str_for_pipe;
            i += voca.chars(pipe).length;
          } else {
            newChannelName += regex[i];
          }
        }
      } else {
        newChannelName += regex[i];
      }
    } else if (regex[i] === '{' && regex[i + 1] !== undefined && regex[i + 1] === '{') {
      try {
        // did not put into structure_list due to many unnecessary function calls
        let isValid = false;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const statement = getJSONFromString(
          regex.substring(i + 1, i + 1 + regex.substring(i + 1).indexOf('}}') + 1)
        );

        if (!statement) return 'error';

        if (Object.prototype.hasOwnProperty.call(statement, 'if')) {
          if (Object.prototype.hasOwnProperty.call(statement, 'is')) {
            if (Object.prototype.hasOwnProperty.call(statement, 'with')) {
              if (Object.prototype.hasOwnProperty.call(statement, 'yes')) {
                if (Object.prototype.hasOwnProperty.call(statement, 'no')) {
                  isValid = true;
                }
              }
            }
          }
        }

        if (!isValid) {
          newChannelName += regex[i];
          if (regex[i] === ' ') {
            lastSpaceIndex = i + 1;
          }
        } else {
          if (
            statement.is === '==' ||
            statement.is === '===' ||
            statement.is === '!=' ||
            statement.is === '!==' ||
            statement.is === '>' ||
            statement.is === '<' ||
            statement.is === '>=' ||
            statement.is === '<='
          ) {
            if (
              inlineOperator(statement.is)(
                regexInterpreter(
                  statement.if,
                  voiceChannel,
                  pVoiceChannel,
                  pChannels,
                  pGuild,
                  guild,
                  memberId
                ),
                regexInterpreter(
                  statement.with,
                  voiceChannel,
                  pVoiceChannel,
                  pChannels,
                  pGuild,
                  guild,
                  memberId
                )
              )
            ) {
              const value = regexInterpreter(
                statement.yes,
                voiceChannel,
                pVoiceChannel,
                pChannels,
                pGuild,
                guild,
                memberId
              );
              if (value !== '--') {
                newChannelName += value;
              }
            } else {
              const value = regexInterpreter(
                statement.no,
                voiceChannel,
                pVoiceChannel,
                pChannels,
                pGuild,
                guild,
                memberId
              );
              if (value !== '--') {
                newChannelName += value;
              }
            }
            i += regex.substring(i + 1).indexOf('}}') + 2;
          } else {
            return 'error';
          }
        }
      } catch (e) {
        logger.log({ level: 'info', type: 'none', message: `failed to parse json: ${e}` });
        newChannelName += regex[i];
      }
    } else {
      newChannelName += regex[i];
      if (regex[i] === ' ') {
        lastSpaceIndex = i + 1;
      }
    }
  }

  if (newChannelName === '') {
    return '';
  }

  return newChannelName;
}
