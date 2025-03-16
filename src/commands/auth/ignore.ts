import { SlashCommandBuilder } from "@discordjs/builders";
import type { ChatInputCommandInteraction } from "npm:discord.js";
import { includedInPIgnores } from "../../libraries/guild.library.ts";
import { insertIgnore, removeIgnore } from "../../libraries/mongo.library.ts";
import type { Command } from "../../types/Command.ts";
import type { PGuild } from "../../types/classes/PGuild.class.ts";
import {
  type ReturnPromise,
  ScopeLimit,
} from "../../types/classes/PTypes.interface.ts";

const COMMAND_NAME = "ignore";
const DESCRIPTION = "ignore user or channel from spam";

export default {
  time: 0,
  premium: false,
  ephemeral: true,
  auth: true,
  scopeLimit: ScopeLimit.NONE,
  slashCommand: new SlashCommandBuilder().setName(COMMAND_NAME).setDescription(
    DESCRIPTION,
  ),
  async execute(
    interaction: ChatInputCommandInteraction,
    pGuild: PGuild,
  ): Promise<ReturnPromise> {
    if (!interaction.guild) {
      return {
        result: false,
        value: "guild could not be fetched",
      };
    }

    const channelId = interaction.channel?.id;

    if (!channelId) {
      return {
        result: false,
        value: "could not fetch channel",
      };
    }

    // channel ignore
    if (includedInPIgnores(channelId, pGuild)) {
      const response = await removeIgnore(pGuild.id, channelId);

      if (response) {
        return {
          result: response,
          value: response
            ? "successfully removed ignore channel"
            : "failed to remove ignore channel",
        };
      } else {
        return {
          result: false,
          value: "failed to remove ignore channel",
        };
      }
    } else {
      const response = await insertIgnore(pGuild.id, channelId);

      if (response) {
        return {
          result: response,
          value: response
            ? "set as an ignore channel successfully"
            : "failed to set as an ignore channel",
        };
      } else {
        return {
          result: false,
          value: "failed to set as an ignore channel",
        };
      }
    }
  },
} as unknown as Command;
