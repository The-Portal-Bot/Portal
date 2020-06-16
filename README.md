**Disclaimer[1]:**
> Discord update their server rate limit to twice per 10 minutes
> [The new rate limit for channel name and topic updates is 2 updates per 10 minutes, per channel.](https://github.com/discordjs/discord.js/issues/4327)

***

# [Portal™](https://github.com/keybraker/portal-discord-bot) <img src="https://github.com/keybraker/portal-discord-bot/blob/master/assets/img/logo.png" alt="alt text" align="right" width="250" height="250">
A feature-rich channel manager for discord.

Features:
* Automatically generates voice channels.
* Automatically updates the title of the channel in accordance to your regex guidlines.
* Assignes and strips roles from users with a single reaction press.
<br><br />
***

## Commands
**Portal™ prefix: ./**

name | description | arguments | eligible for use | cooldown (mins)
--------- | --------- | --------- | --------- | ---------
`portal` | _creates a portal voice channel_ | _!channel\_name \| @category\_name_ | admin, admin-role/s | none
`run` | _runs the given command string and returns its output_ | _!exec\_command_ | everyone | 1
`set` | _sets the value of an attribute_ | _!attribute !value_ | voice owner/ portal owner, admin, admin-role/s | none
`url` | _creates a new or sets the current channel as url-only_ | _@channel\_name \| @category\_name_ | admin, admin-role/s | none
`spotify` | _creates a new or sets the current channel as spotify_ | _@channel\_name \| @category\_name_ | admin, admin-role/s | none
`announcement` | _creates a new or sets the current channel as announcement_ | _@channel\_name \| @category\_name_ | admin, admin-role/s | none
`save` | _saves current state of server_ | _none_ | admin, admin-role/s | 5
`help` | _returns a help-list if specified returns specific description_ | _@specific\_command or @vrbl/@func/@pipe/@attr_ | everyone | none
`ping` | _returns round trip latency_ | _none_ | everyone | 1
`announce` | _prints announcement in announcement channel_ | _@title \| @body_ | | everyone | 5
`corona` | _replies with the daily state of corona virus cases_ | _@country code (gr, de, us, etc)_ | everyone | none
`focus` | _creates a new channel for two and puts them there for a specific time and returns them back to channel o origin_ | _!username @time (default 5minutes)_ | everyone | none
`force` | _clones current channel in order to force-update name_ | _none_ | admin, admin-role/s | 2
`join` | _joins current voice channel and announces events_ | _none_ | everyone | 1
`leave` | _leaves current voice channel_ | _none_ | current portal owner | none
`role` | _replies with a message that gives roles when an emote is added_ | `[{ emote: 'Description', role: '*' + cmmd.super_description + '*', inline: false }]` | admin, admin-role/s | none

* symbol: ! _indicates beginning of mandatory argument **(should not be included)**_
* symbol: @ _indicates beginning of mandatory argument **(should not be included)**_

***

## Regex Interpreter
There are four types of data in **Portal™** bot:
1. variables
2. attributes
3. pipes
3. structures

## Variables
* _prefix:_ __$__
* _(Variables are defacto data sources that can be accessed though calling them they are read-only)_

variable | description
--------- | ---------
`\#` | _number of channel in list_
`\##` | _number of channel in list with \#_
`date` | _full date: dd/mm/yyyy_
`number_day` | _gets the day number_
`name_day` | _gets the day name_
`month` | _gets the month_
`year` | _gets the year_
`time` | _full time: hh/mm/ss_
`hour` | _gets the hour_
`minute` | _gets the minute_
`second` | _gets the second_
`status_list` | _list of current member statuses_
`status_count` | _count of current member statuses_
`status_history` | _history of all the statuses_
`member_list` | _returns the currently played games_
`member_count` | _number of members in channel_
`member_active_count` | _number of members playing_
`member_with_status` | _number of member with given status_
`member_history` | _returns the currently played games_
`creator_portal` | _creator of current voice\'s portal_
`creator_voice` | _creator of current voice_

### Pipes
* _prefix:_ __|__
* _(Pipes are applied to variables or strings in order to change their outcome)_

pipe | type | description
--------- | --------- | ---------
`upperCase` | string | _returns an upperCase of the input_
`lowerCase` | string | _returns an lowerCase of the input_
`capitalize` | string | _returns an capitalize of the input_
`decapitalize` | string | _returns an decapitalize of the input_
`souvlakiCase` | string | _returns an souvlakiCase of the input_
`snakeCase` | string | _returns an snakeCase of the input_
`titleCase` | string | _returns an titleCase of the input_
`camelCase` | string | _returns an camelCase of the input_
`acronym` | string | _returns an acronym of the input_
`word\#` | string | _returns \# words of the input_
`populous_count` | number | _returns the count of most common element in list_
`populous` | list | _returns the name of the most common element in list_
`summary_count` | number | _returns the count of members having a status_

### Attributes
* _prefix:_ __@__
* _(Attributes are values that a channel has from its inception and are subject to change)_

attributes | type | default | description
--------- | --------- | --------- | --------- 
`regex_portal` | string | _G$\#-P$member_count \| $status_list_ | _regex-guidelines for how to display portal's title_
`regex_voice` | string | _G$\#-P$member_count \| $status_list_ | _regex-guidelines for how to display new voice (current portal)_
`regex` | string | _G$\#-P$member_count \| $status_list_ | _sets regex-guidelines for current voice_
`user_limit_portal` | number | 0 | _guidelines for max number of members for new voice channel from current portal_
`user_limit_voice` | number | 0 | _guidelines for max number of members for current voice_
`locale_guild` | string (gr/en/de) | gr | _locale used for **Portal™**'s interactions_
`locale_portal` | string (gr/en/de) | gr | _locale used for **Portal™**'s interactions_
`locale_voice` | string (gr/en/de) | gr | _locale used for **Portal™**'s interactions_
`bitrate_portal` | number | 64000 | _bitrate of current portal channel_
`bitrate_voice` | number | 64000 | _bitrate of current voice channel_
`position` | number | beneath portal | _position of channel_
`last_update` | timestamp | timestamp | _returns the last update timestamp_
***

# About

* v0.0.0: 5/5/20 Alpha ^
* v1.0.0: 18/5/20
* v1.5.0: 16/6/20 Beta ^

Acknowledgments - **Discord.js** with the exeptional library [**Discord.js**](http://owl.phy.queensu.ca/~phil/exiftool/)
<br>
Author - **Ioannis Tsiakkas** - *(Keybraker)* - [**Keybraker**](https://github.com/keybraker)
<br>
Copyright © 2020 [**Portal™**](https://github.com/keybraker/portal-discord-bot)


