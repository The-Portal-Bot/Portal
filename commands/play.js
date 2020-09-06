/* eslint-disable no-unused-vars */
const guld_mngr = require('./../functions/guild_manager');
const lclz_mngr = require('./../functions/localization_manager');
const help_mngr = require('./../functions/help_manager');

const yts = require( 'yt-search' );
const ytdl = require('ytdl-core');

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
				console.log('PLAY 1');

				if (most_popular_video) {
					console.log('PLAY 2');

					help_mngr.join_user_voice(client, message, portal_guilds, false)
						.then(attempt =>{
							if (attempt.result === true) {
								console.log('PLAY 4');

								const guild_id = message.member.voice.channel.guild.id;
								console.log('perasa 1');

								if(portal_guilds[guild_id].dispatcher === null || portal_guilds[guild_id].dispatcher === undefined) {
									console.log('NO SONG PLAYING\n');
									portal_guilds[guild_id].dispatcher = attempt.voice_connection
										.play(ytdl(most_popular_video.url, { filter: 'audioonly' }));
								} else {
									console.log('ALREADY PLAYING\n');

									if(portal_guilds[guild_id].dispatcher.paused) {
										console.log('RESUMING...\n');

										portal_guilds[guild_id].dispatcher.resume();
									} else {
										console.log('PAUSING...\n');

										portal_guilds[guild_id].dispatcher.pause();
									}
								}
								// 	// attempt.voice_connection.play(ytdl('https://www.youtube.com/watch?v=ZlAU_w7-Xp8', { quality: 'highestaudio' }));
								// 	// attempt.voice_connection.play(ytdl('https://www.youtube.com/watch?v=ZlAU_w7-Xp8', { filter: format => format.container === 'mp3' }));

								// 	// attempt.voice_connection.play('http://www.sample-videos.com/audio/mp3/wave.mp3');

								// 	// attempt.voice_connection.play('./assets/mp3s/gr/url/url_1.mp3');
								// 	console.log(`playing ${most_popular_video.url}`);
								// return resolve ({ result: false, value: `playing ${most_popular_video.url}` });
							} else {
								console.log(attempt.value);
								return resolve ({ result: false, value: attempt.value });
							}
						})
						.catch(e => { console.log('diz error: ', e); });
				} else {
					console.log('no video found on Youtube.');
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
