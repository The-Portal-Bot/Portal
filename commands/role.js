const Discord = require("discord.js");

module.exports = async (client, message, args, portal_guilds, portal_managed_guilds_path) => {
    let roles = [];
    message.guild.roles.cache.forEach(role => { roles.push({ role }); });

    if (args.length > 0) {
        try {
            role_map = JSON.parse(args.join(' '));
        } catch (error) {
            message.channel.send('Roles must be in JSON format for more info ./help role_giver');
            return;
        }
        role_emb = [];
        role_emb_prnt = [];

        role_emb_prnt.push(
            { emote: 'Get Role', role: 'react with one of the following emotes to get this role', inline: false }
        );
        for (let i = 0; i < role_map.length; i++) {
            role_emb_prnt.push(
                { emote: role_map[i].emote_give, role: role_map[i].role, inline: true }
            );
            role_emb.push(
                { emote: role_map[i].emote_give, role: role_map[i].role, inline: true }
            );
        }
        role_emb_prnt.push(
            { emote: '', role: '', inline: false },
            { emote: 'Strip Role', role: 'react with one of the following emotes to strip this role', inline: false }
        );
        for (let i = 0; i < role_map.length; i++) {
            role_emb_prnt.push(
                { emote: role_map[i].emote_strip, role: role_map[i].role, inline: true }
            );
            role_emb.push(
                { emote: role_map[i].emote_strip, role: role_map[i].role, inline: true }
            );
        }
        guld_mngr.create_role_message(message, portal_guilds[message.guild.id]['role_list'],
            'Portal Role Assigner', '', '#FF7F00', role_emb_prnt);
        message.react('✔️');
    } else {
        return {
            response: false, value: '**You can run "./help role" for help.**'
        };
    }

    return {
        response: true, value: '**Role giver message has been created.**'
    };
}