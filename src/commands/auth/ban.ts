import { SlashCommandBuilder } from "@discordjs/builders";
import {
  type BanOptions,
  ButtonStyle,
  type ChatInputCommandInteraction,
  type GuildMember,
  InteractionContextType,
} from "npm:discord.js";

import {
  askForApprovalByInteraction,
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

const COMMAND_NAME = "ban";
const DESCRIPTION = "ban a user";

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
      option.setName("user_to_ban").setDescription("user to ban").setRequired(
        true,
      )
    )
    .addNumberOption((option) =>
      option.setName("ban_days").setDescription("days to ban user for")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("ban_reason").setDescription("ban reason").setRequired(
        false,
      )
    )
    .setContexts(InteractionContextType.Guild),
  async execute(
    interaction: ChatInputCommandInteraction,
  ): Promise<ReturnPromise> {
    const memberToBan = interaction.options.getMember(
      "user_to_ban",
    ) as GuildMember;
    const banDays = interaction.options.getNumber("ban_days");
    const banReason = interaction.options.getString("ban_reason");

    if (!memberToBan) {
      return {
        result: false,
        value: messageHelp("commands", "ban", "user must be provided"),
      };
    }

    if (!banDays) {
      return {
        result: false,
        value: messageHelp("commands", "ban", "days to ban must be provided"),
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
        value: "you must be a Portal moderator to ban users",
      };
    }

    if (!interaction.guild) {
      return {
        result: false,
        value: "user guild could not be fetched",
      };
    }

    const deleteMessageDays = banDays ?? 1;
    const reason = banReason ?? "banned by admin";

    const response = await askForApprovalByInteraction(
      interaction,
      `*${interaction.user}, are you sure you want to ban **${memberToBan.displayName}** for **${deleteMessageDays}** days*?`,
      ButtonStyle.Danger,
    );

    if (!response) {
      return {
        result: false,
        value: "Ban approval not received",
      };
    }

    try {
      const banOptions: BanOptions = {
        deleteMessageDays,
        reason,
      };

      const banResponse = await ban(memberToBan, banOptions);

      return {
        result: banResponse,
        value: banResponse
          ? `User ${memberToBan.displayName} has been banned`
          : `User ${memberToBan.displayName} could not be banned`,
      };
    } catch (e) {
      logger.error(`Error while banning: ${e}`);
      await interaction.editReply({
        content: "Confirmation not received within 1 minute, cancelling",
        components: [],
      });

      return {
        result: false,
        value: `User ${memberToBan.displayName} could not be banned`,
      };
    }
  },
} as unknown as Command;
