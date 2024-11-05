import { createAudioPlayer, createAudioResource, getVoiceConnection } from '@discordjs/voice';
import { ChatInputCommandInteraction, GuildMember, User } from 'discord.js';
import { PGuild } from '../types/classes/PGuild.class';
import {
  AnnouncementAction,
  ClientArguments,
  DataArguments,
  EventAction,
  LocalisationConsoleOption,
  LocalisationPortalOption,
  LogActions,
  PresenceArguments,
  StatusArguments
} from '../types/classes/PTypes.interface';
import { Locale } from '../types/enums/Locales.enum';
import logger from '../utilities/log.utility';

export const portal: LocalisationPortalOption[] = [
  {
    name: AnnouncementAction.join,
    lang: {
      gr: () => {
        return '> Γειά σας, το Πόρταλ είναι εδώ';
      },
      en: () => {
        return '> Cheers love, Portal\'s here';
      },
      de: () => {
        return '> Hallo, Portal ist da';
      },
    },
  },
  {
    name: AnnouncementAction.leave,
    lang: {
      gr: () => {
        return '> Αποχαιρετώ, καλή συνέχεια σε όλους';
      },
      en: () => {
        return '> Goodbye everyone';
      },
      de: () => {
        return '> Auf Wiedersehen alle';
      },
    },
  },
  {
    name: AnnouncementAction.announce,
    lang: {
      gr: (user: User) => {
        return `o ${user} έκανε μια ανακοίνωση`;
      },
      en: (user: User) => {
        return `${user} made an announcement`;
      },
      de: (user: User) => {
        return `${user} hat eine Ankündigung gemacht`;
      },
    },
  },
  {
    name: AnnouncementAction.spotify,
    lang: {
      gr: (user: User) => {
        return `o ${user} έβαλε νέο κομμάτι`;
      },
      en: (user: User) => {
        return `${user} listens to a new song`;
      },
      de: (user: User) => {
        return `${user} hört sich ein neues Lied an`;
      },
    },
  },
  {
    name: AnnouncementAction.url,
    lang: {
      gr: (user: User) => {
        return `o ${user} ανέβασε έναν νέο σύνδεσμο`;
      },
      en: (user: User) => {
        return `${user} sent a new link`;
      },
      de: (user: User) => {
        return `${user} hat einen neuen Link geschickt`;
      },
    },
  },
  {
    name: AnnouncementAction.readOnly,
    lang: {
      gr: (user: User) => {
        return `${user}, το κανάλι είναι μόνο για ανάγνωση`;
      },
      en: (user: User) => {
        return `${user}, the channel is read-only`;
      },
      de: (user: User) => {
        return `${user}, der Kanal ist schreibgeschütz`;
      },
    },
  },
  {
    name: AnnouncementAction.fail,
    lang: {
      gr: (user: User) => {
        return `${user}, κάτι δεν πήγε καλά`;
      },
      en: (user: User) => {
        return `${user}, something went wrong`;
      },
      de: (user: User) => {
        return `${user}, etwas ist schief gelaufen`;
      },
    },
  },
  {
    name: EventAction.userConnected,
    lang: {
      gr: (user: User) => {
        return `ο χρήστης ${user} συνδέθηκε στο κανάλι`;
      },
      en: (user: User) => {
        return `user ${user} connected to the channel`;
      },
      de: (user: User) => {
        return `mitglied ${user} hat sich zum Kanal verbunden`;
      },
    },
  },
  {
    name: EventAction.userDisconnected,
    lang: {
      gr: (user: User) => {
        return `ο χρήστης ${user} αποχώρησε από το κανάλι`;
      },
      en: (user: User) => {
        return `user ${user} disconnected from the channel`;
      },
      de: (user: User) => {
        return `mitglied ${user} hat sich vom Kanal unverbunden`;
      },
    },
  },
];

