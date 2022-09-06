const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');
const { createAudioPlayer, AudioPlayerStatus } = require('@discordjs/voice');
const playdl = require('play-dl')

// Set up play-dl authorizations
playdl.getFreeClientID().then((clientId) =>
{
	playdl.setToken(
	{
		soundcloud: { client_id: clientId },
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

client.player.on(AudioPlayerStatus.Idle, async (oldState, newState) => {
	if (oldState.status !== AudioPlayerStatus.Idle) {
		client.queue.shift();

		if (client.queue[0])
		{
			const track = client.queue[0];
			const resource = await track.resource();
			client.player.play(resource);
		}
	}
});

// When the client is ready, run this code (only once)
client.once('ready', async () => {
	console.log('Ready!');	
});

// Respond to commands
client.on('interactionCreate', async interaction =>
{
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

// Login to Discord with your client's token
client.login(token);



