const Roll = require('roll');

module.exports = async (client, message, args, portal_guilds, portal_managed_guilds_path) => {
	return new Promise((resolve) => {
		if (args.length === 1) {
			const roll_lib = new Roll();
			const roll = roll_lib.roll(args[0]);

			return resolve({
				result: true,
				value: `${roll.result} (${roll.rolled})`
			});
		} else {
			return resolve({ result: false, value: '*you can run "./help roll" for help.*' });
		}
	});
};
