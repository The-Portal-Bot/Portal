[< back to README](https://github.com/keybraker/portal-discord-bot#regex-interpreter)

## Attributes

* _prefix:_ __@__
* _Attributes are Portal Bot's, Portal Voice or Voice Channel options that can be manipulated by whomever has clearance_

| Attributes          | Description                                                                      | Type              | Default         |
| :------------------ | :------------------------------------------------------------------------------- | :---------------- | :-------------- |
| `regex_portal`      | _regex-guidelines for how to display portal's title_                             | string            | _default regex_ |
| `regex_voice`       | _regex-guidelines for how to display new voice (current portal)_                 | string            | _default regex_ |
| `regex`             | _sets regex-guidelines for current voice_                                        | string            | _default regex_ |
| `locale_guild`      | _locale used for **Portal**'s interactions_                                     | string (gr/en/de) | gr              |
| `locale_portal`     | _locale used for **Portal**'s interactions_                                     | string (gr/en/de) | gr              |
| `locale`            | _locale used for **Portal**'s interactions_                                     | string (gr/en/de) | gr              |
| `user_limit_portal` | _guidelines for max number of members for new voice channel from current portal_ | number            | 0               |
| `user_limit`        | _guidelines for max number of members for current voice_                         | number            | 0               |
| `bitrate_portal`    | _bitrate of current portal channel_                                              | number            | 64000           |
| `bitrate_voice`     | _bitrate of current voice channel_                                               | number            | 64000           |
| `position`          | _position of channel_                                                            | number            | beneath portal  |
