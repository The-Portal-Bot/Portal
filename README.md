# [Portal](https://github.com/keybraker/portal-discord-bot)
A feature-rich channel manager for discord.

![alt text](https://...)

Features:
* Automatically generates voice channels
* Automatically updates the title of the channel in accordance to your guidlines
* Assignes and strips roles forom users with a siple reaction press

***

## Commands
**Portal prefix: .**

name | arguments | description
--------- | --------- | ---------
.portal | !channel_name @category_name | _creates a voice channel and a category for it_
.text | !channel_name | _creates a text channel connected to the voice channel_
.regex | @regex_string | _sets regex-guidelines for how to name channels (current portal)_
.log | @log_string | _returns the log of data given in log_string_
.prefix | !new_prefix | _sets the new prefix for portal bot_
.help | none | _returns a help-list of all commands and regex manipulation_
  
* symbol: ! _indicates beginning of mandatory argument **(should not be included)**_
* symbol: @ _indicates beginning of mandatory argument **(should not be included)**_

***

## Regex Interpretor
There are four types of data in portal bot:
1. variables
2. attributes
3. pipes

## Variables
* _prefix:_ __$__
* _(Variables are defacto data sources that can be accessed though calling them)_

name | description
--------- | ---------
\# | _number of channel in list_
\## | _number of channel in list with \#_
date | _full date: dd/mm/yyyy_
time | _full time: hh/mm/ss_
crtr | _creator of the channel_
game_lst | _list of currently played games_
game_cnt | _number of games being played_
game_his | _list of all games played from beginning_
mmbr_lst | _returns the currently played games_
mmbr_cnt | _number of members in channel_
mmbr_plg | _number of members playing_
mmbr_his | _returns the currently played games_
mmbr_lmt | _sets the limit of users in channel_

### Pipes
* _prefix:_ __|__
* _(Pipes are applied to variables in order to change their outcome)_

name | type | description
--------- | --------- | ---------
upper | string | _makes input uppercase_
lower | string | _makes input lowercase_
title | string | _makes input titlecase_
acrnm | string | _makes input string of acronyms_
word\# | string | _maximum number of word \# is number_
dday | date | _gets the day_
mnth | date | _gets the month_
year | date | _gets the year_
hour | time | _gets the hour_
mint | time | _gets the minute_
secs | time | _gets the second_
ppls | array | _gets more popular in array_
ppls_cnt | array | _count of most popular in array_
smmr_cnt | array | _count of all in array_

### Attributes
* _prefix:_ __@__
* _(Attributes are values that a channel has from its inception and are subject to change)_

name | type | default | description
--------- | --------- | --------- | --------- 
nobots | bool | false | _no bots allowes_
mmbr_cap | num | infinite | _maximum number of members allowed_
ttl | num | infinite | _time to live_
title_refresh | num | on presence update | _how often titles are being refreshed_

***

# About

* v0.0.0: 5/5/20 ALPHA

Acknowledgments - **Discord.js** with the exeptional library [**Discord.js**](http://owl.phy.queensu.ca/~phil/exiftool/)
<br>
Author - **Ioannis Tsiakkas** - *(Keybraker)* - [Keybraker](https://github.com/keybraker)
<br>
Copyright © 2020 [Portal](https://github.com/keybraker/portal-discord-bot)


