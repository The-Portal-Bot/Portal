import { SlashCommandBuilder } from "@discordjs/builders";
import {
  type ChatInputCommandInteraction,
  InteractionContextType,
  type Role,
} from "npm:discord.js";
import {
  getJSONFromString,
  messageHelp,
} from "../../libraries/help.library.ts";
import { setRanks } from "../../libraries/mongo.library.ts";
import type { Command } from "../../types/Command.ts";
import type { PGuild } from "../../types/classes/PGuild.class.ts";
import {
  type Rank,
  type ReturnPromise,
  ScopeLimit,
} from "../../types/classes/PTypes.interface.ts";

const COMMAND_NAME = "set_ranks";
const DESCRIPTION = "set ranks for server";

export default {
  time: 0,
  premium: false,
  ephemeral: true,
  auth: true,
  scopeLimit: ScopeLimit.NONE,
  slashCommand: new SlashCommandBuilder()
    .setName(COMMAND_NAME)
    .setDescription(DESCRIPTION)
    .addStringOption((option) =>
      option.setName("rank_string").setDescription(
        "JSON string of ranks to set (even for one rank)",
      ).setRequired(true)
    )
    .setContexts(InteractionContextType.Guild),
  async execute(
    interaction: ChatInputCommandInteraction,
    pGuild: PGuild,
  ): Promise<ReturnPromise> {
    if (!interaction.guild) {
      return {
        result: true,
        value: "guild could not be fetched",
      };
    }

    const rankString = interaction.options.getString("rank_string");

    if (!rankString) {
      return {
        result: false,
        value: messageHelp(
          "commands",
          "set_ranks",
          "rank string must be provided",
        ),
      };
    }

    const roles = interaction.guild.roles.cache.map((cacheRole) => cacheRole);

    const newRanksJSON = getJSONFromString(rankString);
    if (!newRanksJSON || !Array.isArray(newRanksJSON)) {
      return {
        result: false,
        value: messageHelp(
          "commands",
          "set_ranks",
          "ranking must be an array in JSON format (even for one role)",
        ),
      };
    }

    const newRanks = <Rank[]> newRanksJSON;

    if (!newRanks.every((r) => r.level && r.role)) {
      return {
        result: false,
        value: messageHelp(
          "commands",
          "set_ranks",
          "JSON syntax has spelling errors`",
        ),
      };
    }

    if (!newRanks.every(isRank)) {
      return {
        result: false,
        value: messageHelp(
          "commands",
          "set_ranks",
          "rankings must be a key-pair from level and role",
        ),
      };
    }

    if (!newRanks.every((r) => isRole(r, roles))) {
      return {
        result: false,
        value: messageHelp(
          "commands",
          "set_ranks",
          "a role given does not exist in server",
        ),
      };
    }

    newRanks.forEach((rank) => {
      rank.level = +rank.level;
      const role = roles.find((role) => role.name === rank.role);
      if (role) rank.role = role.id;
    });

    const response = await setRanks(pGuild.id, newRanks);

    return {
      result: response,
      value: response
        ? "set new ranks successfully"
        : "failed to set new ranks",
    };
  },
} as Command;

function isRank(rank: Rank) {
  return !!rank.level && !!rank.role;
}

function isRole(rank: Rank, roles: Role[]) {
  return roles.some((role) => {
    return role.id === rank.role || role.name === rank.role;
  });
}
