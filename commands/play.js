/* eslint-disable no-unused-vars */
const guld_mngr = require('./../functions/guild_manager');
const lclz_mngr = require('./../functions/localization_manager');

const yts = require( 'yt-search' );
const ytdl = require('ytdl-core');

const join_user_voice = async function (client, message, portal_guilds) {
	return new Promise((resolve) => {
		const voiceConnection = client.voice.connections.find(connection => 
			connection.channel.id === message.member.voice.channel.id);
		if (voiceConnection) {
			return ({ result: true, value: 'already in voice channel' });
		}

		let current_voice = message.member.voice.channel;
		// check if he is an a guild
		if (current_voice !== null) {
		// is he in a voice channel that is in the same guild as his text message
			if (current_voice.guild.id === message.guild.id) {
			// is he in a controlled voice channel ?
				if (guld_mngr.included_in_voice_list(current_voice.id, portal_guilds[message.guild.id].portal_list)) {
					current_voice.join()
						.then(con => { }) // lclz_mngr.client_talk(client, portal_guilds, 'join'); })
						.catch(e => { console.log(e); });
				} else {
					return resolve ({ result: false, value: 'I can only connect to my channels.'  }); // localize
				}
			} else {
				return resolve ({ result: false, value: 'your current channel is on another guild.' });  // localize
			}
		} else {
			return resolve ({ result: false, value: 'you are not connected to any channel.'  }); // localize
		}

		return resolve ({ result: true, value: lclz_mngr.client_write(message, portal_guilds, 'join') });
	});
};

module.exports = async (client, message, args, portal_guilds, portal_managed_guilds_path) => {
	return new Promise((resolve) => {
		if(args.length <= 0) {
			return resolve ({ result: false, value: 'cannot search for nothing.' });
		}

		yts(args.join().toString())
			.then(yts_resp => {
				// const most_popular_video = yts_resp.videos.reduce((accumulator, currentValue) => {
				// 	return accumulator.views < currentValue.views ? currentValue : accumulator;
				// });
				const most_popular_video = yts_resp.videos[0];

				if (most_popular_video) {
					join_user_voice(client, message, portal_guilds)
						.then(attempt =>{
							if (attempt.result === true) {
								const voiceConnection = client.voice.connections.find(connection =>
									connection.channel.id === message.member.voice.channel.id);
								if (voiceConnection) {
									console.log('most_popular_video.title :>> ', most_popular_video.title);
									
									setTimeout(function(){ voiceConnection.pause(); }, 3000);

									voiceConnection.play(ytdl(most_popular_video.url, { filter: 'audioonly' }));
									// voiceConnection.play(ytdl('https://www.youtube.com/watch?v=ZlAU_w7-Xp8', { quality: 'highestaudio' }));
									// voiceConnection.play(ytdl('https://www.youtube.com/watch?v=ZlAU_w7-Xp8', { filter: format => format.container === 'mp3' }));

									// voiceConnection.play('http://www.sample-videos.com/audio/mp3/wave.mp3');

									// voiceConnection.play('./assets/mp3s/gr/url/url_1.mp3');
									return resolve ({ result: false, value: `playing ${most_popular_video.url}` });
								}
							} else {
								return resolve ({ result: false, value: attempt.value });
							}
						});
				} else {
					return resolve ({ result: false, value: 'no video found on Youtube.' });
				}
			});


 
		// const youtube_response = yt_search('jsconf', opts, function(err, results) {
		// 	console.log('results :>> ', results);

		// 	if(err) return { result: false, value: err };
		// 	else {
		// 		console.log('results :>> ', results);
		// 		return { result: true, value: results };
		// 	}
		// });

		// .then(yt_response => {
		// 	if (yt_response.result)
		// 		return resolve ({ result: false, value: '*you can run "./help play" for help.*' });
		// 	else
		// 		return resolve ({
		// 			result: true, value: `*youtube result is:*\n${yt_response.value}`
		// 		});
		// });	
	});
};