export const consoleText: LocalisationConsoleOption[] = [
  {
    name: LogActions.ready,
    lang: {
      gr: (args: ClientArguments) => {
        return `το πόρταλ ξεκίνησε, με ${args.memberLength} χρήστες, μέσα σε ${args.channelLength} κανάλια σε ${args.guildLength} συντεχνίες`;
      },
      en: (args: ClientArguments) => {
        return `portal has started, with ${args.memberLength} users, in ${args.channelLength} channels from ${args.guildLength} guilds`;
      },
      de: (args: ClientArguments) => {
        return `portal hat ${args.memberLength} Mitglieder in ${args.channelLength} Kanälen von ${args.guildLength} Gilden gestartet`;
      },
    },
  },
  {
    name: LogActions.updatingGuild, // remove
    lang: {
      gr: () => {
        // args: unknown
        return '> Το αρχείο JSON των συντεχνιών ενημερώθηκε';
      },
      en: () => {
        // args: unknown
        return '> Guild JSON file has been updated';
      },
      de: () => {
        // args: unknown
        return '> Die JSON Datei der Gilde wurde aktualisiert';
      },
    },
  },
  {
    name: LogActions.presenceControlledAway,
    lang: {
      gr: (args: PresenceArguments) => {
        return (
          `ο χρήστης ${args?.newPresence?.member?.displayName} είναι μέλος ` +
          'μια ελεγχόμενης συντεχνίας, έχει αλλάξει κατάσταση, αλλά βρίσκεται στη συντεχνία ' +
          `(${args?.newPresence?.guild?.name})`
        );
      },
      en: (args: PresenceArguments) => {
        return (
          `${args?.newPresence?.member?.displayName} who is a member of a handled server, ` +
          `has changed presence, but is in another server (${args?.newPresence?.guild?.name})`
        );
      },
      de: (args: PresenceArguments) => {
        return (
          `${args?.newPresence?.member?.displayName} who is a member of a handled server, ` +
          `has changed presence, but is in another server (${args?.newPresence?.guild?.name})`
        );
      },
    },
  },
  {
    name: LogActions.presenceControlled,
    lang: {
      gr: (args: StatusArguments) => {
        return `ο χρήστης ${args.displayName} έχει αλλάξει κατάσταση, και βρίσκεται στην ελεγχόμενη συντεχνία (${args.name})`;
      },
      en: (args: StatusArguments) => {
        return `${args.displayName} has changed presence, in controlled server (${args.name})`;
      },
      de: (args: StatusArguments) => {
        return `${args.displayName} has changed presence, in controlled server (${args.name})`;
      },
    },
  },
  {
    name: LogActions.couldNotFetchData,
    lang: {
      gr: (args: DataArguments) => {
        return `δεν κατάφερα να πάρω το ${args.data} από το ${args.source}`;
      },
      en: (args: DataArguments) => {
        return `could not fetch ${args.data} from ${args.source}`;
      },
      de: (args: DataArguments) => {
        return `ich konnte ${args.data} nicht vom ${args.source} holen`;
      },
    },
  },
];

function isAnnouncementAction(value: AnnouncementAction | string): value is AnnouncementAction {
  return Object.values(AnnouncementAction).includes(value);
}

function isEventAction(value: EventAction | string): value is EventAction {
  return Object.values(EventAction).includes(value);
}

export function clientTalk(
  interaction: ChatInputCommandInteraction,
  pGuild: PGuild,
  context: AnnouncementAction | EventAction
): boolean {
  if (!interaction.guild) {
    return false;
  }

  const voiceConnection = getVoiceConnection(interaction.guild.id);

  if (!voiceConnection) {
    return false;
  }

  const player = createAudioPlayer();

  const localeToString: Record<Locale, string> = {
    [Locale.gr]: 'gr',
    [Locale.en]: 'en',
    [Locale.de]: 'de',
  };

  const AnnouncementActionToString: Record<AnnouncementAction, string> = {
    [AnnouncementAction.fail]: 'fail',
    [AnnouncementAction.announce]: 'announce',
    [AnnouncementAction.spotify]: 'spotify',
    [AnnouncementAction.url]: 'url',
    [AnnouncementAction.readOnly]: 'readOnly',
    [AnnouncementAction.join]: 'join',
    [AnnouncementAction.leave]: 'leave',
  };

  const EventActionToString: Record<EventAction, string> = {
    [EventAction.userConnected]: 'user_connected',
    [EventAction.userDisconnected]: 'user_disconnected',
  };

  for (const p of pGuild.pChannels) {
    for (const v of p.pVoiceChannels) {
      if (isAnnouncementAction(context.toString())&& !isEventAction(context.toString()) && v.annAnnounce) {
        const locale = localeToString[v.locale];
        const contextAsAction = AnnouncementActionToString[context];
        const random = Math.floor(Math.random() * 3);

        const resource = createAudioResource(`src/assets/mp3s/${locale}/${contextAsAction}/${contextAsAction}${random}.mp3`);
        logger.info(`src/assets/mp3s/${locale}/${contextAsAction}/${contextAsAction}${random}.mp3, ${!!resource}`);

        player.play(resource);
        voiceConnection.subscribe(player);

        return true;
      } else if (!isAnnouncementAction(context.toString()) && isEventAction(context.toString()) && v.annUser) {
        const locale = localeToString[v.locale];
        const contextAsAction = EventActionToString[context as EventAction];

        const random = Math.floor(Math.random() * 3);

        const resource = createAudioResource(`src/assets/mp3s/${locale}/${contextAsAction}/${contextAsAction}${random}.mp3`);
        logger.info(`src/assets/mp3s/${locale}/${contextAsAction}/${contextAsAction}${random}.mp3, ${!!resource}`);

        player.play(resource);
        voiceConnection.subscribe(player);

        return true;
      }
    }
  }

  return false;
}

