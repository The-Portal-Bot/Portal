import { GuildMember, PartialGuildMember, TextChannel } from 'discord.js';
import { createEmbed } from '../libraries/help.library';
import { fetchAnnouncementChannelByGuildId, insertMember } from '../libraries/mongo.library';

export default async (args: { member: GuildMember | PartialGuildMember }): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!args.member.user.bot) {
      insertMember(args.member.guild.id, args.member.id)
        .then((r) => {
          if (!r) {
            return reject(`failed to add member ${args.member.id} to ${args.member.guild.id}`);
          }

          fetchAnnouncementChannelByGuildId(args.member.guild.id)
            .then((pGuild) => {
              if (pGuild) {
                if (pGuild.initialRole && pGuild.initialRole !== 'null') {
                  const initialRole = args.member.guild.roles.cache.find((r) => r.id === pGuild.initialRole);

                  if (initialRole) {
                    try {
                      args.member.roles.add(initialRole).catch((e) => {
                        return reject(`failed to give role to member: ${e}`);
                      });
                    } catch (e) {
                      return reject(`failed to give role to member: ${e}`);
                    }
                  }
                }

                const joinMessage =
                  `member: ${args.member.presence?.user}\n` +
                  `id: ${args.member.guild.id}\n` +
                  `\thas joined ${args.member.guild}`;

                const announcementChannel = <TextChannel>(
                  args.member.guild.channels.cache.find((channel) => channel.id === pGuild.announcement)
                );

                if (announcementChannel) {
                  announcementChannel
                    .send({
                      embeds: [
                        createEmbed(
                          'member joined',
                          joinMessage,
                          '#00C70D',
                          [],
                          args.member.user.avatarURL(),
                          null,
                          true,
                          null,
                          null
                        ),
                      ],
                    })
                    .then(() => {
                      return resolve(`added member ${args.member.id} to ${args.member.guild.id}`);
                    })
                    .catch((e) => {
                      return reject(`failed to send join message: ${e}`);
                    });
                } else {
                  return resolve(`no announcement channel, it has been deleted`);
                }
              } else {
                return resolve(`no announcement channel in database`);
              }
            })
            .catch((e) => {
              return reject(`failed to get announcement channel in database: ${e}`);
            });
        })
        .catch((e) => {
          return reject(`failed to add member ${args.member.id} to ${args.member.guild.id}: ${e}`);
        });
    } else {
      return resolve('new member is a bot, bots are not handled');
    }
  });
};
