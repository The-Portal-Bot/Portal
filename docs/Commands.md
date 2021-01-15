[< back to README](https://github.com/keybraker/portal-discord-bot#regex-interpreter)

## Commands

**Portal prefix: ./**

| Name               | Description                                                      | Arguments                            | Eligible for use                                      | Cooldown (mins) |
| :----------------- | :--------------------------------------------------------------- | :----------------------------------- | :---------------------------------------------------- | :-------------- |
| `about`            | _returns an about Portal message_                                | _none_                               | everyone                                              | -               |
| `announce`         | _announceces whatever is given by the writter to online members_ | _@title \| @body_                    | everyone                                              | 1 user          |
| `announcement`     | _creates a new or sets the current channel as announcement_      | _@channel\_name \| @category\_name_  | admin, portal-admins                                  | admin           |
| `authorise`        | _add role to admin roles_                                        | _!role_                              | admin, portal-admins, admin                           | admin           |
| `authorised_roles` | _displayes all authorised roles_                                 | _none_                               | everyone                                              | admin           |
| `corona`           | _replies with the daily state of corona virus cases_             | _@country code (gr, de, us, etc)_    | everyone                                              | -               |
| `deauthorise`      | _removes role from admin roles_                                  | _!role_                              | admin, portal-admins, admin                           | admin           |
| `delete`           | _deletes x number of messsages on the text channel_              | _!number of messages to delete_      | admin, portal-admins, admin                           | admin           |
| `focus`            | _creates focus channel for you and your requested user_          | _!username @time (default 5minutes)_ | everyone                                              | -               |
| `force`            | _clones current channel in order to force-update name_           | _none_                               | admin, portal-admins, admin                           | 02 admin        |
| `help`             | _returns a help-list if specified returns specific description_  | _@command/@vrbl/@func/@pipe/@attr_   | everyone                                              | -               |
| `join`             | _joins current voice channel and announces events_               | _none_                               | everyone                                              | 01 user         |
| `joke`             | _replies with a joke_                                            | _@category_                          | everyone                                              | -               |
| `leaderboard`      | _replies with the top 10 leaderboard_                            | _@number of members_                 | everyone                                              | -               |
| `leave`            | _removes Portal from voice channel_                              | _none_                               | everyone                                              | -               |
| `level`            | _returns your level_                                             | _none_                               | everyone                                              | -               |
| `music`            | _creates a new or sets the current channel as music channel_     | _@channel\_name \| @category\_name_  | admin, portal-admins, admin                           | admin           |
| `ping`             | _returns round trip latency_                                     | _none_                               | everyone                                              | -               |
| `portal`           | _creates a portal voice channel_                                 | _!channel\_name \| @category\_name_  | admin, portal-admins, admin                           | admin           |
| `ranks`            | _returns ranks of ranking system_                                | _none_                               | everyone                                              | -               |
| `role_assigner`    | _replies with a message that gives roles when an emote is added_ | _role json_                          | admin, portal-admins, admin                           | admin           |
| `roll`             | _roll follows the same philosophy as in roll20_                  | _<!roll sequence>_                   | everyone                                              | -               |
| `run`              | _runs the given command string and returns its output_           | _!exec\_command_                     | everyone                                              | -               |
| `save`             | _saves current state of server_                                  | _none_                               | admin, portal-admins, admin                           | 05 server       |
| `set_ranks`        | _sets roles that will be given when said level reached_          | _rank json_                          | voice-portal owner, admin, portal-admins, admin-role  | admin           |
| `set`              | _sets the value of an attribute_                                 | _!attribute !value_                  | voice-portal owner, admin, portal-admins, admin       | -               |
| `setup`            | _creates an announcement, spotify, url-only and music channel_   | _none_                               | admin, portal-admins, admin                           | 10 server       |
| `spotify`          | _creates a new or sets the current channel as spotify channel_   | _none_                               | none                                                  | admin           |
| `state`            | _returns the current state of portal_                            | _@channel\_name \| @category\_name_  | admin, portal-admins                                  | -               |
| `url`              | _creates a new or sets the current channel as url-only_          | _@channel\_name \| @category\_name_  | admin, portal-admins, admin                           | admin           |
| `weather`          | _replies with the current wheather for the requested city_       | _!city\_name_                        | everyone                                              | -               |
| `whoami`           | _replies with the your portal stats_                             | _none_                               | everyone                                              | -               |
