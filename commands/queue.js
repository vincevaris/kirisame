const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('queue')
		.setDescription('Displays the current queue of tracks.'),

	async execute(interaction)
	{
		const queue = interaction.client.queue;
		const output = [];

		queue.forEach((track, index) =>
		{
			output.push(`[**\`${index + 1}\`**] ${track.title}`);
		});

		const embed = new EmbedBuilder()
			.setColor('#dbb785')
			.setAuthor({ name: 'Current queue', iconURL: null, url: null })
			.setDescription(output.join('\n'));

		await interaction.reply({ embeds: [embed] });
	},
};