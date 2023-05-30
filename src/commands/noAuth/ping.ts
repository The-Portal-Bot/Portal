import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, Client } from 'discord.js';
import { createEmbed } from '../../libraries/help.library';
import { PGuild } from '../../types/classes/PGuild.class';
import { ReturnPromise } from '../../types/classes/PTypes.interface';

export = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('returns time to reply with \'pong\''),
  async execute(interaction: ChatInputCommandInteraction, pGuild: PGuild, client: Client): Promise<ReturnPromise> {
    const message = {
      embeds: [
        createEmbed(null, null, '#0093ff', null, null, null, false, null, null, undefined, {
          name: 'Request sent',
          icon: 'https://raw.githubusercontent.com/keybraker/Portal/master/src/assets/img/ping.gif',
        }),
      ],
    };

    const messageSent = await interaction.channel?.send(message);

    if (!messageSent) {
      return {
        result: false,
        value: 'error while sending pong message',
      };
    }

    const editMessage = await messageSent.edit({
      embeds: [
        createEmbed(null, null, '#0093ff', null, null, null, false, null, null, undefined, {
          name:
            `RTT latency\t${messageSent.createdTimestamp - interaction.createdTimestamp} ms\n` +
            `Portal latency\t${client.ws.ping} ms`,
          icon: 'https://raw.githubusercontent.com/keybraker/Portal/master/src/assets/img/ping.gif',
        }),
      ],
    });

    return {
      result: !!editMessage,
      value: editMessage ? '' : 'error while editing pong message',
    };
  },
};