export function getFunction(output: string, locale: number, context: EventAction | AnnouncementAction | LogActions) {
  let func;

  if (output === 'portal') {
    portal.some((ct) => {
      if (ct.name === context) {
        switch (locale) {
        case Locale.gr:
          func = ct.lang.gr;
          return true;
        case Locale.en:
          func = ct.lang.en;
          return true;
        case Locale.de:
          func = ct.lang.de;
          return true;
        }
      }
    });
  } else if (output === 'console') {
    consoleText.some((ct) => {
      switch (locale) {
      case Locale.gr:
        func = ct.lang.gr;
        return true;
      case Locale.en:
        func = ct.lang.en;
        return true;
      case Locale.de:
        func = ct.lang.de;
        return true;
      }
    });
  }

  return func;
}

export function clientWrite(
  interaction: ChatInputCommandInteraction,
  pGuild: PGuild,
  context: EventAction | AnnouncementAction | LogActions
): string {
  const member = interaction.member as GuildMember;
  if (!interaction) return 'could not fetch message';
  if (!member) return 'could not fetch member';
  if (!member.voice) return 'could not fetch voice';

  let returnValue = 'could not find data';

  const found = pGuild.pChannels.some((p) =>
    p.pVoiceChannels.some((v) => {
      if (member && member.voice.channel) {
        if (v.id === member.voice.channel.id) {
          switch (v.locale) {
          case Locale.gr:
            returnValue = portal
              .find((p) => p.name === context)
              ?.lang.gr({} as User) as unknown as string;
            break;
          case Locale.en:
            returnValue = portal
              .find((p) => p.name === context)
              ?.lang.en({} as User) as unknown as string;
            break;
          case Locale.de:
            returnValue = portal
              .find((p) => p.name === context)
              ?.lang.de({} as User) as unknown as string;
            break;
          }

          return true;
        }
      }

      return false;
    })
  );

  if (found) {
    return returnValue;
  } else {
    return portal.find((p) => p.name === context)?.lang.en({} as User) as unknown as string;
  }
}

// export function clientLog(
//   message: Message | null,
//   guildList: PGuild[],
//   context: EventAction | AnnouncementAction | LogActions,
//   args: ClientArguments
// ): string {
//   if (message === null || message.member === null) {
//     return 'there was an error';
//   }

//   if (!message.member.voice) {
//     return 'there was an error';
//   }

//   guildList.some((g) =>
//     g.pChannels.some((p) =>
//       p.pVoiceChannels.some((v) => {
//         if (message.member && message.member.voice.channel) {
//           if (v.id === message.member.voice.channel.id) {
//             // message.author.presence.member.voice.channel.id) {
//             switch (v.locale) {
//             case Locale.gr:
//               return consoleText.find((c) => c.name === context)?.lang.gr(args);
//             case Locale.en:
//               return consoleText.find((c) => c.name === context)?.lang.en(args);
//             case Locale.de:
//               return consoleText.find((c) => c.name === context)?.lang.de(args);
//             }
//           }
//         }
//       })
//     )
//   );

//   return consoleText.find((c) => c.name === context)?.lang.en(args) ?? '';
// }
