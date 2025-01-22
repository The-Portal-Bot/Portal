import { SlashCommandBuilder } from "@discordjs/builders";
import type { ChatInputCommandInteraction, User } from "npm:discord.js";

import { createEmbed } from "../../libraries/help.library.ts";
import type { PGuild } from "../../types/classes/PGuild.class.ts";
import {
  type ReturnPromise,
  ScopeLimit,
} from "../../types/classes/PTypes.interface.ts";
import type { Command } from "../../types/Command.ts";

const COMMAND_NAME = "whoami";
const DESCRIPTION = "returns your personal card";

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
    const pMember = pGuild.pMembers.find((pMember) =>
      pMember.id === interaction.user.id
    );
    if (!pMember || !interaction.member) {
      return {
        result: false,
        value: "could not find guild",
      };
    }

    const outcome = await interaction.reply({
      embeds: [
        createEmbed(
          interaction.member?.user?.username,
          null,
          "#ddff00",
          [
            {
              emote: "Level",
              role: pMember.level,
              inline: true,
            },
            {
              emote: "Regex",
              role: !pMember.regex || pMember.regex === "null"
                ? "not set"
                : pMember.regex,
              inline: true,
            },
            {
              emote: "Penalties",
              role: `${pMember.penalties ? pMember.penalties : 0}`,
              inline: true,
            },
            {
              emote: "Id",
              role: pMember.id,
              inline: false,
            },
          ],
          (interaction.member?.user as User)?.avatarURL() ?? null,
          null,
          true,
          null,
          null,
        ),
      ],
    });

    return {
      result: !!outcome,
      value: outcome ? "" : "could not send message",
    };
  },
} as Command;
