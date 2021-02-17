[< back to README](https://github.com/keybraker/portal-discord-bot#regex-interpreter)

## Attributes

* _prefix:_ __@__
* _Attributes are Portal Bot's, Portal Voice or Voice Channel options that can be manipulated by whomever has clearance_

| Attributes          | Description                                                    | Type    | Default                               |
| :------------------ | :------------------------------------------------------------- | :------ | :------------------------------------ |
| `p.ann_announce`    | _if announcements will be made in voices of portal_            | boolean | _true_                                |
| `v.ann_announce`    | _if announcements will be made in voice_                       | boolean | _true_                                |
| `p.ann_user`        | _if join/leave announcements will be made in voices of portal_ | boolean | _true_                                |
| `v.ann_user`        | _if join/leave announcements will be made in voice_            | boolean | _true_                                |
| `v.bitrate`         | _if voice's current bitrate_                                   | number  | _96000_                               |
| `m.dj`              | _makes user a dj_                                              | boolean | _false_                               |
| `g.locale`          | _global locale_                                                | enum    | _gr_, _en_, _de_                      |
| `p.locale`          | _portal's locale_                                              | enum    | _gr_, _en_, _de_                      |
| `v.locale`          | _voice's locale_                                               | enum    | _gr_, _en_, _de_                      |
| `v.position`        | _voice's position in discord_                                  | enum    | _gr_, _en_, _de_                      |
| `p.regex_overwrite` | _if spawned portal will be overwritten by personal regexs_     | boolean | _false_                               |
| `p.regex`           | _regex guidelines for portal's title_                          | boolean | _`G$#-P$member_count | $status_list`_ |
| `p.v.regex`         | _regex guidelines for portal's voice's titles_                 | boolean | _`G$#-P$member_count | $status_list`_ |
| `v.regex`           | _regex guidelines for voice's title_                           | boolean | _`G$#-P$member_count | $status_list`_ |
| `m.regex`           | _regex guidelines for user's voice's title_                    | boolean | _(nothing)_                           |
| `p.user_limit`      | _max number of members for portal's voices_                    | number  | _0_ (infinite)                        |
| `v.user_limit`      | _max number of members for voice_                              | number  | _0_ (infinite)                        |