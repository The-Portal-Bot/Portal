import { GuildMember, PartialGuildMember, TextChannel } from 'discord.js';
import { createEmbed } from '../libraries/help.library';
import { fetchAnnouncementChannelByGuildId, insertMember } from '../libraries/mongo.library';

export default async (args: { member: GuildMember | PartialGuildMember }): Promise<string> => {
  if (args.member.user.bot) {
    return 'new member is a bot, bots are not handled';
  }

  const memberInserted = await insertMember(args.member.guild.id, args.member.id);

  if (!memberInserted) {
    return `failed to add member ${args.member.id} to ${args.member.guild.id}`;
  }

  const pGuild = await fetchAnnouncementChannelByGuildId(args.member.guild.id);

  if (!pGuild) {
    return 'no announcement channel in database';
  }

  if (pGuild?.initialRole !== 'null') {
    const initialRole = args.member.guild.roles.cache.find((r) => r.id === pGuild.initialRole);

    if (initialRole) {
      const roleAdded = await args.member.roles.add(initialRole)

      if (!roleAdded) {
        return 'failed to give role to member';
      }
    }
  }

  const joinMessage = `member: ${args.member.presence?.user}\n` +
    `id: ${args.member.guild.id}\n` +
    `\thas joined ${args.member.guild}`;

  const announcementChannel = <TextChannel>(
    args.member.guild.channels.cache.find((channel) => channel.id === pGuild.announcement)
  );

  if (announcementChannel) {
    const message = {
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
    };

    const messageSent = await announcementChannel.send(message);

    if (!messageSent) {
      return 'failed to send join message';
    }
  }

  return `added member ${args.member.id} to ${args.member.guild.id}`;
};
