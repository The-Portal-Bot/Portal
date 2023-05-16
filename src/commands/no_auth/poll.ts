import { ColorResolvable, Message, TextChannel } from "discord.js";
import { createEmbed, getJsonFromString, messageHelp } from "../../libraries/help.library";
import { insert_poll } from "../../libraries/mongo.library";
import { PGuild } from "../../types/classes/PGuild.class";
import { PPoll } from "../../types/classes/PPoll.class";
import { Field, ReturnPromise } from "../../types/classes/PTypes.interface";
import { SlashCommandBuilder } from '@discordjs/builders';

const emoji = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'];

function create_role_message(
    channel: TextChannel, guild_object: PGuild, title: string, desc: string,
    colour: ColorResolvable, poll_map: Field[], member_id: string
): Promise<ReturnPromise> {
    return new Promise((resolve) => {
        const role_message_emb = createEmbed(
            title,
            desc,
            colour,
            poll_map,
            null,
            null,
            true,
            null,
            null
        );

        channel
            .send({ embeds: [role_message_emb] })
            .then(sent_message => {
                sent_message
                    .react('🏁')
                    .catch(e => {
                        return resolve({
                            result: true,
                            value: `failed to react to message: ${e}`
                        });
                    });
                for (let i = 0; i < poll_map.length; i++) {
                    if (typeof poll_map[i].emote === 'string') {
                        sent_message
                            .react(<string>poll_map[i].emote)
                            .catch(e => {
                                return resolve({
                                    result: true,
                                    value: `failed to react to message: ${e}`
                                });
                            });
                    }
                }

                const poll: PPoll = { message_id: sent_message.id, member_id: member_id }
                insert_poll(guild_object.id, poll)
                    .then(r => {
                        return resolve({
                            result: r,
                            value: r
                                ? 'seccessfully created poll'
                                : 'failed to create poll'
                        });
                    })
                    .catch(e => {
                        return resolve({
                            result: false,
                            value: `failed to set new ranks: ${e}`
                        });
                    });
            })
            .catch(e => {
                return resolve({
                    result: false,
                    value: `failed to create role assigner message: ${e}`
                })
            });
    });
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('poll')
        .setDescription('create a poll'),
    async execute(
        message: Message, args: string[], guild_object: PGuild
    ): Promise<ReturnPromise> {
        return new Promise((resolve) => {
            if (!message.guild) {
                return resolve({
                    result: true,
                    value: 'guild could not be fetched'
                });
            }
            if (args.length <= 1) {
                return resolve({
                    result: false,
                    value: messageHelp('commands', 'poll')
                });
            }

            const title = args.join(' ').substr(0, args.join(' ').indexOf('|'));
            const poll_json_string = args.join(' ').substr(args.join(' ').indexOf('|') + 1);

            if (title === '' && poll_json_string !== '') {
                return resolve({
                    result: false,
                    value: messageHelp('commands', 'poll')
                });
            }

            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const poll_json = getJsonFromString(poll_json_string);
            if (!poll_json) {
                return resolve({
                    result: false,
                    value: messageHelp('commands', 'poll', 'poll must be in JSON array format `./help poll`')
                });
            }

            const poll_map = <string[]>poll_json;
            if (poll_map.length > 9) {
                return resolve({
                    result: false,
                    value: messageHelp('commands', 'poll', 'polls can have maximum 9 options')
                });
            }

            if (poll_map.length < 2) {
                return resolve({
                    result: false,
                    value: messageHelp('commands', 'poll', 'polls must have minimum 2 options')
                });
            }

            if (!Array.isArray(poll_map)) {
                return resolve({
                    result: false,
                    value: messageHelp('commands', 'poll', 'must be array even for one role')
                });
            }

            poll_map.forEach(r => r.trim());
            const poll_map_field = poll_map.map((p, i) => {
                return <Field>{
                    emote: emoji[i],
                    role: p,
                    inline: true
                }
            });

            create_role_message(
                <TextChannel>message.channel,
                guild_object,
                title,
                '',
                '#9900ff',
                poll_map_field,
                message.author.id
            )
                .then(r => {
                    return resolve({
                        result: r.result,
                        value: r.result ? '' : r.value
                    });
                })
                .catch(e => {
                    return resolve({
                        result: false,
                        value: `${e}`
                    })
                });
        });
    }
}
