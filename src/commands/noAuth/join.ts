import { SlashCommandBuilder } from "@discordjs/builders";
import { type ChatInputCommandInteraction, GuildMember } from "npm:discord.js";

import logger from "../../utilities/log.utility.ts";

import {
  type joinUserVoiceChannelByInteraction,
  messageHelp,
} from "../../libraries/help.library.ts";
import { clientTalk } from "../../libraries/localisation.library.ts";
import type { Command } from "../../types/Command.ts";
import type { PGuild } from "../../types/classes/PGuild.class.ts";
import {
  AnnouncementAction,
  type ReturnPromise,
  ScopeLimit,
} from "../../types/classes/PTypes.interface.ts";
import { VoiceLibrary } from "../../libraries/voice.library.ts";

const COMMAND_NAME = "join";
const DESCRIPTION = "makes portal join your voice channel";

export default {
  time: 1,
  premium: false,
  ephemeral: true,
  auth: false,
  scopeLimit: ScopeLimit.MEMBER,
  slashCommand: new SlashCommandBuilder().setName(COMMAND_NAME).setDescription(
    DESCRIPTION,
  ),
  async execute(
    interaction: ChatInputCommandInteraction,
    pGuild: PGuild,
  ): Promise<ReturnPromise> {
    try {
      const member = interaction?.member;
      if (!member || !(member instanceof GuildMember)) {
        return {
          result: false,
          value: messageHelp("commands", "join", "member not found"),
        };
      }
      const channelId = member.voice.channelId;
      if (!channelId) {
        return {
          result: false,
          value: messageHelp(
            "commands",
            "join",
            "user must be in voice channel",
          ),
        };
      }

      const guild = interaction.guild;
      if (!guild) {
        return {
          result: false,
          value: messageHelp("commands", "join", "guild not found"),
        };
      }

      const joinedChannel = VoiceLibrary.joinUserVoiceChannelById(
        channelId,
        guild,
      );

      if (!joinedChannel) {
        return {
          result: false,
          value: "failed to join voice channel",
        };
      }

      clientTalk(interaction, pGuild, AnnouncementAction.join, true);

      return {
        result: true,
        value: "successfully joined voice channel",
      };
    } catch (error) {
      logger.error(`commands.join.error: ${error}`);

      return {
        result: false,
        value: messageHelp("commands", "join", "failed to join voice channel"),
      };
    }
  },
} as Command;
