import { Message, VoiceChannel } from 'discord.js';
import { PortalChannelTypes } from '../../types/enums/PortalChannel.enum';
import { deleteChannel, includedInVoiceList, regexInterpreter } from '../../libraries/guild.library';
import { messageHelp } from '../../libraries/help.library';
import { updateVoice } from '../../libraries/mongo.library';
import { PGuild } from '../../types/classes/PGuild.class';
import { ReturnPromise } from '../../types/classes/PTypes.interface';
import { SlashCommandBuilder } from '@discordjs/builders';

export = {
  data: new SlashCommandBuilder().setName('force').setDescription('force updates channel you are in to force a rename'),
  async execute(message: Message, args: string[], pGuild: PGuild): Promise<ReturnPromise> {
    return new Promise((resolve) => {
      if (!message.member) {
        return resolve({
          result: false,
          value: 'member could not be fetched',
        });
      }

      if (!message.member.voice.channel) {
        return resolve({
          result: false,
          value: messageHelp('commands', 'force', 'you must be in a channel handled by Portal'),
        });
      }

      if (!includedInVoiceList(message.member.voice.channel.id, pGuild.pChannels)) {
        return resolve({
          result: false,
          value: messageHelp('commands', 'force', 'the channel you are in is not handled by Portal'),
        });
      }

      if (message.member.voice.channel.members.size > 10) {
        return resolve({
          result: false,
          value: messageHelp('commands', 'force', 'you can only force a channel with up-to 10 members'),
        });
      }

      const currentMember = message.member;
      const currentVoice = message.member.voice.channel as VoiceChannel;

      pGuild.pChannels.some((p) => {
        return p.pVoiceChannels.some((v) => {
          if (v.id === currentVoice.id) {
            if (v.creatorId === currentMember.id) {
              if (message.guild) {
                const updatedName = regexInterpreter(
                  v.regex,
                  currentVoice,
                  v,
                  pGuild.pChannels,
                  pGuild,
                  message.guild,
                  message.author.id
                );

                currentVoice
                  .clone({ name: updatedName })
                  .then((clone) => {
                    if (currentVoice) {
                      currentVoice.members.forEach((member) => {
                        if (member.voice) {
                          member.voice.setChannel(clone, 'portal force update').catch((e) => {
                            return resolve({
                              result: false,
                              value: `failed to se messages channel: ${e}`,
                            });
                          });
                        }
                      });

                      updateVoice(pGuild.id, p.id, currentVoice.id, 'id', clone.id)
                        .then((r) => {
                          deleteChannel(PortalChannelTypes.voice, currentVoice, message, true).catch((e) => {
                            return resolve({
                              result: false,
                              value: `failed to delete channel: ${e}`,
                            });
                          });

                          return resolve({
                            result: r,
                            value: r ? 'force updated voice' : 'failed to force update',
                          });
                        })
                        .catch((e) => {
                          return resolve({
                            result: false,
                            value: `failed to force update channel: ${e}`,
                          });
                        });
                    }
                  })
                  .catch((e) => {
                    return resolve({
                      result: false,
                      value: `error while cloning channel: ${e}`,
                    });
                  });
              } else {
                return resolve({
                  result: false,
                  value: "could not fetch message's guild",
                });
              }
            } else {
              return resolve({
                result: false,
                value: 'you are not the creator of the channel',
              });
            }
          }
        });
      });
    });
  },
};
