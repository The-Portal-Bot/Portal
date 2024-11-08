import { GuildMember, PartialGuildMember, TextChannel } from 'discord.js';
import { createEmbed } from '../libraries/help.library';
import { fetchAnnouncementChannelByGuildId, insertMember } from '../libraries/mongo.library';

import logger from '../utilities/log.utility';

export async function guildMemberAdd(member: GuildMember | PartialGuildMember): Promise<void> {
  if (member.user.bot) {
    logger.info('new member is a bot, bots are not handled');
    return;
  }

  const memberInserted = await insertMember(member.guild.id, member.id);
  if (!memberInserted) {
    logger.error(`failed to add member ${member.id} to ${member.guild.id}`);
    return;
  }

  const pGuild = await fetchAnnouncementChannelByGuildId(member.guild.id);
  if (!pGuild) {
    logger.error(`failed to fetch guild ${member.guild.id}`);
    return;
  }

  if (pGuild?.initialRole !== 'null') {
    const initialRole = member.guild.roles.cache.find((r) => r.id === pGuild.initialRole);

    if (initialRole) {
      const roleAdded = await member.roles.add(initialRole);
      if (!roleAdded) {
        logger.error(`failed to add ${initialRole.name} to ${member.id}`);
        return;
      }
    }
  }

  const joinMessage =
    `member: ${member.presence?.user}\n` + `id: ${member.guild.id}\n` + `\thas joined ${member.guild}`;

  const announcementChannel = <TextChannel>(
    member.guild.channels.cache.find((channel) => channel.id === pGuild.announcement)
  );

  if (announcementChannel) {
    const message = {
      embeds: [
        createEmbed('member joined', joinMessage, '#00C70D', [], member.user.avatarURL(), null, true, null, null),
      ],
    };

    const messageSent = await announcementChannel.send(message);
    if (!messageSent) {
      logger.warn(`failed to send join message for ${member.id} to ${member.guild.id}`);
    }
  }

  logger.info(`added member ${member.id} to ${member.guild.id}`);
}
