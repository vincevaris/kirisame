const { VoiceConnectionStatus, VoiceConnectionDisconnectReason, entersState, createAudioPlayer, AudioPlayerStatus } = require('@discordjs/voice');

function wait(ms)
{
	return new Promise(resolve => setTimeout(resolve, ms));
}

class MusicSubscription
{
	constructor(connection)
	{
		this.connection = connection;
		this.player = createAudioPlayer();
		this.queue = [];
		this.totalTracks = 0;

		this.connection.on('stateChange', async (_, state) =>
		{
			if (state.status === VoiceConnectionStatus.Disconnected)
			{
				if (state.reason === VoiceConnectionDisconnectReason.WebSocketClose && state.closeCode === 4014)
				{
					try
					{
						await entersState(this.connection, VoiceConnectionStatus.Connecting, 5_000);
					}
					catch
					{
						this.connection.destroy();
					}
				}
				else if (this.connection.rejoinAttempts < 5)
				{
					await wait((this.connection.rejoinAttempts + 1) * 5_000);
					this.connection.rejoin();
				}
				else
				{
					this.connection.destroy();
				}
			}
			else if (state.status === VoiceConnectionStatus.Destroyed)
			{
				this.stop();
			}
			else if (
				!this.readyLock &&
				(state.status === VoiceConnectionStatus.Connecting || state.status === VoiceConnectionStatus.Signalling)
			)
			{
				this.readyLock = true;
				try
				{
					await entersState(this.connection, VoiceConnectionStatus.Ready, 20_000);
				}
				catch
				{
					if (this.connection.state.status !== VoiceConnectionStatus.Destroyed) this.connection.destroy();
				}
				finally
				{
					this.readyLock = false;
				}
			}
		});

		this.player.on('stateChange', (oldState, newState) =>
		{
			if (newState.status === AudioPlayerStatus.Idle && oldState.status !== AudioPlayerStatus.Idle)
			{
				this.queue.shift();
				this.processQueue();
			}
		});

		connection.subscribe(this.player);
	}

	enqueue(track)
	{
		this.totalTracks++;
		this.queue.push(track);
		this.processQueue();
	}

	stop()
	{
		this.queueLock = true;
		this.queue = [];
		this.player.stop(true);
	}

	async processQueue()
	{
		if (this.queueLock || this.player.state.status !== AudioPlayerStatus.Idle || this.queue.length === 0)
			return;

		this.queueLock = true;

		const track = this.queue[0];
		try
		{
			const resource = await track.createResource();
			this.player.play(resource);
			this.queueLock = false;
		}
		catch (err)
		{
			this.queueLock = false;
			this.processQueue();
		}
	}
}

module.exports = { MusicSubscription };