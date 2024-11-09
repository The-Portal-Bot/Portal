import { BaseInteraction, ChannelType, ChatInputCommandInteraction, EmbedBuilder, GuildMember } from 'discord.js';

import { commandLoader } from '../handlers/command.handler.js';
import { isUserAuthorised } from '../libraries/help.library.js';
import { fetchGuildPreData, fetchGuildRest, insertMember } from '../libraries/mongo.library.js';
import { commandFetcher } from '../libraries/preprocessor.library.js';
import { ActiveCooldowns, AuthCommands, NoAuthCommands } from '../types/classes/PTypes.interface.js';
import logger from '../utilities/log.utility.js';

function validateBaseInteractionIsCommand(interaction: BaseInteraction): interaction is ChatInputCommandInteraction {
  return interaction.isCommand();
}

export async function interactionCreate(interaction: BaseInteraction, activeCooldowns: ActiveCooldowns): Promise<void> {
  if (!validateBaseInteractionIsCommand(interaction)) {
    return;
  }

  if (!interaction || !interaction.user || !interaction.member || !interaction.guild || !interaction.channel) {
    return await InteractionReply(interaction, {
      content: 'interaction is missing data',
      ephemeral: false,
    });
  }

  if (interaction.channel.type === ChannelType.DM || interaction.user.bot) {
    return await InteractionReply(interaction, {
      content: 'interaction was made in DM or by bot',
      ephemeral: false,
    });
  }

  const pGuild = await fetchGuildPreData(interaction.guild.id, interaction.user.id);

  if (!pGuild) {
    logger.error('fetching guild pre data failed');
    return await InteractionReply(interaction, { content: 'fetching guild pre data failed', ephemeral: false });
  }

  if (!pGuild.pMembers.some((pMember) => pMember.id === interaction.user.id)) {
    const insertResponse = await insertMember(interaction.guild.id, interaction.user.id);

    if (!insertResponse) {
      logger.error('failed to late-insert member');
      return await InteractionReply(interaction, { content: 'failed to late-insert member', ephemeral: false });
    }

    if (interaction.guild) {
      logger.info(`late-insert ${interaction.user.id} to ${interaction.guild.name} [${interaction.guild.id}]`);
    }

    return await InteractionReply(interaction, { content: 'late-inserted member', ephemeral: false });
  }

  const commandName = interaction.commandName as AuthCommands | NoAuthCommands;
  const commandData = commandFetcher(commandName);

  if (!commandData) {
    return await InteractionReply(interaction, {
      content: `command ${interaction.commandName} does not exist`,
      ephemeral: false,
    });
  }

  if (
    commandData.auth &&
    interaction.member &&
    !isUserAuthorised(interaction.member as GuildMember /* needs better implementation */)
  ) {
    return await InteractionReply(interaction, {
      content: `you are not authorised to use ${interaction.commandName}`,
      ephemeral: false,
    });
  }

  const pGuildRest = await fetchGuildRest(interaction.guild.id);

  if (!pGuildRest) {
    logger.error('fetching guild rest data failed');
    return await InteractionReply(interaction, { content: 'fetching guild rest data failed', ephemeral: false });
  }

  pGuild.pMembers = pGuildRest.pMembers;
  pGuild.pPolls = pGuildRest.pPolls;
  pGuild.ranks = pGuildRest.ranks;
  pGuild.musicQueue = pGuildRest.musicQueue;
  pGuild.announcement = pGuildRest.announcement;
  pGuild.locale = pGuildRest.locale;
  pGuild.announce = pGuildRest.announce;
  pGuild.premium = pGuildRest.premium;

  const commandResponse = await commandLoader(
    interaction,
    commandName,
    pGuild,
    commandData.scopeLimit,
    commandData.time,
    activeCooldowns,
  );

  if (!commandResponse) {
    logger.error(`something went wrong with command ${interaction.commandName}`);
    return await InteractionReply(interaction, { content: 'something went wrong', ephemeral: false });
  }

  const content = commandResponse.value !== '' ? commandResponse.value : 'command succeeded';
  const ephemeral = commandData.ephemeral;

  return await InteractionReply(interaction, { content, ephemeral });
}

async function InteractionReply(
  interaction: ChatInputCommandInteraction,
  response: { content: string | EmbedBuilder[]; ephemeral: boolean },
): Promise<void> {
  if (interaction.replied) {
    return;
  }

  const reply =
    typeof response.content === 'string'
      ? { content: response.content, ephemeral: response.ephemeral }
      : { embeds: response.content, ephemeral: response.ephemeral };

  if (interaction.isRepliable()) {
    await interaction.reply(reply);
  }
}
