/* eslint-disable no-unused-vars */
const guld_mngr = require('./guild_manager');
const lclz_mngr = require('./localization_manager');
const help_mngr = require('./help_manager');

const yts = require('yt-search');
const ytdl = require('ytdl-core');

module.exports = {

	play: async function(client, message, search_term, portal_guilds) {
		return new Promise((resolve) => {
			if(!message.member.voice.channel) {
				return resolve({ result: false, value: 'you are not connected to any channel.' });
			}

			const current_guild_id = message.member.voice.channel.guild.id;
			let current_dispatcher = portal_guilds[current_guild_id].dispatcher;
			const current_music_queue = portal_guilds[current_guild_id].music_queue;

			if(current_dispatcher !== null && current_dispatcher !== undefined) {
				return resolve({ result: false, value: 'already playing song.' });
			}

			help_mngr.join_user_voice(client, message, portal_guilds, false)
				.then(join_attempt => {
					if (join_attempt.result === true) {
						yts(search_term)
							.then(yts_attempt => {
								if (yts_attempt) {
									current_music_queue.push(yts_attempt.videos[0]);
									current_dispatcher = join_attempt.voice_connection
										.play(ytdl(yts_attempt.videos[0].url, { filter: 'audioonly' }));
									help_mngr.update_message(portal_guilds[current_guild_id],
										message.member.voice.channel.guild, yts_attempt.videos[0]);
								}
								else {
									console.log('could not find youtube video');
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

	pause: async function(message, portal_guilds) {
		return new Promise((resolve) => {
			const current_guild_id = message.member.voice.channel.guild.id;
			const current_dispatcher = portal_guilds[current_guild_id].dispatcher;

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

	resume: async function(message, portal_guilds) {
		return new Promise((resolve) => {
			const current_guild_id = message.member.voice.channel.guild.id;
			const current_dispatcher = portal_guilds[current_guild_id].dispatcher;

			if(current_dispatcher !== null && current_dispatcher !== undefined) {
				if(current_dispatcher.paused) {current_dispatcher.resume();}

				return resolve ({ result: false, value: 'song has been resumed.' });
			}
			else {
				return resolve ({ result: false, value: 'nothing playing write now.' });
			}
		});
	},

	skip: async function(message, portal_guilds) {
		return new Promise((resolve) => {
			const current_guild_id = message.member.voice.channel.guild.id;
			let current_dispatcher = portal_guilds[current_guild_id].dispatcher;
			const current_music_queue = portal_guilds[current_guild_id].music_queue;

			if(current_dispatcher !== null && current_dispatcher !== undefined) {
				if(!current_dispatcher.paused) {current_dispatcher.pause();}

				current_dispatcher = null;

				if(current_music_queue.length > 0) {current_music_queue.shift();}
				else {return resolve ({ result: false, value: 'nothing playing write now.' });}

				return resolve ({ result: false, value: 'song has been skipped.' });
			}
			else {
				return resolve ({ result: false, value: 'nothing playing write now.' });
			}
		});
	}
	,
};
