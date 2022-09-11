const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('stop')
		.setDescription('Stop the listening party.'),

	async execute(interaction)
	{
		const client = interaction.client;
		const subscription = client.subscriptions.get(interaction.guildId);

		if (!subscription)
			return interaction.reply({ content: 'There\'s no listening party happening right now.', ephemeral: true });

		subscription.connection.destroy();
		client.subscriptions.delete(interaction.guildId);

		const embed = new EmbedBuilder()
			.setColor('#dd2e46')
			.setAuthor({ name: 'Stopped Listening Party' })
			.setDescription(`${subscription.totalTracks} track(s) were queued. Thanks for listening!`);

		return interaction.reply({ embeds: [embed] });
	},
};