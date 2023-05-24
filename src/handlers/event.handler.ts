import {
  APIInteractionGuildMember,
  BaseInteraction,
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
import {
  isMessageDeleted,
  isUserAuthorised,
  logger,
  markMessageAsDeleted,
  messageReply,
} from '../libraries/help.library';
import { messageSpamCheck } from '../libraries/mod.library';
import { fetchGuildPreData, fetchGuildRest, insertMember } from '../libraries/mongo.library';
import { commandFetcher, messageContentDecipher, portalPreprocessor } from '../libraries/preprocessor.library';
import { ActiveCooldowns, ReturnPromise, SpamCache } from '../types/classes/PTypes.interface';
import { authCommands, commandLoader, noAuthCommands } from './command.handler';

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
  activeCooldowns: ActiveCooldowns = { guild: [], member: [] },
  spamCache: SpamCache[] = []
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

    const reply = await handleInteractionCommand(interaction as ChatInputCommandInteraction);

    if (reply) {
      await interaction.reply({ content: reply, ephemeral: true });
    } else {
      await interaction.reply({ content: ' Please retry', ephemeral: true });
    }
  });

  // runs on every single message received, from anywhere
  client.on('messageCreate', async (message: Message) => {
    handleMessageCommand(client, message, activeCooldowns, spamCache);
  });
}

async function handleMessageCommand(
  client: Client,
  message: Message,
  activeCooldowns: ActiveCooldowns = { guild: [], member: [] },
  spamCache: SpamCache[] = []
) {
  logger.log('handleCommand: ', message.content);
  if (!message || !message.member || !message.guild) return;
  if (message.channel.type === ChannelType.DM || message.author.bot) return;

  const pGuild = await fetchGuildPreData(message.guild.id, message.author.id);

  if (!pGuild) {
    logger.error(new Error(`Fetching guild pre data failed`));
    return false;
  }

  if (pGuild.pMembers.length === 0 && message.guild) {
    insertMember(message.guild.id, message.author.id)
      .then(() => {
        if (message.guild) {
          logger.info(`late-insert ${message.author.id} to ${message.guild.name} [${message.guild.id}]`);
        }
      })
      .catch((e) => {
        logger.error(new Error(`failed to late-insert member: ${e}`));
      });

    return true;
  }

  messageSpamCheck(message, pGuild, spamCache);

  if (await portalPreprocessor(message, pGuild)) {
    // preprocessor has handled the message
    return true;
  }

  // Ignore any message that does not start with prefix
  if (message.content.indexOf(pGuild.prefix) !== 0) {
    if (message.content === 'prefix') {
      messageReply(true, message, `portal's prefix is \`${pGuild.prefix}\``).catch((e) => {
        logger.error(new Error(`failed to send message: ${e}`));
      });

      if (isMessageDeleted(message)) {
        const deletedMessage = await message.delete().catch((e) => {
          logger.error(new Error(`failed to delete message: ${e}`));
        });

        if (deletedMessage) {
          markMessageAsDeleted(deletedMessage);
        }
      }
    }

    return false;
  }

  const { cmd, args } = messageContentDecipher(message.content, pGuild);

  if (!cmd) {
    return false;
  }

  const command = commandFetcher(cmd, args);

  if (!command.commandOptions) {
    return false;
  }

  if (command.commandOptions.auth && message.member) {
    if (!isUserAuthorised(message.member)) {
      messageReply(false, message, 'you are not authorised to use this command', true, true).catch((e) => {
        logger.error(new Error(`failed to send message: ${e}`));
      });

      return false;
    }
  }

  if (!message.guild) {
    logger.error(new Error('could not fetch guild of message'));
    return false;
  }

  const pGuildRest = await fetchGuildRest(message.guild.id);

  if (!pGuildRest) {
    logger.error(new Error(`Fetching guild rest data failed`));
    return false;
  }

  pGuild.pMembers = pGuildRest.pMembers;
  pGuild.pPolls = pGuildRest.pPolls;
  pGuild.ranks = pGuildRest.ranks;
  pGuild.musicQueue = pGuildRest.musicQueue;
  pGuild.announcement = pGuildRest.announcement;
  pGuild.locale = pGuildRest.locale;
  pGuild.announce = pGuildRest.announce;
  pGuild.premium = pGuildRest.premium;

  if (!command.commandOptions || !command?.cmd) {
    return false;
  }

  commandLoader(
    client,
    message,
    command.cmd,
    command.args,
    command.type,
    command.commandOptions,
    pGuild,
    activeCooldowns
  ).catch();
}

async function handleInteractionCommand(interaction: ChatInputCommandInteraction): Promise<string | undefined> {
  if (!interaction || !interaction.user || !interaction.member || !interaction.guild || !interaction.channel) return;
  if (interaction.channel.type === ChannelType.DM || interaction.user.bot) return;

  const pGuild = await fetchGuildPreData(interaction.guild.id, interaction.user.id);

  if (!pGuild) {
    logger.error(new Error(`Fetching guild pre data failed`));
    return;
  }

  if (!pGuild.pMembers.some((pMember) => pMember.id === interaction.user.id)) {
    const insertResponse = await insertMember(interaction.guild.id, interaction.user.id);

    if (!insertResponse) {
      logger.error(new Error(`failed to late-insert member`));
      return;
    }

    if (interaction.guild) {
      logger.info(`late-insert ${interaction.user.id} to ${interaction.guild.name} [${interaction.guild.id}]`);
    }

    return;
  }

  const messageContent = interaction.options.getString('message');

  const command = commandFetcher(
    interaction.commandName as authCommands | noAuthCommands,
    messageContent?.split(/ +/g) ?? []
  );

  if (!command.commandOptions) {
    return;
  }

  if (command.commandOptions.auth && interaction.member) {
    // needs better implementation
    if (!isUserAuthorised(interaction.member as GuildMember)) {
      // messageReply(false, interaction, 'you are not authorised to use this command', true, true).catch((e) => {
      //   logger.error(new Error(`failed to send message: ${e}`));
      // });
      return;
    }
  }

  const pGuildRest = await fetchGuildRest(interaction.guild.id);

  if (!pGuildRest) {
    logger.error(new Error(`Fetching guild rest data failed`));
    return;
  }

  pGuild.pMembers = pGuildRest.pMembers;
  pGuild.pPolls = pGuildRest.pPolls;
  pGuild.ranks = pGuildRest.ranks;
  pGuild.musicQueue = pGuildRest.musicQueue;
  pGuild.announcement = pGuildRest.announcement;
  pGuild.locale = pGuildRest.locale;
  pGuild.announce = pGuildRest.announce;
  pGuild.premium = pGuildRest.premium;

  return `Command ${interaction.commandName} is not yet implemented`;

  // if (!command.commandOptions || !command?.cmd) {
  //   return;
  // }
  //
  // commandLoader(
  //   client,
  //   interaction,
  //   command.cmd,
  //   command.args,
  //   command.type,
  //   command.commandOptions,
  //   pGuild,
  //   activeCooldowns
  // ).catch();
}
