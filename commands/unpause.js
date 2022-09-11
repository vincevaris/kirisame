const { AudioPlayerStatus } = require('@discordjs/voice');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { hhmmss } = require('../utils.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('unpause')
		.setDescription('Unpause the current track.'),

	async execute(interaction)
	{
		const client = interaction.client;
		const subscription = client.subscriptions.get(interaction.guildId);

		if (!subscription)
			return interaction.reply({ content: 'There\'s no listening party happening right now.', ephemeral: true });

		if (subscription.queue.length === 0)
			return interaction.reply({ content: 'There\'s nothing playing right now.', ephemeral: true });

		if (subscription.player.state.status !== AudioPlayerStatus.Paused)
			return interaction.reply({ content: 'The current track is already unpaused.' });

		subscription.player.unpause();

		const track = subscription.queue[0];
		const embed = new EmbedBuilder()
			.setColor('#77b255')
			.setAuthor({ name: 'Resumed' })
			.setDescription(track.title)
			.setFooter({ text: `Artist: ${track.artist} · Duration: ${hhmmss(track.duration)}` });

		return interaction.reply({ embeds: [embed] });
	},
};