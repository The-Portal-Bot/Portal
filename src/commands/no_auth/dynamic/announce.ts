import { Client, Message, TextChannel } from "discord.js";
import { create_rich_embed } from "../../../libraries/helpOps";
import { client_talk } from "../../../libraries/localisationOps";
import { GuildPrtl } from "../../../types/classes/GuildPrtl";
import { ReturnPormise } from "../../../types/interfaces/InterfacesPrtl";

module.exports = async (
    client: Client, message: Message, args: string[], guild_object: GuildPrtl
): Promise<ReturnPormise> => {
    return new Promise((resolve) => {
        if (!guild_object.announcement) {
            return resolve({ result: false, value: 'announcements channel has not been set yet' });
        }

        let body = args.join(' ').substr(0, args.join(' ').indexOf('|'));
        let title = args.join(' ').substr(args.join(' ').indexOf('|') + 1);

        if (body === '' && title !== '') {
            body = title;
            title = '';
        } else if (body === '' && title === '') {
            return resolve({ result: false, value: 'you can run `./help announce for help' });
        }

        const announcement_channel = <TextChannel>message?.guild?.channels.cache.find(c =>
            c.id === guild_object.announcement
        );
        if (!announcement_channel) {
            return resolve({ result: false, value: 'announcements channel could not be fetched' });
        }
        const rich_message = create_rich_embed(title, `@here ${body}`, '#022E4E', [], null, message.member, null, null, null)
        announcement_channel.send(rich_message);

        client_talk(client, guild_object, 'announce');

        return resolve({ result: true, value: 'announcement was sent successfully' });
    });
};