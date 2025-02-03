const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice');
const ytdl = require('ytdl-core');

const player = createAudioPlayer();

module.exports = {
    name: 'play',
    description: 'Play music in a voice channel',
    async execute(message) {
        const channel = message.member.voice.channel;
        if (!channel) return message.reply('❌ You need to join a voice channel first!');

        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: message.guild.id,
            adapterCreator: message.guild.voiceAdapterCreator
        });

        const stream = ytdl('https://www.youtube.com/watch?v=dQw4w9WgXcQ', { filter: 'audioonly' });
        const resource = createAudioResource(stream);
        player.play(resource);
        connection.subscribe(player);

        message.reply('🎶 Now playing: **Never Gonna Give You Up**');
    }
};
