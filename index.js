const config = require('./config/config.json');
const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
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

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles)
{
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	client.on(event.name, (...args) => event.execute(...args));
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

client.on('disconnect', () => console.log('Client is disconnecting...'))
	.on('reconnecting', () => console.log('Client is reconnecting...'));