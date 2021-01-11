import { Client, Message, User } from "discord.js";
import { GuildPrtl } from "../types/classes/GuildPrtl";
import { LocalisationOption } from "../types/interfaces/InterfacesPrtl";

const type_of_announcement = ['fail', 'announce', 'spotify', 'url', 'read_only', 'join', 'leave'];
const type_of_action = ['user_connected', 'user_disconnected'];
export const portal: LocalisationOption[] = [
	{
		name: 'join',
		lang: {
			gr: () => { return 'Γειά σας, το Πόρταλ είναι εδώ'; },
			en: () => { return 'Cheers love, Portal\'s here'; },
			de: () => { return 'Hallo, Portal ist da'; }
		}
	},
	{
		name: 'leave',
		lang: {
			gr: () => { return 'Αποχαιρετώ, καλή συνέχεια σε όλους'; },
			en: () => { return 'Goodbye everyone'; },
			de: () => { return 'Auf Wiedersehen alle'; }
		}
	},
	{
		name: 'announce',
		lang: {
			gr: (user: User) => { return `O ${user} έκανε μια ανακοίνωση`; },
			en: (user: User) => { return `${user} made an announcement`; },
			de: (user: User) => { return `${user} hat eine Ankündigung gemacht`; }
		}
	},
	{
		name: 'spotify',
		lang: {
			gr: (user: User) => { return `O ${user} έβαλε νέο κομμάτι`; },
			en: (user: User) => { return `${user} listens to a new song`; },
			de: (user: User) => { return `${user} hört sich ein neues Lied an`; }
		}
	},
	{
		name: 'url',
		lang: {
			gr: (user: User) => { return `O ${user} ανέβασε έναν νέο σύνδεσμο`; },
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
			gr: (user: User) => { return `Ο χρήστης ${user} συνδέθηκε στο κανάλι`; },
			en: (user: User) => { return `User ${user} connected to the channel`; },
			de: (user: User) => { return `Mitglied ${user} hat sich zum Kanal verbunden`; }
		}
	},
	{
		name: 'user_disconnected',
		lang: {
			gr: (user: User) => { return `Ο χρήστης ${user} αποχώρησε από το κανάλι`; },
			en: (user: User) => { return `User ${user} disconnected from the channel`; },
			de: (user: User) => { return `Mitglied ${user} hat sich vom Kanal unverbunden`; }
		}
	}
]
export const console_text: LocalisationOption[] = [
	{
		name: 'ready',
		lang: {
			gr: (args: any) => { return `Το μποτ ξεκίνησε, με ${args.a} χρήστες, μέσα σε ${args.b} κανάλια σε ${args.c} συντεχνίες`; },
			en: (args: any) => { return `Bot has started, with ${args.a} users, in ${args.b} channels from ${args.c} guilds`; },
			de: (args: any) => { return `Bot hat ${args.a} Mitglieder in ${args.b} Kanälen von ${args.c} Gilden gestartet`; }
		}

	},
	{
		name: 'updating_guild',
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
				return `Ο χρήστης ${args.newPresence.member.displayName} είναι μέλος ` +
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
			gr: (args: any) => { return `Ο χρήστης ${args.a} έχει αλλάξει κατάσταση, και βρίσκεται στην ελεγχόμενη συντεχνία (${args.b})`; },
			en: (args: any) => { return `${args.a} has changed presence, in controlled server (${args.b})`; },
			de: (args: any) => { return `${args.a} has changed presence, in controlled server (${args.b})`; }
		}
	},
	{
		name: 'could_not_fetch_data',
		lang: {
			gr: (data: string, source: string) => { return `Δεν κατάφερα να πάρω το ${data} από το ${source}`; },
			en: (data: string, source: string) => { return `Could not fetch ${data} from ${source}`; },
			de: (data: string, source: string) => { return `Ich konnte ${data} nicht vom ${source} holen`; }
		}
	}
]

export function client_talk(client: Client, guild_list: GuildPrtl[], context: string): boolean {
	const voiceConnection = client?.voice?.connections.find(connection => !!connection.channel.id);

	if (voiceConnection) {
		return guild_list.some(g =>
			g.portal_list.some(p =>
				p.voice_list.some(v => {
					if (!g.dispatcher) {
						if (type_of_announcement.includes(context) && v.ann_announce) {
							const locale = v.locale;
							const random = Math.floor(Math.random() * Math.floor(3));
							console.log(`I will play: src/assets/mp3s/${locale}/${context}/${context}_${random}.mp3`);
							voiceConnection.play(`src/assets/mp3s/${locale}/${context}/${context}_${random}.mp3`);
							return true;
						}
						else if (type_of_action.includes(context) && v.ann_user) {
							const locale = v.locale;
							const random = Math.floor(Math.random() * Math.floor(3));
							console.log(`I will play: src/assets/mp3s/${locale}/${context}/${context}_${random}.mp3`);
							voiceConnection.play(`src/assets/mp3s/${locale}/${context}/${context}_${random}.mp3`);
							return true;
						}
					}
					return v.id === voiceConnection.channel.id;
				})
			)
		);
	}

	return false;
};

export function client_write(message: Message, guild_list: GuildPrtl[], context: string): string {
	if (message === null) return 'could not fetch message';
	if (message.member === null) return 'could not fetch member';
	if (message.member.voice === undefined) return 'coud not fetch voice';
	if (message.member.voice === null) return 'coud not fetch voice';

	let return_value = 'could not find data';

	const found = guild_list.some(g =>
		g.portal_list.some(p =>
			p.voice_list.some(v => {
				if (message.member && message.member.voice.channel) {
					if (v.id === message.member.voice.channel.id) { // message.author.presence.member.voice.channel.id) {
						switch (v.locale) {
							case 'gr': return_value = portal.find(p => p.name === context)?.lang.gr(); break;
							case 'en': return_value = portal.find(p => p.name === context)?.lang.en(); break;
							case 'de': return_value = portal.find(p => p.name === context)?.lang.de(); break;
						}
						return true;
					}
				}
				return false;
			})
		)
	);

	if (found)
		return return_value
	else
		return 'there was an error';
};

export function client_log(
	message: Message | null, guild_list: GuildPrtl[], context: string, args: any): string {
	if (message === null || message.member === null) return 'there was an error';
	if (message.member.voice === undefined || message.member.voice === null) return 'there was an error';

	guild_list.some(g =>
		g.portal_list.some(p =>
			p.voice_list.some(v => {
				if (message.member && message.member.voice.channel) {
					if (v.id === message.member.voice.channel.id) { // message.author.presence.member.voice.channel.id) {
						switch (v.locale) {
							case 'gr': return console_text.find(c => c.name === context)?.lang.gr(args);
							case 'en': return console_text.find(c => c.name === context)?.lang.en(args);
							case 'de': return console_text.find(c => c.name === context)?.lang.de(args);
						}
					}
				}
			})
		)
	);

	return 'there was an error';
};

