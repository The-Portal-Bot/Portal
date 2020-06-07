module.exports = async (args) => {
    return {
        result: true, value: `Shard with ID ${args.id} reconnected.`
    };
}