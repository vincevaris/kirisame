const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { hhmmss } = require('../utils.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('skip')
		.setDescription('Skip the current track.'),

	async execute(interaction)
	{
		const client = interaction.client;
		const subscription = client.subscriptions.get(interaction.guildId);

		if (!subscription)
			return interaction.reply({ content: 'There\'s no listening party happening right now.', ephemeral: true });

		const queue = subscription.queue;

		if (queue.length === 0)
			return interaction.reply({ content: 'There\'s nothing playing right now.', ephemeral: true });

		subscription.player.stop();

		const embed = new EmbedBuilder()
			.setColor('#dd2e44');

		if (queue.length === 1)
		{
			embed
				.setAuthor({ name: 'Skipped to End of Queue' })
				.setDescription('The queue is now empty.');
		}

		else if (queue.length >= 2)
		{
			const track = queue[1];

			if (queue.length === 2)
				embed
					.setAuthor({ name: 'Skipped to Last Track' });
			else
				embed
					.setAuthor({ name: 'Skipped to Next Track' });

			embed
				.setDescription(track.title)
				.setFooter({ text: `Artist: ${track.artist} · Duration: ${hhmmss(track.duration)}` });
		}

		return interaction.reply({ embeds: [embed] });
	},
};