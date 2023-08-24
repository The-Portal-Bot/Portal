import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, GuildMember, VoiceChannel } from 'discord.js';
import { deleteChannel, includedInVoiceList, regexInterpreter } from '../../libraries/guild.library';
import { messageHelp } from '../../libraries/help.library';
import { updateVoice } from '../../libraries/mongo.library';
import { PGuild } from '../../types/classes/PGuild.class';
import { ReturnPromise, ScopeLimit } from '../../types/classes/PTypes.interface';
import { PortalChannelType } from '../../types/enums/PortalChannel.enum';
import { PVoiceChannel } from '../../types/classes/PVoiceChannel.class';
import { PChannel } from '../../types/classes/PPortalChannel.class';

const COMMAND_NAME = 'force';
const DESCRIPTION = 'force refresh your portal channel';

function isUserInHandledVoiceChannel(member: GuildMember, pGuild: PGuild): boolean {
  return !!member.voice.channel && includedInVoiceList(member.voice.channel.id, pGuild.pChannels);
}

function isChannelCreator(member: GuildMember, pVoiceChannel: PVoiceChannel): boolean {
  return pVoiceChannel.creatorId === member.id;
}

async function cloneAndUpdateVoiceChannel(currentVoice: VoiceChannel, pChannel: PChannel, pVoiceChannel: PVoiceChannel, pGuild: PGuild, interaction: ChatInputCommandInteraction): Promise<ReturnPromise> {
  const updatedName = regexInterpreter(
    pVoiceChannel.regex,
    currentVoice,
    pVoiceChannel,
    pGuild.pChannels,
    pGuild,
        interaction.guild!,
        interaction.user.id
  );
  const currentVoiceClone = await currentVoice.clone({ name: updatedName });

  if (!currentVoiceClone) {
    return { result: false, value: 'Error while cloning channel' };
  }

  for (const member of currentVoice.members.values()) {
    member.voice?.setChannel(currentVoiceClone, 'portal force update').catch(() => {
      return { result: false, value: `Failed to move user ${member.displayName}` };
    });
  }

  const updatedVoice = await updateVoice(pGuild.id, pChannel.id, currentVoice.id, 'id', currentVoiceClone.id);
  if (!updatedVoice) {
    return { result: false, value: 'Failed to force update channel' };
  }

  await deleteChannel(PortalChannelType.voice, currentVoice, interaction, true).catch((e) => {
    return { result: false, value: `Failed to delete channel: ${e}` };
  });

  return { result: true, value: 'Force updated voice' };
}

export = {
  time: 5,
  premium: false,
  ephemeral: true,
  auth: true,
  scopeLimit: ScopeLimit.MEMBER,
  data: new SlashCommandBuilder()
    .setName(COMMAND_NAME)
    .setDescription(DESCRIPTION),

  async execute(interaction: ChatInputCommandInteraction, pGuild: PGuild): Promise<ReturnPromise> {
    const member = interaction.member as GuildMember;

    if (!member) return { result: false, value: 'Member could not be fetched' };
    if (!isUserInHandledVoiceChannel(member, pGuild)) return { result: false, value: messageHelp('commands', 'force', 'The channel you are in is not handled by Portal') };
    if ((member.voice.channel as VoiceChannel).members.size > 10) return { result: false, value: messageHelp('commands', 'force', 'You can only force a channel with up-to 10 members') };

    for (const pChannel of pGuild.pChannels) {
      for (const pVoiceChannel of pChannel.pVoiceChannels) {
        if (pVoiceChannel.id !== member.voice.channel!.id) continue;
        if (!isChannelCreator(member, pVoiceChannel)) return { result: false, value: 'You are not the creator of the channel' };
        if (!interaction.guild) return { result: false, value: 'Could not fetch message\'s guild' };

        return cloneAndUpdateVoiceChannel(member.voice.channel as VoiceChannel, pChannel, pVoiceChannel, pGuild, interaction);
      }
    }
    return { result: false, value: 'Force failed' };
  },
};
