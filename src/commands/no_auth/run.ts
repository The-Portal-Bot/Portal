import { Message, VoiceChannel } from "discord.js";
import { regexInterpreter } from "../../libraries/guild.library";
import { createEmbed, maxString } from "../../libraries/help.library";
import { PGuild } from "../../types/classes/PGuild.class";
import { PVoiceChannel } from "../../types/classes/PVoiceChannel.class";
import { Field, ReturnPromise } from "../../types/classes/PTypes.interface";
import { SlashCommandBuilder } from '@discordjs/builders';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('run')
        .setDescription('runs string given'),
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

            if (!message.member) {
                return resolve({
                    result: true,
                    value: 'member could not be fetched'
                });
            }

            const currentVoice = message.member.voice;
            const currentVoiceChannel = currentVoice.channel;

            let pVoice: PVoiceChannel | null = null;

            if (currentVoiceChannel) {
                for (let i = 0; i < pGuild.pChannels.length; i++) {
                    for (let j = 0; j < pGuild.pChannels[i].pVoiceChannels.length; j++) {
                        if (pGuild.pChannels[i].pVoiceChannels[j].id === currentVoiceChannel.id) {
                            pVoice = pGuild.pChannels[i].pVoiceChannels[j];
                            break;
                        }
                    }
                }
            }

            message.channel.send({
                embeds: [
                    createEmbed(
                        'executing: ' + args.join(' '),
                        args.join(' '),
                        '#00ffb3',
                        null,
                        null,
                        null,
                        false,
                        null,
                        null,
                        undefined,
                        undefined
                    )
                ]
            })
                .then(sentMessage => {
                    if (message.guild) {
                        sentMessage
                            .edit({
                                embeds: [
                                    createEmbed(
                                        'Text Interpreter',
                                        null,
                                        '#00ffb3',
                                        <Field[]>[{
                                            emote: 'input',
                                            role: maxString(
                                                `\`\`\`\n${args.join(' ')}\n\`\`\``,
                                                256
                                            ),
                                            inline: false
                                        },
                                        {
                                            emote: 'output',
                                            role: maxString(
                                                `\`\`\`\n${regexInterpreter(
                                                    args.join(' '),
                                                    currentVoiceChannel as VoiceChannel,
                                                    pVoice,
                                                    pGuild.pChannels,
                                                    pGuild,
                                                    message.guild,
                                                    message.author.id
                                                )}\n\`\`\``,
                                                256
                                            ),
                                            inline: false
                                        }],
                                        null,
                                        null,
                                        false,
                                        null,
                                        null,
                                        undefined,
                                        undefined
                                    )
                                ]
                            })
                            .catch(e => {
                                return resolve({
                                    result: true,
                                    value: `failed to edit message: ${e}`
                                });
                            });
                    } else {
                        sentMessage
                            .edit('could not fetch guild of message')
                            .catch(e => {
                                return resolve({
                                    result: true,
                                    value: `failed to edit message: ${e}`
                                });
                            });
                    }
                }
                )
                .catch(e => {
                    return resolve({
                        result: true,
                        value: `failed to send message: ${e}`
                    });
                });

            return resolve({
                result: true,
                value: ''
            });
        });
    }
};
