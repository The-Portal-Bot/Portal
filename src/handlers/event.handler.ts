import type {
  BaseInteraction,
  Client,
  DMChannel,
  Guild,
  GuildChannel,
  GuildMember,
  Message,
  MessageReaction,
  PartialGuildMember,
  PartialMessage,
  PartialMessageReaction,
  PartialUser,
  User,
  VoiceState,
} from "npm:discord.js";

import * as events from "../events/index.ts";
import type { ActiveCooldowns } from "../types/classes/PTypes.interface.ts";
import logger from "../utilities/log.utility.ts";

export function eventHandler(
  client: Client,
  activeCooldowns: ActiveCooldowns = { guild: [], member: [] },
): void {
  // This event will run if the bot starts, and logs in, successfully.
  client.once("ready", async () => await events.ready(client));
  // This event triggers when a channel is deleted
  client.on(
    "channelDelete",
    async (channel: DMChannel | GuildChannel) =>
      await events.channelDelete(channel),
  );
  // This event triggers when the bot joins a guild
  client.on(
    "guildCreate",
    async (guild: Guild) => await events.guildCreate(client, guild),
  );
  // this event triggers when the bot is removed from a guild
  client.on(
    "guildDelete",
    async (guild: Guild) => await events.guildDelete(guild),
  );
  // This event triggers when a new member joins a guild.
  client.on(
    "guildMemberAdd",
    async (member: GuildMember | PartialGuildMember) =>
      await events.guildMemberAdd(member),
  );
  // This event triggers when a new member leaves a guild.
  client.on(
    "guildMemberRemove",
    async (member: GuildMember | PartialGuildMember) =>
      await events.guildMemberRemove(member),
  );
  // This event triggers when a message is created
  client.on(
    "messageCreate",
    async (message: Message<boolean> | PartialMessage) =>
      await events.messageCreate(message),
  );
  // This event triggers when a message is deleted
  client.on(
    "messageDelete",
    async (message: Message<boolean> | PartialMessage) =>
      await events.messageDelete(message),
  );
  // This event triggers when a member reacts to a message
  client.on(
    "messageReactionAdd",
    async (
      messageReaction: MessageReaction | PartialMessageReaction,
      user: User | PartialUser,
    ) => await events.messageReactionAdd(client, messageReaction, user),
  );
  // This event triggers when a member joins or leaves a voice channel
  client.on(
    "voiceStateUpdate",
    async (oldState: VoiceState, newState: VoiceState) =>
      await events.voiceStateUpdate(client, oldState, newState),
  );
  // This event will run when a slash command is called.
  client.on(
    "interactionCreate",
    async (interaction: BaseInteraction) =>
      await events.interactionCreate(interaction, activeCooldowns),
  );

  logger.info("Event handlers registered");
}
