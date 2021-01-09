[< back to README](https://github.com/keybraker/portal-discord-bot#regex-interpreter)

## Attributes

* _prefix:_ __@__
* _Attributes are Portal Bot's, Portal Voice or Voice Channel options that can be manipulated by whomever has clearance_

| Attributes | Type | Default | Description |
| :--------- | :--------- | :--------- | :---------  |
`regex_portal` | string | _default regex_ | _regex-guidelines for how to display portal's title_
`regex_voice` | string | _default regex_ | _regex-guidelines for how to display new voice (current portal)_
`regex` | string | _default regex_ | _sets regex-guidelines for current voice_
`locale_guild` | string (gr/en/de) | gr | _locale used for **Portal™**'s interactions_
`locale_portal` | string (gr/en/de) | gr | _locale used for **Portal™**'s interactions_
`locale` | string (gr/en/de) | gr | _locale used for **Portal™**'s interactions_
`user_limit_portal` | number | 0 | _guidelines for max number of members for new voice channel from current portal_
`user_limit` | number | 0 | _guidelines for max number of members for current voice_
`bitrate_portal` | number | 64000 | _bitrate of current portal channel_
`bitrate_voice` | number | 64000 | _bitrate of current voice channel_
`position` | number | beneath portal | _position of channel_
