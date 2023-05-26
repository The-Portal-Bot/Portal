import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, GuildMember, VoiceChannel } from 'discord.js';
import { deleteChannel, includedInVoiceList, regexInterpreter } from '../../libraries/guild.library';
import { messageHelp } from '../../libraries/help.library';
import { updateVoice } from '../../libraries/mongo.library';
import { PGuild } from '../../types/classes/PGuild.class';
import { ReturnPromise } from '../../types/classes/PTypes.interface';
import { PortalChannelTypes } from '../../types/enums/PortalChannel.enum';

export = {
  data: new SlashCommandBuilder().setName('force').setDescription('force updates channel you are in to force a rename'),
  async execute(interaction: ChatInputCommandInteraction, args: string[], pGuild: PGuild): Promise<ReturnPromise> {
    const member = interaction.member as GuildMember;
    if (!member) {
      return {
        result: false,
        value: 'member could not be fetched',
      };
    }

    if (!member.voice.channel) {
      return {
        result: false,
        value: messageHelp('commands', 'force', 'you must be in a channel handled by Portal'),
      };
    }

    if (!includedInVoiceList(member.voice.channel.id, pGuild.pChannels)) {
      return {
        result: false,
        value: messageHelp('commands', 'force', 'the channel you are in is not handled by Portal'),
      };
    }

    if (member.voice.channel.members.size > 10) {
      return {
        result: false,
        value: messageHelp('commands', 'force', 'you can only force a channel with up-to 10 members'),
      };
    }

    const currentMember = member;
    const currentVoice = member.voice.channel as VoiceChannel;

    pGuild.pChannels.some((pChannel) => {
      return pChannel.pVoiceChannels.some(async (pVoiceChannel) => {
        if (pVoiceChannel.id !== currentVoice.id) {
          return false;
        }

        if (pVoiceChannel.creatorId !== currentMember.id) {
          return {
            result: false,
            value: 'you are not the creator of the channel',
          };
        }

        if (!interaction.guild) {
          return {
            result: false,
            value: 'could not fetch message\'s guild',
          };
        }

        const updatedName = regexInterpreter(
          pVoiceChannel.regex,
          currentVoice,
          pVoiceChannel,
          pGuild.pChannels,
          pGuild,
          interaction.guild,
          interaction.user.id
        );

        const currentVoiceClone = await currentVoice.clone({ name: updatedName });

        if (!currentVoiceClone) {
          return {
            result: false,
            value: `error while cloning channel`,
          };
        }

        if (!currentVoice) {
          return {
            result: false,
            value: `could not fetch current channel`,
          };
        }

        currentVoice.members.forEach((member) => {
          if (member.voice) {
            member.voice.setChannel(currentVoiceClone, 'portal force update').catch((e) => {
              return {
                result: false,
                value: `failed to se messages channel: ${e}`,
              };
            });
          }
        });

        const updatedVoice = await updateVoice(pGuild.id, pChannel.id, currentVoice.id, 'id', currentVoiceClone.id);

        if (!updateVoice) {
          return {
            result: false,
            value: 'failed to force update channel',
          };
        }

        deleteChannel(PortalChannelTypes.voice, currentVoice, interaction, true).catch((e) => {
          return {
            result: false,
            value: `failed to delete channel: ${e}`,
          };
        });

        return {
          result: updatedVoice,
          value: updatedVoice ? 'force updated voice' : 'failed to force update',
        };
      });
    });

    return {
      result: false,
      value: `force failed`,
    };
  },
};
