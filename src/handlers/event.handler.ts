import {
  Channel,
  ChannelType,
  ChatInputCommandInteraction,
  Client,
  Guild,
  GuildMember,
  Message,
  MessageReaction,
  PartialDMChannel,
  PartialGuildMember,
  PartialMessage,
  PartialMessageReaction,
  PartialUser,
  User,
  VoiceState,
} from 'discord.js';
import eventConfigJson from '../config.event.json';
import channelDelete from '../events/channelDelete.event';
import guildCreate from '../events/guildCreate.event';
import guildDelete from '../events/guildDelete.event';
import guildMemberAdd from '../events/guildMemberAdd.event';
import guildMemberRemove from '../events/guildMemberRemove.event';
import messageDelete from '../events/messageDelete.event';
import messageReactionAdd from '../events/messageReactionAdd.event';
import ready from '../events/ready.event';
import voiceStateUpdate from '../events/voiceStateUpdate.event';
import { isUserAuthorised, logger } from '../libraries/help.library';
import { fetchGuildPreData, fetchGuildRest, insertMember } from '../libraries/mongo.library';
import { commandFetcher } from '../libraries/preprocessor.library';
import { ActiveCooldowns, AuthCommands, NoAuthCommands, ReturnPromise } from '../types/classes/PTypes.interface';
import { commandLoader } from './command.handler';

type HandledEvents =
  | 'ready'
  | 'channelDelete'
  | 'guildCreate'
  | 'guildDelete'
  | 'guildMemberAdd'
  | 'guildMemberRemove'
  | 'messageDelete'
  | 'messageReactionAdd'
  | 'voiceStateUpdate';

async function eventLoader(
  event: HandledEvents,
  args:
    | { channel: Channel | PartialDMChannel }
    | { client: Client; guild: Guild }
    | { guild: Guild }
    | { member: GuildMember | PartialGuildMember }
    | { client: Client; message: Message<boolean> | PartialMessage }
    | { client: Client; messageReaction: MessageReaction | PartialMessageReaction; user: User | PartialUser }
    | { client: Client }
    | { client: Client; newState: VoiceState; oldState: VoiceState }
) {
  let eventFunction = undefined;
  switch (event) {
    case 'ready':
      eventFunction = ready;
      break;
    case 'channelDelete':
      eventFunction = channelDelete;
      break;
    case 'guildCreate':
      eventFunction = guildCreate;
      break;
    case 'guildDelete':
      eventFunction = guildDelete;
      break;
    case 'guildMemberAdd':
      eventFunction = guildMemberAdd;
      break;
    case 'guildMemberRemove':
      eventFunction = guildMemberRemove;
      break;
    case 'messageDelete':
      eventFunction = messageDelete;
      break;
    case 'messageReactionAdd':
      eventFunction = messageReactionAdd;
      break;
    case 'voiceStateUpdate':
      eventFunction = voiceStateUpdate;
      break;
    default:
      return;
  }

  const eventResponse: ReturnPromise | undefined = undefined;

  try {
    // @ts-expect-error Args can be a multitude of things
    eventFunction(args);
  } catch (e) {
    logger.error(new Error(`[event-rejected] ${event} | ${e}`));
  }

  if (eventResponse) {
    if (eventConfigJson.find((e) => e.name === event)) {
      logger.info(`[event-accepted] ${event} | ${eventResponse}`);
    } else if (process.env.DEBUG) {
      logger.info(`[event-accepted-debug] ${event} | ${eventResponse}`);
    }
  }
}

