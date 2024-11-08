import { ChannelType, DMChannel, GuildChannel, TextChannel, VoiceChannel } from 'discord.js';
import { handleChannelDeletion } from '../libraries/mongo.library';

import { PortalChannelType } from '../types/enums/PortalChannel.enum';
import logger from '../utilities/log.utility';

export default async function channelDelete(channel: DMChannel | GuildChannel): Promise<void> {
  if (channel.type !== ChannelType.GuildText && channel.type !== ChannelType.GuildVoice) {
    logger.error('only voice and text channels are handled');
    return;
  }

  const deletedChannel = channel instanceof VoiceChannel ? channel : (channel as TextChannel);
  const deletedChannelPortalType = await handleChannelDeletion(deletedChannel);

  if (!Object.values(PortalChannelType).includes(deletedChannelPortalType)) {
    throw new Error('Only guild voice and text channels are handled');
  }

  if (deletedChannelPortalType > 0) {
    logger.info(
      `${PortalChannelType[deletedChannelPortalType].toString()} channel removed from ${deletedChannel.guild.name}|${
        deletedChannel.guild.id
      }`,
    );
  }
}
