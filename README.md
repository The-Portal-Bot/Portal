# [Portal](https://github.com/keybraker/portal-discord-bot)
A feature-rich channel manager for discord.

![alt text](https://...)

Why use Media Portal:
* It automatically generates voice channels
* It updates the title of the channel in acordance to your guidlines

***

## Commands
**Portal prefix: .**

name | arguments | description
--------- | --------- | ---------
.portal | !channel_name @category_name | _creates a voice channel and a category for it_
.text | !channel_name | _creates a text channel connected to the voice channel_
.regex | __press here for more__ | _gives guidelines for how to name channels_
  
* symbol: $ _indicates beginning of mandatory argument, **should not be included**_
* symbol: @ _indicates beginning of mandatory argument, **should not be included**_

# Regex Interpretor
**variable prefix: $**

variable | data
--------- | ---------
game_name | _returns the currently played games_
user_limit | _sets the limit of users in channel_
user_count | _returns the number of users in channel_
creator | _returns the creator of the channel_
users_playing | _returns the number of players playing_
game_count | _returns the number of games being played_

**function prefix: .**

function | data
--------- | ---------
expression( string ) | _returns the currently played games_
popular_max() | _returns the most popular game_
popular() | _returns_
summary_max() | _returns the creator of the channel_

* functions can only be added on the end of a variable

## Release History

* v0.0.0: 5/5/20 ALPHA

***
Acknowledgments - **Discord.js** with the exeptional library [**Discord.js**](http://owl.phy.queensu.ca/~phil/exiftool/)

***
Author - **Ioannis Tsiakkas** - *(Keybraker)* - [Keybraker](https://github.com/keybraker)

***
Copyright © 2020 [Portal](https://github.com/keybraker/portal-discord-bot)


