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

    delete_guild: function (channel_to_delete, portal_list) {
    }
    ,

    insert_guild: function (guild_id, guild_list, path) {
        guild_list[guild_id] = [{"portal_list": [], "url_list": []}];
    }

};

// console.log('Object.getOwnPropertyNames(state)= ', Object.getOwnPropertyNames(state));
// console.log('Object.getOwnPropertyNames(state.user)= ', Object.getOwnPropertyNames(state.user));