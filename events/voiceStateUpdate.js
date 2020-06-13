const guld_mngr = require('./../functions/guild_manager');
const lclz_mngr = require('./../functions/localization_manager');

module.exports = async (args) => {
    let newChannel = args.newState.channel; // join channel
    let oldChannel = args.oldState.channel; // left channel

    if (voiceConnection = args.client.voice.connections.find(connection =>
        newChannel !== null && connection.channel.id === newChannel.id)) {

        let locale = args.portal_guilds[voiceConnection.channel.guild.id].locale;
        lclz_mngr.portal[locale].user_connected.voice(args.client);
        
    } else if (voiceConnection = args.client.voice.connections.find(connection =>
        oldChannel !== null && connection.channel.id === oldChannel.id)) {

        let locale = args.portal_guilds[voiceConnection.channel.guild.id].locale;
        lclz_mngr.portal[locale].user_disconnected.voice(args.client);
    }

    let report_message = `from: ${oldChannel} to ${newChannel})\n`;

    if (oldChannel === null && newChannel !== null) { // Joined from null
        report_message += `null->existing\n`;

        if (guld_mngr.included_in_portal_list(newChannel.id, args.portal_guilds[args.newState.guild.id].portal_list)) { // user joined portal channel
            guld_mngr.create_voice_channel(args.newState, args.portal_guilds[args.newState.guild.id].portal_list[newChannel.id], args.newState.id);
            guld_mngr.generate_channel_name(newChannel, args.portal_guilds[args.newState.guild.id].portal_list, args.portal_guilds[args.newState.guild.id]);
        } else if (guld_mngr.included_in_voice_list(newChannel.id, args.portal_guilds[args.newState.guild.id].portal_list)) { // user joined voice channel
            guld_mngr.generate_channel_name(newChannel, args.portal_guilds[args.newState.guild.id].portal_list, args.portal_guilds[args.newState.guild.id]);
        }
    } else if (newChannel === null && oldChannel !== null) { // Left to null
        report_message += `existing->null\n`;

        if (guld_mngr.included_in_portal_list(oldChannel.id, args.portal_guilds[args.newState.guild.id].portal_list)) { // user left portal channel this part is handled before
        } else if (guld_mngr.included_in_voice_list(oldChannel.id, args.portal_guilds[args.newState.guild.id].portal_list)) { // user left voice channel
            if (oldChannel.members.size === 0) {
                guld_mngr.delete_channel(oldChannel, args.portal_guilds[args.newState.guild.id].portal_list);
            }
            if (voiceConnection = args.client.voice.connections.find(connection => connection.channel.id === oldChannel.id)){
                if (oldChannel.members.size === 1){
                    voiceConnection.disconnect();
                    guld_mngr.delete_channel(oldChannel, args.portal_guilds[args.newState.guild.id].portal_list);
                }
            }
        }
    } else if (newChannel !== null && oldChannel !== null) { // Moved from channel to channel
        report_message += `existing->existing\n`;

        if (guld_mngr.included_in_portal_list(oldChannel.id, args.portal_guilds[args.newState.guild.id].portal_list)) {
            report_message += `->source: portal_list\n`;

            if (guld_mngr.included_in_portal_list(newChannel.id, args.portal_guilds[args.newState.guild.id].portal_list)) { // this should not happen
                report_message += `->dest: portal_list\n`;
                report_message += `this should not happen error: portal_channel->portal_channel\n`;
            } else if (guld_mngr.included_in_voice_list(newChannel.id, args.portal_guilds[args.newState.guild.id].portal_list)) { // has been checked before
                report_message += `->dest: voice_list\n`;
                report_message += `has been checked before\n`;
                guld_mngr.generate_channel_name(newChannel, args.portal_guilds[args.newState.guild.id].portal_list, args.portal_guilds[args.newState.guild.id]);
            } else { // Left portal channel and joined another unknown
                report_message += `->dest: unknown\n`;
                guld_mngr.generate_channel_name(newChannel, args.portal_guilds[args.newState.guild.id].portal_list, args.portal_guilds[args.newState.guild.id]);
            }
        } else if (guld_mngr.included_in_voice_list(oldChannel.id, args.portal_guilds[args.newState.guild.id].portal_list)) {
            report_message += `->source: voice_list\n`;

            if (guld_mngr.included_in_portal_list(newChannel.id, args.portal_guilds[args.newState.guild.id].portal_list)) { // left created channel and joins portal
                report_message += `->dest: portal_list\n`;

                if (oldChannel.members.size === 0) {
                    guld_mngr.delete_channel(oldChannel, args.portal_guilds[args.newState.guild.id].portal_list);
                }
                if (voiceConnection = args.client.voice.connections.find(connection => connection.channel.id === oldChannel.id)) {
                    if (oldChannel.members.size === 1) {
                        voiceConnection.disconnect();
                        guld_mngr.delete_channel(oldChannel, args.portal_guilds[args.newState.guild.id].portal_list);
                    }
                }

                guld_mngr.create_voice_channel(args.newState, args.portal_guilds[args.newState.guild.id].portal_list[newChannel.id], args.newState.id);
                guld_mngr.generate_channel_name(newChannel, args.portal_guilds[args.newState.guild.id].portal_list, args.portal_guilds[args.newState.guild.id]);
            } else if (guld_mngr.included_in_voice_list(newChannel.id, args.portal_guilds[args.newState.guild.id].portal_list)) { // Left created channel and joins another created
                report_message += `->dest: voice_list\n`;

                if (oldChannel.members.size === 0) {
                    guld_mngr.delete_channel(oldChannel, args.portal_guilds[args.newState.guild.id].portal_list);
                }
                if (voiceConnection = args.client.voice.connections.find(connection => connection.channel.id === oldChannel.id)) {
                    if (oldChannel.members.size === 1) {
                        voiceConnection.disconnect();
                        guld_mngr.delete_channel(oldChannel, args.portal_guilds[args.newState.guild.id].portal_list);
                    }
                }

                guld_mngr.generate_channel_name(newChannel, args.portal_guilds[args.newState.guild.id].portal_list, args.portal_guilds[args.newState.guild.id]);
            } else { // Left created channel and joins another unknown
                report_message += `->dest: unknown\n`;

                if (oldChannel.members.size === 0) {
                    guld_mngr.delete_channel(oldChannel, args.portal_guilds[args.newState.guild.id].portal_list);
                }
                if (voiceConnection = args.client.voice.connections.find(connection => connection.channel.id === oldChannel.id)) {
                    if (oldChannel.members.size === 1) {
                        voiceConnection.disconnect();
                        guld_mngr.delete_channel(oldChannel, args.portal_guilds[args.newState.guild.id].portal_list);
                    }
                }

                guld_mngr.generate_channel_name(newChannel, args.portal_guilds[args.newState.guild.id].portal_list, args.portal_guilds[args.newState.guild.id]);
            }
        } else {
            report_message += `->source: unknown voice\n`;

            if (guld_mngr.included_in_portal_list(newChannel.id, args.portal_guilds[args.newState.guild.id].portal_list)) { // Joined portal channel
                report_message += `->dest: portal_list\n`;

                guld_mngr.create_voice_channel(args.newState, args.portal_guilds[args.newState.guild.id].portal_list[newChannel.id], args.newState.id);
                guld_mngr.generate_channel_name(newChannel, args.portal_guilds[args.newState.guild.id].portal_list, args.portal_guilds[args.newState.guild.id]);
            }
            else if (guld_mngr.included_in_voice_list(newChannel.id, args.portal_guilds[args.newState.guild.id].portal_list)) { // left created channel and joins another created
                report_message += `->dest: voice_list\n`;
                guld_mngr.generate_channel_name(newChannel, args.portal_guilds[args.newState.guild.id].portal_list, args.portal_guilds[args.newState.guild.id]);
            }
        }
    } else if (newChannel === null && oldChannel === null) {
        report_message += `null->null\n`;
    } else {
        report_message += `don't know how we got here\n`;
    }
    update_portal_managed_guilds(true);
    report_message += `\n`;

    return {
        result: true, value: report_message
    };
}