module.exports = async (id: string) => {
	return {
		result: true,
		value: `Shard with ID ${id} reconnected.`
	};
};