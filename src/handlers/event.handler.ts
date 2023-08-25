import { Channel, ChannelType, ChatInputCommandInteraction, Client, EmbedBuilder, Guild, GuildMember, Message, MessageReaction, PartialDMChannel, PartialGuildMember, PartialMessage, PartialMessageReaction, PartialUser, User, VoiceState } from 'discord.js';
import * as EventFunctions from '../events';
import { isUserAuthorised, logger } from '../libraries/help.library';
import { fetchGuildPreData, fetchGuildRest, insertMember } from '../libraries/mongo.library';
import { commandFetcher } from '../libraries/preprocessor.library';
import { ActiveCooldowns, AuthCommands, NoAuthCommands } from '../types/classes/PTypes.interface';
import { commandLoader } from './command.handler';

type HandledEvents = 'ready' | 'channelDelete' | 'guildCreate' | 'guildDelete' | 'guildMemberAdd' | 'guildMemberRemove' | 'messageDelete' | 'messageReactionAdd' | 'voiceStateUpdate';

interface EventMap {
  [key: string]: typeof EventFunctions[keyof typeof EventFunctions];
}

const eventFunctionMap: EventMap = {
  ready: EventFunctions.ready,
  channelDelete: EventFunctions.channelDelete,
  guildCreate: EventFunctions.guildCreate,
  guildDelete: EventFunctions.guildDelete,
  guildMemberAdd: EventFunctions.guildMemberAdd,
  guildMemberRemove: EventFunctions.guildMemberRemove,
  messageDelete: EventFunctions.messageDelete,
  messageReactionAdd: EventFunctions.messageReactionAdd,
  voiceStateUpdate: EventFunctions.voiceStateUpdate,
};

type Arguments =
    | { channel: Channel | PartialDMChannel }
    | { client: Client; guild: Guild }
    | { guild: Guild }
    | { member: GuildMember | PartialGuildMember }
    | { client: Client; message: Message<boolean> | PartialMessage }
    | { client: Client; messageReaction: MessageReaction | PartialMessageReaction; user: User | PartialUser }
    | { client: Client }
    | { client: Client; newState: VoiceState; oldState: VoiceState }

async function eventLoader(event: HandledEvents, args: Arguments) {
  const eventFunction = eventFunctionMap[event];

  if (!eventFunction) {
    logger.debug(`[event-handled] ${event} is unhandled`);
    return;
  }

  try {
    // @ts-expect-error args can be a multitude of things
    const response = await eventFunction(args);
    logger.info(`[event-handled] ${event} | ${response}`);
  } catch (e) {
    logger.error(new Error(`[event-rejected] ${event} | ${e}`));
  }
}

async function handleCommandInteraction(
  client: Client,
  interaction: ChatInputCommandInteraction,
  activeCooldowns: ActiveCooldowns
): Promise<{ content: string | EmbedBuilder[], ephemeral: boolean }> {
  if (!interaction || !interaction.user || !interaction.member || !interaction.guild || !interaction.channel) {
    return { content: 'interaction is missing data', ephemeral: false };
  }

  if (interaction.channel.type === ChannelType.DM || interaction.user.bot) {
    return { content: 'interaction was made in DM or by bot', ephemeral: false };
  }

  const pGuild = await fetchGuildPreData(interaction.guild.id, interaction.user.id);

  if (!pGuild) {
    logger.error(new Error('fetching guild pre data failed'));
    return { content: 'fetching guild pre data failed', ephemeral: false };
  }

  if (!pGuild.pMembers.some((pMember) => pMember.id === interaction.user.id)) {
    const insertResponse = await insertMember(interaction.guild.id, interaction.user.id);

    if (!insertResponse) {
      logger.error(new Error('failed to late-insert member'));
      return { content: 'failed to late-insert member', ephemeral: false };
    }

    if (interaction.guild) {
      logger.info(`late-insert ${interaction.user.id} to ${interaction.guild.name} [${interaction.guild.id}]`);
    }

    return { content: 'late-inserted member', ephemeral: false };
  }

  const commandName = interaction.commandName as AuthCommands | NoAuthCommands;

  const commandData = commandFetcher(commandName);

  if (!commandData) {
    return { content: `command ${interaction.commandName} does not exist`, ephemeral: false };
  }

  if (
    commandData.auth &&
    (interaction.member &&
    !isUserAuthorised(interaction.member as GuildMember /* needs better implementation */))
  ) {
    return { content: `you are not authorised to use ${interaction.commandName}`, ephemeral: false };
  }

  const pGuildRest = await fetchGuildRest(interaction.guild.id);

  if (!pGuildRest) {
    logger.error(new Error('fetching guild rest data failed'));
    return { content: 'fetching guild rest data failed', ephemeral: false };
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
    client,
    commandData.scopeLimit,
    commandData.time,
    activeCooldowns
  );

  if (!commandResponse) {
    logger.error(new Error(`something went wrong with command ${interaction.commandName}`));
    return { content: 'something went wrong', ephemeral: false };
  }

  const content = commandResponse.value !== '' ? commandResponse.value : 'command succeeded';
  const ephemeral = commandData.ephemeral;

  return { content, ephemeral };
}

export async function eventHandler(client: Client, activeCooldowns: ActiveCooldowns = { guild: [], member: [] }) {
  // This event will run if the bot starts, and logs in, successfully.
  client.once('ready', () => eventLoader('ready', { client }));
  // This event triggers when a channel is deleted
  client.on('channelDelete', (channel) => eventLoader('channelDelete', { channel }));
  // This event triggers when the bot joins a guild
  client.on('guildCreate', (guild) => eventLoader('guildCreate', { client, guild }));
  // this event triggers when the bot is removed from a guild
  client.on('guildDelete', (guild) => eventLoader('guildDelete', { guild }));
  // This event triggers when a new member joins a guild.
  client.on('guildMemberAdd', (member) => eventLoader('guildMemberAdd', { member }));
  // This event triggers when a new member leaves a guild.
  client.on('guildMemberRemove', (member) => eventLoader('guildMemberRemove', { member }));
  // This event triggers when a message is deleted
  client.on('messageDelete', (message) => eventLoader('messageDelete', { client, message }));
  // This event triggers when a member reacts to a message
  client.on('messageReactionAdd', (messageReaction, user) => eventLoader('messageReactionAdd', { client, messageReaction, user }));
  // This event triggers when a member joins or leaves a voice channel
  client.on('voiceStateUpdate', (oldState /* left channel */, newState /* joined channel */) => {
    if (oldState.channel?.id !== newState.channel?.id) {
      eventLoader('voiceStateUpdate', { client, oldState, newState });
    }
  });
  // This event will run when a slash command is called.
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;
    logger.info(`user ${interaction.user} called command ${interaction.commandName}`);

    const response = await handleCommandInteraction(client, interaction as ChatInputCommandInteraction, activeCooldowns);
    const reply = typeof response.content === 'string'
      ? { content: response.content, ephemeral: response.ephemeral }
      : { embeds: response.content, ephemeral: response.ephemeral };

    await interaction.reply(reply);
  });
}