export async function eventHandler(
  client: Client,
  activeCooldowns: ActiveCooldowns = { guild: [], member: [] }
  // spamCache: SpamCache[] = []
) {
  // This event will run if the bot starts, and logs in, successfully.
  client.once('ready', () => eventLoader('ready', { client }));

  // This event triggers when the bot joins a guild.
  client.on('channelDelete', (channel: Channel | PartialDMChannel) => {
    eventLoader('channelDelete', {
      channel: channel,
    });
  });

  // This event triggers when the bot joins a guild
  client.on('guildCreate', (guild: Guild) =>
    eventLoader('guildCreate', {
      client,
      guild,
    })
  );

  // this event triggers when the bot is removed from a guild
  client.on('guildDelete', (guild: Guild) =>
    eventLoader('guildDelete', {
      guild,
    })
  );

  // This event triggers when a new member joins a guild.
  client.on('guildMemberAdd', (member: GuildMember) => {
    eventLoader('guildMemberAdd', {
      member: member,
    });
  });

  // This event triggers when a new member leaves a guild.
  client.on('guildMemberRemove', (member: GuildMember | PartialGuildMember) => {
    eventLoader('guildMemberRemove', { member });
  });

  // This event triggers when a message is deleted
  client.on('messageDelete', (message: Message | PartialMessage) => eventLoader('messageDelete', { client, message }));

  // This event triggers when a member reacts to a message
  client.on(
    'messageReactionAdd',
    (messageReaction: MessageReaction | PartialMessageReaction, user: User | PartialUser) =>
      eventLoader('messageReactionAdd', {
        client,
        messageReaction,
        user,
      })
  );

  // This event triggers when a member joins or leaves a voice channel
  client.on('voiceStateUpdate', (oldState: VoiceState, newState: VoiceState) => {
    const newChannel = newState.channel; // join channel
    const oldChannel = oldState.channel; // left channel

    // mute / unmute deafen user are ignored
    if (oldChannel && newChannel && newChannel.id === oldChannel.id) {
      return;
    }

    eventLoader('voiceStateUpdate', {
      client,
      oldState: oldState,
      newState: newState,
    });
  });

  // This event will run when a slash command is called.
  client.on('interactionCreate', async (interaction) => {
    // if (!interaction.isChatInputCommand()) {
    //   console.log('interaction.isChatInputCommand() :>> ', interaction.isChatInputCommand());
    // }

    if (!interaction.isCommand()) return;
    logger.info(`user ${interaction.user}/${interaction.member} called command ${interaction.commandName}`);

    const content = await handleInteractionCommand(client, interaction as ChatInputCommandInteraction, activeCooldowns);

    await interaction.reply({ content, ephemeral: true });
  });
}

async function handleInteractionCommand(
  client: Client,
  interaction: ChatInputCommandInteraction,
  activeCooldowns: ActiveCooldowns
): Promise<string> {
  if (!interaction || !interaction.user || !interaction.member || !interaction.guild || !interaction.channel) return 'interaction is missing data';
  if (interaction.channel.type === ChannelType.DM || interaction.user.bot) return 'interaction was made in DM or by bot';

  const pGuild = await fetchGuildPreData(interaction.guild.id, interaction.user.id);

  if (!pGuild) {
    logger.error(new Error('fetching guild pre data failed'));
    return 'fetching guild pre data failed';
  }

  if (!pGuild.pMembers.some((pMember) => pMember.id === interaction.user.id)) {
    const insertResponse = await insertMember(interaction.guild.id, interaction.user.id);

    if (!insertResponse) {
      logger.error(new Error('failed to late-insert member'));
      return 'failed to late-insert member';
    }

    if (interaction.guild) {
      logger.info(`late-insert ${interaction.user.id} to ${interaction.guild.name} [${interaction.guild.id}]`);
    }

    return 'late-inserted member';
  }

  const messageContent = interaction.options.getString('message');
  logger.info(interaction.options);
  logger.info(interaction.options);
  logger.info(`messageContent: ${messageContent}`);
  logger.info(`messageContent?.split(/ +/g): ${messageContent?.split(/ +/g)}`);

  const command = commandFetcher(
    interaction.commandName as AuthCommands | NoAuthCommands,
    messageContent?.split(/ +/g) ?? []
  );

  if (!command.commandOptions) {
    return `command ${interaction.commandName} does not exist`;
  }

  if (
    command.commandOptions.auth &&
    interaction.member &&
    !isUserAuthorised(interaction.member as GuildMember /* needs better implementation */)
  ) {
    return `you are not authorised to use ${interaction.commandName}`;
  }

  const pGuildRest = await fetchGuildRest(interaction.guild.id);

  if (!pGuildRest) {
    logger.error(new Error('fetching guild rest data failed'));
    return 'fetching guild rest data failed';
  }

  pGuild.pMembers = pGuildRest.pMembers;
  pGuild.pPolls = pGuildRest.pPolls;
  pGuild.ranks = pGuildRest.ranks;
  pGuild.musicQueue = pGuildRest.musicQueue;
  pGuild.announcement = pGuildRest.announcement;
  pGuild.locale = pGuildRest.locale;
  pGuild.announce = pGuildRest.announce;
  pGuild.premium = pGuildRest.premium;

  if (!command?.cmd) {
    return `command ${interaction.commandName} does not exist`;
  }

  const commandResponse = await commandLoader(
    interaction,
    command.cmd,
    command.args,
    pGuild,
    client,
    command.scopeLimit,
    command.commandOptions,
    activeCooldowns
  );

  logger.info('commandResponse: ', commandResponse);

  if (!commandResponse) {
    return 'something went wrong';
  } else if (commandResponse.result) {
    return commandResponse.value !== '' ? commandResponse.value : 'command succeeded'
  } else {
    return commandResponse.value !== '' ? commandResponse.value : 'command failed'
  }
}
