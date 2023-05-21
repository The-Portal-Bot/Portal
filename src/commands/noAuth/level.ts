import { Message } from "discord.js";
import { createEmbed } from "../../libraries/help.library";
import { PGuild } from "../../types/classes/PGuild.class";
import { ReturnPromise } from "../../types/classes/PTypes.interface";
import { SlashCommandBuilder } from '@discordjs/builders';

export = {
  data: new SlashCommandBuilder()
    .setName('level')
    .setDescription('returns your level'),
  async execute(
    message: Message, args: string[], pGuild: PGuild
  ): Promise<ReturnPromise> {
    return new Promise((resolve) => {
      const pMember = pGuild.pMembers.find(m => m.id === message.member?.id);
      if (!pMember) {
        return resolve({
          result: true,
          value: 'could not find member'
        });
      }

      message.channel
        .send({
          embeds: [
            createEmbed(
              null,
              null,
              '#00FFFF',
              [
                { emote: 'Level', role: `${pMember.level}`, inline: true },
                { emote: 'Points', role: `${Math.round(pMember.points)}`, inline: true },
                // { emote: '', role: '', inline: false },
                // { emote: 'Rank', role: `${pMember.rank}`, inline: true },
                { emote: 'Tier', role: `${pMember.tier}`, inline: true },
              ],
              null,
              message.member,
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