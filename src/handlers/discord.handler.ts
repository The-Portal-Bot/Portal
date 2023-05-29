import { CacheFactory, Client, ClientOptions, GatewayIntentBits, Partials, Options } from 'discord.js';

export function clientHandler() {
  const makeCache: CacheFactory = Options.cacheWithLimits({ MessageManager: 200 });

  const partials = [
    Partials.User,
    Partials.Channel,
    Partials.GuildMember,
    Partials.Message,
    Partials.Reaction
  ];

  const intents = [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ];

  const clientOptions: ClientOptions = {
    makeCache,
    partials,
    intents,
  };

  return new Client(clientOptions);
}

export async function connectToDiscord(client: Client, token: string) {
  return client.login(token);
}
