const Discord = require('discord.js');
const file_system = require('file-system');

const lclz_mngr = require('./localization_manager');
const guld_mngr = require('./guild_manager');

module.exports = {

	create_rich_embed: function (title, description, colour, field_array, thumbnail, member, from_bot, url) {
		const portal_icon_url = 'https://raw.githubusercontent.com/' +
			'keybraker/portal-discord-bot/master/assets/img/logo.png?token=AFS7NCQYV4EIHFZAOFV5CYK64X4YA';
		const keybraker_url = 'https://github.com/keybraker';

		let rich_message = new Discord.MessageEmbed()
			.setURL(url)
			.setTitle(title)
			.setColor(colour)
			// .setAuthor('Portal', portal_icon_url, keybraker_url)
			.setDescription(description)
			.setTimestamp();

		if (from_bot) {
			rich_message.setFooter('Portal bot by Keybraker', portal_icon_url, keybraker_url);
		}

		if (member) {
			rich_message.setAuthor(member.displayName, member.user.avatarURL());
		}

		if (thumbnail) {
			rich_message.setThumbnail(thumbnail);
		}

		if (field_array) {
			field_array.forEach(row => {
				if (row.emote === '' && row.role === '') {
					rich_message.addField('\u200b', '\u200b');
				} else {
					rich_message.addField(
						row.emote === '' ? '\u200b' : '`' + row.emote + '`',
						row.role === '' ? '\u200b' : row.role,
						row.inline);
				}
			});
		} else {
			rich_message.addField('\u200b', '\u200b');
		}

		return rich_message;
	}
	,

	channel_clean_up: function (channel, current_guild) {
		if (current_guild.channels.cache.some((guild_channel) => {
			if (guild_channel.id === channel.id && guild_channel.members.size === 0) {
				guld_mngr.delete_channel(guild_channel);
				return true;
			}
		}));
	}
	,

	portal_init: function (current_guild, portal_managed_guilds_path, portal_guilds) {
		const keys = Object.keys(portal_guilds);
		const servers = keys.map(key => ({ key: key, value: portal_guilds[key] }));

		for (let l = 0; l < servers.length; l++) {
			for (let i = 0; i < servers[l].value.portal_list.length; i++) {
				for (let j = 0; j < servers[l].value.portal_list[i].voice_list.length; j++) {
					this.channel_clean_up(servers[l].value.portal_list[i].voice_list[j], current_guild);
				}
			}
		}
		this.update_portal_managed_guilds(true, portal_managed_guilds_path, portal_guilds);
	}
	,

	update_portal_managed_guilds: async function (force, portal_managed_guilds_path, portal_guilds) {
		return new Promise((resolve) => { //, reject) => {
			setTimeout(() => {
				if (force) file_system.writeFileSync(
					portal_managed_guilds_path, JSON.stringify(portal_guilds), 'utf8'
				);
				else file_system.writeFile(
					portal_managed_guilds_path, JSON.stringify(portal_guilds), 'utf8'
				);
			}, 1000);
			return resolve ({ result: true, value: '*updated portal guild json.*' });
		});
	}
	,

	is_authorized: function (auth_list, member) {
		return !member.hasPermission('ADMINISTRATOR')
			? member.roles.cache.some(role => auth_list.some(auth => auth === role.id))
			: true;
	}
	,

	// channel should be removed !
	message_reply: function (status, channel, message, user, str, portal_guilds, client) {
		if (!message.channel.deleted) {
			message.channel
				.send(`${user}, ${str}`)
				.then(msg => { msg.delete({ timeout: 5000 }); });
		}
		if (!message.deleted) {
			if (status === true) {
				message
					.react('✔️');
			} else if (status === false) {
				lclz_mngr.client_talk(client, portal_guilds, 'fail');
				message
					.react('❌');
			}
		}
	}
	,

	is_url: function (potential_url) {
		var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
			'((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
			'((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
			'(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
			'(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
			'(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator

		return pattern.test(potential_url);
	}
	,

	pad: function (num) {
		if (num.toString().length >= 2) {
			return num;
		} else {
			return '0' + num;
		}
	}
	,

	time_elapsed: function (timestamp, timeout) {
		const time_elapsed = Date.now() - timestamp;
		const timeout_time = timeout * 60 * 1000;

		const timeout_min = Math.round((timeout_time / 1000 / 60)) > 0 ?
			Math.round((timeout_time / 1000 / 60)) : 0;
		const timeout_sec = Math.round((timeout_time / 1000) % 60);

		const remaining_hrs = Math.round(
			(time_elapsed / 1000 / 60 / 60)) > 0
			? Math.round((time_elapsed / 1000 / 60 / 60))
			: 0;
		const remaining_min = Math.round(
			(time_elapsed / 1000 / 60) - 1) > 0
			? Math.round((time_elapsed / 1000 / 60) - 1)
			: 0;
		const remaining_sec = Math.round(
			(time_elapsed / 1000) % 60) > 0
			? Math.round((time_elapsed / 1000) % 60)
			: 0;

		return { timeout_min, timeout_sec, remaining_hrs, remaining_min, remaining_sec };
	}
	,

	time_remaining: function (timestamp, timeout) {
		const time_elapsed = Date.now() - timestamp;
		const timeout_time = timeout * 60 * 1000;
		const time_remaining = timeout_time - time_elapsed;

		const timeout_min = Math.round((timeout_time / 1000 / 60)) > 0
			? Math.round((timeout_time / 1000 / 60))
			: 0;
		const timeout_sec = Math.round((timeout_time / 1000) % 60)
			? Math.round((timeout_time / 1000) % 60)
			: 0;
		const remaining_min = Math.round((time_remaining / 1000 / 60) - 1) > 0
			? Math.round((time_remaining / 1000 / 60) - 1)
			: 0;

		const remaining_sec = Math.round((time_remaining / 1000) % 60);

		return { timeout_min, timeout_sec, remaining_min, remaining_sec };
	}


};