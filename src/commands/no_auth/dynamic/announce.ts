import { Client, Message, TextChannel } from "discord.js";
import { create_rich_embed } from "../../../libraries/help.library";
import { client_talk } from "../../../libraries/localisation.library";
import { GuildPrtl } from "../../../types/classes/GuildPrtl.class";
import { ReturnPormise } from "../../../types/interfaces/InterfacesPrtl.interface";

module.exports = async (
    message: Message, args: string[], guild_object: GuildPrtl, client: Client
): Promise<ReturnPormise> => {
    return new Promise((resolve) => {
        if (args.length === 0) {
            return resolve({
                result: false,
                value: 'you can run `./help announce for help'
            });
        }

        if (guild_object.announcement === '') {
            return resolve({
                result: false,
                value: 'there is no announcement channel'
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
                value: 'announcements channel could not be fetched'
            });
        }

        const rich_message = create_rich_embed(title, `@here ${body}`, '#022E4E', [], null, message.member, null, null, null)
        announcement_channel.send(rich_message);

        client_talk(client, guild_object, 'announce');

        return resolve({
            result: true,
            value: 'announcement was sent successfully'
        });
    });
};