import { ColorResolvable, Message, TextChannel } from "discord.js";
import { createEmbed, getJsonFromString, messageHelp } from "../../libraries/help.library";
import { insertPoll } from "../../libraries/mongo.library";
import { PGuild } from "../../types/classes/PGuild.class";
import { PPoll } from "../../types/classes/PPoll.class";
import { Field, ReturnPromise } from "../../types/classes/PTypes.interface";
import { SlashCommandBuilder } from '@discordjs/builders';

const emoji = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'];

function createRoleMessage(
    channel: TextChannel, pGuild: PGuild, title: string, desc: string,
    colour: ColorResolvable, pollMap: Field[], memberId: string
): Promise<ReturnPromise> {
    return new Promise((resolve) => {
        const roleMessageEmbed = createEmbed(
            title,
            desc,
            colour,
            pollMap,
            null,
            null,
            true,
            null,
            null
        );

        channel
            .send({ embeds: [roleMessageEmbed] })
            .then(sentMessage => {
                sentMessage
                    .react('🏁')
                    .catch(e => {
                        return resolve({
                            result: true,
                            value: `failed to react to message: ${e}`
                        });
                    });
                for (let i = 0; i < pollMap.length; i++) {
                    if (typeof pollMap[i].emote === 'string') {
                        sentMessage
                            .react(<string>pollMap[i].emote)
                            .catch(e => {
                                return resolve({
                                    result: true,
                                    value: `failed to react to message: ${e}`
                                });
                            });
                    }
                }

                const poll: PPoll = { messageId: sentMessage.id, memberId: memberId }
                insertPoll(pGuild.id, poll)
                    .then(r => {
                        return resolve({
                            result: r,
                            value: r
                                ? 'successfully created poll'
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
        message: Message, args: string[], pGuild: PGuild
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

            // ! check that they work
            const title = args.join(' ').substring(0, args.join(' ').indexOf('|'));
            const pollJSONString = args.join(' ').substring(args.join(' ').indexOf('|') + 1);

            if (title === '' && pollJSONString !== '') {
                return resolve({
                    result: false,
                    value: messageHelp('commands', 'poll')
                });
            }

            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const pollJSON = getJsonFromString(pollJSONString);
            if (!pollJSON) {
                return resolve({
                    result: false,
                    value: messageHelp('commands', 'poll', 'poll must be in JSON array format `./help poll`')
                });
            }

            const pollMap = <string[]>pollJSON;
            if (pollMap.length > 9) {
                return resolve({
                    result: false,
                    value: messageHelp('commands', 'poll', 'polls can have maximum 9 options')
                });
            }

            if (pollMap.length < 2) {
                return resolve({
                    result: false,
                    value: messageHelp('commands', 'poll', 'polls must have minimum 2 options')
                });
            }

            if (!Array.isArray(pollMap)) {
                return resolve({
                    result: false,
                    value: messageHelp('commands', 'poll', 'must be array even for one role')
                });
            }

            pollMap.forEach(r => r.trim());
            const pollMapField = pollMap.map((p, i) => {
                return <Field>{
                    emote: emoji[i],
                    role: p,
                    inline: true
                }
            });

            createRoleMessage(
                <TextChannel>message.channel,
                pGuild,
                title,
                '',
                '#9900ff',
                pollMapField,
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
