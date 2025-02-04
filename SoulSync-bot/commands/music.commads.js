const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require("@discordjs/voice");
const ytdl = require("ytdl-core");

module.exports = {
    name: "play",
    description: "Plays a song from YouTube",
    async execute(message, args) {
        if (!message.member.voice.channel) {
            return message.reply("❌ You need to be in a voice channel to play music!");
        }

        if (!args.length) {
            return message.reply("❌ Please provide a YouTube URL or song name!");
        }

        const url = args[0];

        try {
            const stream = ytdl(url, { filter: "audioonly" });
            const connection = joinVoiceChannel({
                channelId: message.member.voice.channel.id,
                guildId: message.guild.id,
                adapterCreator: message.guild.voiceAdapterCreator,
            });

            const player = createAudioPlayer();
            const resource = createAudioResource(stream);

            player.play(resource);
            connection.subscribe(player);

            message.reply(`🎶 Now playing: ${url}`);
        } catch (error) {
            console.error(error);
            message.reply("❌ Error playing music. Make sure the link is correct!");
        }
    },
};
