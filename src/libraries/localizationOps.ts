import { Client, Message, User } from "discord.js";
import { LocalizationOption } from "../types/classes/ReturnPormise";

const type_of_announcement = ['fail', 'announce', 'spotify', 'url', 'read_only', 'join', 'leave'];
const type_of_action = ['user_connected', 'user_disconnected'];
const portal: LocalizationOption[] = [
	{
		name: 'join',
		lang: {
			gr: () => { return 'Γειά σας, το Πόρταλ είναι εδώ.'; },
			en: () => { return 'Cheers love, Portal\'s here.'; },
			de: () => { return 'Hallo, Portal ist da.'; }
		}
	},
	{
		name: 'leave',
		lang: {
			gr: () => { return 'Αποχαιρετώ, καλή συνέχεια σε όλους.'; },
			en: () => { return 'Goodbye everyone.'; },
			de: () => { return 'Auf Wiedersehen alle.'; }
		}
	},
	{
		name: 'announce',
		lang: {
			gr: (user: User) => { return `O ${user} έκανε μια ανακοίνωση.`; },
			en: (user: User) => { return `${user} made an announcement.`; },
			de: (user: User) => { return `${user} hat eine Ankündigung gemacht.`; }
		}
	},
	{
		name: 'spotify',
		lang: {
			gr: (user: User) => { return `O ${user} έβαλε νέο κομμάτι.`; },
			en: (user: User) => { return `${user} listens to a new song.`; },
			de: (user: User) => { return `${user} hört sich ein neues Lied an.`; }
		}
	},
	{
		name: 'url',
		lang: {
			gr: (user: User) => { return `O ${user} ανέβασε έναν νέο σύνδεσμο.`; },
			en: (user: User) => { return `${user} sent a new link.`; },
			de: (user: User) => { return `${user} hat einen neuen Link geschickt.`; }
		}
	},
	{
		name: 'read_only',
		lang: {
			gr: (user: User) => { return `${user}, το κανάλι είναι μόνο για ανάγνωση.`; },
			en: (user: User) => { return `${user}, the channel is read-only.`; },
			de: (user: User) => { return `${user}, der Kanal ist schreibgeschütz.`; }
		}
	},
	{
		name: 'fail',
		lang: {
			gr: (user: User) => { return `${user}, κάτι δεν πήγε καλά.`; },
			en: (user: User) => { return `${user}, something went wrong.`; },
			de: (user: User) => { return `${user}, etwas ist schief gelaufen.`; }
		}
	},
	{
		name: 'user_connected',
		lang: {
			gr: (user: User) => { return `Ο χρήστης ${user} συνδέθηκε στο κανάλι.`; },
			en: (user: User) => { return `User ${user} connected to the channel.`; },
			de: (user: User) => { return `Mitglied ${user} hat sich zum Kanal verbunden.`; }
		}
	},
	{
		name: 'user_disconnected',
		lang: {
			gr: (user: User) => { return `Ο χρήστης ${user} αποχώρησε από το κανάλι.`; },
			en: (user: User) => { return `User ${user} disconnected from the channel.`; },
			de: (user: User) => { return `Mitglied ${user} hat sich vom Kanal unverbunden.`; }
		}
	}
]
const console: LocalizationOption[] = [
	{
		name: 'ready',
		lang: {
			gr: (args: any) => {
				return `Το μποτ ξεκίνησε, με ${args.client.users.cache.size} χρήστες, μέσα σε ` +
					`${args.client.channels.cache.size} κανάλια σε ${args.client.guilds.cache.size} συντεχνίες.`;
			},
			en: (args: any) => {
				return `Bot has started, with ${args.client.users.cache.size} users, ` +
					`in ${args.client.channels.cache.size} channels from ${args.client.guilds.cache.size} guilds.`;
			},
			de: (args: any) => {
				return `Bot hat ${args.client.users.cache.size} Mitglieder in ${args.client.channels.cache.size} ` +
					`Kanälen von ${args.client.guilds.cache.size} Gilden gestartet.`;
			}
		}

	},
	{
		name: 'updating_guild',
		lang: {

			gr: (args: any) => { return '> Το αρχείο JSON των συντεχνιών ενημερώθηκε.'; },
			en: (args: any) => { return '> Guild JSON file has been updated.'; },
			de: (args: any) => { return '> Die JSON Datei der Gilde wurde aktualisiert.'; },
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
			gr: (args: any) => {
				return `Ο χρήστης ${args.newPresence.member.displayName} έχει αλλάξει κατάσταση, ` +
					`και βρίσκεται στην ελεγχόμενη συντεχνία (${args.newPresence.guild.name})`;
			},
			en: (args: any) => {
				return `${args.newPresence.member.displayName} has changed presence, ` +
					`in controlled server (${args.newPresence.guild.name})`;
			},
			de: (args: any) => {
				return `${args.newPresence.member.displayName} has changed presence, ` +
					`in controlled server (${args.newPresence.guild.name})`;
			}
		}
	}
]

