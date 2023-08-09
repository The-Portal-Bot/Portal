import { Channel, ChannelType, PartialDMChannel, TextChannel, VoiceChannel } from 'discord.js';
import { PortalChannelType } from '../types/enums/PortalChannel.enum';
import { deletedChannelSync } from '../libraries/mongo.library';

export default async function channelDelete(args: { channel: Channel | PartialDMChannel }): Promise<string> {
  if (args.channel.type !== ChannelType.GuildText && args.channel.type !== ChannelType.GuildVoice) {
    throw new Error('only voice and text channels are handled');
  }

  const currentChannel = typeof args.channel === typeof VoiceChannel
    ? args.channel as VoiceChannel
    : args.channel as TextChannel;

  const deletedPChannel = await deletedChannelSync(currentChannel);

  if (!Object.values(PortalChannelType).includes(deletedPChannel)) {
    throw new Error(`error syncing deleted channel from ${currentChannel.guild.name}|${currentChannel.guild.id}`);
  }

  return deletedPChannel > 0
    ? `${PortalChannelType[deletedPChannel].toString()} channel removed from ` +
    `${currentChannel.guild.name}|${currentChannel.guild.id}`
    : `${currentChannel.name} channel is not controlled by Portal`;
}
