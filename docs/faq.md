[< back to README](https://github.com/keybraker/portal-discord-bot#regex-interpreter)

Q. **What does Portal do ?**
>    *Portal is a fully functional multipurpose discord bot that helps you manage and organise your server*
>     
>     It provides:
>         1. Voice channels on demand (with auto-name update)
>         2. Assigns and strips roles from users with a single reaction
>         3. Creates temporary "focus" channels for private conversations
>         4. Music player that is clean and clutter free
>         5. Portal will keep you up to speed, with voice announcements
>         6. Get the latest on the corona virus and current weather
>         7. Spotify / Announcement / URL-only channels
>
Q. **How do I create portal controlled channels ?**
>    *All portal channels are spawned in the same manner*
> 
>     Create a new portal (voice) that spawns voice channels
>         2. `./portal my_portal` 
>             *will create a new portal channel  named 'my_portal'*
>         3. `./portal my_portal | my_category`
>             *will create a new portal channel  named 'my_portal' and category 'my_category' and make 'my_portal' as child*
> 
>     Create a new music/announcement/spotify (text)
>         1. `./music`
>             *will make current channel music/announcement/spotify*
>         2. `./music my_channel`
>             *will create a new requested type channel  named 'my_channel' and category 'my_category' and make 'my_portal' as child*
>         3. `./music my_channel| my_category`
>             *will create a new requested type channel  named 'my_channel' and category 'my_category' and make 'my_channel' as child*
>
Q. **How do I play music from music channel ?**
>    *Music channel is a text channel where you can Portal's music player resides*
>    
>     Guide
>         1. Find and enter music channel, in case you cant find it
>             1.1  run command `./state` to locate it
>             1.2 in case it does not exist create one with `./music my_music`
>         2. Type in plain text the name of the song you want to listen too
>              *make sure you are inside a Portal controlled voice channel*
>
> Q. **How do I interact with music player ?**
>    *In music channel resides the music player, by reacting with given reactions you can play/pause/skip/stop/clear list and disconnect player*
>    
> :arrow_forward: *continues current song*
> :pause_button: *pauses current song*
> :stop_button: *stops current song*
> :track_next: *skips current song*
> :broom: *clears queued song list*
> :x: *disconnects Portal*
>         
> .