export function client_talk(client: Client, guild_list: any, context: string): boolean {
	let check = null;
	if (type_of_announcement.includes(context)) { check = 'ann_announce'; }
	else if (type_of_action.includes(context)) { check = 'ann_user'; }

	if (client.voice !== undefined) {
		if (client.voice) {
			const voiceConnection = client.voice.connections.find(connection => !!connection.channel.id);
			if (voiceConnection) {
				for (const guild_id in guild_list) {
					for (const portal_id in guild_list[guild_id].portal_list) {
						for (const voice_id in guild_list[guild_id].portal_list[portal_id].voice_list) {
							if (voice_id === voiceConnection.channel.id) {
								if (!guild_list[guild_id].dispatcher) {
									if (!check || guild_list[guild_id].portal_list[portal_id].voice_list[voice_id][check]) {
										const locale = guild_list[guild_id].portal_list[portal_id].voice_list[voice_id].locale;
										const random = Math.floor(Math.random() * Math.floor(3));
										voiceConnection.play(`./assets/mp3s/${locale}/${context}/${context}_${random}.mp3`);
										return true;
									}
								}
							}
						}
					}
				}
			}
		}
	}

	return false;
};

export function client_write(message: Message, guild_list: any, context: string): string {
	let locale = null;
	if (message !== null) {
		if (message.member) {
			if (message.member.voice !== undefined && message.member.voice !== null) {
				for (const guild_id in guild_list) {
					for (const portal_id in guild_list[guild_id].portal_list) {
						for (const voice_id in guild_list[guild_id].portal_list[portal_id].voice_list) {
							if (message.member.voice.channel) {
								if (voice_id === message.member.voice.channel.id) { // message.author.presence.member.voice.channel.id) {
									const locale: string = guild_list[guild_id].portal_list[portal_id].voice_list[voice_id].locale;
									switch (locale) {
										case 'gr': return portal.find(p => p.name === context)?.lang.gr();
										case 'en': return portal.find(p => p.name === context)?.lang.en();
										case 'de': return portal.find(p => p.name === context)?.lang.de();
									}
								}
							}
						}
					}
				}
			}
		}
	}

	return 'there was an error';
};

export function client_log(guild_id: number, message: Message, guild_list: any, context: string, args: any): string {
	let locale = null;
	if (message !== null) {
		if (message.member) {
			if (message.member.voice !== undefined && message.member.voice !== null) {
				for (const guild_list_id in guild_list) {
					for (const portal_id in guild_list[guild_list_id].portal_list) {
						for (const voice_id in guild_list[guild_list_id].portal_list[portal_id].voice_list) {
							if (message.member.voice.channel) {
								if (voice_id === message.member.voice.channel.id) {
									const locale: string = guild_list[guild_list_id].portal_list[portal_id].voice_list[voice_id].locale;
									switch (locale) {
										case 'gr': return console.find(c => c.name === context)?.lang.gr(args);
										case 'en': return console.find(c => c.name === context)?.lang.en(args);
										case 'de': return console.find(c => c.name === context)?.lang.de(args);
									}
								}
							}
						}
					}
				}
			}
		}
	}

	return 'there was an error';
};

