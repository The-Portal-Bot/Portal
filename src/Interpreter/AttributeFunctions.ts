import { VoiceChannel, Guild, GuildMember, Message, ChatInputCommandInteraction, Role } from 'discord.js';
import { isUserAuthorised } from '../libraries/help.library';
import { AttributeBlueprints } from '../blueprints/AttributeBlueprint';
import { PGuild } from '../types/classes/PGuild.class';
import { PChannel } from '../types/classes/PPortalChannel.class';
import { ReturnPromise } from '../types/classes/PTypes.interface';
import { PVoiceChannel } from '../types/classes/PVoiceChannel.class';
import { AuthType } from '../types/enums/Admin.enum';

export function isAttribute(candidate: string): string {
  for (let i = 0; i < AttributeBlueprints.length; i++) {
    const subStr = String(candidate).substring(1, String(AttributeBlueprints[i].name).length + 1);

    if (subStr == AttributeBlueprints[i].name) {
      return AttributeBlueprints[i].name;
    }
  }

  return '';
}

export function getAttribute(
  voiceChannel: VoiceChannel,
  pVoiceChannel: PVoiceChannel | null,
  pChannels: PChannel[],
  pGuild: PGuild,
  guild: Guild,
  attribute: string
): string | number | boolean {
  for (let l = 0; l < AttributeBlueprints.length; l++) {
    if (attribute === AttributeBlueprints[l].name) {
      return AttributeBlueprints[l].get({
        voiceChannel,
        pVoiceChannel,
        pChannels,
        pGuild,
        guild
      }) as string | number | boolean;
    }
  }

  return -1;
}

export async function setAttribute(
  voiceChannel: VoiceChannel,
  pGuild: PGuild,
  candidate: string,
  member: GuildMember,
  interaction: ChatInputCommandInteraction,
  value: string | Role,
): Promise<ReturnPromise> {
  let pVoiceChannel: PVoiceChannel | undefined = undefined;
  let pChannel: PChannel | undefined = undefined;

  for (let l = 0; l < AttributeBlueprints.length; l++) {
    if (candidate === AttributeBlueprints[l].name) {
      switch (AttributeBlueprints[l].auth) {
      case AuthType.admin:
        if (!isUserAuthorised(member)) {
          return {
            result: false,
            value: `attribute ${candidate} can only be **set by an administrator**`,
          };
        }

        break;
      case AuthType.none:
        // passes through no checks needed
        break;
      default:
        if (!voiceChannel) {
          return {
            result: false,
            value: 'you must be in a channel handled by Portal',
          };
        }

        for (let i = 0; i < pGuild.pChannels.length; i++) {
          for (let j = 0; j < pGuild.pChannels[i].pVoiceChannels.length; j++) {
            if (pGuild.pChannels[i].pVoiceChannels[j].id === voiceChannel.id) {
              pChannel = pGuild.pChannels[i];
              pVoiceChannel = pGuild.pChannels[i].pVoiceChannels[j];

              break;
            }
          }
        }

        if (!pChannel || !pVoiceChannel) {
          return {
            result: false,
            value: 'you must be in a channel handled by Portal',
          };
        }

        if (AttributeBlueprints[l].auth === AuthType.portal) {
          if (pChannel.creatorId !== member.id) {
            return {
              result: false,
              value: `attribute ${candidate} can only be **set by the portal creator**`,
            };
          }
        } else if (AttributeBlueprints[l].auth === AuthType.voice) {
          if (pVoiceChannel.creatorId !== member.id) {
            return {
              result: false,
              value: `attribute ${candidate} can only be **set by the voice creator**`,
            };
          }
        }

        break;
      }

      const pMember = pGuild.pMembers.find((m) => m.id === member.id);

      try {
        return await AttributeBlueprints[l].set({
          voiceChannel,
          pVoiceChannel,
          pChannel,
          pGuild,
          pMember,
          interaction,
        },
        value,
        ) as ReturnPromise;
      } catch (e) {
        return {
          result: false,
          value: `attribute ${candidate} failed to be set: ${e}`,
        };
      }
    } else if (l + 1 === AttributeBlueprints.length) {
      return {
        result: false,
        value: `${candidate} is not an attribute`,
      };
    }
  }

  return {
    result: false,
    value: 'fail',
  };
}
