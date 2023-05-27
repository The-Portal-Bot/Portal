import { SlashCommandBuilder } from '@discordjs/builders';
import { ChannelType, ChatInputCommandInteraction, Guild, GuildChannelCreateOptions, GuildMember } from 'discord.js';
import { createChannel } from '../../libraries/guild.library';
import { messageHelp } from '../../libraries/help.library';
import { insertPortal } from '../../libraries/mongo.library';
import { PGuild } from '../../types/classes/PGuild.class';
import { IPChannel, PChannel } from '../../types/classes/PPortalChannel.class';
import { ReturnPromise } from '../../types/classes/PTypes.interface';

export = {
  data: new SlashCommandBuilder().setName('portal').setDescription('create portal channel'),
  async execute(interaction: ChatInputCommandInteraction, args: string[], pGuild: PGuild): Promise<ReturnPromise> {
    return new Promise((resolve) => {
      if (args.length === 0) {
        return resolve({
          result: false,
          value: messageHelp('commands', 'portal'),
        });
      }

      if (!interaction.guild) {
        return resolve({
          result: true,
          value: 'guild could not be fetched',
        });
      }

      if (!interaction.member) {
        return resolve({
          result: true,
          value: 'member could not be fetched',
        });
      }

      const currentGuild = interaction.guild as Guild;
      const currentMember = interaction.member as GuildMember;

      let pPortalChannel: string = args.join(' ').substring(0, args.join(' ').indexOf('|'));
      let pPortalCategory: string | null = args.join(' ').substring(args.join(' ').indexOf('|') + 1);

      if (pPortalChannel === '' && pPortalCategory !== '') {
        pPortalChannel = pPortalCategory;
        pPortalCategory = null;
      }

      const portalOptions: GuildChannelCreateOptions = {
        name: 'portal',
        topic: `by Portal, channels on demand`,
        type: ChannelType.GuildVoice,
        bitrate: 32000,
        userLimit: 1,
      };

      const voiceRegex = pGuild.premium
        ? // ? 'G$#-P$memberCount | $statusList'
        `$#:$memberCount {{
                "if": "$statusCount", "is": "===", "with": "1",
                "yes": "$statusList", "no": "$statusList|acronym"
            }}`
        : 'Channel $#';

      createChannel(currentGuild, pPortalChannel, portalOptions, pPortalCategory)
        .then((rChannel) => {
          const pChannel = new PChannel(
            rChannel,
            currentMember.id,
            true,
            pPortalChannel,
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

          insertPortal(pGuild.id, pChannel as unknown as IPChannel)
            .then((rPortal) => {
              if (rPortal) {
                return resolve({
                  result: true,
                  value:
                    'portal channel has been created.\n' +
                    "Keep in mind that due to Discord's limitations,\n" +
                    'channel names will be updated on a five minute interval',
                });
              } else {
                return resolve({
                  result: false,
                  value: 'portal channel failed to be created',
                });
              }
            })
            .catch((e) => {
              return resolve({
                result: false,
                value: `portal channel failed to be created: ${e}`,
              });
            });
        })
        .catch((e) => {
          return resolve({
            result: false,
            value: `an error occurred while creating channel: ${e}`,
          });
        });
    });
  },
};
