import 'dotenv/config';
import { ChatInputCommandInteraction, Client, ContextMenuCommandInteraction, IntentsBitField, ModalSubmitInteraction, Routes } from 'discord.js';
import Logger from "./lib/logger";
import { client, rest } from './lib/bot';
import ping from './commands/ping';
import kick from './context/kick';
import ban from './context/ban';
import decreaseWarn from './context/decreaseWarn';
import increaseWarn from './context/increaseWarn';
import handleSanctions from './event/afterSanctionModal';
import deleteMessage from './commands/manage/deleteMessage';
import { ModalHandlerListType } from './types/interactionEvent';
import pushModal from './commands/manage/pushModal';
import chatXpIncrement from './event/chatXpIncrement';

// Logger instance 생성
const logger = new Logger();

/**
 * Register all commands and context menus with Discord API
 */
async function registerCommands() {
    if (!client.user) return;

    logger.info(`Registering commands...`);

    const botID = process.env.BOT_ID;
    if (!botID) {
        return logger.error('BOT_ID is not defined.');
    }

    try {
        await rest.put(Routes.applicationCommands(botID), {
            body: [
                // Slash Command
                ping.info.toJSON(),
                deleteMessage.info.toJSON(),
                pushModal.info.toJSON(),
                // Context Menu
                kick.info.toJSON(),
                ban.info.toJSON(),
                decreaseWarn.info.toJSON(),
                increaseWarn.info.toJSON()
            ]
        });

        logger.info(`Commands were registered successfully!`);
    } catch (error) {
        logger.error(`Failed to register commands: ${error}`);
    }

    logger.info(`Logged in as ${client.user.tag}!`);
}

client.on('ready', registerCommands);

/**
 * interactionCreate 이벤트 핸들러
 */
client.on('interactionCreate', async (interaction) => {
    if (interaction.isChatInputCommand()) {
        handleChatInputCommand(interaction);
    } else if (interaction.isContextMenuCommand()) {
        handleContextMenuCommand(interaction);
    } else if (interaction.isModalSubmit()) {
        handleModalSubmit(interaction);
    }
});

/**
 * MessageCreate 이벤트 핸들러
 */
client.on('messageCreate', async (message) => {
    chatXpIncrement.handle(message);
})

/**
 * 채팅 입력 명령어 처리 함수
 * @param {Interaction} interaction - Discord 상호작용 객체
 */
const handleChatInputCommand = (interaction: ChatInputCommandInteraction) => {
    switch (interaction.commandName) {
        case 'ping':
            ping.handler(interaction);
            break;
        case '청소':
            deleteMessage.handle(interaction);
            break;
        case '모달세팅':
            pushModal.handle(interaction);
            break;
    }
};

/**
 * 컨텍스트 메뉴 명령어 처리 함수
 * @param {Interaction} interaction - Discord 상호작용 객체
 */
const handleContextMenuCommand = (interaction: ContextMenuCommandInteraction) => {
    switch (interaction.commandName) {
        case '서버 추방':
            kick.handler(interaction.targetId, interaction);
            break;
        case '서버 차단':
            ban.handler(interaction.targetId, interaction);
            break;
        case '경고 추가':
            increaseWarn.handler(interaction.targetId, interaction);
            break;
        case '경고 차감':
            decreaseWarn.handler(interaction.targetId, interaction);
            break;
    }
};

/**
 * 모달 제출 처리 함수
 * @param {Interaction} interaction - Discord 상호작용 객체
 */
const handleModalSubmit = (interaction: ModalSubmitInteraction) => {
    const handlers: ModalHandlerListType = {
        kick: handleSanctions,
        ban: handleSanctions,
        increaseWarn: handleSanctions,
        decreaseWarn: handleSanctions,
    };

    for (const key in handlers) {
        if (interaction.customId.startsWith(key)) {
            handlers[key](interaction);
        }
    }
};

;(async () => {
    try {
        await client.login(process.env.BOT_TOKEN);
    } catch (error) {
        logger.error(`Login failed: ${error}`);
    }
})();