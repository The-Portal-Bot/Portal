import { ChannelType, DMChannel, GuildChannel, TextChannel, VoiceChannel } from 'discord.js';
import { handleChannelDeletion } from '../libraries/mongo.library';

import { PortalChannelType } from '../types/enums/PortalChannel.enum';

export default async function channelDelete(args: { channel: DMChannel | GuildChannel }): Promise<string> {
  if (args.channel.type !== ChannelType.GuildText && args.channel.type !== ChannelType.GuildVoice) {
    throw new Error('only voice and text channels are handled');
  }

  const deletedChannel = args.channel instanceof VoiceChannel
    ? args.channel
    : args.channel as TextChannel;

  const deletedChannelPortalType = await handleChannelDeletion(deletedChannel);

  if (!Object.values(PortalChannelType).includes(deletedChannelPortalType)) {
    throw new Error('Only guild voice and text channels are handled');
  }

  return deletedChannelPortalType > 0
    ? `${PortalChannelType[deletedChannelPortalType].toString()} channel removed from ${deletedChannel.guild.name}|${deletedChannel.guild.id}`
    : `${deletedChannel.name} channel is not controlled by Portal`;
}
