module.exports = async (client, message, args, portal_guilds, portal_managed_guilds_path) => {
    const msg = await message.channel.send('Ping?');
    msg.edit(`Pong!\nLatency of rtt is ${msg.createdTimestamp - message.createdTimestamp}ms.\n` +
        `Latency to portal is ${client.ws.ping}ms`);
    return {
        result: true, value: '**Ping ran successfully.**'
    };
}