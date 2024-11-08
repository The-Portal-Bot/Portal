import { GuildMember, PartialGuildMember, TextChannel } from 'discord.js';
import { createEmbed } from '../libraries/help.library';
import { fetchAnnouncementChannelByGuildId, removeMember } from '../libraries/mongo.library';

import logger from '../utilities/log.utility';

export default async (member: GuildMember | PartialGuildMember): Promise<void> => {
  if (member.user.bot) {
    logger.info('new member is a bot, bots are not handled');
    return;
  }

  const removedMember = await removeMember(member.id, member.guild.id);
  if (!removedMember) {
    logger.error(`failed to remove member ${member.id} from ${member.guild.id}`);
    return;
  }

  const pGuild = await fetchAnnouncementChannelByGuildId(member.guild.id);

  if (!pGuild) {
    logger.error(`failed to fetch guild ${member.guild.id}`);
    return;
  }

  const announcementChannel = <TextChannel>(
    member.guild.channels.cache.find((channel) => channel.id === pGuild.announcement)
  );

  if (announcementChannel) {
    const leaveMessage =
      `member: ${member.presence?.user}\n` + `id: ${member.guild.id}\n` + `\thas left ${member.guild}`;

    const message = {
      embeds: [
        createEmbed('member left', leaveMessage, '#FC0303', [], member.user.avatarURL(), null, true, null, null),
      ],
    };

    const messageSent = await announcementChannel.send(message);
    if (!messageSent) {
      logger.warn(`failed to send leave message for ${member.id} to ${member.guild.id}`);
    }
  }

  logger.info(`removed member ${member.id} from ${member.guild.id}`);
};
