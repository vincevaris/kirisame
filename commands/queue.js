const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('queue')
		.setDescription('Display the current queue of tracks.'),

	async execute(interaction)
	{
		const client = interaction.client;
		const subscription = client.subscriptions.get(interaction.guildId);

		if (!subscription)
			return interaction.reply({ content: 'There\'s no listening party happening right now.', ephemeral: true });

		if (subscription.queue.length === 0)
			return interaction.reply({ content: 'The queue is currently empty.', ephemeral: true });

		const output = subscription.queue
			.slice(0, 5)
			.map((track, index) => `**\`${index + 1}\`** · ${track.title}`)
			.join('\n');

		const embed = new EmbedBuilder()
			.setColor('#3b88c3')
			.setAuthor({ name: 'Current Queue' })
			.setDescription(output);

		return interaction.reply({ embeds: [embed] });
	},
};