module.exports =
{
    portal_channel: class {
        constructor(id, creator_id, regex_portal, regex_voice, voice_list,
            no_bots, member_limit, time_to_live, refresh_rate, position, locale)
        {
            this.id = id;
            this.creator_id = creator_id;

            this.regex_portal = regex_portal;
            this.regex_voice = regex_voice;

            this.no_bots = no_bots;
            this.member_limit = member_limit;
            this.time_to_live = time_to_live;
            this.refresh_rate = refresh_rate;
            this.position = position;
            this.locale = locale;
            this.voice_list = voice_list;
        }
    },

    voice_channel: class {
        constructor(id, creator_id, regex, no_bots, member_limit, 
            time_to_live, refresh_rate, position, locale) {
            this.id = id;
            this.creator_id = creator_id;

            this.regex = regex;

            this.no_bots = no_bots;
            this.member_limit = member_limit;
            this.time_to_live = time_to_live;
            this.refresh_rate = refresh_rate;
            this.position = position;
            this.locale = locale;
        }
    }
}