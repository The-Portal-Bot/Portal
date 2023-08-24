import { SlashCommandBuilder } from '@discordjs/builders';
import { ReturnPromise, ScopeLimit } from '../../types/classes/PTypes.interface';

const COMMAND_NAME = 'music';
const DESCRIPTION = 'set a music channel';

export = {
  time: 0,
  premium: false,
  ephemeral: true,
  auth: true,
  scopeLimit: ScopeLimit.NONE,
  data: new SlashCommandBuilder()
    .setName(COMMAND_NAME)
    .setDescription(DESCRIPTION)
    .addChannelOption((option) =>
      option
        .setName('music_channel')
        .setDescription('the channel you want to make the music channel')
        .setRequired(true))
    .addChannelOption((option) =>
      option
        .setName('delete_previous')
        .setDescription('whether or not to delete the previous music channel')
        .setRequired(false))
    .setDMPermission(false),
  async execute(/* interaction: ChatInputCommandInteraction, pGuild: PGuild */): Promise<ReturnPromise> {
    return {
      result: false,
      value: 'not yet implemented',
    };

    //   const musicChannel = interaction.options.getChannel('music_channel');
    //   const deletePreviousMusicChannel = interaction.options.getChannel('delete_previous');

    //   if (!musicChannel) {
    //     return {
    //       result: false,
    //       value: messageHelp('commands', 'music'),
    //     };
    //   }

    //   if (!(musicChannel instanceof NewsChannel)) {
    //     return {
    //       result: false,
    //       value: messageHelp('commands', 'announcement', 'channel must be news channel'),
    //     };
    //   }

    //   if (!musicChannel.isTextBased) {
    //     return {
    //       result: false,
    //       value: messageHelp('commands', 'announcement', 'channel must be text channel'),
    //     };
    //   }

    //   if (!interaction.guild) {
    //     return {
    //       result: false,
    //       value: "message's guild could not be fetched",
    //     };
    //   }

    //   if (!interaction?.channel?.id) {
    //     return {
    //       result: false,
    //       value: "message's channel could not be fetched",
    //     };
    //   }

    //   if (args.length === 0) {
    //     if (isMusicChannel(interaction.channel.id, pGuild)) {
    //       const musicData = new MusicData('null', 'null', 'null', [], false);
    //       const musicDataResponse = await setMusicData(pGuild.id, musicData);

    //       return {
    //         result: !!musicDataResponse,
    //         value: musicDataResponse ? 'successfully removed music channel' : 'failed to remove music channel',
    //       };
    //     }

    //     if (isAnnouncementChannel(interaction.channel.id, pGuild)) {
    //       return {
    //         result: false,
    //         value: "this can't be set as the music channel for it is the announcement channel",
    //       };
    //     }

    //     if (isUrlOnlyChannel(interaction.channel.id, pGuild)) {
    //       return {
    //         result: false,
    //         value: "this can't be set as the Music channel for it is an url channel",
    //       };
    //     }
    //   }

    //   const musicChannel = interaction.guild.channels.cache.find((channel) => channel.id == pGuild.musicData.channelId);

    //   if (musicChannel) {
    //     const deletionResponse = await deleteChannel(PortalChannelTypes.music, <TextChannel>musicChannel, interaction)

    //     if (!deletionResponse) {
    //       return {
    //         result: false,
    //         value: `failed to delete channel`,
    //       };
    //     }
    //   }

    //   if (args.length === 0) {
    //     pGuild.musicData.channelId = interaction.channel.id;
    //     const newMusic = <TextChannel>(
    //       interaction.guild.channels.cache.find((channel) => channel.id == pGuild.musicData.channelId)
    //     );

    //     if (!newMusic) {
    //       return {
    //         result: false,
    //         value: 'channel could not be fetched',
    //       };
    //     }

    //     const musicMessageId = await createMusicMessage(newMusic, pGuild);

    //     if (!musicMessageId) {
    //       logger.log({ level: 'error', type: 'none', message: `failed to send music message` });
    //       return {
    //         result: false,
    //         value: `failed to send music message`,
    //       };
    //     }

    //     logger.log({ level: 'info', type: 'none', message: `created music message ${musicMessageId}` });

    //     const lyricsMessageId = await createMusicLyricsMessage(newMusic, pGuild, musicMessageId);

    //     if (!lyricsMessageId) {
    //       logger.log({
    //         level: 'error',
    //         type: 'none',
    //         message: new Error(`error creating lyrics message`).message,
    //       });
    //       return {
    //         result: false,
    //         value: `error creating lyrics message`,
    //       };
    //     }

    //     logger.log({
    //       level: 'info',
    //       type: 'none',
    //       message: `created lyrics message ${lyricsMessageId}`,
    //     });

    //     return {
    //       result: true,
    //       value: 'this is now the Music channel',
    //     };
    //   } else if (args.length > 0) {
    //     const musicChannel = args.join(' ').substring(0, args.join(' ').indexOf('|'));
    //     const musicCategory = args.join(' ').substring(args.join(' ').indexOf('|') + 1);

    //     if (musicChannel === '' && musicCategory === '') {
    //       return {
    //         result: false,
    //         value: messageHelp('commands', 'music'),
    //       };
    //     }

    //     if (musicChannel !== '') {
    //       const newMusicChannel = await createMusicChannel(interaction.guild, musicChannel, musicCategory, pGuild);

    //       if (!newMusicChannel) {
    //         return {
    //           result: false,
    //           value: `failed to create music channel`,
    //         };
    //       }

    //       return {
    //         result: true,
    //         value: 'music channel and category have been created'
    //       }
    //     } else if (musicChannel === '' && musicCategory !== '') {
    //       const newMusicChannel = await createMusicChannel(interaction.guild, musicCategory, null, pGuild)

    //       if (!newMusicChannel) {
    //         return {
    //           result: false,
    //           value: `failed to create music channel`,
    //         };
    //       }

    //       return {
    //         result: true,
    //         value: 'music channel has been created'
    //       }
    //     }
    //   }

    //   return {
    //     result: false,
    //     value: messageHelp('commands', 'music'),
    //   };
  },
};
