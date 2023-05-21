import { Message } from "discord.js";
import { createEmbed } from "../../libraries/help.library";
import { PGuild } from "../../types/classes/PGuild.class";
import { Field, ReturnPromise } from "../../types/classes/PTypes.interface";
import { SlashCommandBuilder } from '@discordjs/builders';

export = {
  data: new SlashCommandBuilder()
    .setName('ranks')
    .setDescription('returns server ranks'),
  async execute(
    message: Message, args: string[], pGuild: PGuild
  ): Promise<ReturnPromise> {
    return new Promise((resolve) => {
      if (pGuild.ranks && pGuild.ranks.length > 0) {
        const ranksMessage: Field[] = [];

        pGuild.ranks.forEach(rank => {
          const role = message.guild?.roles.cache.find(r => r.id === rank.role);
          ranksMessage.push({
            emote: `At level ${rank.level}, you get role`,
            role: `${role ? role : rank.role}`,
            inline: false,
          });
        });

        message.channel
          .send({
            embeds: [
              createEmbed(
                'Ranking System',
                null,
                '#FF4500',
                ranksMessage,
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

        resolve({
          result: true,
          value: ''
        });
      }
      else {
        resolve({
          result: true,
          value: 'there is no ranking yet'
        });
      }

      resolve({
        result: true,
        value: 'could not fetch ranks'
      });
    });
  }
};