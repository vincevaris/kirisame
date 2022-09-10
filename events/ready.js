const { ActivityType } = require('discord.js');

module.exports = {
	name: 'ready',
	execute(client)
	{
		client.user.setActivity({ name: 'Gensokyo Radio', type: ActivityType.Listening });

		console.log(`${client.user.tag} - ready in ${client.guilds.cache.size} guilds with ${client.users.cache.size} users.`);
	},
};