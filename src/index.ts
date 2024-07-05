import 'dotenv/config';
import { Client, IntentsBitField, Routes } from 'discord.js';
import Logger from "./lib/logger";
import { client, rest } from './lib/bot';
import ping from './commands/ping';
import kick from './context/kick';
import ban from './context/ban';
import decreaseWarn from './context/decreaseWarn';
import increaseWarn from './context/increaseWarn';
import handleSanctions from './event/sanctions';

const logger = new Logger();

client.on('ready', async () => {
    if(!client.user) return;

    logger.info(`Register commands...`);

    const botID = process.env.BOT_ID;
    if (!botID) return logger.error('BOT_TOKEN is not defined.');

    await rest.put(Routes.applicationCommands(botID), {
        body: [
            // Slash Command
            ping.info.toJSON(),
            // Context Menu
            kick.info.toJSON(),
            ban.info.toJSON(),
            decreaseWarn.info.toJSON(),
            increaseWarn.info.toJSON()
        ]
    });

    logger.info(`Commands were registered successfully!`);
    logger.info(`Logged in as ${client.user.tag}!`);
});

client.on('interactionCreate', async interaction => {
    if(interaction.isChatInputCommand()) {
        switch (interaction.commandName) {
            case 'ping': ping.handler(interaction); break;
        }
    }

    if(interaction.isContextMenuCommand()) {
        switch (interaction.commandName) {
            case '서버 추방': kick.handler(interaction.targetId, interaction); break;
            case '서버 차단': ban.handler(interaction.targetId, interaction); break;
            case '경고 추가': increaseWarn.handler(interaction.targetId, interaction); break;
            case '경고 차감': decreaseWarn.handler(interaction.targetId, interaction); break;
        }
    }

    if(interaction.isModalSubmit()) {
        if(interaction.customId.startsWith('kick')) handleSanctions(interaction);
        if(interaction.customId.startsWith('ban')) handleSanctions(interaction);
        if(interaction.customId.startsWith('increaseWarn')) handleSanctions(interaction);
        if(interaction.customId.startsWith('decreaseWarn')) handleSanctions(interaction);
    }
})


;(async () => {
    try {
        await client.login(process.env.BOT_TOKEN);
    } catch (error) {
        logger.error(error);
    }
})();