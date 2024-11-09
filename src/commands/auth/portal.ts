import { SlashCommandBuilder } from "@discordjs/builders";
import {
  type ChatInputCommandInteraction,
  type GuildMember,
  InteractionContextType,
  VoiceChannel,
} from "npm:discord.js";

import { messageHelp } from "../../libraries/help.library.ts";
import { insertPortal } from "../../libraries/mongo.library.ts";
import type { Command } from "../../types/Command.ts";
import type { PGuild } from "../../types/classes/PGuild.class.ts";
import {
  type IPChannel,
  PChannel,
} from "../../types/classes/PPortalChannel.class.ts";
import {
  type ReturnPromise,
  ScopeLimit,
} from "../../types/classes/PTypes.interface.ts";

const COMMAND_NAME = "portal";
const DESCRIPTION = "set a portal channel";

export default {
  time: 0,
  premium: false,
  ephemeral: true,
  auth: true,
  scopeLimit: ScopeLimit.NONE,
  slashCommand: new SlashCommandBuilder()
    .setName(COMMAND_NAME)
    .setDescription(DESCRIPTION)
    .addChannelOption((option) =>
      option
        .setName("portal_channel_name")
        .setDescription("the name of the portal channel you want to create")
        .setRequired(true)
    )
    .setContexts(InteractionContextType.Guild),
  async execute(
    interaction: ChatInputCommandInteraction,
    pGuild: PGuild,
  ): Promise<ReturnPromise> {
    const newPortalChannel = interaction.options.getChannel(
      "portal_channel_name",
    );

    if (!newPortalChannel) {
      return {
        result: false,
        value: messageHelp(
          "commands",
          "portal",
          "portal channel name is required",
        ),
      };
    }

    if (!(newPortalChannel instanceof VoiceChannel)) {
      return {
        result: false,
        value: messageHelp(
          "commands",
          "portal",
          "channel must be voice channel",
        ),
      };
    }

    if (!interaction.guild) {
      return {
        result: true,
        value: "guild could not be fetched",
      };
    }

    if (!interaction.member) {
      return {
        result: true,
        value: "member could not be fetched",
      };
    }

    // const currentGuild = interaction.guild as Guild;
    const currentMember = interaction.member as GuildMember;

    // const portalOptions: GuildChannelCreateOptions = {
    //   name: 'portal',
    //   topic: `by Portal, channels on demand`,
    //   type: ChannelType.GuildVoice,
    //   bitrate: 32000,
    //   userLimit: 1,
    // };

    const voiceRegex = pGuild.premium
      // ? 'G$#-P$memberCount | $statusList'
      ? '$#:$memberCount {{"if": "$statusCount", "is": "===", "with": "1","yes": "$statusList", "no": "$statusList|acronym"}}'
      : "Channel $#";

    // const newPortalChannelId = await createChannel(currentGuild, portalChannelName, portalOptions, portalChannelCategoryName);

    // if (!newPortalChannelId) {
    //   return {
    //     result: false,
    //     value: `an error occurred while creating channel}`,
    //   };
    // }

    const pChannel = new PChannel(
      newPortalChannel.id,
      currentMember.id,
      true,
      "portal",
      voiceRegex,
      [],
      false,
      null,
      pGuild.locale,
      true,
      true,
      0,
      false,
    );

    const portalInserted = await insertPortal(
      pGuild.id,
      pChannel as unknown as IPChannel,
    );

    return {
      result: !!portalInserted,
      value: portalInserted
        ? "Portal channel has been created.\n" +
          "Keep in mind that due to Discord's limitations,\n" +
          "channel names will be updated on a five minute interval"
        : "portal channel failed to be created",
    };
  },
} as Command;
