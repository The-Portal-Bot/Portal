import { SlashCommandBuilder } from "@discordjs/builders";
import type { ChatInputCommandInteraction } from "npm:discord.js";

import { createEmbed } from "../../libraries/help.library.ts";
import type { Command } from "../../types/Command.ts";
import type { PGuild } from "../../types/classes/PGuild.class.ts";
import {
  type Field,
  type ReturnPromise,
  ScopeLimit,
} from "../../types/classes/PTypes.interface.ts";

const COMMAND_NAME = "ranks";
const DESCRIPTION = "display server ranks";

export default {
  time: 0,
  premium: false,
  ephemeral: true,
  auth: false,
  scopeLimit: ScopeLimit.NONE,
  slashCommand: new SlashCommandBuilder().setName(COMMAND_NAME).setDescription(
    DESCRIPTION,
  ),
  async execute(
    interaction: ChatInputCommandInteraction,
    pGuild: PGuild,
  ): Promise<ReturnPromise> {
    if (!pGuild.ranks || pGuild.ranks.length === 0) {
      return {
        result: true,
        value: "there is no ranking yet",
      };
    }

    const ranksMessage: Field[] = [];

    pGuild.ranks.forEach((rank) => {
      const role = interaction.guild?.roles.cache.find((r) =>
        r.id === rank.role
      );
      ranksMessage.push({
        emote: `At level ${rank.level}, you get role`,
        role: `${role ? role : rank.role}`,
        inline: false,
      });
    });

    const outcome = await interaction.reply({
      embeds: [
        createEmbed(
          "Ranking System",
          null,
          "#FF4500",
          ranksMessage,
          null,
          null,
          true,
          null,
          null,
        ),
      ],
    });

    return {
      result: !!outcome,
      value: outcome ? "" : "failed to send message",
    };
  },
} as Command;
