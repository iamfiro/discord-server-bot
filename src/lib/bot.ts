import { Client, GatewayIntentBits, REST } from 'discord.js';
import 'dotenv/config';

export const client = new Client({
    intents: [
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
    ]
});

export const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN || '')