const class_portal = require('./../classes/portal.js');
const class_guild = require('./../classes/guild.js');

module.exports =
{
    included_in_guild_list: function (guild_id, guild_list) {
        if (guild_list[guild_id])
            return true;
        return false;
    }
    ,

    insert_guild: function (guild_id, guild_list) {
        guild_list[guild_id] = {"portal_list": [{}], "url_list": [{}]};
    }
    ,

    delete_guild: function (guild_id, guild_list) {
        delete guild_list.guild_id;
    }

};

// console.log('Object.getOwnPropertyNames(state)= ', Object.getOwnPropertyNames(state));
// console.log('Object.getOwnPropertyNames(state.user)= ', Object.getOwnPropertyNames(state.user));