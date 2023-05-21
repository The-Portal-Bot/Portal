import { Activity, GuildMember, VoiceChannel } from "discord.js";
import { GameNames } from "../data/lists/gameNames.static";
import { ProgramNames } from "../data/lists/programNames.static";
import { PVoiceChannel } from "../types/classes/PVoiceChannel.class";
import { Locale } from "../data/enums/Locales.enum";

function statusAliases(
  activities: Activity[], locale: number
): string[] {
  const newStatus: string[] = [];

  activities.forEach(activity => {
    let found = false;

    if (activity.name.toLowerCase() === 'custom status') {
      found = true;
    }

    if (!found) {
      for (let l = 0; l < GameNames.gameAttributes.length; l++) {
        if (activity.name.trim() == GameNames.gameAttributes[l].status) {
          if (locale === Locale.gr) {
            newStatus.push(GameNames.gameAttributes[l].locale.gr);
          }
          else if (locale === Locale.de) {
            newStatus.push(GameNames.gameAttributes[l].locale.de);
          }
          else {
            newStatus.push(GameNames.gameAttributes[l].locale.en);
          }

          found = true;
        }
      }
    }

    if (!found) {
      for (let l = 0; l < ProgramNames.programAttributes.length; l++) {
        if (activity.name.trim() == ProgramNames.programAttributes[l].status) {
          if (locale === Locale.gr) {
            newStatus.push(ProgramNames.programAttributes[l].locale.gr);
          }
          else if (locale === Locale.de) {
            newStatus.push(ProgramNames.programAttributes[l].locale.de);
          }
          else {
            newStatus.push(ProgramNames.programAttributes[l].locale.en);
          }

          found = true;
        }
      }
    }

    if (!found) {
      newStatus.push(activity.name);
    }
  });

  return newStatus;
}

export function getStatusList(
  voiceChannel: VoiceChannel, pVoiceChannel: PVoiceChannel
): string[] {
  const arrayOfStatuses: string[] = [];

  voiceChannel.members.forEach((member: GuildMember) => {
    if (member.presence) {
      if (!member.user.bot) {
        if (member.presence.activities !== undefined) {
          if (member.presence.activities.length > 0) {
            statusAliases(member.presence.activities, pVoiceChannel.locale)
              .forEach(stat => {
                if (!arrayOfStatuses.includes(stat)) {
                  arrayOfStatuses.push(stat);
                }
              });
          }
        }
      }
    }
  });

  if (arrayOfStatuses.length === 0) {
    if (pVoiceChannel.locale === Locale.gr) {
      arrayOfStatuses.push('Άραγμα');
    }
    else if (pVoiceChannel.locale === Locale.de) {
      arrayOfStatuses.push('Chillen');
    }
    else {
      arrayOfStatuses.push('Chilling');
    }
  }

  return arrayOfStatuses;
}
