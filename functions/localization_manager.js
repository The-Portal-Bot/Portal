/* eslint-disable no-unused-vars */
/* eslint-disable no-cond-assign */
/* eslint-disable no-undef */

module.exports =
{
	client_talk: function (client, guild_list, context) {
		let check = null;
		if (context === 'fail' || context === 'announce' || context === 'spotify' || context === 'url') {
			check = 'ann_announce';
		} else if (context === 'user_connected' || context === 'user_disconnected') {
			check = 'ann_user';
		}

		if (client.voice !== undefined) {
			if (voiceConnection = client.voice.connections.find(connection => connection.channel.id)) {
				for (let guild_id in guild_list) {
					for (let portal_id in guild_list[guild_id].portal_list) {
						for (let voice_id in guild_list[guild_id].portal_list[portal_id].voice_list) {
							if (voice_id === voiceConnection.channel.id) {
								if (!check || guild_list[guild_id].portal_list[portal_id].voice_list[voice_id][check]) {
									let locale = guild_list[guild_id].portal_list[portal_id].voice_list[voice_id].locale;
									let random = Math.floor(Math.random() * Math.floor(3));
									voiceConnection.play(`./assets/mp3s/${locale}/${context}/${context}_${random}.mp3`);
								}
							}
						}
					}
				}
			}
		}
	}
	,

	client_write: function (message, guild_list, context) {
		let locale = null;
		if (message !== null) {
			if (message.member.voice !== undefined && message.member.voice !== null) {
				for (let guild_id in guild_list) {
					for (let portal_id in guild_list[guild_id].portal_list) {
						for (let voice_id in guild_list[guild_id].portal_list[portal_id].voice_list) {
							if (voice_id === message.member.voice.channel.id) {//message.author.presence.member.voice.channel.id) {
								locale = guild_list[guild_id].portal_list[portal_id].voice_list[voice_id].locale;
								return this.portal[context][locale]();
							}
						}
					}
				}
			}
		}

		locale = guild_list[message.guild.id].locale;
		return this.portal[context][locale]();
	}
	,

	client_log: function (guild_id, message, guild_list, context, args) {
		let locale = null;
		if (message !== null) {
			if (message.author.voice !== undefined && message.author.voice !== null) {
				for (let guild_id in guild_list) {
					for (let portal_id in guild_list[guild_id].portal_list) {
						for (let voice_id in guild_list[guild_id].portal_list[portal_id].voice_list) {
							if (voice_id === message.member.channel.id) {//message.author.presence.member.voice.channel.id) {
								locale = guild_list[guild_id].portal_list[portal_id].voice_list[voice_id].locale;
								return this.console[context][locale].text(args);
							}
						}
					}
				}
			}
		}

		locale = guild_list[guild_id].locale;
		return this.console[context][locale](args);
	}
	,

	portal:
	{
		join: {
			gr: () => { return 'Γειά σας, το Πόρταλ είναι εδώ.'; },
			en: () => { return 'Cheers love, Portal\'s here.'; },
			de: () => { return 'Hallo, Portal ist da.'; }
		},
		leave: {
			gr: () => { return 'Αποχαιρετώ, καλή συνέχεια σε όλους.'; },
			en: () => { return 'Goodbye everyone.'; },
			de: () => { return 'Auf Wiedersehen alle.'; }
		},
		announce: {
			gr: (user) => { return `O ${user} έκανε μια ανακοίνωση.`; },
			en: (user) => { return `${user} made an announcement.`; },
			de: (user) => { return `${user} hat eine Ankündigung gemacht.`; }
		},
		spotify: {
			gr: (user) => { return `O ${user} έβαλε νέο κομμάτι.`; },
			en: (user) => { return `${user} listens to a new song.`; },
			de: (user) => { return `${user} hört sich ein neues Lied an.`; }
		},
		url: {
			gr: (user) => { return `O ${user} ανέβασε έναν νέο σύνδεσμο.`; },
			en: (user) => { return `${user} sent a new link.`; },
			de: (user) => { return `${user} hat einen neuen Link geschickt.`; }
		},
		read__only: {
			gr: (user) => { return `${user}, το κανάλι είναι μόνο για ανάγνωση.`; },
			en: (user) => { return `${user}, the channel is read-only.`; },
			de: (user) => { return `${user}, der Kanal ist schreibgeschütz.`; }
		},
		fail: {
			gr: (user) => { return `${user}, κάτι δεν πήγε καλά.`; },
			en: (user) => { return `${user}, something went wrong.`; },
			de: (user) => { return `${user}, etwas ist schief gelaufen.`; }
		},
		user_connected: {
			gr: (user) => { return `Ο χρήστης ${user} συνδέθηκε στο κανάλι.`; },
			en: (user) => { return `User ${user} connected to the channel.`; },
			de: (user) => { return `Mitglied ${user} hat sich zum Kanal verbunden.`; }
		},
		user_disconnected: {
			gr: (user) => { return `Ο χρήστης ${user} αποχώρησε από το κανάλι.`; },
			en: (user) => { return `User ${user} disconnected from the channel.`; },
			de: (user) => { return `Mitglied ${user} hat sich vom Kanal unverbunden.`; }
		}
	}
	,

	console:
	{
		ready: {
			gr: (args) => { return `Το μποτ ξεκίνησε, με ${args.client.users.cache.size} χρήστες, μέσα σε ` +
				`${args.client.channels.cache.size} κανάλια σε ${args.client.guilds.cache.size} συντεχνίες.`; },
			en: (args) => { return `Bot has started, with ${args.client.users.cache.size} users, ` +
				`in ${args.client.channels.cache.size} channels from ε ${args.client.guilds.cache.size} guilds.`; },
			de: (args) => { return `Bot hat ${args.client.users.cache.size} Mitglieder in ${channel_count} Kanälen von ${guild_count} Gilden gestartet.`; }
		},
		updating_guild: {
			gr: (args) => { return '> Το αρχείο JSON των συντεχνιών ενημερώθηκε.'; },
			en: (args) => { return '> Guild JSON file has been updated.'; },
			de: (args) => { return '> Die JSON Datei der Gilde wurde aktualisiert.'; }
		},
		presence_controlled_away: {
			gr: (args) => { return `Ο χρήστης ${args.newPresence.member.displayName} είναι μέλος μια ελεγχόμενης συντεχνίας, ` +
				`έχει αλλάξει κατάσταση, αλλά βρίσκεται στη συντεχνία (${args.newPresence.guild.name})`; },
			en: (args) => { return `${args.newPresence.member.displayName} who is a member of a handled server, ` +
				`has changed presence, but is in another server (${args.newPresence.guild.name})`; },
			de: (args) => { return `${args.newPresence.member.displayName} who is a member of a handled server, ` +
				`has changed presence, but is in another server (${args.newPresence.guild.name})`; }
		},
		presence_controlled: {
			gr: (args) => { return `Ο χρήστης ${args.newPresence.member.displayName} έχει αλλάξει κατάσταση, ` +
				`και βρίσκεται στην ελεγχόμενη συντεχνία (${args.newPresence.guild.name})`; },
			en: (args) => { return `${args.newPresence.member.displayName} has changed presence, ` +
				`in controlled server (${args.newPresence.guild.name})`; },
			de: (args) => { return `${args.newPresence.member.displayName} has changed presence, ` +
				`in controlled server (${args.newPresence.guild.name})`; }
		}
	}
};

