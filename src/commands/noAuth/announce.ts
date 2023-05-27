import { ChatInputCommandInteraction, GuildMember, TextChannel } from 'discord.js';
import { createEmbed, messageHelp } from '../../libraries/help.library';
// import { clientTalk } from "../../libraries/localisation.library";
import { SlashCommandBuilder } from '@discordjs/builders';
import { PGuild } from '../../types/classes/PGuild.class';
import { ReturnPromise } from '../../types/classes/PTypes.interface';

export = {
  data: new SlashCommandBuilder()
    .setName('announce')
    .setDescription('send an announcement to the announcement channel'),
  async execute(interaction: ChatInputCommandInteraction, args: string[], pGuild: PGuild): Promise<ReturnPromise> {
    if (args.length === 0) {
      return {
        result: false,
        value: messageHelp('commands', 'announce'),
      };
    }

    if (pGuild.announcement === '' || pGuild.announcement === 'null') {
      return {
        result: false,
        value: messageHelp('commands', 'announce', 'there is no announcement channel'),
      };
    }

    if (!interaction.guild) {
      return {
        result: false,
        value: "message's guild could not be fetched",
      };
    }

    const announcementChannel = <TextChannel>(
      interaction.guild.channels.cache.find((channel) => channel.id === pGuild.announcement)
    );

    if (!announcementChannel) {
      return {
        result: false,
        value: messageHelp('commands', 'announce', 'announcements channel does not exist'),
      };
    }

    let body = args.join(' ').substring(0, args.join(' ').indexOf('|'));
    let title = args.join(' ').substring(args.join(' ').indexOf('|') + 1);

    if (body === '' && title !== '') {
      body = title;
      title = '';
    }

    const richMessage = createEmbed(
      title,
      `@here ${body}`,
      '#022E4E',
      [],
      null,
      interaction.member as GuildMember,
      null,
      null,
      null
    );

    const outcome = await announcementChannel.send({ embeds: [richMessage] });

    return {
      result: false,
      value: outcome ? 'announcement was sent successfully' : `could not send message`,
    };
  },
};
