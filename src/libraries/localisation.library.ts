import { Client, Message, User } from "discord.js";
import { Locale } from "../data/enums/Locales.enum";
import { PGuild } from "../types/classes/PGuild.class";
import { LocalisationOption } from "../types/classes/PTypes.interface";

const typeOfAnnouncement = ['fail', 'announce', 'spotify', 'url', 'read_only', 'join', 'leave'];
const typeOfAction = ['user_connected', 'user_disconnected'];

export const portal: LocalisationOption[] = [
  {
    name: 'join',
    lang: {
      gr: () => { return '> Γειά σας, το Πόρταλ είναι εδώ'; },
      en: () => { return '> Cheers love, Portal\'s here'; },
      de: () => { return '> Hallo, Portal ist da'; }
    }
  },
  {
    name: 'leave',
    lang: {
      gr: () => { return '> Αποχαιρετώ, καλή συνέχεια σε όλους'; },
      en: () => { return '> Goodbye everyone'; },
      de: () => { return '> Auf Wiedersehen alle'; }
    }
  },
  {
    name: 'announce',
    lang: {
      gr: (user: User) => { return `o ${user} έκανε μια ανακοίνωση`; },
      en: (user: User) => { return `${user} made an announcement`; },
      de: (user: User) => { return `${user} hat eine Ankündigung gemacht`; }
    }
  },
  {
    name: 'spotify',
    lang: {
      gr: (user: User) => { return `o ${user} έβαλε νέο κομμάτι`; },
      en: (user: User) => { return `${user} listens to a new song`; },
      de: (user: User) => { return `${user} hört sich ein neues Lied an`; }
    }
  },
  {
    name: 'url',
    lang: {
      gr: (user: User) => { return `o ${user} ανέβασε έναν νέο σύνδεσμο`; },
      en: (user: User) => { return `${user} sent a new link`; },
      de: (user: User) => { return `${user} hat einen neuen Link geschickt`; }
    }
  },
  {
    name: 'read_only',
    lang: {
      gr: (user: User) => { return `${user}, το κανάλι είναι μόνο για ανάγνωση`; },
      en: (user: User) => { return `${user}, the channel is read-only`; },
      de: (user: User) => { return `${user}, der Kanal ist schreibgeschütz`; }
    }
  },
  {
    name: 'fail',
    lang: {
      gr: (user: User) => { return `${user}, κάτι δεν πήγε καλά`; },
      en: (user: User) => { return `${user}, something went wrong`; },
      de: (user: User) => { return `${user}, etwas ist schief gelaufen`; }
    }
  },
  {
    name: 'user_connected',
    lang: {
      gr: (user: User) => { return `ο χρήστης ${user} συνδέθηκε στο κανάλι`; },
      en: (user: User) => { return `user ${user} connected to the channel`; },
      de: (user: User) => { return `mitglied ${user} hat sich zum Kanal verbunden`; }
    }
  },
  {
    name: 'user_disconnected',
    lang: {
      gr: (user: User) => { return `ο χρήστης ${user} αποχώρησε από το κανάλι`; },
      en: (user: User) => { return `user ${user} disconnected from the channel`; },
      de: (user: User) => { return `mitglied ${user} hat sich vom Kanal unverbunden`; }
    }
  }
]

export const console_text: LocalisationOption[] = [
  {
    name: 'ready',
    lang: {
      gr: (member_length: number, channel_length: number, guild_length: number) => {
        return `το ρομποτ ξεκίνησε, με ${member_length} χρήστες, μέσα σε ${channel_length} κανάλια σε ${guild_length} συντεχνίες`;
      },
      en: (member_length: number, channel_length: number, guild_length: number) => {
        return `bot has started, with ${member_length} users, in ${channel_length} channels from ${guild_length} guilds`;
      },
      de: (member_length: number, channel_length: number, guild_length: number) => {
        return `bot hat ${member_length} Mitglieder in ${channel_length} Kanälen von ${guild_length} Gilden gestartet`;
      }
    }

  },
  {
    name: 'updating_guild', // remove
    lang: {

      gr: (args: any) => { return '> Το αρχείο JSON των συντεχνιών ενημερώθηκε'; },
      en: (args: any) => { return '> Guild JSON file has been updated'; },
      de: (args: any) => { return '> Die JSON Datei der Gilde wurde aktualisiert'; }
    }
  },
  {
    name: 'presence_controlled_away',
    lang: {
      gr: (args: any) => {
        return `ο χρήστης ${args.newPresence.member.displayName} είναι μέλος ` +
					`μια ελεγχόμενης συντεχνίας, έχει αλλάξει κατάσταση, αλλά βρίσκεται στη συντεχνία ` +
					`(${args.newPresence.guild.name})`;
      },
      en: (args: any) => {
        return `${args.newPresence.member.displayName} who is a member of a handled server, ` +
					`has changed presence, but is in another server (${args.newPresence.guild.name})`;
      },
      de: (args: any) => {
        return `${args.newPresence.member.displayName} who is a member of a handled server, ` +
					`has changed presence, but is in another server (${args.newPresence.guild.name})`;
      }
    }
  },
  {
    name: 'presence_controlled',
    lang: {
      gr: (displayName: string, name: string) => { return `ο χρήστης ${displayName} έχει αλλάξει κατάσταση, και βρίσκεται στην ελεγχόμενη συντεχνία (${name})`; },
      en: (displayName: string, name: string) => { return `${displayName} has changed presence, in controlled server (${name})`; },
      de: (displayName: string, name: string) => { return `${displayName} has changed presence, in controlled server (${name})`; }
    }
  },
  {
    name: 'could_not_fetch_data',
    lang: {
      gr: (data: string, source: string) => { return `δεν κατάφερα να πάρω το ${data} από το ${source}`; },
      en: (data: string, source: string) => { return `could not fetch ${data} from ${source}`; },
      de: (data: string, source: string) => { return `ich konnte ${data} nicht vom ${source} holen`; }
    }
  }
]

