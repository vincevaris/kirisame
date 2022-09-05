const ytdl = require('ytdl-core');
const { createAudioResource } = require('@discordjs/voice');
const yts = require('youtube-search-without-api-key');

class Track
{
    constructor(url, title)
    {
        this.url = url;
        this.title = title;
    }

    async resource()
    {
        const stream = ytdl(this.url, { filter: 'audioonly' });
        console.log(this.url);
        return createAudioResource(stream);
    }
}

const fromUrl = async function(url)
{
    const info = await ytdl.getBasicInfo(url);
    const title = info.videoDetails.title;
    return new Track(url, title);
}

const searchYt = async function(term)
{
    const data = await yts.search(term);

    const videoId = data[0].id.videoId;

    return `http://www.youtube.com/watch?v=${videoId}`;
}

module.exports = { Track, fromUrl, searchYt };