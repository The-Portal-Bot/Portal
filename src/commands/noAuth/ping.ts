import { SlashCommandBuilder } from "@discordjs/builders";
import type { ChatInputCommandInteraction, Client } from "npm:discord.js";
import { createEmbed } from "../../libraries/help.library.ts";
import type { Command } from "../../types/Command.ts";
import type { PGuild } from "../../types/classes/PGuild.class.ts";
import {
  type ReturnPromise,
  ScopeLimit,
} from "../../types/classes/PTypes.interface.ts";

const COMMAND_NAME = "ping";
const DESCRIPTION = "pings portal";

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
    _pGuild: PGuild,
    client: Client,
  ): Promise<ReturnPromise> {
    const message = {
      embeds: [
        createEmbed(
          null,
          null,
          "#0093ff",
          null,
          null,
          null,
          false,
          null,
          null,
          undefined,
          {
            name: "Request sent",
            icon:
              "https://raw.githubusercontent.com/keybraker/Portal/master/src/assets/img/ping.gif",
          },
        ),
      ],
    };

    const outcome = await interaction.reply(message);

    if (!outcome) {
      return {
        result: false,
        value: "error while sending pong message",
      };
    }

    const editMessage = await outcome.edit({
      embeds: [
        createEmbed(
          null,
          null,
          "#0093ff",
          null,
          null,
          null,
          false,
          null,
          null,
          undefined,
          {
            name:
              `RTT latency\t${
                outcome.createdTimestamp - interaction.createdTimestamp
              } ms\n` +
              `Portal latency\t${client.ws.ping} ms`,
            icon:
              "https://raw.githubusercontent.com/keybraker/Portal/master/src/assets/img/ping.gif",
          },
        ),
      ],
    });

    return {
      result: !!editMessage,
      value: editMessage ? "" : "error while editing pong message",
    };
  },
} as unknown as Command;
