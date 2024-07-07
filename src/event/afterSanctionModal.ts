import {
    Colors,
    EmbedBuilder,
    ModalSubmitInteraction,
    TextChannel,
    userMention,
    GuildMember,
    ColorResolvable
} from "discord.js";
import { client } from "../lib/bot";
import Logger from "../lib/logger";
import prisma from "../lib/prisma";
import { EmbedError } from "../lib/common/embed";

const logger = new Logger();

/**
 * Returns the name of the given sanction type.
 * @param type Sanction type (kick, ban, increaseWarn, decreaseWarn)
 * @returns Name of the sanction type
 */
function typeToName(type: string): string {
    switch (type) {
        case 'kick':
            return '서버 추방';
        case 'ban':
            return '서버 차단';
        case 'increaseWarn':
            return '경고 추가';
        case 'decreaseWarn':
            return '경고 차감';
        default:
            return '알 수 없음';
    }
}

/**
 * Utility function to create an embed.
 * @param title Title of the embed
 * @param color Color of the embed
 * @param description Description of the embed
 * @param fields Array of field objects
 * @returns EmbedBuilder instance
 */
function createEmbed(
    title: string,
    color: ColorResolvable,
    description?: string,
    fields?: { name: string; value: string }[]
): EmbedBuilder {
    const embed = new EmbedBuilder()
        .setTitle(title)
        .setColor(color)
        .setTimestamp();

    if (description) embed.setDescription(description);
    if (fields) embed.addFields(fields);

    return embed;
}

/**
/**
 * Sends a log to the specified channel.
 * @param channelId Log channel ID
 * @param embed EmbedBuilder to send
 */
async function sendLog(channelId: string, embed: EmbedBuilder): Promise<void> {
    const logChannel = client.channels.cache.get(channelId) as TextChannel;
    if (logChannel) {
        await logChannel.send({ embeds: [embed] });
    } else {
        logger.error(`Log channel not found: ${channelId}`);
    }
}

/**
 * Increases a user's warning count.
 * @param targetId Target user ID
 * @param reason Reason for the warning
 */
async function increaseWarning(targetId: string, reason: string): Promise<void> {
    try {
        await prisma.userWarn.create({ data: { userId: targetId, reasons: reason } });
        logger.info(`Added a warning to ${targetId}`);
        await prisma.user.update({ where: { userId: targetId }, data: { warningsCount: { increment: 1 } } });
        logger.info(`Increased warning count of ${targetId}`);
    } catch (error) {
        logger.error(`Error adding a warning to ${targetId}: ${error}`);
        throw error;
    }
}

/**
 * Decreases a user's warning count.
 * @param targetId Target user ID
 */
async function decreaseWarning(targetId: string): Promise<void> {
    try {
        await prisma.user.update({ where: { userId: targetId }, data: { warningsCount: { decrement: 1 } } });
        logger.info(`Decreased a warning from ${targetId}`);
    } catch (error) {
        logger.error(`Error decreasing a warning from ${targetId}: ${error}`);
        throw error;
    }
}

/**
 * Kicks a member from the server.
 * @param member Target member
 * @param reason Reason for the kick
 */
async function kickMember(member: GuildMember, reason: string): Promise<void> {
    await member.kick(reason);
    logger.info(`Kicked ${member.user.tag} from the server`);
}

/**
 * Bans a member from the server.
 * @param member Target member
 * @param reason Reason for the ban
 */
async function banMember(member: GuildMember, reason: string): Promise<void> {
    await member.ban({ reason });
    logger.info(`Banned ${member.user.tag} from the server`);
}

/**
 * Handles the sanction based on the interaction.
 * @param interaction ModalSubmitInteraction object
 */
export default async function handleSanctions(interaction: ModalSubmitInteraction): Promise<void> {
    const reason: string = interaction.fields.getTextInputValue("input-reason");
    const [type, channelId, targetId] = interaction.customId.split('-');
    const targetUser = await client.users.fetch(targetId);

    const embed = createEmbed(
        "🚨 제재 적용",
        Colors.Red,
        undefined,
        [
            { name: "유형", value: typeToName(type) },
            { name: "대상", value: `${targetUser.tag} (${targetId})` },
            { name: "사유", value: reason }
        ]
    ).setThumbnail(targetUser.displayAvatarURL());

    const guild = client.guilds.cache.get(interaction.guildId || '');
    if (!guild) {
        logger.error(`Guild not found: ${interaction.guildId}`);
        return;
    }

    const member = guild.members.cache.get(targetId);
    if (!member) {
        logger.error(`Member not found: ${targetId}`);
        return;
    }

    try {
        switch (type) {
            case 'kick':
                await kickMember(member, reason);
                interaction.reply({
                    embeds: [createEmbed("🚨 서버 추방", Colors.Red, `${userMention(targetId)} 님을 서버에서 추방했습니다.`)],
                    ephemeral: true
                });
                break;
            case 'ban':
                await banMember(member, reason);
                interaction.reply({
                    embeds: [createEmbed("🚨 서버 차단", Colors.Red, `${userMention(targetId)} 님을 서버에서 차단했습니다.`)],
                    ephemeral: true
                });
                break;
            case 'increaseWarn':
                await increaseWarning(targetId, reason);
                interaction.reply({
                    embeds: [
                        createEmbed(
                            "🚨 경고 추가",
                            Colors.Red,
                            `${userMention(targetId)} 님에게 1회 경고를 추가했습니다.\n경고가 5회 이상일 경우 서버에서 추방될 수 있습니다.`
                        )
                    ],
                    ephemeral: true
                });
                break;
            case 'decreaseWarn':
                await decreaseWarning(targetId);
                interaction.reply({
                    embeds: [createEmbed("✅ 경고 차감", Colors.Green, `${userMention(targetId)} 님의 경고를 1회 차감했습니다.`)],
                    ephemeral: true
                });
                break;
            default:
                logger.error(`Unknown sanction type: ${type}`);
                return;
        }

        // Send a log to the log channel
        await sendLog(channelId, embed);
    } catch (error) {
        logger.error(`Error handling sanction (${type}): ${error}`);
        interaction.reply({ embeds: [EmbedError('제재 처리 중 오류가 발생했습니다.')] });
    }
}