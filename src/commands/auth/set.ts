import { SlashCommandBuilder } from "@discordjs/builders";
import type {
  ChatInputCommandInteraction,
  GuildMember,
  Role,
  VoiceChannel,
} from "npm:discord.js";

import { setAttribute } from "../../Interpreter/attribute.functions.ts";
import { messageHelp } from "../../libraries/help.library.ts";
import type { Command } from "../../types/Command.ts";
import type { PGuild } from "../../types/classes/PGuild.class.ts";
import {
  type ReturnPromise,
  ScopeLimit,
} from "../../types/classes/PTypes.interface.ts";

const COMMAND_NAME = "set";
const DESCRIPTION = "set the value of an attribute";

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
      option
        .setName("attribute")
        .setDescription("Attribute's name to set")
        .addChoices(
          { name: "p.annAnnounce", value: "p.annAnnounce" },
          { name: "v.annAnnounce", value: "v.annAnnounce" },
          { name: "p.noBots", value: "p.noBots" },
          { name: "v.noBots", value: "v.noBots" },
          { name: "p.allowedRoles", value: "p.allowedRoles" },
          { name: "p.v.allowedRoles", value: "p.v.allowedRoles" },
          { name: "v.allowedRoles", value: "v.allowedRoles" },
          { name: "p.render", value: "p.render" },
          { name: "v.render", value: "v.render" },
          { name: "p.annUser", value: "p.annUser" },
          { name: "v.annUser", value: "v.annUser" },
          { name: "v.bitrate", value: "v.bitrate" },
          { name: "g.kickAfter", value: "g.kickAfter" },
          { name: "g.banAfter", value: "g.banAfter" },
          { name: "g.muteRole", value: "g.muteRole" },
          { name: "g.rankSpeed", value: "g.rankSpeed" },
          { name: "g.profanityLevel", value: "g.profanityLevel" },
          { name: "g.initialRole", value: "g.initialRole" },
          { name: "g.locale", value: "g.locale" },
          { name: "p.locale", value: "p.locale" },
          { name: "v.locale", value: "v.locale" },
          { name: "v.position", value: "v.position" },
          { name: "p.userLimit", value: "p.userLimit" },
          { name: "v.userLimit", value: "v.userLimit" },
        )
        .setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("value").setDescription("Value to set attribute to")
        .setRequired(false)
    )
    .addRoleOption((option) =>
      option.setName("role").setDescription("Value to set attribute to")
        .setRequired(false)
    ),
  async execute(
    interaction: ChatInputCommandInteraction,
    pGuild: PGuild,
  ): Promise<ReturnPromise> {
    const attribute = interaction.options.getString("attribute");
    const value = interaction.options.getString("value");
    const role = interaction.options.getRole("role");

    if (!attribute || (!value && !role)) {
      return {
        result: false,
        value: messageHelp("commands", "set"),
      };
    }

    if (!interaction.guild) {
      return {
        result: true,
        value: "guild could not be fetched",
      };
    }

    const member = interaction.member as GuildMember;
    if (!member) {
      return {
        result: true,
        value: "member could not be fetched",
      };
    }

    return await setAttribute(
      member.voice.channel as VoiceChannel,
      pGuild,
      attribute,
      member,
      interaction,
      value ?? (role as Role),
    );
  },
} as Command;
