import { SlashCommandBuilder } from '@discordjs/builders';
import { Client, Message } from "discord.js";
import { createEmbed } from "../../libraries/help.library";
import { PGuild } from "../../types/classes/PGuild.class";
import { Field, ReturnPromise } from "../../types/classes/PTypes.interface";

export = {
  data: new SlashCommandBuilder()
    .setName('state')
    .setDescription('returns server\'s state'),
  async execute(
    message: Message, args: string[], pGuild: PGuild, client: Client
  ): Promise<ReturnPromise> {
    return new Promise((resolve) => {
      const guild = client.guilds.cache
        .find(g => g.id === message?.guild?.id);

      if (!guild) {
        return resolve({
          result: false,
          value: 'could not fetch guild'
        });
      }

      let portalState = [<Field>{
        emote: 'Portal Channels',
        role: '',
        inline: false
      }];

      const portals = pGuild.pChannels
        .map(p => {
          const portalChannel = guild.channels.cache
            .find(c => c.id === p.id);

          const voices = p.pVoiceChannels
            .map((v, indexV) => {
              const voiceChannel = guild.channels.cache
                .find(c => c.id === v.id);

              return `${indexV + 1}. ${voiceChannel ? voiceChannel.name : 'unavailable'}`;
            })
            .join('\n');

          return <Field>{
            emote: `${portalChannel ? portalChannel.name : 'unavailable'}`,
            role: `\`\`\`\n${voices ? voices : 'no voice'}\n\`\`\``,
            inline: true
          }
        });

      if (portals) {
        portalState = portalState.concat(portals);
      }

      portalState
        .push(<Field>{
          emote: '',
          role: '',
          inline: false
        });

      const music = guild.channels.cache.find(c =>
        c.id === pGuild.musicData.channelId);

      if (music) {
        portalState
          .push(<Field>{
            emote: `Music channel`,
            role: `\`\`\`\n${music ? music.name : 'unavailable'}\n\`\`\``,
            inline: true
          });
      } else {
        portalState
          .push(<Field>{
            emote: `Music channel`,
            role: `\`\`\`\nnone\n\`\`\``,
            inline: true
          });
      }

      const announcement = guild.channels.cache.find(c =>
        c.id === pGuild.announcement);

      if (announcement) {
        portalState
          .push(<Field>{
            emote: 'Announcement channel',
            role: `\`\`\`\n${announcement ? announcement.name : 'unavailable'}\n\`\`\``,
            inline: true
          });
      } else {
        portalState
          .push(<Field>{
            emote: `Announcement channel`,
            role: `\`\`\`\nnone\n\`\`\``,
            inline: true
          });
      }

      portalState
        .push(<Field>{
          emote: '',
          role: '',
          inline: false
        });

      const urls = pGuild.urlList.map((uId, indexU) => {
        const channel = guild.channels.cache.find(c => c.id === uId);
        return `${indexU + 1}. ${channel ? channel.name : 'unavailable'}`;
      });

      if (urls.length > 0) {
        const urlSum = <Field>{
          emote: `URL channels`,
          role: `\`\`\`\n${urls ? urls.join('\n') : 'unavailable'}\n\`\`\``,
          inline: true
        };

        portalState = portalState.concat(urlSum);
      } else {
        portalState
          .push(<Field>{
            emote: `URL channels`,
            role: `\`\`\`\nnone\n\`\`\``,
            inline: true
          });
      }

      const ignore = pGuild.ignoreList.map((uId, indexU) => {
        const channel = guild.channels.cache.find(c => c.id === uId);
        return `${indexU + 1}. ${channel ? channel.name : 'unavailable'}`;
      });

      if (ignore.length > 0) {
        const ignoreSum = <Field>{
          emote: `Ignored channels`,
          role: `\`\`\`\n${ignore ? ignore.join('\n') : 'unavailable'}\n\`\`\``,
          inline: true
        };

        portalState = portalState.concat(ignoreSum);
      } else {
        portalState
          .push(<Field>{
            emote: `Ignored channels`,
            role: `\`\`\`\nnone\n\`\`\``,
            inline: true
          });
      }

      message.channel
        .send({
          embeds: [
            createEmbed(
              'State of Portal',
              null,
              '#eba000',
              portalState,
              null,
              null,
              true,
              null,
              null
            )
          ]
        })
        .catch(e => {
          return resolve({
            result: true,
            value: `failed to send message: ${e}`
          });
        });

      return resolve({
        result: true,
        value: ''
      });
    });
  }
};