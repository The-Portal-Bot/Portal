import { SlashCommandBuilder } from "@discordjs/builders";
import {
  type ChatInputCommandInteraction,
  type ColorResolvable,
  InteractionContextType,
  type TextChannel,
} from "npm:discord.js";

import { getRole } from "../../libraries/guild.library.ts";
import {
  createEmbed,
  getJSONFromString,
  messageHelp,
} from "../../libraries/help.library.ts";
import { insertVendor } from "../../libraries/mongo.library.ts";
import type { Command } from "../../types/Command.ts";
import {
  type GiveRole,
  PGiveRole,
} from "../../types/classes/PGiveRole.class.ts";
import type { PGuild } from "../../types/classes/PGuild.class.ts";
import {
  Field,
  type ReturnPromise,
  ScopeLimit,
} from "../../types/classes/PTypes.interface.ts";

const COMMAND_NAME = "vendor";
const DESCRIPTION = "create a vendor message";

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
      option.setName("vendor_string").setDescription(
        "JSON string of vendor roles",
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

    const vendorString = interaction.options.getString("vendor_string");

    if (!vendorString) {
      return {
        result: false,
        value: messageHelp(
          "commands",
          "vendor",
          "vendor string must be provided",
        ),
      };
    }

    const roleMapJson = getJSONFromString(vendorString);

    if (!roleMapJson) {
      return {
        result: false,
        value: messageHelp(
          "commands",
          "vendor",
          "must be an array in JSON format (even for one role)",
        ),
      };
    }

    const roleMap = <GiveRole[]> roleMapJson;
    if (!Array.isArray(roleMap)) {
      return {
        result: false,
        value: messageHelp(
          "commands",
          "vendor",
          "must be an array in JSON format (even for one role)",
        ),
      };
    }

    if (multipleSameEmote(roleMap)) {
      return {
        result: false,
        value: messageHelp(
          "commands",
          "vendor",
          "can not have the same emote for multiple actions",
        ),
      };
    }

    if (!roleMap.every((rm) => rm.emote && rm.role)) {
      return {
        result: false,
        value: messageHelp(
          "commands",
          "vendor",
          "JSON syntax has spelling errors",
        ),
      };
    }

    roleMap.forEach((r) => {
      r.emote = r.emote.trim();
      r.role.forEach((role) => role.trim());
    });

    const roleEmbDisplay: Field[] = [];

    let returnValue = "";
    // give roles
    const failed = roleMap.some((r) => {
      if (interaction.guild) {
        const roleFetched = r.role.map((role) =>
          getRole(interaction.guild, role)
        );

        if (roleFetched.some((role) => !role)) {
          returnValue = "some of the given roles do not exist";
          return true;
        }

        roleEmbDisplay.push(
          new Field(
            r.emote,
            `\`\`\`${
              roleFetched.map((role) => `@${role ? role.name : "undefined"}`)
                .join(", ")
            }\`\`\``,
            true,
          ),
        );
      } else {
        returnValue = "could not fetch guild of message";
        return true;
      }
    });

    if (failed) {
      return {
        result: false,
        value: returnValue,
      };
    }

    const roleMessage = await createRoleMessage(
      <TextChannel> interaction.channel,
      pGuild,
      "Role Assigner",
      "React with emote to get or remove mentioned role",
      "#FF7F00",
      roleEmbDisplay,
      roleMap,
    );

    if (!roleMessage || !roleMessage.result) {
      return {
        result: false,
        value: "an error occurred while creating role message",
      };
    }

    return roleMessage;
  },
} as unknown as Command;

function createRoleMessage(
  channel: TextChannel,
  pGuild: PGuild,
  title: string,
  desc: string,
  colour: ColorResolvable,
  roleEmb: Field[],
  roleMap: GiveRole[],
): Promise<ReturnPromise> {
  return new Promise((resolve) => {
    const roleMessageEmb = createEmbed(
      title,
      desc,
      colour,
      roleEmb,
      null,
      null,
      null,
      null,
      null,
    );

    channel
      .send({ embeds: [roleMessageEmb] })
      .then((sentMessage) => {
        for (let i = 0; i < roleMap.length; i++) {
          sentMessage.react(roleMap[i].emote).catch((e) => {
            return resolve({
              result: false,
              value: `failed to react to message: ${e}`,
            });
          });
        }

        insertVendor(pGuild.id, new PGiveRole(sentMessage.id, roleMap))
          .then((r) => {
            return resolve({
              result: r,
              value: r
                ? "Keep in mind that Portal role must be over any role you wish it to be able to distribute.\n" +
                  "In order to change it, please head to your servers settings and put Portal role above them"
                : "failed to set new ranks",
            });
          })
          .catch(() => {
            return resolve({
              result: false,
              value: "failed to set new ranks",
            });
          });
      })
      .catch(() => {
        return resolve({
          result: false,
          value: "failed to create role assigner message",
        });
      });
  });
}

function multipleSameEmote(emoteMap: GiveRole[]) {
  for (let i = 0; i < emoteMap.length; i++) {
    for (let j = i + 1; j < emoteMap.length; j++) {
      if (emoteMap[i].emote === emoteMap[j].emote) {
        return true;
      }
    }
  }

  return false;
}
