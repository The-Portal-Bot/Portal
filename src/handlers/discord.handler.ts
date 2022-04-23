import { CacheFactory, Client, ClientOptions, Intents, Options } from "discord.js";

export function clientHandler() {
    const cacheFactory: CacheFactory = Options.cacheWithLimits({ MessageManager: 200 });
    const intents = new Intents(32767);

    const clientOptions: ClientOptions = {
        makeCache: cacheFactory,
        partials: [
            'USER',
            'CHANNEL',
            'GUILD_MEMBER',
            'MESSAGE',
            'REACTION'
        ],
        intents: intents
    }

    return new Client(clientOptions);
}

export async function connectToDiscord(client: Client, token: string) {
    return client.login(token);
}