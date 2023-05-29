import { Channel, ChannelType, PartialDMChannel, TextChannel, VoiceChannel } from 'discord.js';
import { PortalChannelTypes } from '../types/enums/PortalChannel.enum';
import { deletedChannelSync } from '../libraries/mongo.library';

export default async (args: { channel: Channel | PartialDMChannel }): Promise<string> => {
  if (args.channel.type !== ChannelType.GuildText && args.channel.type !== ChannelType.GuildVoice) {
    return `only voice and text channels are handled`;
  }

  const currentChannel = typeof args.channel === typeof VoiceChannel
    ? args.channel as VoiceChannel
    : args.channel as TextChannel;

  const deletedPChannel = await deletedChannelSync(currentChannel);

  if (!deletedPChannel) {
    return `error syncing deleted channel from ` + `${currentChannel.guild.name}|${currentChannel.guild.id}`;
  }

  return deletedPChannel > 0
    ? `${PortalChannelTypes[deletedPChannel].toString()} channel removed from ` +
    `${currentChannel.guild.name}|${currentChannel.guild.id}`
    : `${currentChannel.name} channel is not controlled by Portal`;
};
