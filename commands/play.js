const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { joinVoiceChannel, getVoiceConnection } = require('@discordjs/voice');
const { Track, searchYt, fromUrl } = require('../track.js');

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
        const term = interaction.options.get('term').value;

        // If the term isn't a URL, search YouTube to find one
        if (!term.includes('http')) url = await searchYt(term);
        // Otherwise use the term as a URL
        else url = term;

        const track = await fromUrl(url);

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

            const embed = new EmbedBuilder()
                .setColor('#dbb785')
                .setAuthor({ name: 'Added to queue' })
                .setDescription(track.title)
                .setFooter({ name: 'Position: ' + interaction.client.queue.length });

            await interaction.reply({ embeds: [embed] });
        }
        catch (error)
        {
            console.warn(error);
            await interaction.reply('Failed to play track, please try again later!');
        }
	},
};