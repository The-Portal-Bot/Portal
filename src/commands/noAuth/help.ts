import { SlashCommandBuilder } from "@discordjs/builders";
import { type ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

import { AttributeBlueprints } from "../../blueprints/attribute.blueprint.ts";
import { PipeBlueprints } from "../../blueprints/pipe.blueprint.ts";
import { StructureBlueprint } from "../../blueprints/structure.blueprint.ts";
import { VariableBlueprints } from "../../blueprints/variable.blueprint.ts";
import { createEmbed, messageHelp } from "../../libraries/help.library.ts";
import type { Command } from "../../types/Command.ts";
import {
  type Field,
  type ReturnPromise,
  ScopeLimit,
} from "../../types/classes/PTypes.interface.ts";
import { AttributeDocumentation } from "./help/AttributeDocumentation.ts";
import { CommandDocumentation } from "./help/CommandDocumentation.ts";
import { PipeDocumentation } from "./help/PipeDocumentation.ts";
import { StructureDocumentation } from "./help/StructureDocumentation.ts";
import { VariableDocumentation } from "./help/VariableDocumentation.ts";

const COMMAND_NAME = "help";
const DESCRIPTION = "returns requested help page";

type Choice = { name: string; value: string };

// Generate choices dynamically from blueprints (commands loaded separately to avoid circular ref)
const noAuthCommandChoices: Choice[] = [
  { name: "about", value: "about" },
  { name: "announce", value: "announce" },
  { name: "bet", value: "bet" },
  { name: "corona", value: "corona" },
  { name: "crypto", value: "crypto" },
  { name: "focus", value: "focus" },
  { name: "help", value: "help" },
  { name: "join", value: "join" },
  { name: "leaderboard", value: "leaderboard" },
  { name: "leave", value: "leave" },
  { name: "level", value: "level" },
  { name: "ping", value: "ping" },
  { name: "poll", value: "poll" },
  { name: "ranks", value: "ranks" },
  { name: "roll", value: "roll" },
  { name: "run", value: "run" },
  { name: "spam_rules", value: "spam_rules" },
  { name: "state", value: "state" },
  { name: "weather", value: "weather" },
  { name: "whoami", value: "whoami" },
];

const authCommandChoices: Choice[] = [
  { name: "announcement", value: "announcement" },
  { name: "ban", value: "ban" },
  { name: "delete_messages", value: "delete_messages" },
  { name: "force", value: "force" },
  { name: "ignore", value: "ignore" },
  { name: "invite", value: "invite" },
  { name: "kick", value: "kick" },
  { name: "music", value: "music" },
  { name: "play", value: "play" },
  { name: "portal", value: "portal" },
  { name: "set", value: "set" },
  { name: "set_ranks", value: "set_ranks" },
  { name: "url", value: "url" },
  { name: "vendor", value: "vendor" },
];

const variableChoices: Choice[] = VariableBlueprints
  .map((v) => ({ name: v.name, value: v.name }))
  .slice(0, 25);

const pipeChoices: Choice[] = PipeBlueprints
  .map((p) => ({ name: p.name, value: p.name }))
  .slice(0, 25);

const attributeChoicesGlobal: Choice[] = AttributeBlueprints
  .filter((a) => a.name.startsWith("g."))
  .map((a) => ({ name: a.name, value: a.name }))
  .slice(0, 25);

const attributeChoicesPortal: Choice[] = AttributeBlueprints
  .filter((a) => a.name.startsWith("p.") && !a.name.startsWith("p.v."))
  .map((a) => ({ name: a.name, value: a.name }))
  .slice(0, 25);

const attributeChoicesVoice: Choice[] = AttributeBlueprints
  .filter((a) => a.name.startsWith("v.") || a.name.startsWith("p.v."))
  .map((a) => ({ name: a.name, value: a.name }))
  .slice(0, 25);

const attributeChoicesMember: Choice[] = AttributeBlueprints
  .filter((a) => a.name.startsWith("m."))
  .map((a) => ({ name: a.name, value: a.name }))
  .slice(0, 25);

const structureChoices: Choice[] = StructureBlueprint
  .map((s) => ({ name: s.name, value: s.name }))
  .slice(0, 25);

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
      option
        .setName("category")
        .setDescription("Category to get help for")
        .setRequired(true)
        .addChoices(
          { name: "All", value: "all" },
          { name: "Command description", value: "description_commands" },
          { name: "Variable description", value: "description_variables" },
          { name: "Pipe description", value: "description_pipes" },
          { name: "Attribute description", value: "description_attributes" },
          { name: "Structure description", value: "description_structures" },
          { name: "Command guide", value: "guide_commands" },
          { name: "Variable guide", value: "guide_variables" },
          { name: "Pipe guide", value: "guide_pipes" },
          { name: "Attribute guide", value: "guide_attributes" },
          { name: "Structure guide", value: "guide_structures" },
        )
    )
    .addStringOption((option) =>
      option
        .setName("command_public")
        .setDescription("Public command to get help for")
        .setRequired(false)
        .addChoices(...noAuthCommandChoices)
    )
    .addStringOption((option) =>
      option
        .setName("command_admin")
        .setDescription("Admin command to get help for")
        .setRequired(false)
        .addChoices(...authCommandChoices)
    )
    .addStringOption((option) =>
      option
        .setName("variable")
        .setDescription("Variable to get help for")
        .setRequired(false)
        .addChoices(...variableChoices)
    )
    .addStringOption((option) =>
      option
        .setName("pipe")
        .setDescription("Pipe to get help for")
        .setRequired(false)
        .addChoices(...pipeChoices)
    )
    .addStringOption((option) =>
      option
        .setName("attribute_global")
        .setDescription("Global attribute (g.*) to get help for")
        .setRequired(false)
        .addChoices(...attributeChoicesGlobal)
    )
    .addStringOption((option) =>
      option
        .setName("attribute_portal")
        .setDescription("Portal attribute (p.*) to get help for")
        .setRequired(false)
        .addChoices(...attributeChoicesPortal)
    )
    .addStringOption((option) =>
      option
        .setName("attribute_voice")
        .setDescription("Voice attribute (v.*) to get help for")
        .setRequired(false)
        .addChoices(...attributeChoicesVoice)
    )
    .addStringOption((option) =>
      option
        .setName("attribute_member")
        .setDescription("Member attribute (m.*) to get help for")
        .setRequired(false)
        .addChoices(...attributeChoicesMember)
    )
    .addStringOption((option) =>
      option
        .setName("structure")
        .setDescription("Structure to get help for")
        .setRequired(false)
        .addChoices(...structureChoices)
    ),
  execute(
    interaction: ChatInputCommandInteraction,
  ): ReturnPromise {
    const category = interaction.options.getString("category");
    const commandPublic = interaction.options.getString("command_public");
    const commandAdmin = interaction.options.getString("command_admin");
    const variable = interaction.options.getString("variable");
    const pipe = interaction.options.getString("pipe");
    const attributeGlobal = interaction.options.getString("attribute_global");
    const attributePortal = interaction.options.getString("attribute_portal");
    const attributeVoice = interaction.options.getString("attribute_voice");
    const attributeMember = interaction.options.getString("attribute_member");
    const structure = interaction.options.getString("structure");

    const item = commandPublic ?? commandAdmin ?? variable ?? pipe ??
      attributeGlobal ?? attributePortal ?? attributeVoice ?? attributeMember ?? structure;

    if (!category) {
      return {
        result: false,
        value: messageHelp("commands", "help", "category must be provided"),
      };
    }

    if (category === "all") {
      const response = simpleReply();
      return { result: !!response, value: response };
    }

    if (category.startsWith("description")) {
      const response = propertyReply(category.split("_")[1], item);
      return { result: !!response, value: response };
    }

    if (category.startsWith("guide")) {
      const response = guideReply(category.split("_")[1]);
      return { result: !!response, value: response };
    }

    return { result: false, value: messageHelp("commands", "help") };
  },
} as unknown as Command;

