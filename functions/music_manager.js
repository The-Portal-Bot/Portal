/* eslint-disable no-unused-vars */
const guld_mngr = require('./guild_manager');
const lclz_mngr = require('./localization_manager');
const help_mngr = require('./help_manager');

const yts = require('yt-search');
const ytdl = require('ytdl-core');

module.exports = {

	start: async function(client, message, search_term, portal_guilds) {
		return new Promise((resolve) => {
			if(!message.member.voice.channel) {
				return resolve({ result: false, value: 'you are not connected to any channel.' });
			}

			const guild_id = message.member.voice.channel.guild.id;
			const current_dispatcher = portal_guilds[guild_id].dispatcher;
			const current_music_queue = portal_guilds[guild_id].music_queue;

			if(current_dispatcher !== null && current_dispatcher !== undefined) {
				yts(search_term)
					.then(yts_attempt => {
						if (yts_attempt) {
							current_music_queue.push(yts_attempt.videos[0]);
						}
						else {
							console.log('could not find youtube video');
							return resolve ({ result: false, value: 'could not find youtube video' });
						}
					})
					.catch(error => console.log(error));
				return resolve({ result: false, value: 'already playing song, your song has been added in list.' });
			}

			help_mngr.join_user_voice(client, message, portal_guilds, false)
				.then(join_attempt => {
					if (join_attempt.result === true) {
						yts(search_term)
							.then(yts_attempt => {
								if (yts_attempt) {
									portal_guilds[guild_id].dispatcher = join_attempt.voice_connection
										.play(ytdl(yts_attempt.videos[0].url, { filter: 'audioonly' }));
									help_mngr.update_message(portal_guilds[guild_id],
										message.member.voice.channel.guild, yts_attempt.videos[0]);
									return resolve ({ result: false, value: 'playing video' });
								}
								else {
									return resolve ({ result: false, value: 'could not find youtube video' });
								}
							})
							.catch(error => console.log(error));
					}
					else {
						console.log(join_attempt.value);
						return resolve ({ result: false, value: join_attempt.value });
					}
				})
				.catch(error => console.log(error));
		});
	},

	play: async function(guild_id, portal_guilds) {
		return new Promise((resolve) => {
			const current_dispatcher = portal_guilds[guild_id].dispatcher;

			if(current_dispatcher !== null && current_dispatcher !== undefined) {
				if(current_dispatcher.paused) {current_dispatcher.resume();}

				return resolve ({ result: false, value: 'song has been resumed.' });
			}
			else {
				return resolve ({ result: false, value: 'nothing playing write now.' });
			}
		});
	},

	pause: async function(guild_id, portal_guilds) {
		return new Promise((resolve) => {
			const current_dispatcher = portal_guilds[guild_id].dispatcher;

			if(current_dispatcher !== null && current_dispatcher !== undefined) {
				if(!current_dispatcher.paused) {
					current_dispatcher.pause();
				}
				return resolve ({ result: false, value: 'song has been paused.' });
			}
			else {
				return resolve ({ result: false, value: 'nothing playing write now.' });
			}
		});
	},

	stop: async function(guild_id, portal_guilds, guild_object) {
		return new Promise((resolve) => {
			const current_dispatcher = portal_guilds[guild_id].dispatcher;

			const portal_icon_url = 'https://raw.githubusercontent.com/keybraker/keybraker' +
					'.github.io/master/assets/img/logo.png';
			help_mngr.update_message(portal_guilds[guild_id],
				guild_object,
				{
					title: 'Music Player',
					url: 'just type and I\'ll play',
					timestamp: '-',
					views: '-',
					ago: '-',
					thumbnail: portal_icon_url,
				});

			if(current_dispatcher !== null && current_dispatcher !== undefined) {
				if(!current_dispatcher.paused) {
					current_dispatcher.pause();
				}
				portal_guilds[guild_id].dispatcher = null;
				return resolve ({ result: false, value: 'song has been stopped.' });
			}
			else {
				portal_guilds[guild_id].dispatcher = null;
				return resolve ({ result: false, value: 'nothing playing write now.' });
			}
		});
	},

	skip: async function(guild_id, portal_guilds, client, guild_object) {
		return new Promise((resolve) => {
			const current_dispatcher = portal_guilds[guild_id].dispatcher;
			const current_music_queue = portal_guilds[guild_id].music_queue;

			if(current_dispatcher !== null && current_dispatcher !== undefined) {
				if(current_music_queue.length > 0) {
					const next_yts_video = current_music_queue.shift();

					const voiceConnection = client.voice.connections
						.find(connection => connection.channel.id);

					if (voiceConnection) {
						portal_guilds[guild_id].dispatcher = voiceConnection
							.play(ytdl(next_yts_video.url, { filter: 'audioonly' }));

						help_mngr.update_message(
							portal_guilds[guild_id],
							guild_object,
							next_yts_video,
						);
					}
				}
				else {
					const portal_icon_url = 'https://raw.githubusercontent.com/keybraker/keybraker' +
					'.github.io/master/assets/img/logo.png';
					help_mngr.update_message(portal_guilds[guild_id],
						guild_object,
						{
							title: 'Music Player',
							url: 'just type and I\'ll play',
							timestamp: '-',
							views: '-',
							ago: '-',
							thumbnail: portal_icon_url,
						});
					if(!current_dispatcher.paused) {
						current_dispatcher.pause();
					}
					portal_guilds[guild_id].dispatcher = null;
					return resolve ({ result: false, value: 'music list is empty' });
				}

				return resolve ({ result: false, value: 'song has been skipped.' });
			}
			else {
				return resolve ({ result: false, value: 'nothing playing write now.' });
			}
		});
	}
	,
};
