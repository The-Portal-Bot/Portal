import { Channel, ChannelType, PartialDMChannel, TextChannel, VoiceChannel } from 'discord.js';
import { PortalChannelTypes } from '../types/enums/PortalChannel.enum';
import { deletedChannelSync } from '../libraries/mongo.library';

export default async (args: { channel: Channel | PartialDMChannel }): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (args.channel.type !== ChannelType.GuildText && args.channel.type !== ChannelType.GuildVoice) {
      return reject(`only voice and text channels are handled`);
    }

    const currentChannel = typeof args.channel === typeof VoiceChannel
      ? args.channel as VoiceChannel
      : args.channel as TextChannel;

    deletedChannelSync(currentChannel)
      .then((deletedPChannel) => {
        if (deletedPChannel > 0) {
          return resolve(
            `${PortalChannelTypes[deletedPChannel].toString()} channel removed from ` +
            `${currentChannel.guild.name}|${currentChannel.guild.id}`
          );
        } else {
          return resolve(`${currentChannel.name} channel is not controlled by Portal`);
        }
      })
      .catch((e) => {
        return reject(
          `error syncing deleted channel from ` + `${currentChannel.guild.name}|${currentChannel.guild.id}: ${e}`
        );
      });
  });
};
