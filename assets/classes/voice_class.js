module.exports = class {
    constructor(creator_id, regex, no_bots, time_to_live,
        refresh_rate, locale, force_update, last_update) {

        this.creator_id = creator_id;
        this.regex = regex;
        this.no_bots = no_bots;
        this.time_to_live = time_to_live;
        this.refresh_rate = refresh_rate;
        this.locale = locale;
        // creates new portal and moves users
        // every 3rd presence update
        this.force_update = force_update;
        this.last_update = last_update;
    }
}