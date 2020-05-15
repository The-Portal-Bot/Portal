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

        get_id() { return this.id }
        set_id(id) { this.id = id }

        get_creator_id() { return this.creator_id }
        set_creator_id(creator_id) { this.creator_id = creator_id }

        get_regex_portal() { return this.regex_portal }
        set_regex_portal(regex_portal) { this.regex_portal = regex_portal }

        get_regex_voice() { return this.regex_voice }
        set_regex_voice(regex_voice) { this.regex_voice = regex_voice }

        get_voice_list() { return this.voice_list }
        set_voice_list(voice_list) { this.voice_list = voice_list }

        get_no_bots() { return this.no_bots; }
        set_no_bots(n_no_bots) { this.no_bots = n_no_bots; }

        get_mmbr_cap() { return this.mmbr_cap; }
        set_mmbr_cap(n_mmbr_cap) { this.mmbr_cap = n_mmbr_cap; }

        get_time_to_live() { return this.time_to_live; }
        set_time_to_live(n_time_to_live) { this.time_to_live = n_time_to_live; }

        get_refresh_rate() { return this.refresh_rate; }
        set_refresh_rate(n_refresh_rate) { this.refresh_rate = n_refresh_rate; }

        get_pos() { return this.pos; }
        set_pos(n_pos) { this.pos = n_pos; }

        get_lang() { return this.lang; }
        set_lang(n_lang) { this.lang = n_lang; }

        get_count() { return this.count; }
        set_count(n_count) { this.count = n_count; }
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

        get_id() { return this.id }
        set_id(id) { this.id = id }

        get_creator_id() { return this.creator_id }
        set_creator_id(creator_id) { this.creator_id = creator_id }

        get_no_bots() { return this.no_bots; }
        set_no_bots(n_no_bots) { this.no_bots = n_no_bots; }

        get_mmbr_cap() { return this.mmbr_cap; }
        set_mmbr_cap(n_mmbr_cap) { this.mmbr_cap = n_mmbr_cap; }

        get_time_to_live() { return this.time_to_live; }
        set_time_to_live(n_time_to_live) { this.time_to_live = n_time_to_live; }

        get_refresh_rate() { return this.refresh_rate; }
        set_refresh_rate(n_refresh_rate) { this.refresh_rate = n_refresh_rate; }

        get_pos() { return this.pos; }
        set_pos(n_pos) { this.pos = n_pos; }

        get_lang() { return this.lang; }
        set_lang(n_lang) { this.lang = n_lang; }

        get_count() { return this.count; }
        set_count(n_count) { this.count = n_count; }
    }
}