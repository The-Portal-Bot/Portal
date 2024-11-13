import { SlashCommandBuilder } from "@discordjs/builders";
import type { ChatInputCommandInteraction } from "npm:discord.js";
import { ButtonStyle, GuildMember } from "npm:discord.js";

import {
  createFocusChannel,
  includedInVoiceList,
  moveMembersBack,
} from "../../libraries/guild.library.ts";
import {
  askForApprovalByMember,
  messageHelp,
} from "../../libraries/help.library.ts";
import { VoiceLibrary } from "../../libraries/voice.library.ts";
import type { PGuild } from "../../types/classes/PGuild.class.ts";
import {
  type ReturnPromise,
  ScopeLimit,
} from "../../types/classes/PTypes.interface.ts";
import type { Command } from "../../types/Command.ts";
import logger from "../../utilities/log.utility.ts";

const COMMAND_NAME = "focus";
const DESCRIPTION =
  "creates a dedicated channel for two users to privately talk in";

export default {
  time: 1,
  premium: false,
  ephemeral: true,
  auth: false,
  scopeLimit: ScopeLimit.MEMBER,
  slashCommand: new SlashCommandBuilder()
    .setName(COMMAND_NAME)
    .setDescription(DESCRIPTION)
    .addUserOption((option) =>
      option.setName("member").setDescription("member to focus on").setRequired(
        true,
      )
    )
    .addNumberOption((option) =>
      option.setName("duration").setDescription("duration in seconds")
        .setRequired(true)
    ),
  // .addStringOption((option) =>
  //   option.setName("name").setDescription("focus channel name")
  //     .setRequired(false)
  // ),
  async execute(
    interaction: ChatInputCommandInteraction,
    pGuild: PGuild,
  ): Promise<ReturnPromise> {
    const memberToFocus = interaction.options.getMember("member");
    if (!memberToFocus) {
      return {
        result: false,
        value: messageHelp("commands", COMMAND_NAME, "user must be provided"),
      };
    }

    if (!(memberToFocus instanceof GuildMember)) {
      return {
        result: false,
        value: messageHelp("commands", COMMAND_NAME, "could not find member"),
      };
    }

    const member = interaction.member;
    if (!member) {
      return {
        result: false,
        value: messageHelp("commands", COMMAND_NAME, "could not find member"),
      };
    }

    if (!(member instanceof GuildMember)) {
      logger.info("member is not a guild member instance");
      return {
        result: false,
        value: messageHelp(
          "commands",
          COMMAND_NAME,
          "you must be a guild member",
        ),
      };
    }

    if (member === memberToFocus) {
      return {
        result: false,
        value: messageHelp(
          "commands",
          COMMAND_NAME,
          "you can't focus on yourself",
        ),
      };
    }

    const duration = interaction.options.getNumber("duration") ?? (5 * 60);

    const voiceBasedChannel = VoiceLibrary.getVoiceChannelByMember(member);
    if (!voiceBasedChannel) {
      return {
        result: false,
        value: messageHelp(
          "commands",
          COMMAND_NAME,
          "user not in voice channel",
        ),
      };
    }

    if (!includedInVoiceList(voiceBasedChannel.id, pGuild.pChannels)) {
      return {
        result: false,
        value: messageHelp(
          "commands",
          COMMAND_NAME,
          "lel the channel you are in is not handled by Portal",
        ),
      };
    }

    if (voiceBasedChannel.members.size <= 2) {
      return {
        result: false,
        value: messageHelp(
          "commands",
          COMMAND_NAME,
          "you can *only* use focus in channels with *more* than 2 members",
        ),
      };
    }

    if (
      voiceBasedChannel.members.some((m) => m.id === memberToFocus.id)
    ) {
      return {
        result: false,
        value: messageHelp(
          "commands",
          COMMAND_NAME,
          "user to focus not in voice channel",
        ),
      };
    }

    const gotApproval = await askForApprovalByMember(
      memberToFocus,
      `*${memberToFocus.user}, member ${interaction.user}, would like to talk in ` +
        `private${
          duration === 0 ? "" : ` for ${duration}'`
        }*, do you **(yes / no)** ?`,
      ButtonStyle.Success,
    );

    if (!gotApproval) {
      return {
        result: false,
        value: messageHelp(
          "commands",
          COMMAND_NAME,
          "user declined the request",
        ),
      };
    }

    if (!interaction.guild) {
      return {
        result: false,
        value: messageHelp(
          "commands",
          COMMAND_NAME,
          "could not fetch message's guild",
        ),
      };
    }

    if (!memberToFocus) {
      return {
        result: false,
        value: messageHelp(
          "commands",
          COMMAND_NAME,
          "could not fetch message's member",
        ),
      };
    }

    const pChannel = pGuild.pChannels.find((p) =>
      p.pVoiceChannels.some((v) => v.id === memberToFocus?.voice.channel?.id)
    );

    if (!pChannel) {
      return {
        result: false,
        value: messageHelp(
          "commands",
          COMMAND_NAME,
          "could not find member's portal channel",
        ),
      };
    }

    const oldChannel = voiceBasedChannel;
    const focusChannelOutcome = await createFocusChannel(
      interaction.guild,
      memberToFocus,
      memberToFocus,
      duration,
      pChannel,
    );

    setTimeout(async () => {
      if (!memberToFocus) {
        return {
          result: false,
          value: messageHelp(
            "commands",
            COMMAND_NAME,
            "could not fetch message's member",
          ),
        };
      }

      const movedMembers = await moveMembersBack(
        oldChannel,
        memberToFocus,
        memberToFocus,
      ).catch((e) => {
        logger.error(`commands.focus.error on moving members back: ${e}`);
      });

      if (!movedMembers) {
        logger.error("could not move members back");
      }
    }, duration * 60 * 1000);

    return {
      result: true,
      value: focusChannelOutcome,
    };
  },
} as Command;
