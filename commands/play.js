const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { joinVoiceChannel, getVoiceConnection } = require('@discordjs/voice');
const { fromYtSearch, fromUrl } = require('../track.js');

module.exports = {
	data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Add a track to the queue.')
        // Search term option
        .addStringOption(option => option
            .setName('term')
			.setDescription('Track to search for on YouTube or the direct link.')
			.setRequired(true)),

	async execute(interaction) {
        let track;
        const term = interaction.options.get('term').value;

        // If the term isn't a URL, search YouTube to find one
        if (!term.includes('http'))
            track = await fromYtSearch(term);
        // Otherwise use the term as a URL
        else
            track = await fromUrl(term);

        try
        {
            const player = interaction.client.player;
            const sender = interaction.member;
            const senderVc = sender.voice.channel;

            let connection = getVoiceConnection(interaction.guildId);

            if (!connection || connection.joinConfig.channelId != senderVc.id)
            {
                connection = joinVoiceChannel({
                    channelId: senderVc.id,
		            guildId: senderVc.guildId,
		            adapterCreator: senderVc.guild.voiceAdapterCreator
                });
                connection.subscribe(player);
            }

            interaction.client.queue.push(track);

            if (interaction.client.queue[0] === track)
            {
                const resource = await track.resource();
			    interaction.client.player.play(resource);
            }

            const date = new Date(0);
            date.setSeconds(track.duration);
            const duration = date.toISOString().substring(11, 19);

            const embed = new EmbedBuilder()
                .setColor('#dbb785')
                .setAuthor({ name: 'Added to queue' })
                .setDescription(track.title)
                .setFooter({ text: `Position: ${interaction.client.queue.length} · Duration: ${duration}` });

            await interaction.reply({ embeds: [embed] });
        }
        catch (error)
        {
            console.warn(error);
            await interaction.reply('Failed to play track, please try again later!');
        }
	},
};