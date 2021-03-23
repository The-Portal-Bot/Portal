import { Client, Message, TextChannel } from "discord.js";
import { create_rich_embed, logger, message_help } from "../../libraries/help.library";
import { client_talk } from "../../libraries/localisation.library";
import { GuildPrtl } from "../../types/classes/GuildPrtl.class";
import { ReturnPormise } from "../../types/classes/TypesPrtl.interface";

module.exports = async (
    message: Message, args: string[], guild_object: GuildPrtl, client: Client
): Promise<ReturnPormise> => {
    return new Promise((resolve) => {
        if (args.length === 0) {
            return resolve({
                result: false,
                value: message_help('commands', 'announce')
            });
        }

        if (guild_object.announcement === '') {
            return resolve({
                result: false,
                value: message_help('commands', 'announce', 'there is no announcement channel')
            });
        }

        let body = args.join(' ').substr(0, args.join(' ').indexOf('|'));
        let title = args.join(' ').substr(args.join(' ').indexOf('|') + 1);

        if (body === '' && title !== '') {
            body = title;
            title = '';
        }

        const announcement_channel = <TextChannel>message?.guild?.channels.cache
            .find(c => c.id === guild_object.announcement);

        if (!announcement_channel) {
            return resolve({
                result: false,
                value: message_help('commands', 'announce', 'announcements channel does not exist')
            });
        }

        const rich_message = create_rich_embed(
            title,
            `@here ${body}`,
            '#022E4E',
            [],
            null,
            message.member,
            null,
            null,
            null
        );

        announcement_channel.send(rich_message)
            .then(message => {
                logger.log({ level: 'info', type: 'none', message: `announcement message [${message.id}] sent` });
                client_talk(client, guild_object, 'announce');

                return resolve({
                    result: true,
                    value: 'announcement was sent successfully'
                });
            })
            .catch(error => {
                logger.log({ level: 'error', type: 'none', message: new Error(`could not send message / ${error}`).toString() });

                return resolve({
                    result: false,
                    value: 'could not send message (missing permissions)'
                });
            });
    });
};