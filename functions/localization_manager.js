client_talk = function (client, mp3) {
    if (voiceConnection = client.voice.connections.find(connection => connection.channel.id)) {
        voiceConnection.play(mp3);
    }
}

module.exports =
{
    portal:
    {
        gr:
        {
            hello: {
                text: (users_count, channels_count, guild_count) => {
                    return `Γειά σας, το Πόρταλ είναι εδώ.`
                },
                voice: (client) => {
                    client_play('./../assets/mp3s/gr/cheers.mp3');
                }
            },
            goodbye: {
                text: (users_count, channels_count, guild_count) => {
                    return `Αποχαιρετώ, καλή συνέχεια σε όλους.`
                },
                voice: (client) => {
                    client_play('./../assets/mp3s/gr/cheers.mp3');
                }
            },
            announcement: {
                text: (users_count, channels_count, guild_count) => {
                    return `Υπάρχει μια νέα ανακοίνωση.`
                },
                voice: (client) => {
                    client_play('./../assets/mp3s/gr/cheers.mp3');
                }
            },
            error: {
                text: (users_count, channels_count, guild_count) => {
                    return `Κάτι δεν πήγε σωστά.`
                },
                voice: (client) => {
                    client_play('./../assets/mp3s/gr/cheers.mp3');
                }
            },
            user_connected: {
                text: (user, channels_count, guild_count) => {
                    return `Ο χρήστης ${user} συνδέθηκε στο κανάλι.`
                },
                voice: (client) => {
                    client_play('./../assets/mp3s/gr/cheers.mp3');
                }
            },
            user_disconnected: {
                text: (users_count, channels_count, guild_count) => {
                    return `Ο χρήστης ${user} αποχώρησε από το κανάλι.`
                },
                voice: (client) => {
                    client_play('./../assets/mp3s/gr/cheers.mp3');
                }
            },
            
        },
        en:
        {
            hello: {
                text: (users_count, channels_count, guild_count) => {
                    return `Cheers love, Portal's here.`
                },
                voice: (client) => {
                    client_play('./../assets/mp3s/en/cheers.mp3');
                }
            },
            goodbye: {
                text: (users_count, channels_count, guild_count) => {
                    return `Goodbye everyone.`
                },
                voice: (client) => {
                    client_play('./../assets/mp3s/en/cheers.mp3');
                }
            },
            user_connected: {
                text: (users_count, channels_count, guild_count) => {
                    return `User connected to the channel.`
                },
                voice: (client) => {
                    client_play('./../assets/mp3s/gr/cheers.mp3');
                }
            },
            user_disconnected: {
                text: (users_count, channels_count, guild_count) => {
                    return `User disconnected from the channel.`
                },
                voice: (client) => {
                    client_play('./../assets/mp3s/gr/cheers.mp3');
                }
            },
            
        },
        de:
        {
            hello: {
                text: (users_count, channels_count, guild_count) => {
                    return `Hallo, Portal ist da.`
                },
                voice: (client) => {
                    client_play('./../assets/mp3s/de/cheers.mp3');
                }
            },
            goodbye: {
                text: (users_count, channels_count, guild_count) => {
                    return `Auf Wiedersehen alle.`
                },
                voice: (client) => {
                    client_play('./../assets/mp3s/de/cheers.mp3');
                }
            },
            user_connected: {
                text: (users_count, channels_count, guild_count) => {
                    return `Mitglied hat sich zum Kanal verbunden.`
                },
                voice: (client) => {
                    client_play('./../assets/mp3s/gr/cheers.mp3');
                }
            },
            user_disconnected: {
                text: (users_count, channels_count, guild_count) => {
                    return `Mitglied hat sich vom Kanal unverbunden.`
                },
                voice: (client) => {
                    client_play('./../assets/mp3s/gr/cheers.mp3');
                }
            },
            
        }
    }
    ,

    console:
    {
        gr:
        {
            ready: (users_count, channels_count, guild_count) => {
                return `Το μποτ ξεκίνησε, με ${users_count} χρήστες, μέσα σε ${channels_count} κανάλια σε ${guild_count} συντεχνίες.`
            }
        },
        en:
        {
            ready: (users_count, channels_count, guild_count) => {
                return `Bot has started, with ${users_count} users, in ${channels_count} channels from ${guild_count} guilds.`
            }
        },
        de:
        {
            ready: (users_count, channels_count, guild_count) => {
                return `Bot hat ${users_count} Mitglieder in ${channel_count} Kanälen von ${guild_count} Gilden gestartet.`
            }
        }
    }

}

