<h1 align="center">Portal <img src="https://github.com/keybraker/portal/blob/master/src/assets/img/logo.png" alt="alt text" width="25" height="25"></p>
</h1>

<p align="center">A fully fledged and feature rich bot for Discord</p>

<p align="center">
    Voice channels on demand (with auto-name update)<br>
    Assignes and strips roles from users with a single reaction press<br>
    Creates temporary "focus" channels for private conversations<br>
    Music player that is clean and clutter free<br>
    Portal will keep you up to date, without the need to look<br>
    Get the latest on the corona virus and Weather<br>
    Music / Spotify / Announcement / URL-only channels<br>
</p>

<p align="center">
    <img src="https://github.com/keybraker/portal/workflows/compile%20test%20run/badge.svg" alt="CI" />
    <img src="https://img.shields.io/badge/discord.js-12.5.1-blue" alt="discord.js" />
    <img src="https://img.shields.io/badge/npm-6.14.10-blue" alt="npm" />
    <img src="https://img.shields.io/badge/node-14.15.4-blue" alt="node">
    <a href="https://discord.com/api/oauth2/authorize?client_id=704400876860735569&permissions=8&redirect_uri=http%3A%2F%2Fwww.localhost%3A4000%2Fpremium%2F&scope=bot"><img src="https://img.shields.io/badge/Add%20to%20Discord-📥-blue" alt="Add to Discord" /></a>
</p>

---

<br>

<p align="center"><a href="https://github.com/keybraker/portal/blob/master/docs/Commands.md">Commands</a>, a list of all Portal commands with description, arguments and how to use them.</p>

<br>

Regex Interpreter: there are four types of data _(used by run command and naming portal channels)_:

1. [Variables](https://github.com/keybraker/portal/blob/master/docs/Variables.md), are immutable and live data that return information.
2. [Attributes](https://github.com/keybraker/portal/blob/master/docs/Attributes.md), are Portal's, portal or voice channel options that can be manipulated by whomever has clearance.
3. [Pipes](https://github.com/keybraker/portal/blob/master/docs/Pipes.md), are mini functions you can pass text or Variables to manipulate their outcome.
4. [Structures](https://github.com/keybraker/portal/blob/master/docs/Structures.md), are conditional flow manipulators.

_pipes are applied to variables or text in order to change their outcome_<br>
_default premium regex: `G$#-P$member_count | $status_list`_<br>
_argument preceded by **!** is **mandatory**, **@** is **optional** (not included)_

## Self Hosting

### Prerequisites

1.  Install npm ^6.x

        $ sudo curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash –

2.  Install nodejs ^14.x

        $ sudo apt -y install nodejs

    > make sure you have version 14.x or higher with `node -v`

### Build

1.  Open a terminal windows and clone Portal

        $ git clone https://github.com/keybraker/portal.git && cd portal

2.  Install node packages

        $ npm install

### Setup and Run

1.  Create a bot on Discord Portal and add the toke in config.json

    ```json
    {
      "token": "add-your-token-here",
      "prefix": "./",
      "database_json": "src/database/guild_list.json",
      "owner_id": "add-your-id-(optional)",
      "portal_id": "add-bots-id-(optional)",
      "api_keys": {
        "OpenWeatherMap": "add-open-weather-map-api-key",
        "covid_193": "add-covid-193-api-key",
        "translate": {
          "engine": "yandex",
          "key": "add-yeandex-api-key"
        }
      },
      "delete_msg": false,
      "delete_msg_after": 5,
      "always_reply": true
    }
    ```

2.  Run Portal

        $ npm start

## Release History

| Version | Date       | Argument     |
| :------ | :--------- | :----------- |
| 0.5.0   | 08-01-2021 | _Typescript_ |
| 0.2.1   | 16-06-2020 | _Javascript_ |
| 0.1.0   | 18-05-2020 | _Beta_       |
| 0.0.1   | 05-05-2020 | _Alpha_      |

## Acknowledgements

> Acknowledgments - _[Discord.js](https://discord.js.org/#/)_<br>
> Author - _[Ioannis Tsiakkas](https://itsiakkas.com)_<br>
> License - _[GNU LICENSE](http://www.gnu.org/philosophy/free-sw.html)_

Portal is an open source project you can contribute too. There are guidelines for how to properly contribute [here](https://github.com/keybraker/portal/blob/master/docs/CONTRIBUTING.md)

> **Disclaimers**
>
> 1. Portal will never record conversations or store anything you type<br>
> 2. Discord update their server rate limit to twice per 10 minutes. The new rate limit for channel name and topic updates is 2 updates per 10 minutes, per channel [more here](https://github.com/discordjs/discord.js/issues/4327)<br>
> 3. Runs on nodejs 14.x

<p align="center">Copyrights © Keybraker 2020-2021 Portal, All rights reserved</p>
