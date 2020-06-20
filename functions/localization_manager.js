/* eslint-disable no-cond-assign */
/* eslint-disable no-undef */

module.exports =
{
	client_talk: function (client, guild_list, context) {
		if (client.voice !== undefined) {
			if (voiceConnection = client.voice.connections.find(connection => connection.channel.id)) {
				for (let guild_id in guild_list) {
					for (let portal_id in guild_list[guild_id].portal_list) {
						for (let voice_id in guild_list[guild_id].portal_list[portal_id].voice_list) {
							if (voice_id === voiceConnection.channel.id) {
								let locale = guild_list[guild_id].portal_list[portal_id].voice_list[voice_id].locale;
								voiceConnection.play(`./assets/mp3s/${locale}/${context}_${0}.mp3`);
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
		console.log('perasa apo 0');
		if (message !== null) { console.log('perasa apo 1');
			if (message.member.voice !== undefined && message.member.voice !== null) { console.log('perasa apo 2');
				for (let guild_id in guild_list) { console.log('perasa apo 3');
					for (let portal_id in guild_list[guild_id].portal_list) { console.log('perasa apo 4');
						for (let voice_id in guild_list[guild_id].portal_list[portal_id].voice_list) {
							if (voice_id === message.member.voice.channel.id) {//message.author.presence.member.voice.channel.id) {
								locale = guild_list[guild_id].portal_list[portal_id].voice_list[voice_id].locale;
								return this.portal[locale][context].text();
							}
						}
					}
				}
			}
		}

		locale = guild_list[message.guild.id].locale;
		return this.portal[locale][context].text();
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
								return this.portal[locale][context].text(args);
							}
						}
					}
				}
			}
		}

		locale = guild_list[guild_id].locale;
		return this.console[locale][context](args);
	}
	,

	portal:
	{
		gr:
		{
			hello: {
				text: () => {
					return 'Γειά σας, το Πόρταλ είναι εδώ.';
				},
				voice: (client) => {
					let random = Math.floor(Math.random() * Math.floor(1));
					client_talk(client, `./assets/mp3s/gr/hello_${random}.mp3`);
				}
			},
			goodbye: {
				text: () => {
					return 'Αποχαιρετώ, καλή συνέχεια σε όλους.';
				},
				voice: (client) => {
					let random = Math.floor(Math.random() * Math.floor(1));
					client_talk(client, `./assets/mp3s/gr/goodbye_${random}.mp3`);
				}
			},
			announcement: {
				text: () => {
					return 'Υπάρχει μια νέα ανακοίνωση.';
				},
				voice: (client) => {
					let random = Math.floor(Math.random() * Math.floor(0));
					client_talk(client, `./assets/mp3s/gr/announcement_${random}.mp3`);
				}
			},
			error: {
				text: () => {
					return 'Κάτι δεν πήγε καλά.';
				},
				voice: (client) => {
					let random = Math.floor(Math.random() * Math.floor(0));
					client_talk(client, `./assets/mp3s/gr/error_${random}.mp3`);
				}
			},
			user_connected: {
				text: (user) => {
					return `Ο χρήστης ${user} συνδέθηκε στο κανάλι.`;
				},
				voice: (client) => {
					let random = Math.floor(Math.random() * Math.floor(2));
					client_talk(client, `./assets/mp3s/gr/user_connected_${random}.mp3`);
				}
			},
			user_disconnected: {
				text: (user) => {
					return `Ο χρήστης ${user} αποχώρησε από το κανάλι.`;
				},
				voice: (client) => {
					let random = Math.floor(Math.random() * Math.floor(2));
					client_talk(client, `./assets/mp3s/gr/user_disconnected_${random}.mp3`);
				}
			}
		},
		en:
		{
			hello: {
				text: () => {
					return 'Cheers love, Portal\'s here.';
				},
				voice: (client) => {
					let random = Math.floor(Math.random() * Math.floor(0));
					client_talk(client, `./assets/mp3s/en/hello_${random}.mp3`);
				}
			},
			goodbye: {
				text: () => {
					return 'Goodbye everyone.';
				},
				voice: (client) => {
					let random = Math.floor(Math.random() * Math.floor(1));
					client_talk(client, `./assets/mp3s/en/goodbye_${random}.mp3`);
				}
			},
			error: {
				text: () => {
					return 'Κάτι δεν πήγε καλά.';
				},
				voice: (client) => {
					let random = Math.floor(Math.random() * Math.floor(0));
					client_talk(client, `./assets/mp3s/gr/error_${random}.mp3`);
				}
			},
			user_connected: {
				text: (user) => {
					return `User ${user} connected to the channel.`;
				},
				voice: (client) => {
					let random = Math.floor(Math.random() * Math.floor(0));
					client_talk(client, `./assets/mp3s/en/user_connected_${random}.mp3`);
				}
			},
			user_disconnected: {
				text: (user) => {
					return `User ${user} disconnected from the channel.`;
				},
				voice: (client) => {
					let random = Math.floor(Math.random() * Math.floor(0));
					client_talk(client, `./assets/mp3s/en/user_disconnected_${random}.mp3`);
				}
			},

		},
		de:
		{
			hello: {
				text: () => {
					return 'Hallo, Portal ist da.';
				},
				voice: (client) => {
					let random = Math.floor(Math.random() * Math.floor(1));
					client_talk(client, `./assets/mp3s/de/hello_${random}.mp3`);
				}
			},
			goodbye: {
				text: () => {
					return 'Auf Wiedersehen alle.';
				},
				voice: (client) => {
					let random = Math.floor(Math.random() * Math.floor(1));
					client_talk(client, `./assets/mp3s/de/goodbye_${random}.mp3`);
				}
			},
			error: {
				text: () => {
					return 'Κάτι δεν πήγε καλά.';
				},
				voice: (client) => {
					let random = Math.floor(Math.random() * Math.floor(0));
					client_talk(client, `./assets/mp3s/gr/error_${random}.mp3`);
				}
			},
			user_connected: {
				text: (user) => {
					return `Mitglied ${user} hat sich zum Kanal verbunden.`;
				},
				voice: (client) => {
					let random = Math.floor(Math.random() * Math.floor(1));
					client_talk(client, `./assets/mp3s/de/user_connected_${random}.mp3`);
				}
			},
			user_disconnected: {
				text: (user) => {
					return `Mitglied ${user} hat sich vom Kanal unverbunden.`;
				},
				voice: (client) => {
					let random = Math.floor(Math.random() * Math.floor(1));
					client_talk(client, `./assets/mp3s/de/user_disconnected_${random}.mp3`);
				}
			},

		}
	}
	,

	console:
	{
		gr:
		{
			ready: (args) => {
				return `Το μποτ ξεκίνησε, με ${args.client.users.cache.size} χρήστες, μέσα σε ` +
					`${args.client.channels.cache.size} κανάλια σε ${args.client.guilds.cache.size} συντεχνίες.`;
			},
			updating_guild: (args) => {
				return '> Το αρχείο JSON των συντεχνιών ενημερώθηκε.';
			},
			presence_controlled_away: (args) => {
				return `Ο χρήστης ${args.newPresence.member.displayName} είναι μέλος μια ελεγχόμενης συντεχνίας, ` +
					`έχει αλλάξει κατάσταση, αλλά βρίσκεται στη συντεχνία (${args.newPresence.guild.name})`;
			},
			presence_controlled: (args) => {
				return `Ο χρήστης ${args.newPresence.member.displayName} έχει αλλάξει κατάσταση, ` +
					`και βρίσκεται στην ελεγχόμενη συντεχνία (${args.newPresence.guild.name})`;
			}
		},
		en:
		{
			ready: (args) => {
				return `Bot has started, with ${args.client.users.cache.size} users, ` +
					`in ${args.client.channels.cache.size} channels from ε ${args.client.guilds.cache.size} guilds.`;
			},
			updating_guild: (args) => {
				return '> Guild JSON file has been updated.';
			},
			presence_controlled_away: (args) => {
				return `${args.newPresence.member.displayName} who is a member of a handled server, ` +
					`has changed presence, but is in another server (${args.newPresence.guild.name})`;
			},
			presence_controlled: (args) => {
				return `${args.newPresence.member.displayName} has changed presence, ` +
					`in controlled server (${args.newPresence.guild.name})`;
			}
		},
		de:
		{
			ready: (args) => {
				return `Bot hat ${args.client.users.cache.size} Mitglieder in ${channel_count} Kanälen von ${guild_count} Gilden gestartet.`;
			},
			updating_guild: (args) => {
				return '> Die JSON Datei der Gilde wurde aktualisiert.';
			},
			presence_controlled_away: (args) => {
				return `${args.newPresence.member.displayName} who is a member of a handled server, ` +
					`has changed presence, but is in another server (${args.newPresence.guild.name})`;
			},
			presence_controlled: (args) => {
				return `${args.newPresence.member.displayName} has changed presence, ` +
					`in controlled server (${args.newPresence.guild.name})`;
			}
		}
	}
};

