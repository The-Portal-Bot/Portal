import { ChatInputCommandInteraction, GuildMember, Message, Presence, User } from 'discord.js';
import { PGuild } from '../types/classes/PGuild.class';
import {
  AnnouncementAction,
  EventAction,
  LocalisationConsoleOption,
  LocalisationPortalOption,
  LogActions,
} from '../types/classes/PTypes.interface';
import { Locale } from '../types/enums/Locales.enum';

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
      gr: (args: { memberLength: number; channelLength: number; guildLength: number }) => {
        return `το ρομπότ ξεκίνησε, με ${args.memberLength} χρήστες, μέσα σε ${args.channelLength} κανάλια σε ${args.guildLength} συντεχνίες`;
      },
      en: (args: { memberLength: number; channelLength: number; guildLength: number }) => {
        return `bot has started, with ${args.memberLength} users, in ${args.channelLength} channels from ${args.guildLength} guilds`;
      },
      de: (args: { memberLength: number; channelLength: number; guildLength: number }) => {
        return `bot hat ${args.memberLength} Mitglieder in ${args.channelLength} Kanälen von ${args.guildLength} Gilden gestartet`;
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
      gr: (args: { newPresence: Presence }) => {
        return (
          `ο χρήστης ${args?.newPresence?.member?.displayName} είναι μέλος ` +
          'μια ελεγχόμενης συντεχνίας, έχει αλλάξει κατάσταση, αλλά βρίσκεται στη συντεχνία ' +
          `(${args?.newPresence?.guild?.name})`
        );
      },
      en: (args: { newPresence: Presence }) => {
        return (
          `${args?.newPresence?.member?.displayName} who is a member of a handled server, ` +
          `has changed presence, but is in another server (${args?.newPresence?.guild?.name})`
        );
      },
      de: (args: { newPresence: Presence }) => {
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
      gr: (displayName: string, name: string) => {
        return `ο χρήστης ${displayName} έχει αλλάξει κατάσταση, και βρίσκεται στην ελεγχόμενη συντεχνία (${name})`;
      },
      en: (displayName: string, name: string) => {
        return `${displayName} has changed presence, in controlled server (${name})`;
      },
      de: (displayName: string, name: string) => {
        return `${displayName} has changed presence, in controlled server (${name})`;
      },
    },
  },
  {
    name: LogActions.couldNotFetchData,
    lang: {
      gr: (data: string, source: string) => {
        return `δεν κατάφερα να πάρω το ${data} από το ${source}`;
      },
      en: (data: string, source: string) => {
        return `could not fetch ${data} from ${source}`;
      },
      de: (data: string, source: string) => {
        return `ich konnte ${data} nicht vom ${source} holen`;
      },
    },
  },
];

// export function clientTalk(
// 	client: Client, pGuild: GuildPrtl, context: string
// ): boolean {
// 	const voiceConnection = client?.voice?.connections
// 		.find(connection => connection.channel.guild.id === pGuild.id);

// 	if (voiceConnection) {
// 		if (!voiceConnection.dispatcher) {
// 			return pGuild.portalList.some(p =>
// 				p.voiceList.some(v => {

// 					if (typeOfAnnouncement.includes(context) && v.annAnnounce) {
// 						const locale = v.locale;
// 						const random = Math.floor(Math.random() * Math.floor(3));

// 						voiceConnection.play(`src/assets/mp3s/${locale}/${context}/${context}${random}.mp3`);
// 						return true;
// 					}
// 					else if (typeOfAction.includes(context) && v.annUser) {
// 						const locale = v.locale;
// 						const random = Math.floor(Math.random() * Math.floor(3));

// 						voiceConnection.play(`src/assets/mp3s/${locale}/${context}/${context}${random}.mp3`);
// 						return true;
// 					}

// 					return v.id === voiceConnection.channel.id;
// 				})
// 			);
// 		}
// 	}

// 	return false;
// }

export function getFunction(output: string, locale: number, context: EventAction | AnnouncementAction | LogActions) {
  let func = null;

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

export function clientLog(
  message: Message | null,
  guildList: PGuild[],
  context: EventAction | AnnouncementAction | LogActions,
  args: unknown
): string {
  if (message === null || message.member === null) {
    return 'there was an error';
  }

  if (!message.member.voice) {
    return 'there was an error';
  }

  guildList.some((g) =>
    g.pChannels.some((p) =>
      p.pVoiceChannels.some((v) => {
        if (message.member && message.member.voice.channel) {
          if (v.id === message.member.voice.channel.id) {
            // message.author.presence.member.voice.channel.id) {
            switch (v.locale) {
            case Locale.gr:
              return consoleText.find((c) => c.name === context)?.lang.gr(args);
            case Locale.en:
              return consoleText.find((c) => c.name === context)?.lang.en(args);
            case Locale.de:
              return consoleText.find((c) => c.name === context)?.lang.de(args);
            }
          }
        }
      })
    )
  );

  return consoleText.find((c) => c.name === context)?.lang.en(args);
}
