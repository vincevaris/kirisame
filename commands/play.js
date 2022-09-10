const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { joinVoiceChannel, entersState, VoiceConnectionStatus } = require('@discordjs/voice');
const { MusicSubscription } = require('../MusicSubscription.js');
const { fromYtSearch, fromUrl } = require('../track.js');
const { hhmmss } = require('../utils.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Add a track to the queue.')
	// Search term option
		.addStringOption(option => option
			.setName('term')
			.setDescription('Track to search for on YouTube or the direct link.')
			.setRequired(true)),

	async execute(interaction)
	{
		const client = interaction.client;
		let subscription = client.subscriptions.get(interaction.guildId);

		// If there's no subscription, or the subscription is in the wrong channel, create a new one
		if (!subscription || subscription.connection.joinConfig.channelId != interaction.member.voice.channelId)
		{
			const vc = interaction.member.voice.channel;

			if (!vc.permissionsFor(client.user).has('Connect'))
				return interaction.reply({ content: 'I don\'t have permission to join that voice channel.', ephemeral: true });

			subscription = new MusicSubscription(
				joinVoiceChannel({
					channelId: vc.id,
					guildId: vc.guild.id,
					adapterCreator: vc.guild.voiceAdapterCreator,
				}),
			);
			subscription.connection.on('error', console.warn);
			client.subscriptions.set(vc.guildId, subscription);
		}

		if (!subscription)
			return interaction.reply({ content: 'You have to join a voice channel to start a listening party.', ephemeral: true });

		try
		{
			await entersState(subscription.connection, VoiceConnectionStatus.Ready, 20e3);
		}
		catch (err)
		{
			console.warn(err);
			return interaction.reply({ content: 'I couldn\'t join that voice channel for some reason.', ephemeral: true });
		}

		try
		{
			let track;
			const term = interaction.options.get('term').value;

			// If the term isn't a URL, search YouTube to find one
			if (!term.includes('http'))
				track = await fromYtSearch(term);
			// Otherwise use the term as a URL
			else
				track = await fromUrl(term);

			subscription.enqueue(track);

			const embed = new EmbedBuilder()
				.setColor('#77b255')
				.setAuthor({ name: 'Added to Queue' })
				.setDescription(track.title)
				.setFooter({ text: `Artist: ${track.artist} · Duration: ${hhmmss(track.duration)} · Position: ${subscription.queue.length}` });

			return interaction.reply({ embeds: [embed] });
		}
		catch (err)
		{
			console.warn(err);
			return interaction.reply({ content: 'I can\'t play that track for some reason.', ephemeral: true });
		}
	},
};