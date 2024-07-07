import { Colors, EmbedBuilder, Message, PartialMessage, TextChannel } from "discord.js";
import Logger from "../lib/logger";

const logger = new Logger();

/**
 * Fetches a partial message if necessary.
 * @param message - The message to check and potentially fetch.
 * @returns The full message if it was partial, otherwise the original message.
 */
async function fetchMessageIfPartial(message: Message | PartialMessage): Promise<Message> {
    if (message.partial) {
        return await message.fetch();
    }
    return message;
}

/**
 * Retrieves the log channel from the client's channel cache.
 * @param client - The Discord client.
 * @returns The TextChannel object if found, otherwise null.
 */
function getLogChannel(client: any): TextChannel | null {
    const logChannelId = process.env.DELETED_MESSAGE_LOG_CHANNEL || '';
    if (!logChannelId) {
        logger.error('DELETED_MESSAGE_LOG_CHANNEL is not defined.');
        return null;
    }
    const channel = client.channels.cache.get(logChannelId) as TextChannel;
    if (!channel) {
        logger.error('Channel not found.');
        return null;
    }
    return channel;
}

/**
 * Handles the deletion of a message and sends a log to the specified log channel.
 * @param message - The message that was deleted.
 */
async function handle(message: Message | PartialMessage): Promise<void> {
    const fullMessage = await fetchMessageIfPartial(message);
    if (fullMessage.author.bot) return;

    const logChannel = getLogChannel(fullMessage.client);
    if (!logChannel) return;

    logChannel.send({
        embeds: [
            new EmbedBuilder()
                .setTitle('🔔 메시지 삭제 로그')
                .setDescription('메시지가 삭제되었습니다.')
                .addFields([
                    { name: '채널', value: fullMessage.channel.toString() },
                    { name: '메시지', value: `\`\`\`${fullMessage.content || 'No content'}\`\`\`` }
                ])
                .setTimestamp(new Date())
                .setColor(Colors.Yellow)
        ]
    }).catch((error) => {
        logger.error(`Error sending log message: ${error}`);
    });
}

export default {
    handle
};