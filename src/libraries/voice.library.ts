import {
  getVoiceConnection,
  joinVoiceChannel,
  type VoiceConnection,
} from "npm:@discordjs/voice";
import type { Guild, GuildMember, VoiceBasedChannel } from "npm:discord.js";

import { createDiscordJSAdapter } from "./adapter.library.ts";
import logger from "../utilities/log.utility.ts";

export class VoiceLibrary {
  static getVoiceConnectionByGuildId(
    guildId: string,
  ): VoiceConnection | null {
    return getVoiceConnection(guildId) ?? null;
  }

  static getVoiceChannelByMember(
    member: GuildMember,
  ): VoiceBasedChannel | null {
    return member.voice.channel;
  }

  static getVoiceStateByGuildId(
    member: GuildMember,
  ): VoiceBasedChannel | null {
    return member.voice.channel;
  }

  static joinUserVoiceChannelById(
    channelId: string,
    guild: Guild,
  ): VoiceConnection | null {
    const clientVoiceState = guild.voiceStates.cache.get(guild.client.user.id);

    if (clientVoiceState && clientVoiceState.channelId === channelId) {
      logger.info("already in the same channel");
      clientVoiceState.setDeaf(true);
      return this.getVoiceConnectionByGuildId(guild.id);
    } else if (clientVoiceState) {
      logger.info("moving to the same channel");
      clientVoiceState.setDeaf(true);
      return null;
    }

    const voiceBasedChannel = guild.channels.cache.get(channelId);
    if (!voiceBasedChannel || !voiceBasedChannel.isVoiceBased()) {
      return null;
    }

    logger.info("joining voice channel");
    return joinVoiceChannel({
      channelId: voiceBasedChannel.id,
      guildId: guild.id,
      adapterCreator: createDiscordJSAdapter(voiceBasedChannel),
    });
  }
}