// export function client_talk(
// 	client: Client, pGuild: GuildPrtl, context: string
// ): boolean {
// 	const voice_connection = client?.voice?.connections
// 		.find(connection => connection.channel.guild.id === pGuild.id);

// 	if (voice_connection) {
// 		if (!voice_connection.dispatcher) {
// 			return pGuild.portal_list.some(p =>
// 				p.voice_list.some(v => {

// 					if (typeOfAnnouncement.includes(context) && v.ann_announce) {
// 						const locale = v.locale;
// 						const random = Math.floor(Math.random() * Math.floor(3));

// 						voice_connection.play(`src/assets/mp3s/${locale}/${context}/${context}_${random}.mp3`);
// 						return true;
// 					}
// 					else if (typeOfAction.includes(context) && v.ann_user) {
// 						const locale = v.locale;
// 						const random = Math.floor(Math.random() * Math.floor(3));

// 						voice_connection.play(`src/assets/mp3s/${locale}/${context}/${context}_${random}.mp3`);
// 						return true;
// 					}

// 					return v.id === voice_connection.channel.id;
// 				})
// 			);
// 		}
// 	}

// 	return false;
// }

export function getFunction(
  output: string, locale: number, context: string
): any {
  let func: any = null;

  if (output === 'portal') {
    portal.some(ct => {
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
  }
  else if (output === 'console') {
    console_text.some(ct => {
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
  message: Message, pGuild: PGuild, context: string
): string {
  if (!message) return 'could not fetch message';
  if (!message.member) return 'could not fetch member';
  if (!message.member.voice) return 'could not fetch voice';
  if (!message.member.voice) return 'could not fetch voice';

  let return_value = 'could not find data';

  const found = pGuild.pChannels.some(p =>
    p.pVoiceChannels.some(v => {
      if (message.member && message.member.voice.channel) {
        if (v.id === message.member.voice.channel.id) { // message.author.presence.member.voice.channel.id) {
          switch (v.locale) {
          case Locale.gr: return_value = portal.find(p => p.name === context)?.lang.gr(); break;
          case Locale.en: return_value = portal.find(p => p.name === context)?.lang.en(); break;
          case Locale.de: return_value = portal.find(p => p.name === context)?.lang.de(); break;
          }

          return true;
        }
      }

      return false;
    })
  );

  if (found) {
    return return_value
  } else {
    return portal.find(p => p.name === context)?.lang.en();
  }
}

export function clientLog(
  message: Message | null, guild_list: PGuild[], context: string, args: any
): string {
  if (message === null || message.member === null) {
    return 'there was an error';
  }

  if (!message.member.voice) {
    return 'there was an error';
  }

  guild_list.some(g =>
    g.pChannels.some(p =>
      p.pVoiceChannels.some(v => {
        if (message.member && message.member.voice.channel) {
          if (v.id === message.member.voice.channel.id) { // message.author.presence.member.voice.channel.id) {
            switch (v.locale) {
            case Locale.gr:
              return console_text.find(c => c.name === context)?.lang.gr(args);
            case Locale.en:
              return console_text.find(c => c.name === context)?.lang.en(args);
            case Locale.de:
              return console_text.find(c => c.name === context)?.lang.de(args);
            }
          }
        }
      })
    )
  );

  return console_text.find(c => c.name === context)?.lang.en(args);
}
