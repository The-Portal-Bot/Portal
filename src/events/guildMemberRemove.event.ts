import { GuildMember, PartialGuildMember, TextChannel } from 'discord.js';
import { createEmbed } from '../libraries/help.library';
import { fetchAnnouncementChannelByGuildId, removeMember } from '../libraries/mongo.library';

export default async (args: { member: GuildMember | PartialGuildMember }): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!args.member.user.bot) {
      removeMember(args.member.id, args.member.guild.id)
        .then((r) => {
          if (!r) {
            return reject(`failed to remove member ${args.member.id} to ${args.member.guild.id}`);
          }

          fetchAnnouncementChannelByGuildId(args.member.guild.id)
            .then((pGuild) => {
              if (pGuild) {
                const leaveMessage =
                  `member: ${args.member.presence?.user}\n` +
                  `id: ${args.member.guild.id}\n` +
                  `\thas left ${args.member.guild}`;

                if (pGuild) {
                  const announcementChannel = <TextChannel>(
                    args.member.guild.channels.cache.find((channel) => channel.id === pGuild.announcement)
                  );

                  if (announcementChannel) {
                    announcementChannel
                      .send({
                        embeds: [
                          createEmbed(
                            'member left',
                            leaveMessage,
                            '#FC0303',
                            [],
                            args.member.user.avatarURL(),
                            null,
                            true,
                            null,
                            null
                          ),
                        ],
                      })
                      .catch((e) => {
                        return reject(`failed to send message: ${e}`);
                      });
                  }
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
          return reject(`failed to remove member ${args.member.id} to ${args.member.guild.id}: ${e}`);
        });
    } else {
      return resolve('left member is a bot, bots are not handled');
    }
  });
};
