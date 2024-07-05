import 'dotenv/config';
import { Client } from 'discord.js';

const client = new Client({
    intents: ['GuildBans', 'Guilds', "GuildMessages", 'GuildMembers', 'MessageContent']
});

client.on('ready', () => {
    if(!client.user) return console.log('No user');
    console.log(`Logged in as ${client.user.tag}!`);
});

client.login(process.env.DISCORD_TOKEN);