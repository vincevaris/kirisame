const { AudioPlayerStatus } = require('@discordjs/voice');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { hhmmss } = require('../utils.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('pause')
		.setDescription('Pause the current track.'),

	async execute(interaction)
	{
		const client = interaction.client;
		const subscription = client.subscriptions.get(interaction.guildId);

		if (!subscription)
			return interaction.reply({ content: 'There\'s no listening party happening right now.', ephemeral: true });

		if (subscription.queue.length === 0)
			return interaction.reply({ content: 'There\'s nothing playing right now.', ephemeral: true });

		const track = subscription.queue[0];
		const embed = new EmbedBuilder()
			.setDescription(track.title)
			.setFooter({ text: `Artist: ${track.artist} · Duration: ${hhmmss(track.duration)}` });

		if (subscription.player.state.status !== AudioPlayerStatus.Paused)
		{
			subscription.player.pause();
			embed
				.setColor('#ffcc4d')
				.setAuthor({ name: 'Paused' });
		}
		else
		{
			subscription.player.unpause();
			embed
				.setColor('#77b255')
				.setAuthor({ name: 'Unpaused' });
		}

		return interaction.reply({ embeds: [embed] });
	},
};