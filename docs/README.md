![Node.js CI](https://github.com/keybraker/portal-discord-bot/workflows/Node.js%20CI/badge.svg)

**Disclaimer[0]:**
> This is a pation project, still in its infancy
> There is a lot yet to be done

**Disclaimer[1]:**
> Portal will never record conversations or store anything you type

**Disclaimer[2]:**
> Discord update their server rate limit to twice per 10 minutes
> [The new rate limit for channel name and topic updates is 2 updates per 10 minutes, per channel.](https://github.com/discordjs/discord.js/issues/4327)

***

# [Portal™](https://github.com/keybraker/portal-discord-bot) <img src="https://github.com/keybraker/portal-discord-bot/blob/master/assets/img/logo.png" alt="alt text" align="right" width="250" height="250">
A feature-rich channel manager for discord.

Features:
* Automatically generates voice channels.
* Automatically updates the title of the channel in accordance to your regex guidlines.
* Assignes and strips roles from users with a single reaction press.
* Creates temporary "focus" channels for private conversations.
* Get the latest on the corona virus
* Spotify / Announcement / URL channels that allow any server to create and maintain clean announcement channels without being verified.

***

## Commands

**Portal™ prefix: ./**

| Name               | Description                                                      | Arguments                            | Eligible for use                               | Cooldown (mins) |
| :----------------- | :--------------------------------------------------------------- | :----------------------------------- | :--------------------------------------------- | :-------------- |
| `about`            | _returns an about Portal message_                                | _none_                               | everyone                                       | -               |
| `announce`         | _@title \| @body_                                                | everyone                             | 1 user                                         | -               |
| `announcement`     | _creates a new or sets the current channel as announcement_      | _@channel\_name \| @category\_name_  | admin,                                         | admin-role/s    |
| `authorise`        | _add role to admin roles_                                        | _!role_                              | admin, admin-role/s                            | -               |
| `authorised_roles` | _displayes all authorised roles_                                 | none                                 | everyone                                       | -               |
| `corona`           | _replies with the daily state of corona virus cases_             | _@country code (gr, de, us, etc)_    | everyone                                       | -               |
| `deauthorise`      | _removes role from admin roles_                                  | _!role_                              | admin, admin-role/s                            | -               |
| `focus`            | _creates focus channel for you and your requested user_          | _!username @time (default 5minutes)_ | everyone                                       | -               |
| `force`            | _clones current channel in order to force-update name_           | _none_                               | admin, admin-role/s                            | 2 user          |
| `help`             | _returns a help-list if specified returns specific description_  | _@command/@vrbl/@func/@pipe/@attr_   | everyone                                       | -               |
| `join`             | _joins current voice channel and announces events_               | _none_                               | everyone                                       | 1 user          |
| `leave`            | _removes Portal from voice channel_                              | _none_                               | everyone                                       | -               |
| `level`            | _returns your level_                                             | _none_                               | everyone                                       | -               |
| `music`            | _creates a new or sets the current channel as music channel_     | _@channel\_name \| @category\_name_  | admin, admin-role/s                            | -               |
| `ping`             | _returns round trip latency_                                     | _none_                               | everyone                                       | -               |
| `portal`           | _creates a portal voice channel_                                 | _!channel\_name \| @category\_name_  | admin, admin-role/s                            | -               |
| `ranks`            | _returns ranks of ranking system_                                | _none_                               | everyone                                       | -               |
| `role_assigner`    | _replies with a message that gives roles when an emote is added_ | _role json_                          | admin, admin-role/s                            | -               |
| `run`              | _runs the given command string and returns its output_           | _!exec\_command_                     | everyone                                       | -               |
| `save`             | _saves current state of server_                                  | _none_                               | admin, admin-role/s                            | 5 server        |
| `set`              | _sets the value of an attribute_                                 | _!attribute !value_                  | voice owner/ portal owner, admin, admin-role/s | -               |
| `set_ranks`        | _sets roles that will be given when said level reached_          | _rank json_                          | voice owner/ portal owner, admin, admin-role/  | 10 servers      |
| `setup`            | _creates an announcement, spotify, url-only and music channel_   | _none_                               | admin, admin-role/s                            | 10 servers      |
| `spotify`          | _creates a new or sets the current channel as spotify channel_   | _@channel\_name \| @category\_name_  | admin,                                         | admin-role/s    |
| `url`              | _creates a new or sets the current channel as url-only_          | _@channel\_name \| @category\_name_  | admin, admin-role/s                            | -               |

* _(Pipes are applied to variables or strings in order to change their outcome)_
* _(default regex: G$#-P$member_count | $status_list)_

* symbol: ! _indicates beginning of mandatory argument **(should not be included)**_
* symbol: @ _indicates beginning of mandatory argument **(should not be included)**_

***

## Regex Interpreter

There are four types of data:
1. [Variables](https://github.com/keybraker/portal-discord-bot/blob/master/docs/Variables.md), are data used to fetch information for the current state of the channel you are in.
2. [Attributes](https://github.com/keybraker/portal-discord-bot/blob/master/docs/Attributes.md), are configuration data for Portal's use. 
3. [Pipes](https://github.com/keybraker/portal-discord-bot/blob/master/docs/Pipes.md), are functions that you can pass the strings or Variables to manipulate their outcome. 
4. [Structures](https://github.com/keybraker/portal-discord-bot/blob/master/docs/Structures.md), are conditional flow manipulators.

## Release History

| Version | Date       | Argument |
| :------ | :--------- | :------- |
| 1.0.1   | 16-06-2020 | _Beta_   |
| 0.5.0   | 18-05-2020 |          |
| 0.0.1   | 05-05-2020 | _Alpha_  |

## Acknowledgements

> Acknowledgments - _[Discord.js](https://discord.js.org/#/)_
> Author - _[Ioannis Tsiakkas](https://itsiakkas.com)_
> License - _[GNU LICENSE](http://www.gnu.org/philosophy/free-sw.html)_

Copyrights © Keybraker 2020 [Portal](https://github.com/keybraker/portal-discord-bot), All rights reserved
