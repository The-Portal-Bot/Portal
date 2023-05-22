import { Client, Message, TextChannel } from 'discord.js';
import { createEmbed, messageHelp } from '../../libraries/help.library';
// import { clientTalk } from "../../libraries/localisation.library";
import { SlashCommandBuilder } from '@discordjs/builders';
import { PGuild } from '../../types/classes/PGuild.class';
import { ReturnPromise } from '../../types/classes/PTypes.interface';

export = {
  data: new SlashCommandBuilder()
    .setName('announce')
    .setDescription('send an announcement to the announcement channel'),
  async execute(message: Message, args: string[], pGuild: PGuild, client: Client): Promise<ReturnPromise> {
    return new Promise((resolve) => {
      if (args.length === 0) {
        return resolve({
          result: false,
          value: messageHelp('commands', 'announce'),
        });
      }

      if (pGuild.announcement === '' || pGuild.announcement === 'null') {
        return resolve({
          result: false,
          value: messageHelp('commands', 'announce', 'there is no announcement channel'),
        });
      }

      if (!message.guild) {
        return resolve({
          result: false,
          value: "message's guild could not be fetched",
        });
      }

      const announcementChannel = <TextChannel>message.guild.channels.cache.find((c) => c.id === pGuild.announcement);

      if (!announcementChannel) {
        return resolve({
          result: false,
          value: messageHelp('commands', 'announce', 'announcements channel does not exist'),
        });
      }

      let body = args.join(' ').substr(0, args.join(' ').indexOf('|'));
      let title = args.join(' ').substr(args.join(' ').indexOf('|') + 1);

      if (body === '' && title !== '') {
        body = title;
        title = '';
      }

      const richMessage = createEmbed(title, `@here ${body}`, '#022E4E', [], null, message.member, null, null, null);

      announcementChannel
        .send({ embeds: [richMessage] })
        .then(() => {
          // clientTalk(client, pGuild, 'announce');
          return resolve({
            result: true,
            value: 'announcement was sent successfully',
          });
        })
        .catch((e) => {
          return resolve({
            result: false,
            value: `could not send message (missing permissions): ${e}`,
          });
        });
    });
  },
};
