import { SlashCommandBuilder } from "@discordjs/builders";
import type {
  ChatInputCommandInteraction,
  ColorResolvable,
  TextChannel,
} from "npm:discord.js";
import { createEmbed, messageHelp } from "../../libraries/help.library.ts";
import { insertPoll } from "../../libraries/mongo.library.ts";
import type { Command } from "../../types/Command.ts";
import type { PGuild } from "../../types/classes/PGuild.class.ts";
import type { PPoll } from "../../types/classes/PPoll.class.ts";
import {
  type Field,
  type ReturnPromise,
  ScopeLimit,
} from "../../types/classes/PTypes.interface.ts";

const COMMAND_NAME = "poll";
const DESCRIPTION = "create a new poll";
const emoji = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"];

export default {
  time: 0,
  premium: false,
  ephemeral: true,
  auth: false,
  scopeLimit: ScopeLimit.NONE,
  slashCommand: new SlashCommandBuilder()
    .setName(COMMAND_NAME)
    .setDescription(DESCRIPTION)
    .addStringOption((option) =>
      option.setName("title").setDescription("Poll title").setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("option_1").setDescription("option 1").setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("option_2").setDescription("option 2").setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("option_3").setDescription("option 3").setRequired(false)
    )
    .addStringOption((option) =>
      option.setName("option_4").setDescription("option 4").setRequired(false)
    )
    .addStringOption((option) =>
      option.setName("option_5").setDescription("option 5").setRequired(false)
    )
    .addStringOption((option) =>
      option.setName("option_6").setDescription("option 6").setRequired(false)
    ),
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

    const title = interaction.options.getString("title");

    const option_1 = interaction.options.getString("option_1");
    const option_2 = interaction.options.getString("option_2");
    const option_3 = interaction.options.getString("option_3");
    const option_4 = interaction.options.getString("option_4");
    const option_5 = interaction.options.getString("option_5");
    const option_6 = interaction.options.getString("option_6");

    if (!title || !option_1 || !option_2) {
      return {
        result: false,
        value: messageHelp("commands", "poll"),
      };
    }

    const pollMap = [option_1, option_2];

    if (option_3) {
      pollMap.push(option_3);
    }
    if (option_4) {
      pollMap.push(option_4);
    }
    if (option_5) {
      pollMap.push(option_5);
    }
    if (option_6) {
      pollMap.push(option_6);
    }

    pollMap.filter((poll) => !!poll).map((poll) => poll.trim());

    const pollMapField = pollMap.map((p, i) => {
      return <Field> { emote: emoji[i], role: p, inline: true };
    });

    const response = await createRoleMessage(
      <TextChannel> interaction.channel,
      pGuild,
      title,
      "",
      "#9900ff",
      pollMapField,
      interaction.user.id,
    );

    if (!response) {
      return {
        result: false,
        value: "error creating role message",
      };
    }

    return {
      result: response.result,
      value: response.result ? "" : response.value,
    };
  },
} as unknown as Command;

async function createRoleMessage(
  channel: TextChannel,
  pGuild: PGuild,
  title: string,
  desc: string,
  colour: ColorResolvable,
  pollMap: Field[],
  memberId: string,
): Promise<ReturnPromise> {
  const roleMessageEmbed = createEmbed(
    title,
    desc,
    colour,
    pollMap,
    null,
    null,
    true,
    null,
    null,
  );

  const sentMessage = await channel.send({ embeds: [roleMessageEmbed] });

  if (!sentMessage) {
    return {
      result: false,
      value: "failed to create role assigner message",
    };
  }

  const reactionCheckered = await sentMessage.react("🏁");

  if (!reactionCheckered) {
    return {
      result: true,
      value: "failed to react to message",
    };
  }

  for (let i = 0; i < pollMap.length; i++) {
    if (typeof pollMap[i].emote === "string") {
      sentMessage.react(<string> pollMap[i].emote).catch((e) => {
        return {
          result: true,
          value: `failed to react to message: ${e}`,
        };
      });
    }
  }

  const poll: PPoll = { messageId: sentMessage.id, memberId: memberId };
  const newPoll = await insertPoll(pGuild.id, poll);

  if (!newPoll) {
    return {
      result: false,
      value: "failed to set new ranks",
    };
  }

  return {
    result: newPoll,
    value: newPoll ? "successfully created poll" : "failed to create poll",
  };
}
