import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, GuildMember, VoiceChannel } from 'discord.js';
import { regexInterpreter } from '../../libraries/guild.library';
import { createEmbed, maxString, messageHelp } from '../../libraries/help.library';
import { PGuild } from '../../types/classes/PGuild.class';
import { Field, ReturnPromise } from '../../types/classes/PTypes.interface';
import { PVoiceChannel } from '../../types/classes/PVoiceChannel.class';

export = {
  data: new SlashCommandBuilder()
    .setName('run')
    .setDescription('runs string given')
    .addStringOption(option =>
      option.setName('command')
        .setDescription('Command to run')
        .setRequired(true)),
  async execute(interaction: ChatInputCommandInteraction, pGuild: PGuild): Promise<ReturnPromise> {
    const command = interaction.options.getString('command');

    if (!command) {
      return {
        result: false,
        value: messageHelp('commands', 'run'),
      };
    }

    if (!interaction.guild) {
      return {
        result: true,
        value: 'guild could not be fetched',
      };
    }

    if (!interaction.member) {
      return {
        result: true,
        value: 'member could not be fetched',
      };
    }

    const member = interaction.member as GuildMember;
    const currentVoice = member.voice;
    const currentVoiceChannel = currentVoice.channel;

    let pVoice: PVoiceChannel | null = null;

    if (currentVoiceChannel) {
      for (let i = 0; i < pGuild.pChannels.length; i++) {
        for (let j = 0; j < pGuild.pChannels[i].pVoiceChannels.length; j++) {
          if (pGuild.pChannels[i].pVoiceChannels[j].id === currentVoiceChannel.id) {
            pVoice = pGuild.pChannels[i].pVoiceChannels[j];
            break;
          }
        }
      }
    }

    const message = {
      embeds: [
        createEmbed(
          'executing: ' + command,
          command,
          '#00ffb3',
          null,
          null,
          null,
          false,
          null,
          null,
          undefined,
          undefined
        ),
      ],
    }

    const sentMessage = await interaction.channel?.send(message);

    if (!sentMessage) {
      return {
        result: true,
        value: 'failed to send message',
      };
    }

    const editedMessage = await sentMessage
      .edit({
        embeds: [
          createEmbed(
            'Text Interpreter',
            null,
            '#00ffb3',
            <Field[]>[
              {
                emote: 'input',
                role: maxString(`\`\`\`\n${command}\n\`\`\``, 256),
                inline: false,
              },
              {
                emote: 'output',
                role: maxString(
                  `\`\`\`\n${regexInterpreter(
                    command,
                    currentVoiceChannel as VoiceChannel,
                    pVoice,
                    pGuild.pChannels,
                    pGuild,
                    interaction.guild,
                    interaction.user.id
                  )}\n\`\`\``,
                  256
                ),
                inline: false,
              },
            ],
            null,
            null,
            false,
            null,
            null,
            undefined,
            undefined
          ),
        ],
      });

    return {
      result: !!editedMessage,
      value: editedMessage ? '' : 'failed to edit message',
    };
  },
};
