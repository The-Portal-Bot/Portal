import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, GuildMember, TextChannel } from 'discord.js';
import { createEmbed, messageHelp } from '../../libraries/help.library';
import { Command } from '../../types/Command';
import { PGuild } from '../../types/classes/PGuild.class';
import { ReturnPromise, ScopeLimit } from '../../types/classes/PTypes.interface';

const COMMAND_NAME = 'announce';
const DESCRIPTION = 'send an announcement to the announcement channel';

export default {
  time: 2,
  premium: false,
  ephemeral: true,
  auth: false,
  scopeLimit: ScopeLimit.MEMBER,
  slashCommand: new SlashCommandBuilder()
    .setName(COMMAND_NAME)
    .setDescription(DESCRIPTION)
    .addStringOption((option) => option.setName('title').setDescription('Announcement title').setRequired(true))
    .addStringOption((option) => option.setName('body').setDescription('Announcement body').setRequired(true)),
  async execute(interaction: ChatInputCommandInteraction, pGuild: PGuild): Promise<ReturnPromise> {
    const title = interaction.options.getString('title');
    const body = interaction.options.getString('body');

    if (!title || !body) {
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
        value: 'message\'s guild could not be fetched',
      };
    }

    const announcementChannel = interaction.guild.channels.cache.find(
      (channel) => channel.id === pGuild.announcement,
    ) as TextChannel;

    if (!announcementChannel) {
      return {
        result: false,
        value: messageHelp('commands', 'announce', 'announcements channel does not exist'),
      };
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
      null,
    );

    const outcome = await announcementChannel.send({ embeds: [richMessage] });

    return {
      result: !!outcome,
      value: outcome ? 'announcement was sent successfully' : 'could not send message',
    };
  },
} as Command;
