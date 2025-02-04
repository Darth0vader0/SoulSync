require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { Collection } = require('discord.js');
client.commands = new Collection();
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.once('ready', () => {
    console.log(`✅ Bot is online as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
    if (message.content === '!ping') {
        message.reply('Pong! 🏓');
    }
});


const playMusic = require('./commands/music');
client.commands.set(playMusic.name, playMusic);

client.on('messageCreate', async (message) => {
    if (message.content.startsWith('!play')) {
        client.commands.get('play').execute(message);
    }
});

client.login(process.env.DISCORD_TOKEN);

