import { ChannelType, GuildChannelCreateOptions, Message } from "discord.js";
import { createChannel } from "../../libraries/guild.library";
import { messageHelp } from "../../libraries/help.library";
import { insertPortal } from "../../libraries/mongo.library";
import { PGuild } from "../../types/classes/PGuild.class";
import { IPChannel, PChannel } from "../../types/classes/PPortalChannel.class";
import { ReturnPromise } from "../../types/classes/PTypes.interface";
import { SlashCommandBuilder } from '@discordjs/builders';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('portal')
        .setDescription('create portal channel'),
    async execute(
        message: Message, args: string[], pGuild: PGuild
    ): Promise<ReturnPromise> {
        return new Promise((resolve) => {
            if (args.length === 0) {
                return resolve({
                    result: false,
                    value: messageHelp('commands', 'portal')
                });
            }

            if (!message.guild) {
                return resolve({
                    result: true,
                    value: 'guild could not be fetched'
                });
            }

            if (!message.member) {
                return resolve({
                    result: true,
                    value: 'member could not be fetched'
                });
            }

            const current_guild = message.guild;
            const current_member = message.member;

            let portal_channel: string = args.join(' ').substr(0, args.join(' ').indexOf('|'));
            let portal_category: string | null = args.join(' ').substr(args.join(' ').indexOf('|') + 1);

            if (portal_channel === '' && portal_category !== '') {
                portal_channel = portal_category;
                portal_category = null;
            }

            const portal_options: GuildChannelCreateOptions = {
                name: 'portal',
                topic: `by Portal, channels on demand`,
                type: ChannelType.GuildVoice,
                bitrate: 32000,
                userLimit: 1
            };

            const voice_regex = pGuild.premium
                // ? 'G$#-P$member_count | $status_list'
                ? `$#:$member_count {{
                "if": "$status_count", "is": "===", "with": "1",
                "yes": "$status_list", "no": "$status_list|acronym"
            }}`
                : 'Channel $#';

            createChannel(current_guild, portal_channel, portal_options, portal_category)
                .then(r_channel => {
                    const new_portal = new PChannel(r_channel, current_member.id,
                        true, portal_channel, voice_regex, [], false, null, pGuild.locale, true, true, 0, false);

                    insertPortal(pGuild.id, new_portal as IPChannel)
                        .then(r_portal => {
                            if (r_portal) {
                                return resolve({
                                    result: true,
                                    value: 'portal channel has been created.\n' +
                                        'Keep in mind that due to Discord\'s limitations,\n' +
                                        'channel names will be updated on a five minute interval'
                                });
                            } else {
                                return resolve({
                                    result: false,
                                    value: 'portal channel failed to be created'
                                });
                            }
                        })
                        .catch(e => {
                            return resolve({
                                result: false,
                                value: `portal channel failed to be created: ${e}`
                            });
                        });
                })
                .catch(e => {
                    return resolve({
                        result: false,
                        value: `an error occurred while creating channel: ${e}`
                    });
                });
        });
    }
};
