import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, GuildMember, VoiceChannel } from 'discord.js';
import { commandDescriptionByNameAndAuthenticationLevel, messageHelp } from '../../libraries/help.library';
import { insertPortal } from '../../libraries/mongo.library';
import { PGuild } from '../../types/classes/PGuild.class';
import { IPChannel, PChannel } from '../../types/classes/PPortalChannel.class';
import { ReturnPromise } from '../../types/classes/PTypes.interface';

const COMMAND_NAME = 'portal';

export = {
  data: new SlashCommandBuilder()
    .setName(COMMAND_NAME)
    .setDescription(commandDescriptionByNameAndAuthenticationLevel(COMMAND_NAME, true))
    .addChannelOption((option) =>
      option
        .setName('portal_channel_name')
        .setDescription('the name of the portal channel you want to create')
        .setRequired(true))
    .setDMPermission(false),
  async execute(interaction: ChatInputCommandInteraction, pGuild: PGuild): Promise<ReturnPromise> {
    const newPortalChannel = interaction.options.getChannel('portal_channel_name');

    if (!newPortalChannel) {
      return {
        result: false,
        value: messageHelp('commands', 'portal', 'portal channel name is required'),
      };
    }

    if (!(newPortalChannel instanceof VoiceChannel)) {
      return {
        result: false,
        value: messageHelp('commands', 'portal', 'channel must be voice channel'),
      };
    }

    if (!interaction.guild) {
      return {
        result: true,
        value: 'guild could not be fetched',
      };
    }

    if (!interaction.member) {
      return {
        result: true,
        value: 'member could not be fetched',
      };
    }

    // const currentGuild = interaction.guild as Guild;
    const currentMember = interaction.member as GuildMember;

    // const portalOptions: GuildChannelCreateOptions = {
    //   name: 'portal',
    //   topic: `by Portal, channels on demand`,
    //   type: ChannelType.GuildVoice,
    //   bitrate: 32000,
    //   userLimit: 1,
    // };

    const voiceRegex = pGuild.premium
      ? // ? 'G$#-P$memberCount | $statusList'
      '$#:$memberCount {{"if": "$statusCount", "is": "===", "with": "1","yes": "$statusList", "no": "$statusList|acronym"}}'
      : 'Channel $#';

    // const newPortalChannelId = await createChannel(currentGuild, portalChannelName, portalOptions, portalChannelCategoryName);

    // if (!newPortalChannelId) {
    //   return {
    //     result: false,
    //     value: `an error occurred while creating channel}`,
    //   };
    // }

    const pChannel = new PChannel(
      newPortalChannel.id,
      currentMember.id,
      true,
      'portal',
      voiceRegex,
      [],
      false,
      null,
      pGuild.locale,
      true,
      true,
      0,
      false
    );

    const portalInserted = await insertPortal(pGuild.id, pChannel as unknown as IPChannel);

    return {
      result: !!portalInserted,
      value:
        portalInserted ? 'Portal channel has been created.\n' +
          'Keep in mind that due to Discord\'s limitations,\n' +
          'channel names will be updated on a five minute interval' :
          'portal channel failed to be created',
    };

  },
};
