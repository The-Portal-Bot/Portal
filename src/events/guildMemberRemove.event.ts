import { GuildMember, PartialGuildMember, TextChannel } from 'discord.js';
import { createEmbed } from '../libraries/help.library';
import { fetchAnnouncementChannelByGuildId, removeMember } from '../libraries/mongo.library';

export default async (args: { member: GuildMember | PartialGuildMember }): Promise<string> => {
  if (args.member.user.bot) {
    return 'new member is a bot, bots are not handled';
  }

  const removedMember = await removeMember(args.member.id, args.member.guild.id);

  if (!removedMember) {
    return `failed to remove member ${args.member.id} to ${args.member.guild.id}`;
  }

  const pGuild = await fetchAnnouncementChannelByGuildId(args.member.guild.id);

  if (!pGuild) {
    return `no announcement channel in database`;
  }

  const leaveMessage =
    `member: ${args.member.presence?.user}\n` +
    `id: ${args.member.guild.id}\n` +
    `\thas left ${args.member.guild}`;

  const announcementChannel = <TextChannel>(
    args.member.guild.channels.cache.find((channel) => channel.id === pGuild.announcement)
  );

  if (announcementChannel) {
    const message = {
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
    };

    const messageSent = await announcementChannel.send(message);

    if (!messageSent) {
      return `failed to send join message`;
    }
  }

  return `removed member ${args.member.id} to ${args.member.guild.id}`;
};
