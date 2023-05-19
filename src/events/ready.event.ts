/* eslint-disable @typescript-eslint/no-unused-vars */
import { ActivityOptions, ActivityType, Client, Guild, GuildMember, PresenceData } from "discord.js";
import { logger } from "../libraries/help.library";
import { getFunction } from "../libraries/localisation.library";
import { fetchGuildMembers, guildExists, insertGuild, insertMember, removeMember } from "../libraries/mongo.library";
import { PMember } from "../types/classes/PMember.class";

function addedWhenDown(
    guild: Guild, pMembers: PMember[]
): Promise<string> {
    return new Promise((resolve) => {
        const guildMembers: GuildMember[] = guild.members.cache.map(m => m);

        for (let j = 0; j < guildMembers.length; j++) {
            if (!guildMembers[j].user.bot) {
                const alreadyInDatabase = pMembers
                    .find(m => m.id === guildMembers[j].id);

                if (!alreadyInDatabase) { // if inside guild but not in portal db, add member
                    insertMember(guild.id, guildMembers[j].id)
                        .then(() => {
                            logger.info(`late-insert ${guildMembers[j].id} to ${guild.name} [${guild.id}]`);
                        })
                        .catch(e => {
                            logger.error(new Error(`failed to late-insert member: ${e}`));
                        });
                }
            }
        }

        return resolve('finished');
    });
}

function removedWhenDown(
    guild: Guild, pMembers: PMember[]
): Promise<string> {
    return new Promise((resolve) => {
        for (let j = 0; j < pMembers.length; j++) {
            const member = guild.members.cache
                .map(member => member)
                .find(m => m.id === pMembers[j].id);

            if (!member) {
                removeMember(pMembers[j].id, guild.id)
                    .then(() => {
                        logger.info(`late-remove ${pMembers[j].id} to ${guild.name} [${guild.id}]`);
                    })
                    .catch(e => {
                        logger.error(new Error(`failed to late-remove member: ${e}`));
                    });
            }
        }

        return resolve('finished');
    });
}

async function addGuildAgain(
    guild: Guild, client: Client
): Promise<boolean> {
    return new Promise((resolve) => {
        guildExists(guild.id)
            .then(exists => {
                if (!exists) {
                    insertGuild(guild.id, client)
                        .then(response => {
                            return resolve(response);
                        })
                        .catch(() => {
                            return resolve(false);
                        });
                }
                else {
                    fetchGuildMembers(guild.id)
                        .then(async pMembers => {
                            if (pMembers) {
                                await addedWhenDown(guild, pMembers);
                                await removedWhenDown(guild, pMembers);

                                return resolve(true);
                            } else {
                                return resolve(false);
                            }
                        })
                        .catch(() => {
                            return resolve(false);
                        });
                }
            })
            .catch(() => {
                return resolve(false);
            });
    });
}

module.exports = async (
    args: { client: Client }
): Promise<string> => {
    return new Promise((resolve, reject) => {
        if (!args.client.user) {
            return reject('could not fetch user from client');
        }

        const activitiesOptions: ActivityOptions = {
            name: './help', // `in ${args.client.guilds.cache.size} servers``
            type: ActivityType.Listening,
            url: 'https://github.com/keybraker'
        }

        const data: PresenceData = { activities: [activitiesOptions], status: 'online', afk: false };

        args.client.user.setPresence(data);

        args.client.guilds.cache.forEach((guild: Guild) => {
            logger.info(`${guild} | ${guild.id}`);

            addGuildAgain(guild, args.client)
                .catch(e => {
                    return reject(`failed to add guild again: ${e}`);
                });
            // removeDeletedChannels(guild);
            // removeEmptyVoiceChannels(guild);
        });

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const func = getFunction('console', 1, 'ready');

        return resolve(func
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            ? func(args.client.users.cache.size, args.client.channels.cache.size, args.client.guilds.cache.size)
            : 'error with localisation'
        );
    });
};
