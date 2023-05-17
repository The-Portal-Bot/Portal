import { SlashCommandBuilder } from '@discordjs/builders';
import { ColorResolvable, Message, TextChannel } from "discord.js";
import { getRole } from "../../libraries/guild.library";
import { createEmbed, getJsonFromString, messageHelp } from "../../libraries/help.library";
import { insert_vendor } from "../../libraries/mongo.library";
import { GiveRole, PGiveRole } from "../../types/classes/PGiveRole.class";
import { PGuild } from "../../types/classes/PGuild.class";
import { Field, ReturnPromise } from "../../types/classes/PTypes.interface";

function create_role_message(
    channel: TextChannel, guild_object: PGuild, title: string, desc: string,
    colour: ColorResolvable, role_emb: Field[], role_map: GiveRole[]
): Promise<ReturnPromise> {
    return new Promise((resolve) => {
        const role_message_emb = createEmbed(
            title, desc, colour, role_emb, null, null, null, null, null
        );

        channel
            .send({ embeds: [role_message_emb] })
            .then(sent_message => {
                for (let i = 0; i < role_map.length; i++) {
                    sent_message
                        .react(role_map[i].emote)
                        .catch((e: any) => {
                            return resolve({
                                result: false,
                                value: `failed to react to message: ${e}`
                            });
                        });
                }

                insert_vendor(guild_object.id, new PGiveRole(sent_message.id, role_map))
                    .then(r => {
                        return resolve({
                            result: r,
                            value: r
                                ? 'Keep in mind that Portal role must be over any role you wish it to be able to distribute.\n' +
                                'In order to change it, please head to your servers settings and put Portal role above them'
                                : 'failed to set new ranks'
                        });
                    })
                    .catch(() => {
                        return resolve({
                            result: false,
                            value: 'failed to set new ranks'
                        });
                    });
            })
            .catch(() => {
                return resolve({
                    result: false,
                    value: 'failed to create role assigner message'
                })
            });
    });
}

function multiple_same_emote(
    emote_map: GiveRole[]
) {
    for (let i = 0; i < emote_map.length; i++) {
        for (let j = i + 1; j < emote_map.length; j++) {
            if (emote_map[i].emote === emote_map[j].emote) {
                return true;
            }
        }
    }

    return false;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('vendor')
        .setDescription('remove user from role'),
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
            if (args.length <= 0) {
                return resolve({
                    result: false,
                    value: messageHelp('commands', 'vendor')
                });
            }

            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const role_map_json = getJsonFromString(args.join(' '));

            if (!role_map_json) {
                return resolve({
                    result: false,
                    value: messageHelp('commands', 'vendor', 'must be an array in JSON format (even for one role)')
                });
            }

            const role_map = <GiveRole[]>role_map_json;
            if (!Array.isArray(role_map)) {
                return resolve({
                    result: false,
                    value: messageHelp('commands', 'vendor', 'must be an array in JSON format (even for one role)')
                });
            }
            if (multiple_same_emote(role_map)) {
                return resolve({
                    result: false,
                    value: messageHelp('commands', 'vendor', 'can not have the same emote for multiple actions')
                });
            }
            if (!role_map.every(rm => rm.emote && rm.role)) {
                return resolve({
                    result: false,
                    value: messageHelp('commands', 'vendor', 'JSON syntax has spelling errors')
                });
            }

            role_map
                .forEach(r => {
                    r.emote = r.emote.trim();
                    r.role.forEach(role => role.trim());
                });

            const role_emb_display: Field[] = [];

            let return_value = '';
            // give roles
            const failed = role_map
                .some(r => {
                    if (message.guild) {
                        const role_fetched = r.role.map(role => getRole(message.guild, role));

                        if (role_fetched.some(role => !role)) {
                            return_value = `some of the given roles do not exist`;
                            return true;
                        }

                        role_emb_display.push(
                            new Field(
                                r.emote,
                                `\`\`\`${role_fetched.map(role =>
                                    `@${role ? role.name : 'undefined'}`).join(', ')}\`\`\``,
                                true
                            )
                        );
                    } else {
                        return_value = `could not fetch guild of message`;
                        return true;
                    }
                });

            if (failed) {
                return resolve({
                    result: false,
                    value: return_value
                });
            }

            create_role_message(
                <TextChannel>message.channel,
                guild_object,
                'Role Assigner',
                'React with emote to get or remove mentioned role',
                '#FF7F00',
                role_emb_display,
                role_map
            )
                .then(r => {
                    return resolve(r);
                })
                .catch(e => {
                    return resolve({
                        result: false,
                        value: `an error occurred while creating role message: ${e}`
                    })
                });
        });
    }
};