const commandDocumentation = new CommandDocumentation();
const variableDocumentation = new VariableDocumentation();
const pipeDocumentation = new PipeDocumentation();
const attributeDocumentation = new AttributeDocumentation();
const structureDocumentation = new StructureDocumentation();

const helpArray: Field[] = [
  {
    emote: null,
    role: "**[Commands](https://portal-bot.xyz/docs/commands/description)**",
    inline: false,
  },
  {
    emote: "`/help category:Command description`",
    role:
      "Commands are mini programs you can use to get a response or action\n",
    inline: false,
  },
  {
    emote: null,
    role:
      "**[Text Interpreter](https://portal-bot.xyz/docs/interpreter/description)**",
    inline: false,
  },
  {
    emote: "`/help category:Variable description`",
    role: "Variables are live data about the current state of things\n" +
      "_for more click [here](https://portal-bot.xyz/docs/interpreter/objects/variables/description)_",
    inline: false,
  },
  {
    emote: "`/help category:Pipe description`",
    role:
      "Pipes are mini-programs that manipulate text or even variables and attributes\n" +
      "_for more click [here](https://portal-bot.xyz/docs/interpreter/objects/pipes/description)_",
    inline: false,
  },
  {
    emote: "`/help category:Attribute description`",
    role:
      "Attributes are options that can be altered with **[/set](https://portal-bot.xyz/docs/commands/detailed/set)** command\n" +
      "_for more click [here](https://portal-bot.xyz/docs/interpreter/objects/attributes/description)_",
    inline: false,
  },
  {
    emote: "`/help category:Structure description`",
    role: "Structures are rules to further manipulate the text outcome\n" +
      "_for more click [here](https://portal-bot.xyz/docs/interpreter/objects/structures/description)_",
    inline: false,
  },
  {
    emote: null,
    role: "**Guides**",
    inline: false,
  },
  {
    emote: "`/help category:<type> guide`",
    role:
      "Get a step-by-step guide for commands, variables, pipes, attributes, or structures",
    inline: false,
  },
  {
    emote: null,
    role: "**Specific help**",
    inline: false,
  },
  {
    emote: "`/help category:Command description item:<name>`",
    role: "Get detailed help for a specific item\n" +
      "_(e.g., `/help category:Variable description item:year`)_",
    inline: false,
  },
  {
    emote: null,
    role:
      "**[FAQ](https://portal-bot.xyz/help#faq)** _frequently asked questions_",
    inline: false,
  },
];

