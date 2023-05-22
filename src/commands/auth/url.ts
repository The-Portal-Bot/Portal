import { Message } from 'discord.js';
import {
  createChannel,
  getOptions,
  isAnnouncementChannel,
  isMusicChannel,
  isUrlOnlyChannel,
} from '../../libraries/guild.library';
import { messageHelp } from '../../libraries/help.library';
import { insertURL, removeURL } from '../../libraries/mongo.library';
import { PGuild } from '../../types/classes/PGuild.class';
import { ReturnPromise } from '../../types/classes/PTypes.interface';
import { SlashCommandBuilder } from '@discordjs/builders';

export = {
  data: new SlashCommandBuilder().setName('url').setDescription('create URL only channel'),
  async execute(message: Message, args: string[], pGuild: PGuild): Promise<ReturnPromise> {
    return new Promise((resolve) => {
      if (!message.guild)
        return resolve({
          result: false,
          value: 'guild could not be fetched',
        });

      if (args.length === 0) {
        if (isUrlOnlyChannel(message.channel.id, pGuild)) {
          removeURL(pGuild.id, message.channel.id)
            .then((r: boolean) => {
              return resolve({
                result: r,
                value: r ? 'successfully removed url channel' : 'failed to remove url channel',
              });
            })
            .catch((e: string) => {
              return resolve({
                result: false,
                value: `failed to remove url channel: ${e}`,
              });
            });
        } else if (isAnnouncementChannel(message.channel.id, pGuild)) {
          return resolve({
            result: false,
            value: "this can't be set as a URL channel for it is the Announcement channel",
          });
        } else if (isMusicChannel(message.channel.id, pGuild)) {
          return resolve({
            result: true,
            value: "this can't be set as a URL channel for it is the Music channel",
          });
        } else {
          insertURL(pGuild.id, message.channel.id)
            .then((r) => {
              return resolve({
                result: r,
                value: r ? 'set as an url channel successfully' : 'failed to set as an url channel',
              });
            })
            .catch((e) => {
              return resolve({
                result: false,
                value: `failed to set as an url channel: ${e}`,
              });
            });
        }
      } else if (args.length > 0) {
        let urlChannel: string = args.join(' ').substring(0, args.join(' ').indexOf('|') - 1);
        let urlCategory: string | null = args.join(' ').substring(args.join(' ').indexOf('|'));

        if (urlChannel === '' && urlCategory !== '') {
          urlChannel = urlCategory;
          urlCategory = null;
        }

        const urlOptions = getOptions(message.guild, 'url only channel');

        createChannel(message.guild, urlChannel, urlOptions, urlCategory)
          .then((rCreate) => {
            insertURL(pGuild.id, rCreate)
              .then((rUrl) => {
                return resolve({
                  result: rUrl,
                  value: rUrl ? 'created url channel and category successfully' : 'failed to create a url channel',
                });
              })
              .catch((e) => {
                return resolve({
                  result: false,
                  value: `failed to create a url channel: ${e}`,
                });
              });
          })
          .catch((e) => {
            return resolve(e);
          });
      } else {
        return resolve({
          result: false,
          value: messageHelp('commands', 'url'),
        });
      }
    });
  },
};
