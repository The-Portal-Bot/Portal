module.exports =
{
    text_localization:
    {
        gr:
        {
            hello: (users_count, channels_count, guild_count) => {
                return `Το μποτ ξεκίνησε, με ${users_count} χρήστες, μέσα σε ${channels_count} κανάλια σε ${guild_count} συντεχνίες.`
            }
        },
        en:
        {
            hello: (users_count, channels_count, guild_count) => {
                return `Bot has started, with ${users_count} users, in ${channels_count} channels from ${guild_count} guilds.`
            }
        },
        de:
        {
            hello: (users_count, channels_count, guild_count) => {
                return `Bot hat ${users_count} Mitglieder in ${channel_count} Kanälen von ${guild_count} Gilden gestartet.`
            }
        }
    }
    ,

    voice_localization:
    {
        gr:
        {
            user_connected: (users_count, channels_count, guild_count) => {
                return `Το μποτ ξεκίνησε, με ${users_count} χρήστες, μέσα σε ${channels_count} κανάλια σε ${guild_count} συντεχνίες.`
            },
            user_disconnected: (user_name) => {
                return `'Ο χρήστης  ${user_name}, συνδέθηκε στο κανάλι.`
            }
        },
        en:
        {
            user_connected: (users_count, channels_count, guild_count) => {
                return `Bot has started, with ${users_count} users, in ${channels_count} channels from ${guild_count} guilds.`
            },
            user_disconnected: (user_name) => {
                return `Mitglied ${user_name}, hat sich zum Kanal verbunden.`
            }
        },
        de:
        {
            user_connected: (users_count, channels_count, guild_count) => {
                return `Bot hat ${users_count} Mitglieder in ${channel_count} Kanälen von ${guild_count} Gilden gestartet.`
            },
            user_disconnected: (user_name) => {
                return `User ${user_name}, connected to the channel`
            }
        }
    }
    
}

