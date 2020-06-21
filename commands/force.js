/* eslint-disable no-unused-vars */
module.exports = async (client, message, args, portal_guilds) => {
	return new Promise((resolve) => {
		return resolve ({ result: false, value: '*you can run "./help force" for help.*' });
	});
};
