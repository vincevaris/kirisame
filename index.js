const config = require('./config/config.json');
const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits, ActivityType } = require('discord.js');
const { createAudioPlayer, AudioPlayerStatus } = require('@discordjs/voice');
const playdl = require('play-dl');

// Set up play-dl authorizations
playdl.getFreeClientID().then((clientId) =>
{
	playdl.setToken(
		{
			soundcloud:
		{
			client_id: clientId,
		},
			spotify:
		{
			client_id: config.spotify.clientId,
			client_secret: config.spotify.clientSecret,
			refresh_token: config.spotify.refreshToken,
			market: config.spotify.market,
		},
		});
});

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] });

client.player = createAudioPlayer();
client.queue = [];

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles)
{
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	client.commands.set(command.data.name, command);
}

client.player.on(AudioPlayerStatus.Idle, async (oldState) =>
{
	if (oldState.status !== AudioPlayerStatus.Idle)
	{
		client.queue.shift();

		if (client.queue[0])
		{
			const track = client.queue[0];
			const resource = await track.resource();
			client.player.play(resource);
		}
	}
});

client.login(config.discord.token);

client.on('ready', async () =>
{
	client.user.setActivity({ name: 'Gensokyo Radio', type: ActivityType.Listening });

	console.log(`${client.user.tag} - ready in ${client.guilds.cache.size} guilds with ${client.users.cache.size} users.`);
});

client.on('disconnect', () => console.log('Client is disconnecting...'))
	.on('reconnecting', () => console.log('Client is reconnecting...'));

client.on('interactionCreate', async interaction =>
{
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) return;

	try
	{
		await command.execute(interaction);
	}
	catch (error)
	{
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});
