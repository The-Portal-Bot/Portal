import { Channel, Client, Guild, GuildMember, Message, MessageReaction, PartialDMChannel, PartialGuildMember, PartialMessage, PartialMessageReaction, PartialUser, User, VoiceState } from "discord.js";
import event_config_json from '../config.event.json';
import { logger } from "../libraries/help.library";
import { ReturnPormise } from "../types/classes/TypesPrtl.interface";

export async function eventLoader(event: string, args: any): Promise<void> {
    console.log('PEDO');
    const commandReturn: ReturnPormise = await require(`./events/${event}.event.js`)(args)
        .catch((e: string) => {
            logger.error(`[event-rejected] ${event} | ${e}`);
        });

    if (commandReturn) {
        if ((event_config_json.find(e => e.name === event))) {
            logger.info(`[event-accepted] ${event} | ${commandReturn}`);
        } else if (process.env.DEBUG) {
            logger.info(`[event-accepted-debug] ${event} | ${commandReturn}`);
        }
    }
}

async function eventHandler(client: Client) {
    // This event triggers when the bot joins a guild.
    client.on('channelDelete', (channel: Channel | PartialDMChannel) => {
        eventLoader('channelDelete', {
            'channel': channel
        });
    });

    // This event triggers when the bot joins a guild
    client.on('guildCreate', (guild: Guild) =>
        eventLoader('guildCreate', {
            'client': client,
            'guild': guild
        })
    );

    // this event triggers when the bot is removed from a guild
    client.on('guildDelete', (guild: Guild) =>
        eventLoader('guildDelete', {
            'guild': guild
        })
    );

    // This event triggers when a new member joins a guild.
    client.on('guildMemberAdd', (member: GuildMember) => {
        eventLoader('guildMemberAdd', {
            'member': member
        })
    });

    // This event triggers when a new member leaves a guild.
    client.on('guildMemberRemove', (member: GuildMember | PartialGuildMember) => {
        eventLoader('guildMemberRemove', {
            'member': member
        })
    });

    // This event triggers when a message is deleted
    client.on('messageDelete', (message: Message | PartialMessage) =>
        eventLoader('messageDelete', {
            'client': client,
            'message': message
        })
    );

    // This event triggers when a member reacts to a message
    client.on('messageReactionAdd', (messageReaction: MessageReaction | PartialMessageReaction, user: User | PartialUser) =>
        eventLoader('messageReactionAdd', {
            'client': client,
            'messageReaction': messageReaction,
            'user': user
        })
    );

    // This event will run if the bot starts, and logs in, successfully.
    client.on('ready', () =>
        eventLoader('ready', {
            'client': client
        })
    );

    // This event triggers when a member joins or leaves a voice channel
    client.on('voiceStateUpdate', (oldState: VoiceState, newState: VoiceState) => {
        const new_channel = newState.channel; // join channel
        const old_channel = oldState.channel; // left channel

        // mute / unmute  defean user are ignored
        if ((old_channel && new_channel) && (new_channel.id === old_channel.id)) {
            return;
        }

        eventLoader('voiceStateUpdate', {
            'client': client,
            'oldState': oldState,
            'newState': newState
        });
    });
}