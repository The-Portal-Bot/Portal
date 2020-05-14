# [Portal](https://github.com/keybraker/portal-discord-bot)
A feature-rich channel manager for discord.

![alt text](https://...)

Features:
* Automatically generates voice channels
* Automatically updates the title of the channel in accordance to your guidlines
* Assignes and strips roles forom users with a siple reaction press

***

## Commands
**Portal prefix: ./**

name | arguments | description
--------- | --------- | ---------
./portal | !channel_name @category_name | _creates a voice channel and a category for it_
./regexP | @regex_command | _sets the regex name for the portal from current voice channel_
./regexV | @regex_command | _sets the regex name for the current voice channel_
./run | @exec_command | _returns the log of data given in log\_string_
./prefix | !prefix | _sets the new prefix for portal bot_
./attrP | @attr | _sets the attribute you mention for the portal from current voice channel_
./attrV | @attr | _sets the attribute you mention for the current voice channel_
./help | @specific_command | _returns a help-list of all commands and regex manipulation_
./ping | none | _returns round trip latency_
  
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

name | description
--------- | ---------
\# | _number of channel in list_
\## | _number of channel in list with \#_
date |_full date: dd/mm/yyyy_
tday |_gets the day_
mnth |_gets the month_
year | _gets the year_
time | _full time: hh/mm/ss_
hour | _gets the hour_
mint | _gets the minute_
scnd | _gets the second_
crtr | _creator of the channel_
status_lst | _list of current statuses_
status_cnt | _number of games being played_
status_his | _list of all games played from beginning_
mmbr_lst | _returns the currently played games_
mmbr_cnt | _number of members in channel_
mmbr_plg | _number of members playing_
mmbr_his | _returns the history of statuses_
mmbr_lmt | _sets the limit of users in channel_

### Pipes
* _prefix:_ __|__
* _(Pipes are applied to variables in order to change their outcome)_

name | type | description
--------- | --------- | ---------
upper | string | _makes input uppercase_
lower | string | _makes input lowercase_
titl | string | _makes input titlecase_
acrm | string | _makes input string of acronyms_
word\# | string | _maximum number of words (\# is number)_
ppls | array | _gets more popular in array_
ppls_cnt | array | _count of most popular in array_
smmr_cnt | array | _count of all in array_

### Attributes
* _prefix:_ __@__
* _(Attributes are values that a channel has from its inception and are subject to change)_

name | type | default | description
--------- | --------- | --------- | --------- 
nbot | bool | false | _no bots allowed_
mmbr_cap | num | infinite | _maximum number of members allowed_
time_tolv | num | infinite | _time to live_
titl_rfsh | num | on presence update | _how often titles are being refreshed_

***

# About

* v0.0.0: 5/5/20 ALPHA

Acknowledgments - **Discord.js** with the exeptional library [**Discord.js**](http://owl.phy.queensu.ca/~phil/exiftool/)
<br>
Author - **Ioannis Tsiakkas** - *(Keybraker)* - [Keybraker](https://github.com/keybraker)
<br>
Copyright © 2020 [Portal](https://github.com/keybraker/portal-discord-bot)


