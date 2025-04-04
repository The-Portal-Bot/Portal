import { SlashCommandBuilder } from "@discordjs/builders";
import type { ChatInputCommandInteraction } from "npm:discord.js";

import SPAM_CONFIG from "../../config.spam.json" with { type: "json" };
import { createEmbed } from "../../libraries/help.library.ts";
import type { Command } from "../../types/Command.ts";
import type { PGuild } from "../../types/classes/PGuild.class.ts";
import {
  type ReturnPromise,
  ScopeLimit,
} from "../../types/classes/PTypes.interface.ts";

const COMMAND_NAME = "spam_rules";
const DESCRIPTION = "returns server's spam rules";

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
    const rules =
      `**Duplicate spam warning after ${SPAM_CONFIG.DUPLICATE_AFTER}.**\n` +
      `**Spam warning after ${SPAM_CONFIG.WARN_AFTER}.**\n` +
      `**Mute after ${SPAM_CONFIG.MUTE_AFTER} ${
        SPAM_CONFIG.MUTE_AFTER === 1 ? "warning" : "warnings"
      } ` +
      `for ${SPAM_CONFIG.MUTE_PERIOD} ${
        SPAM_CONFIG.MUTE_PERIOD === 1 ? "minute" : "minutes"
      }.**\n\n` +
      `${
        pGuild.kickAfter && pGuild.kickAfter > 0
          ? `***Member kicked after ${pGuild.kickAfter} ${
            SPAM_CONFIG.MUTE_AFTER === 1 ? "penalty" : "penalties"
          }.***\n`
          : "***Automatic kick has not been set yet.***\n"
      }` +
      `${
        pGuild.banAfter && pGuild.banAfter > 0
          ? `***Member banned after ${pGuild.banAfter} ${
            SPAM_CONFIG.MUTE_AFTER === 1 ? "penalty" : "penalties"
          }.***`
          : "***Automatic ban has not been set yet.***"
      }`;

    const outcome = await interaction.reply({
      embeds: [
        createEmbed(
          "Spam Rules",
          rules,
          "#006996",
          null,
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
} as unknown as Command;
