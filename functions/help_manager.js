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
            .setTimestamp()

        if (from_bot) {
            rich_message.setFooter(`Portal bot by Keybraker`, portal_icon_url, keybraker_url);
        }
        if (member) {
            rich_message.setAuthor(member.displayName, member.user.avatarURL())
        }
        if (thumbnail) {
            rich_message.setThumbnail(thumbnail)
        }
        field_array.forEach(row => {
            if (row.emote === `` && row.role === ``) {
                rich_message.addField(`\u200b`, `\u200b`);
            } else {
                rich_message.addField(
                    row.emote === `` ? `\u200b` : '`' + row.emote + '`',
                    row.role === `` ? `\u200b` : row.role,
                    row.inline);
            }
        });

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

    update_portal_managed_guilds: function (force, portal_managed_guilds_path, portal_guilds) {
        console.log(lclz_mngr.console.gr.updating_guild());
        console.log('portal_managed_guilds_path: ', portal_managed_guilds_path);

        setTimeout(function () {
            if (force) file_system.writeFileSync(
               portal_managed_guilds_path, JSON.stringify(portal_guilds), 'utf8'
            );
            else file_system.writeFile(
                portal_managed_guilds_path, JSON.stringify(portal_guilds), 'utf8'
            );
        }, 1000);
    }
    ,

    message_reply: function (status, channel, message, user, str, portal_guilds, client) {
        message.channel.send(str, user).then(msg => { msg.delete({ timeout: 5000 }) });
        if (status === true) {
            message.react('✔️');
        } else if (status === false) {
            let locale = portal_guilds[message.guild.id].locale;
            lclz_mngr.portal[locale].error.voice(client);
            message.react('❌');
        }
    }
    ,

    is_url: function (message) {
        var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
            '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
            '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
            '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
            '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
            '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator

        return pattern.test(message.content);
    }

}