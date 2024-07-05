import 'dotenv/config';
import { Client } from 'discord.js';

import Logger from "./lib/logger";

const logger = new Logger();

const client = new Client({
    intents: ['GuildBans', 'Guilds', "GuildMessages", 'GuildMembers', 'MessageContent']
});

client.on('ready', () => {
    if(!client.user) return console.log('No user');
    logger.info(`Logged in as ${client.user.tag}!`);
});

client.login(process.env.DISCORD_TOKEN);