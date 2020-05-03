module.exports = 
{
    delete_voice_channel: function (channel_to_delete, voice_list_id)
    {
        const index = voice_list_id.indexOf(channel_to_delete.id);
        if (index > -1) { voice_list_id.splice(index, 1); }

        channel_to_delete.delete()
        .then(g => console.log(`Deleted the guild ${g}`))
        .catch(console.error);	
    }
    ,
    create_portal_channel: function (server, portal_name, category_name, portal_list_id)
    {
        if(category_name)
        {
            // creating category
            server.createChannel(category_name, {type: "category"})

            // creating voice channel
            server.createChannel(portal_name, {type: "voice"}, { bitrate: 8 })
            .then (channel => {
                portal_list_id.push(channel.id);
                let category = server.channels.find(
                    c => c.name == category_name && c.type == "category"
                );
                if (!category) throw new Error("Category channel does not exist");
                channel.setParent(category);
            }).catch(console.error);
        }
        else
        {
            // creating voice channel
            server.createChannel(portal_name, {type: "voice"}, { bitrate: 8 })
            .then (channel => {
                portal_list_id.push(channel.id);
            })
        }
    }
    ,
    create_voice_channel: function (state, voice_list_id)
    {
        state.voiceChannel.guild.createChannel("loading...", {type: "voice"}, { bitrate: 64 })
        .then(channel => {
            voice_list_id.push(channel.id)
            if (state.voiceChannel.parentID === null){ // doesn't have category
                state.setVoiceChannel(channel);
            } else { // has category
                channel.setParent(state.voiceChannel.parentID);
                state.setVoiceChannel(channel);
            }

        }).catch(console.error);
    }
    ,
    generate_channel_names: function (guild, voice_list_id)
    {
        if(guild.available){
            let current_channels = guild.channels
            for(i = 0; i < voice_list_id.length; i++) {
                let channel_to_update = current_channels.find(channel => channel.id === voice_list_id[i])
                if(channel_to_update !== null){
                    let channel_name = "";
                    channel_to_update.members.forEach( (value) => {
                        if(value.presence.game !== null){
                            channel_name += value.presence.game;
                        }
                    })
                    channel_to_update.setName(channel_name);
                    return
                }
            }
        }
    }
};