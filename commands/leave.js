module.exports = async (client, message, args, portal_guilds, portal_managed_guilds_path) => {
    say_voice.disconnect();
    return {
        result: true, value: '**Bye Bye**'
    };
}