module.exports =
{
    portal_channel: class {
        constructor(n_id, n_creator_id, n_regex_portal, n_regex_voice, n_voice_list,
            n_no_bots, n_mmbr_cap, n_time_to_live, n_refresh_rate, n_pos, n_lang, n_count)
        {
            this.id = n_id;
            this.creator_id = n_creator_id;
            this.regex_portal = n_regex_portal;
            this.regex_voice = n_regex_voice;
            this.voice_list = n_voice_list;
            this.no_bots = n_no_bots;
            this.mmbr_cap = n_mmbr_cap;
            this.time_to_live = n_time_to_live;
            this.refresh_rate = n_refresh_rate;
            this.pos = n_pos;
            this.lang = n_lang;
            this.count = n_count;
        }
    },

    voice_channel: class {
        constructor(n_id, n_creator_id, 
            n_no_bots, n_mmbr_cap, n_time_to_live,
            n_refresh_rate, n_pos, n_lang, n_count) {
            this.id = n_id;
            this.creator_id = n_creator_id;
            this.no_bots = n_no_bots;
            this.mmbr_cap = n_mmbr_cap;
            this.time_to_live = n_time_to_live;
            this.refresh_rate = n_refresh_rate;
            this.pos = n_pos;
            this.lang = n_lang;
            this.count = n_count;
        }
    }
}