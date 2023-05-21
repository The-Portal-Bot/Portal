import { DiscordGatewayAdapterCreator, DiscordGatewayAdapterLibraryMethods } from '@discordjs/voice';
import { GatewayVoiceServerUpdateDispatchData } from 'discord-api-types/v9';
import { Client, Constants, Events, GatewayDispatchEvents, Guild, Snowflake, Status, VoiceChannel } from 'discord.js';

const adapters = new Map<Snowflake, DiscordGatewayAdapterLibraryMethods>();
const trackedClients = new Set<Client>();

/**
 * Tracks a Discord.js client, listening to VOICE_SERVER_UPDATE and VOICE_STATE_UPDATE events
 *
 * @param client - The Discord.js Client to track
 */
function trackClient(client: Client) {
  if (trackedClients.has(client)) return;
  trackedClients.add(client);
  client.ws.on(GatewayDispatchEvents.VoiceServerUpdate, (payload: GatewayVoiceServerUpdateDispatchData) => {
    adapters.get(payload.guild_id)?.onVoiceServerUpdate(payload);
  });
  client.ws.on(GatewayDispatchEvents.VoiceStateUpdate, (payload: any) => {
    if (payload.d.guild_id && payload.d.session_id && payload.d.user_id === client.user?.id) {
      adapters.get(payload.d.guild_id)?.onVoiceStateUpdate(payload);
    }
  });
  client.on(Events.ShardDisconnect, (_, shardId) => {
    const guilds = trackedShards.get(shardId);
    if (guilds) {
      for (const guildID of guilds.values()) {
        adapters.get(guildID)?.destroy();
      }
    }
    trackedShards.delete(shardId);
  });
}

const trackedShards = new Map<number, Set<Snowflake>>();

function trackGuild(guild: Guild) {
  let guilds = trackedShards.get(guild.shardId);
  if (!guilds) {
    guilds = new Set();
    trackedShards.set(guild.shardId, guilds);
  }
  guilds.add(guild.id);
}

/**
 * Creates an adapter for a Voice Channel.
 * 
 * @param channel - The channel to create the adapter for
 */
export function createDiscordJSAdapter(channel: VoiceChannel): DiscordGatewayAdapterCreator {
  return (methods) => {
    adapters.set(channel.guild.id, methods);
    trackClient(channel.client);
    trackGuild(channel.guild);
    return {
      sendPayload(data) {
        if (channel.guild.shard.status === Status.Ready) {
          channel.guild.shard.send(data);
          return true;
        }
        return false;
      },
      destroy() {
        return adapters.delete(channel.guild.id);
      },
    };
  };
}