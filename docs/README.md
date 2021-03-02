<h1 align="center">Portal <img src="https://github.com/keybraker/portal/blob/master/src/assets/img/portal_logo.png" alt="alt text" width="25" height="25">
</h1>

<p align="center">A fully fledged and feature rich bot for Discord</p>

<p align="center">
    Voice channels on demand (with auto-name update)<br>
    Assigns and strips roles from users with a single reaction<br>
    Creates temporary "focus" channels for private conversations<br>
    Music player that is clean and clutter free<br>
    Portal will keep you up to speed, with voice announcements<br>
    Get the latest on the corona virus and current weather<br>
    Spotify / Announcement / URL-only channels<br>
</p>

<p align="center">
    <a href="https://top.gg/bot/704400876860735569">
        <img src="https://top.gg/api/widget/status/704400876860735569.svg?noavatar=true" alt="Portal" />
    </a>
    <a href="https://top.gg/bot/704400876860735569">
        <img src="https://top.gg/api/widget/upvotes/704400876860735569.svg?noavatar=true" alt="Portal" />
    </a>
    <a href="https://discord.com/api/oauth2/authorize?client_id=704400876860735569&permissions=8&redirect_uri=http%3A%2F%2Fwww.localhost%3A4000%2Fpremium%2F&scope=bot"><img src="https://img.shields.io/badge/📥-Add%20to%20Discord-blue" alt="Add to Discord" /></a>
    <a href="https://discord.gg/nuKXgFXr5y"><img src="https://img.shields.io/badge/Discord-Portal%20Official-green" alt="Add to Discord" /></a>
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
_argument preceded by **!** is **mandatory**, **@** is **optional** (not included)_

## More

1. For frequently asked questions (FAQ) with their answers click [here](https://github.com/keybraker/portal/blob/master/docs/faq.md).
2. If you want to host Portal on your own system you can follow the guide [here](https://github.com/keybraker/portal/blob/master/docs/Hosting.md).
3. Portal is an open source project you can contribute too. There are guidelines for how to properly contribute [here](https://github.com/keybraker/portal/blob/master/docs/CONTRIBUTING.md).

## Release History

| Version | Date       | Argument                                                                                        |
| :------ | :--------- | :---------------------------------------------------------------------------------------------- |
| 0.6.0   | 15-02-2021 | _transition to MongoDB from plain JSON file with many improvements, especially on music player_ |
| 0.5.7   | 18-01-2021 | _updates throughout the app to fix bugs and small problems_                                     |
| 0.5.0   | 08-01-2021 | _transition to Typescript from Javascript, a lot of errors have been fixed and is more robust_  |
| 0.2.1   | 16-06-2020 | _first version with more commands and feature with full test is now on two servers_             |
| 0.1.0   | 18-05-2020 | _beta testing with a small set of commands on one server_                                       |
| 0.0.1   | 05-05-2020 | _alpha version with initial features more of a test phase to test viability_                    |

> **Disclaimers**
> 
> 1. Portal will never record conversations or store anything you type<br>
> 2. Discord update their server rate limit to twice per 10 minutes. The new rate limit for channel name and topic updates is 2 updates per 10 minutes, per channel [more here](https://github.com/discordjs/discord.js/issues/4327)<br>
> 3. Runs on nodejs 14.x
> 4. As this is a work-in-progress and new features are added weekly, if you want to give input or request a feature you can always do that at [Portal's Official Discord server](https://discord.gg/nuKXgFXr5y)
> 5. Portal is made using _[Discord.js](https://discord.js.org/#/)_

<img src="https://github.com/keybraker/portal/workflows/compile%20test%20run/badge.svg" alt="CI" /> <img src="https://img.shields.io/badge/discord.js-12.5.1-blue" alt="discord.js" /> <img src="https://img.shields.io/badge/npm-6.14.10-blue" alt="npm" /> <img src="https://img.shields.io/badge/node-14.15.4-blue" alt="node">

<p align="center">
   <a href="https://itsiakkas.com">Ioannis Tsiakkas</a> | <a href="http://www.gnu.org/philosophy/free-sw.html">GPL-3.0 License</a>
</p>
   
<p align="center">Copyrights © Keybraker 2020-2021 Portal, All rights reserved</p>
