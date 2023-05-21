import { SlashCommandBuilder } from '@discordjs/builders';
import { Message } from "discord.js";
import { createEmbed } from "../../libraries/help.library";
import { PGuild } from "../../types/classes/PGuild.class";
import { PMember } from "../../types/classes/PMember.class";
import { ReturnPromise } from "../../types/classes/PTypes.interface";

const embeds = (message: Message, pMember: PMember) => [
  createEmbed(
    message.member
      ? message.member?.displayName
      : 'could not fetch name',
    null,
    '#ddff00',
    [
      {
        emote: 'Level',
        role: pMember.level,
        inline: true
      },
      {
        emote: 'Regex',
        role: (!pMember.regex || pMember.regex === 'null')
          ? 'not set'
          : pMember.regex,
        inline: true
      },
      {
        emote: 'Penalties',
        role: `${pMember.penalties ? pMember.penalties : 0}`,
        inline: true
      },
      {
        emote: 'Id',
        role: pMember.id,
        inline: false
      }
    ],
    message.member?.user.avatarURL(),
    null,
    true,
    null,
    null
  )
]

export = {
  data: new SlashCommandBuilder()
    .setName('whoami')
    .setDescription('returns who am I information'),
  async execute(
    message: Message, args: string[], pGuild: PGuild
  ): Promise<ReturnPromise> {
    return new Promise((resolve) => {
      const pMember = pGuild.pMembers.find(m => m.id === message.member?.id);
      if (!pMember) {
        return resolve({
          result: false,
          value: 'could not find guild'
        });
      }

      message.channel
        .send({ embeds: embeds(message, pMember) })
        .then(() => {
          return resolve({
            result: true,
            value: ''
          });
        })
        .catch(e => {
          return resolve({
            result: true,
            value: `could not send message: ${e}`
          });
        });
    });
  }
};