function simpleReply() {
  const helpMessage = [
    createEmbed(
      "Help Card",
      "Detailed documentation at [portal-bot.xyz/docs](https://portal-bot.xyz/docs)\n\n" +
        "> make a member an **admin**, give role `p.admin`\n" +
        "> make a member an **moderator**, give role `p.mod`\n" +
        "> make a member a **dj**, give role `p.dj`\n" +
        "> to **whitelist** a member, give role `p.mod`\n" +
        "> to **ignore** a member, give role `p.ignore`\n" +
        "> for more click [here](https://portal-bot.xyz/help#q-how-can-i-give-members-authority)",
      "#05d1ff",
      helpArray,
      null,
      null,
      true,
      null,
      null,
    ),
  ];

  return helpMessage;
}

function propertyReply(type: string, specific: string | null) {
  if (specific) {
    const detailed = commandDocumentation.getHelpDetailed(specific) ||
      variableDocumentation.getHelpDetailed(specific) ||
      pipeDocumentation.getHelpDetailed(specific) ||
      attributeDocumentation.getHelpDetailed(specific) ||
      structureDocumentation.getHelpDetailed(specific);

    if (detailed instanceof EmbedBuilder) {
      return [detailed];
    } else {
      return messageHelp(
        "commands",
        "help",
        `*${specific}* does not exist in portal`,
      );
    }
  }

  switch (type) {
    case "commands":
      return commandDocumentation.getHelp();
    case "variables":
      return variableDocumentation.getHelp();
    case "pipes":
      return pipeDocumentation.getHelp();
    case "attributes":
      return attributeDocumentation.getHelp();
    case "structures":
      return structureDocumentation.getHelp();
  }

  return messageHelp("commands", "help", `*${type}* does not exist in portal`);
}

function guideReply(type: string) {
  let guide: EmbedBuilder | null = null;

  switch (type) {
    case "commands":
      guide = commandDocumentation.getGuide();
      break;
    case "variables":
      guide = variableDocumentation.getGuide();
      break;
    case "pipes":
      guide = pipeDocumentation.getGuide();
      break;
    case "attributes":
      guide = attributeDocumentation.getGuide();
      break;
    case "structures":
      guide = structureDocumentation.getGuide();
      break;
  }

  if (!guide) {
    return messageHelp(
      "commands",
      "help",
      `*${type}* does not exist in portal`,
    );
  }

  return [guide];
}
