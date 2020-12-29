[back to readme](https://github.com/keybraker/portal-discord-bot)

## Commands

**Portal™ prefix: ./**

| name | description | arguments | eligible for use | cooldown (mins) |
| :--------- | :--------- | :--------- | :--------- | :--------- |
| `about` | _returns an about Portal message_ | _none_ | everyone | - |
| `announce` | _@title \| @body_ | everyone | 1 user |
| `announcement` | _creates a new or sets the current channel as announcement_ | _@channel\_name \| @category\_name_ | admin, | admin-role/s | - |
| `auth_role_add` | _add role to admin roles_ | _!role_ | admin, admin-role/s | - |
| `auth_role_rem` | _removes role from admin roles_ | _!role_ | admin, admin-role/s | - |
| `corona` | _replies with the daily state of corona virus cases_ | _@country code (gr, de, us, etc)_ | everyone | - |
| `focus` | _creates focus channel for you and your requested user_ | _!username @time (default 5minutes)_ | everyone | - |
| `force` | _clones current channel in order to force-update name_ | _none_ | admin, admin-role/s | 2 user |
| `help` | _returns a help-list if specified returns specific description_ | _@command/@vrbl/@func/@pipe/@attr_ | everyone | - |
| `join` | _joins current voice channel and announces events_ | _none_ | everyone | 1 user |
| `leave` | _removes Portal from voice channel_ | _none_ | everyone | - |
| `level` | _returns your level_ | _none_ | everyone | - |
| `music` | _creates a new or sets the current channel as music channel_ | _@channel\_name \| @category\_name_ | admin, admin-role/s | | - |
| `ping` | _returns round trip latency_ | _none_ | everyone | - |
| `portal` | _creates a portal voice channel_ | _!channel\_name \| @category\_name_ | admin, admin-role/s | - |
| `ranks` | _returns ranks of ranking system_ | _none_ | everyone | - |
| `role` | _replies with a message that gives roles when an emote is added_ | _role json_ | admin, admin-role/s | - |
| `run` | _runs the given command string and returns its output_ | _!exec\_command_ | everyone | - |
| `save` | _saves current state of server_ | _none_ | admin, admin-role/s | 5 server |
| `set` | _sets the value of an attribute_ | _!attribute !value_ | voice owner/ portal owner, admin, admin-role/s | - |
| `set_ranks` | _sets roles that will be given when said level reached_ | _rank json_ | voice owner/ portal owner, admin, admin-role/| s | 10 server |
| `setup` | _creates an announcement, spotify, url-only and music channel_ | _none_ | admin, admin-role/s | 10 server |
| `spotify` | _creates a new or sets the current channel as spotify channel_ | _@channel\_name \| @category\_name_ | admin, | admin-role/s | - |
| `url` | _creates a new or sets the current channel as url-only_ | _@channel\_name \| @category\_name_ | admin, admin-role/s | - |

* _(Pipes are applied to variables or strings in order to change their outcome)_

* symbol: ! _indicates beginning of mandatory argument **(should not be included)**_
* symbol: @ _indicates beginning of mandatory argument **(should not be included)**_
