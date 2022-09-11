const { ActivityType } = require('discord.js');

module.exports = {
	name: 'ready',
	execute(client)
	{
		client.user.setActivity({ name: 'Gensokyo Radio', type: ActivityType.Listening });

		console.log(`${client.user.tag} - ready in ${client.guilds.cache.size} guilds with ${client.users.cache.size} users.`);

		setInterval(() =>
		{
			for (const [id, subscription] of client.subscriptions) if (subscription.isExpired())
			{
				console.log('this subscription is expired, bye bye!');
				subscription.connection.destroy();
				client.subscriptions.delete(id);
			}
		}, 30_000);
	},
};