import { SlashCommandBuilder } from "@discordjs/builders";
import {
  type BanOptions,
  ButtonStyle,
  type ChatInputCommandInteraction,
  type GuildMember,
  InteractionContextType,
} from "npm:discord.js";

import {
  askForApproval,
  isMod,
  messageHelp,
} from "../../libraries/help.library.ts";
import { ban } from "../../libraries/user.library.ts";
import type { Command } from "../../types/Command.ts";
import {
  type ReturnPromise,
  ScopeLimit,
} from "../../types/classes/PTypes.interface.ts";
import logger from "../../utilities/log.utility.ts";

const COMMAND_NAME = "kick";
const DESCRIPTION = "kick a user";

export default {
  time: 1,
  premium: false,
  ephemeral: true,
  auth: true,
  scopeLimit: ScopeLimit.MEMBER,
  slashCommand: new SlashCommandBuilder()
    .setName(COMMAND_NAME)
    .setDescription(DESCRIPTION)
    .addUserOption((option) =>
      option.setName("user_to_kick").setDescription("user to kick").setRequired(
        true,
      )
    )
    .addNumberOption((option) =>
      option.setName("kick_days").setDescription("days to kick user for")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("kick_reason").setDescription("kick reason").setRequired(
        false,
      )
    )
    .setContexts(InteractionContextType.Guild),
  async execute(
    interaction: ChatInputCommandInteraction,
  ): Promise<ReturnPromise> {
    const memberToBan = interaction.options.getMember(
      "user_to_kick",
    ) as GuildMember;
    const kickDays = interaction.options.getNumber("kick_days");
    const kickReason = interaction.options.getString("kick_reason");

    if (!memberToBan) {
      return {
        result: false,
        value: messageHelp("commands", "kick", "user must be provided"),
      };
    }

    if (!kickDays) {
      return {
        result: false,
        value: messageHelp("commands", "kick", "days to kick must be provided"),
      };
    }

    if (!interaction.member) {
      return {
        result: false,
        value: "message author could not be fetched",
      };
    }

    if (!isMod(interaction.member as GuildMember)) {
      return {
        result: false,
        value: "you must be a Portal moderator to kick users",
      };
    }

    if (!interaction.guild) {
      return {
        result: false,
        value: "user guild could not be fetched",
      };
    }

    const deleteMessageDays = kickDays ?? 1;
    const reason = kickReason ?? "kicked by admin";

    const response = await askForApproval(
      interaction,
      `*${interaction.user}, are you sure you want to kick **${memberToBan.displayName}** for **${deleteMessageDays}** days*?`,
      ButtonStyle.Danger,
    );

    if (!response) {
      return {
        result: false,
        value: "kick approval not received",
      };
    }

    try {
      const kickOptions: BanOptions = {
        deleteMessageDays,
        reason,
      };

      const kickResponse = await ban(memberToBan, kickOptions);

      return {
        result: kickResponse,
        value: kickResponse
          ? `User ${memberToBan.displayName} has been kicked`
          : `User ${memberToBan.displayName} could not be kicked`,
      };
    } catch (e) {
      logger.error(`Error while kicking: ${e}`);
      await interaction.editReply({
        content: "Confirmation not received within 1 minute, cancelling",
        components: [],
      });

      return {
        result: false,
        value: `User ${memberToBan.displayName} could not be kicked`,
      };
    }
  },
} as Command;
