const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('clear')
		.setDescription('Removes all tracks in the current queue.'),

	async execute(interaction)
	{
		const client = interaction.client;
		const subscription = client.subscriptions.get(interaction.guildId);

		if (!subscription)
			return interaction.reply({ content: 'There\'s no listening party happening right now.', ephemeral: true });

		if (subscription.queue.length === 0)
			return interaction.reply({ content: 'The queue is currently empty.', ephemeral: true });

		subscription.player.stop();
		subscription.queue = [];

		const embed = new EmbedBuilder()
			.setColor('#dd2e46')
			.setAuthor({ name: 'Cleared Queue' })
			.setDescription('The queue is now empty.');

		return interaction.reply({ embeds: [embed] });
	},
};