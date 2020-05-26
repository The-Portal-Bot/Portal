# [Portal](https://github.com/keybraker/portal-discord-bot) <img src="https://github.com/keybraker/portal-discord-bot/blob/master/assets/img/logo.png" alt="alt text" align="right" width="250" height="250">
A feature-rich channel manager for discord.

Features:
* Automatically generates voice channels.
* Automatically updates the title of the channel in accordance to your regex guidlines.
* Assignes and strips roles from users with a single reaction press.
<br><br />
***

## Commands
**Portal prefix: ./**

name | description | arguments
--------- | --------- | ---------
portal | _creates a voice channel and a category for it_ | _!channel\_name @category\_name_
run | _returns the proccessed of comand entered_ | _!exec\_command_
set | _sets the value of attribute_ | _!attribute !value_
url | _creates a url only channel and a category for it_ | _!channel\_name @category\_name_
save | _saves current state of server_ | _none_
help | _returns a help-list of all commands and regex manipulation_ | _@specific\_command or @vrbl/@func/@pipe/@attr_
ping | _returns round trip latency_ | _none_
  
* symbol: ! _indicates beginning of mandatory argument **(should not be included)**_
* symbol: @ _indicates beginning of mandatory argument **(should not be included)**_

***

## Regex Interpreter
There are four types of data in portal bot:
1. variables
2. attributes
3. pipes

## Variables
* _prefix:_ __$__
* _(Variables are defacto data sources that can be accessed though calling them)_

variable | description
--------- | ---------
\# | _number of channel in list_
\## | _number of channel in list with \#_
|
date | _full date: dd/mm/yyyy_
number_day | _gets the day number_
name_day | _gets the day name_
month | _gets the month_
year | _gets the year_
time | _full time: hh/mm/ss_
hour | _gets the hour_
minute | _gets the minute_
second | _gets the second_
| 
status_list | _list of current member statuses_
status_count | _count of current member statuses_
status_history | _history of all the statuses_
|
member_list | _returns the currently played games_
member_count | _number of members in channel_
member_playing | _number of members playing_
member_history | _returns the currently played games_
|
creator_portal | _creator of current voice\'s portal_
creator_voice | _creator of current voice_

### Pipes
* _prefix:_ __|__
* _(Pipes are applied to variables in order to change their outcome)_

pipe | type | description
--------- | --------- | ---------
upperCase | string | _returns an upperCase of the input_
lowerCase | string | _returns an lowerCase of the input_
capitalize | string | _returns an capitalize of the input_
decapitalize | string | _returns an decapitalize of the input_
kebabCase | string | _returns an kebabCase of the input_
snakeCase | string | _returns an snakeCase of the input_
titleCase | string | _returns an titleCase of the input_
camelCase | string | _returns an camelCase of the input_
acronym | string | _returns an acronym of the input_
word\# | string | _returns \# words of the input_
|
populous_count | list | _returns the count of most common element in list_
populous | list | _returns the name of the most common element in list_
summary_count | list | _returns the count of members having a status_
|
limit_portal | _maximum number of members guideline for portal_
limit_voice | _maximum number of members allowed_
|
position | _the position of the channel_

### Attributes
* _prefix:_ __@__
* _(Attributes are values that a channel has from its inception and are subject to change)_

attributes | type | default | description
--------- | --------- | --------- | --------- 
no_bots | boolean | false | _no bots allowed_
creator_id | number | creator_id | _no bots allowed_
regex_portal | string | _G$\#-P$member_count \| $status_list_ | _sets regex-guidelines for how to display portal's title_
regex_voice | string | _G$\#-P$member_count \| $status_list_ | _sets regex-guidelines for how to display voice (current portal)_
member_limit | number | 0 | _maximum number of members allowed_
time_to_live | number | 0 | _time to live_
refresh_rate | number | 0 | _how often titles are being refreshed_
locale | string (gr/en) | gr | _language used in statuses_
position | number | beneath portal | _position of channel_
***

# About

* v0.0.0: 5/5/20 Alpha
* v1.0.0: 18/5/20 Version 1

Acknowledgments - **Discord.js** with the exeptional library [**Discord.js**](http://owl.phy.queensu.ca/~phil/exiftool/)
<br>
Author - **Ioannis Tsiakkas** - *(Keybraker)* - [Keybraker](https://github.com/keybraker)
<br>
Copyright © 2020 [Portal](https://github.com/keybraker/portal-discord-bot)


