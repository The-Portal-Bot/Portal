import { SlashCommandBuilder } from "@discordjs/builders";
import {
  getVoiceConnection,
  VoiceConnectionStatus,
} from "npm:@discordjs/voice";
import type { ChatInputCommandInteraction } from "npm:discord.js";
import {
  clientTalk,
  clientWrite,
} from "../../libraries/localisation.library.ts";
import type { Command } from "../../types/Command.ts";
import type { PGuild } from "../../types/classes/PGuild.class.ts";
import {
  AnnouncementAction,
  type ReturnPromise,
  ScopeLimit,
} from "../../types/classes/PTypes.interface.ts";

const COMMAND_NAME = "leave";
const DESCRIPTION = "makes portal leave your voice channel";

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
    if (!interaction.guild) {
      return {
        result: false,
        value: "guild could not be fetched",
      };
    }

    const voiceConnection = getVoiceConnection(interaction.guild.id);

    if (!voiceConnection) {
      return {
        result: false,
        value: "portal must be connected to a voice channel with you",
      };
    }

    if (voiceConnection.state.status !== VoiceConnectionStatus.Ready) {
      // await voiceConnection.destroy();
      return {
        result: false,
        value: "failed to destroy voice connection",
      };
    }

    clientTalk(interaction, pGuild, AnnouncementAction.leave, true);
    setTimeout(function () {
      voiceConnection.disconnect();
    }, 4000);

    return {
      result: true,
      value: clientWrite(interaction, pGuild, AnnouncementAction.leave),
    };
  },
} as Command;
