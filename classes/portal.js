class portal_channel {
    constructor(portal_id, creator_id, regex, voice_list) {
        this.portal_id = portal_id;
        this.creator_id = creator_id;
        this.regex = regex;
        this.voice_list = voice_list;
    }

    get_portal_id() { return this.portal_id }
    set_portal_id(portal_id) { this.portal_id = portal_id }

    get_creator_id() { return this.creator_id }
    set_creator_id(creator_id) { this.creator_id = creator_id }

    get_regex() { return this.regex }
    set_regex(regex) { this.regex = regex }

    get_voice_list() { return this.voice_list }
    set_voice_list(voice_list) { this.voice_list = voice_list }
};

class voice_channel {
    constructor(voice_id, creator_id, regex) {
        this.voice_id = voice_id;
        this.creator_id = creator_id;
        this.regex = regex;
    }

    get_voice_id() { return this.voice_id }
    set_voice_id(voice_id) { this.voice_id = voice_id }

    get_creator_id() { return this.creator_id }
    set_creator_id(creator_id) { this.creator_id = creator_id }

    get_regex() { return this.regex }
    set_regex(regex) { this.regex = regex }
};