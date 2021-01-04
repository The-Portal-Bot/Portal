module.exports = async (
	args: { id: string }
) => {
	return {
		result: true,
		value: `Shard with ID ${args.id} reconnected.`
	};
};