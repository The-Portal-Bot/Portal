import { Client, Message, TextChannel } from "discord.js";
import { create_rich_embed } from "../libraries/helpOps";
import { client_talk } from "../libraries/localizationOps";
import { GuildPrtl } from "../types/classes/GuildPrtl";

module.exports = async (args: {
    client: Client, message: Message, args: string[],
    guild_list: GuildPrtl[], portal_managed_guilds_path: string
}) => {
    return new Promise((resolve) => {
        const guild_object = args.guild_list.find(p => p.id === args?.message?.guild?.id);
        if (!guild_object) {
            return resolve({ result: false, value: 'could not find guild.' });
        }
        if (!guild_object.announcement) {
            return resolve({ result: false, value: 'announcements channel has not been set.' });
        }

        let body = args.args.join(' ').substr(0, args.args.join(' ').indexOf('|'));
        let title = args.args.join(' ').substr(args.args.join(' ').indexOf('|') + 1);

        if (body === '' && title !== '') {
            body = title;
            title = '';
        } else if (body === '' && title === '') {
            return resolve({ result: false, value: 'you can run "./help announce" for help.' });
        }

        const announcement_channel = <TextChannel>args.message?.guild?.channels.cache.find(c =>
            c.id === guild_object.announcement
        );
        if (!announcement_channel) {
            return resolve({ result: false, value: 'announcements channel could not be fetched.' });
        }
        const rich_message = create_rich_embed(title, `@here ${body}`, '#022E4E', [], null, args.message.member, null, null, null)
        announcement_channel.send(rich_message);

        client_talk(args.client, args.guild_list, 'announce');

        return resolve({ result: true, value: 'announcement was sent successfully.' });
    });
};