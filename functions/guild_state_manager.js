module.exports =
{
    included_in_portal_guilds: function (guild_id, portal_guilds) {
        console.log('portal_guilds[guild_id]: ' + portal_guilds[guild_id]);
        if (portal_guilds[guild_id] !== undefined)
            return true;
        return false;
    }
    ,

    insert_guild: function (guild_id, portal_guilds) {
        portal_guilds[guild_id] = { "portal_list": {}, "url_list": {}, "role_list": {} };
    }
    ,

    delete_guild: function (guild_id, portal_guilds) {
        delete portal_guilds.guild_id;
    }
};

// console.log('Object.getOwnPropertyNames(state)= ', Object.getOwnPropertyNames(state));
// console.log('Object.getOwnPropertyNames(state.user)= ', Object.getOwnPropertyNames(state.user));