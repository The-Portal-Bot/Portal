# [Portal](https://github.com/keybraker/portal-discord-bot) <img src="https://github.com/keybraker/portal-discord-bot/blob/master/assets/img/logo.png" alt="alt text" align="right" width="250" height="250">
A feature-rich channel manager for discord.

Features:
* Automatically generates voice channels
* Automatically updates the title of the channel in accordance to your guidlines
* Assignes and strips roles forom users with a siple reaction press
<br><br />
***

## Commands
**Portal prefix: ./**

name | arguments | description
--------- | --------- | ---------
./portal | !channel_name @category_name | _creates a voice channel and a category for it_
./regex_portal | !regex_command | _sets regex-guidelines for how to display portal's title_
./regex_voice | !regex_command | _sets regex-guidelines for how to display voice (current portal)_
./run | !exec_command | _returns the log of data given in log_string_
./set | !attribute !value | _sets the value of attribute_
./url | !channel_name @category_name | _creates a url only channel and a category for it_
./save | none | _saves current state of server_
./help | @specific_command or @vrbl/@func/@pipe/@attr | _returns a help-list of all commands and regex manipulation_
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
no_bots | bool | false | _no bots allowed_
mmbr_cap | num | infinite | _maximum number of members allowed_
time_to_live | num | infinite | _time to live_
refresh_rate | num | on presence update | _how often titles are being refreshed_
lang | string | gr/en | _language used in statuses_
pos | num | beneath portal | _position of channel_
count | num | spawn number | _position (index) in array_
***

# About

* v0.0.0: 5/5/20 Alpha
* v1.0.0: 18/5/20 Version 1

Acknowledgments - **Discord.js** with the exeptional library [**Discord.js**](http://owl.phy.queensu.ca/~phil/exiftool/)
<br>
Author - **Ioannis Tsiakkas** - *(Keybraker)* - [Keybraker](https://github.com/keybraker)
<br>
Copyright © 2020 [Portal](https://github.com/keybraker/portal-discord-bot)


