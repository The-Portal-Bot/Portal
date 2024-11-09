import { SlashCommandBuilder } from "@discordjs/builders";
import {
  type ChatInputCommandInteraction,
  type GuildMember,
  InteractionContextType,
} from "npm:discord.js";
import { createEmbed } from "../../libraries/help.library.ts";
import type { Command } from "../../types/Command.ts";
import type { PGuild } from "../../types/classes/PGuild.class.ts";
import {
  type ReturnPromise,
  ScopeLimit,
} from "../../types/classes/PTypes.interface.ts";

const COMMAND_NAME = "level";
const DESCRIPTION = "returns your level";

export default {
  time: 0,
  premium: false,
  ephemeral: true,
  auth: false,
  scopeLimit: ScopeLimit.NONE,
  slashCommand: new SlashCommandBuilder()
    .setName(COMMAND_NAME)
    .setDescription(DESCRIPTION)
    .setContexts(InteractionContextType.Guild),
  async execute(
    interaction: ChatInputCommandInteraction,
    pGuild: PGuild,
  ): Promise<ReturnPromise> {
    const member = interaction.member as GuildMember;
    const pMember = pGuild.pMembers.find((m) => m.id === member.id);

    if (!pMember) {
      return {
        result: false,
        value: "could not find member",
      };
    }

    const message = {
      embeds: [
        createEmbed(
          null,
          null,
          "#00FFFF",
          [
            { emote: "Level", role: `${pMember.level}`, inline: true },
            {
              emote: "Points",
              role: `${Math.round(pMember.points)}`,
              inline: true,
            },
            // { emote: '', role: '', inline: false },
            // { emote: 'Rank', role: `${pMember.rank}`, inline: true },
            { emote: "Tier", role: `${pMember.tier}`, inline: true },
          ],
          null,
          member,
          true,
          null,
          null,
        ),
      ],
    };

    const outcome = await interaction.reply(message);

    return {
      result: !!outcome,
      value: outcome ? "" : "failed to send message",
    };
  },
} as Command;
