import { Client, Message } from "discord.js";
import { joinUserVoiceChannelByMessage } from "../../libraries/help.library";
import { GuildPrtl } from "../../types/classes/GuildPrtl.class";
import { ReturnPormise } from "../../types/classes/TypesPrtl.interface";
import { SlashCommandBuilder } from '@discordjs/builders';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('join')
        .setDescription('tell Portal to join your voice channel'),
    async execute(
        message: Message, args: string[], guild_object: GuildPrtl, client: Client
    ): Promise<ReturnPormise> {
        const voiceConnection = await joinUserVoiceChannelByMessage(client, message, guild_object, true)
            .catch(e => { return Promise.reject(e); });

        if (!voiceConnection) {
            return Promise.reject('failed to join voice channel');
        }

        return {
            result: true,
            value: 'successfully joined voice channel'
        };
    }
};
