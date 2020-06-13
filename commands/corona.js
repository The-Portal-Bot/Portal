const axios = require("axios");
let request = require("request");
const https = require('follow-redirects').https;
const moment = require('moment');
const lclz_mngr = require('./../functions/localization_manager');

module.exports = async (client, message, args, portal_guilds, portal_managed_guilds_path, user_match) => {
    let url = null;
    if (args.length === 0) {
        url = '/free-api?global=stats';
    } else if (args.length === 1) {
        url = '/free-api?countryTotal=' + args[0];
    } else {
        return {
            result: false, value: '**You can run "./help corona" for help.**'
        };
    }

    let options = {
        'method': 'GET',
        'hostname': 'api.thevirustracker.com',
        'path': url,
        'headers': {
        },
        'maxRedirects': 20
    };

    let flow = true;
    let req = https.request(options, function (res) {
        let chunks = [];

        res.on("data", function (chunk) {
            chunks.push(chunk);
        });

        res.on("end", function (chunk) {
            let body = Buffer.concat(chunks);
            let json = JSON.parse(body.toString().substring(body.toString().indexOf('{')));

            if (json.countrydata !== undefined) { console.log('mphka sto 1');
                daily_stats = json.countrydata[0];
                country_stats = json.countrydata[0].info;

                message.channel.send(create_rich_embed(`CoronaVirus stats for ${country_stats.title} ${moment().format('DD/MM/YY')}`,
                    `https://thevirustracker.com/`, `#ff0000`, [
                    { emote: 'New cases', role: `+***${daily_stats.total_new_cases_today}***`, inline: true },
                    { emote: 'New deaths', role: `+***${daily_stats.total_new_deaths_today}***`, inline: true },
                    { emote: 'Danger rank', role: `***${daily_stats.total_danger_rank}***`, inline: true },
                    { emote: 'Total cases', role: `***${daily_stats.total_cases}***`, inline: true },
                    { emote: 'Total deaths', role: `***${daily_stats.total_deaths}***`, inline: true },
                    { emote: 'Total recovered', role: `***${daily_stats.total_recovered}***`, inline: true },
                    { emote: '% Recovered', role: `***${((daily_stats.total_recovered / daily_stats.total_cases) * 100).toFixed(2)}%***`, inline: true },
                    { emote: '% Diseased', role: `***${((daily_stats.total_deaths / daily_stats.total_cases) * 100).toFixed(2)}%***`, inline: true },
                    { emote: 'Total serious cases', role: `***${daily_stats.total_serious_cases}***`, inline: true }
                ], null, null, true));
            } else if (json.results !== undefined && json.results[0].data !== 'none') { console.log('mphka sto 2', json.results[0].data);
                daily_stats = json.results[0];

                message.channel.send(create_rich_embed(`CoronaVirus stats for the world ${moment().format('DD/MM/YY')}`,
                    `https://thevirustracker.com/`, `#ff0000`, [
                    { emote: 'New cases', role: `+***${daily_stats.total_new_cases_today}***`, inline: true },
                    { emote: 'New deaths', role: `+***${daily_stats.total_new_deaths_today}***`, inline: true },
                    { emote: 'Danger rank', role: `***-***`, inline: true },
                    { emote: 'Total cases', role: `***${daily_stats.total_cases}***`, inline: true },
                    { emote: 'Total deaths', role: `***${daily_stats.total_deaths}***`, inline: true },
                    { emote: 'Total recovered', role: `***${daily_stats.total_recovered}***`, inline: true },
                    { emote: '% Recovered', role: `***${((daily_stats.total_recovered / daily_stats.total_cases) * 100).toFixed(2)}%***`, inline: true },
                    { emote: '% Diseased', role: `***${((daily_stats.total_deaths / daily_stats.total_cases) * 100).toFixed(2)}%***`, inline: true },
                    { emote: 'Total serious cases', role: `***${daily_stats.total_serious_cases}***`, inline: true }
                ], null, null, true));
            } else {
                message.channel.send(
                    `**Could not find ${args[0]} country ("./help corona" for help).**`,
                    message.author).then(msg => { msg.delete({ timeout: 5000 }) });
                let locale = portal_guilds[message.guild.id].locale;
                lclz_mngr.portal[locale].error.voice(client);
                message.react('❌');
            }
        });

        res.on("error", function (error) {
            console.error(error);
        });
    });

    req.end();

    return {
        result: true, value: '**Make suer to always wait a bit for data as a response is on the way.**'
    };
}
